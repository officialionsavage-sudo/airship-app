import { Router } from 'express';
import { requireAdminApiKey } from './admin-auth.js';
import { adminUploadsRouter } from './admin-uploads.routes.js';
import { adminCatalogRouter } from './admin-catalog.routes.js';
import { adminCmsRouter } from './admin-cms.routes.js';
import { adminInboundRouter } from './admin-inbound.routes.js';

export const adminRouter = Router();
adminRouter.use(requireAdminApiKey);
adminRouter.use(adminUploadsRouter);
adminRouter.use(adminCmsRouter);
adminRouter.use(adminInboundRouter);
adminRouter.use(adminCatalogRouter);
