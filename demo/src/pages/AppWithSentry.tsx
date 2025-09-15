import React, { useState } from 'react';
import ConsentManager from '../components/ConsentManager';
import SentryStatus from '../components/SentryStatus';
import SentryRecordingState from '../components/SentryRecordingState';
import EventLogViewer from '../components/EventLogViewer';
import ErrorBoundary from '../components/ErrorBoundary';
import { getZaraz } from '../lib/zaraz';
import { logGeneralEvent } from '../lib/eventLogger';

const AppWithSentry: React.FC = () => {
  const [isZarazAvailable, setIsZarazAvailable] = useState(false);

  // Check if Zaraz is available
  React.useEffect(() => {
    const checkZaraz = () => {
      const zaraz = getZaraz();
      const newIsZarazAvailable = !!zaraz;

      if (newIsZarazAvailable !== isZarazAvailable) {
        if (newIsZarazAvailable) {
          logGeneralEvent('Demo app started', {
            zarazDetected: true,
            page: 'with-sentry',
          });
        }
        setIsZarazAvailable(newIsZarazAvailable);
      }
    };

    checkZaraz();
    const interval = setInterval(checkZaraz, 1000);
    return () => clearInterval(interval);
  }, [isZarazAvailable]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#e8f5e8',
          borderRadius: '8px',
        }}
      >
        <div>
          <h1>Sentry Managed Component Demo</h1>
          <p style={{ margin: 0, color: '#2d5a2d', fontWeight: 'bold' }}>
            ✅ With Sentry Pre-initialized
          </p>
        </div>
        <a
          href='/without-sentry'
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          View Without Sentry →
        </a>
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
        <ul>
          <li>Sentry is pre-initialized in the application</li>
          <li>The Managed Component detects the existing Sentry instance</li>
          <li>Consent changes will update the existing Sentry configuration</li>
        </ul>
      </div>

      <ErrorBoundary>
        <EventLogViewer />
        <ConsentManager />
      </ErrorBoundary>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Sentry Recording State</h2>
        <p>Current Sentry recording capabilities based on consent status:</p>
        <SentryRecordingState isZarazAvailable={isZarazAvailable} />
      </div>
    </div>
  );
};

export default AppWithSentry;
