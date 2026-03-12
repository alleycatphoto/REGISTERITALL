require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 8080;

// CRITICAL: Implement cors() middleware specifically allowing OPTIONS and POST methods
// from the Shopify domain (using wildcard * for initial scaffolding, restrict later).
app.use(cors({
  origin: '*',
  methods: ['OPTIONS', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Google Sheets Integration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Submissions';

async function getSheetsClient() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is missing.');
  }

  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

app.post('/submit-wholesale', async (req, res) => {
  try {
    const data = req.body;

    // Parse the incoming JSON body against the Data Schema
    const rowData = [
      data.firmName || '',
      data.businessType || '',
      data.yearsInBusiness || '',
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.website || '',
      data.instagramHandle || '',
      data.businessAddress || '',
      data.businessAddress2 || '',
      data.city || '',
      data.state || '',
      data.zipCode || '',
      data.isTaxExempt || false,
      data.taxId || '',
      data.marketingOptIn || false,
      data.smsConsent || false,
      data.termsAccepted || false,
      data.receivedSampleSet || false
    ];

    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:T`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    res.status(200).json({ message: 'Submission successful' });
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Middleware listening on port ${PORT}`);
});
