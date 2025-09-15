import type { Event, EventHint, Integration as SentryIntegration } from '@sentry/types';
import { type PurposeMapping } from './zaraz';
export type { PurposeMapping };
export { getZaraz, getConsentStatus, setConsent } from './zaraz';
export interface Integration extends SentryIntegration {
    name: string;
    setupOnce?(): void;
    processEvent?(event: Event, hint: EventHint): Event | null | PromiseLike<Event | null>;
}
export interface SentryZarazConsentIntegrationOptions {
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
     * Purpose mapping for Zaraz consent purposes
     * This is required and must match your Zaraz configuration
     */
    purposeMapping: PurposeMapping;
}
export interface ConsentState {
    functional?: boolean;
    analytics?: boolean;
    marketing?: boolean;
    preferences?: boolean;
}
declare class SentryZarazConsentIntegrationClass implements Integration {
    static id: string;
    name: string;
    private options;
    private isConsentReady;
    private hasConsent;
    private eventQueue;
    private timeoutId;
    private consentCheckInterval;
    private currentConsentState;
    constructor(options: SentryZarazConsentIntegrationOptions);
    setupOnce(): void;
    processEvent(event: Event, hint: EventHint): Event | null | PromiseLike<Event | null>;
    private initializeConsentMonitoring;
    private checkConsent;
    private listenForConsentChanges;
    private handleConsentTimeout;
    private log;
    private processQueuedEvents;
    private clearEventQueue;
    cleanup(): void;
}
/**
 * Creates a new Sentry Zaraz Consent Integration instance for use in integrations array
 */
export declare function sentryZarazConsentIntegration(options: SentryZarazConsentIntegrationOptions): Integration;
export { SentryZarazConsentIntegrationClass };
//# sourceMappingURL=SentryZarazConsentIntegration.d.ts.map