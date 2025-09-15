"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentModal = void 0;
class ConsentModal {
    constructor(config, purposes, currentConsent, onSave) {
        this.overlay = null;
        this.config = config;
        this.purposes = purposes;
        this.currentConsent = { ...currentConsent };
        this.onSave = onSave;
    }
    show() {
        if (this.overlay) {
            return; // Modal already shown
        }
        this.overlay = this.createOverlay();
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden';
        // Focus trap
        this.trapFocus();
        console.log('[Zaraz Consent Tools] Consent modal displayed');
    }
    hide() {
        if (this.overlay) {
            document.body.removeChild(this.overlay);
            document.body.style.overflow = '';
            this.overlay = null;
            console.log('[Zaraz Consent Tools] Consent modal hidden');
        }
    }
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: ${this.config.position === 'center' ? 'center' : 'flex-end'};
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
        const modal = this.createModal();
        overlay.appendChild(modal);
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hide();
            }
        });
        return overlay;
    }
    createModal() {
        const modal = document.createElement('div');
        const isDark = this.config.theme === 'dark';
        modal.style.cssText = `
      background: ${isDark ? '#2d3748' : '#ffffff'};
      color: ${isDark ? '#ffffff' : '#1a202c'};
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      position: relative;
    `;
        modal.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">${this.config.title}</h2>
        <p style="margin: 0; color: ${isDark ? '#cbd5e0' : '#4a5568'}; line-height: 1.5;">${this.config.description}</p>
      </div>

      <div style="margin-bottom: 24px;">
        ${this.purposes
            .map((purpose) => this.createPurposeElement(purpose, isDark))
            .join('')}
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end;">
        <button id="reject-all" style="${this.getButtonStyles(isDark, 'secondary')}">${this.config.rejectAllText}</button>
        <button id="accept-all" style="${this.getButtonStyles(isDark, 'primary')}">${this.config.acceptAllText}</button>
        <button id="save-preferences" style="${this.getButtonStyles(isDark, 'primary')}">${this.config.saveText}</button>
      </div>
    `;
        // Add event listeners
        this.addEventListeners(modal);
        return modal;
    }
    createPurposeElement(purpose, isDark) {
        const isChecked = this.currentConsent[purpose.id] || false;
        const isRequired = purpose.required || false;
        return `
      <div style="
        padding: 16px;
        border: 1px solid ${isDark ? '#4a5568' : '#e2e8f0'};
        border-radius: 8px;
        margin-bottom: 12px;
        ${isRequired
            ? `background: ${isDark ? '#2d3748' : '#f7fafc'}; border-color: ${isDark ? '#63b3ed' : '#3182ce'};`
            : ''}
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${purpose.name}</h3>
          <label style="display: flex; align-items: center; cursor: ${isRequired ? 'not-allowed' : 'pointer'};">
            <input
              type="checkbox"
              data-purpose="${purpose.id}"
              ${isChecked ? 'checked' : ''}
              ${isRequired ? 'disabled' : ''}
              style="
                margin-right: 8px;
                width: 18px;
                height: 18px;
                cursor: ${isRequired ? 'not-allowed' : 'pointer'};
                accent-color: ${isDark ? '#63b3ed' : '#3182ce'};
              "
            />
            <span style="font-size: 14px; color: ${isDark ? '#cbd5e0' : '#4a5568'};">
              ${isRequired ? 'Required' : 'Optional'}
            </span>
          </label>
        </div>
        <p style="margin: 0; font-size: 14px; color: ${isDark ? '#a0aec0' : '#718096'}; line-height: 1.4;">
          ${purpose.description}
        </p>
      </div>
    `;
    }
    getButtonStyles(isDark, variant) {
        if (variant === 'primary') {
            return `
        background: ${isDark ? '#3182ce' : '#3182ce'};
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
        }
        else {
            return `
        background: transparent;
        color: ${isDark ? '#cbd5e0' : '#4a5568'};
        border: 1px solid ${isDark ? '#4a5568' : '#cbd5e0'};
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      `;
        }
    }
    addEventListeners(modal) {
        // Purpose checkboxes
        const checkboxes = modal.querySelectorAll('input[data-purpose]');
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                const purposeId = checkbox.getAttribute('data-purpose');
                if (purposeId) {
                    this.currentConsent[purposeId] = checkbox.checked;
                }
            });
        });
        // Reject all button
        const rejectButton = modal.querySelector('#reject-all');
        rejectButton === null || rejectButton === void 0 ? void 0 : rejectButton.addEventListener('click', () => {
            this.purposes.forEach((purpose) => {
                if (!purpose.required) {
                    this.currentConsent[purpose.id] = false;
                }
            });
            this.onSave(this.currentConsent);
            this.hide();
        });
        // Accept all button
        const acceptButton = modal.querySelector('#accept-all');
        acceptButton === null || acceptButton === void 0 ? void 0 : acceptButton.addEventListener('click', () => {
            this.purposes.forEach((purpose) => {
                this.currentConsent[purpose.id] = true;
            });
            this.onSave(this.currentConsent);
            this.hide();
        });
        // Save preferences button
        const saveButton = modal.querySelector('#save-preferences');
        saveButton === null || saveButton === void 0 ? void 0 : saveButton.addEventListener('click', () => {
            this.onSave(this.currentConsent);
            this.hide();
        });
    }
    trapFocus() {
        const modal = this.overlay;
        if (!modal)
            return;
        const focusableElements = modal.querySelectorAll('button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                }
                else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
            if (e.key === 'Escape') {
                this.hide();
            }
        };
        document.addEventListener('keydown', handleTabKey);
        firstElement === null || firstElement === void 0 ? void 0 : firstElement.focus();
        // Cleanup on modal close
        const originalHide = this.hide.bind(this);
        this.hide = () => {
            document.removeEventListener('keydown', handleTabKey);
            originalHide();
        };
    }
}
exports.ConsentModal = ConsentModal;
