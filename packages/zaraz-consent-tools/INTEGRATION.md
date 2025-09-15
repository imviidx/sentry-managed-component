# Integration Guide: Using Zaraz Consent Tools with Sentry

This guide shows how to integrate `zaraz-consent-tools` with your Sentry-based application for local development.

## Setup for Local Development

### 1. Install the Package

```bash
npm install --save-dev zaraz-consent-tools
```

### 2. Initialize in Development

Create a file `src/utils/zaraz-dev.ts`:

```typescript
import { initializeZarazConsentTools } from 'zaraz-consent-tools';

// Your production purpose mapping
export const PURPOSE_MAPPING = {
  functional: 'your-functional-id',
  analytics: 'your-analytics-id',
  marketing: 'your-marketing-id',
  preferences: 'your-preferences-id',
};

export const initializeDevZaraz = () => {
  // Only in development
  if (process.env.NODE_ENV !== 'development') return;

  // Don't override real Zaraz if present
  if (window.zaraz?.consent?.APIReady) return;

  return initializeZarazConsentTools({
    purposes: [
      {
        id: PURPOSE_MAPPING.functional,
        name: 'Essential',
        description: 'Required for core functionality including error tracking',
        order: 1,
        required: true,
      },
      {
        id: PURPOSE_MAPPING.analytics,
        name: 'Analytics',
        description: 'Usage analytics and performance monitoring',
        order: 2,
      },
      // ... other purposes
    ],
    defaultConsent: {
      [PURPOSE_MAPPING.functional]: true, // Sentry needs this
      [PURPOSE_MAPPING.analytics]: false,
      [PURPOSE_MAPPING.marketing]: false,
      [PURPOSE_MAPPING.preferences]: false,
    },
    enableLogging: true,
    autoShow: false, // Control when to show modal
  });
};

// Auto-initialize
if (typeof window !== 'undefined') {
  setTimeout(initializeDevZaraz, 100);
}
```

### 3. Import in Your Main App

```typescript
// src/main.tsx or src/App.tsx
import './utils/zaraz-dev'; // Initialize fake Zaraz for dev

// Your existing Sentry setup
import * as Sentry from '@sentry/react';
import { ZarazConsentIntegration } from 'sentry-zaraz-consent-integration';

Sentry.init({
  // ... your config
  integrations: [
    new ZarazConsentIntegration({
      purposeMapping: {
        functional: 'your-functional-id',
        analytics: 'your-analytics-id',
        marketing: 'your-marketing-id',
        preferences: 'your-preferences-id',
      },
    }),
  ],
});
```

## Testing Consent Flow

### 1. Basic Consent Testing

```typescript
// Test functional consent (required for Sentry)
window.zaraz.consent.get('your-functional-id'); // should be true

// Test analytics consent
window.zaraz.consent.set({ 'your-analytics-id': true });
window.zaraz.consent.get('your-analytics-id'); // should be true
```

### 2. Modal Testing

```typescript
// Show consent modal programmatically
window.zaraz.consent.modal = true;

// Or via helper
window.zaraz.showConsentModal();
```

### 3. Event Testing

```typescript
// Listen for consent events
document.addEventListener('zarazConsentAPIReady', () => {
  console.log('Zaraz ready for testing');
});

document.addEventListener('zarazConsentChoicesUpdated', () => {
  console.log('Consent updated:', window.zaraz.consent.getAll());
});
```

## Environment-Specific Setup

### Development Only

```typescript
// webpack.config.js or vite.config.ts
export default {
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
};

// In your code
if (process.env.NODE_ENV === 'development') {
  import('zaraz-consent-tools').then(({ quickSetup }) => {
    quickSetup({ autoShow: true });
  });
}
```

### Testing Environment

```typescript
// tests/setup.ts
import {
  initializeZarazConsentTools,
  cleanupZarazConsentTools,
} from 'zaraz-consent-tools';

beforeEach(() => {
  initializeZarazConsentTools({
    enableLogging: false, // Quiet during tests
    enableModal: false, // No UI during tests
    defaultConsent: {
      functional: true,
      analytics: false,
      marketing: false,
      preferences: false,
    },
  });
});

afterEach(() => {
  cleanupZarazConsentTools();
});
```

## Common Patterns

### 1. Consent-Dependent Features

```typescript
import { isConsentGranted } from './utils/zaraz-dev';

const AnalyticsComponent = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      setAnalyticsEnabled(isConsentGranted('your-analytics-id'));
    };

    checkConsent();
    document.addEventListener('zarazConsentChoicesUpdated', checkConsent);
    return () =>
      document.removeEventListener('zarazConsentChoicesUpdated', checkConsent);
  }, []);

  return analyticsEnabled ? <AnalyticsWidget /> : <ConsentPrompt />;
};
```

### 2. Debugging Consent Issues

```typescript
// Add to your dev tools
window.debugConsent = () => {
  console.log('Zaraz available:', !!window.zaraz);
  console.log('API ready:', window.zaraz?.consent?.APIReady);
  console.log('All consent:', window.zaraz?.consent?.getAll());
  console.log('Purposes:', window.zaraz?.consent?.purposes);
};
```

### 3. Production vs Development Detection

```typescript
const isRealZaraz = () => {
  return window.zaraz && !window.zaraz.constructor.name.includes('Fake');
};

const isDevZaraz = () => {
  return window.zaraz && window.zaraz.constructor.name.includes('Fake');
};
```

## Troubleshooting

### Common Issues

1. **Zaraz not available**: Make sure the import is before any code that uses `window.zaraz`
2. **Consent not persisting**: Check browser's localStorage and cookies
3. **Modal not showing**: Ensure `enableModal: true` in config
4. **TypeScript errors**: Import the package to get global type definitions

### Debug Mode

```typescript
// Enable extra debugging
initializeZarazConsentTools({
  enableLogging: true,
  // ... other config
});

// Check browser console for detailed logs:
// [Zaraz Consent Tools] Fake Zaraz initialized
// [Zaraz Consent Tools] Consent API is ready
// [Zaraz Consent Tools] Get consent for "purpose": true
```

### Storage Inspection

```typescript
// Check stored consent
console.log('Cookie:', document.cookie.includes('cf_consent'));
console.log('LocalStorage:', localStorage.getItem('cf_consent_backup'));

// Clear stored consent for testing
window.zaraz.clearStorage?.();
```

## Production Deployment

When deploying to production:

1. **Remove dev imports**: Ensure zaraz-consent-tools imports are only in development
2. **Add real Zaraz script**: Include actual Cloudflare Zaraz script in production HTML
3. **Test the transition**: Verify your app works with both fake and real Zaraz
4. **Monitor consent**: Use the same event listeners for production monitoring

The fake Zaraz API is designed to be a drop-in replacement, so your production code should work identically with both versions.
