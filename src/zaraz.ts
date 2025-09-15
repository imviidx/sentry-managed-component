export interface PurposeMapping {
  functional: string;
  analytics: string;
  marketing: string;
  preferences: string;
}

declare global {
  interface Window {
    zaraz?: Zaraz.ZarazGlobal;
  }
}

declare namespace Zaraz {
  interface ConsentAPI {
    APIReady: boolean;
    get(purposeId: string): boolean;
    set(consent: { [purposeId: string]: boolean }): void;
    purposes?: { [purposeId: string]: any };
  }

  interface ZarazGlobal {
    consent: ConsentAPI;
    showConsentModal?: () => void;
  }
}

export const getZaraz = (): Zaraz.ZarazGlobal | undefined => {
  return typeof window !== 'undefined' ? (window as any).zaraz : undefined;
};

export const isZarazEnabled = (): boolean => {
  return !!getZaraz();
};

export const isFunctionalConsentGranted = (
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
