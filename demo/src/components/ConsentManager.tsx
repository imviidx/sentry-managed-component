import React, { useState, useEffect } from 'react';
import {
  getZaraz,
  isSentryManagedComponentEnabled,
  getConsentStatus,
  setConsent,
  ZARAZ_FUNCTIONAL_PURPOSE_ID,
} from '../lib/zaraz';

interface ConsentStatus {
  isZarazAvailable: boolean;
  isAPIReady: boolean;
  hasSentryConsent: boolean;
  consentState: {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
  allPurposes: Record<string, any>;
}

const ConsentManager: React.FC = () => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>({
    isZarazAvailable: false,
    isAPIReady: false,
    hasSentryConsent: false,
    consentState: {
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false,
    },
    allPurposes: {},
  });

  useEffect(() => {
    // Check consent status periodically
    const checkConsentStatus = () => {
      const zaraz = getZaraz();
      const isZarazAvailable = !!zaraz;
      const isAPIReady = !!zaraz?.consent?.APIReady;
      const hasSentryConsent = isSentryManagedComponentEnabled();
      const consentStatusFromZaraz = getConsentStatus();
      const consentState = {
        functional: consentStatusFromZaraz.functional ?? false,
        analytics: consentStatusFromZaraz.analytics ?? false,
        marketing: consentStatusFromZaraz.marketing ?? false,
        preferences: consentStatusFromZaraz.preferences ?? false,
      };
      const allPurposes = zaraz?.consent?.purposes || {};

      setConsentStatus({
        isZarazAvailable,
        isAPIReady,
        hasSentryConsent,
        consentState,
        allPurposes,
      });
    };

    // Initial check
    checkConsentStatus();

    // Check every second
    const interval = setInterval(checkConsentStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGrantAllConsent = () => {
    setConsent({
      functional: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const handleRevokeAllConsent = () => {
    setConsent({
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const handleToggleConsent = (
    type: keyof typeof consentStatus.consentState
  ) => {
    setConsent({
      ...consentStatus.consentState,
      [type]: !consentStatus.consentState[type],
    });
  };

  const handleShowConsentModal = () => {
    const zaraz = getZaraz();
    if (zaraz?.showConsentModal) {
      zaraz.showConsentModal();
    }
  };

  // Don't render anything if Zaraz is not available
  if (!consentStatus.isZarazAvailable) {
    return (
      <div
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          backgroundColor: '#fff3cd',
        }}
      >
        <h2>Zaraz Consent Management</h2>
        <p style={{ color: '#856404', margin: 0 }}>
          ⚠️ Zaraz is not available. Consent management is disabled.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginBottom: '2rem',
        padding: '1rem',
        border: '1px solid #28a745',
        borderRadius: '4px',
        backgroundColor: '#d4edda',
      }}
    >
      <h2>Zaraz Consent Management</h2>

      {/* Status Information */}
      <div
        style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Zaraz Available:</strong>{' '}
          <span
            style={{
              color: consentStatus.isZarazAvailable ? '#28a745' : '#dc3545',
            }}
          >
            {consentStatus.isZarazAvailable ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Consent API Ready:</strong>{' '}
          <span
            style={{ color: consentStatus.isAPIReady ? '#28a745' : '#dc3545' }}
          >
            {consentStatus.isAPIReady ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Sentry Consent (Functional):</strong>{' '}
          <span
            style={{
              color: consentStatus.consentState.functional
                ? '#28a745'
                : '#dc3545',
            }}
          >
            {consentStatus.consentState.functional ? '✅ Granted' : '❌ Denied'}
          </span>
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Analytics Consent:</strong>{' '}
          <span
            style={{
              color: consentStatus.consentState.analytics
                ? '#28a745'
                : '#dc3545',
            }}
          >
            {consentStatus.consentState.analytics ? '✅ Granted' : '❌ Denied'}
          </span>
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Marketing Consent:</strong>{' '}
          <span
            style={{
              color: consentStatus.consentState.marketing
                ? '#28a745'
                : '#dc3545',
            }}
          >
            {consentStatus.consentState.marketing ? '✅ Granted' : '❌ Denied'}
          </span>
        </div>
        <div>
          <strong>Preferences Consent:</strong>{' '}
          <span
            style={{
              color: consentStatus.consentState.preferences
                ? '#28a745'
                : '#dc3545',
            }}
          >
            {consentStatus.consentState.preferences
              ? '✅ Granted'
              : '❌ Denied'}
          </span>
        </div>
      </div>

      {/* Consent Controls - Only show if API is ready */}
      {consentStatus.isAPIReady ? (
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
            Consent Controls
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={handleGrantAllConsent}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Grant All Consent
            </button>
            <button
              onClick={handleRevokeAllConsent}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Revoke All Consent
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
              Show Consent Modal
            </button>
          </div>

          {/* Individual consent toggles */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              Individual Controls
            </h4>
            {Object.entries(consentStatus.consentState).map(
              ([type, granted]) => (
                <div key={type} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() =>
                      handleToggleConsent(
                        type as keyof typeof consentStatus.consentState
                      )
                    }
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: granted ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                      minWidth: '80px',
                    }}
                  >
                    {granted ? 'Revoke' : 'Grant'}
                  </button>
                  <span
                    style={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                  >
                    {type}
                  </span>
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      color: granted ? '#28a745' : '#dc3545',
                    }}
                  >
                    {granted ? '✅' : '❌'}
                  </span>
                </div>
              )
            )}
          </div>

          <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
            Overall status:{' '}
            <strong
              style={{
                color: consentStatus.hasSentryConsent ? '#28a745' : '#dc3545',
              }}
            >
              {consentStatus.hasSentryConsent
                ? 'FUNCTIONAL ENABLED'
                : 'FUNCTIONAL DISABLED'}
            </strong>
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#856404', margin: 0 }}>
            ⏳ Waiting for Zaraz consent API to become ready...
          </p>
        </div>
      )}

      {/* Available Purposes - Only show if there are purposes */}
      {Object.keys(consentStatus.allPurposes).length > 0 && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
            Available Consent Purposes
          </h3>
          {Object.entries(consentStatus.allPurposes).map(
            ([id, purpose]: [string, any]) => (
              <div
                key={id}
                style={{
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border:
                    id === ZARAZ_FUNCTIONAL_PURPOSE_ID
                      ? '2px solid #007bff'
                      : '1px solid #dee2e6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{purpose.name || id}</strong>
                    {id === ZARAZ_FUNCTIONAL_PURPOSE_ID && (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.8rem',
                          color: '#007bff',
                          fontWeight: 'bold',
                        }}
                      >
                        (Sentry)
                      </span>
                    )}
                    <br />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      ID: {id}
                    </span>
                    {purpose.description && (
                      <>
                        <br />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {purpose.description}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ConsentManager;
