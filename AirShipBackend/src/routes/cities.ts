import { Router } from 'express';
import { prisma } from '../prisma.js';
import {
  mapCity,
  mapCatalogFilterPublic,
  mapProject,
  mapProjectListItem,
  mapTour,
  mapTourListItem,
} from '../mappers.js';
import type { TourType } from '@prisma/client';

export const citiesRouter = Router();

/** Real-estate listing filters for a city (Admin-defined; assigned per project). */
async function catalogFiltersRealEstateForCitySlug(citySlug: string) {
  const city = await prisma.city.findUnique({ where: { slug: citySlug }, select: { id: true } });
  if (!city) return null;
  return prisma.catalogFilter.findMany({
    where: { cityId: city.id, domain: 'REAL_ESTATE' },
    orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
  });
}

/** Tour listing filters for a city (Admin-defined; assigned per tour). */
async function catalogFiltersToursForCitySlug(citySlug: string) {
  const city = await prisma.city.findUnique({ where: { slug: citySlug }, select: { id: true } });
  if (!city) return null;
  return prisma.catalogFilter.findMany({
    where: { cityId: city.id, domain: 'TOURS' },
    orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
  });
}

citiesRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.city.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(rows.map(mapCity));
  } catch (e) {
    next(e);
  }
});

citiesRouter.get('/:slug/location-filters', async (req, res, next) => {
  try {
    const rows = await catalogFiltersRealEstateForCitySlug(req.params.slug);
    if (!rows) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(rows.map(mapCatalogFilterPublic));
  } catch (e) {
    next(e);
  }
});

citiesRouter.get('/:slug/tour-type-filters', async (req, res, next) => {
  try {
    const rows = await catalogFiltersToursForCitySlug(req.params.slug);
    if (!rows) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(rows.map(mapCatalogFilterPublic));
  } catch (e) {
    next(e);
  }
});

citiesRouter.get('/:citySlug/projects/:projectSlug', async (req, res, next) => {
  try {
    const row = await prisma.project.findFirst({
      where: {
        slug: req.params.projectSlug,
        city: { slug: req.params.citySlug },
      },
      include: {
        units: { orderBy: { title: 'asc' } },
        city: { select: { slug: true } },
        catalogFilterLinks: { include: { catalogFilter: { select: { slug: true } } } },
      },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(mapProject(row));
  } catch (e) {
    next(e);
  }
});

citiesRouter.get('/:citySlug/projects', async (req, res, next) => {
  try {
    const rows = await prisma.project.findMany({
      where: { city: { slug: req.params.citySlug } },
      include: {
        city: { select: { slug: true } },
        catalogFilterLinks: { include: { catalogFilter: { select: { slug: true } } } },
      },
      orderBy: { title: 'asc' },
    });
    res.json(rows.map(mapProjectListItem));
  } catch (e) {
    next(e);
  }
});

citiesRouter.get('/:citySlug/tours/:tourSlug', async (req, res, next) => {
  try {
    const row = await prisma.tour.findFirst({
      where: {
        slug: req.params.tourSlug,
        city: { slug: req.params.citySlug },
      },
      include: {
        city: { select: { slug: true } },
        prices: true,
        catalogFilterLinks: { include: { catalogFilter: { select: { slug: true } } } },
      },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(mapTour(row));
  } catch (e) {
    next(e);
  }
});

citiesRouter.get('/:citySlug/tours', async (req, res, next) => {
  try {
    const typeParam = typeof req.query.type === 'string' ? req.query.type : undefined;
    const validTypes: TourType[] = ['sea', 'desert', 'island', 'city', 'adventure', 'wellness'];
    const typeFilter = typeParam && validTypes.includes(typeParam as TourType) ? (typeParam as TourType) : undefined;

    const rows = await prisma.tour.findMany({
      where: {
        city: { slug: req.params.citySlug },
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      include: {
        city: { select: { slug: true } },
        prices: true,
        catalogFilterLinks: { include: { catalogFilter: { select: { slug: true } } } },
      },
      orderBy: { title: 'asc' },
    });
    res.json(rows.map(mapTourListItem));
  } catch (e) {
    next(e);
  }
});

citiesRouter.get('/:slug', async (req, res, next) => {
  try {
    const row = await prisma.city.findUnique({ where: { slug: req.params.slug } });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(mapCity(row));
  } catch (e) {
    next(e);
  }
});
