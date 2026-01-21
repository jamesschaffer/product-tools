import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getNotionClient, handleError } from '../../_lib/notion';
import { requireAuth } from '../../_lib/auth';
import { InitiativeUpdateSchema, validateRequest } from '../../_lib/validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing initiative ID' });
  }

  try {
    const notion = getNotionClient();

    if (req.method === 'PATCH') {
      const validation = validateRequest(InitiativeUpdateSchema, req.body, res);
      if (!validation.success) return;

      const { name, idealOutcome, goalId, order } = validation.data;

      const properties: Record<string, any> = {};
      if (name !== undefined) {
        properties.Name = { title: [{ text: { content: name } }] };
      }
      if (idealOutcome !== undefined) {
        properties['Ideal Outcome'] = { rich_text: [{ text: { content: idealOutcome } }] };
      }
      if (goalId !== undefined) {
        properties.Goal = { relation: [{ id: goalId }] };
      }
      if (order !== undefined) {
        properties.Order = { number: order };
      }

      await notion.pages.update({
        page_id: id,
        properties,
      });

      return res.status(200).json({ id, ...validation.data });
    }

    if (req.method === 'DELETE') {
      await notion.pages.update({
        page_id: id,
        archived: true,
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const { message, status } = handleError(error);
    return res.status(status).json({ error: message });
  }
}
