/// <reference path="../types/zaraz.d.ts" />

import {
  PurposeMapping,
  isFunctionalConsentGranted,
  getConsentStatus,
  setConsent,
} from '../../../src/index';

// Default purpose mapping for the demo - these are specific to this demo's Zaraz setup
export const DEMO_PURPOSE_MAPPING: PurposeMapping = {
  functional: 'lFDj', // Essential/Necessary
  analytics: 'yybb', // Performance & Statistics
  marketing: 'rlae', // Advertising & Personalization
  preferences: 'hfWn', // Personalization & Settings
};

// Re-export common utilities from zaraz-consent-tools for convenience
export {
  getZaraz,
  isZarazEnabled,
  showConsentModal,
  hideConsentModal,
  acceptAllConsent,
  rejectAllConsent,
  waitForConsentAPI,
  onConsentChange,
} from 'zaraz-consent-tools';

// Re-export from the main package
export {
  isFunctionalConsentGranted,
  getConsentStatus,
  setConsent,
  type PurposeMapping,
} from '../../../src/index';

// Convenience functions for demo components using the demo-specific purpose mapping
export const isSentryManagedComponentEnabledDemo = (): boolean => {
  return isFunctionalConsentGranted(DEMO_PURPOSE_MAPPING);
};

export const getConsentStatusDemo = () => {
  return getConsentStatus(DEMO_PURPOSE_MAPPING);
};

export const setConsentDemo = (consentState: { [key: string]: boolean }) => {
  return setConsent(consentState, DEMO_PURPOSE_MAPPING);
};
