import { ZarazGlobal } from './types';
/**
 * Get the Zaraz global instance from the window object
 * @returns The Zaraz global instance or undefined if not available
 */
export declare const getZaraz: () => ZarazGlobal | undefined;
/**
 * Check if Zaraz is available and initialized
 * @returns True if Zaraz is available
 */
export declare const isZarazEnabled: () => boolean;
/**
 * Check if Zaraz Consent API is ready
 * @returns True if the consent API is ready
 */
export declare const isZarazConsentAPIReady: () => boolean;
/**
 * Get consent status for a specific purpose by ID
 * @param purposeId The purpose ID to check
 * @returns True if consent is granted, false if denied, undefined if purpose doesn't exist
 */
export declare const getConsentForPurpose: (purposeId: string) => boolean | undefined;
/**
 * Set consent for a specific purpose by ID
 * @param purposeId The purpose ID to set
 * @param granted Whether consent is granted
 */
export declare const setConsentForPurpose: (purposeId: string, granted: boolean) => void;
/**
 * Get all available purposes from Zaraz
 * @returns Object containing all configured purposes
 */
export declare const getAllPurposes: () => {
    [purposeId: string]: import("./types").Purpose;
};
/**
 * Show the consent modal
 */
export declare const showConsentModal: () => void;
/**
 * Hide the consent modal
 */
export declare const hideConsentModal: () => void;
/**
 * Accept all consent categories
 */
export declare const acceptAllConsent: () => void;
/**
 * Reject all non-essential consent categories
 */
export declare const rejectAllConsent: () => void;
/**
 * Send queued events after consent is granted
 */
export declare const sendQueuedEvents: () => void;
/**
 * Wait for Zaraz Consent API to become ready
 * @param timeout Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise that resolves when API is ready or rejects on timeout
 */
export declare const waitForConsentAPI: (timeout?: number) => Promise<void>;
/**
 * Listen for consent changes and call a callback
 * @param callback Function to call when consent changes
 * @returns Function to remove the event listener
 */
export declare const onConsentChange: (callback: (consent: any) => void) => (() => void);
