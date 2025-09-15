import React, { useState } from 'react';
import ConsentManager from './components/ConsentManager';
import SentryStatus from './components/SentryStatus';
import SentryRecordingState from './components/SentryRecordingState';
import EventLogViewer from './components/EventLogViewer';
import ErrorBoundary from './components/ErrorBoundary';
import { getZaraz } from 'sentry-zaraz-consent-integration';
import { logGeneralEvent } from './lib/eventLogger';

// Import local zaraz initialization for development
import './lib/zaraz-local';

const App: React.FC = () => {
  const [isZarazAvailable, setIsZarazAvailable] = useState(false);

  // Check if Zaraz is available
  React.useEffect(() => {
    const checkZaraz = () => {
      const zaraz = getZaraz();
      const newIsZarazAvailable = !!zaraz;

      if (newIsZarazAvailable !== isZarazAvailable) {
        if (newIsZarazAvailable) {
          logGeneralEvent('Demo app started', { zarazDetected: true });
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
      <h1>Sentry Managed Component Demo</h1>

      <ErrorBoundary>
        <EventLogViewer />
        <SentryStatus isZarazAvailable={isZarazAvailable} />
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

export default App;
