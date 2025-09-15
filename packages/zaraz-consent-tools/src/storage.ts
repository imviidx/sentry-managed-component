import { ConsentPreferences } from './types';

const COOKIE_DURATION = 365; // days

export class ConsentStorage {
  private cookieName: string;

  constructor(cookieName: string = 'cf_consent') {
    this.cookieName = cookieName;
  }

  save(consent: ConsentPreferences): void {
    try {
      const consentString = JSON.stringify(consent);
      const expires = new Date();
      expires.setTime(
        expires.getTime() + COOKIE_DURATION * 24 * 60 * 60 * 1000
      );

      document.cookie = `${this.cookieName}=${encodeURIComponent(
        consentString
      )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

      // Also store in localStorage as backup
      localStorage.setItem(`${this.cookieName}_backup`, consentString);
    } catch (error) {
      console.warn(
        '[Zaraz Consent Tools] Failed to save consent to cookies:',
        error
      );
    }
  }

  load(): ConsentPreferences | null {
    try {
      // Try cookies first
      const cookieValue = this.getCookie(this.cookieName);
      if (cookieValue) {
        return JSON.parse(decodeURIComponent(cookieValue));
      }

      // Fallback to localStorage
      const localStorageValue = localStorage.getItem(
        `${this.cookieName}_backup`
      );
      if (localStorageValue) {
        return JSON.parse(localStorageValue);
      }

      return null;
    } catch (error) {
      console.warn(
        '[Zaraz Consent Tools] Failed to load consent from storage:',
        error
      );
      return null;
    }
  }

  clear(): void {
    try {
      // Clear cookie
      document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      // Clear localStorage backup
      localStorage.removeItem(`${this.cookieName}_backup`);
    } catch (error) {
      console.warn(
        '[Zaraz Consent Tools] Failed to clear consent storage:',
        error
      );
    }
  }

  private getCookie(name: string): string | null {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
