# CVC Verification Page

A secure CVC verification page for SmartCheckout users that follows the same VGS methodology as the main package.

## Overview

This page is designed to be emailed to users when additional CVC verification is required for a transaction. It provides a secure, isolated environment for users to enter their card's security code.


## URL Structure

The page expects URLs with query parameters in the following format:

```
/?code={code}
```

### Parameters

- `code`: Verification code from backend (associates with email and handles CVC verification)

### Example URLs

```
/?code=verification_code_123
/?code=secure_code_456
```

## Environment Variables

The page requires the following environment variables to be set:

### VGS Configuration
- `VITE_VGS_VAULT_ID`: Your VGS vault ID
- `VITE_VGS_ENVIRONMENT`: VGS environment (sandbox, live)
- `VITE_VGS_ROUTE_ID`: Your VGS route ID for CVC processing
- `VITE_VGS_VERSION`: VGS Collect version (defaults to 3.1.0)

### API Configuration
- `VITE_API_BASE_URL`: Base URL for API endpoints (defaults to http://localhost:8080)

### Example .env file:
```bash
VITE_VGS_VAULT_ID=tnt_1234567890abcdef
VITE_VGS_ENVIRONMENT=sandbox
VITE_VGS_ROUTE_ID=rt_1234567890abcdef
VITE_VGS_VERSION=3.1.0
VITE_API_BASE_URL=https://api.yourcompany.com
```

## Backend API Endpoints

The page expects this backend endpoint:

### CVC Update
```
POST /v0/company/update-cvc
```

**Request Body:**
```json
{
  "code": "verification_code_123",
  "cvc": "123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "CVC updated successfully",
}
```

## Development

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the project root with your VGS configuration:
   ```bash
   # VGS Configuration
   VITE_VGS_VAULT_ID=your_vault_id_here
   VITE_VGS_ENVIRONMENT=sandbox
   VITE_VGS_ROUTE_ID=your_route_id_here
   VITE_VGS_VERSION=3.1.0
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the page:**
   - Open `http://localhost:3001`
   - Test with a sample URL: `http://localhost:3001/?code=verification_code_123`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.