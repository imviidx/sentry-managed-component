import React, { useState, useEffect } from 'react';
import { eventLogger } from '../lib/eventLogger';

interface LogEvent {
  type: 'sentry' | 'zaraz' | 'consent' | 'general';
  event: string;
  details?: any;
  timestamp: string;
}

const EventLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = eventLogger.subscribe(setLogs);
    setLogs(eventLogger.getLogs());
    return unsubscribe;
  }, []);

  const typeColors = {
    sentry: '#e06b47',
    zaraz: '#1f4788',
    consent: '#28a745',
    general: '#6c757d',
  };

  const typeBgColors = {
    sentry: '#fdf2f0',
    zaraz: '#f0f4f8',
    consent: '#f0f8f4',
    general: '#f8f9fa',
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div
      style={{
        marginBottom: '2rem',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        backgroundColor: '#fff',
      }}
    >
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 style={{ margin: 0, fontSize: '1rem' }}>
          Event Log ({logs.length})
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              eventLogger.clear();
            }}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <span style={{ fontSize: '0.9rem' }}>{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {isExpanded && (
        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '0.5rem',
          }}
        >
          {logs.length === 0 ? (
            <div
              style={{
                padding: '1rem',
                textAlign: 'center',
                color: '#6c757d',
                fontStyle: 'italic',
              }}
            >
              No events logged yet
            </div>
          ) : (
            logs
              .slice()
              .reverse()
              .map((log, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: typeBgColors[log.type],
                    border: `1px solid ${typeColors[log.type]}`,
                    borderRadius: '3px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: typeColors[log.type],
                          color: 'white',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        {log.type}
                      </span>
                      <strong>{log.event}</strong>
                    </div>
                    <span style={{ color: '#6c757d', fontSize: '0.75rem' }}>
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                  {log.details && (
                    <div
                      style={{
                        marginTop: '0.25rem',
                        padding: '0.25rem',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderRadius: '2px',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#495057',
                        wordBreak: 'break-all',
                      }}
                    >
                      {typeof log.details === 'object'
                        ? JSON.stringify(log.details, null, 2)
                        : String(log.details)}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default EventLogViewer;
