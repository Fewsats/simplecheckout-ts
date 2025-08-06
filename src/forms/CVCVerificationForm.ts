import {
  VGSForm,
  VGSConfig,
  CVCVerificationFormOptions,
  CVCVerificationResult,
  FieldStyling
} from '../types';
import {
  API_BASE_URL,
  API_ENDPOINTS
} from '../constants';
import type SmartCheckout from '../SmartCheckout';

export class CVCVerificationForm {
  private smartcheckout: SmartCheckout;
  private vgsForm: VGSForm;
  private config: VGSConfig;
  private publishableKey: string;
  
  // Form options
  private code: string;
  private onSuccess: (result: CVCVerificationResult) => void;
  private onError: (error: Error) => void;
  private styling: FieldStyling;
  
  // Form state
  private container: HTMLElement | null = null;
  private cvcField: any = null;
  private mounted: boolean = false;

  constructor(smartcheckout: SmartCheckout, options: CVCVerificationFormOptions) {
    this.smartcheckout = smartcheckout;
    this.vgsForm = smartcheckout.getVgsForm()!;
    this.config = smartcheckout.getConfig()!;
    this.publishableKey = smartcheckout.getApiKey();
    
    // Form options
    this.code = options.code;
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.styling = options.styling || this._getDefaultStyling();
  }

  /**
   * Mount the form to a container element
   * @param selector - CSS selector for the container
   * @returns CVCVerificationForm - Returns self for chaining
   */
  mount(selector: string): CVCVerificationForm {
    if (this.mounted) {
      console.warn('Form is already mounted');
      return this;
    }

    // Find container element
    this.container = document.querySelector(selector);
    if (!this.container) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    // Create form HTML
    this._createFormHTML();
    
    // Create VGS CVC field
    this._createVGSField();
    
    // Setup form submission
    this._setupFormSubmission();

    this.mounted = true;
    return this;
  }

