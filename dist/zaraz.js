export const getZaraz = () => {
    return typeof window !== 'undefined' ? window.zaraz : undefined;
};
export const isZarazEnabled = () => {
    return !!getZaraz();
};
export const isFunctionalConsentGranted = (purposeMapping) => {
    return !!getZaraz()?.consent?.get(purposeMapping.functional);
};
export const getConsentStatus = (purposeMapping) => {
    const zaraz = getZaraz();
    if (!zaraz?.consent?.get)
        return {};
    return {
        functional: zaraz.consent.get(purposeMapping.functional),
        analytics: zaraz.consent.get(purposeMapping.analytics),
        marketing: zaraz.consent.get(purposeMapping.marketing),
        preferences: zaraz.consent.get(purposeMapping.preferences),
    };
};
export const setConsent = (consentState, purposeMapping) => {
    const zaraz = getZaraz();
    if (!zaraz?.consent?.set)
        return;
    const zarazConsent = {};
    Object.entries(consentState).forEach(([key, value]) => {
        const purposeId = purposeMapping[key];
        if (purposeId) {
            zarazConsent[purposeId] = value;
        }
    });
    zaraz.consent.set(zarazConsent);
};
//# sourceMappingURL=zaraz.js.map