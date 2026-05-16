import { Router } from 'express';
import { prisma } from '../../prisma.js';
import { parseAdminBody, reviewStatusPatchSchema } from './admin-validation.js';
import { getAdminPagination } from './admin-pagination.js';

export const adminInboundRouter = Router();

adminInboundRouter.get('/reviews', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const status = req.query.status as string | undefined;
    const where =
      status && ['pending', 'approved', 'rejected'].includes(status)
        ? { status: status as 'pending' | 'approved' | 'rejected' }
        : {};
    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminInboundRouter.patch('/reviews/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(reviewStatusPatchSchema, req, res);
    if (!body) return;
    const row = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: body.status },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminInboundRouter.get('/booking-inquiries', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.bookingInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          citySlug: true,
          relatedSlug: true,
          bookingType: true,
          checkIn: true,
          checkOut: true,
          guests: true,
          createdAt: true,
        },
      }),
      prisma.bookingInquiry.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminInboundRouter.get('/booking-inquiries/:id', async (req, res, next) => {
  try {
    const row = await prisma.bookingInquiry.findUnique({ where: { id: req.params.id } });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminInboundRouter.get('/contact-inquiries', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          subject: true,
          createdAt: true,
        },
      }),
      prisma.contactInquiry.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminInboundRouter.get('/contact-inquiries/:id', async (req, res, next) => {
  try {
    const row = await prisma.contactInquiry.findUnique({ where: { id: req.params.id } });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});
