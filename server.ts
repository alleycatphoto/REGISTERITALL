import express from "express";
import cors from "cors";
import { google } from "googleapis";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Mock MCP Tools
  const shopifyTool = {
    name: "fetchShopifyData",
    description: "Fetches product or customer data from the Shopify Storefront.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "The search query for products or customers." }
      },
      required: ["query"]
    }
  };

  const ghlTool = {
    name: "fetchGHLData",
    description: "Fetches contact or opportunity data from GoHighLevel.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING, description: "The email of the contact to search for." }
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
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: ${JSON.stringify(context)}\n\nUser Prompt: ${prompt}`,
        config: {
          tools: [{ functionDeclarations: [shopifyTool, ghlTool] }]
        }
      });
      
      const call = response.functionCalls?.[0];
      if (call) {
        let toolResult = {};
        if (call.name === "fetchShopifyData") {
          toolResult = { status: "Found", message: `Mock Shopify data for ${call.args.query}: Premium Rug Pad v2 available.` };
        } else if (call.name === "fetchGHLData") {
          toolResult = { status: "Found", message: `Mock GHL data for ${call.args.email}: Customer is a 'VIP Designer' in our CRM.` };
        }
        
        const followUp = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            { role: 'user', parts: [{ text: `Context: ${JSON.stringify(context)}\n\nUser Prompt: ${prompt}` }] },
            { role: 'model', parts: [{ functionCall: { name: call.name, args: call.args } }] },
            { role: 'user', parts: [{ functionResponse: { name: call.name, response: toolResult } }] }
          ]
        });
        return res.json({ text: followUp.text });
      }

      res.json({ text: response.text });
    } catch (error: any) {
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

      if (!spreadsheetId) {
        const ss = await sheets.spreadsheets.create({
          requestBody: { properties: { title: `UnderItAll Wholesale Registrations - ${new Date().toLocaleDateString()}` } }
        });
        spreadsheetId = ss.data.spreadsheetId;
      }

      const ssInfo = await sheets.spreadsheets.get({ spreadsheetId });
      let registrationSheet = ssInfo.data.sheets?.find(s => s.properties?.title === 'registration');
      
      if (!registrationSheet) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: 'registration' } } }]
          }
        });
        
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

      let fileUrl = "No file uploaded";
      if (file && file.base64) {
        const fileMetadata = { name: `ResaleCert_${data.companyName}_${Date.now()}` };
        const media = { mimeType: file.type, body: Buffer.from(file.base64, 'base64') };
        const uploadedFile = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink'
        });
        
        await drive.permissions.create({
          fileId: uploadedFile.data.id!,
          requestBody: { role: 'reader', type: 'anyone' }
        });
        fileUrl = uploadedFile.data.webViewLink!;
      }

      let aiSummary = "N/A";
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Analyze this wholesale applicant: 
        Company: ${data.companyName}
        Type: ${data.companyType}
        Website: ${data.website}
        Instagram: ${data.instagram}
        
        Provide a 1-sentence professional assessment of their fit for UnderItAll's trade program.`;
        
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        aiSummary = aiResponse.text || "N/A";
      }

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
    } catch (error: any) {
      console.error('Submission Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
