"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onConsentChange = exports.waitForConsentAPI = exports.sendQueuedEvents = exports.rejectAllConsent = exports.acceptAllConsent = exports.hideConsentModal = exports.showConsentModal = exports.getAllPurposes = exports.setConsentForPurpose = exports.getConsentForPurpose = exports.isZarazConsentAPIReady = exports.isZarazEnabled = exports.getZaraz = void 0;
/**
 * Get the Zaraz global instance from the window object
 * @returns The Zaraz global instance or undefined if not available
 */
const getZaraz = () => {
    return typeof window !== 'undefined' ? window.zaraz : undefined;
};
exports.getZaraz = getZaraz;
/**
 * Check if Zaraz is available and initialized
 * @returns True if Zaraz is available
 */
const isZarazEnabled = () => {
    return !!(0, exports.getZaraz)();
};
exports.isZarazEnabled = isZarazEnabled;
/**
 * Check if Zaraz Consent API is ready
 * @returns True if the consent API is ready
 */
const isZarazConsentAPIReady = () => {
    var _a, _b;
    return !!((_b = (_a = (0, exports.getZaraz)()) === null || _a === void 0 ? void 0 : _a.consent) === null || _b === void 0 ? void 0 : _b.APIReady);
};
exports.isZarazConsentAPIReady = isZarazConsentAPIReady;
/**
 * Get consent status for a specific purpose by ID
 * @param purposeId The purpose ID to check
 * @returns True if consent is granted, false if denied, undefined if purpose doesn't exist
 */
const getConsentForPurpose = (purposeId) => {
    var _a, _b;
    return (_b = (_a = (0, exports.getZaraz)()) === null || _a === void 0 ? void 0 : _a.consent) === null || _b === void 0 ? void 0 : _b.get(purposeId);
};
exports.getConsentForPurpose = getConsentForPurpose;
/**
 * Set consent for a specific purpose by ID
 * @param purposeId The purpose ID to set
 * @param granted Whether consent is granted
 */
const setConsentForPurpose = (purposeId, granted) => {
    var _a;
    const zaraz = (0, exports.getZaraz)();
    if (!((_a = zaraz === null || zaraz === void 0 ? void 0 : zaraz.consent) === null || _a === void 0 ? void 0 : _a.set)) {
        console.warn('[Zaraz Consent Tools] Zaraz consent API not available for setConsentForPurpose');
        return;
    }
    zaraz.consent.set({ [purposeId]: granted });
};
exports.setConsentForPurpose = setConsentForPurpose;
/**
 * Get all available purposes from Zaraz
 * @returns Object containing all configured purposes
 */
const getAllPurposes = () => {
    var _a, _b;
    return ((_b = (_a = (0, exports.getZaraz)()) === null || _a === void 0 ? void 0 : _a.consent) === null || _b === void 0 ? void 0 : _b.purposes) || {};
};
exports.getAllPurposes = getAllPurposes;
/**
 * Show the consent modal
 */
const showConsentModal = () => {
    const zaraz = (0, exports.getZaraz)();
    if (zaraz === null || zaraz === void 0 ? void 0 : zaraz.consent) {
        zaraz.consent.modal = true;
    }
    else if (zaraz === null || zaraz === void 0 ? void 0 : zaraz.showConsentModal) {
        zaraz.showConsentModal();
    }
    else {
        console.warn('[Zaraz Consent Tools] No method available to show consent modal');
    }
};
exports.showConsentModal = showConsentModal;
/**
 * Hide the consent modal
 */
const hideConsentModal = () => {
    const zaraz = (0, exports.getZaraz)();
    if (zaraz === null || zaraz === void 0 ? void 0 : zaraz.consent) {
        zaraz.consent.modal = false;
    }
    else {
        console.warn('[Zaraz Consent Tools] No method available to hide consent modal');
    }
};
exports.hideConsentModal = hideConsentModal;
/**
 * Accept all consent categories
 */
const acceptAllConsent = () => {
    var _a;
    const zaraz = (0, exports.getZaraz)();
    if ((_a = zaraz === null || zaraz === void 0 ? void 0 : zaraz.consent) === null || _a === void 0 ? void 0 : _a.setAll) {
        zaraz.consent.setAll(true);
    }
    else {
        console.warn('[Zaraz Consent Tools] setAll method not available');
    }
};
exports.acceptAllConsent = acceptAllConsent;
/**
 * Reject all non-essential consent categories
 */
const rejectAllConsent = () => {
    var _a;
    const zaraz = (0, exports.getZaraz)();
    if ((_a = zaraz === null || zaraz === void 0 ? void 0 : zaraz.consent) === null || _a === void 0 ? void 0 : _a.setAll) {
        zaraz.consent.setAll(false);
    }
    else {
        console.warn('[Zaraz Consent Tools] setAll method not available');
    }
};
exports.rejectAllConsent = rejectAllConsent;
/**
 * Send queued events after consent is granted
 */
const sendQueuedEvents = () => {
    var _a;
    const zaraz = (0, exports.getZaraz)();
    if ((_a = zaraz === null || zaraz === void 0 ? void 0 : zaraz.consent) === null || _a === void 0 ? void 0 : _a.sendQueuedEvents) {
        zaraz.consent.sendQueuedEvents();
    }
    else {
        console.warn('[Zaraz Consent Tools] sendQueuedEvents method not available');
    }
};
exports.sendQueuedEvents = sendQueuedEvents;
/**
 * Wait for Zaraz Consent API to become ready
 * @param timeout Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise that resolves when API is ready or rejects on timeout
 */
const waitForConsentAPI = (timeout = 10000) => {
    return new Promise((resolve, reject) => {
        if ((0, exports.isZarazConsentAPIReady)()) {
            resolve();
            return;
        }
        const startTime = Date.now();
        const checkReady = () => {
            if ((0, exports.isZarazConsentAPIReady)()) {
                resolve();
                return;
            }
            if (Date.now() - startTime > timeout) {
                reject(new Error('Timeout waiting for Zaraz Consent API to become ready'));
                return;
            }
            setTimeout(checkReady, 100);
        };
        // Also listen for the ready event
        const handleReady = () => {
            document.removeEventListener('zarazConsentAPIReady', handleReady);
            resolve();
        };
        document.addEventListener('zarazConsentAPIReady', handleReady);
        // Start checking
        setTimeout(checkReady, 100);
    });
};
exports.waitForConsentAPI = waitForConsentAPI;
/**
 * Listen for consent changes and call a callback
 * @param callback Function to call when consent changes
 * @returns Function to remove the event listener
 */
const onConsentChange = (callback) => {
    const handleConsentChange = () => {
        var _a;
        const zaraz = (0, exports.getZaraz)();
        if ((_a = zaraz === null || zaraz === void 0 ? void 0 : zaraz.consent) === null || _a === void 0 ? void 0 : _a.getAll) {
            callback(zaraz.consent.getAll());
        }
    };
    document.addEventListener('zarazConsentChoicesUpdated', handleConsentChange);
    return () => {
        document.removeEventListener('zarazConsentChoicesUpdated', handleConsentChange);
    };
};
exports.onConsentChange = onConsentChange;
