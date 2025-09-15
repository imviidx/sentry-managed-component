import { ZarazConfig, ZarazGlobal, ZarazConsentAPI } from './types';
export declare class FakeZaraz implements ZarazGlobal {
    consent: ZarazConsentAPI;
    private config;
    private storage;
    private modal;
    private queuedEvents;
    constructor(config?: Partial<ZarazConfig>);
    showConsentModal: () => void;
    private createConsentAPI;
    private getCurrentConsent;
    private handleConsentUpdate;
    private dispatchEvent;
    private log;
    getConfig(): Required<ZarazConfig>;
    clearStorage(): void;
    queueEvent(event: any): void;
}
