import { Client } from '@notionhq/client';

// Singleton Notion client - initialized from environment variables
let notionClient: Client | null = null;

export function getNotionClient(): Client {
  if (notionClient) return notionClient;

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error('NOTION_TOKEN environment variable is not configured');
  }

  notionClient = new Client({ auth: token });
  return notionClient;
}

export function getDbIds() {
  const goalsDbId = process.env.GOALS_DB_ID;
  const initiativesDbId = process.env.INITIATIVES_DB_ID;
  const deliverablesDbId = process.env.DELIVERABLES_DB_ID;

  if (!goalsDbId || !initiativesDbId || !deliverablesDbId) {
    throw new Error('Database IDs not configured. Set GOALS_DB_ID, INITIATIVES_DB_ID, and DELIVERABLES_DB_ID environment variables.');
  }

  return { goalsDbId, initiativesDbId, deliverablesDbId };
}

export function isConfigured(): boolean {
  return !!(
    process.env.NOTION_TOKEN &&
    process.env.GOALS_DB_ID &&
    process.env.INITIATIVES_DB_ID &&
    process.env.DELIVERABLES_DB_ID
  );
}

export function handleError(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    if (error.message.includes('unauthorized') || error.message.includes('token')) {
      return { message: 'Invalid Notion token', status: 401 };
    }
    if (error.message.includes('not found')) {
      return { message: 'Resource not found', status: 404 };
    }
    return { message: error.message, status: 500 };
  }
  return { message: 'Unknown error', status: 500 };
}
