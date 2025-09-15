export * from './types';
export * from './config';
export * from './storage';
export * from './modal';
export * from './fake-zaraz';
export * from './utils';
import './global';

import { FakeZaraz } from './fake-zaraz';
import { ZarazConfig } from './types';

// Global instance
let globalZarazInstance: FakeZaraz | null = null;

/**
 * Initialize Zaraz Consent Tools with the given configuration
 * This sets up a fake Zaraz instance on the global window object
 * @param config Configuration options for the fake Zaraz instance
 * @returns The created FakeZaraz instance
 */
export function initializeZarazConsentTools(
  config: Partial<ZarazConfig> = {}
): FakeZaraz {
  if (typeof window === 'undefined') {
    throw new Error(
      'Zaraz Consent Tools can only be used in a browser environment'
    );
  }

  // Clean up existing instance
  if (globalZarazInstance) {
    console.warn('[Zaraz Consent Tools] Replacing existing instance');
  }

  // Create new instance
  globalZarazInstance = new FakeZaraz(config);

  // Attach to window
  (window as any).zaraz = globalZarazInstance;

  console.log('[Zaraz Consent Tools] Initialized and attached to window.zaraz');

  return globalZarazInstance;
}

/**
 * Get the current global Zaraz instance
 * @returns The current FakeZaraz instance or null if not initialized
 */
export function getZarazConsentTools(): FakeZaraz | null {
  return globalZarazInstance;
}

/**
 * Clean up the global Zaraz instance
 */
export function cleanupZarazConsentTools(): void {
  if (globalZarazInstance) {
    globalZarazInstance.clearStorage();
    globalZarazInstance = null;
  }

  if (typeof window !== 'undefined') {
    delete (window as any).zaraz;
  }

  console.log('[Zaraz Consent Tools] Cleaned up');
}

/**
 * Quick setup function for common use cases
 * Creates a Zaraz instance with sensible defaults for local development
 */
export function quickSetup(
  options: {
    autoShow?: boolean;
    enableLogging?: boolean;
    customPurposes?: any[];
  } = {}
): FakeZaraz {
  const config: Partial<ZarazConfig> = {
    enableLogging: options.enableLogging !== false, // default to true
    autoShow: options.autoShow || false,
    enableModal: true,
    ...(options.customPurposes && { purposes: options.customPurposes }),
  };

  return initializeZarazConsentTools(config);
}
