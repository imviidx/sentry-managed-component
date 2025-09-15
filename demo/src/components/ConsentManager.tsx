import React, { useState, useEffect } from 'react';
import {
  getZaraz,
  getConsentStatusDemo,
  DEMO_PURPOSE_MAPPING,
} from '../lib/zaraz';
import { logZarazEvent, logConsentEvent } from '../lib/eventLogger';

interface ConsentStatus {
  isZarazAvailable: boolean;
  isAPIReady: boolean;
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
    consentState: {
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false,
    },
    allPurposes: {},
  });
  const [isZarazInitialized, setIsZarazInitialized] = useState(false);

  useEffect(() => {
    // Check consent status periodically
    const checkConsentStatus = () => {
      try {
        const zaraz = getZaraz();
        const isZarazAvailable = !!zaraz;
        const isAPIReady = !!zaraz?.consent?.APIReady;

        // Log Zaraz initialization
        if (isZarazAvailable && !isZarazInitialized) {
          logZarazEvent('Zaraz initialized', {
            apiReady: isAPIReady,
            hasConsentAPI: !!zaraz?.consent,
          });
          setIsZarazInitialized(true);
        }

        // Log API readiness change
        if (
          isAPIReady &&
          consentStatus.isZarazAvailable &&
          !consentStatus.isAPIReady
        ) {
          logZarazEvent('Zaraz consent API ready', {
            purposesCount: Object.keys(zaraz?.consent?.purposes || {}).length,
          });
        }

        const consentStatusFromZaraz = getConsentStatusDemo();
        const prevConsentState = consentStatus.consentState;
        const consentState = {
          functional: consentStatusFromZaraz.functional ?? false,
          analytics: consentStatusFromZaraz.analytics ?? false,
          marketing: consentStatusFromZaraz.marketing ?? false,
          preferences: consentStatusFromZaraz.preferences ?? false,
        };

        // Log consent changes
        Object.entries(consentState).forEach(([type, granted]) => {
          const prevGranted =
            prevConsentState[type as keyof typeof prevConsentState];
          if (prevGranted !== granted && consentStatus.isZarazAvailable) {
            logConsentEvent(`Consent updated`, {
              type,
              granted,
              changed: 'automatic',
            });
          }
        });

        const allPurposes = zaraz?.consent?.purposes || {};

        // Debug log to help identify issues
        if (process.env.NODE_ENV === 'development') {
          console.debug('Zaraz consent status:', {
            isZarazAvailable,
            isAPIReady,
            consentState,
            allPurposes:
              Object.keys(allPurposes).length > 0 ? allPurposes : 'empty',
          });
        }

        setConsentStatus({
          isZarazAvailable,
          isAPIReady,
          consentState,
          allPurposes,
        });
      } catch (error) {
        console.error('Error checking consent status:', error);
        // Set safe defaults on error
        setConsentStatus((prev) => ({
          ...prev,
          isZarazAvailable: false,
          isAPIReady: false,
          allPurposes: {},
        }));
      }
    };

    // Initial check
    checkConsentStatus();

    // Check every second
    const interval = setInterval(checkConsentStatus, 1000);

    return () => clearInterval(interval);
  }, [
    consentStatus.isZarazAvailable,
    consentStatus.isAPIReady,
    consentStatus.consentState,
    isZarazInitialized,
  ]);

  const handleShowConsentModal = () => {
    const zaraz = getZaraz();
    if (zaraz?.showConsentModal) {
      logConsentEvent('Consent modal shown', { trigger: 'manual' });
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
          <strong>Functional Consent:</strong>{' '}
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
            ([id, purpose]: [string, any]) => {
              try {
                // Safely extract purpose information
                const purposeName =
                  typeof purpose === 'object' &&
                  purpose !== null &&
                  purpose.name
                    ? String(purpose.name)
                    : typeof purpose === 'string'
                      ? purpose
                      : id;

                const purposeDescription =
                  typeof purpose === 'object' &&
                  purpose !== null &&
                  purpose.description
                    ? String(purpose.description)
                    : null;

                // Get current consent status for this purpose
                const purposeConsent =
                  id === DEMO_PURPOSE_MAPPING.functional
                    ? consentStatus.consentState.functional
                    : purpose?.category === 'analytics'
                      ? consentStatus.consentState.analytics
                      : purpose?.category === 'marketing'
                        ? consentStatus.consentState.marketing
                        : purpose?.category === 'preferences'
                          ? consentStatus.consentState.preferences
                          : false;

                return (
                  <div
                    key={id}
                    style={{
                      marginBottom: '0.75rem',
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border:
                        id === DEMO_PURPOSE_MAPPING.functional
                          ? '2px solid #007bff'
                          : '1px solid #dee2e6',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <strong style={{ fontSize: '1rem', color: '#333' }}>
                          {purposeName}
                        </strong>
                        <span
                          style={{
                            padding: '0.15rem 0.4rem',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            backgroundColor: purposeConsent
                              ? '#28a745'
                              : '#dc3545',
                            color: 'white',
                          }}
                        >
                          {purposeConsent ? 'GRANTED' : 'DENIED'}
                        </span>
                        {id === DEMO_PURPOSE_MAPPING.functional && (
                          <span
                            style={{
                              padding: '0.15rem 0.4rem',
                              fontSize: '0.7rem',
                              color: '#007bff',
                              backgroundColor: '#e3f2fd',
                              borderRadius: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            SENTRY
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#666',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <strong>Purpose ID:</strong>{' '}
                        <code
                          style={{
                            backgroundColor: '#e9ecef',
                            padding: '0.15rem 0.3rem',
                            borderRadius: '3px',
                            fontSize: '0.75rem',
                          }}
                        >
                          {id}
                        </code>
                      </div>
                      {purposeDescription && (
                        <div
                          style={{
                            fontSize: '0.9rem',
                            color: '#555',
                            lineHeight: '1.4',
                            fontStyle: 'italic',
                          }}
                        >
                          {purposeDescription}
                        </div>
                      )}
                    </div>
                  </div>
                );
              } catch (error) {
                console.error(`Error rendering purpose ${id}:`, error, purpose);
                return (
                  <div
                    key={id}
                    style={{
                      marginBottom: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#f8d7da',
                      borderRadius: '4px',
                      border: '1px solid #f5c6cb',
                    }}
                  >
                    <strong style={{ color: '#721c24' }}>
                      Error rendering purpose: {String(id)}
                    </strong>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: '#721c24' }}>
                      Check console for details
                    </span>
                  </div>
                );
              }
            }
          )}
        </div>
      )}
    </div>
  );
};

export default ConsentManager;
