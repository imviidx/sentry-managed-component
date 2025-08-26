import React, { useState, useEffect } from 'react';
import {
  getZaraz,
  isSentryManagedComponentEnabled,
  ZARAZ_FUNCTIONAL_PURPOSE_ID,
} from '../lib/zaraz';

interface ConsentStatus {
  isZarazAvailable: boolean;
  isAPIReady: boolean;
  hasSentryConsent: boolean;
  allPurposes: Record<string, any>;
}

const ConsentManager: React.FC = () => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>({
    isZarazAvailable: false,
    isAPIReady: false,
    hasSentryConsent: false,
    allPurposes: {},
  });
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Check consent status periodically
    const checkConsentStatus = () => {
      const zaraz = getZaraz();
      const isZarazAvailable = !!zaraz;
      const isAPIReady = !!zaraz?.consent?.APIReady;
      const hasSentryConsent = isSentryManagedComponentEnabled();
      const allPurposes = zaraz?.consent?.purposes || {};

      setConsentStatus({
        isZarazAvailable,
        isAPIReady,
        hasSentryConsent,
        allPurposes,
      });

      let debugText = `Zaraz Consent Manager\n`;
      debugText += `Zaraz Available: ${isZarazAvailable ? '✅' : '❌'}\n`;
      debugText += `Consent API Ready: ${isAPIReady ? '✅' : '❌'}\n`;
      debugText += `Sentry Consent (${ZARAZ_FUNCTIONAL_PURPOSE_ID}): ${
        hasSentryConsent ? '✅' : '❌'
      }\n`;

      if (isAPIReady) {
        const allConsent = zaraz?.consent?.getAll() || {};
        debugText += `All Consent Status: ${JSON.stringify(
          allConsent,
          null,
          2
        )}\n`;
      }

      setDebugInfo(debugText);
    };

    // Initial check
    checkConsentStatus();

    // Check every second
    const interval = setInterval(checkConsentStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGrantConsent = () => {
    const zaraz = getZaraz();
    if (zaraz?.consent?.set) {
      zaraz.consent.set({ [ZARAZ_FUNCTIONAL_PURPOSE_ID]: true });
    }
  };

  const handleRevokeConsent = () => {
    const zaraz = getZaraz();
    if (zaraz?.consent?.set) {
      zaraz.consent.set({ [ZARAZ_FUNCTIONAL_PURPOSE_ID]: false });
    }
  };

  const handleShowConsentModal = () => {
    const zaraz = getZaraz();
    if (zaraz?.showConsentModal) {
      zaraz.showConsentModal();
    }
  };

  const simulateZarazConsent = () => {
    // Simulate Zaraz consent API for testing
    if (!(window as any).zaraz) {
      (window as any).zaraz = {
        consent: {
          APIReady: true,
          purposes: {
            [ZARAZ_FUNCTIONAL_PURPOSE_ID]: {
              id: ZARAZ_FUNCTIONAL_PURPOSE_ID,
              name: 'Functional',
              description: 'Essential website functionality',
              order: 1,
            },
          },
          get: (purposeId: string) => {
            return (window as any).__mockConsent?.[purposeId] || false;
          },
          set: (preferences: Record<string, boolean>) => {
            (window as any).__mockConsent = {
              ...(window as any).__mockConsent,
              ...preferences,
            };
          },
          getAll: () => {
            return (window as any).__mockConsent || {};
          },
          setAll: (status: boolean) => {
            (window as any).__mockConsent = {
              [ZARAZ_FUNCTIONAL_PURPOSE_ID]: status,
            };
          },
          getAllCheckboxes: () => {
            return (window as any).__mockConsent || {};
          },
          setCheckboxes: (preferences: Record<string, boolean>) => {
            (window as any).__mockConsent = {
              ...(window as any).__mockConsent,
              ...preferences,
            };
          },
          setAllCheckboxes: (status: boolean) => {
            (window as any).__mockConsent = {
              [ZARAZ_FUNCTIONAL_PURPOSE_ID]: status,
            };
          },
          sendQueuedEvents: () => {
            console.log('[Mock Zaraz] Sending queued events');
          },
          modal: false,
        },
        showConsentModal: () => {
          console.log('[Mock Zaraz] Showing consent modal');
        },
        track: () => {},
        set: () => {},
        ecommerce: () => {},
        identify: () => {},
        pageview: () => {},
        debug: () => {},
        disable: () => {},
        config: {},
      };

      // Initialize with no consent
      (window as any).__mockConsent = {
        [ZARAZ_FUNCTIONAL_PURPOSE_ID]: false,
      };
    }
  };

  return (
    <div
      style={{
        marginBottom: '2rem',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h2>Zaraz Consent Management</h2>
      </div>

      {/* Debug Information */}
      <div
        style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          color: '#6c757d',
        }}
      >
        <strong>Debug Info:</strong>
        <pre style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap' }}>
          {debugInfo}
        </pre>
      </div>

      {/* Simulation Controls */}
      {!consentStatus.isZarazAvailable && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={simulateZarazConsent}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '0.5rem',
            }}
          >
            Simulate Zaraz Consent
          </button>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            (Creates a mock Zaraz consent API for testing)
          </span>
        </div>
      )}

      {/* Consent Controls */}
      {consentStatus.isAPIReady && (
        <div style={{ marginBottom: '1rem' }}>
          <h3>Sentry Consent Controls</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={handleGrantConsent}
              disabled={consentStatus.hasSentryConsent}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: consentStatus.hasSentryConsent
                  ? '#6c757d'
                  : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: consentStatus.hasSentryConsent
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Grant Consent
            </button>
            <button
              onClick={handleRevokeConsent}
              disabled={!consentStatus.hasSentryConsent}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: !consentStatus.hasSentryConsent
                  ? '#6c757d'
                  : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !consentStatus.hasSentryConsent
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Revoke Consent
            </button>
            <button
              onClick={handleShowConsentModal}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Show Modal
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Current status:{' '}
            <strong>
              {consentStatus.hasSentryConsent ? 'GRANTED' : 'DENIED'}
            </strong>
          </p>
        </div>
      )}

      {/* Available Purposes */}
      {Object.keys(consentStatus.allPurposes).length > 0 && (
        <div>
          <h3>Available Consent Purposes</h3>
          {Object.entries(consentStatus.allPurposes).map(
            ([id, purpose]: [string, any]) => (
              <div
                key={id}
                style={{
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                }}
              >
                <strong>{purpose.name}</strong> ({id})
                <br />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  {purpose.description}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ConsentManager;
