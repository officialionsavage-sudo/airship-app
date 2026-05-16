import { z } from 'zod';

const optionalIsoDate = z
  .string()
  .optional()
  .transform((s) => {
    if (s == null || s === '') return undefined;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? undefined : d;
  });

export const bookingBodySchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().optional(),
  citySlug: z.string().min(1),
  relatedSlug: z.string().min(1),
  bookingType: z.enum(['property', 'tour', 'offer']),
  checkIn: optionalIsoDate,
  checkOut: optionalIsoDate,
  guests: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const contactBodySchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export const reviewBodySchema = z.object({
  targetType: z.enum(['app', 'service', 'tour', 'project']),
  targetSlug: z.string().optional(),
  name: z.string().min(1),
  email: z.preprocess((val) => (val === '' ? undefined : val), z.string().email().optional()),
  text: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  role: z.string().optional(),
  citySlug: z.string().optional(),
});
