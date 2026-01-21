import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getNotionClient, getDbIds, handleError } from '../../_lib/notion';
import { requireAuth } from '../../_lib/auth';
import { InitiativeCreateSchema, validateRequest } from '../../_lib/validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  try {
    const notion = getNotionClient();
    const { initiativesDbId } = getDbIds();

    if (req.method === 'GET') {
      const response = await notion.databases.query({
        database_id: initiativesDbId,
      });

      const initiatives = response.results.map((page: any) => ({
        id: page.id,
        name: page.properties.Name?.title?.[0]?.plain_text || '',
        idealOutcome: page.properties['Ideal Outcome']?.rich_text?.[0]?.plain_text || '',
        goalId: page.properties.Goal?.relation?.[0]?.id || '',
        order: page.properties.Order?.number || 0,
      }));

      return res.status(200).json(initiatives);
    }

    if (req.method === 'POST') {
      const validation = validateRequest(InitiativeCreateSchema, req.body, res);
      if (!validation.success) return;

      const { name, idealOutcome, goalId, order } = validation.data;

      const response = await notion.pages.create({
        parent: { database_id: initiativesDbId },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          'Ideal Outcome': { rich_text: [{ text: { content: idealOutcome } }] },
          Goal: { relation: [{ id: goalId }] },
          Order: { number: order },
        },
      });

      return res.status(201).json({
        id: response.id,
        name,
        idealOutcome,
        goalId,
        order,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const { message, status } = handleError(error);
    return res.status(status).json({ error: message });
  }
}
