# Agentic Maintenance Instructions (GEMINI.md)

**Role**: Principal Software Engineer Agent
**Context**: You are maintaining the UnderItAll Unified Commerce & Workspace Ecosystem. This document contains critical technical directives, deployment instructions, and architectural constraints. **Read this entirely before modifying the codebase.**

## 1. Architectural Constraints & Data Schema

All three nodes (Shopify Extension, GCP Middleware, Web Form) MUST strictly adhere to the "UnderItAll Wholesale Payload" schema:

```json
{
  "firmName": "String", "businessType": "String", "yearsInBusiness": "Number",
  "firstName": "String", "lastName": "String", "email": "String",
  "phone": "String", "website": "String", "instagramHandle": "String",
  "businessAddress": "String", "businessAddress2": "String", "city": "String",
  "state": "String", "zipCode": "String", "isTaxExempt": "Boolean", 
  "taxId": "String", "marketingOptIn": "Boolean", "smsConsent": "Boolean", 
  "termsAccepted": "Boolean", "receivedSampleSet": "Boolean"
}
```
*Directive*: If you add a field to the React form, you MUST also add it to the Shopify Extension UI, the GCP Middleware parsing logic, and the Apps Script dashboard (if relevant).

## 2. Node 1: GCP Middleware (`/gcp-middleware`)

### Environment Variables Required
- `PORT`: (Optional) Defaults to 8080.
- `SPREADSHEET_ID`: The ID of the target Google Sheet.
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Stringified JSON of the Google Service Account key.

### Deployment (Google Cloud Run)
To deploy the middleware, navigate to `/gcp-middleware` and execute:
```bash
gcloud run deploy underitall-middleware \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SPREADSHEET_ID=your_id,GOOGLE_APPLICATION_CREDENTIALS_JSON=your_json"
```

### Agentic Rules for Middleware
- **CORS**: The Shopify extension requires CORS. Do NOT remove the `cors()` middleware. For production, restrict the `origin` to the specific Shopify store domain.
- **Error Handling**: Always return structured JSON errors (e.g., `{ "error": "...", "details": "..." }`) so the client UIs can parse and display them gracefully.

## 3. Node 2: Shopify Customer Account UI Extension (`/shopify-extension`)

### Technical Info & Launch
This is an "extension-only" app targeting the new Customer Account extensibility framework.

1. **Authentication**: `npm run shopify auth login`
2. **Development**: `npm run dev` (Select your partner organization and development store).
3. **Deployment**: `npm run deploy` (Deploys the extension to the Shopify Partner Dashboard).

### Agentic Rules for Shopify Extension
- **Network Access**: The `shopify.extension.toml` MUST contain `[extensions.capabilities] network_access = true`. If this is removed, `fetch()` calls to the GCP middleware will fail silently or throw security errors.
- **UI Components**: Do NOT use React or standard HTML/CSS. You MUST use the vanilla JS components from `@shopify/customer-account-ui-extensions` (e.g., `TextField`, `BlockStack`, `Button`).
- **Target**: The primary target is `customer-account.page.render`.

## 4. Node 3: Google Workspace Add-on (`/workspace-addon`)

### Technical Info & Launch
This add-on uses the Card Service API to render native Google Workspace UIs.

1. **Setup**: Ensure `clasp` is installed globally (`npm install -g @google/clasp`).
2. **Login**: `clasp login`
3. **Link/Create**: Update `.clasp.json` with the correct `scriptId` (or create a new project).
4. **Push**: `clasp push` (Uploads local files to Apps Script).
5. **Deploy**: `clasp deploy` (Creates a new versioned deployment).

### Agentic Rules for Workspace Add-on
- **Manifest**: `appsscript.json` MUST contain the correct `oauthScopes`. If you add new Google API calls (e.g., Drive API), you MUST add the corresponding scope here.
- **Styling**: Use the `COLORS` constant defined in `Code.gs` (`#f2633a` and `#696a6d`) to maintain brand consistency via `CardService` styling methods. Do not use arbitrary hex codes.

## 5. Node 4: HighLevel Contact Fetcher & Liquid Autofill

### Technical Info & Launch
This node consists of a Google Cloud Function (`/gcp-functions/getHighLevelContact`) and a Shopify Liquid snippet (`/shopify-liquid/registration-autofill.liquid`). It fetches contact data from HighLevel (GHL) and autofills an embedded iframe form.

1. **Cloud Function Deployment**:
   ```bash
   cd gcp-functions/getHighLevelContact
   gcloud functions deploy getHighLevelContact \
     --runtime nodejs18 \
     --trigger-http \
     --allow-unauthenticated \
     --set-env-vars="HL_API_KEY=your_highlevel_api_key"
   ```
2. **Liquid Integration**: Copy the contents of `registration-autofill.liquid` into the relevant Shopify theme file (e.g., a custom page template). Ensure the `googleCloudUrl` points to the deployed Cloud Function URL.

### Agentic Rules for HighLevel Integration
- **CORS**: The Cloud Function MUST return `Access-Control-Allow-Origin: *` to allow the Shopify storefront to fetch data.
- **Custom Fields**: HighLevel custom fields are referenced by their specific IDs (e.g., `1NaG60dA0VSqOEuGkeuj`). If custom fields change in HighLevel, the mapping in the Liquid script must be updated.
- **URL Parameters**: The Liquid script constructs a URL with query parameters to autofill the HighLevel form iframe. Ensure parameter names match the form's expected input names.

## 6. Global Brand Tokens
When generating or modifying UI components across any node, strictly adhere to:
- **Primary Accent**: Vibrant Orange/Red (`#f2633a`)
- **Neutral/Text**: Felt Grey (`#696a6d`)
- **Backgrounds**: Cream (`#f3f1e9`), Greige (`#e1e0da`), Soft Black (`#212227`), Green Gradient (`#869880`)
- **Typography**: Archivo (Headers), Vazirmatn (Body), Lora (Accents)

## 7. Gitignore Configuration for Publishing

When publishing or sharing this repository, it is critical to prevent sensitive credentials and environment-specific build artifacts from being committed. The `.gitignore` file must explicitly exclude the following to maintain security and a clean repository:

- **Environment Variables**: `**/.env`, `**/.env.*` (except `.env.example`). Never commit API keys or Service Account JSONs.
- **Node Modules**: `**/node_modules/` across all subdirectories (root, `gcp-middleware`, `shopify-extension`, `gcp-functions`).
- **Build Artifacts**: `**/dist/`, `**/build/`, and Shopify-specific hidden folders like `**/.shopify/`.
- **Apps Script Credentials**: `workspace-addon/.clasp.json` (contains specific script IDs and deployment references that should remain local to the developer's environment).

*Agent Directive*: Always verify that `.gitignore` rules are actively ignoring these paths before executing any `git commit` or repository export commands.
