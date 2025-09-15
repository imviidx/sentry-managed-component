import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithoutSentry from './pages/AppWithoutSentry';

// No Sentry initialization here - the managed component should handle it

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithoutSentry />
  </React.StrictMode>
);
