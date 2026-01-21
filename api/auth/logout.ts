import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the API key cookie
  res.setHeader('Set-Cookie', 'api_key=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');
  return res.status(200).json({ success: true });
}
