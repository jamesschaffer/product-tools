import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getNotionClient, getDbIds, handleError } from '../../_lib/notion';
import { requireAuth } from '../../_lib/auth';
import { GoalCreateSchema, validateRequest } from '../../_lib/validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  try {
    const notion = getNotionClient();
    const { goalsDbId } = getDbIds();

    if (req.method === 'GET') {
      const response = await notion.databases.query({
        database_id: goalsDbId,
      });

      const goals = response.results.map((page: any) => ({
        id: page.id,
        name: page.properties.Name?.title?.[0]?.plain_text || '',
        description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
        desiredOutcome: page.properties['Desired Outcome']?.rich_text?.[0]?.plain_text || '',
        priority: page.properties.Priority?.number || 0,
        order: page.properties.Order?.number || 0,
      }));

      return res.status(200).json(goals);
    }

    if (req.method === 'POST') {
      const validation = validateRequest(GoalCreateSchema, req.body, res);
      if (!validation.success) return;

      const { name, description, desiredOutcome, priority, order } = validation.data;

      const response = await notion.pages.create({
        parent: { database_id: goalsDbId },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Description: { rich_text: description ? [{ text: { content: description } }] : [] },
          'Desired Outcome': { rich_text: [{ text: { content: desiredOutcome } }] },
          Priority: { number: priority },
          Order: { number: order },
        },
      });

      return res.status(201).json({
        id: response.id,
        name,
        description,
        desiredOutcome,
        priority,
        order,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const { message, status } = handleError(error);
    return res.status(status).json({ error: message });
  }
}
