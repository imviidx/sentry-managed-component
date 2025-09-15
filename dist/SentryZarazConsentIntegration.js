import { getZaraz, isFunctionalConsentGranted, getConsentStatus, } from './zaraz';
import { logEvent } from './eventLogger';
export { getZaraz, getConsentStatus, setConsent } from './zaraz';
class SentryZarazConsentIntegrationClass {
    constructor(options) {
        this.name = SentryZarazConsentIntegrationClass.id;
        this.isConsentReady = false;
        this.hasConsent = false;
        this.eventQueue = [];
        this.timeoutId = null;
        this.consentCheckInterval = null;
        this.currentConsentState = {};
        this.options = {
            timeout: 10000,
            debug: false,
            ...options,
        };
    }
    setupOnce() {
        this.log('Setting up Sentry Zaraz Consent Integration');
        // Start monitoring for consent
        this.initializeConsentMonitoring();
    }
    processEvent(event, hint) {
        // If consent is ready and we have consent, allow the event
        if (this.isConsentReady && this.hasConsent) {
            this.log('Event allowed - consent granted');
            logEvent('Sentry event allowed', {
                eventType: event.type,
                eventId: event.event_id,
                level: event.level,
            });
            return event;
        }
        // If consent is ready but we don't have consent, block the event
        if (this.isConsentReady && !this.hasConsent) {
            this.log('Event blocked - consent not granted');
            logEvent('Event blocked', {
                reason: 'No functional consent',
                eventType: event.type,
                eventId: event.event_id,
                level: event.level,
            });
            return null;
        }
        // If consent is not ready yet, queue the event and block it for now
        this.log('Event queued - waiting for consent');
        logEvent('Sentry event queued', {
            reason: 'Waiting for consent decision',
            eventType: event.type,
            eventId: event.event_id,
            queueSize: this.eventQueue.length + 1,
        });
        this.eventQueue.push({ event, hint });
        return null; // Block the event for now, we'll resend it later if consent is granted
    }
    initializeConsentMonitoring() {
        this.log('Initializing consent monitoring');
        // Check if Zaraz is already available
        const zaraz = getZaraz();
        if (zaraz?.consent?.APIReady) {
            this.log('Zaraz consent API is ready');
            this.checkConsent();
        }
        else {
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
    checkConsent() {
        const hasConsent = isFunctionalConsentGranted(this.options.purposeMapping);
        this.currentConsentState = getConsentStatus(this.options.purposeMapping);
        this.log(`Consent check result: ${hasConsent}`, this.currentConsentState);
        this.isConsentReady = true;
        this.hasConsent = hasConsent;
        if (hasConsent) {
            this.log('Consent granted, processing queued events');
            logEvent('Consent granted', {
                queuedEvents: this.eventQueue.length,
            });
            void this.processQueuedEvents(); // Fire and forget async call
        }
        else {
            this.log('Consent not granted, clearing event queue');
            logEvent('Consent denied', {
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
    listenForConsentChanges() {
        const zaraz = getZaraz();
        if (!zaraz?.consent)
            return;
        // Poll for consent changes (Zaraz doesn't provide event listeners)
        const checkConsentChanges = () => {
            const currentConsent = isFunctionalConsentGranted(this.options.purposeMapping);
            const newConsentState = getConsentStatus(this.options.purposeMapping);
            if (currentConsent !== this.hasConsent ||
                JSON.stringify(newConsentState) !==
                    JSON.stringify(this.currentConsentState)) {
                this.log(`Consent changed from ${this.hasConsent} to ${currentConsent}`);
                logEvent('Consent status changed', {
                    from: this.hasConsent,
                    to: currentConsent,
                    newState: newConsentState,
                });
                this.hasConsent = currentConsent;
                this.currentConsentState = newConsentState;
                if (currentConsent) {
                    this.log('Consent granted, processing any new queued events');
                    void this.processQueuedEvents(); // Fire and forget async call
                }
                else {
                    this.log('Consent revoked, future events will be blocked');
                }
            }
        };
        // Check for changes every second
        setInterval(checkConsentChanges, 1000);
    }
    handleConsentTimeout() {
        this.log('Handling consent timeout');
        this.isConsentReady = true;
        this.hasConsent = false; // Default to no consent on timeout
        this.clearEventQueue();
    }
    log(message, ...args) {
        if (this.options.debug) {
            console.log(`[SentryZarazConsentIntegration] ${message}`, ...args);
        }
    }
    async processQueuedEvents() {
        this.log(`Processing ${this.eventQueue.length} queued events`);
        const queuedEvents = [...this.eventQueue];
        this.eventQueue = [];
        // Re-send queued events through Sentry
        for (const { event, hint } of queuedEvents) {
            if (this.hasConsent) {
                this.log('Re-sending queued event:', event.event_id);
                try {
                    // Re-capture the event through Sentry's APIs
                    if (event.exception?.values?.[0]) {
                        // For error events, re-throw the error
                        const error = new Error(event.exception.values[0].value || 'Queued error');
                        error.stack = event.exception.values[0].stacktrace?.frames
                            ?.map((f) => `${f.filename || 'unknown'}:${f.lineno || 0}`)
                            .join('\n');
                        // Import Sentry dynamically to avoid circular dependencies
                        const Sentry = await import('@sentry/react');
                        Sentry.captureException(error);
                    }
                    else if (event.message) {
                        // For message events
                        const Sentry = await import('@sentry/react');
                        Sentry.captureMessage(event.message || 'Queued message', event.level);
                    }
                    else {
                        // For other event types, try to use captureEvent if available
                        const Sentry = await import('@sentry/react');
                        if (Sentry.captureEvent) {
                            Sentry.captureEvent(event, hint);
                        }
                    }
                }
                catch {
                    // Silently fail in production - Sentry not available
                }
            }
            else {
                this.log('Discarding queued event due to no consent:', event.event_id);
            }
        }
    }
    clearEventQueue() {
        this.log(`Clearing ${this.eventQueue.length} queued events`);
        this.eventQueue = [];
    }
    cleanup() {
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
SentryZarazConsentIntegrationClass.id = 'SentryZarazConsentIntegration';
/**
 * Creates a new Sentry Zaraz Consent Integration instance for use in integrations array
 */
export function sentryZarazConsentIntegration(options) {
    const integration = new SentryZarazConsentIntegrationClass(options);
    return {
        name: integration.name,
        setupOnce: () => integration.setupOnce(),
        processEvent: (event, hint) => integration.processEvent(event, hint),
    };
}
// Export the class for advanced use cases
export { SentryZarazConsentIntegrationClass };
//# sourceMappingURL=SentryZarazConsentIntegration.js.map