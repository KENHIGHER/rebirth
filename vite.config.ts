import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

const readRequestBody = async (req: any) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

const openAIProxyPlugin = () => ({
  name: 'rebirth-openai-proxy',
  configureServer(server: any) {
    server.middlewares.use('/api/openai', async (req: any, res: any) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }
      try {
        const { kind, apiKey, baseUrl = 'https://api.openai.com/v1', body } = await readRequestBody(req);
        if (!apiKey) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing API key' }));
          return;
        }
        const parsedBase = new URL(String(baseUrl).replace(/\/+$/, ''));
        const host = parsedBase.hostname.toLowerCase();
        if (parsedBase.protocol !== 'https:' || host === 'localhost' || host === '127.0.0.1' || host === '::1' || /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Base URL must be a public HTTPS endpoint' }));
          return;
        }
        const target =
          kind === 'models'
            ? { url: `${parsedBase}/models`, init: { method: 'GET' } }
            : kind === 'responses'
              ? {
                  url: `${parsedBase}/responses`,
                  init: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body || {}),
                  },
                }
              : kind === 'chat'
                ? {
                    url: `${parsedBase}/chat/completions`,
                    init: {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body || {}),
                    },
                  }
                : null;
        if (!target) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Unsupported OpenAI proxy kind' }));
          return;
        }
        const response = await fetch(target.url, {
          ...target.init,
          headers: {
            ...(target.init.headers || {}),
            Authorization: `Bearer ${apiKey}`,
          },
        });
        const text = await response.text();
        res.statusCode = response.status;
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
        res.end(text);
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'OpenAI proxy failed' }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  base: '/rebirth/',
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    openAIProxyPlugin(),
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
})
