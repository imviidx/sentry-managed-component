import type { Event, EventHint } from '@sentry/react';
import {
  getZaraz,
  isSentryManagedComponentEnabled,
  ZARAZ_FUNCTIONAL_PURPOSE_ID,
  ZARAZ_ANALYTICS_PURPOSE_ID,
  ZARAZ_MARKETING_PURPOSE_ID,
  ZARAZ_PREFERENCES_PURPOSE_ID,
  type PurposeMapping,
} from './lib/zaraz';
import { logSentryEvent } from './lib/eventLogger';

// Re-export the PurposeMapping type for convenience
export type { PurposeMapping };

export interface SentryZarazIntegrationOptions {
  /**
   * How long to wait for Zaraz consent before timing out (in milliseconds)
   * @default 10000 (10 seconds)
   */
  timeout?: number;

  /**
   * Whether to log debug information to console
   * @default false
   */
  debug?: boolean;

  /**
   * Custom purpose mapping for Zaraz consent purposes
   * @default Uses default Zaraz purpose IDs
   */
  purposeMapping?: PurposeMapping;
}

class SentryZarazIntegrationClass {
  public static id = 'SentryZarazIntegration';
  public name = SentryZarazIntegrationClass.id;

  private options: Required<SentryZarazIntegrationOptions>;
  private isConsentReady = false;
  private hasConsent = false;
  private eventQueue: Array<{ event: Event; hint?: EventHint }> = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private consentCheckInterval: NodeJS.Timeout | null = null;

  constructor(options: SentryZarazIntegrationOptions = {}) {
    this.options = {
      timeout: 10000,
      debug: false,
      purposeMapping: {
        functional: ZARAZ_FUNCTIONAL_PURPOSE_ID,
        analytics: ZARAZ_ANALYTICS_PURPOSE_ID,
        marketing: ZARAZ_MARKETING_PURPOSE_ID,
        preferences: ZARAZ_PREFERENCES_PURPOSE_ID,
      },
      ...options,
    };
  }

  public setupOnce(): void {
    this.log('Setting up Sentry Zaraz Integration');

    // Start monitoring for consent
    this.initializeConsentMonitoring();

    // Since we can't add global event processors in setupOnce for newer Sentry,
    // we'll use the processEvent method which is called automatically
  }

  public processEvent(
    event: Event,
    hint: EventHint,
    _client?: any
  ): Event | null | PromiseLike<Event | null> {
    // If consent is ready and we have consent, allow the event
    if (this.isConsentReady && this.hasConsent) {
      this.log('Event allowed - consent granted');
      logSentryEvent('Sentry event allowed', {
        eventType: event.type,
        eventId: event.event_id,
        level: event.level,
      });
      // Ensure logentry.params is string[] if present
      if (event.logentry && event.logentry.params) {
        event.logentry.params = Array.isArray(event.logentry.params)
          ? event.logentry.params.map((p) => String(p))
          : undefined;
      }
      return event;
    }

    // If consent is ready but we don't have consent, block the event
    if (this.isConsentReady && !this.hasConsent) {
      this.log('Event blocked - consent not granted');
      logSentryEvent('Zaraz Sentry Integration blocks event', {
        reason: 'No functional consent',
        eventType: event.type,
        eventId: event.event_id,
        level: event.level,
      });
      return null;
    }

    // If consent is not ready yet, queue the event and block it for now
    this.log('Event queued - waiting for consent');
    logSentryEvent('Sentry event queued', {
      reason: 'Waiting for consent decision',
      eventType: event.type,
      eventId: event.event_id,
      queueSize: this.eventQueue.length + 1,
    });
    this.eventQueue.push({ event, hint });
    return null; // Block the event for now, we'll resend it later if consent is granted
  }

  private initializeConsentMonitoring(): void {
    this.log('Initializing consent monitoring');

    // Check if Zaraz is already available
    const zaraz = getZaraz();
    if (zaraz?.consent?.APIReady) {
      this.log('Zaraz consent API is ready');
      this.checkConsent();
    } else {
      this.log('Zaraz consent API not ready, polling...');
      // Poll for Zaraz availability
      this.consentCheckInterval = setInterval(() => {
        const currentZaraz = getZaraz();
        if (currentZaraz?.consent?.APIReady) {
          this.log('Zaraz consent API became ready');
          this.checkConsent();
          if (this.consentCheckInterval) {
            clearInterval(this.consentCheckInterval);
            this.consentCheckInterval = null;
          }
        }
      }, 100);
    }

    // Set timeout to proceed without consent after specified time
    this.timeoutId = setTimeout(() => {
      this.log('Consent timeout reached, proceeding without consent');
      this.handleConsentTimeout();
    }, this.options.timeout);
  }

