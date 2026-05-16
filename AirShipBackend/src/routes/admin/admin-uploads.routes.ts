import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import multer from 'multer';
import { isAllowedImageMime, newMediaRelativePath, writeMediaFile } from '../../media-storage.js';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const adminUploadsRouter = Router();

adminUploadsRouter.post('/uploads', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Missing file field "file"' });
      return;
    }
    if (!isAllowedImageMime(file.mimetype)) {
      res.status(400).json({ error: 'Unsupported image type' });
      return;
    }
    const scopeRaw = typeof req.query.scope === 'string' ? req.query.scope : 'catalog';
    const relative = newMediaRelativePath(scopeRaw, file.mimetype);
    const saved = await writeMediaFile(relative, file.buffer);
    res.status(201).json({ url: saved.url, path: saved.relativePath });
  } catch (e) {
    next(e);
  }
});

adminUploadsRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: `File too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)` });
    return;
  }
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
    return;
  }
  next(err);
});
