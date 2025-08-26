/// <reference path="../types/zaraz.d.ts" />

export interface PurposeMapping {
  functional: string;
  analytics: string;
  marketing: string;
  preferences: string;
}

export const ZARAZ_FUNCTIONAL_PURPOSE_ID = 'lFDj'; // Functional (Essential/Necessary)
export const ZARAZ_ANALYTICS_PURPOSE_ID = 'yybb'; // Analytics (Performance & Statistics)
export const ZARAZ_MARKETING_PURPOSE_ID = 'rlae'; // Marketing (Advertising & Personalization)
export const ZARAZ_PREFERENCES_PURPOSE_ID = 'hfWn'; // Preferences (Personalization & Settings)

export const DEFAULT_PURPOSE_MAPPING: PurposeMapping = {
  functional: ZARAZ_FUNCTIONAL_PURPOSE_ID,
  analytics: ZARAZ_ANALYTICS_PURPOSE_ID,
  marketing: ZARAZ_MARKETING_PURPOSE_ID,
  preferences: ZARAZ_PREFERENCES_PURPOSE_ID,
};

export const getZaraz = (): Zaraz.ZarazGlobal | undefined => {
  return typeof window !== 'undefined' ? (window as any).zaraz : undefined;
};

export const isZarazEnabled = (): boolean => {
  return !!getZaraz();
};

export const isSentryManagedComponentEnabled = (
  purposeMapping?: PurposeMapping
): boolean => {
  const mapping = purposeMapping || DEFAULT_PURPOSE_MAPPING;
  return !!getZaraz()?.consent?.get(mapping.functional);
};

export const getConsentStatus = (purposeMapping?: PurposeMapping) => {
  const zaraz = getZaraz();
  if (!zaraz?.consent?.get) return {};

  const mapping = purposeMapping || DEFAULT_PURPOSE_MAPPING;

  return {
    functional: zaraz.consent.get(mapping.functional),
    analytics: zaraz.consent.get(mapping.analytics),
    marketing: zaraz.consent.get(mapping.marketing),
    preferences: zaraz.consent.get(mapping.preferences),
  };
};

export const setConsent = (
  consentState: { [key: string]: boolean },
  purposeMapping?: PurposeMapping
) => {
  const zaraz = getZaraz();
  if (!zaraz?.consent?.set) return;

  const mapping = purposeMapping || DEFAULT_PURPOSE_MAPPING;

  const zarazConsent: { [key: string]: boolean } = {};
  Object.entries(consentState).forEach(([key, value]) => {
    const purposeId = mapping[key as keyof PurposeMapping];
    if (purposeId) {
      zarazConsent[purposeId] = value;
    }
  });

  zaraz.consent.set(zarazConsent);
};
