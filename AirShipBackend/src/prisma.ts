import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const logQueries = process.env.LOG_PRISMA_QUERIES === '1';

export const prisma = new PrismaClient({
  log: logQueries ? (['query', 'warn', 'error'] as const) : (['warn', 'error'] as const),
});
