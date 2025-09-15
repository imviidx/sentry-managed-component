/// <reference path="../types/zaraz.d.ts" />

import { initializeZarazConsentTools } from 'zaraz-consent-tools';
import { DEMO_PURPOSE_MAPPING } from './zaraz';

// Initialize zaraz-consent-tools for local development
export const initializeLocalZaraz = () => {
  if (typeof window === 'undefined') {
    console.warn('[Demo] Zaraz Consent Tools can only be used in browser');
    return null;
  }

  // Only initialize in development or if no real Zaraz is detected
  if (window.zaraz?.consent?.APIReady) {
    console.log('[Demo] Real Zaraz detected, skipping fake initialization');
    return null;
  }

  console.log('[Demo] Initializing fake Zaraz for local development');

  return initializeZarazConsentTools({
    // Use the same purpose IDs as the demo expects
    purposes: [
      {
        id: DEMO_PURPOSE_MAPPING.functional,
        name: 'Essential Cookies',
        description:
          'Necessary for the website to function properly, including Sentry error tracking.',
        order: 1,
        required: true,
      },
      {
        id: DEMO_PURPOSE_MAPPING.analytics,
        name: 'Performance & Statistics',
        description:
          'Help us understand how visitors interact with our website.',
        order: 2,
      },
      {
        id: DEMO_PURPOSE_MAPPING.marketing,
        name: 'Advertising & Personalization',
        description:
          'Used to deliver personalized advertisements and measure ad performance.',
        order: 3,
      },
      {
        id: DEMO_PURPOSE_MAPPING.preferences,
        name: 'Personalization & Settings',
        description:
          'Remember your preferences and settings to enhance your experience.',
        order: 4,
      },
    ],

    // Default consent - functional always true for Sentry to work
    defaultConsent: {
      [DEMO_PURPOSE_MAPPING.functional]: true,
      [DEMO_PURPOSE_MAPPING.analytics]: false,
      [DEMO_PURPOSE_MAPPING.marketing]: false,
      [DEMO_PURPOSE_MAPPING.preferences]: false,
    },

    // Enable detailed logging in development
    enableLogging: true,

    // Enable the consent modal
    enableModal: true,

    // Modal configuration
    modalConfig: {
      title: 'Cookie Consent - Sentry Demo',
      description:
        'This demo uses cookies to demonstrate Sentry consent integration. Choose which types you want to allow.',
      acceptAllText: 'Accept All',
      rejectAllText: 'Reject Non-Essential',
      saveText: 'Save Preferences',
      closeText: 'Close',
      theme: 'light',
      position: 'center',
    },

    // Use the CloudFlare standard cookie name
    cookieName: 'cf_consent',

    // Don't auto-show modal - the demo will control this
    autoShow: false,
  });
};

// Initialize on import if in development environment or no Zaraz detected
if (typeof window !== 'undefined' && !window.zaraz?.consent?.APIReady) {
  // Small delay to ensure the DOM is ready
  setTimeout(() => {
    initializeLocalZaraz();
  }, 100);
}
