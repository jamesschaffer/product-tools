import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthConfigured, getAuthKeyFromRequest } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;
  const authRequired = isAuthConfigured();

  if (!authRequired) {
    return res.status(200).json({ authenticated: true, authRequired: false });
  }

  const providedKey = getAuthKeyFromRequest(req);
  const authenticated = providedKey === apiKey;

  return res.status(200).json({ authenticated, authRequired: true });
}
