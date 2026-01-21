import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getNotionClient, handleError } from '../../_lib/notion';
import { requireAuth } from '../../_lib/auth';
import { DeliverableUpdateSchema, validateRequest } from '../../_lib/validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing deliverable ID' });
  }

  try {
    const notion = getNotionClient();

    if (req.method === 'PATCH') {
      const validation = validateRequest(DeliverableUpdateSchema, req.body, res);
      if (!validation.success) return;

      const { name, description, status, startDate, endDate, initiativeId, order } = validation.data;

      const properties: Record<string, any> = {};
      if (name !== undefined) {
        properties.Name = { title: [{ text: { content: name } }] };
      }
      if (description !== undefined) {
        properties.Description = { rich_text: description ? [{ text: { content: description } }] : [] };
      }
      if (status !== undefined) {
        properties.Status = { select: { name: status } };
      }
      if (startDate !== undefined) {
        properties['Start Date'] = startDate ? { date: { start: startDate } } : { date: null };
      }
      if (endDate !== undefined) {
        properties['End Date'] = endDate ? { date: { start: endDate } } : { date: null };
      }
      if (initiativeId !== undefined) {
        properties.Initiative = { relation: [{ id: initiativeId }] };
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
