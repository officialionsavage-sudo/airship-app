import type { Request, Response } from 'express';
import { z } from 'zod';
import { normalizeStoredImagePayload } from '../../image-encoding.js';

const imagePayloadSchema = z
  .string()
  .transform(normalizeStoredImagePayload)
  .refine((s) => !s || !/^data:image\//i.test(s), {
    message: 'Use the upload button (stored on your server) or paste an https URL — not base64.',
  });
const imagePayloadArraySchema = z.array(imagePayloadSchema);

export const siteContentPutSchema = z.object({
  payload: z.unknown(),
});

export const siteSettingPutSchema = z.object({
  value: z.string(),
});

export const reviewStatusPatchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const cityWriteSchema = z.object({
  slug: z.string().min(1).regex(slugRegex),
  title: z.string().min(1),
  shortDescription: z.string(),
  imageBase64: imagePayloadSchema,
  heroImageBase64: imagePayloadSchema,
  portalRealEstateTitle: z.string(),
  portalRealEstateDescription: z.string(),
  portalRealEstateImageBase64: imagePayloadSchema,
  portalToursTitle: z.string(),
  portalToursDescription: z.string(),
  portalToursImageBase64: imagePayloadSchema,
  portalTransportTitle: z.string(),
  portalTransportDescription: z.string(),
  portalTransportImageBase64: imagePayloadSchema,
  isComingSoon: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const catalogFilterDomainSchema = z.enum(['REAL_ESTATE', 'TOURS']);

export const catalogFilterWriteSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(slugRegex),
  sortOrder: z.number().int().optional(),
});

/** POST /api/admin/cities/:cityId/catalog-filters */
export const catalogFilterCreateSchema = catalogFilterWriteSchema.extend({
  domain: catalogFilterDomainSchema,
});

const catalogFilterIdsSchema = z
  .array(z.string().min(1))
  .optional()
  .transform((ids) => (ids ? [...new Set(ids)] : undefined));

export const projectStatusApiSchema = z.enum(['launching', 'under-construction', 'ready']);
export const propertyTypeApiSchema = z.enum(['apartment', 'villa', 'townhouse', 'chalet', 'studio']);

export const projectWriteSchema = z.object({
  slug: z.string().min(1).regex(slugRegex),
  citySlug: z.string().min(1).regex(slugRegex),
  title: z.string().min(1),
  startingPrice: z.number().int().nonnegative().nullable().optional(),
  locationName: z.string().min(1),
  locationSlug: z.string().min(1).regex(slugRegex),
  status: projectStatusApiSchema,
  propertyType: propertyTypeApiSchema,
  description: z.string(),
  shortDescription: z.string(),
  images: imagePayloadArraySchema,
  heroImageBase64: imagePayloadSchema,
  features: z.array(z.string()),
  amenities: z.array(z.string()),
  developerName: z.string().min(1),
  deliveryDate: z.union([z.string(), z.null()]).optional(),
  mapEmbedUrl: z.string().min(1),
  videoUrl: z.string().optional().default(''),
  catalogFilterIds: catalogFilterIdsSchema,
});

export const unitWriteSchema = z.object({
  slug: z.string().min(1).regex(slugRegex),
  title: z.string().min(1),
  images: imagePayloadArraySchema,
  size: z.number().positive(),
  beds: z.number().int().nonnegative(),
  baths: z.number().int().nonnegative(),
  description: z.string(),
  features: z.array(z.string()),
  pricePerDay: z.number().int().nonnegative(),
  pricePerWeek: z.number().int().nonnegative(),
  pricePerMonth: z.number().int().nonnegative(),
  discountDay: z.number().int().min(0).max(100),
  discountWeek: z.number().int().min(0).max(100),
  discountMonth: z.number().int().min(0).max(100),
});

export const tourTypeApiSchema = z.enum(['sea', 'desert', 'island', 'city', 'adventure', 'wellness']);

export const tourPriceWriteSchema = z.object({
  label: z.string().min(1),
  amount: z.number().int().nonnegative(),
  discountPercent: z.number().int().min(0).max(100),
});

export const tourWriteSchema = z.object({
  slug: z.string().min(1).regex(slugRegex),
  citySlug: z.string().min(1).regex(slugRegex),
  title: z.string().min(1),
  type: tourTypeApiSchema,
  rating: z.number().min(0).max(5),
  startPrice: z.number().int().nonnegative(),
  duration: z.string().min(1),
  departureTime: z.string().min(1),
  groupSize: z.string().min(1),
  overview: z.string(),
  images: imagePayloadArraySchema,
  itinerary: z.array(z.string()),
  included: z.array(z.string()),
  notIncluded: z.array(z.string()),
  prices: z.array(tourPriceWriteSchema),
  catalogFilterIds: catalogFilterIdsSchema,
});

const optionalValidUntil = z
  .union([z.string(), z.null()])
  .optional()
  .transform((s) => {
    if (s == null || s === '') return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  });

export const offerWriteSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  images: imagePayloadArraySchema,
  oldPrice: z.number().int().nonnegative(),
  newPrice: z.number().int().nonnegative(),
  discountPercent: z.number().int().min(0).max(100),
  highlights: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  included: z.array(z.string()).default([]),
  notIncluded: z.array(z.string()).default([]),
  terms: z.string().nullable().optional(),
  validUntil: optionalValidUntil,
  sortOrder: z.number().int().optional(),
});

export const vehicleTypeWriteSchema = z.object({
  label: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

export const carWriteSchema = z.object({
  slug: z.string().min(1).regex(slugRegex),
  name: z.string().min(1),
  type: z.string().min(1),
  passengers: z.number().int().min(1).max(60),
  luggage: z.number().int().min(0).max(60),
  pricePerDay: z.number().int().nonnegative(),
  imageBase64: imagePayloadSchema,
  sortOrder: z.number().int().optional(),
});

export function parseAdminBody<T>(schema: z.ZodType<T>, req: Request, res: Response): T | null {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return null;
  }
  return parsed.data;
}
