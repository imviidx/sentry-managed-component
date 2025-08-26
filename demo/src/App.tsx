import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import ConsentManager from './components/ConsentManager';

const App: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleError = () => {
    const error = new Error(`This is a test error #${Math.random()}`);
    Sentry.captureException(error);
    throw error;
  };

  const handlePerformance = () => {
    return Sentry.startSpan({ name: 'performance-test' }, () => {
      performance.mark('start');
      // Simulate some work
      for (let i = 0; i < 1000000; i++) {
        Math.random();
      }
      performance.mark('end');
      performance.measure('work', 'start', 'end');
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Sentry Managed Component Demo</h1>

      <ConsentManager />

      <div style={{ marginBottom: '2rem' }}>
        <h2>Error Tracking Demo</h2>
        <button onClick={handleError} style={{ padding: '0.5rem 1rem' }}>
          Trigger Error
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Performance Monitoring Demo</h2>
        <button onClick={handlePerformance} style={{ padding: '0.5rem 1rem' }}>
          Run Performance Test
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Session Replay Demo</h2>
        <p>Try interacting with this counter:</p>
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{ padding: '0.5rem 1rem' }}
        >
          Count: {count}
        </button>
      </div>

      <div>
        <h2>Profiling Demo</h2>
        <p>Check the browser console for performance marks</p>
      </div>
    </div>
  );
};

export default App;
