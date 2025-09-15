import { ZarazConfig, Purpose } from './types';

export const DEFAULT_PURPOSES: Purpose[] = [
  {
    id: 'functional',
    name: 'Functional',
    description:
      'Necessary for the website to function properly. Cannot be disabled.',
    order: 1,
    required: true,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website.',
    order: 2,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description:
      'Used to deliver personalized advertisements and measure ad performance.',
    order: 3,
  },
  {
    id: 'preferences',
    name: 'Preferences',
    description:
      'Remember your preferences and settings to enhance your experience.',
    order: 4,
  },
];

export const DEFAULT_CONFIG: Required<ZarazConfig> = {
  purposes: DEFAULT_PURPOSES,
  defaultConsent: {
    functional: true,
    analytics: false,
    marketing: false,
    preferences: false,
  },
  enableLogging: true,
  enableModal: true,
  modalConfig: {
    title: 'Cookie Consent',
    description:
      'We use cookies to improve your experience and analyze site usage. Choose which types of cookies you want to allow.',
    acceptAllText: 'Accept All',
    rejectAllText: 'Reject All',
    saveText: 'Save Preferences',
    closeText: 'Close',
    theme: 'light',
    position: 'center',
  },
  cookieName: 'cf_consent',
  autoShow: false,
};
