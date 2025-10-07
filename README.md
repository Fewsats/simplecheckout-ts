# SimpleCheckout SDK

A modern, reusable TypeScript package for securely storing credit card information using SimpleCheckout.

## Installation

```bash
npm install simplecheckout-sdk
```

## Quick Start

### Credit Card Form

```javascript
import SimpleCheckout from 'simplecheckout-sdk';

// Initialize SimpleCheckout with your publishable key
const simplecheckout = new SimpleCheckout('pk_sandbox_xxxx');

// Create and mount a credit card form
const creditCardForm = await simplecheckout.initEmbeddedCreditCardForm({
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
const simplecheckout = new SimpleCheckout('pk_sandbox_xxxx');

// Create and mount a CVC verification form
const cvcForm = await simplecheckout.initCVCVerificationForm({
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

That's it! The SimpleCheckout package will handle everything else.

## API Reference

### SimpleCheckout(publishableKey)

Creates a new SimpleCheckout instance.

**Parameters:**
- `publishableKey` (string, required) - Your SimpleCheckout publishable key

**Returns:** SimpleCheckout instance

### simplecheckout.initEmbeddedCreditCardForm(options)

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

### simplecheckout.initCVCVerificationForm(options)

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