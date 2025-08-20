// API Configuration
// Vite env var is used for local dev to override the API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.smartcheckout.dev';

// API Endpoints
export const API_ENDPOINTS = {
  PROVIDER_CONFIG: '/v0/provider-config',
  CREDIT_CARD_TOKENS: '/v0/credit-card-tokens',
  UPDATE_CVC: '/v0/update-cvc',
  VERIFICATION_CODE_INFO: '/v0/verification-code-info'
} as const;

// VGS Configuration
export const VGS_VERSION = '3.1.0';