  /**
   * Unmount the form from its container
   * @returns CVCVerificationForm - Returns self for chaining
   */
  unmount(): CVCVerificationForm {
    if (!this.mounted) {
      return this;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.container = null;
    this.cvcField = null;
    this.mounted = false;
    return this;
  }

  /**
   * Submit the form programmatically
   * @returns Promise<CVCVerificationResult> - Promise resolving to the verification result
   */
  async submit(): Promise<CVCVerificationResult> {
    if (!this.mounted) {
      throw new Error('Form must be mounted before submitting');
    }

    return new Promise<CVCVerificationResult>((resolve, reject) => {
      this._showStatus('Verifying CVC...', 'loading');
      this._setSubmitButtonState(true);
      
      this.vgsForm.submit('/post', {}, async (status: number, data: any) => {
        if (status >= 200 && status <= 300) {
          try {
            // Send CVC data to backend for verification
            const result = await this._updateCVC(data);
            
            this._showStatus('CVC verified successfully!', 'success');
            
            // Call success callback
            this.onSuccess(result);
            resolve(result);
            
          } catch (error) {
            if (error instanceof Error && error.message.toLowerCase().includes('verification code')) {
              this._showStatus(`Verification failed: ${error.message}`, 'error');
            } else {
              this._showStatus('Verification failed: There was an error with the verification process. Please try again.', 'error');
            }
            this.onError(error as Error);
            reject(error);
          }
        } else if (!status) {
          const error = new Error('Network error occurred');
          this._showStatus('Network error occurred. Please try again.', 'error');
          this.onError(error);
          reject(error);
        } else {
          const error = new Error(`Server error (${status})`);
          this._showStatus(`Server error (${status}). Please try again.`, 'error');
          this.onError(error);
          reject(error);
        }
      }, (validationError: any) => {
        const error = new Error('Please enter a valid CVC code');
        this._showStatus('Please enter a valid CVC code.', 'error');
        this.onError(error);
        reject(error);
      });
    }).finally(() => {
      this._setSubmitButtonState(false);
    });
  }

  /**
   * Update form styling
   * @param styling - New styling options
   * @returns CVCVerificationForm - Returns self for chaining
   */
  updateStyling(styling: FieldStyling): CVCVerificationForm {
    this.styling = { ...this.styling, ...styling };
    
    // Update existing field if mounted
    if (this.mounted && this.cvcField) {
      if (this.cvcField.update) {
        this.cvcField.update({ css: this.styling });
      }
    }
    
    return this;
  }

  // Private methods
  private _createFormHTML(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="smartcheckout-container">
        <div class="logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.7172 28.509L3 23.496V19.6072L11.7172 24.6206L20.4341 19.6072V23.496L11.7172 28.509Z" fill="#4CA6E6"/>
            <path d="M20.2826 3.45822L11.5654 8.47122V12.3594L20.2826 7.34638L28.9995 12.3594V8.47122L20.2826 3.45822Z" fill="#4CA6E6"/>
            <path d="M3 18.5629L11.7172 23.5762L15.0975 21.6319L6.3806 16.6186V6.59199L3 8.53623V18.5629Z" fill="#4CA6E6"/>
            <path d="M24.7233 25.987L16.0061 31L12.6255 29.0558L21.3424 24.0428V14.0161L24.7233 15.9604V25.987Z" fill="#4CA6E6"/>
            <path d="M7.30664 6.01359L7.30696 16.0399L10.6876 17.9841V7.9575L19.4044 2.94451L16.0239 0.999954L7.30664 6.01359Z" fill="#4CA6E6"/>
            <path d="M28.9993 13.4039V23.4305L25.6187 25.3748V15.3484L16.9019 10.3348L20.2825 8.39025L28.9993 13.4039Z" fill="#4CA6E6"/>
          </svg>
        </div>

        <h1>Verification Required</h1>
        <p class="subtitle">
          For your security, we need to verify your card's CVC code.
        </p>

        <form id="cvc-form">
          <label>Card Security Code (CVC)</label>
          <div id="sc-cvc" class="form-field"></div>
          <button type="submit" id="submit-btn">Verify CVC</button>
        </form>

        <div id="status-message" class="status-message"></div>
        
        <div class="smartcheckout-signature">
          <svg class="smartcheckout-logo" width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.7172 28.509L3 23.496V19.6072L11.7172 24.6206L20.4341 19.6072V23.496L11.7172 28.509Z" fill="#4CA6E6"/>
            <path d="M20.2826 3.45822L11.5654 8.47122V12.3594L20.2826 7.34638L28.9995 12.3594V8.47122L20.2826 3.45822Z" fill="#4CA6E6"/>
            <path d="M3 18.5629L11.7172 23.5762L15.0975 21.6319L6.3806 16.6186V6.59199L3 8.53623V18.5629Z" fill="#4CA6E6"/>
            <path d="M24.7233 25.987L16.0061 31L12.6255 29.0558L21.3424 24.0428V14.0161L24.7233 15.9604V25.987Z" fill="#4CA6E6"/>
            <path d="M7.30664 6.01359L7.30696 16.0399L10.6876 17.9841V7.9575L19.4044 2.94451L16.0239 0.999954L7.30664 6.01359Z" fill="#4CA6E6"/>
            <path d="M28.9993 13.4039V23.4305L25.6187 25.3748V15.3484L16.9019 10.3348L20.2825 8.39025L28.9993 13.4039Z" fill="#4CA6E6"/>
          </svg>
          <span>by SmartCheckout</span>
        </div>
      </div>
    `;

    // Add CSS styles
    this._injectCSS();
  }

  private _createVGSField(): void {
    this.cvcField = this.vgsForm.field('#sc-cvc', {
      type: 'card-security-code',
      name: 'card_cvc',
      placeholder: '123',
      showCardIcon: true,
      validations: ['required', 'validCardSecurityCode'],
      css: this.styling,
    });
  }

  private _setupFormSubmission(): void {
    const form = this.container?.querySelector('#cvc-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submit();
      });
    }
  }

  private async _updateCVC(vgsData: any): Promise<CVCVerificationResult> {
    try {
      // Extract CVC from VGS data and prepare request
      const requestBody = {
        code: this.code,
        cvc: vgsData.card_cvc
      };
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_CVC}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500 && result.error) {
          throw new Error(result.error);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return {
        success: true,
        message: 'CVC verified successfully',
        code: this.code
      };
      
    } catch (error) {
      console.error('Failed to update CVC:', error);
      throw error;
    }
  }

  private _setSubmitButtonState(disabled: boolean): void {
    const submitBtn = this.container?.querySelector('#submit-btn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = disabled;
    }
  }

  private _showStatus(message: string, type: string = 'info'): void {
    const statusElement = this.container?.querySelector('#status-message') as HTMLElement;
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message ${type}`;
      
      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          statusElement.textContent = '';
          statusElement.className = 'status-message';
        }, 5000);
      }
    }
  }

  private _getDefaultStyling(): FieldStyling {
    return {
      boxSizing: 'border-box',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '15px',
      color: '#374151',
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      width: '100%',
      height: '100%',
      padding: '4px 8px',
      fontWeight: '400',
      '&::placeholder': {
        color: '#8a8a8a',
        fontWeight: '400'
      }
    };
  }

  private _injectCSS(): void {
    // Check if styles already injected
    if (document.getElementById('smartcheckout-cvc-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'smartcheckout-cvc-styles';
    style.textContent = `
      .smartcheckout-container {
        max-width: 480px;
        width: 90%;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        padding: 32px;
        text-align: center;
        position: relative;
        box-sizing: border-box;
      }

      .smartcheckout-container * {
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

      .logo {
        margin-bottom: 30px;
      }

      .logo svg {
        width: 48px;
        height: 48px;
      }

      .smartcheckout-container h1 {
        font-size: 24px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 16px;
        letter-spacing: -0.2px;
      }

      .subtitle {
        font-size: 15px;
        margin-bottom: 32px;
        color: #6b7280;
        font-weight: 400;
        line-height: 1.5;
      }

      .smartcheckout-container form {
        max-width: 100%;
        margin: 0;
        text-align: left;
      }

      .smartcheckout-container label {
        display: block;
        font-size: 15px;
        margin-bottom: 10px;
        font-weight: 500;
        color: #374151;
        letter-spacing: -0.1px;
      }

      .form-field {
        width: 100%;
        height: 50px;
        position: relative;
        margin-bottom: 0;
        border-radius: 8px;
        border: 1px solid #e5e5e5;
        padding: 0;
        background-color: #ffffff;
        transition: all 0.2s ease;
        overflow: hidden;
      }

      .form-field:focus-within {
        border-color: #0f0f0f;
        box-shadow: 0 0 0 2px rgba(15, 15, 15, 0.1);
      }

      .form-field:hover:not(:focus-within) {
        border-color: #d0d0d0;
      }

      .form-field iframe {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        outline: none !important;
        padding: 4px 8px !important;
        box-sizing: border-box !important;
      }

      .smartcheckout-container button[type="submit"] {
        width: 100%;
        height: 48px;
        margin-top: 24px;
        margin-bottom: 16px;
        padding: 0 24px;
        font-size: 15px;
        font-weight: 500;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #ffffff;
        background: #4CA6E6;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        letter-spacing: -0.1px;
      }

      .smartcheckout-container button[type="submit"]:hover:not(:disabled) {
        background: #3d95d9;
        transform: translateY(-1px);
        box-shadow: 0 8px 16px rgba(76, 166, 230, 0.25);
      }

      .smartcheckout-container button[type="submit"]:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 4px 8px rgba(76, 166, 230, 0.25);
      }

      .smartcheckout-container button[type="submit"]:disabled {
        background: #f5f5f5;
        color: #8a8a8a;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .form-field.vgs-collect-container__focused {
        border-color: #0f0f0f !important;
        box-shadow: 0 0 0 2px rgba(15, 15, 15, 0.1) !important;
      }

      .form-field.vgs-collect-container__invalid.vgs-collect-container__dirty:not(.vgs-collect-container__focused),
      .form-field.vgs-collect-container__invalid.vgs-collect-container__touched:not(.vgs-collect-container__focused) {
        border-color: #df1b41 !important;
        box-shadow: 0 0 0 2px rgba(223, 27, 65, 0.1) !important;
      }

      /* VGS container styling */
      .vgs-collect-container {
        width: 100% !important;
        height: 100% !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        min-height: 50px !important;
      }

      .vgs-collect-container iframe {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        outline: none !important;
        padding: 4px 8px !important;
        box-sizing: border-box !important;
      }

      .status-message {
        margin-top: 2rem;
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
        text-align: center;
        font-weight: 500;
        min-height: 2rem;
        transition: all 0.3s ease;
      }

      .status-message.success {
        background-color: #f6ffed;
        border: 1px solid #b7eb8f;
        color: #52c41a;
      }

      .status-message.error {
        background-color: #fff2f0;
        border: 1px solid #ffccc7;
        color: #ff4d4f;
      }

      .status-message.warning {
        background-color: #fffbe6;
        border: 1px solid #ffe58f;
        color: #faad14;
      }

      .status-message.loading {
        background-color: #e6f7ff;
        border: 1px solid #91d5ff;
        color: #1890ff;
      }

      .status-message:empty {
        display: none;
      }

      /* SmartCheckout signature */
      .smartcheckout-signature {
        position: absolute;
        bottom: 16px;
        right: 16px;
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        color: #999;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        text-decoration: none;
        cursor: default;
        font-weight: 400;
        letter-spacing: -0.05px;
      }

      .smartcheckout-signature:hover {
        opacity: 0.8;
      }

      .smartcheckout-logo {
        flex-shrink: 0;
      }

      /* Responsive design */
      @media (max-width: 480px) {
        .smartcheckout-container {
          margin: 10px;
          padding: 20px;
        }
        
        .smartcheckout-signature {
          bottom: 12px;
          right: 12px;
          font-size: 11px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}