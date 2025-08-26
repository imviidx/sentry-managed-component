/// <reference path="../types/zaraz.d.ts" />

export const ZARAZ_FUNCTIONAL_PURPOSE_ID = 'dqVA';
export const ZARAZ_ANALYTICS_PURPOSE_ID = 'analytics';
export const ZARAZ_MARKETING_PURPOSE_ID = 'marketing';
export const ZARAZ_PREFERENCES_PURPOSE_ID = 'preferences';

export const getZaraz = (): Zaraz.ZarazGlobal | undefined => {
  return typeof window !== 'undefined' ? (window as any).zaraz : undefined;
};

export const isZarazEnabled = (): boolean => {
  return !!getZaraz();
};

export const isSentryManagedComponentEnabled = (): boolean => {
  return !!getZaraz()?.consent?.get(ZARAZ_FUNCTIONAL_PURPOSE_ID);
};

export const getConsentStatus = () => {
  const zaraz = getZaraz();
  if (!zaraz?.consent?.get) return {};

  return {
    functional: zaraz.consent.get(ZARAZ_FUNCTIONAL_PURPOSE_ID),
    analytics: zaraz.consent.get(ZARAZ_ANALYTICS_PURPOSE_ID),
    marketing: zaraz.consent.get(ZARAZ_MARKETING_PURPOSE_ID),
    preferences: zaraz.consent.get(ZARAZ_PREFERENCES_PURPOSE_ID),
  };
};

export const setConsent = (consentState: { [key: string]: boolean }) => {
  const zaraz = getZaraz();
  if (!zaraz?.consent?.set) return;

  const purposeMapping = {
    functional: ZARAZ_FUNCTIONAL_PURPOSE_ID,
    analytics: ZARAZ_ANALYTICS_PURPOSE_ID,
    marketing: ZARAZ_MARKETING_PURPOSE_ID,
    preferences: ZARAZ_PREFERENCES_PURPOSE_ID,
  };

  const zarazConsent: { [key: string]: boolean } = {};
  Object.entries(consentState).forEach(([key, value]) => {
    const purposeId = purposeMapping[key as keyof typeof purposeMapping];
    if (purposeId) {
      zarazConsent[purposeId] = value;
    }
  });

  zaraz.consent.set(zarazConsent);
};
