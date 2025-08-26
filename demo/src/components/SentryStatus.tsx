import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import {
  isSentryManagedComponentEnabled,
  getConsentStatus,
  ZARAZ_FUNCTIONAL_PURPOSE_ID,
} from '../lib/zaraz';
import { logSentryEvent } from '../lib/eventLogger';

interface SentryStatusProps {
  isZarazAvailable: boolean;
}

const SentryStatus: React.FC<SentryStatusProps> = ({ isZarazAvailable }) => {
  const [hasSentryConsent, setHasSentryConsent] = useState(false);
  const [functionalConsent, setFunctionalConsent] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Log when Sentry starts up
    if (!isInitialized && isZarazAvailable) {
      logSentryEvent('Sentry initialization detected', {
        zarazAvailable: true,
      });
      setIsInitialized(true);
    }
  }, [isZarazAvailable, isInitialized]);

  useEffect(() => {
    const checkSentryStatus = () => {
      try {
        const prevHasSentryConsent = hasSentryConsent;
        const newHasSentryConsent = isSentryManagedComponentEnabled();
        const consentStatusFromZaraz = getConsentStatus();
        const newFunctionalConsent = consentStatusFromZaraz.functional ?? false;

        // Log state changes
        if (prevHasSentryConsent !== newHasSentryConsent) {
          if (newHasSentryConsent) {
            logSentryEvent('Sentry started', {
              functionalConsent: newFunctionalConsent,
              purposeId: ZARAZ_FUNCTIONAL_PURPOSE_ID,
            });
          } else {
            logSentryEvent('Sentry stopped', {
              reason: 'Functional consent revoked',
              purposeId: ZARAZ_FUNCTIONAL_PURPOSE_ID,
            });
          }
        }

        setHasSentryConsent(newHasSentryConsent);
        setFunctionalConsent(newFunctionalConsent);
      } catch (error) {
        logSentryEvent('Error checking Sentry status', {
          error: error instanceof Error ? error.message : String(error),
        });
        console.error('Error checking Sentry status:', error);
        setHasSentryConsent(false);
        setFunctionalConsent(false);
      }
    };

    // Initial check
    checkSentryStatus();

    // Check every second if Zaraz is available
    if (isZarazAvailable) {
      const interval = setInterval(checkSentryStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [isZarazAvailable, hasSentryConsent]);

  const handleError = () => {
    try {
      const error = new Error(`Test error from Sentry demo #${Math.random()}`);
      logSentryEvent('Error triggered manually', {
        errorMessage: error.message,
        sentryEnabled: hasSentryConsent,
      });

      if (hasSentryConsent) {
        Sentry.captureException(error);
        logSentryEvent('Sentry event fired', {
          type: 'exception',
          message: error.message,
        });
      } else {
        logSentryEvent('Zaraz Sentry Integration blocks event', {
          reason: 'No functional consent',
          eventType: 'exception',
        });
      }

      throw error;
    } catch (error) {
      // Error will be caught by ErrorBoundary or browser
    }
  };

  const handlePerformance = () => {
    try {
      logSentryEvent('Performance test triggered', {
        sentryEnabled: hasSentryConsent,
      });

      return Sentry.startSpan({ name: 'performance-test' }, () => {
        performance.mark('start');
        // Simulate some work
        for (let i = 0; i < 1000000; i++) {
          Math.random();
        }
        performance.mark('end');
        performance.measure('work', 'start', 'end');

        if (hasSentryConsent) {
          logSentryEvent('Sentry event fired', {
            type: 'performance',
            spanName: 'performance-test',
          });
        } else {
          logSentryEvent('Zaraz Sentry Integration blocks event', {
            reason: 'No functional consent',
            eventType: 'performance',
          });
        }
      });
    } catch (error) {
      logSentryEvent('Performance test error', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleAddBreadcrumb = () => {
    try {
      const breadcrumb = {
        message: `User breadcrumb #${Math.random()}`,
        level: 'info' as const,
        timestamp: Date.now() / 1000,
      };

      logSentryEvent('Breadcrumb triggered', {
        ...breadcrumb,
        sentryEnabled: hasSentryConsent,
      });

      if (hasSentryConsent) {
        Sentry.addBreadcrumb(breadcrumb);
        logSentryEvent('Sentry event fired', {
          type: 'breadcrumb',
          message: breadcrumb.message,
        });
      } else {
        logSentryEvent('Zaraz Sentry Integration blocks event', {
          reason: 'No functional consent',
          eventType: 'breadcrumb',
        });
      }
    } catch (error) {
      logSentryEvent('Breadcrumb error', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div
      style={{
        marginBottom: '2rem',
        padding: '1rem',
        border: `1px solid ${hasSentryConsent ? '#28a745' : '#dc3545'}`,
        borderRadius: '4px',
        backgroundColor: hasSentryConsent ? '#d4edda' : '#f8d7da',
      }}
    >
      <h2>Sentry Managed Component Status</h2>

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
          <strong>Sentry Enabled:</strong>{' '}
          <span
            style={{
              color: hasSentryConsent ? '#28a745' : '#dc3545',
            }}
          >
            {hasSentryConsent ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Functional Consent:</strong>{' '}
          <span
            style={{
              color: functionalConsent ? '#28a745' : '#dc3545',
            }}
          >
            {functionalConsent ? '✅ Granted' : '❌ Denied'}
          </span>
        </div>
        <div>
          <strong>Purpose ID:</strong>{' '}
          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {ZARAZ_FUNCTIONAL_PURPOSE_ID}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
        <strong>Status:</strong>{' '}
        <span
          style={{
            color: hasSentryConsent ? '#28a745' : '#dc3545',
            fontWeight: 'bold',
          }}
        >
          {hasSentryConsent ? 'ACTIVE' : 'INACTIVE'}
        </span>
        {!isZarazAvailable && (
          <span style={{ marginLeft: '0.5rem', color: '#856404' }}>
            (Zaraz not available)
          </span>
        )}
      </p>

      {/* Sentry Demo Controls */}
      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
          Sentry Demo Controls
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleError}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Trigger Error
          </button>
          <button
            onClick={handlePerformance}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Performance Test
          </button>
          <button
            onClick={handleAddBreadcrumb}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add Breadcrumb
          </button>
        </div>
        <p
          style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0 0' }}
        >
          {hasSentryConsent
            ? '✅ Events will be sent to Sentry'
            : '❌ Events blocked by consent management'}
        </p>
      </div>
    </div>
  );
};

export default SentryStatus;
