import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;

  // If no API key configured, auth is disabled
  if (!apiKey) {
    return res.status(200).json({ success: true, message: 'Auth not configured' });
  }

  const { key } = req.body || {};

  if (key !== apiKey) {
    return res.status(401).json({ error: 'Invalid access key' });
  }

  // Set HTTP-only cookie for the API key
  res.setHeader('Set-Cookie', `api_key=${key}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`);
  return res.status(200).json({ success: true });
}
