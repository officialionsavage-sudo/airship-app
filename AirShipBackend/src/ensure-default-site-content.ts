import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

const HOME_KEY = 'home';

/** Insert default home CMS payload when missing (does not overwrite existing rows). */
export async function ensureDefaultSiteContent(): Promise<void> {
  const existing = await prisma.siteContent.findUnique({ where: { key: HOME_KEY } });
  if (existing) {
    return;
  }

  const backendRoot = join(fileURLToPath(import.meta.url), '..', '..');
  const jsonPath = join(backendRoot, 'prisma', 'home-page-content.json');
  const payload = JSON.parse(readFileSync(jsonPath, 'utf8')) as Prisma.InputJsonValue;

  await prisma.siteContent.create({
    data: { key: HOME_KEY, payload },
  });
  console.log('Site content: created default "home" row');
}
