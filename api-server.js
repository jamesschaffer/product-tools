// Simple local development server for API endpoints
import { createServer } from 'http';
import { URL } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Dynamically import handlers
const handlers = {
  '/api/auth/login': () => import('./api/auth/login.ts'),
  '/api/auth/logout': () => import('./api/auth/logout.ts'),
  '/api/auth/status': () => import('./api/auth/status.ts'),
  '/api/notion/config': () => import('./api/notion/config.ts'),
  '/api/notion/validate-token': () => import('./api/notion/validate-token.ts'),
  '/api/notion/create-databases': () => import('./api/notion/create-databases.ts'),
  '/api/notion/goals': () => import('./api/notion/goals/index.ts'),
  '/api/notion/initiatives': () => import('./api/notion/initiatives/index.ts'),
  '/api/notion/deliverables': () => import('./api/notion/deliverables/index.ts'),
};

// Dynamic route patterns
const dynamicRoutes = [
  { pattern: /^\/api\/notion\/goals\/([^/]+)$/, loader: () => import('./api/notion/goals/[id].ts') },
  { pattern: /^\/api\/notion\/initiatives\/([^/]+)$/, loader: () => import('./api/notion/initiatives/[id].ts') },
  { pattern: /^\/api\/notion\/deliverables\/([^/]+)$/, loader: () => import('./api/notion/deliverables/[id].ts') },
];

function createVercelRequest(req, body, query) {
  return {
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k.toLowerCase(), v])
    ),
    body: body ? JSON.parse(body) : undefined,
    query: query,
  };
}

function createVercelResponse(res) {
  const responseObj = {
    status: (code) => {
      res.statusCode = code;
      return responseObj;
    },
    setHeader: (name, value) => {
      res.setHeader(name, value);
      return responseObj;
    },
    json: (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
    send: (data) => {
      res.end(data);
    },
  };
  return responseObj;
}

const server = createServer(async (req, res) => {
  const startTime = Date.now();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-notion-token, x-goals-db-id, x-initiatives-db-id, x-deliverables-db-id');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const query = Object.fromEntries(url.searchParams);

  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // Read body for POST/PATCH requests
  let body = '';
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
    });
  }

  try {
    // Check static routes first
    if (handlers[pathname]) {
      const module = await handlers[pathname]();
      const handler = module.default;
      const vercelReq = createVercelRequest(req, body, query);
      const vercelRes = createVercelResponse(res);
      await handler(vercelReq, vercelRes);
      console.log(`[${new Date().toISOString()}] ${req.method} ${pathname} -> ${res.statusCode} (${Date.now() - startTime}ms)`);
      return;
    }

    // Check dynamic routes
    for (const route of dynamicRoutes) {
      const match = pathname.match(route.pattern);
      if (match) {
        const module = await route.loader();
        const handler = module.default;
        const vercelReq = createVercelRequest(req, body, { ...query, id: match[1] });
        const vercelRes = createVercelResponse(res);
        await handler(vercelReq, vercelRes);
        console.log(`[${new Date().toISOString()}] ${req.method} ${pathname} -> ${res.statusCode} (${Date.now() - startTime}ms)`);
        return;
      }
    }

    // 404 for unknown routes
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname} -> 404 (${Date.now() - startTime}ms)`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ERROR in ${req.method} ${pathname}:`, error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] API server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  Object.keys(handlers).forEach(path => console.log(`  - ${path}`));
  console.log('Dynamic routes:');
  dynamicRoutes.forEach(route => console.log(`  - ${route.pattern}`));
});
