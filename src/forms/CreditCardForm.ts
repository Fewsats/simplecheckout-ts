import {
  VGSForm,
  VGSConfig,
  CreditCardFormOptions,
  CardTokenResult,
  FieldStyling,
  FormState
} from '../types';
import {
  API_BASE_URL,
  API_ENDPOINTS
} from '../constants';
import type SmartCheckout from '../SmartCheckout';

export class CreditCardForm {
  private smartcheckout: SmartCheckout;
  private vgsForm: VGSForm;
  private config: VGSConfig;
  private publishableKey: string;
  
  // Form options
  private onSuccess: (result: CardTokenResult) => void;
  private onError: (error: Error) => void;
  private styling: FieldStyling;
  
  // Form state
  private container: HTMLElement | null = null;
  private fields: Record<string, any> = {};
  private userInteracted: boolean = false;
  private formSubmitted: boolean = false;
  private mounted: boolean = false;

  constructor(smartcheckout: SmartCheckout, options: CreditCardFormOptions = {}) {
    this.smartcheckout = smartcheckout;
    this.vgsForm = smartcheckout.getVgsForm()!;
    this.config = smartcheckout.getConfig()!;
    this.publishableKey = smartcheckout.getApiKey();
    
    // Form options
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.styling = options.styling || this._getDefaultStyling();
  }

  /**
   * Mount the form to a container element
   * @param selector - CSS selector for the container
   * @returns CreditCardForm - Returns self for chaining
   */
  mount(selector: string): CreditCardForm {
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
    
    // Create VGS fields
    this._createVGSFields();
    
    // Setup form submission
    this._setupFormSubmission();

    this.mounted = true;
    return this;
  }