  private checkConsent(): void {
    const hasConsent = isSentryManagedComponentEnabled(
      this.options.purposeMapping
    );
    this.log(`Consent check result: ${hasConsent}`);

    this.isConsentReady = true;
    this.hasConsent = hasConsent;

    if (hasConsent) {
      this.log('Consent granted, processing queued events');
      logSentryEvent('Consent granted', {
        queuedEvents: this.eventQueue.length,
      });
      this.processQueuedEvents();
    } else {
      this.log('Consent not granted, clearing event queue');
      logSentryEvent('Consent denied', {
        discardedEvents: this.eventQueue.length,
      });
      this.clearEventQueue();
    }

    // Listen for consent changes
    this.listenForConsentChanges();

    // Clear timeout since we have a consent status
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private listenForConsentChanges(): void {
    const zaraz = getZaraz();
    if (!zaraz?.consent) return;

    // Poll for consent changes (Zaraz doesn't provide event listeners)
    const checkConsentChanges = () => {
      const currentConsent = isSentryManagedComponentEnabled(
        this.options.purposeMapping
      );
      if (currentConsent !== this.hasConsent) {
        this.log(
          `Consent changed from ${this.hasConsent} to ${currentConsent}`
        );
        logSentryEvent('Consent status changed', {
          from: this.hasConsent,
          to: currentConsent,
        });
        this.hasConsent = currentConsent;

        if (currentConsent) {
          this.log('Consent granted, processing any new queued events');
          this.processQueuedEvents();
        } else {
          this.log('Consent revoked, future events will be blocked');
        }
      }
    };

    // Check for changes every second
    setInterval(checkConsentChanges, 1000);
  }

  private handleConsentTimeout(): void {
    this.log('Handling consent timeout');
    this.isConsentReady = true;
    this.hasConsent = false; // Default to no consent on timeout
    this.clearEventQueue();
  }

  private log(message: string, ...args: any[]): void {
    if (this.options.debug) {
      console.log(`[SentryZarazIntegration] ${message}`, ...args);
    }
  }

  private processQueuedEvents(): void {
    this.log(`Processing ${this.eventQueue.length} queued events`);

    const queuedEvents = [...this.eventQueue];
    this.eventQueue = [];

    // Re-send queued events through Sentry
    queuedEvents.forEach(({ event, hint }) => {
      if (this.hasConsent) {
        this.log('Re-sending queued event:', event.event_id);

        // Re-capture the event through Sentry's APIs
        if (event.exception?.values?.[0]) {
          // For error events, re-throw the error
          const error = new Error(
            event.exception.values[0].value || 'Queued error'
          );
          error.stack = event.exception.values[0].stacktrace?.frames
            ?.map((f) => f.filename + ':' + f.lineno)
            .join('\n');

          // Import Sentry dynamically to avoid circular dependencies
          import('@sentry/react')
            .then((Sentry) => {
              Sentry.captureException(error);
            })
            .catch(() => {
              // Silently fail in production
            });
        } else if (event.message) {
          // For message events
          import('@sentry/react')
            .then((Sentry) => {
              Sentry.captureMessage(
                event.message || 'Queued message',
                event.level as any
              );
            })
            .catch(() => {
              // Silently fail in production
            });
        } else {
          // For other event types, try to use captureEvent if available
          import('@sentry/react')
            .then((Sentry) => {
              if ((Sentry as any).captureEvent) {
                (Sentry as any).captureEvent(event, hint);
              }
            })
            .catch(() => {
              // Silently fail in production
            });
        }
      } else {
        this.log('Discarding queued event due to no consent:', event.event_id);
      }
    });
  }

  private clearEventQueue(): void {
    this.log(`Clearing ${this.eventQueue.length} queued events`);
    this.eventQueue = [];
  }

  public cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.consentCheckInterval) {
      clearInterval(this.consentCheckInterval);
      this.consentCheckInterval = null;
    }

    this.clearEventQueue();
  }
}

/**
 * Creates a new Sentry Zaraz Integration instance for use in integrations array
 */
export function sentryZarazIntegration(
  options?: SentryZarazIntegrationOptions
) {
  const integration = new SentryZarazIntegrationClass(options);

  return {
    name: integration.name,
    setupOnce: () => integration.setupOnce(),
    processEvent: (event: Event, hint: EventHint, client?: any) =>
      integration.processEvent(event, hint, client),
    cleanup: () => integration.cleanup(),
  };
}
