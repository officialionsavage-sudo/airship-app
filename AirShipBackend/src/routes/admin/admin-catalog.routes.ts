import { Router } from 'express';
import { prisma } from '../../prisma.js';
import { apiStatusToDb } from './project-status.js';
import {
  parseAdminBody,
  cityWriteSchema,
  catalogFilterWriteSchema,
  catalogFilterCreateSchema,
  projectWriteSchema,
  unitWriteSchema,
  tourWriteSchema,
  offerWriteSchema,
  carWriteSchema,
  vehicleTypeWriteSchema,
} from './admin-validation.js';
import { Prisma } from '@prisma/client';
import type { CatalogFilterDomain } from '@prisma/client';
import { getAdminPagination } from './admin-pagination.js';

export const adminCatalogRouter = Router();

function parseDeliveryInput(v: string | null | undefined): Date | null {
  if (v == null || v === '') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function replaceProjectCatalogFilters(
  tx: Prisma.TransactionClient,
  projectId: string,
  _cityId: string,
  ids: string[] | undefined,
): Promise<void> {
  if (ids === undefined) return;
  await tx.projectCatalogFilter.deleteMany({ where: { projectId } });
  if (ids.length > 0) {
    await tx.projectCatalogFilter.createMany({
      data: ids.map((catalogFilterId) => ({ projectId, catalogFilterId })),
    });
  }
}

async function replaceTourCatalogFilters(
  tx: Prisma.TransactionClient,
  tourId: string,
  _cityId: string,
  ids: string[] | undefined,
): Promise<void> {
  if (ids === undefined) return;
  await tx.tourCatalogFilter.deleteMany({ where: { tourId } });
  if (ids.length > 0) {
    await tx.tourCatalogFilter.createMany({
      data: ids.map((catalogFilterId) => ({ tourId, catalogFilterId })),
    });
  }
}

async function assertCatalogFilterIdsForCity(
  cityId: string,
  domain: CatalogFilterDomain,
  ids: string[] | undefined,
): Promise<boolean> {
  if (ids === undefined || ids.length === 0) return true;
  const n = await prisma.catalogFilter.count({
    where: { id: { in: ids }, cityId, domain },
  });
  return n === ids.length;
}

/** Cities */
adminCatalogRouter.get('/cities', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.city.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          isComingSoon: true,
          sortOrder: true,
          _count: { select: { projects: true, tours: true } },
        },
      }),
      prisma.city.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.get('/cities/:id', async (req, res, next) => {
  try {
    const row = await prisma.city.findUnique({
      where: { id: req.params.id },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.post('/cities', async (req, res, next) => {
  try {
    const body = parseAdminBody(cityWriteSchema, req, res);
    if (!body) return;
    const row = await prisma.city.create({
      data: {
        slug: body.slug,
        title: body.title,
        shortDescription: body.shortDescription,
        imageBase64: body.imageBase64,
        heroImageBase64: body.heroImageBase64,
        portalRealEstateTitle: body.portalRealEstateTitle,
        portalRealEstateDescription: body.portalRealEstateDescription,
        portalRealEstateImageBase64: body.portalRealEstateImageBase64,
        portalToursTitle: body.portalToursTitle,
        portalToursDescription: body.portalToursDescription,
        portalToursImageBase64: body.portalToursImageBase64,
        portalTransportTitle: body.portalTransportTitle,
        portalTransportDescription: body.portalTransportDescription,
        portalTransportImageBase64: body.portalTransportImageBase64,
        isComingSoon: body.isComingSoon ?? false,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.put('/cities/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(cityWriteSchema, req, res);
    if (!body) return;
    const row = await prisma.city.update({
      where: { id: req.params.id },
      data: {
        slug: body.slug,
        title: body.title,
        shortDescription: body.shortDescription,
        imageBase64: body.imageBase64,
        heroImageBase64: body.heroImageBase64,
        portalRealEstateTitle: body.portalRealEstateTitle,
        portalRealEstateDescription: body.portalRealEstateDescription,
        portalRealEstateImageBase64: body.portalRealEstateImageBase64,
        portalToursTitle: body.portalToursTitle,
        portalToursDescription: body.portalToursDescription,
        portalToursImageBase64: body.portalToursImageBase64,
        portalTransportTitle: body.portalTransportTitle,
        portalTransportDescription: body.portalTransportDescription,
        portalTransportImageBase64: body.portalTransportImageBase64,
        isComingSoon: body.isComingSoon ?? false,
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.delete('/cities/:id', async (req, res, next) => {
  try {
    await prisma.city.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/** City-scoped catalog filters (real estate + tours). Assign on project/tour edit. */
adminCatalogRouter.get('/cities/:cityId/catalog-filters', async (req, res, next) => {
  try {
    const domainRaw = typeof req.query.domain === 'string' ? req.query.domain.trim() : '';
    if (domainRaw !== 'REAL_ESTATE' && domainRaw !== 'TOURS') {
      res.status(400).json({ error: 'Query domain must be REAL_ESTATE or TOURS.' });
      return;
    }
    const domain = domainRaw as CatalogFilterDomain;
    const city = await prisma.city.findUnique({ where: { id: req.params.cityId }, select: { id: true } });
    if (!city) {
      res.status(404).json({ error: 'City not found' });
      return;
    }
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = { cityId: req.params.cityId, domain };
    const [items, total] = await Promise.all([
      prisma.catalogFilter.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        skip,
        take: pageSize,
      }),
      prisma.catalogFilter.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.post('/cities/:cityId/catalog-filters', async (req, res, next) => {
  try {
    const city = await prisma.city.findUnique({ where: { id: req.params.cityId }, select: { id: true } });
    if (!city) {
      res.status(404).json({ error: 'City not found' });
      return;
    }
    const body = parseAdminBody(catalogFilterCreateSchema, req, res);
    if (!body) return;
    if (body.domain !== 'REAL_ESTATE' && body.domain !== 'TOURS') {
      res.status(400).json({ error: 'Invalid domain' });
      return;
    }
    const maxSort = await prisma.catalogFilter.aggregate({
      where: { cityId: req.params.cityId, domain: body.domain },
      _max: { sortOrder: true },
    });
    const sortOrder = body.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1;
    const row = await prisma.catalogFilter.create({
      data: {
        cityId: req.params.cityId,
        domain: body.domain,
        title: body.title,
        slug: body.slug,
        sortOrder,
      },
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.put('/catalog-filters/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(catalogFilterWriteSchema, req, res);
    if (!body) return;
    const row = await prisma.catalogFilter.update({
      where: { id: req.params.id },
      data: {
        title: body.title,
        slug: body.slug,
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.get('/catalog-filters/:id/usage', async (req, res, next) => {
  try {
    const exists = await prisma.catalogFilter.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!exists) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const [projectCount, tourCount] = await Promise.all([
      prisma.projectCatalogFilter.count({ where: { catalogFilterId: req.params.id } }),
      prisma.tourCatalogFilter.count({ where: { catalogFilterId: req.params.id } }),
    ]);
    res.json({ projectCount, tourCount });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.delete('/catalog-filters/:id', async (req, res, next) => {
  try {
    const [projectCount, tourCount] = await Promise.all([
      prisma.projectCatalogFilter.count({ where: { catalogFilterId: req.params.id } }),
      prisma.tourCatalogFilter.count({ where: { catalogFilterId: req.params.id } }),
    ]);
    if (projectCount > 0 || tourCount > 0) {
      res.status(409).json({
        error: 'This filter is still assigned to projects or tours. Remove the assignments first.',
        projectCount,
        tourCount,
      });
      return;
    }
    await prisma.catalogFilter.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/** Projects */
adminCatalogRouter.get('/projects', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          city: { select: { id: true, slug: true, title: true } },
          _count: { select: { units: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.get('/projects/:id', async (req, res, next) => {
  try {
    const row = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        city: true,
        _count: { select: { units: true } },
        catalogFilterLinks: { select: { catalogFilterId: true } },
      },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const { catalogFilterLinks, ...rest } = row;
    res.json({
      ...rest,
      catalogFilterIds: catalogFilterLinks.map((l) => l.catalogFilterId),
    });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.post('/projects', async (req, res, next) => {
  try {
    const body = parseAdminBody(projectWriteSchema, req, res);
    if (!body) return;
    const city = await prisma.city.findUnique({ where: { slug: body.citySlug } });
    if (!city) {
      res.status(400).json({ error: `City not found: ${body.citySlug}` });
      return;
    }
    if (!(await assertCatalogFilterIdsForCity(city.id, 'REAL_ESTATE', body.catalogFilterIds))) {
      res.status(400).json({ error: 'Invalid real-estate catalog filter ids for this city.' });
      return;
    }
    const row = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          slug: body.slug,
          cityId: city.id,
          title: body.title,
          startingPrice: body.startingPrice ?? null,
          locationName: body.locationName,
          locationSlug: body.locationSlug,
          status: apiStatusToDb(body.status),
          propertyType: body.propertyType,
          description: body.description,
          shortDescription: body.shortDescription,
          images: body.images,
          heroImageBase64: body.heroImageBase64,
          features: body.features,
          amenities: body.amenities,
          developerName: body.developerName,
          deliveryDate: parseDeliveryInput(body.deliveryDate ?? undefined),
          mapEmbedUrl: body.mapEmbedUrl,
          videoUrl: body.videoUrl,
        },
      });
      await replaceProjectCatalogFilters(tx, project.id, city.id, body.catalogFilterIds);
      return tx.project.findUniqueOrThrow({
        where: { id: project.id },
        include: {
          city: true,
          _count: { select: { units: true } },
          catalogFilterLinks: { select: { catalogFilterId: true } },
        },
      });
    });
    const { catalogFilterLinks, ...rest } = row;
    res.status(201).json({
      ...rest,
      catalogFilterIds: catalogFilterLinks.map((l) => l.catalogFilterId),
    });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.put('/projects/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(projectWriteSchema, req, res);
    if (!body) return;
    const city = await prisma.city.findUnique({ where: { slug: body.citySlug } });
    if (!city) {
      res.status(400).json({ error: `City not found: ${body.citySlug}` });
      return;
    }
    if (!(await assertCatalogFilterIdsForCity(city.id, 'REAL_ESTATE', body.catalogFilterIds))) {
      res.status(400).json({ error: 'Invalid real-estate catalog filter ids for this city.' });
      return;
    }
    const row = await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: req.params.id },
        data: {
          slug: body.slug,
          cityId: city.id,
          title: body.title,
          startingPrice: body.startingPrice ?? null,
          locationName: body.locationName,
          locationSlug: body.locationSlug,
          status: apiStatusToDb(body.status),
          propertyType: body.propertyType,
          description: body.description,
          shortDescription: body.shortDescription,
          images: body.images,
          heroImageBase64: body.heroImageBase64,
          features: body.features,
          amenities: body.amenities,
          developerName: body.developerName,
          deliveryDate: parseDeliveryInput(body.deliveryDate ?? undefined),
          mapEmbedUrl: body.mapEmbedUrl,
          videoUrl: body.videoUrl,
        },
      });
      await replaceProjectCatalogFilters(tx, req.params.id, city.id, body.catalogFilterIds);
      return tx.project.findUniqueOrThrow({
        where: { id: req.params.id },
        include: {
          city: true,
          _count: { select: { units: true } },
          catalogFilterLinks: { select: { catalogFilterId: true } },
        },
      });
    });
    const { catalogFilterLinks, ...rest } = row;
    res.json({
      ...rest,
      catalogFilterIds: catalogFilterLinks.map((l) => l.catalogFilterId),
    });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.delete('/projects/:id', async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/** Units */
adminCatalogRouter.get('/projects/:projectId/units', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = { projectId: req.params.projectId };
    const [items, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          size: true,
          beds: true,
          baths: true,
        },
      }),
      prisma.unit.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.get('/units/:id', async (req, res, next) => {
  try {
    const row = await prisma.unit.findUnique({ where: { id: req.params.id } });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.post('/projects/:projectId/units', async (req, res, next) => {
  try {
    const body = parseAdminBody(unitWriteSchema, req, res);
    if (!body) return;
    const row = await prisma.unit.create({
      data: {
        projectId: req.params.projectId,
        slug: body.slug,
        title: body.title,
        images: body.images,
        size: body.size,
        beds: body.beds,
        baths: body.baths,
        description: body.description,
        features: body.features,
        pricePerDay: body.pricePerDay,
        pricePerWeek: body.pricePerWeek,
        pricePerMonth: body.pricePerMonth,
        discountDay: body.discountDay,
        discountWeek: body.discountWeek,
        discountMonth: body.discountMonth,
      },
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.put('/units/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(unitWriteSchema, req, res);
    if (!body) return;
    const row = await prisma.unit.update({
      where: { id: req.params.id },
      data: {
        slug: body.slug,
        title: body.title,
        images: body.images,
        size: body.size,
        beds: body.beds,
        baths: body.baths,
        description: body.description,
        features: body.features,
        pricePerDay: body.pricePerDay,
        pricePerWeek: body.pricePerWeek,
        pricePerMonth: body.pricePerMonth,
        discountDay: body.discountDay,
        discountWeek: body.discountWeek,
        discountMonth: body.discountMonth,
      },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.delete('/units/:id', async (req, res, next) => {
  try {
    await prisma.unit.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/** Tours */
adminCatalogRouter.get('/tours', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          city: { select: { id: true, slug: true, title: true } },
        },
      }),
      prisma.tour.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.get('/tours/:id', async (req, res, next) => {
  try {
    const row = await prisma.tour.findUnique({
      where: { id: req.params.id },
      include: {
        city: true,
        prices: true,
        catalogFilterLinks: { select: { catalogFilterId: true } },
      },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const { catalogFilterLinks, ...rest } = row;
    res.json({
      ...rest,
      catalogFilterIds: catalogFilterLinks.map((l) => l.catalogFilterId),
    });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.post('/tours', async (req, res, next) => {
  try {
    const body = parseAdminBody(tourWriteSchema, req, res);
    if (!body) return;
    const city = await prisma.city.findUnique({ where: { slug: body.citySlug } });
    if (!city) {
      res.status(400).json({ error: `City not found: ${body.citySlug}` });
      return;
    }
    if (!(await assertCatalogFilterIdsForCity(city.id, 'TOURS', body.catalogFilterIds))) {
      res.status(400).json({ error: 'Invalid tour catalog filter ids for this city.' });
      return;
    }
    const row = await prisma.$transaction(async (tx) => {
      const tour = await tx.tour.create({
        data: {
          slug: body.slug,
          cityId: city.id,
          title: body.title,
          type: body.type,
          rating: body.rating,
          startPrice: body.startPrice,
          duration: body.duration,
          departureTime: body.departureTime,
          groupSize: body.groupSize,
          overview: body.overview,
          images: body.images,
          itinerary: body.itinerary,
          included: body.included,
          notIncluded: body.notIncluded,
        },
      });
      await tx.tourPrice.createMany({
        data: body.prices.map((p) => ({
          tourId: tour.id,
          label: p.label,
          amount: p.amount,
          discountPercent: p.discountPercent,
        })),
      });
      await replaceTourCatalogFilters(tx, tour.id, city.id, body.catalogFilterIds);
      return tx.tour.findUniqueOrThrow({
        where: { id: tour.id },
        include: {
          prices: true,
          city: true,
          catalogFilterLinks: { select: { catalogFilterId: true } },
        },
      });
    });
    const { catalogFilterLinks, ...rest } = row;
    res.status(201).json({
      ...rest,
      catalogFilterIds: catalogFilterLinks.map((l) => l.catalogFilterId),
    });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.put('/tours/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(tourWriteSchema, req, res);
    if (!body) return;
    const city = await prisma.city.findUnique({ where: { slug: body.citySlug } });
    if (!city) {
      res.status(400).json({ error: `City not found: ${body.citySlug}` });
      return;
    }
    if (!(await assertCatalogFilterIdsForCity(city.id, 'TOURS', body.catalogFilterIds))) {
      res.status(400).json({ error: 'Invalid tour catalog filter ids for this city.' });
      return;
    }
    const row = await prisma.$transaction(async (tx) => {
      await tx.tourPrice.deleteMany({ where: { tourId: req.params.id } });
      await tx.tour.update({
        where: { id: req.params.id },
        data: {
          slug: body.slug,
          cityId: city.id,
          title: body.title,
          type: body.type,
          rating: body.rating,
          startPrice: body.startPrice,
          duration: body.duration,
          departureTime: body.departureTime,
          groupSize: body.groupSize,
          overview: body.overview,
          images: body.images,
          itinerary: body.itinerary,
          included: body.included,
          notIncluded: body.notIncluded,
        },
      });
      await tx.tourPrice.createMany({
        data: body.prices.map((p) => ({
          tourId: req.params.id,
          label: p.label,
          amount: p.amount,
          discountPercent: p.discountPercent,
        })),
      });
      await replaceTourCatalogFilters(tx, req.params.id, city.id, body.catalogFilterIds);
      return tx.tour.findUniqueOrThrow({
        where: { id: req.params.id },
        include: {
          prices: true,
          city: true,
          catalogFilterLinks: { select: { catalogFilterId: true } },
        },
      });
    });
    const { catalogFilterLinks, ...rest } = row;
    res.json({
      ...rest,
      catalogFilterIds: catalogFilterLinks.map((l) => l.catalogFilterId),
    });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.delete('/tours/:id', async (req, res, next) => {
  try {
    await prisma.tour.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/** Offers */
adminCatalogRouter.get('/offers/:id', async (req, res, next) => {
  try {
    const row = await prisma.offer.findUnique({ where: { id: req.params.id } });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.get('/offers', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [rawItems, total] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          oldPrice: number;
          newPrice: number;
          discountPercent: number;
          sortOrder: number;
          updatedAt: Date;
          imageCount: bigint | number;
        }>
      >(Prisma.sql`
        SELECT id, title, "oldPrice", "newPrice", "discountPercent", "sortOrder", "updatedAt",
          COALESCE(cardinality(images), 0) AS "imageCount"
        FROM "Offer"
        ORDER BY "sortOrder" ASC, "updatedAt" DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `),
      prisma.offer.count({ where }),
    ]);
    const items = rawItems.map((row) => ({
      id: row.id,
      title: row.title,
      oldPrice: row.oldPrice,
      newPrice: row.newPrice,
      discountPercent: row.discountPercent,
      sortOrder: row.sortOrder,
      updatedAt: row.updatedAt,
      imageCount: Number(row.imageCount),
    }));
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.post('/offers', async (req, res, next) => {
  try {
    const body = parseAdminBody(offerWriteSchema, req, res);
    if (!body) return;
    const maxSort = await prisma.offer.aggregate({ _max: { sortOrder: true } });
    const sortOrder = body.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1;
    const row = await prisma.offer.create({
      data: {
        title: body.title,
        description: body.description,
        images: body.images,
        oldPrice: body.oldPrice,
        newPrice: body.newPrice,
        discountPercent: body.discountPercent,
        highlights: body.highlights,
        features: body.features,
        included: body.included,
        notIncluded: body.notIncluded,
        terms: body.terms ?? null,
        validUntil: body.validUntil ?? null,
        sortOrder,
      },
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.put('/offers/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(offerWriteSchema, req, res);
    if (!body) return;
    const row = await prisma.offer.update({
      where: { id: req.params.id },
      data: {
        title: body.title,
        description: body.description,
        images: body.images,
        oldPrice: body.oldPrice,
        newPrice: body.newPrice,
        discountPercent: body.discountPercent,
        highlights: body.highlights,
        features: body.features,
        included: body.included,
        notIncluded: body.notIncluded,
        terms: body.terms ?? null,
        validUntil: body.validUntil ?? null,
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.delete('/offers/:id', async (req, res, next) => {
  try {
    await prisma.offer.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/** Airport transfer vehicle type labels (dropdown on public Transfer page). */
adminCatalogRouter.get('/vehicle-types', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.vehicleType.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        skip,
        take: pageSize,
      }),
      prisma.vehicleType.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.post('/vehicle-types', async (req, res, next) => {
  try {
    const body = parseAdminBody(vehicleTypeWriteSchema, req, res);
    if (!body) return;
    const maxSort = await prisma.vehicleType.aggregate({ _max: { sortOrder: true } });
    const sortOrder = body.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1;
    const row = await prisma.vehicleType.create({
      data: { label: body.label, sortOrder },
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.put('/vehicle-types/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(vehicleTypeWriteSchema, req, res);
    if (!body) return;
    const row = await prisma.vehicleType.update({
      where: { id: req.params.id },
      data: {
        label: body.label,
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.delete('/vehicle-types/:id', async (req, res, next) => {
  try {
    await prisma.vehicleType.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/** Transfer fleet / car rental catalog */
adminCatalogRouter.get('/cars', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getAdminPagination(req);
    const where = {};
    const [items, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          passengers: true,
          luggage: true,
          pricePerDay: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.car.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.get('/cars/:id', async (req, res, next) => {
  try {
    const row = await prisma.car.findUnique({ where: { id: req.params.id } });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.post('/cars', async (req, res, next) => {
  try {
    const body = parseAdminBody(carWriteSchema, req, res);
    if (!body) return;
    const maxSort = await prisma.car.aggregate({ _max: { sortOrder: true } });
    const sortOrder = body.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1;
    const row = await prisma.car.create({
      data: {
        slug: body.slug,
        name: body.name,
        type: body.type,
        passengers: body.passengers,
        luggage: body.luggage,
        pricePerDay: body.pricePerDay,
        imageBase64: body.imageBase64,
        sortOrder,
      },
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.put('/cars/:id', async (req, res, next) => {
  try {
    const body = parseAdminBody(carWriteSchema, req, res);
    if (!body) return;
    const row = await prisma.car.update({
      where: { id: req.params.id },
      data: {
        slug: body.slug,
        name: body.name,
        type: body.type,
        passengers: body.passengers,
        luggage: body.luggage,
        pricePerDay: body.pricePerDay,
        imageBase64: body.imageBase64,
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminCatalogRouter.delete('/cars/:id', async (req, res, next) => {
  try {
    await prisma.car.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
