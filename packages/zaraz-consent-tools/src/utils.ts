import { ZarazGlobal } from './types';

/**
 * Get the Zaraz global instance from the window object
 * @returns The Zaraz global instance or undefined if not available
 */
export const getZaraz = (): ZarazGlobal | undefined => {
  return typeof window !== 'undefined' ? (window as any).zaraz : undefined;
};

/**
 * Check if Zaraz is available and initialized
 * @returns True if Zaraz is available
 */
export const isZarazEnabled = (): boolean => {
  return !!getZaraz();
};

/**
 * Check if Zaraz Consent API is ready
 * @returns True if the consent API is ready
 */
export const isZarazConsentAPIReady = (): boolean => {
  return !!getZaraz()?.consent?.APIReady;
};

/**
 * Get consent status for a specific purpose by ID
 * @param purposeId The purpose ID to check
 * @returns True if consent is granted, false if denied, undefined if purpose doesn't exist
 */
export const getConsentForPurpose = (
  purposeId: string
): boolean | undefined => {
  return getZaraz()?.consent?.get(purposeId);
};

/**
 * Set consent for a specific purpose by ID
 * @param purposeId The purpose ID to set
 * @param granted Whether consent is granted
 */
export const setConsentForPurpose = (
  purposeId: string,
  granted: boolean
): void => {
  const zaraz = getZaraz();
  if (!zaraz?.consent?.set) {
    console.warn(
      '[Zaraz Consent Tools] Zaraz consent API not available for setConsentForPurpose'
    );
    return;
  }

  zaraz.consent.set({ [purposeId]: granted });
};

/**
 * Get all available purposes from Zaraz
 * @returns Object containing all configured purposes
 */
export const getAllPurposes = () => {
  return getZaraz()?.consent?.purposes || {};
};

/**
 * Show the consent modal
 */
export const showConsentModal = (): void => {
  const zaraz = getZaraz();
  if (zaraz?.consent) {
    zaraz.consent.modal = true;
  } else if (zaraz?.showConsentModal) {
    zaraz.showConsentModal();
  } else {
    console.warn(
      '[Zaraz Consent Tools] No method available to show consent modal'
    );
  }
};

/**
 * Hide the consent modal
 */
export const hideConsentModal = (): void => {
  const zaraz = getZaraz();
  if (zaraz?.consent) {
    zaraz.consent.modal = false;
  } else {
    console.warn(
      '[Zaraz Consent Tools] No method available to hide consent modal'
    );
  }
};

/**
 * Accept all consent categories
 */
export const acceptAllConsent = (): void => {
  const zaraz = getZaraz();
  if (zaraz?.consent?.setAll) {
    zaraz.consent.setAll(true);
  } else {
    console.warn('[Zaraz Consent Tools] setAll method not available');
  }
};

/**
 * Reject all non-essential consent categories
 */
export const rejectAllConsent = (): void => {
  const zaraz = getZaraz();
  if (zaraz?.consent?.setAll) {
    zaraz.consent.setAll(false);
  } else {
    console.warn('[Zaraz Consent Tools] setAll method not available');
  }
};

/**
 * Send queued events after consent is granted
 */
export const sendQueuedEvents = (): void => {
  const zaraz = getZaraz();
  if (zaraz?.consent?.sendQueuedEvents) {
    zaraz.consent.sendQueuedEvents();
  } else {
    console.warn('[Zaraz Consent Tools] sendQueuedEvents method not available');
  }
};

/**
 * Wait for Zaraz Consent API to become ready
 * @param timeout Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise that resolves when API is ready or rejects on timeout
 */
export const waitForConsentAPI = (timeout: number = 10000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isZarazConsentAPIReady()) {
      resolve();
      return;
    }

    const startTime = Date.now();

    const checkReady = () => {
      if (isZarazConsentAPIReady()) {
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(
          new Error('Timeout waiting for Zaraz Consent API to become ready')
        );
        return;
      }

      setTimeout(checkReady, 100);
    };

    // Also listen for the ready event
    const handleReady = () => {
      document.removeEventListener('zarazConsentAPIReady', handleReady);
      resolve();
    };

    document.addEventListener('zarazConsentAPIReady', handleReady);

    // Start checking
    setTimeout(checkReady, 100);
  });
};

/**
 * Listen for consent changes and call a callback
 * @param callback Function to call when consent changes
 * @returns Function to remove the event listener
 */
export const onConsentChange = (
  callback: (consent: any) => void
): (() => void) => {
  const handleConsentChange = () => {
    const zaraz = getZaraz();
    if (zaraz?.consent?.getAll) {
      callback(zaraz.consent.getAll());
    }
  };

  document.addEventListener('zarazConsentChoicesUpdated', handleConsentChange);

  return () => {
    document.removeEventListener(
      'zarazConsentChoicesUpdated',
      handleConsentChange
    );
  };
};
