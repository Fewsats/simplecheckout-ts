# SmartCheckout SDK

A modern, reusable TypeScript package for securely storing credit card information using SmartCheckout.

## Installation

```bash
npm install smartcheckout-sdk
```

## Quick Start

### Credit Card Form

```javascript
import SmartCheckout from 'smartcheckout-sdk';

// Option A (recommended in SPAs): set meta or global for auto-detection
// <meta name="smartcheckout:api-base-url" content="https://api.example.com" />
// or: window.SMARTCHECKOUT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const smartcheckout = new SmartCheckout('pk_sandbox_xxxx');

// Create and mount a credit card form
const creditCardForm = await smartcheckout.initEmbeddedCreditCardForm({
  onSuccess: (result) => {
    console.log('Card stored! Token:', result.token);
    // Use the token in your application
  },
  onError: (error) => {
    console.error('Error:', error.message);
  }
});

// Mount the form to a container
creditCardForm.mount('#container');
```

### CVC Verification Form

```javascript
const smartcheckout = new SmartCheckout('pk_sandbox_xxxx');

// Create and mount a CVC verification form
const cvcForm = await smartcheckout.initCVCVerificationForm({
  code: 'verification_code_from_url',
  onSuccess: (result) => {
    console.log('CVC verified successfully!');
  },
  onError: (error) => {
    console.error('Verification failed:', error.message);
  }
});

// Mount the form to a container
cvcForm.mount('#container');
```

### HTML Setup

```html
<!-- Just provide a container element -->
<div id="container"></div>
```

That's it! The SmartCheckout package will handle everything else.

## API Reference

### SmartCheckout(publishableKey)

Creates a new SmartCheckout instance.

**Parameters:**
- `publishableKey` (string, required) - Your SmartCheckout publishable key

The SDK discovers the API base URL at runtime via:
- A `<meta name="smartcheckout:api-base-url" content="..." />` tag, or
- `window.SMARTCHECKOUT_API_BASE_URL = '...'`, or
- A built-in default suitable for local development

**Returns:** SmartCheckout instance

### smartcheckout.initEmbeddedCreditCardForm(options)

Creates a new embedded credit card form.

**Parameters:**
- `options` (object) - Form configuration options

**Options:**
- `onSuccess` (function) - Callback when card is stored successfully  
- `onError` (function) - Callback when an error occurs
- `styling` (object) - Custom field styling (optional)

**Returns:** Promise<CreditCardForm> - The credit card form instance

### creditCardForm.mount(selector)

Mounts the form to a container element.

**Parameters:**
- `selector` (string) - CSS selector for the container element

**Returns:** CreditCardForm - Returns self for chaining

### creditCardForm.unmount()

Unmounts the form from its container.

**Returns:** CreditCardForm - Returns self for chaining

### creditCardForm.submit()

Submits the form programmatically.

**Returns:** Promise<Object> - Promise resolving to the card token data

### creditCardForm.getState()

Gets the current form state.

**Returns:** Object - Current form state

### creditCardForm.updateStyling(styling)

Updates the form styling.

**Parameters:**
- `styling` (object) - New styling options

**Returns:** CreditCardForm - Returns self for chaining

### smartcheckout.initCVCVerificationForm(options)

Creates a new CVC verification form.

**Parameters:**
- `options` (object) - Form configuration options

**Options:**
- `code` (string, required) - The verification code from the URL
- `onSuccess` (function) - Callback when CVC is verified successfully
- `onError` (function) - Callback when verification fails
- `styling` (object) - Custom field styling (optional)

**Returns:** Promise<CVCVerificationForm> - The CVC verification form instance

### cvcVerificationForm.mount(selector)

Mounts the form to a container element.

**Parameters:**
- `selector` (string) - CSS selector for the container element

**Returns:** CVCVerificationForm - Returns self for chaining

### cvcVerificationForm.unmount()

Unmounts the form from its container.

**Returns:** CVCVerificationForm - Returns self for chaining

### cvcVerificationForm.submit()

Submits the form programmatically.

**Returns:** Promise<CVCVerificationResult> - Promise resolving to the verification result

### cvcVerificationForm.updateStyling(styling)

Updates the form styling.

**Parameters:**
- `styling` (object) - New styling options

**Returns:** CVCVerificationForm - Returns self for chaining


## License

MIT License - see LICENSE file for details. 