  /**
   * Unmount the form from its container
   * @returns CreditCardForm - Returns self for chaining
   */
  unmount(): CreditCardForm {
    if (!this.mounted) {
      return this;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.container = null;
    this.fields = {};
    this.mounted = false;
    return this;
  }

  /**
   * Submit the form programmatically
   * @returns Promise<CardTokenResult> - Promise resolving to the card token data
   */
  async submit(): Promise<CardTokenResult> {
    if (!this.mounted) {
      throw new Error('Form must be mounted before submitting');
    }

    // Validate email before proceeding
    const email = this.getEmail();
    if (!email) {
      const error = new Error('Email address is required');
      this._showStatus('Please enter your email address.', 'error');
      this.onError(error);
      throw error;
    }

    if (!this._isEmailValid(email)) {
      const error = new Error('Please enter a valid email address');
      this._showStatus('Please enter a valid email address.', 'error');
      this.onError(error);
      throw error;
    }

    return new Promise((resolve, reject) => {
      // Mark that form submission was attempted
      this.formSubmitted = true;

      this._showStatus('Storing card information...', 'loading');
      
      this.vgsForm.submit('/post', {}, async (status: number, data: any) => {
        if (status >= 200 && status <= 300) {
          try {
            this._showStatus('Card data tokenized, storing...', 'loading');
            
            // Simulate backend call (replace with real API call)
            const result = await this._processCardData(data);
            
            this._showStatus('Card stored successfully!', 'success');
            
            // Call success callback
            this.onSuccess(result);
            resolve(result);
            
          } catch (error) {
            this._showStatus('Card storage failed. Please try again.', 'error');
            this.onError(error as Error);
            reject(error);
          }
        } else if (!status) {
          const error = new Error('Network error occurred');
          this._showStatus('Network error occurred. Please try again.', 'error');
          this.onError(error);
          reject(error);
        } else {
          const error = new Error(`VGS server error (${status})`);
          this._showStatus(`VGS server error (${status}). Please try again.`, 'error');
          this.onError(error);
          reject(error);
        }
      }, (validationError: any) => {
        const error = new Error('Please fill in all required card fields correctly');
        this._showStatus('Please fill in all required card fields correctly.', 'error');
        this.onError(error);
        reject(error);
      });
    });
  }

  /**
   * Get the current form state
   * @returns FormState - Current form state
   */
  getState(): FormState {
    const vgsState = this.vgsForm ? this.vgsForm.state : null;
    const email = this.getEmail();
    
    return {
      vgs: vgsState,
      email: email,
      isEmailValid: this._isEmailValid(email)
    };
  }

  /**
   * Get the email value from the form
   * @returns string - Email address
   */
  getEmail(): string {
    const emailField = this.container?.querySelector('#sc-email') as HTMLInputElement;
    return emailField ? emailField.value.trim() : '';
  }

  /**
   * Update form styling
   * @param styling - New styling options
   * @returns CreditCardForm - Returns self for chaining
   */
  updateStyling(styling: FieldStyling): CreditCardForm {
    this.styling = { ...this.styling, ...styling };
    
    // Update existing fields if mounted
    if (this.mounted && this.fields) {
      Object.values(this.fields).forEach(field => {
        if (field && field.update) {
          field.update({ css: this.styling });
        }
      });
    }
    
    return this;
  }

  // Private methods
  private _createFormHTML(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="smartcheckout-container">
        <form id="smartcheckout-form">
          <div class="form-section">
            <label>Email</label>
            <input type="email" id="sc-email" class="form-field-regular" placeholder="email@example.com" required>
          </div>
          
          <div class="form-section">
            <h3 class="section-title">Payment method</h3>
            
            <div class="field-group">
              <label>Card information</label>
              <div id="sc-cardnumber" class="form-field card-number-field"></div>
              <div class="form-field-group">
                <div>
                  <div id="sc-expdate" class="form-field"></div>
                </div>
                <div>
                  <div id="sc-cvc" class="form-field"></div>
                </div>
              </div>
            </div>
            
            <div class="field-group">
              <label>Cardholder name</label>
              <div id="sc-cardholder" class="form-field"></div>
            </div>
          </div>
          
          <button type="submit">Save card</button>
        </form>
        
        <div id="smartcheckout-status" class="status-message"></div>
        
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

  private _createVGSFields(): void {
    this.fields.cardholder = this.vgsForm.field('#sc-cardholder', {
      type: 'text',
      name: 'card_holder',
      placeholder: 'John Doe',
      validations: ['required'],
      css: this.styling,
    });

    this.fields.cardnumber = this.vgsForm.field('#sc-cardnumber', {
      type: 'card-number',
      name: 'card_number',
      placeholder: '4111 1111 1111 1111',
      showCardIcon: true,
      validations: ['required', 'validCardNumber'],
      css: this.styling,
    });

    this.fields.expdate = this.vgsForm.field('#sc-expdate', {
      type: 'card-expiration-date',
      name: 'card_exp',
      placeholder: 'MM / YY',
      validations: ['required', 'validCardExpirationDate'],
      css: this.styling,
    });

    this.fields.cvc = this.vgsForm.field('#sc-cvc', {
      type: 'card-security-code',
      name: 'card_cvc',
      placeholder: '123',
      showCardIcon: true,
      validations: ['required', 'validCardSecurityCode'],
      css: this.styling,
    });
  }

  private _setupFormSubmission(): void {
    const form = this.container?.querySelector('#smartcheckout-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submit();
      });
    }

    // Add email field validation listener
    const emailField = this.container?.querySelector('#sc-email') as HTMLInputElement;
    if (emailField) {
      emailField.addEventListener('input', () => {
        // Trigger status update when email changes
        if (this.vgsForm && this.vgsForm.state) {
          this._updateFormStatus(this.vgsForm.state);
        }
      });
    }
  }

  private async _processCardData(vgsData: any): Promise<CardTokenResult> {
    try {
      
      // Get email from the form
      const emailField = this.container?.querySelector('#sc-email') as HTMLInputElement;
      const email = emailField ? emailField.value.trim() : '';
      
      if (!email) {
        throw new Error('Email address is required');
      }
      
      // Transform VGS data to remove "card_" prefix
      const transformedData: Record<string, any> = {};
      for (const [key, value] of Object.entries(vgsData)) {
        if (key.startsWith('card_')) {
          const newKey = key.replace('card_', '');
          transformedData[newKey] = value;
        } else {
          transformedData[key] = value;
        }
      }
      
      // Add email to the data being sent to backend
      const dataToSend = {
        ...transformedData,
        email: email,
        publishable_key: this.publishableKey
      };
      
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREDIT_CARD_TOKENS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Validate that response contains token
      if (!result.token) {
        throw new Error('Invalid response: missing token');
      }

      return {
        success: true,
        token: result.token,
        message: 'Card stored successfully',
        vgsData: vgsData, // Include original VGS data
        email: email // Include email in the result
      };
      
    } catch (error) {
      console.error('Failed to store credit card tokens:', error);
      throw error;
    }
  }

