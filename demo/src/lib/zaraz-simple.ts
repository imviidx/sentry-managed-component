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

// Simple fake Zaraz implementation for demo purposes
const createFakeZaraz = () => {
  const consentState = {
    [DEMO_PURPOSE_MAPPING.functional]: true,
    [DEMO_PURPOSE_MAPPING.analytics]: true,
    [DEMO_PURPOSE_MAPPING.marketing]: false,
    [DEMO_PURPOSE_MAPPING.preferences]: false,
  };

  const fakeZaraz = {
    consent: {
      APIReady: true,
      purposes: {
        [DEMO_PURPOSE_MAPPING.functional]: {
          name: 'Essential/Necessary',
          description: 'Required for basic site functionality and security',
        },
        [DEMO_PURPOSE_MAPPING.analytics]: {
          name: 'Performance & Statistics',
          description: 'Helps us analyze site usage and improve performance',
        },
        [DEMO_PURPOSE_MAPPING.marketing]: {
          name: 'Advertising & Personalization',
          description: 'Enables personalized content and targeted advertising',
        },
        [DEMO_PURPOSE_MAPPING.preferences]: {
          name: 'Personalization & Settings',
          description: 'Remembers your preferences and settings',
        },
      },
      get: (purposeId: string) => {
        return consentState[purposeId] || false;
      },
      set: (newConsent: { [key: string]: boolean }) => {
        Object.assign(consentState, newConsent);

        // Trigger consent events for WebCM
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('consent', {
            detail: {
              payload: {
                functional: consentState[DEMO_PURPOSE_MAPPING.functional],
                analytics: consentState[DEMO_PURPOSE_MAPPING.analytics],
                marketing: consentState[DEMO_PURPOSE_MAPPING.marketing],
                preferences: consentState[DEMO_PURPOSE_MAPPING.preferences],
              },
            },
          });
          window.dispatchEvent(event);
        }
      },
    },
    showConsentModal: () => {
      alert('Consent modal would appear here (this is a demo)');
    },
  };

  return fakeZaraz;
};

// Initialize fake Zaraz if not already available
if (typeof window !== 'undefined' && !(window as any).zaraz) {
  console.log('[Demo] Initializing simple fake Zaraz consent...');
  (window as any).zaraz = createFakeZaraz();
}

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
