# Custom Purpose Mapping Configuration

The `SentryZarazInteg```typescript
import { sentryZarazIntegration } from './SentryZarazIntegration';

// Use completely different purpose IDs
const sentryIntegration = sentryZarazIntegration({
purposeMapping: {
functional: 'my-functional-purpose',
analytics: 'my-analytics-purpose',
marketing: 'my-marketing-purpose',
preferences: 'my-preferences-purpose',
}
});

````

### Example 3: Using with Sentry SDKuires a purpose mapping configuration to specify which Zaraz consent purposes are used for different consent types.

## Purpose Mapping Configuration

The purpose mapping is **required** and must match your Zaraz consent configuration. By default, this demo uses these purpose IDs:

```typescript
const PURPOSE_MAPPING = {
  functional: 'lFDj',  // Functional (Essential/Necessary)
  analytics: 'yybb',   // Analytics (Performance & Statistics)
  marketing: 'rlae',   // Marketing (Advertising & Personalization)
  preferences: 'hfWn', // Preferences (Personalization & Settings)
};
````

## Usage Examplesping Configuration

The `SentryZarazIntegration` now supports configurable purpose mappings, allowing you to customize which Zaraz consent purposes are used for different consent types.

## Default Purpose Mapping

By default, the integration uses these purpose IDs:

```typescript
const DEMO_PURPOSE_MAPPING = {
  functional: 'lFDj', // Functional (Essential/Necessary)
  analytics: 'yybb', // Analytics (Performance & Statistics)
  marketing: 'rlae', // Marketing (Advertising & Personalization)
  preferences: 'hfWn', // Preferences (Personalization & Settings)
};
```

## Using Custom Purpose Mapping

You can override the default purpose mapping by providing a custom `purposeMapping` option:

### Example 1: Basic Usage

```typescript
import { sentryZarazIntegration } from './SentryZarazIntegration';

// Purpose mapping is required
const sentryIntegration = sentryZarazIntegration({
  debug: true,
  timeout: 15000,
  purposeMapping: {
    functional: 'lFDj', // Your functional purpose ID
    analytics: 'yybb', // Your analytics purpose ID
    marketing: 'rlae', // Your marketing purpose ID
    preferences: 'hfWn', // Your preferences purpose ID
  },
});
```

### Example 2: Different Purpose IDs

```typescript
import { sentryZarazIntegration } from './SentryZarazIntegration';

// Use a custom purpose ID for functional consent
const sentryIntegration = sentryZarazIntegration({
  debug: true,
  timeout: 15000,
  purposeMapping: {
    functional: 'custom-functional-id',
    analytics: 'analytics',
    marketing: 'marketing',
    preferences: 'preferences',
  },
});
```

### Example 2: Multiple Custom Purpose IDs

```typescript
import { sentryZarazIntegration } from './SentryZarazIntegration';

// Use completely custom purpose IDs
const sentryIntegration = sentryZarazIntegration({
  purposeMapping: {
    functional: 'my-functional-purpose',
    analytics: 'my-analytics-purpose',
    marketing: 'my-marketing-purpose',
    preferences: 'my-preferences-purpose',
  },
});
```

### Example 3: Using with Sentry SDK

```typescript
import * as Sentry from '@sentry/react';
import { sentryZarazIntegration } from './SentryZarazIntegration';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  integrations: [
    sentryZarazIntegration({
      debug: process.env.NODE_ENV === 'development',
      timeout: 10000,
      purposeMapping: {
        functional: 'your-custom-functional-purpose',
        analytics: 'analytics',
        marketing: 'marketing',
        preferences: 'preferences',
      },
    }),
    // ... other integrations
  ],
  // ... other Sentry options
});
```

## Using Custom Purpose Mapping with Zaraz Functions

The zaraz utility functions also support custom purpose mappings:

### isSentryManagedComponentEnabled

```typescript
import { isSentryManagedComponentEnabled } from './lib/zaraz';

// Using default purpose mapping
const hasConsent = isSentryManagedComponentEnabled();

// Using custom purpose mapping
const customPurposeMapping = {
  functional: 'my-custom-functional-id',
  analytics: 'analytics',
  marketing: 'marketing',
  preferences: 'preferences',
};
const hasCustomConsent = isSentryManagedComponentEnabled(customPurposeMapping);
```

### getConsentStatus

```typescript
import { getConsentStatus } from './lib/zaraz';

// Using default purpose mapping
const consentStatus = getConsentStatus();

// Using custom purpose mapping
const customConsentStatus = getConsentStatus(customPurposeMapping);
```

## Purpose Mapping Interface

The `PurposeMapping` interface defines the structure for custom purpose mappings:

```typescript
export interface PurposeMapping {
  functional: string; // Purpose ID for functional consent (required for Sentry)
  analytics: string; // Purpose ID for analytics consent
  marketing: string; // Purpose ID for marketing consent
  preferences: string; // Purpose ID for preferences consent
}
```

## Notes

- The `functional` purpose ID is the most important as it controls whether Sentry events are allowed
- If you don't provide a custom `purposeMapping`, the default mapping will be used
- All existing code continues to work without modification
- The integration will only send Sentry events when the functional consent is granted
- Purpose IDs must match the purpose IDs configured in your Zaraz setup
