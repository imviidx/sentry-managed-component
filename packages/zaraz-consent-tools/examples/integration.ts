// Example integration file for using zaraz-consent-tools in your project

import { initializeZarazConsentTools } from 'zaraz-consent-tools';

// Configuration matching your Sentry integration needs
export const initializeLocalZaraz = () => {
  if (typeof window === 'undefined') {
    console.warn('Zaraz Consent Tools can only be used in browser');
    return null;
  }

  // Check if we're in development mode
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Zaraz Consent Tools should only be used in development');
    return null;
  }

  return initializeZarazConsentTools({
    // Custom purposes that match your production Zaraz setup
    purposes: [
      {
        id: 'functional',
        name: 'Essential Cookies',
        description:
          'Necessary for the website to function properly. These cannot be disabled.',
        order: 1,
        required: true,
      },
      {
        id: 'analytics',
        name: 'Analytics & Performance',
        description:
          'Help us understand how visitors interact with our website by collecting usage data.',
        order: 2,
      },
      {
        id: 'marketing',
        name: 'Marketing & Advertising',
        description:
          'Used to deliver personalized advertisements and measure their effectiveness.',
        order: 3,
      },
      {
        id: 'preferences',
        name: 'Preferences & Personalization',
        description:
          'Remember your settings and preferences to enhance your experience.',
        order: 4,
      },
    ],

    // Default consent - functional always true, others false for GDPR compliance
    defaultConsent: {
      functional: true,
      analytics: false,
      marketing: false,
      preferences: false,
    },

    // Enable detailed logging in development
    enableLogging: true,

    // Enable the consent modal
    enableModal: true,

    // Modal configuration
    modalConfig: {
      title: 'Cookie Preferences',
      description:
        'We use cookies to improve your experience and analyze site usage. Please choose which types of cookies you want to allow.',
      acceptAllText: 'Accept All Cookies',
      rejectAllText: 'Reject Non-Essential',
      saveText: 'Save My Preferences',
      closeText: 'Close',
      theme: 'light',
      position: 'center',
    },

    // Use the same cookie name as production
    cookieName: 'cf_consent',

    // Don't auto-show modal - let the app control when to show it
    autoShow: false,
  });
};

// Utility functions for your app
export const showConsentModal = () => {
  if (window.zaraz?.consent) {
    window.zaraz.consent.modal = true;
  }
};

export const getConsentStatus = () => {
  if (window.zaraz?.consent?.APIReady) {
    return window.zaraz.consent.getAll();
  }
  return null;
};

export const isConsentGranted = (purposeId) => {
  if (window.zaraz?.consent?.APIReady) {
    return window.zaraz.consent.get(purposeId) === true;
  }
  return false;
};

// Initialize on import in development
if (process.env.NODE_ENV === 'development') {
  initializeLocalZaraz();
}
