import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import express from 'express';

/** Load `.env` from `AirShipBackend/` even when `node`/`tsx` is started with another cwd. */
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(backendRoot, '.env') });
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { createApiRouter } from './routes/index.js';
import { openapiSpecification } from './openapi-document.js';
import { prisma } from './prisma.js';
import { ensureMediaRoot, getMediaRoot, MEDIA_URL_PREFIX } from './media-storage.js';
import { apiGeneralLimiter, helmetMiddleware } from './security.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

const slowMs = Math.max(0, Number(process.env.LOG_SLOW_REQUEST_MS ?? '3000')) || 3000;

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (ms >= slowMs) {
      console.warn(`[slow http] ${ms}ms ${req.method} ${req.originalUrl}`);
    }
  });
  next();
});

app.use(helmetMiddleware());
app.use(compression({ threshold: 2048 }));

ensureMediaRoot();
app.use(
  MEDIA_URL_PREFIX,
  express.static(getMediaRoot(), {
    maxAge: '365d',
    immutable: true,
    fallthrough: false,
  }),
);

const jsonSmall = express.json({ limit: '100kb' });
const jsonLarge = express.json({ limit: '2mb' });
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/admin/uploads')) {
    next();
    return;
  }
  if (req.originalUrl.startsWith('/api/admin')) {
    jsonLarge(req, res, next);
  } else {
    jsonSmall(req, res, next);
  }
});

const rawCors = process.env.CORS_ORIGIN;
const corsList = rawCors ? rawCors.split(',').map((s) => s.trim()).filter(Boolean) : [];
app.use(corsList.length ? cors({ origin: corsList }) : cors());

app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/admin')) {
    next();
    return;
  }
  apiGeneralLimiter(req, res, next);
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/openapi.json', (_req, res) => {
  res.json(openapiSpecification);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification, { customSiteTitle: 'AirShip API docs' }));

app.use('/api', createApiRouter());

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(port, () => {
  console.log(`AirShip API listening on ${port}`);
  console.log(`Swagger UI http://localhost:${port}/api-docs`);
  void prisma
    .$connect()
    .then(() => console.log('Prisma: database connection ready'))
    .catch((e: unknown) => console.error('Prisma: initial $connect failed', e));
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} is already in use. Stop the other process (e.g. npm run dev) or set PORT in .env to another port.`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
