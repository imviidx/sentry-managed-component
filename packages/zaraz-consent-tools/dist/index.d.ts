export * from './types';
export * from './config';
export * from './storage';
export * from './modal';
export * from './fake-zaraz';
export * from './utils';
import './global';
import { FakeZaraz } from './fake-zaraz';
import { ZarazConfig } from './types';
/**
 * Initialize Zaraz Consent Tools with the given configuration
 * This sets up a fake Zaraz instance on the global window object
 * @param config Configuration options for the fake Zaraz instance
 * @returns The created FakeZaraz instance
 */
export declare function initializeZarazConsentTools(config?: Partial<ZarazConfig>): FakeZaraz;
/**
 * Get the current global Zaraz instance
 * @returns The current FakeZaraz instance or null if not initialized
 */
export declare function getZarazConsentTools(): FakeZaraz | null;
/**
 * Clean up the global Zaraz instance
 */
export declare function cleanupZarazConsentTools(): void;
/**
 * Quick setup function for common use cases
 * Creates a Zaraz instance with sensible defaults for local development
 */
export declare function quickSetup(options?: {
    autoShow?: boolean;
    enableLogging?: boolean;
    customPurposes?: any[];
}): FakeZaraz;
