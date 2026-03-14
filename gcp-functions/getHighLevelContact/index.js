const functions = require('@google-cloud/functions-framework');

functions.http('getHighLevelContact', async (req, res) => {
  // Handle CORS so Shopify can talk to it
  res.set('Access-Control-Allow-Origin', '*'); 
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Fast response to preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const email = req.query.email;
  const locationId = req.query.locationId;

  if (!email || !locationId) {
    return res.status(400).json({ error: 'Missing email or locationId' });
  }

  const apiKey = process.env.HL_API_KEY;
  const hlUrl = `https://services.leadconnectorhq.com/contacts/search/duplicate?email=${encodeURIComponent(email)}&locationId=${locationId}`;

  try {
    const response = await fetch(hlUrl, {
      method: 'GET',
      headers: {
        "Version": "2021-07-28",
        "Authorization": `Bearer ${apiKey}`
      }
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch data from HighLevel' });
  }
});
