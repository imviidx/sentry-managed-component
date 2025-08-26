import type { Event, EventHint, Integration } from '@sentry/types';
import { getZaraz, isSentryManagedComponentEnabled } from './lib/zaraz';

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
}

export class SentryZarazIntegration implements Integration {
  public static id = 'SentryZarazIntegration';
  public name = SentryZarazIntegration.id;

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
      ...options,
    };
  }

  public setupOnce(
    addGlobalEventProcessor?: (
      callback: (event: Event, hint?: EventHint) => Event | null
    ) => void,
    getCurrentHub?: () => any
  ): void {
    this.log('Setting up Sentry Zaraz Integration');

    // Start monitoring for consent
    this.initializeConsentMonitoring();

    // Add global event processor to handle consent if the function is available
    if (addGlobalEventProcessor) {
      addGlobalEventProcessor((event: Event, hint?: EventHint) => {
        return this.processEvent(event, hint);
      });
    } else {
      // Fallback: try to access Sentry's global addGlobalEventProcessor
      setTimeout(() => {
        const Sentry = (window as any).Sentry || (globalThis as any).Sentry;
        if (Sentry && Sentry.addGlobalEventProcessor) {
          Sentry.addGlobalEventProcessor((event: Event, hint?: EventHint) => {
            return this.processEvent(event, hint);
          });
        }
      }, 100);
    }
  }

  private processEvent(event: Event, hint?: EventHint): Event | null {
    // If consent is ready and we have consent, allow the event
    if (this.isConsentReady && this.hasConsent) {
      this.log('Event allowed - consent granted');
      return event;
    }

    // If consent is ready but we don't have consent, block the event
    if (this.isConsentReady && !this.hasConsent) {
      this.log('Event blocked - consent not granted');
      return null;
    }

    // If consent is not ready yet, queue the event and block it for now
    this.log('Event queued - waiting for consent');
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
    const hasConsent = isSentryManagedComponentEnabled();
    this.log(`Consent check result: ${hasConsent}`);

    this.isConsentReady = true;
    this.hasConsent = hasConsent;

    if (hasConsent) {
      this.log('Consent granted, processing queued events');
      this.processQueuedEvents();
    } else {
      this.log('Consent not granted, clearing event queue');
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
      const currentConsent = isSentryManagedComponentEnabled();
      if (currentConsent !== this.hasConsent) {
        this.log(
          `Consent changed from ${this.hasConsent} to ${currentConsent}`
        );
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
              // Fallback: just log the error
              console.error('Failed to re-capture queued error:', error);
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
              console.log(
                'Failed to re-capture queued message:',
                event.message
              );
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
              console.log('Failed to re-capture queued event:', event);
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
): SentryZarazIntegration {
  return new SentryZarazIntegration(options);
}
