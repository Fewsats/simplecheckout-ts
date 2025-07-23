# SmartCheckout

A modern, reusable TypeScript package for securely storing credit card information using SmartCheckout.

## Installation

```bash
npm install @smartcheckout/sdk
```

## Quick Start

### 1. Basic Usage

```typescript
import SmartCheckout from '@smartcheckout/sdk';

// Initialize SmartCheckout with your API key
const smartcheckout = new SmartCheckout('sk_test_your_api_key_here');

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
creditCardForm.mount('#checkout-container');
```

### 2. HTML Setup

```html
<!-- Just provide a container element -->
<div id="checkout-container"></div>
```

That's it! The SmartCheckout package will handle everything else.


## API Reference

### SmartCheckout(apiKey)

Creates a new SmartCheckout instance.

**Parameters:**
- `apiKey` (string, required) - Your SmartCheckout API key

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


## License

MIT License - see LICENSE file for details. 