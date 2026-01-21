import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthConfigured } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;
  const authRequired = isAuthConfigured();

  // If auth not required, user is authenticated
  if (!authRequired) {
    return res.status(200).json({ authenticated: true, authRequired: false });
  }

  // Check if user has valid API key
  const providedKey = req.headers['x-api-key'] || parseCookie(req.headers.cookie, 'api_key');
  const authenticated = providedKey === apiKey;

  return res.status(200).json({ authenticated, authRequired: true });
}

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies[name] || null;
}
