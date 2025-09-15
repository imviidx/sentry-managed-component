/// <reference path="../types/zaraz.d.ts" />

import { DEMO_PURPOSE_MAPPING } from './zaraz';

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

// Re-export everything from zaraz.ts for convenience
export * from './zaraz';
