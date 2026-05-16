import { Router } from 'express';
import { adminRouter } from './admin/index.js';
import { carsRouter } from './cars.js';
import { citiesRouter } from './cities.js';
import { projectsRouter } from './projects.js';
import { offersRouter } from './offers.js';
import { siteRouter } from './site.js';
import { inquiriesRouter } from './inquiries.js';

export function createApiRouter(): Router {
  const api = Router();
  api.use('/admin', adminRouter);
  api.use('/cities', citiesRouter);
  api.use('/projects', projectsRouter);
  api.use('/offers', offersRouter);
  api.use(carsRouter);
  api.use(siteRouter);
  api.use(inquiriesRouter);
  return api;
}
