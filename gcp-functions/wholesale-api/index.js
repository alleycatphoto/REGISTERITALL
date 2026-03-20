const functions = require('@google-cloud/functions-framework');
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Google Auth Setup
async function getAuthClient() {
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS || './gcp-middleware/credentials.json';
  return new google.auth.GoogleAuth({
    keyFilename,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });
}

// Middleware to check Bearer token for admin routes
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }
  // For now, accept any Bearer token. In production, validate against a known token or JWT.
  next();
}

// POST /wholesale-registration
app.post('/wholesale-registration', async (req, res) => {
  try {
    const data = req.body;
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID || '1BGoI_D6I0RO6MYigefxMzI0ZvK0UxsdXhnIl4BmYKkE';

    // Get current row count
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'registration!A:A',
    });
    const rows = response.data.values || [];
    const nextRow = rows.length + 1;

    // Prepare data for spreadsheet
    const rowData = [
      new Date().toISOString(),
      data.businessName || '',
      data.contactName || '',
      data.email || '',
      data.phone || '',
      data.website || '',
      data.businessType || '',
      data.yearlyRevenue || '',
      data.employeeCount || '',
      data.currentSupplier || '',
      data.needs || '',
      data.budget || '',
      data.timeline || '',
      'pending' // status
    ];

    // Append to spreadsheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `registration!A${nextRow}:N${nextRow}`,
      valueInputOption: 'RAW',
      resource: { values: [rowData] },
    });

    res.json({ message: 'Registration submitted successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/wholesale-registrations
app.get('/admin/wholesale-registrations', requireAuth, async (req, res) => {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID || '1BGoI_D6I0RO6MYigefxMzI0ZvK0UxsdXhnIl4BmYKkE';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'registration!A:N',
    });

    const rows = response.data.values || [];
    const registrations = rows.slice(1).map((row, index) => ({
      id: index + 1,
      submittedAt: row[0],
      businessName: row[1],
      contactName: row[2],
      email: row[3],
      phone: row[4],
      website: row[5],
      businessType: row[6],
      yearlyRevenue: row[7],
      employeeCount: row[8],
      currentSupplier: row[9],
      needs: row[10],
      budget: row[11],
      timeline: row[12],
      status: row[13] || 'pending'
    }));

    res.json(registrations);
  } catch (error) {
    console.error('Get Registrations Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/wholesale-registrations/{registrationId}
app.get('/admin/wholesale-registrations/:registrationId', requireAuth, async (req, res) => {
  try {
    const { registrationId } = req.params;
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID || '1BGoI_D6I0RO6MYigefxMzI0ZvK0UxsdXhnIl4BmYKkE';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'registration!A:N',
    });

    const rows = response.data.values || [];
    const rowIndex = parseInt(registrationId);
    if (rowIndex < 1 || rowIndex >= rows.length) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const row = rows[rowIndex];
    const registration = {
      id: rowIndex,
      submittedAt: row[0],
      businessName: row[1],
      contactName: row[2],
      email: row[3],
      phone: row[4],
      website: row[5],
      businessType: row[6],
      yearlyRevenue: row[7],
      employeeCount: row[8],
      currentSupplier: row[9],
      needs: row[10],
      budget: row[11],
      timeline: row[12],
      status: row[13] || 'pending'
    };

    res.json(registration);
  } catch (error) {
    console.error('Get Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/wholesale-registrations/{registrationId}/decision
app.post('/admin/wholesale-registrations/:registrationId/decision', requireAuth, async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { decision } = req.body; // 'approved' or 'rejected'
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID || '1BGoI_D6I0RO6MYigefxMzI0ZvK0UxsdXhnIl4BmYKkE';

    const rowIndex = parseInt(registrationId) + 1; // +1 because header

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `registration!N${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[decision]] },
    });

    res.json({ message: `Registration ${decision}` });
  } catch (error) {
    console.error('Decision Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /quote-request
app.post('/quote-request', async (req, res) => {
  try {
    const data = req.body;
    // For now, just log the quote request. In production, send email or store in DB.
    console.log('Quote Request:', data);
    res.json({ message: 'Quote request submitted successfully' });
  } catch (error) {
    console.error('Quote Request Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /customer/wholesale-account
app.get('/customer/wholesale-account', async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).json({ error: 'customerId required' });
    }

    // Mock lookup - in production, query database or spreadsheet
    const account = {
      customerId,
      accountType: 'wholesale',
      discount: '20%',
      status: 'active'
    };

    res.json(account);
  } catch (error) {
    console.error('Account Lookup Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cloud Function entry point
functions.http('wholesaleApi', app);