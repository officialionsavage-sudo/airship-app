import { Router } from 'express';
import { prisma } from '../prisma.js';
import { inquiryPostLimiter } from '../security.js';
import { bookingBodySchema, contactBodySchema, reviewBodySchema } from '../validation.js';

export const inquiriesRouter = Router();

inquiriesRouter.post('/bookings', inquiryPostLimiter, async (req, res, next) => {
  try {
    const parsed = bookingBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const b = parsed.data;
    const row = await prisma.bookingInquiry.create({
      data: {
        fullName: b.fullName,
        phone: b.phone,
        email: b.email,
        citySlug: b.citySlug,
        relatedSlug: b.relatedSlug,
        bookingType: b.bookingType,
        checkIn: b.checkIn ?? null,
        checkOut: b.checkOut ?? null,
        guests: b.guests ?? null,
        notes: b.notes ?? null,
      },
    });
    res.status(201).json({
      success: true,
      confirmationId: row.id,
      payload: {
        fullName: b.fullName,
        phone: b.phone,
        email: b.email,
        citySlug: b.citySlug,
        relatedSlug: b.relatedSlug,
        bookingType: b.bookingType,
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
        guests: b.guests,
        notes: b.notes,
      },
    });
  } catch (e) {
    next(e);
  }
});

inquiriesRouter.post('/contact', inquiryPostLimiter, async (req, res, next) => {
  try {
    const parsed = contactBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const c = parsed.data;
    await prisma.contactInquiry.create({
      data: {
        fullName: c.fullName,
        phone: c.phone,
        email: c.email,
        subject: c.subject,
        message: c.message,
      },
    });
    res.status(201).json({
      success: true,
      message: 'Contact request submitted successfully.',
      payload: c,
    });
  } catch (e) {
    next(e);
  }
});

inquiriesRouter.post('/reviews', inquiryPostLimiter, async (req, res, next) => {
  try {
    const parsed = reviewBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const r = parsed.data;
    const email =
      r.email === '' || r.email === undefined ? undefined : r.email;
    const row = await prisma.review.create({
      data: {
        targetType: r.targetType,
        targetSlug: r.targetSlug,
        name: r.name,
        email,
        text: r.text,
        rating: r.rating,
        role: r.role,
        citySlug: r.citySlug,
        status: 'pending',
      },
    });
    res.status(201).json({ success: true, id: row.id });
  } catch (e) {
    next(e);
  }
});
