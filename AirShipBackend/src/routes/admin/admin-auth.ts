import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

export type AdminRole = 'admin' | 'spectator';

declare global {
  namespace Express {
    interface Request {
      adminRole?: AdminRole;
      adminUsername?: string;
    }
  }
}

/** Used when no `ADMIN_*` env vars are set (override in production). */
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_SPECTATOR_USERNAME = 'spectator';
const DEFAULT_SPECTATOR_PASSWORD = 'user@2000';

type AdminAccount = { username: string; password: string; role: AdminRole };

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

function spectatorUsername(): string {
  return process.env.SPECTATOR_USERNAME?.trim() || DEFAULT_SPECTATOR_USERNAME;
}

function spectatorPassword(): string {
  return process.env.SPECTATOR_PASSWORD?.trim() || DEFAULT_SPECTATOR_PASSWORD;
}

function adminAccounts(): AdminAccount[] {
  const accounts: AdminAccount[] = [];
  const adminUser = adminUsername();
  const adminPass = adminSecretPassword();
  if (adminUser && adminPass) {
    accounts.push({ username: adminUser, password: adminPass, role: 'admin' });
  }
  accounts.push({
    username: spectatorUsername(),
    password: spectatorPassword(),
    role: 'spectator',
  });
  return accounts;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

function matchBasicAccount(user: string, pass: string): AdminAccount | null {
  for (const account of adminAccounts()) {
    if (timingSafeEqualStr(user, account.username) && timingSafeEqualStr(pass, account.password)) {
      return account;
    }
  }
  return null;
}

/**
 * HTTP Basic when an expected admin username is in effect.
 * Bearer / legacy headers when only `ADMIN_PASSWORD` or `ADMIN_API_KEY` is set (admin role only).
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

    const account = matchBasicAccount(user, pass);
    if (!account) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.adminRole = account.role;
    req.adminUsername = account.username;
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
  req.adminRole = 'admin';
  req.adminUsername = 'admin';
  next();
};

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Blocks mutating requests for read-only (spectator) accounts. */
export const requireAdminWrite: RequestHandler = (req, res, next) => {
  if (!WRITE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }
  if (req.adminRole === 'spectator') {
    res.status(403).json({ error: 'Read-only access' });
    return;
  }
  next();
};

export const adminSessionHandler: RequestHandler = (req, res) => {
  res.json({
    role: req.adminRole ?? 'admin',
    username: req.adminUsername ?? '',
    canWrite: req.adminRole !== 'spectator',
  });
};
