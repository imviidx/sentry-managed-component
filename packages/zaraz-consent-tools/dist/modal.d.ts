import { ModalConfig, ConsentPreferences, Purpose } from './types';
export declare class ConsentModal {
    private config;
    private purposes;
    private currentConsent;
    private onSave;
    private overlay;
    constructor(config: Required<ModalConfig>, purposes: Purpose[], currentConsent: ConsentPreferences, onSave: (consent: ConsentPreferences) => void);
    show(): void;
    hide(): void;
    private createOverlay;
    private createModal;
    private createPurposeElement;
    private getButtonStyles;
    private addEventListeners;
    private trapFocus;
}
