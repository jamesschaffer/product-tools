/**
 * Standalone Production Server
 *
 * Serves both the static frontend and API endpoints.
 * Used for Docker deployments and non-Vercel hosting.
 *
 * Usage:
 *   NODE_ENV=production npx tsx server.ts
 *
 * Or after building:
 *   node dist-server/server.js
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import compression from 'compression';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.json());

// ============================================================================
// Auth Helpers (shared across routes)
// ============================================================================

function parseCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function requireAuth(req: Request, res: Response): boolean {
  const apiKey = process.env.API_KEY;

  // If no API_KEY is set, auth is disabled (dev mode)
  if (!apiKey) {
    return true;
  }

  const providedKey =
    (req.headers['x-api-key'] as string) || parseCookie(req.headers.cookie, 'api_key');

  if (providedKey !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
}

// ============================================================================
// Notion Client Setup
// ============================================================================

import { Client } from '@notionhq/client';

let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (notionClient) return notionClient;

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error('NOTION_TOKEN environment variable is not configured');
  }

  notionClient = new Client({ auth: token });
  return notionClient;
}

function getDbIds() {
  const goalsDbId = process.env.GOALS_DB_ID;
  const initiativesDbId = process.env.INITIATIVES_DB_ID;
  const deliverablesDbId = process.env.DELIVERABLES_DB_ID;

  if (!goalsDbId || !initiativesDbId || !deliverablesDbId) {
    throw new Error('Database IDs not configured in environment variables');
  }

  return { goalsDbId, initiativesDbId, deliverablesDbId };
}

function handleNotionError(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    if (error.message.includes('Could not find')) {
      return { message: 'Resource not found', status: 404 };
    }
    if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
      return { message: 'Notion authentication failed', status: 401 };
    }
    return { message: error.message, status: 500 };
  }
  return { message: 'Unknown error', status: 500 };
}

// ============================================================================
// Validation Schemas (Zod)
// ============================================================================

import { z } from 'zod';

const DeliverableStatusSchema = z.enum(['shipped', 'in-progress', 'planned']);

const GoalCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  desiredOutcome: z.string().min(1, 'Desired outcome is required'),
  priority: z.number().int().positive('Priority must be a positive integer'),
  order: z.number().int().nonnegative('Order must be a non-negative integer'),
});

const GoalUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  desiredOutcome: z.string().min(1).optional(),
  priority: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
});

const InitiativeCreateSchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  name: z.string().min(1, 'Name is required'),
  idealOutcome: z.string().min(1, 'Ideal outcome is required'),
  order: z.number().int().nonnegative('Order must be a non-negative integer'),
});

const InitiativeUpdateSchema = z.object({
  goalId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  idealOutcome: z.string().min(1).optional(),
  order: z.number().int().nonnegative().optional(),
});

const DeliverableCreateSchema = z.object({
  initiativeId: z.string().min(1, 'Initiative ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: DeliverableStatusSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  order: z.number().int().nonnegative('Order must be a non-negative integer'),
});

const DeliverableUpdateSchema = z.object({
  initiativeId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: DeliverableStatusSchema.optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  order: z.number().int().nonnegative().optional(),
});

function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  res: Response
): { success: true; data: T } | { success: false } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Validation failed', details: errors });
    return { success: false };
  }

  return { success: true, data: result.data };
}

function getParamId(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

// ============================================================================
// Auth Routes
// ============================================================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { key } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(200).json({ success: true, message: 'Auth disabled' });
  }

  if (key !== apiKey) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  res.setHeader(
    'Set-Cookie',
    `api_key=${key}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`
  );
  return res.status(200).json({ success: true });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.setHeader('Set-Cookie', 'api_key=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');
  return res.status(200).json({ success: true });
});

app.get('/api/auth/status', (req: Request, res: Response) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.json({ authenticated: true, authRequired: false });
  }

  const providedKey = parseCookie(req.headers.cookie, 'api_key');
  const authenticated = providedKey === apiKey;

  return res.json({ authenticated, authRequired: true });
});

// ============================================================================
// Config Route
// ============================================================================

app.get('/api/notion/config', (_req: Request, res: Response) => {
  const configured = !!(
    process.env.NOTION_TOKEN &&
    process.env.GOALS_DB_ID &&
    process.env.INITIATIVES_DB_ID &&
    process.env.DELIVERABLES_DB_ID
  );
  return res.json({ configured });
});

// ============================================================================
// Goals Routes
// ============================================================================

app.get('/api/notion/goals', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const notion = getNotionClient();
    const { goalsDbId } = getDbIds();

    const response = await notion.databases.query({ database_id: goalsDbId });

    const goals = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title?.[0]?.plain_text || '',
      description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
      desiredOutcome: page.properties['Desired Outcome']?.rich_text?.[0]?.plain_text || '',
      priority: page.properties.Priority?.number || 0,
      order: page.properties.Order?.number || 0,
    }));

    return res.json(goals);
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.post('/api/notion/goals', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const validation = validateRequest(GoalCreateSchema, req.body, res);
  if (!validation.success) return;

  const { name, description, desiredOutcome, priority, order } = validation.data;

  try {
    const notion = getNotionClient();
    const { goalsDbId } = getDbIds();

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
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.patch('/api/notion/goals/:id', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const id = getParamId(req.params.id);
  const validation = validateRequest(GoalUpdateSchema, req.body, res);
  if (!validation.success) return;

  const { name, description, desiredOutcome, priority, order } = validation.data;

  try {
    const notion = getNotionClient();

    const properties: Record<string, any> = {};
    if (name !== undefined) {
      properties.Name = { title: [{ text: { content: name } }] };
    }
    if (description !== undefined) {
      properties.Description = { rich_text: description ? [{ text: { content: description } }] : [] };
    }
    if (desiredOutcome !== undefined) {
      properties['Desired Outcome'] = { rich_text: [{ text: { content: desiredOutcome } }] };
    }
    if (priority !== undefined) {
      properties.Priority = { number: priority };
    }
    if (order !== undefined) {
      properties.Order = { number: order };
    }

    await notion.pages.update({ page_id: id, properties });

    return res.json({ id, ...validation.data });
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.delete('/api/notion/goals/:id', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const id = getParamId(req.params.id);

  try {
    const notion = getNotionClient();
    await notion.pages.update({ page_id: id, archived: true });
    return res.json({ success: true });
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

// ============================================================================
// Initiatives Routes
// ============================================================================

app.get('/api/notion/initiatives', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const notion = getNotionClient();
    const { initiativesDbId } = getDbIds();

    const response = await notion.databases.query({ database_id: initiativesDbId });

    const initiatives = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title?.[0]?.plain_text || '',
      idealOutcome: page.properties['Ideal Outcome']?.rich_text?.[0]?.plain_text || '',
      goalId: page.properties.Goal?.relation?.[0]?.id || '',
      order: page.properties.Order?.number || 0,
    }));

    return res.json(initiatives);
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.post('/api/notion/initiatives', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const validation = validateRequest(InitiativeCreateSchema, req.body, res);
  if (!validation.success) return;

  const { name, idealOutcome, goalId, order } = validation.data;

  try {
    const notion = getNotionClient();
    const { initiativesDbId } = getDbIds();

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
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.patch('/api/notion/initiatives/:id', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const id = getParamId(req.params.id);
  const validation = validateRequest(InitiativeUpdateSchema, req.body, res);
  if (!validation.success) return;

  const { name, idealOutcome, goalId, order } = validation.data;

  try {
    const notion = getNotionClient();

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

    await notion.pages.update({ page_id: id, properties });

    return res.json({ id, ...validation.data });
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.delete('/api/notion/initiatives/:id', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const id = getParamId(req.params.id);

  try {
    const notion = getNotionClient();
    await notion.pages.update({ page_id: id, archived: true });
    return res.json({ success: true });
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

// ============================================================================
// Deliverables Routes
// ============================================================================

app.get('/api/notion/deliverables', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const notion = getNotionClient();
    const { deliverablesDbId } = getDbIds();

    const response = await notion.databases.query({ database_id: deliverablesDbId });

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

    return res.json(deliverables);
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.post('/api/notion/deliverables', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const validation = validateRequest(DeliverableCreateSchema, req.body, res);
  if (!validation.success) return;

  const { name, description, status, startDate, endDate, initiativeId, order } = validation.data;

  try {
    const notion = getNotionClient();
    const { deliverablesDbId } = getDbIds();

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
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.patch('/api/notion/deliverables/:id', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const id = getParamId(req.params.id);
  const validation = validateRequest(DeliverableUpdateSchema, req.body, res);
  if (!validation.success) return;

  const { name, description, status, startDate, endDate, initiativeId, order } = validation.data;

  try {
    const notion = getNotionClient();

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

    await notion.pages.update({ page_id: id, properties });

    return res.json({ id, ...validation.data });
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

app.delete('/api/notion/deliverables/:id', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const id = getParamId(req.params.id);

  try {
    const notion = getNotionClient();
    await notion.pages.update({ page_id: id, archived: true });
    return res.json({ success: true });
  } catch (error) {
    const { message, status } = handleNotionError(error);
    return res.status(status).json({ error: message });
  }
});

// ============================================================================
// Static File Serving (Production)
// ============================================================================

// In production (compiled), we're in dist-server, so dist is at ../dist
// In development (tsx), we're in root, so dist is at ./dist
const distPath = existsSync(join(__dirname, 'dist'))
  ? join(__dirname, 'dist')
  : join(__dirname, '..', 'dist');

if (existsSync(distPath)) {
  // Serve static files from dist folder
  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all non-API routes
  // Express 5 requires named wildcard parameter
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Serve index.html for SPA routing
    res.sendFile(join(distPath, 'index.html'));
  });
} else {
  console.warn('Warning: dist folder not found. Run "npm run build" first for production.');
  app.get('/', (_req: Request, res: Response) => {
    res.send('Frontend not built. Run "npm run build" first.');
  });
}

// ============================================================================
// Error Handler
// ============================================================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           Product Roadmap Server                           ║
╚════════════════════════════════════════════════════════════╝

Server running on http://localhost:${PORT}

Environment:
  NOTION_TOKEN: ${process.env.NOTION_TOKEN ? '✓ configured' : '✗ missing'}
  GOALS_DB_ID: ${process.env.GOALS_DB_ID ? '✓ configured' : '✗ missing'}
  INITIATIVES_DB_ID: ${process.env.INITIATIVES_DB_ID ? '✓ configured' : '✗ missing'}
  DELIVERABLES_DB_ID: ${process.env.DELIVERABLES_DB_ID ? '✓ configured' : '✗ missing'}
  API_KEY: ${process.env.API_KEY ? '✓ configured' : '✗ disabled (no auth)'}
`);
});
