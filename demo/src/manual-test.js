// Simple test to verify configurable purpose mapping functionality
// This is a basic test that can be run manually in the browser console

// Test 1: Default purpose mapping
console.log('=== Testing Default Purpose Mapping ===');
import('./lib/zaraz.js').then(({ isSentryManagedComponentEnabled, getConsentStatus, setConsent, DEFAULT_PURPOSE_MAPPING }) => {
  console.log('Default purpose mapping:', DEFAULT_PURPOSE_MAPPING);

  // Test with default mapping
  const defaultConsent = isSentryManagedComponentEnabled();
  console.log('Default functional consent:', defaultConsent);

  const defaultStatus = getConsentStatus();
  console.log('Default consent status:', defaultStatus);
});

// Test 2: Custom purpose mapping
console.log('=== Testing Custom Purpose Mapping ===');
import('./lib/zaraz.js').then(({ isSentryManagedComponentEnabled, getConsentStatus, setConsent }) => {
  const customMapping = {
    functional: 'test-functional',
    analytics: 'test-analytics',
    marketing: 'test-marketing',
    preferences: 'test-preferences',
  };

  console.log('Custom purpose mapping:', customMapping);

  // Test with custom mapping
  const customConsent = isSentryManagedComponentEnabled(customMapping);
  console.log('Custom functional consent:', customConsent);

  const customStatus = getConsentStatus(customMapping);
  console.log('Custom consent status:', customStatus);

  // Test setting consent with custom mapping
  setConsent({
    functional: true,
    analytics: false,
    marketing: false,
    preferences: true,
  }, customMapping);
  console.log('Set consent with custom mapping');
});

// Test 3: Integration usage
console.log('=== Testing Integration with Custom Purpose Mapping ===');
import('./SentryZarazIntegration.js').then(({ sentryZarazIntegration }) => {
  const customIntegration = sentryZarazIntegration({
    debug: true,
    timeout: 5000,
    purposeMapping: {
      functional: 'integration-test-functional',
      analytics: 'integration-test-analytics',
      marketing: 'integration-test-marketing',
      preferences: 'integration-test-preferences',
    }
  });

  console.log('Created integration with custom purpose mapping:', customIntegration);
});

console.log('Manual tests loaded. Check console for results.');
