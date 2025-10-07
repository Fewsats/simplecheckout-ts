# SimpleCheckout SDK Internal Documentation

This document provides a technical overview of the SimpleCheckout TypeScript SDK, its architecture, and the surrounding projects within this repository. It is intended for developers working on this project. For public-facing documentation on how to use the NPM package, see `README.md`.

## Overview

The `simplecheckout-ts` repository contains the following:
1.  **`simplecheckout-sdk`**: A TypeScript package that allows our customers to securely collect and store credit card information without the sensitive data ever touching their servers.
2.  **`cvc-verification`**: A standalone, hostable web application that provides a page for users to re-verify their CVC for an existing card.
3.  **`playground`**: A development and testing environment that demonstrates how to integrate and use the SDK.

To achieve PCI compliance, the SDK integrates with a secure, third-party vaulting provider to collect and tokenize sensitive cardholder data. This is done by rendering sensitive input fields (card number, CVC, expiry date) within iframes, ensuring that the raw data is sent directly from the user's browser to the provider's vault. Our SDK and the client's application only ever handle a secure alias (token) of that data.

Currently, we use [Very Good Security (VGS)](https://www.verygoodsecurity.com/) as our vaulting provider, utilizing their `VGSCollect.js` library.

## SDK Architecture

### High-Level Data Flow

1.  **Initialization**: The merchant's website initializes our SDK by creating a `new SimpleCheckout('pk_sandbox_...')` instance with their publishable key.
2.  **Configuration Fetch**: The SDK sends the publishable key to the SimpleCheckout API (`/api/v1/provider-config`) to fetch the necessary provider configuration (vault ID, route ID, etc.).
3.  **Form Initialization**: The merchant calls a method like `initEmbeddedCreditCardForm()` to create a form instance.
4.  **Mounting**: The merchant calls `.mount('#container')` to render the form on their page. The SDK injects the required HTML and CSS, and then uses a provider-specific library (`VGSCollect.js`) to create secure iframes for the sensitive fields.
5.  **Submission**: 
    - When the end user submits the form, the SDK first sends the data to the vaulting provider. The provider collects the raw data from its iframes and returns a set of aliases (tokens).
    - The SDK takes the provider's aliases and combines them with non-sensitive information (e.g., email address) and sends the complete payload to our backend
    - Our backend returns a `CardToken` that our clients can use to trigger purcharses using the linked credit card details.
6.  **Callbacks**: The SDK invokes the `onSuccess` callback, providing the `CardToken` to the merchant's application for future use.

### Core Components

-   `SimpleCheckout.ts`: This is the main public class and entry point for the SDK. It handles the initial configuration, authentication with our backend (via the publishable key), and serves as a factory for creating form instances (`CreditCardForm`, `CVCVerificationForm`).
-   `forms/CreditCardForm.ts`: Manages the entire lifecycle of the credit card collection form. It is responsible for rendering the UI, initializing the secure iframe fields, handling user input validation, and managing the multi-step submission process.
-   `forms/CVCVerificationForm.ts`: A specialized form for CVC re-verification. It follows a similar architecture but is streamlined for only collecting the CVC.

### Configuration

The SDK requires a base URL for the SimpleCheckout API. It resolves this URL at runtime using the following priority:
1.  A `<meta name="simplecheckout:api-base-url" content="..." />` tag in the HTML `head`.
2.  A global `window.SIMPLECHECKOUT_API_BASE_URL` variable.
3.  A default value defined in `src/constants.ts`, which points to a local development environment.

## Other Projects

In addition to the core SDK source code in `/src`, this repository contains several other applications.

### `cvc-verification/`

This is a standalone Vite application that provides a hosted page for CVC verification. When a user needs to re-authenticate a transaction or update a card, they can be redirected to this page. It takes a verification `code` from the URL parameters and uses the SDK's `CVCVerificationForm` to securely collect the CVC. This approach keeps the sensitive CVC collection off of our main application servers. 

For local development instructions, see the `DOCS.md` file within the `cvc-verification/` directory.

### `playground/`

This Vite application is a live sandbox environment for both our internal developers and our clients. It is publicly deployed at [`playground.simplecheckout.ai`](https://playground.simplecheckout.ai) and allows anyone to interact with the `CreditCardForm` and `CVCVerificationForm`.

For local development instructions, see the `DOCS.md` file within the `playground/` directory.

## Security and Compliance

The primary architectural goal of this SDK is to simplify PCI compliance for our merchants.
-   **Data Isolation**: By using a third-party vaulting library, raw cardholder data (PAN, CVC, Expiry) is never exposed to the merchant's frontend code, our SDK's JavaScript context, or the merchant's servers. The data is isolated within the provider's iframes.
-   **Tokenization**: The SDK exclusively deals with tokenized representations (aliases) of sensitive data after the initial collection by the vaulting provider.
-   **Authentication**: All communication between the SDK and the SimpleCheckout API is authenticated using a short-lived configuration fetched via the merchant's `publishableKey`.
