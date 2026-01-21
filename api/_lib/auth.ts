import type { VercelRequest, VercelResponse } from '@vercel/node';

export function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  const apiKey = process.env.API_KEY;

  // If no API key is configured, allow all requests (dev mode)
  if (!apiKey) {
    return true;
  }

  // Check for API key in header or cookie
  const providedKey = req.headers['x-api-key'] || parseCookie(req.headers.cookie, 'api_key');

  if (providedKey !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
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

export function isAuthConfigured(): boolean {
  return !!process.env.API_KEY;
}
