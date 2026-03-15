require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: '*',
  methods: ['OPTIONS', 'POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// Google Auth Setup
async function getAuthClient() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is missing.');
  }
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });
}

// Mock MCP Tools (In a real scenario, these would call the respective APIs)
const shopifyTool = {
  name: "fetchShopifyData",
  description: "Fetches product or customer data from the Shopify Storefront.",
  parameters: {
    type: "OBJECT",
    properties: {
      query: { type: "STRING", description: "The search query for products or customers." }
    },
    required: ["query"]
  }
};

const ghlTool = {
  name: "fetchGHLData",
  description: "Fetches contact or opportunity data from GoHighLevel.",
  parameters: {
    type: "OBJECT",
    properties: {
      email: { type: "STRING", description: "The email of the contact to search for." }
    },
    required: ["email"]
  }
};

// AI Assistant Endpoint
app.post('/ai-assist', async (req, res) => {
  const { prompt, context } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Missing Gemini API Key" });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = ai.models.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      tools: [{ functionDeclarations: [shopifyTool, ghlTool] }]
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(`Context: ${JSON.stringify(context)}\n\nUser Prompt: ${prompt}`);
    
    // Handle function calls if any
    const call = result.response.functionCalls()?.[0];
    if (call) {
      let toolResult = {};
      if (call.name === "fetchShopifyData") {
        toolResult = { status: "Found", message: `Mock Shopify data for ${call.args.query}: Premium Rug Pad v2 available.` };
      } else if (call.name === "fetchGHLData") {
        toolResult = { status: "Found", message: `Mock GHL data for ${call.args.email}: Customer is a 'VIP Designer' in our CRM.` };
      }
      
      const followUp = await chat.sendMessage([{ functionResponse: { name: call.name, response: toolResult } }]);
      return res.json({ text: followUp.response.text() });
    }

    res.json({ text: result.response.text() });
  } catch (error) {
    console.error('AI Assist Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit Wholesale Endpoint
app.post('/submit-wholesale', async (req, res) => {
  try {
    const { data, spreadsheetId: requestedId, file } = req.body;
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    let spreadsheetId = requestedId || process.env.SPREADSHEET_ID;

    // 1. Create Spreadsheet if not found/provided
    if (!spreadsheetId) {
      const ss = await sheets.spreadsheets.create({
        requestBody: { properties: { title: `UnderItAll Wholesale Registrations - ${new Date().toLocaleDateString()}` } }
      });
      spreadsheetId = ss.data.spreadsheetId;
    }

    // 2. Ensure "registration" sheet exists
    const ssInfo = await sheets.spreadsheets.get({ spreadsheetId });
    let registrationSheet = ssInfo.data.sheets.find(s => s.properties.title === 'registration');
    
    if (!registrationSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: 'registration' } } }]
        }
      });
      
      // Add Headers - Comprehensive and descriptive for Apps Script
      const headers = [
        "Timestamp", "Company Name", "First Name", "Last Name", "Title", "Email", 
        "Phone", "Website", "Instagram", "Street Address", "City", "State", 
        "Postal Code", "Country", "Company Type", "Tax ID", "Sample Set", 
        "Additional Info", "Marketing Opt-In", "Terms Accepted", "File URL", "AI Summary"
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'registration!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [headers] }
      });
    }

    // 3. Handle File Upload to Drive
    let fileUrl = "No file uploaded";
    if (file && file.base64) {
      const fileMetadata = { name: `ResaleCert_${data.companyName}_${Date.now()}` };
      const media = { mimeType: file.type, body: Buffer.from(file.base64, 'base64') };
      const uploadedFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink'
      });
      
      // Share file so it's accessible via the link
      await drive.permissions.create({
        fileId: uploadedFile.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });
      fileUrl = uploadedFile.data.webViewLink;
    }

    // 4. Gemini Summary
    let aiSummary = "N/A";
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.models.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      const prompt = `Analyze this wholesale applicant: 
      Company: ${data.companyName}
      Type: ${data.companyType}
      Website: ${data.website}
      Instagram: ${data.instagram}
      
      Provide a 1-sentence professional assessment of their fit for UnderItAll's trade program.`;
      const result = await model.generateContent(prompt);
      aiSummary = result.response.text();
    }

    // 5. Append Row - Map all 22 values (including Timestamp)
    const rowData = [
      new Date().toISOString(),
      data.companyName,
      data.firstName,
      data.lastName,
      data.title,
      data.email,
      data.phone,
      data.website,
      data.instagram,
      data.address,
      data.city,
      data.state,
      data.postalCode,
      data.country,
      data.companyType,
      data.taxId,
      data.sampleSet,
      data.additionalInfo,
      data.marketingOptIn ? "Yes" : "No",
      data.termsAccepted ? "Yes" : "No",
      fileUrl,
      aiSummary
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'registration!A:V',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowData] }
    });

    res.status(200).json({ message: 'Submission successful', spreadsheetId });
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Middleware listening on port ${PORT}`));
