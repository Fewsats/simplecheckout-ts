# CVC Verification Application Docs

This document provides technical details for the CVC Verification application, including its production purpose and local development instructions.

## Overview

The CVC Verification application is a standalone, hostable web page designed to securely collect a user's CVC (Card Verification Code) when re-authentication is required. Because PCI compliance standards restrict the long-term storage of CVCs, this page provides a secure flow for users to re-enter their CVC to verify their identity before completing a sensitive transaction.

When a user needs to re-verify, they are redirected to this page with a unique verification `code` in the URL. The application then uses the `simplecheckout-sdk`'s `CVCVerificationForm` to render a secure iframe, ensuring that the sensitive CVC data is sent directly to the vault and never touches our application servers.

For general information about the SDK's architecture, please refer to the main [`DOCS.md`](../DOCS.md) file in the root of the repository.

## Local Development

The application is configured for a seamless local development experience, allowing you to work on either the application itself or the underlying SDK components with full hot-reloading. It uses the SDK's source code from the `src/` directory directly, so any changes you make are instantly reflected.

### Setup

To begin development, you only need to ensure all dependencies are installed and that the application is configured to communicate with your local backend.

1.  **Install Dependencies:** If you haven't already, install the necessary dependencies for both the root project and this application.
    ```shell
    # From the repository root
    npm install
    cd cvc-verification && npm install && cd ..
    ```

2.  **Configure the API Endpoint:** By default, the application is configured to point to the production SimpleCheckout API. For local development, you can override this by creating a `.env.local` file within this directory (`cvc-verification/`). This will make the application point to a local API instance.

    Add the following line to your `.env.local` file:
    ```
    VITE_API_BASE_URL=http://localhost:8080
    ```
    The Vite development server will automatically load this file and use the specified URL to configure the SDK.

### Running the Application

Once the setup is complete, you can start the development server with a single command from the repository root:

```shell
npm run cvc:dev
```

The server will start, and you can access the application in your browser. To test the form, you will need to provide a test verification `code` as a URL parameter, like so:

`http://localhost:3001/?code=your_test_code`
