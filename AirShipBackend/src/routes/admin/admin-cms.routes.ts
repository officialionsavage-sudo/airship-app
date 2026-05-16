import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { sanitizePossiblyPastedImageStrings } from '../../image-encoding.js';
import { prisma } from '../../prisma.js';
import {
  parseAdminBody,
  siteContentPutSchema,
  siteSettingPutSchema,
} from './admin-validation.js';
import { getAdminPagination } from './admin-pagination.js';

export const adminCmsRouter = Router();

/** SiteContent */
adminCmsRouter.get('/site-content', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.siteContent.findMany({
        where,
        orderBy: { key: 'asc' },
        skip,
        take: pageSize,
        select: { key: true, updatedAt: true },
      }),
      prisma.siteContent.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCmsRouter.get('/site-content/:key', async (req, res, next) => {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: req.params.key } });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCmsRouter.put('/site-content/:key', async (req, res, next) => {
  try {
    const body = parseAdminBody(siteContentPutSchema, req, res);
    if (!body) return;
    const payloadJson = sanitizePossiblyPastedImageStrings(body.payload) as Prisma.InputJsonValue;
    const row = await prisma.siteContent.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, payload: payloadJson },
      update: { payload: payloadJson },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCmsRouter.delete('/site-content/:key', async (req, res, next) => {
  try {
    await prisma.siteContent.delete({ where: { key: req.params.key } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/** SiteSetting */
adminCmsRouter.get('/site-settings', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.siteSetting.findMany({
        where,
        orderBy: { key: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.siteSetting.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCmsRouter.get('/site-settings/:key', async (req, res, next) => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCmsRouter.put('/site-settings/:key', async (req, res, next) => {
  try {
    const body = parseAdminBody(siteSettingPutSchema, req, res);
    if (!body) return;
    const row = await prisma.siteSetting.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, value: body.value },
      update: { value: body.value },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCmsRouter.delete('/site-settings/:key', async (req, res, next) => {
  try {
    await prisma.siteSetting.delete({ where: { key: req.params.key } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
