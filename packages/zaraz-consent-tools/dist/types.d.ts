export interface Purpose {
    id: string;
    name: string;
    description: string;
    order: number;
    required?: boolean;
}
export interface ConsentPreferences {
    [purposeId: string]: boolean;
}
export interface ZarazConsentAPI {
    APIReady: boolean;
    modal: boolean;
    purposes: {
        [purposeId: string]: Purpose;
    };
    get(purposeId: string): boolean | undefined;
    set(consentPreferences: ConsentPreferences): void;
    getAll(): ConsentPreferences;
    setAll(consentStatus: boolean): void;
    getAllCheckboxes(): ConsentPreferences;
    setCheckboxes(checkboxesStatus: ConsentPreferences): void;
    setAllCheckboxes(checkboxStatus: boolean): void;
    sendQueuedEvents(): void;
}
export interface ZarazGlobal {
    consent: ZarazConsentAPI;
    showConsentModal?: () => void;
}
export interface ZarazConfig {
    purposes?: Purpose[];
    defaultConsent?: ConsentPreferences;
    enableLogging?: boolean;
    enableModal?: boolean;
    modalConfig?: ModalConfig;
    cookieName?: string;
    autoShow?: boolean;
}
export interface ModalConfig {
    title?: string;
    description?: string;
    acceptAllText?: string;
    rejectAllText?: string;
    saveText?: string;
    closeText?: string;
    theme?: 'light' | 'dark';
    position?: 'center' | 'bottom';
}
