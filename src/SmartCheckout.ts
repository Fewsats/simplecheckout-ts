import { loadVGSCollect } from '@vgs/collect-js';
import {
  VGSConfig,
  VGSForm,
  VGSFormState,
  VGSCollectInstance,
  CreditCardFormOptions,
  CVCVerificationFormOptions,
  ProviderConfig
} from './types';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  VGS_VERSION,
} from './constants';
import { CreditCardForm } from './forms/CreditCardForm';
import { CVCVerificationForm } from './forms/CVCVerificationForm';

class SmartCheckout {
  private publishableKey: string;
  protected config: VGSConfig | null = null;
  protected vgsForm: VGSForm | null = null;

  // Getter methods for child classes
  getPublishableKey(): string {
    return this.publishableKey;
  }

  getConfig(): VGSConfig | null {
    return this.config;
  }

  getVgsForm(): VGSForm | null {
    return this.vgsForm;
  }

  async initializeConfig(): Promise<VGSConfig> {
    return this._initializeConfig();
  }

  constructor(publishableKey: string) {
    if (!publishableKey) {
      throw new Error('Publishable key is required');
    }
    
    this.publishableKey = publishableKey;
  }

  /**
   * Initialize VGS configuration
   * @private
   */
  private async _initializeConfig(): Promise<VGSConfig> {
    if (this.config) return this.config;

    try {
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROVIDER_CONFIG}?publishable_key=${encodeURIComponent(this.publishableKey)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const providerConfig: ProviderConfig = await response.json();
      
      // Validate the response structure
      if (!providerConfig.name || !providerConfig.environment || !providerConfig.config) {
        throw new Error('Invalid provider configuration response');
      }

      // Validate provider type
      if (providerConfig.name.toLowerCase() !== 'vgs') {
        throw new Error('Provider not supported');
      }

      // Validate config object structure
      if (!providerConfig.config.vault_id || !providerConfig.config.route_id) {
        throw new Error('Invalid provider configuration: missing vault_id or route_id');
      }

      // Map provider config to VGS config format
      this.config = {
        vaultId: providerConfig.config.vault_id,
        environment: providerConfig.environment,
        routeId: providerConfig.config.route_id,
        version: VGS_VERSION
      };
      
      return this.config;
      
    } catch (error) {
      console.error('Failed to fetch VGS configuration:', error);
      throw error;
    }
  }

  /**
   * Initialize VGS Collect
   * @private
   */
  private async _initializeVGS(): Promise<VGSForm> {
    if (this.vgsForm) return this.vgsForm;

    const config = await this._initializeConfig();
    
    const collect = await loadVGSCollect({
      vaultId: config.vaultId,
      environment: config.environment,
      version: config.version
    }) as VGSCollectInstance;

    this.vgsForm = collect.init((state: VGSFormState) => {
      // State updates will be handled by individual forms
    });

    if (this.vgsForm) {
      this.vgsForm.setRouteId(config.routeId);
    }
    return this.vgsForm!;
  }

  /**
   * Create an embedded credit card form
   * @param options - Form options
   * @returns Promise<CreditCardForm> - Credit card form instance
   */
  async initEmbeddedCreditCardForm(options: CreditCardFormOptions = {}): Promise<CreditCardForm> {
    await this._initializeVGS();
    return new CreditCardForm(this, options);
  }

  /**
   * Create a CVC verification form
   * @param options - CVC verification form options
   * @returns Promise<CVCVerificationForm> - CVC verification form instance
   */
  async initCVCVerificationForm(options: CVCVerificationFormOptions): Promise<CVCVerificationForm> {
    await this._initializeVGS();
    return new CVCVerificationForm(this, options);

  }
}


// Export the main SmartCheckout class
export default SmartCheckout; 