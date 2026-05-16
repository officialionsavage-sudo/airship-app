/**
 * Upserts demo fleet rows from seed-fixtures (safe additive seed — does not wipe other catalog tables).
 * Run: npm run db:seed:cars (from AirShipBackend/)
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { CARS } from './seed-fixtures.ts';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  for (let i = 0; i < CARS.length; i++) {
    const c = CARS[i];
    await prisma.car.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        type: c.type,
        passengers: c.passengers,
        luggage: c.luggage,
        pricePerDay: c.pricePerDay,
        imageBase64: c.image,
        sortOrder: i,
      },
      update: {
        name: c.name,
        type: c.type,
        passengers: c.passengers,
        luggage: c.luggage,
        pricePerDay: c.pricePerDay,
        imageBase64: c.image,
        sortOrder: i,
      },
    });
  }
  console.log(`Cars upserted: ${CARS.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
