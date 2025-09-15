// Export the main integration
export {
  sentryZarazConsentIntegration,
  SentryZarazConsentIntegrationClass,
  type SentryZarazConsentIntegrationOptions,
  type ConsentState,
  type Integration,
} from './SentryZarazConsentIntegration';

// Export Zaraz utilities
export {
  getZaraz,
  isZarazEnabled,
  isFunctionalConsentGranted,
  getConsentStatus,
  setConsent,
  type PurposeMapping,
} from './zaraz';

// Export event logger
export { logEvent } from './eventLogger';
