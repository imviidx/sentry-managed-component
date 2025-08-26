declare namespace Zaraz {
  interface Config {
    event?: string;
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    nonInteraction?: boolean;
    [key: string]: any;
  }

  interface ConsentPreferences {
    [purposeId: string]: boolean;
  }

  interface ConsentPurpose {
    id: string;
    name: string;
    description: string;
    order: number;
  }

  interface ConsentAPI {
    /** Get or set the current visibility status of the consent modal dialog */
    modal: boolean;

    /** An object containing all configured purposes */
    readonly purposes: Record<string, ConsentPurpose>;

    /** Indicates whether the Consent API is currently available on the page */
    readonly APIReady: boolean;

    /** Get the current consent status for a purpose using the purpose ID */
    get(purposeId: string): boolean | undefined;

    /** Set the consent status for some purposes using the purpose ID */
    set(consentPreferences: ConsentPreferences): void;

    /** Returns an object with the consent status of all purposes */
    getAll(): ConsentPreferences;

    /** Set the consent status for all purposes at once */
    setAll(consentStatus: boolean): void;

    /** Returns an object with the checkbox status of all purposes */
    getAllCheckboxes(): ConsentPreferences;

    /** Set the consent status for some purposes using the purpose ID */
    setCheckboxes(checkboxesStatus: ConsentPreferences): void;

    /** Set the checkboxStatus status for all purposes in the consent modal at once */
    setAllCheckboxes(checkboxStatus: boolean): void;

    /** Send queued Pageview-based events that were not sent due to lack of consent */
    sendQueuedEvents(): void;
  }

  interface ZarazGlobal {
    track(eventName: string, parameters?: Record<string, any>): void;
    set(key: string | Record<string, any>, value?: any): void;
    ecommerce(action: string, data: Record<string, any>): void;
    identify(id: string, traits?: Record<string, any>): void;
    pageview(url?: string): void;
    debug(key: string): void;
    disable(): void;
    showConsentModal: () => void;
    consent: ConsentAPI;
    config: Config;
  }
}

declare global {
  interface Window {
    zaraz?: Zaraz.ZarazGlobal;
  }
}
