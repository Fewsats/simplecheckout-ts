// API Configuration
export const API_BASE_URL = import.meta.env?.VITE_GO_BACKEND_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  PROVIDER_CONFIG: '/provider-config',
  CREDIT_CARD_TOKENS: '/credit-card-tokens',
  UPDATE_CVC: '/update-cvc',
  VERIFICATION_CODE_INFO: '/verification-code-info'
} as const;

// VGS Configuration
export const VGS_VERSION = '3.1.0';