import express from "express";
import cors from "cors";
import { google } from "googleapis";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";
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
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS || './gcp-middleware/credentials.json';
    return new google.auth.GoogleAuth({
      keyFilename,
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

  // MCP Manifest Endpoint
  app.get('/mcp/manifest', (req, res) => {
    res.json({
      tools: [
        {
          name: shopifyTool.name,
          description: shopifyTool.description,
          inputSchema: shopifyTool.parameters
        },
        {
          name: ghlTool.name,
          description: ghlTool.description,
          inputSchema: ghlTool.parameters
        }
      ],
      resources: [],
      prompts: [],
      errors: []
    });
  });

  // Generate MCP Manifest Endpoint
  app.post('/api/generate-mcp', async (req, res) => {
    const { description } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Missing Gemini API Key" });

    const apiKey = process.env.GEMINI_API_KEY.replace(/^["']|["']$/g, '').trim();

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate an MCP manifest for an API with the following description:\n\n${description}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tools: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "The name of the tool. This field is REQUIRED and must not be empty. It's used to generate the operation ID." },
                    title: { type: Type.STRING, description: "A human-readable title for the tool. Optional." },
                    description: { type: Type.STRING, description: "A description of what the tool does. Optional." },
                    inputSchema: { type: Type.OBJECT, description: "A JSON Schema object describing the input parameters for the tool. Optional. Can be any valid JSON object." },
                    outputSchema: { type: Type.OBJECT, description: "A JSON Schema object describing the output structure of the tool. Optional. Can be any valid JSON object." },
                    annotations: {
                      type: Type.OBJECT,
                      description: "Optional annotations for the tool.",
                      properties: {
                        title: { type: Type.STRING, description: "Annotation title. Optional." },
                        readOnlyHint: { type: Type.BOOLEAN, description: "Hint indicating if the tool is read-only. Optional." },
                        destructiveHint: { type: Type.BOOLEAN, description: "Hint indicating if the tool can have destructive side effects. Optional." },
                        idempotentHint: { type: Type.BOOLEAN, description: "Hint indicating if the tool is idempotent. Optional." },
                        openWorldHint: { type: Type.BOOLEAN, description: "Hint indicating if the tool interacts with the open world. Optional." },
                        additionalHints: { type: Type.OBJECT, description: "A map of additional string key-value hints. Optional." }
                      }
                    }
                  },
                  required: ["name"]
                },
                description: "A list of tool objects. This array is REQUIRED at the top level."
              },
              resources: { type: Type.ARRAY, items: { type: Type.OBJECT }, description: "Optional array of resource objects. The parser doesn't strictly define their content." },
              prompts: { type: Type.ARRAY, items: { type: Type.OBJECT }, description: "Optional array of prompt objects. The parser doesn't strictly define their content." },
              errors: { type: Type.ARRAY, items: { type: Type.OBJECT }, description: "Optional array of error objects. The parser doesn't strictly define their content." }
            },
            required: ["tools"]
          }
        }
      });
      
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error('Generate MCP Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Assistant Endpoint
  app.post('/ai-assist', async (req, res) => {
    const { prompt, context } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Missing Gemini API Key" });

    const apiKey = process.env.GEMINI_API_KEY.replace(/^["']|["']$/g, '').trim();

    try {
      const ai = new GoogleGenAI({ apiKey });
      
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
            { role: 'model', parts: [{ functionCall: { name: call.name, args: call.args, thought_signature: call.thought_signature } }] },
            { role: 'user', parts: [{ functionResponse: { name: call.name, thought_signature: call.thought_signature, response: toolResult } }] }
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
        const fileMetadata = {
          name: `ResaleCert_${data.companyName}_${Date.now()}`,
          parents: ['1APG5MVngPbOI2ZeTqD4IwY1KlwJsh22n']
        };
        const media = { mimeType: file.type, body: Readable.from(Buffer.from(file.base64, 'base64')) };
        const uploadedFile = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
          supportsAllDrives: true
        });
        
        try {
          await drive.permissions.create({
            fileId: uploadedFile.data.id!,
            requestBody: { role: 'reader', type: 'anyone' },
            supportsAllDrives: true
          });
        } catch (permError) {
          console.warn('Could not set public permissions on file:', permError.message);
        }
        fileUrl = uploadedFile.data.webViewLink!;
      }

      let aiSummary = "N/A";
      if (process.env.GEMINI_API_KEY) {
        const apiKey = process.env.GEMINI_API_KEY.replace(/^["']|["']$/g, '').trim();
        const ai = new GoogleGenAI({ apiKey });
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
        range: 'registration!A:Z',
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
