# UnderItAll Unified Commerce & Workspace Ecosystem

Welcome to the UnderItAll ecosystem repository. This project implements a multi-node architecture designed to streamline wholesale and trade registrations, integrating Shopify, Google Cloud, Google Workspace, and HighLevel (GHL).

## Architecture Overview

This repository contains five main components:

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

5. **HighLevel Contact Fetcher & Shopify Liquid Autofill**
   - Located in `/gcp-functions/getHighLevelContact` and `/shopify-liquid`.
   - A Google Cloud Function that securely fetches contact data from HighLevel using an email address.
   - A Shopify Liquid snippet that calls the Cloud Function and dynamically autofills an embedded HighLevel iframe form with the customer's existing data.

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

### 5. HighLevel Contact Fetcher (Cloud Function)
```bash
cd gcp-functions/getHighLevelContact
npm install
# Deploy to Google Cloud Functions
gcloud functions deploy getHighLevelContact \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars="HL_API_KEY=your_highlevel_api_key"
```

## Brand Guidelines
- **Primary Accent**: Vibrant Orange/Red (Rorange: `#f2633a`)
- **Neutral/Text**: Felt Grey (`#696a6d`)
- **Backgrounds**: Cream (`#f3f1e9`), Greige (`#e1e0da`)
- **Typography**: Archivo (Headers), Vazirmatn (Body)

## Usage Guidelines

1. **Customer Application**: Customers navigate to the Wholesale Registration page on the Shopify storefront or via the standalone React web app.
2. **Data Processing**: Upon submission, the payload is sent to the GCP Middleware, which validates and appends the data to the designated Google Sheet.
3. **Internal Review**: The UnderItAll team opens the Google Workspace Add-on (e.g., in Gmail or Google Sheets) to quickly view the latest applications and approve/deny them.
4. **HighLevel Sync**: Existing customers logging in will have their data automatically fetched from HighLevel via the GCP Cloud Function and autofilled into the registration iframe.

## Contribution Guidelines

1. **Branching**: Create a feature branch from `main` (e.g., `feature/add-new-field`).
2. **Schema Adherence**: Any changes to the form fields MUST be reflected across all nodes (React form, Shopify Extension, GCP Middleware, and Google Sheet). See `GEMINI.md` for the strict data schema.
3. **Brand Tokens**: Ensure all new UI components strictly follow the color and typography guidelines listed above.
4. **Pull Requests**: Submit a PR with a detailed description of the changes and ensure all local builds pass.

## License
Proprietary - UnderItAll Holdings LLC.
