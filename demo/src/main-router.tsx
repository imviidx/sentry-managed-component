import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { sentryZarazIntegration } from './SentryZarazIntegration';
import AppWithSentry from './pages/AppWithSentry';
import AppWithoutSentry from './pages/AppWithoutSentry';

// Initialize Sentry for the "with Sentry" version
Sentry.init({
  dsn: 'https://5a69d530abb9e2f033b4891b9b67d73c@o4509374586028032.ingest.us.sentry.io/4509477123915776',
  integrations: [
    sentryZarazIntegration({
      timeout: 10000, // Wait up to 10 seconds for consent
      debug: false, // Disable debug logging for production
      // Purpose mapping using your Zaraz configuration:
      purposeMapping: {
        functional: 'lFDj', // Essential/Necessary
        analytics: 'yybb', // Performance & Statistics
        marketing: 'rlae', // Advertising & Personalization
        preferences: 'hfWn', // Personalization & Settings
      },
    }),
    Sentry.browserTracingIntegration(),
  ],
  sendDefaultPii: true,
  environment: 'production',
  tracesSampleRate: 0.1, // Reduced sample rate for production
});

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<AppWithSentry />} />
        <Route path='/with-sentry' element={<AppWithSentry />} />
        <Route path='/without-sentry' element={<AppWithoutSentry />} />
      </Routes>
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>} showDialog>
      <AppRouter />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
