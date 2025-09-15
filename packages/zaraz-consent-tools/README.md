# Zaraz Consent Tools

A comprehensive local development tool for Cloudflare Zaraz consent management. This package provides a fake Zaraz instance with a fully functional consent API and modal dialog for testing consent-dependent applications locally.

## Features

- 🎭 **Fake Zaraz Instance**: Complete implementation of the Zaraz Consent API
- 🍪 **Persistent Storage**: Consent preferences saved to cookies and localStorage
- 🎨 **Customizable Consent Modal**: Light/dark themes, configurable text and positioning
- 📝 **Detailed Logging**: Track all consent events and API calls
- 🔧 **Flexible Configuration**: Customize purposes, defaults, and behavior
- 🚀 **Easy Integration**: Drop-in replacement for production Zaraz

## Installation

```bash
npm install --save-dev zaraz-consent-tools
```

## Quick Start

```javascript
import { quickSetup } from 'zaraz-consent-tools';

// Initialize with sensible defaults
const zaraz = quickSetup({
  autoShow: true, // Show consent modal automatically
  enableLogging: true, // Enable console logging
});

// Your app can now use window.zaraz as if it were real Zaraz
console.log(window.zaraz.consent.get('analytics')); // false
window.zaraz.consent.modal = true; // Show consent modal
```

## Advanced Configuration

```javascript
import { initializeZarazConsentTools } from 'zaraz-consent-tools';

const zaraz = initializeZarazConsentTools({
  // Custom consent purposes
  purposes: [
    {
      id: 'functional',
      name: 'Essential Cookies',
      description: 'Required for the website to function',
      order: 1,
      required: true,
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Help us understand website usage',
      order: 2,
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Personalized advertisements',
      order: 3,
    },
  ],

  // Default consent status
  defaultConsent: {
    functional: true,
    analytics: false,
    marketing: false,
  },

  // Modal configuration
  modalConfig: {
    title: 'Privacy Preferences',
    description: 'Choose which cookies you want to allow',
    theme: 'dark',
    position: 'bottom',
  },

  // Behavior settings
  autoShow: false,
  enableLogging: true,
  cookieName: 'my_consent',
});
```

## API Reference

### Consent API

The fake Zaraz instance implements the complete Cloudflare Zaraz Consent API:

#### Properties

- `zaraz.consent.APIReady` - Boolean indicating if the API is ready
- `zaraz.consent.modal` - Get/set modal visibility
- `zaraz.consent.purposes` - Object containing all configured purposes

#### Methods

- `zaraz.consent.get(purposeId)` - Get consent status for a purpose
- `zaraz.consent.set(preferences)` - Set consent for multiple purposes
- `zaraz.consent.getAll()` - Get all consent preferences
- `zaraz.consent.setAll(status)` - Set all purposes to granted/denied
- `zaraz.consent.getAllCheckboxes()` - Get checkbox states
- `zaraz.consent.setCheckboxes(status)` - Set checkbox states
- `zaraz.consent.setAllCheckboxes(status)` - Set all checkboxes
- `zaraz.consent.sendQueuedEvents()` - Send queued analytics events

### Events

Listen for consent events just like with real Zaraz:

```javascript
// API ready
document.addEventListener('zarazConsentAPIReady', () => {
  console.log('Zaraz Consent API is ready!');
});

// Consent changes
document.addEventListener('zarazConsentChoicesUpdated', () => {
  const consent = window.zaraz.consent.getAll();
  console.log('Consent updated:', consent);
});
```

### Utility Functions

```javascript
import {
  getZarazConsentTools,
  cleanupZarazConsentTools,
} from 'zaraz-consent-tools';

// Get current instance
const zaraz = getZarazConsentTools();

// Clean up (useful for tests)
cleanupZarazConsentTools();
```

## Configuration Options

### ZarazConfig

```typescript
interface ZarazConfig {
  purposes?: Purpose[]; // Custom consent purposes
  defaultConsent?: ConsentPreferences; // Default consent status
  enableLogging?: boolean; // Enable console logging
  enableModal?: boolean; // Enable consent modal
  modalConfig?: ModalConfig; // Modal appearance and text
  cookieName?: string; // Cookie name for persistence
  autoShow?: boolean; // Auto-show modal on first visit
}
```

### Purpose

```typescript
interface Purpose {
  id: string; // Unique purpose identifier
  name: string; // Display name
  description: string; // Description for users
  order: number; // Display order
  required?: boolean; // Cannot be disabled
}
```

### ModalConfig

```typescript
interface ModalConfig {
  title?: string; // Modal title
  description?: string; // Modal description
  acceptAllText?: string; // "Accept All" button text
  rejectAllText?: string; // "Reject All" button text
  saveText?: string; // "Save" button text
  closeText?: string; // "Close" button text
  theme?: 'light' | 'dark'; // Visual theme
  position?: 'center' | 'bottom'; // Modal position
}
```

