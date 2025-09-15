export const logEvent = (message, data) => {
    if (typeof window !== 'undefined' && window.console) {
        console.log(`[SentryZarazConsentIntegration] ${message}`, data || '');
    }
};
//# sourceMappingURL=eventLogger.js.map