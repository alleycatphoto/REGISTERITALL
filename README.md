# UnderItAll Unified Commerce & Workspace Ecosystem

Welcome to the UnderItAll ecosystem repository. This project implements a tri-node architecture designed to streamline wholesale and trade registrations, integrating Shopify, Google Cloud, and Google Workspace.

## Architecture Overview

This repository contains four main components:

1. **Web Registration Form (React/Vite)**
   - Located in the root directory (`/src`).
   - A standalone, beautifully designed trade registration form built with React, Tailwind CSS, and Lucide React.
   - Captures the "UnderItAll Wholesale Payload" and submits it to the middleware.

2. **Google Cloud Run Middleware (Node.js/Express)**
   - Located in `/gcp-middleware`.
   - Acts as the central nervous system. It receives POST requests from the web form and the Shopify extension.
   - Authenticates with Google APIs using a Service Account and appends the structured payload to a Google Sheet.

3. **Shopify Customer Account UI Extension**
   - Located in `/shopify-extension`.
   - A native UI extension that renders within the Shopify Customer Account page.
   - Allows existing customers to apply for wholesale/trade status directly from their account portal.

4. **Google Workspace Add-on (Apps Script)**
   - Located in `/workspace-addon`.
   - A Google Workspace Add-on (Gmail, Drive, Calendar, Docs, Sheets, Slides) that provides an internal dashboard for the UnderItAll team.
   - Fetches and displays the latest trade applications directly from the Google Sheet.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Google Cloud SDK (`gcloud`)
- Shopify CLI (`@shopify/cli`)
- Google Apps Script CLI (`clasp`)

### 1. Web Registration Form
```bash
npm install
npm run dev
```

### 2. GCP Middleware
```bash
cd gcp-middleware
npm install
# Create a .env file with PORT, SPREADSHEET_ID, and GOOGLE_APPLICATION_CREDENTIALS_JSON
npm start
```

### 3. Shopify Extension
```bash
cd shopify-extension
npm install
npm run dev
```

### 4. Workspace Add-on
```bash
cd workspace-addon
clasp login
clasp create --type standalone --title "UnderItAll Wholesale"
clasp push
```

## Brand Guidelines
- **Primary Accent**: Vibrant Orange/Red (Rorange: `#f2633a`)
- **Neutral/Text**: Felt Grey (`#696a6d`)
- **Backgrounds**: Cream (`#f3f1e9`), Greige (`#e1e0da`)
- **Typography**: Archivo (Headers), Vazirmatn (Body)

## License
Proprietary - UnderItAll Holdings LLC.
