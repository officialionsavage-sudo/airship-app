import { Router } from 'express';
import { prisma } from '../prisma.js';
import { mapOffer, mapOfferListItem } from '../mappers.js';

export const offersRouter = Router();

offersRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.offer.findMany({
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    res.json(rows.map(mapOfferListItem));
  } catch (e) {
    next(e);
  }
});

offersRouter.get('/:id', async (req, res, next) => {
  try {
    const row = await prisma.offer.findUnique({ where: { id: req.params.id } });
    if (!row) {
      res.status(404).json({ message: 'Offer not found' });
      return;
    }
    res.json(mapOffer(row));
  } catch (e) {
    next(e);
  }
});
