import React, { useState } from 'react';
import ConsentManager from './components/ConsentManager';
import SentryStatus from './components/SentryStatus';
import SentryRecordingState from './components/SentryRecordingState';
import EventLogViewer from './components/EventLogViewer';
import ErrorBoundary from './components/ErrorBoundary';
import { getZaraz } from './lib/zaraz';
import { logGeneralEvent } from './lib/eventLogger';

interface AppProps {
  hasSentryPreInitialized?: boolean;
}

const App: React.FC<AppProps> = ({ hasSentryPreInitialized = true }) => {
  const [isZarazAvailable, setIsZarazAvailable] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    'with-sentry' | 'without-sentry'
  >(hasSentryPreInitialized ? 'with-sentry' : 'without-sentry');

  // Check if Zaraz is available
  React.useEffect(() => {
    const checkZaraz = () => {
      const zaraz = getZaraz();
      const newIsZarazAvailable = !!zaraz;

      if (newIsZarazAvailable !== isZarazAvailable) {
        if (newIsZarazAvailable) {
          logGeneralEvent('Demo app started', {
            zarazDetected: true,
            page: currentPage,
            hasSentryPreInitialized,
          });
        }
        setIsZarazAvailable(newIsZarazAvailable);
      }
    };

    checkZaraz();
    const interval = setInterval(checkZaraz, 1000);
    return () => clearInterval(interval);
  }, [isZarazAvailable, currentPage, hasSentryPreInitialized]);

  // Function to trigger an error to test Sentry initialization
  const triggerError = () => {
    throw new Error(
      'Test error to verify Sentry initialization via Managed Component'
    );
  };

  const switchPage = (page: 'with-sentry' | 'without-sentry') => {
    setCurrentPage(page);
    // In a real scenario, this would trigger a page reload or navigation
    window.location.href = page === 'with-sentry' ? '/' : '/without-sentry';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: hasSentryPreInitialized ? '#e8f5e8' : '#fff3cd',
          borderRadius: '8px',
        }}
      >
        <div>
          <h1>Sentry Managed Component Demo</h1>
          <p
            style={{
              margin: 0,
              color: hasSentryPreInitialized ? '#2d5a2d' : '#856404',
              fontWeight: 'bold',
            }}
          >
            {hasSentryPreInitialized
              ? '✅ With Sentry Pre-initialized'
              : '⚠️ Without Pre-initialized Sentry'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => switchPage('with-sentry')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: hasSentryPreInitialized ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            disabled={hasSentryPreInitialized}
          >
            With Sentry
          </button>
          <button
            onClick={() => switchPage('without-sentry')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: !hasSentryPreInitialized ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            disabled={!hasSentryPreInitialized}
          >
            Without Sentry
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}
      >
        <p>
          <strong>This page demonstrates:</strong>
        </p>
        {hasSentryPreInitialized ? (
          <ul>
            <li>Sentry is pre-initialized in the application</li>
            <li>The Managed Component detects the existing Sentry instance</li>
            <li>
              Consent changes will update the existing Sentry configuration
            </li>
          </ul>
        ) : (
          <>
            <ul>
              <li>No Sentry is pre-initialized in the application</li>
              <li>
                The Managed Component should initialize Sentry automatically
                using the DSN from settings
              </li>
              <li>
                Consent changes will configure the newly initialized Sentry
                instance
              </li>
            </ul>
            <div
              style={{
                marginTop: '1rem',
                padding: '0.5rem',
                backgroundColor: '#d4edda',
                borderRadius: '4px',
              }}
            >
              <strong>Test:</strong> Click the button below to trigger an error
              and verify Sentry is working:
              <br />
              <button
                onClick={triggerError}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Trigger Test Error
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Sentry Recording State</h2>
        <p>Current Sentry recording capabilities based on consent status:</p>
        <SentryRecordingState isZarazAvailable={isZarazAvailable} />
      </div>
    </div>
  );
};

export default App;
