import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

/** Used when no `ADMIN_*` env vars are set (override in production). */
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

function adminUsername(): string | undefined {
  const u = process.env.ADMIN_USERNAME?.trim();
  if (u) return u;
  const usingEnvSecretOnly = !!(
    process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_API_KEY?.trim()
  );
  if (usingEnvSecretOnly) return undefined;
  return DEFAULT_ADMIN_USERNAME;
}

function adminSecretPassword(): string | undefined {
  const fromPassword = process.env.ADMIN_PASSWORD?.trim();
  const fromLegacyKey = process.env.ADMIN_API_KEY?.trim();
  if (fromPassword || fromLegacyKey) return fromPassword || fromLegacyKey;
  return DEFAULT_ADMIN_PASSWORD;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

/**
 * Basic user+password when an expected username is in effect (`ADMIN_USERNAME` or default `admin` when no secret env).
 * Bearer / legacy headers when only `ADMIN_PASSWORD` or `ADMIN_API_KEY` is set (no `ADMIN_USERNAME`).
 */
export const requireAdminApiKey: RequestHandler = (req, res, next) => {
  const expectedUser = adminUsername();
  const expectedPass = adminSecretPassword();

  if (!expectedPass) {
    res.status(503).json({
      error:
        'Admin API not configured (set ADMIN_PASSWORD in .env, or legacy ADMIN_API_KEY; use ADMIN_USERNAME + ADMIN_PASSWORD for username/password login)',
    });
    return;
  }

  const authHeader = req.headers.authorization;

  if (expectedUser) {
    if (!authHeader?.startsWith('Basic ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    let decoded: string;
    try {
      decoded = Buffer.from(authHeader.slice(6).trim(), 'base64').toString('utf8');
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const colon = decoded.indexOf(':');
    const user = colon >= 0 ? decoded.slice(0, colon) : '';
    const pass = colon >= 0 ? decoded.slice(colon + 1) : '';

    if (!timingSafeEqualStr(user, expectedUser) || !timingSafeEqualStr(pass, expectedPass)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next();
    return;
  }

  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const passHeader = req.headers['x-admin-password'];
  const legacyKeyHeader = req.headers['x-admin-key'];
  const altPass = typeof passHeader === 'string' ? passHeader.trim() : '';
  const altLegacy = typeof legacyKeyHeader === 'string' ? legacyKeyHeader.trim() : '';
  const token = bearer || altPass || altLegacy;
  if (!token || !timingSafeEqualStr(token, expectedPass)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};
