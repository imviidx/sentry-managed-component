"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentStorage = void 0;
const COOKIE_DURATION = 365; // days
class ConsentStorage {
    constructor(cookieName = 'cf_consent') {
        this.cookieName = cookieName;
    }
    save(consent) {
        try {
            const consentString = JSON.stringify(consent);
            const expires = new Date();
            expires.setTime(expires.getTime() + COOKIE_DURATION * 24 * 60 * 60 * 1000);
            document.cookie = `${this.cookieName}=${encodeURIComponent(consentString)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            // Also store in localStorage as backup
            localStorage.setItem(`${this.cookieName}_backup`, consentString);
        }
        catch (error) {
            console.warn('[Zaraz Consent Tools] Failed to save consent to cookies:', error);
        }
    }
    load() {
        try {
            // Try cookies first
            const cookieValue = this.getCookie(this.cookieName);
            if (cookieValue) {
                return JSON.parse(decodeURIComponent(cookieValue));
            }
            // Fallback to localStorage
            const localStorageValue = localStorage.getItem(`${this.cookieName}_backup`);
            if (localStorageValue) {
                return JSON.parse(localStorageValue);
            }
            return null;
        }
        catch (error) {
            console.warn('[Zaraz Consent Tools] Failed to load consent from storage:', error);
            return null;
        }
    }
    clear() {
        try {
            // Clear cookie
            document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            // Clear localStorage backup
            localStorage.removeItem(`${this.cookieName}_backup`);
        }
        catch (error) {
            console.warn('[Zaraz Consent Tools] Failed to clear consent storage:', error);
        }
    }
    getCookie(name) {
        var _a;
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                const cookieValue = (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
                return cookieValue || null;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
}
exports.ConsentStorage = ConsentStorage;
