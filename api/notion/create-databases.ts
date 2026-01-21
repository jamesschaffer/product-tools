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

  const { parentPageId } = req.body as { parentPageId: string };
  if (!parentPageId) {
    return res.status(400).json({ error: 'Missing parent page ID' });
  }

  try {
    const notion = new Client({ auth: token });

    // Create Goals database
    const goalsDb = await notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Goals' } }],
      properties: {
        Name: { title: {} },
        Description: { rich_text: {} },
        'Desired Outcome': { rich_text: {} },
        Priority: { number: {} },
        Order: { number: {} },
      },
    });

    // Create Initiatives database with relation to Goals
    const initiativesDb = await notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Initiatives' } }],
      properties: {
        Name: { title: {} },
        'Ideal Outcome': { rich_text: {} },
        Goal: {
          relation: {
            database_id: goalsDb.id,
            single_property: {},
          },
        },
        Order: { number: {} },
      },
    });

    // Create Deliverables database with relation to Initiatives
    const deliverablesDb = await notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Deliverables' } }],
      properties: {
        Name: { title: {} },
        Description: { rich_text: {} },
        Status: {
          select: {
            options: [
              { name: 'planned', color: 'gray' },
              { name: 'in-progress', color: 'blue' },
              { name: 'shipped', color: 'green' },
            ],
          },
        },
        'Start Date': { date: {} },
        'End Date': { date: {} },
        Initiative: {
          relation: {
            database_id: initiativesDb.id,
            single_property: {},
          },
        },
        Order: { number: {} },
      },
    });

    return res.status(200).json({
      success: true,
      databases: {
        goalsDbId: goalsDb.id,
        initiativesDbId: initiativesDb.id,
        deliverablesDbId: deliverablesDb.id,
      },
    });
  } catch (error) {
    console.error('Error creating databases:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