  private _updateFormStatus(state: any): void {
    const statusElement = this.container?.querySelector('#smartcheckout-status') as HTMLElement;
    if (!statusElement) return;

    // Track if user has interacted with any field
    if (state.isDirty || state.isTouched) {
      this.userInteracted = true;
    }

    // Get email validation status
    const email = this.getEmail();
    const isEmailValid = this._isEmailValid(email);

    // Only show validation messages after user interaction or form submission
    if (this.userInteracted || this.formSubmitted) {
      if (state.isFormValid && isEmailValid) {
        statusElement.textContent = 'Card information ready to store';
        statusElement.className = 'status-message success';
      } else if (!isEmailValid && email) {
        statusElement.textContent = 'Please enter a valid email address';
        statusElement.className = 'status-message warning';
      } else {
        statusElement.textContent = 'Please complete all required fields';
        statusElement.className = 'status-message warning';
      }
    } else {
      // Clear status on initial load
      statusElement.textContent = '';
      statusElement.className = 'status-message';
    }
  }

  private _showStatus(message: string, type: string = 'info'): void {
    const statusElement = this.container?.querySelector('#smartcheckout-status') as HTMLElement;
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '15px',
      color: '#374151',
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      width: '100%',
      height: '100%',
      padding: '14px 16px',
      fontWeight: '400',
      '&::placeholder': {
        color: '#8a8a8a',
        fontWeight: '400'
      }
    };
  }

  private _isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private _injectCSS(): void {
    // Check if styles already injected
    if (document.getElementById('smartcheckout-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'smartcheckout-styles';
    style.textContent = `
      .smartcheckout-container {
        box-sizing: border-box;
      }

      .smartcheckout-container * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

      .smartcheckout-container iframe {
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
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

      .smartcheckout-container {
        max-width: 480px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 32px;
        border-radius: 12px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        position: relative;
      }

      .smartcheckout-container form {
        max-width: 100%;
        margin: 0;
      }

      .form-section {
        margin-bottom: 28px;
      }

      .section-title {
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        color: #374151;
        letter-spacing: -0.2px;
      }

      .field-group {
        margin-bottom: 24px;
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

      .form-field-regular {
        width: 100%;
        height: 50px;
        margin-bottom: 0;
        border-radius: 8px;
        border: 1px solid #e5e5e5;
        padding: 14px 16px;
        background-color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 15px;
        color: #374151;
        box-sizing: border-box;
        transition: all 0.2s ease;
        outline: none;
        font-weight: 400;
        letter-spacing: -0.1px;
      }

      .form-field-regular:focus {
        border-color: #0f0f0f;
        box-shadow: 0 0 0 2px rgba(15, 15, 15, 0.1);
      }

      .form-field-regular:hover:not(:focus) {
        border-color: #d0d0d0;
      }

      .form-field-regular::placeholder {
        color: #8a8a8a;
        font-weight: 400;
      }

      .card-number-field {
        margin-bottom: 0;
        border-bottom: 1px solid #e5e5e5;
        border-radius: 8px 8px 0 0;
      }

      .form-field-group {
        display: flex;
        margin-top: 0;
      }

      .form-field-group div {
        flex: 1;
      }

      .form-field-group div:first-child .form-field {
        border-right: none;
        border-radius: 0 0 0 8px;
        border-top: none;
      }

      .form-field-group div:last-child .form-field {
        border-left: 1px solid #e5e5e5;
        border-radius: 0 0 8px 0;
        border-top: none;
      }

      .smartcheckout-container button[type="submit"] {
        width: 100%;
        height: 48px;
        margin-top: 8px;
        margin-bottom: 16px;
        padding: 0 24px;
        font-size: 15px;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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

      .form-field-group .form-field.vgs-collect-container__focused {
        border-color: #0f0f0f !important;
        box-shadow: 0 0 0 2px rgba(15, 15, 15, 0.1) !important;
      }

      .form-field.vgs-collect-container__invalid.vgs-collect-container__dirty:not(.vgs-collect-container__focused),
      .form-field.vgs-collect-container__invalid.vgs-collect-container__touched:not(.vgs-collect-container__focused) {
        border-color: #df1b41 !important;
        box-shadow: 0 0 0 3px rgba(223, 27, 65, 0.1) !important;
      }

      /* VGS container styling */
      .vgs-collect-container {
        width: 100% !important;
        height: 100% !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        min-height: 44px !important;
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
        
        .smartcheckout-container form {
          margin: 10px auto;
        }
        
        .form-field-group {
          flex-direction: column;
        }
        
        .form-field-group div {
          flex: 1 1 100%;
        }
        
        .form-field-group div:first-child div {
          border-radius: 4px 4px 0 0;
          clip-path: none;
          margin-bottom: 0;
        }
        
        .form-field-group div:last-child div {
          border-radius: 0 0 4px 4px;
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