interface LogEvent {
  type: 'sentry' | 'zaraz' | 'consent' | 'general';
  event: string;
  details?: any;
  timestamp: string;
}

class EventLogger {
  private logs: LogEvent[] = [];
  private listeners: ((logs: LogEvent[]) => void)[] = [];

  log(type: LogEvent['type'], event: string, details?: any) {
    const logEntry: LogEvent = {
      type,
      event,
      details,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Console log with color coding
    const colors = {
      sentry: '#e06b47', // Sentry orange
      zaraz: '#1f4788', // Cloudflare blue
      consent: '#28a745', // Green
      general: '#6c757d', // Gray
    };

    console.log(
      `%c[${type.toUpperCase()}] ${event}`,
      `color: ${colors[type]}; font-weight: bold;`,
      details || ''
    );

    // Notify listeners
    this.listeners.forEach((listener) => listener([...this.logs]));
  }

  getLogs(): LogEvent[] {
    return [...this.logs];
  }

  subscribe(listener: (logs: LogEvent[]) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  clear() {
    this.logs = [];
    this.listeners.forEach((listener) => listener([]));
  }
}

export const eventLogger = new EventLogger();

// Convenience methods
export const logSentryEvent = (event: string, details?: any) => {
  eventLogger.log('sentry', event, details);
};

export const logZarazEvent = (event: string, details?: any) => {
  eventLogger.log('zaraz', event, details);
};

export const logConsentEvent = (event: string, details?: any) => {
  eventLogger.log('consent', event, details);
};

export const logGeneralEvent = (event: string, details?: any) => {
  eventLogger.log('general', event, details);
};
