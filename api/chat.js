const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Try req.body (Vercel auto-parsed), fallback to reading stream
  let body = req.body;
  if (!body || typeof body !== 'object') {
    const raw = await new Promise((resolve) => {
      let d = '';
      req.on('data', c => { d += c; });
      req.on('end', () => resolve(d));
    });
    try { body = JSON.parse(raw); } catch (e) {
      return res.status(400).json({ error: 'Could not parse request body' });
    }
  }

  if (!body || !body.messages) {
    return res.status(400).json({ error: 'Invalid request - missing messages' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const payload = JSON.stringify(body);

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          res.status(apiRes.statusCode).json(parsed);
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse Anthropic response' });
        }
        resolve();
      });
    });

    apiReq.on('error', (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });

    apiReq.write(payload);
    apiReq.end();
  });
};

module.exports.config = {
  api: { bodyParser: true },
};
