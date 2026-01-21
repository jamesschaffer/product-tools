import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getNotionClient, getDbIds, handleError } from '../../_lib/notion';
import { requireAuth } from '../../_lib/auth';
import { DeliverableCreateSchema, validateRequest } from '../../_lib/validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  try {
    const notion = getNotionClient();
    const { deliverablesDbId } = getDbIds();

    if (req.method === 'GET') {
      const response = await notion.databases.query({
        database_id: deliverablesDbId,
      });

      const deliverables = response.results.map((page: any) => ({
        id: page.id,
        name: page.properties.Name?.title?.[0]?.plain_text || '',
        description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
        status: page.properties.Status?.select?.name || 'planned',
        startDate: page.properties['Start Date']?.date?.start || undefined,
        endDate: page.properties['End Date']?.date?.start || undefined,
        initiativeId: page.properties.Initiative?.relation?.[0]?.id || '',
        order: page.properties.Order?.number || 0,
      }));

      return res.status(200).json(deliverables);
    }

    if (req.method === 'POST') {
      const validation = validateRequest(DeliverableCreateSchema, req.body, res);
      if (!validation.success) return;

      const { name, description, status, startDate, endDate, initiativeId, order } = validation.data;

      const properties: Record<string, any> = {
        Name: { title: [{ text: { content: name } }] },
        Description: { rich_text: description ? [{ text: { content: description } }] : [] },
        Status: { select: { name: status } },
        Initiative: { relation: [{ id: initiativeId }] },
        Order: { number: order },
      };

      if (startDate) {
        properties['Start Date'] = { date: { start: startDate } };
      }
      if (endDate) {
        properties['End Date'] = { date: { start: endDate } };
      }

      const response = await notion.pages.create({
        parent: { database_id: deliverablesDbId },
        properties,
      });

      return res.status(201).json({
        id: response.id,
        name,
        description,
        status,
        startDate,
        endDate,
        initiativeId,
        order,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const { message, status } = handleError(error);
    return res.status(status).json({ error: message });
  }
}
