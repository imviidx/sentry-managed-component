export const logEvent = (message: string, data?: any): void => {
  if (typeof window !== 'undefined' && window.console) {
    console.log(`[SentryZarazConsentIntegration] ${message}`, data || '');
  }
};
