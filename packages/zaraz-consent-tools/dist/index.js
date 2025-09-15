"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeZarazConsentTools = initializeZarazConsentTools;
exports.getZarazConsentTools = getZarazConsentTools;
exports.cleanupZarazConsentTools = cleanupZarazConsentTools;
exports.quickSetup = quickSetup;
__exportStar(require("./types"), exports);
__exportStar(require("./config"), exports);
__exportStar(require("./storage"), exports);
__exportStar(require("./modal"), exports);
__exportStar(require("./fake-zaraz"), exports);
__exportStar(require("./utils"), exports);
require("./global");
const fake_zaraz_1 = require("./fake-zaraz");
// Global instance
let globalZarazInstance = null;
/**
 * Initialize Zaraz Consent Tools with the given configuration
 * This sets up a fake Zaraz instance on the global window object
 * @param config Configuration options for the fake Zaraz instance
 * @returns The created FakeZaraz instance
 */
function initializeZarazConsentTools(config = {}) {
    if (typeof window === 'undefined') {
        throw new Error('Zaraz Consent Tools can only be used in a browser environment');
    }
    // Clean up existing instance
    if (globalZarazInstance) {
        console.warn('[Zaraz Consent Tools] Replacing existing instance');
    }
    // Create new instance
    globalZarazInstance = new fake_zaraz_1.FakeZaraz(config);
    // Attach to window
    window.zaraz = globalZarazInstance;
    console.log('[Zaraz Consent Tools] Initialized and attached to window.zaraz');
    return globalZarazInstance;
}
/**
 * Get the current global Zaraz instance
 * @returns The current FakeZaraz instance or null if not initialized
 */
function getZarazConsentTools() {
    return globalZarazInstance;
}
/**
 * Clean up the global Zaraz instance
 */
function cleanupZarazConsentTools() {
    if (globalZarazInstance) {
        globalZarazInstance.clearStorage();
        globalZarazInstance = null;
    }
    if (typeof window !== 'undefined') {
        delete window.zaraz;
    }
    console.log('[Zaraz Consent Tools] Cleaned up');
}
/**
 * Quick setup function for common use cases
 * Creates a Zaraz instance with sensible defaults for local development
 */
function quickSetup(options = {}) {
    const config = {
        enableLogging: options.enableLogging !== false, // default to true
        autoShow: options.autoShow || false,
        enableModal: true,
        ...(options.customPurposes && { purposes: options.customPurposes }),
    };
    return initializeZarazConsentTools(config);
}
