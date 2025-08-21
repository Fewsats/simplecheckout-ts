# SmartCheckout Playground Docs

This document provides technical details and local development instructions for the SmartCheckout Playground application.

## Overview

The SmartCheckout Playground is a client-facing, production-deployed application available at [`playground.smartcheckout.dev`](https://playground.smartcheckout.dev). Its primary purpose is to provide a live sandbox environment where clients can test credit card tokenization and interact with the `CreditCardForm` and `CVCVerificationForm` components using their sandbox API keys.

By default, this deployed application points to the production SmartCheckout API (`api.smartcheckout.dev`), ensuring that it functions as a true sandbox for our clients. Internally, this application also serves as our primary development and testing tool for the `smartcheckout-sdk`.

For general information about the SDK's architecture, please refer to the main [`DOCS.md`](../DOCS.md) file in the root of the repository.

## Local Development

The Playground is configured for a seamless local development experience. It is designed to use the SDK's source code from the `src/` directory directly, which enables hot-reloading. Any changes you make to the core SDK files will be instantly reflected in the running application without requiring manual rebuilds or package linking.

### Setup

To begin development, you only need to ensure all dependencies are installed and, optionally, configure the application to point to a local backend.

1.  **Install Dependencies:** If you haven't already, install the necessary dependencies for both the root project and this application.
    ```shell
    # From the repository root
    npm install
    cd playground && npm install && cd ..
    ```

2.  **Configure the API Endpoint:** When running the playground locally, it will still default to the production API. For development and testing against a local backend, you can override this by creating a `.env.local` file within this directory (`playground/`).

    Add the following line to your `.env.local` file to point the application to your local API instance:
    ```
    VITE_API_BASE_URL=http://localhost:8080
    ```
    The Vite development server will automatically load this file and use the specified URL to configure the SDK.

### Running the Application

Once the setup is complete, you can start the development server with a single command from the repository root:

```shell
npm run playground:dev
```
