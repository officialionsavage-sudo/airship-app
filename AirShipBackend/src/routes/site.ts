import type { Prisma, ReviewTarget } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../prisma.js';
import { mapPublicReview } from '../mappers.js';
import { resolveApiLocale } from '../locale.js';
import { localizeSiteContentPayload } from '../site-content-locale.js';

export const siteRouter = Router();

const REVIEW_TARGETS = new Set<string>(['app', 'service', 'tour', 'project']);

siteRouter.get('/reviews', async (req, res, next) => {
  try {
    const raw = req.query.targetType;
    const targetType = typeof raw === 'string' ? raw : undefined;
    if (targetType !== undefined && !REVIEW_TARGETS.has(targetType)) {
      res.status(400).json({ error: 'Invalid targetType' });
      return;
    }
    const where: Prisma.ReviewWhereInput = { status: 'approved' };
    if (targetType) {
      where.targetType = targetType as ReviewTarget;
    }
    const rows = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    res.json(rows.map(mapPublicReview));
  } catch (e) {
    next(e);
  }
});

siteRouter.get('/site-content/:key', async (req, res, next) => {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: req.params.key },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const locale = resolveApiLocale(req);
    const payload = localizeSiteContentPayload(req.params.key, row.payload, locale);
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

siteRouter.get('/site-settings', async (_req, res, next) => {
  try {
    const rows = await prisma.siteSetting.findMany();
    const out: Record<string, string> = {};
    for (const row of rows) {
      out[row.key] = row.value;
    }
    res.json(out);
  } catch (e) {
    next(e);
  }
});
