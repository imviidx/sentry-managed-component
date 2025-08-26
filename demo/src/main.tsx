import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { sentryZarazIntegration } from './SentryZarazIntegration';
import App from './App';

Sentry.init({
  dsn: 'https://5a69d530abb9e2f033b4891b9b67d73c@o4509374586028032.ingest.us.sentry.io/4509477123915776',
  integrations: [
    sentryZarazIntegration({
      timeout: 10000, // Wait up to 10 seconds for consent
      debug: true, // Enable debug logging
    }),
    Sentry.browserTracingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ['error'] }),
  ],
  sendDefaultPii: true,
  environment: 'development',
  tracesSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>} showDialog>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
