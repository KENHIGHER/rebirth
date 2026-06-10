const readBody = async (req: any) => {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { kind, apiKey, baseUrl = 'https://api.openai.com/v1', body } = await readBody(req);
    if (!apiKey || typeof apiKey !== 'string') {
      res.status(400).json({ error: 'Missing API key' });
      return;
    }

    const parsedBase = new URL(String(baseUrl).replace(/\/+$/, ''));
    const host = parsedBase.hostname.toLowerCase();
    if (parsedBase.protocol !== 'https:' || host === 'localhost' || host === '127.0.0.1' || host === '::1' || /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
      res.status(400).json({ error: 'Base URL must be a public HTTPS endpoint' });
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
      res.status(400).json({ error: 'Unsupported OpenAI proxy kind' });
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
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'OpenAI proxy failed' });
  }
}
