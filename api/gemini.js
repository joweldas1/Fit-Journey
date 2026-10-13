/**
 * Serverless API Handler for Gemini AI with Safe Dual Key Rotation
 * Supports Vercel, Netlify, Node serverless runtimes
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Retrieve keys from environment
  const key1 = (process.env.GEMINI_API_KEY_1 || process.env.VITE_GEMINI_API_KEY_1 || process.env.VITE_GEMINI_API_KEY || '').trim();
  const key2 = (process.env.GEMINI_API_KEY_2 || process.env.VITE_GEMINI_API_KEY_2 || '').trim();

  const keys = [key1, key2].filter(Boolean);

  if (keys.length === 0) {
    return res.status(500).json({ 
      error: 'No Gemini API keys configured on server. Please set GEMINI_API_KEY_1 or GEMINI_API_KEY_2.' 
    });
  }

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const activeKey = keys[keyIdx];

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
        
        const bodyPayload = {
          contents: [{ parts: [{ text: prompt }] }]
        };

        if (systemInstruction) {
          bodyPayload.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return res.status(200).json({
            success: true,
            model,
            keyIndex: keyIdx + 1,
            text: rawText
          });
        }

        const status = response.status;
        console.warn(`[Key ${keyIdx + 1}][${model}] Returned HTTP ${status}`);

        // If rate limit (429) or quota exceeded (403), break model loop to rotate key
        if (status === 429 || status === 403) {
          lastError = `Key ${keyIdx + 1} rate limited or quota exceeded (HTTP ${status})`;
          break; // Switch to next key immediately
        } else {
          lastError = `Model ${model} returned HTTP ${status}`;
        }
      } catch (err) {
        lastError = err.message || 'Network error';
        console.warn(`[Key ${keyIdx + 1}][${model}] Call failed:`, lastError);
      }
    }

    // Short backoff before trying next key
    if (keyIdx < keys.length - 1) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  return res.status(502).json({
    error: 'All Gemini API keys and models failed',
    details: lastError
  });
}
