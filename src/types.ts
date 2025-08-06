// VGS Collect type definitions
export interface VGSCollectConfig {
  vaultId: string;
  environment: string;
  version: string;
}

export interface VGSFormState {
  isFormValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  [key: string]: any;
}

export interface VGSFieldOptions {
  type: string;
  name: string;
  placeholder?: string;
  validations?: string[];
  css?: FieldStyling;
  showCardIcon?: boolean;
}

export interface VGSField {
  update: (options: { css: FieldStyling }) => void;
}

export interface VGSForm {
  field: (selector: string, options: VGSFieldOptions) => VGSField;
  submit: (
    path: string, 
    data: any, 
    successCallback: (status: number, data: any) => void,
    errorCallback: (error: any) => void
  ) => void;
  state: VGSFormState;
  setRouteId: (routeId: string) => void;
}

export interface VGSCollectInstance {
  init: (callback: (state: VGSFormState) => void) => VGSForm;
  setRouteId: (routeId: string) => void;
}

// SmartCheckout type definitions
export interface SmartCheckoutOptions {
  publishableKey: string;
}

export interface CreditCardFormOptions {
  onSuccess?: (result: CardTokenResult) => void;
  onError?: (error: Error) => void;
  styling?: FieldStyling;
}


export interface CardTokenResult {
  success: boolean;
  token: string;
  message: string;
  vgsData: any;
  email: string;
}

export interface VGSConfig {
  vaultId: string;
  environment: string;
  routeId: string;
  version: string;
}

export interface FieldStyling {
  boxSizing?: string;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  height?: string;
  lineHeight?: string;
  border?: string;
  outline?: string;
  width?: string;
  display?: string;
  '&::placeholder'?: {
    color?: string;
    fontWeight?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ProviderConfig {
  name: string;
  environment: string;
  config: {
    vault_id: string;
    route_id: string;
  };
}

export interface FormState {
  vgs: VGSFormState | null;
  email: string;
  isEmailValid: boolean;
}

// CVC Verification types
export interface CVCVerificationFormOptions {
  code: string; // The verification code from URL params
  onSuccess?: (result: CVCVerificationResult) => void;
  onError?: (error: Error) => void;
  styling?: FieldStyling;
}

export interface CVCVerificationResult {
  success: boolean;
  message: string;
  code: string; // The verification code that was processed
}

 