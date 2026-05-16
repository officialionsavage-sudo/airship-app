import { Router } from 'express';
import { decodeStoredImageForWeb } from '../image-encoding.js';
import { prisma } from '../prisma.js';

export const carsRouter = Router();

/** Public labels for airport transfer vehicle type dropdown (ordered). */
carsRouter.get('/vehicle-types', async (_req, res, next) => {
  try {
    const rows = await prisma.vehicleType.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });
    res.json(rows.map((r) => ({ id: r.id, label: r.label, sortOrder: r.sortOrder })));
  } catch (e) {
    next(e);
  }
});

/** Public fleet list for transfer / car rental picker (ordered). */
carsRouter.get('/cars', async (_req, res, next) => {
  try {
    const rows = await prisma.car.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    res.json(
      rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        type: r.type,
        passengers: r.passengers,
        luggage: r.luggage,
        pricePerDay: r.pricePerDay,
        image: decodeStoredImageForWeb(r.imageBase64),
      })),
    );
  } catch (e) {
    next(e);
  }
});
