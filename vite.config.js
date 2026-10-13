import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Custom local dev middleware for /api/gemini
function localGeminiApiPlugin(env) {
  return {
    name: 'local-gemini-api',
    configureServer(server) {
      server.middlewares.use('/api/gemini', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let bodyRaw = '';
        req.on('data', chunk => { bodyRaw += chunk; });
        req.on('end', async () => {
          try {
            const body = bodyRaw ? JSON.parse(bodyRaw) : {};
            const prompt = body.prompt;

            if (!prompt) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Prompt is required' }));
            }

            const key1 = (env.GEMINI_API_KEY_1 || env.VITE_GEMINI_API_KEY_1 || env.VITE_GEMINI_API_KEY || '').trim();
            const key2 = (env.GEMINI_API_KEY_2 || env.VITE_GEMINI_API_KEY_2 || '').trim();
            const keys = [key1, key2].filter(Boolean);

            if (keys.length === 0) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ 
                error: 'No Gemini API keys found. Please set VITE_GEMINI_API_KEY_1 or VITE_GEMINI_API_KEY_2 in .env.' 
              }));
            }

            const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
            let lastError = null;

            for (let kIdx = 0; kIdx < keys.length; kIdx++) {
              const activeKey = keys[kIdx];

              for (const model of models) {
                try {
                  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
                  const controller = new AbortController();
                  const timer = setTimeout(() => controller.abort(), 12000);

                  const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    signal: controller.signal
                  });

                  clearTimeout(timer);

                  if (response.ok) {
                    const data = await response.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({ success: true, model, keyIndex: kIdx + 1, text: rawText }));
                  }

                  const status = response.status;
                  if (status === 429 || status === 403) {
                    lastError = `Key ${kIdx + 1} quota/rate-limit error (${status})`;
                    break;
                  }
                  lastError = `Model ${model} returned HTTP ${status}`;
                } catch (err) {
                  lastError = err.message || 'Network error';
                }
              }

              if (kIdx < keys.length - 1) {
                await new Promise(r => setTimeout(r, 600));
              }
            }

            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'All Gemini keys/models failed', details: lastError }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), localGeminiApiPlugin(env)],
  };
});
