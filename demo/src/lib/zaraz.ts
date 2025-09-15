/// <reference path="../types/zaraz.d.ts" />

export interface PurposeMapping {
  functional: string;
  analytics: string;
  marketing: string;
  preferences: string;
}

// Default purpose mapping for the demo
export const DEMO_PURPOSE_MAPPING: PurposeMapping = {
  functional: 'lFDj', // Essential/Necessary
  analytics: 'yybb', // Performance & Statistics
  marketing: 'rlae', // Advertising & Personalization
  preferences: 'hfWn', // Personalization & Settings
};

export const getZaraz = (): Zaraz.ZarazGlobal | undefined => {
  return typeof window !== 'undefined' ? (window as any).zaraz : undefined;
};

export const isZarazEnabled = (): boolean => {
  return !!getZaraz();
};

export const isSentryManagedComponentEnabled = (
  purposeMapping: PurposeMapping
): boolean => {
  return !!getZaraz()?.consent?.get(purposeMapping.functional);
};

export const getConsentStatus = (purposeMapping: PurposeMapping) => {
  const zaraz = getZaraz();
  if (!zaraz?.consent?.get) return {};

  return {
    functional: zaraz.consent.get(purposeMapping.functional),
    analytics: zaraz.consent.get(purposeMapping.analytics),
    marketing: zaraz.consent.get(purposeMapping.marketing),
    preferences: zaraz.consent.get(purposeMapping.preferences),
  };
};

export const setConsent = (
  consentState: { [key: string]: boolean },
  purposeMapping: PurposeMapping
) => {
  const zaraz = getZaraz();
  if (!zaraz?.consent?.set) return;

  const zarazConsent: { [key: string]: boolean } = {};
  Object.entries(consentState).forEach(([key, value]) => {
    const purposeId = purposeMapping[key as keyof PurposeMapping];
    if (purposeId) {
      zarazConsent[purposeId] = value;
    }
  });

  zaraz.consent.set(zarazConsent);
};

// Convenience functions for demo components using default purpose mapping
export const isSentryManagedComponentEnabledDemo = (): boolean => {
  return isSentryManagedComponentEnabled(DEMO_PURPOSE_MAPPING);
};

export const getConsentStatusDemo = () => {
  return getConsentStatus(DEMO_PURPOSE_MAPPING);
};

export const setConsentDemo = (consentState: { [key: string]: boolean }) => {
  return setConsent(consentState, DEMO_PURPOSE_MAPPING);
};