## Integration Examples

### With React

```jsx
import React, { useEffect, useState } from 'react';
import {
  quickSetup,
  waitForConsentAPI,
  onConsentChange,
} from 'zaraz-consent-tools';

function App() {
  const [consentReady, setConsentReady] = useState(false);

  useEffect(() => {
    // Initialize fake Zaraz for development
    quickSetup({ autoShow: false });

    // Wait for consent API
    waitForConsentAPI().then(() => {
      setConsentReady(true);
    });

    // Listen for consent changes
    const removeListener = onConsentChange((consent) => {
      console.log('Consent updated:', consent);
    });

    return removeListener;
  }, []);

  const showPreferences = () => {
    window.zaraz.consent.modal = true;
  };

  return (
    <div>
      <h1>My App</h1>
      {consentReady && (
        <button onClick={showPreferences}>Privacy Preferences</button>
      )}
    </div>
  );
}
```

### With Sentry Integration

```jsx
import React, { useEffect, useState } from 'react';
import {
  quickSetup,
  waitForConsentAPI,
  onConsentChange,
} from 'zaraz-consent-tools';
import { isSentryManagedComponentEnabled } from 'sentry-zaraz-consent-integration';

function App() {
  const [consentReady, setConsentReady] = useState(false);
  const [sentryEnabled, setSentryEnabled] = useState(false);

  useEffect(() => {
    // Initialize fake Zaraz for development
    quickSetup({ autoShow: false });

    // Wait for consent API and check Sentry status
    waitForConsentAPI().then(() => {
      setConsentReady(true);
      // Check if Sentry should be enabled based on consent
      const purposeMapping = { functional: 'your-functional-id' };
      setSentryEnabled(isSentryManagedComponentEnabled(purposeMapping));
    });

    // Listen for consent changes and update Sentry status
    const removeListener = onConsentChange(() => {
      const purposeMapping = { functional: 'your-functional-id' };
      setSentryEnabled(isSentryManagedComponentEnabled(purposeMapping));
    });

    return removeListener;
  }, []);

  return (
    <div>
      <h1>My App with Sentry</h1>
      <p>
        Sentry Error Tracking: {sentryEnabled ? '✅ Enabled' : '❌ Disabled'}
      </p>
      {consentReady && (
        <button onClick={() => (window.zaraz.consent.modal = true)}>
          Privacy Preferences
        </button>
      )}
    </div>
  );
}
```

### With Testing

```javascript
import {
  initializeZarazConsentTools,
  cleanupZarazConsentTools,
} from 'zaraz-consent-tools';

describe('Consent Tests', () => {
  beforeEach(() => {
    initializeZarazConsentTools({
      enableLogging: false, // Quiet during tests
    });
  });

  afterEach(() => {
    cleanupZarazConsentTools();
  });

  test('should grant analytics consent', () => {
    window.zaraz.consent.set({ analytics: true });
    expect(window.zaraz.consent.get('analytics')).toBe(true);
  });
});
```

### Development vs Production

```javascript
// utils/zaraz.js
if (process.env.NODE_ENV === 'development') {
  import('zaraz-consent-tools').then(({ quickSetup }) => {
    quickSetup({ autoShow: true });
  });
}
// In production, real Zaraz script is loaded via HTML
```

## Default Purposes

The package comes with sensible default purposes:

- **functional**: Essential website functionality (required, always granted)
- **analytics**: Website usage analytics (optional, default denied)
- **marketing**: Advertising and marketing (optional, default denied)
- **preferences**: User preference storage (optional, default denied)

## Storage

Consent preferences are automatically persisted using:

1. **HTTP Cookies**: Primary storage mechanism (configurable name)
2. **localStorage**: Backup storage for reliability

This ensures consent persists across browser sessions and matches real Zaraz behavior.

## Console Logging

When logging is enabled, you'll see detailed console output:

```
[Zaraz Consent Tools] Fake Zaraz initialized { purposes: [...], initialConsent: {...} }
[Zaraz Consent Tools] Consent API is ready
[Zaraz Consent Tools] Get consent for "analytics": false
[Zaraz Consent Tools] Consent modal shown
[Zaraz Consent Tools] Setting consent { analytics: true }
[Zaraz Consent Tools] Consent updated { functional: true, analytics: true, ... }
[Zaraz Consent Tools] Event dispatched: zarazConsentChoicesUpdated
```

## Browser Support

Works in all modern browsers that support:

- ES2018+
- Custom Events
- localStorage
- document.cookie

## Contributing

This package is part of the sentry-managed-component project. See the main repository for contribution guidelines.

## License

Apache-2.0
