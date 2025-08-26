import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { isSentryManagedComponentEnabledDemo } from '../lib/zaraz';
import { logSentryEvent } from '../lib/eventLogger';

interface SentryRecordingStateProps {
  isZarazAvailable: boolean;
}

interface RecordingState {
  isActive: boolean;
  sessionReplay: boolean;
  performance: boolean;
  errors: boolean;
  breadcrumbs: boolean;
  userContext: boolean;
}

const SentryRecordingState: React.FC<SentryRecordingStateProps> = ({
  isZarazAvailable,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isActive: false,
    sessionReplay: false,
    performance: false,
    errors: false,
    breadcrumbs: false,
    userContext: false,
  });

  const [sentryClient, setSentryClient] = useState<any>(null);

  useEffect(() => {
    const checkRecordingState = () => {
      try {
        const hasSentryConsent = isSentryManagedComponentEnabledDemo();
        const client = (Sentry as any).getCurrentHub?.()?.getClient?.();

        setSentryClient(client);

        if (!hasSentryConsent || !client) {
          setRecordingState({
            isActive: false,
            sessionReplay: false,
            performance: false,
            errors: false,
            breadcrumbs: false,
            userContext: false,
          });
          return;
        }

        // Check what integrations are active
        const integrations = client.getIntegrations?.() || {};

        const newState: RecordingState = {
          isActive: hasSentryConsent,
          sessionReplay: !!(integrations.Replay || integrations.SessionReplay),
          performance: !!integrations.BrowserTracing,
          errors: hasSentryConsent, // Always true if Sentry is active
          breadcrumbs: hasSentryConsent, // Always true if Sentry is active
          userContext: hasSentryConsent, // Always true if Sentry is active
        };

        setRecordingState(newState);
      } catch (error) {
        logSentryEvent('Error checking recording state', {
          error: error instanceof Error ? error.message : String(error),
        });
        console.error('Error checking Sentry recording state:', error);
      }
    };

    checkRecordingState();

    if (isZarazAvailable) {
      const interval = setInterval(checkRecordingState, 2000);
      return () => clearInterval(interval);
    }
  }, [isZarazAvailable]);

  const testUserContext = () => {
    try {
      if (recordingState.isActive) {
        const testUser = {
          id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          email: 'demo@example.com',
          username: 'demo_user',
        };

        Sentry.setUser(testUser);
        logSentryEvent('User context set', { user: testUser });

        // Also set some custom context
        Sentry.setContext('demo', {
          feature: 'user-context-test',
          timestamp: new Date().toISOString(),
        });

        alert(
          '✅ User context and custom context set successfully! Check Sentry dashboard.'
        );
      } else {
        logSentryEvent('User context blocked', { reason: 'No consent' });
        alert('❌ User context blocked - no Sentry consent');
      }
    } catch (error) {
      logSentryEvent('User context error', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testCustomEvent = () => {
    try {
      if (recordingState.isActive) {
        Sentry.captureMessage('Custom demo event', 'info');
        logSentryEvent('Custom message sent', { level: 'info' });
        alert('✅ Custom message sent to Sentry!');
      } else {
        logSentryEvent('Custom event blocked', { reason: 'No consent' });
        alert('❌ Custom event blocked - no Sentry consent');
      }
    } catch (error) {
      logSentryEvent('Custom event error', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const getStatusIcon = (isEnabled: boolean) => (isEnabled ? '🟢' : '🔴');
  const getStatusText = (isEnabled: boolean) =>
    isEnabled ? 'Active' : 'Inactive';
  const getStatusColor = (isEnabled: boolean) =>
    isEnabled ? '#28a745' : '#dc3545';

  return (
    <div
      style={{
        padding: '1rem',
        border: `1px solid ${recordingState.isActive ? '#28a745' : '#dc3545'}`,
        borderRadius: '4px',
        backgroundColor: recordingState.isActive ? '#d4edda' : '#f8d7da',
        marginBottom: '1rem',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1rem' }}>
                {getStatusIcon(recordingState.errors)}
              </span>
              <div>
                <strong>Error Tracking</strong>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: getStatusColor(recordingState.errors),
                  }}
                >
                  {getStatusText(recordingState.errors)}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1rem' }}>
                {getStatusIcon(recordingState.performance)}
              </span>
              <div>
                <strong>Performance</strong>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: getStatusColor(recordingState.performance),
                  }}
                >
                  {getStatusText(recordingState.performance)}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1rem' }}>
                {getStatusIcon(recordingState.sessionReplay)}
              </span>
              <div>
                <strong>Session Replay</strong>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: getStatusColor(recordingState.sessionReplay),
                  }}
                >
                  {getStatusText(recordingState.sessionReplay)}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1rem' }}>
                {getStatusIcon(recordingState.breadcrumbs)}
              </span>
              <div>
                <strong>Breadcrumbs</strong>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: getStatusColor(recordingState.breadcrumbs),
                  }}
                >
                  {getStatusText(recordingState.breadcrumbs)}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1rem' }}>
                {getStatusIcon(recordingState.userContext)}
              </span>
              <div>
                <strong>User Context</strong>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: getStatusColor(recordingState.userContext),
                  }}
                >
                  {getStatusText(recordingState.userContext)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Tests */}
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
            Additional Sentry Tests
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={testUserContext}
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
              Set User Context
            </button>
            <button
              onClick={testCustomEvent}
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
              Send Custom Event
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: '0.85rem',
          color: '#666',
          borderTop: '1px solid #dee2e6',
          paddingTop: '0.5rem',
          marginTop: '0.5rem',
        }}
      >
        <strong>Overall Status:</strong>{' '}
        <span
          style={{
            color: recordingState.isActive ? '#28a745' : '#dc3545',
            fontWeight: 'bold',
          }}
        >
          {recordingState.isActive
            ? '🟢 Recording Active'
            : '🔴 Recording Blocked'}
        </span>
        {sentryClient && (
          <span style={{ marginLeft: '1rem' }}>
            Sentry Client:{' '}
            {sentryClient.getOptions?.()?.dsn
              ? '✅ Connected'
              : '❌ Not Connected'}
          </span>
        )}
      </div>
    </div>
  );
};

export default SentryRecordingState;
