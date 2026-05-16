import { Router } from 'express';
import { prisma } from '../prisma.js';
import { mapProject, mapProjectListItem, mapUnit } from '../mappers.js';

export const projectsRouter = Router();

projectsRouter.get('/', async (req, res, next) => {
  try {
    const citySlug = typeof req.query.city === 'string' ? req.query.city : undefined;
    const rows = await prisma.project.findMany({
      where: citySlug ? { city: { slug: citySlug } } : undefined,
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

projectsRouter.get('/:projectSlug/units/:unitSlug', async (req, res, next) => {
  try {
    const unit = await prisma.unit.findFirst({
      where: {
        slug: req.params.unitSlug,
        project: { slug: req.params.projectSlug },
      },
      include: { project: { select: { slug: true } } },
    });
    if (!unit) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(mapUnit(unit.project.slug, unit));
  } catch (e) {
    next(e);
  }
});

projectsRouter.get('/:projectSlug/units', async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.projectSlug },
      include: { units: { orderBy: { title: 'asc' } } },
    });
    if (!project) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(project.units.map((u) => mapUnit(project.slug, u)));
  } catch (e) {
    next(e);
  }
});

projectsRouter.get('/:slug', async (req, res, next) => {
  try {
    const citySlug = typeof req.query.citySlug === 'string' ? req.query.citySlug : undefined;
    const row = await prisma.project.findUnique({
      where: { slug: req.params.slug },
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
    if (citySlug !== undefined && row.city.slug !== citySlug) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(mapProject(row));
  } catch (e) {
    next(e);
  }
});
