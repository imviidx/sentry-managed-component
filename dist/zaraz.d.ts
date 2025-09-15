export interface PurposeMapping {
    functional: string;
    analytics: string;
    marketing: string;
    preferences: string;
}
declare global {
    interface Window {
        zaraz?: Zaraz.ZarazGlobal;
    }
}
declare namespace Zaraz {
    interface ConsentAPI {
        APIReady: boolean;
        get(purposeId: string): boolean;
        set(consent: {
            [purposeId: string]: boolean;
        }): void;
        purposes?: {
            [purposeId: string]: any;
        };
    }
    interface ZarazGlobal {
        consent: ConsentAPI;
        showConsentModal?: () => void;
    }
}
export declare const getZaraz: () => Zaraz.ZarazGlobal | undefined;
export declare const isZarazEnabled: () => boolean;
export declare const isFunctionalConsentGranted: (purposeMapping: PurposeMapping) => boolean;
export declare const getConsentStatus: (purposeMapping: PurposeMapping) => {
    functional?: undefined;
    analytics?: undefined;
    marketing?: undefined;
    preferences?: undefined;
} | {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
};
export declare const setConsent: (consentState: {
    [key: string]: boolean;
}, purposeMapping: PurposeMapping) => void;
export {};
//# sourceMappingURL=zaraz.d.ts.map