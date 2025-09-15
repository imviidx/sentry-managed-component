import {
  ZarazConfig,
  ZarazGlobal,
  ZarazConsentAPI,
  ConsentPreferences,
  Purpose,
  ModalConfig,
} from './types';
import { DEFAULT_CONFIG } from './config';
import { ConsentStorage } from './storage';
import { ConsentModal } from './modal';

export class FakeZaraz implements ZarazGlobal {
  public consent: ZarazConsentAPI;
  private config: Required<ZarazConfig>;
  private storage: ConsentStorage;
  private modal: ConsentModal | null = null;
  private queuedEvents: any[] = [];

  constructor(config: Partial<ZarazConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = new ConsentStorage(this.config.cookieName);

    // Load existing consent or use defaults
    const savedConsent = this.storage.load();
    const initialConsent = savedConsent || this.config.defaultConsent;

    this.consent = this.createConsentAPI(initialConsent);

    this.log('Fake Zaraz initialized', {
      purposes: this.config.purposes.map((p) => p.id),
      initialConsent,
      fromStorage: !!savedConsent,
    });

    // Set up auto-show if enabled
    if (this.config.autoShow && !savedConsent) {
      setTimeout(() => this.showConsentModal(), 100);
    }

    // Dispatch ready event
    setTimeout(() => {
      this.consent.APIReady = true;
      this.dispatchEvent('zarazConsentAPIReady', {});
      this.log('Consent API is ready');
    }, 50);
  }

  showConsentModal = (): void => {
    if (!this.config.enableModal) {
      this.log('Consent modal is disabled');
      return;
    }

    if (this.modal) {
      this.log('Consent modal is already shown');
      return;
    }

    const currentConsent = this.getCurrentConsent();

    this.modal = new ConsentModal(
      this.config.modalConfig as Required<ModalConfig>,
      this.config.purposes,
      currentConsent,
      (newConsent) => {
        this.handleConsentUpdate(newConsent);
        this.modal = null;
      }
    );

    this.consent.modal = true;
    this.modal.show();
    this.log('Consent modal shown');
  };

