import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from '@notionhq/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers['x-notion-token'] as string;
  if (!token) {
    return res.status(400).json({ error: 'Missing Notion token' });
  }

  try {
    const notion = new Client({ auth: token });
    const user = await notion.users.me({});

    return res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        type: user.type,
      },
    });
  } catch {
    return res.status(401).json({
      valid: false,
      error: 'Invalid token or insufficient permissions',
    });
  }
}
