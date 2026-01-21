import type { VercelRequest, VercelResponse } from '@vercel/node';

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  return cookies[name] || null;
}

export function getAuthKeyFromRequest(req: VercelRequest): string | null {
  const headerKey = req.headers['x-api-key'];
  if (typeof headerKey === 'string') {
    return headerKey;
  }
  return parseCookie(req.headers.cookie, 'api_key');
}

export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return true;
  }

  const providedKey = getAuthKeyFromRequest(req);

  if (providedKey !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
}

export function isAuthConfigured(): boolean {
  return !!process.env.API_KEY;
}