  private createConsentAPI(
    initialConsent: ConsentPreferences
  ): ZarazConsentAPI {
    let currentConsent = { ...initialConsent };
    let modalVisible = false;
    const self = this; // Store reference to this

    // Create purposes object
    const purposes: { [id: string]: Purpose } = {};
    this.config.purposes.forEach((purpose) => {
      purposes[purpose.id] = { ...purpose };
    });

    return {
      APIReady: false,

      get modal() {
        return modalVisible;
      },

      set modal(value: boolean) {
        modalVisible = value;
        if (value) {
          self.showConsentModal();
        } else if (self.modal) {
          self.modal.hide();
          self.modal = null;
        }
      },

      purposes,

      get: (purposeId: string): boolean | undefined => {
        if (!purposes[purposeId]) {
          self.log(`Purpose "${purposeId}" does not exist`, {
            availablePurposes: Object.keys(purposes),
          });
          return undefined;
        }
        const result = currentConsent[purposeId] || false;
        self.log(`Get consent for "${purposeId}": ${result}`);
        return result;
      },

      set: (consentPreferences: ConsentPreferences): void => {
        self.log('Setting consent', consentPreferences);

        // Validate purpose IDs
        const invalidPurposes = Object.keys(consentPreferences).filter(
          (id) => !purposes[id]
        );
        if (invalidPurposes.length > 0) {
          self.log(`Invalid purpose IDs: ${invalidPurposes.join(', ')}`, {
            availablePurposes: Object.keys(purposes),
          });
        }

        // Update consent for valid purposes
        Object.entries(consentPreferences).forEach(([purposeId, granted]) => {
          if (purposes[purposeId]) {
            currentConsent[purposeId] = granted;
          }
        });

        self.handleConsentUpdate(currentConsent);
      },

      getAll: (): ConsentPreferences => {
        const result = { ...currentConsent };
        self.log('Get all consent', result);
        return result;
      },

      setAll: (consentStatus: boolean): void => {
        self.log(`Setting all consent to: ${consentStatus}`);

        const newConsent: ConsentPreferences = {};
        self.config.purposes.forEach((purpose) => {
          // Required purposes are always true
          newConsent[purpose.id] = purpose.required || consentStatus;
        });

        currentConsent = newConsent;
        self.handleConsentUpdate(currentConsent);
      },

      getAllCheckboxes: (): ConsentPreferences => {
        // For local dev, checkboxes state is same as consent state
        const result = { ...currentConsent };
        self.log('Get all checkboxes', result);
        return result;
      },

      setCheckboxes: (checkboxesStatus: ConsentPreferences): void => {
        self.log('Setting checkboxes', checkboxesStatus);
        // For local dev, setting checkboxes is same as setting consent
        // Validate purpose IDs
        const invalidPurposes = Object.keys(checkboxesStatus).filter(
          (id) => !purposes[id]
        );
        if (invalidPurposes.length > 0) {
          self.log(`Invalid purpose IDs: ${invalidPurposes.join(', ')}`, {
            availablePurposes: Object.keys(purposes),
          });
        }

        // Update consent for valid purposes
        Object.entries(checkboxesStatus).forEach(([purposeId, granted]) => {
          if (purposes[purposeId]) {
            currentConsent[purposeId] = granted;
          }
        });

        self.handleConsentUpdate(currentConsent);
      },

      setAllCheckboxes: (checkboxStatus: boolean): void => {
        self.log(`Setting all checkboxes to: ${checkboxStatus}`);
        // For local dev, setting all checkboxes is same as setting all consent
        const newConsent: ConsentPreferences = {};
        self.config.purposes.forEach((purpose) => {
          // Required purposes are always true
          newConsent[purpose.id] = purpose.required || checkboxStatus;
        });

        currentConsent = newConsent;
        self.handleConsentUpdate(currentConsent);
      },

      sendQueuedEvents: (): void => {
        self.log(`Sending ${self.queuedEvents.length} queued events`);

        if (self.queuedEvents.length > 0) {
          // Simulate sending events
          self.queuedEvents.forEach((event, index) => {
            self.log(`Sending queued event ${index + 1}`, event);
          });

          self.queuedEvents = [];
          self.log('All queued events sent');
        }
      },
    };
  }

  private getCurrentConsent(): ConsentPreferences {
    const consent: ConsentPreferences = {};
    this.config.purposes.forEach((purpose) => {
      consent[purpose.id] = this.consent.get(purpose.id) || false;
    });
    return consent;
  }

  private handleConsentUpdate(newConsent: ConsentPreferences): void {
    // Save to storage
    this.storage.save(newConsent);

    // Update internal state
    Object.assign(this.getCurrentConsent(), newConsent);

    // Dispatch event
    this.dispatchEvent('zarazConsentChoicesUpdated', { consent: newConsent });

    this.log('Consent updated', newConsent);
  }

  private dispatchEvent(eventName: string, detail: any): void {
    try {
      const event = new CustomEvent(eventName, { detail });
      document.dispatchEvent(event);
      this.log(`Event dispatched: ${eventName}`, detail);
    } catch (error) {
      this.log(`Failed to dispatch event: ${eventName}`, error);
    }
  }

  private log(message: string, data?: any): void {
    if (!this.config.enableLogging) return;

    const prefix = '[Zaraz Consent Tools]';
    if (data !== undefined) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  // Utility methods for testing
  public getConfig(): Required<ZarazConfig> {
    return { ...this.config };
  }

  public clearStorage(): void {
    this.storage.clear();
    this.log('Storage cleared');
  }

  public queueEvent(event: any): void {
    this.queuedEvents.push(event);
    this.log('Event queued', event);
  }
}
