// Production Configuration for CDN Deployment
export default {
  // VGS Configuration
  VGS_VAULT_ID: process.env.VITE_VGS_VAULT_ID || 'your_production_vgs_vault_id',
  VGS_ENVIRONMENT: 'live',
  VGS_ROUTE_ID: process.env.VITE_VGS_ROUTE_ID || 'your_production_vgs_route_id',
  VGS_VERSION: '3.1.0',
  
  // API Configuration
  API_BASE_URL: process.env.VITE_API_BASE_URL || 'https://api.yourcompany.com',
  
  // CDN Configuration
  CDN_BASE_URL: process.env.VITE_CDN_BASE_URL || 'https://cdn.yourcompany.com/cvc-verification',
  
  // Build Configuration
  BUILD_CONFIG: {
    minify: true,
    sourcemap: false,
    dropConsole: true,
    compression: true
  }
}; 