-- Standalone offers (no city/catalog link) + vehicle type picklist for transfers.

CREATE TABLE "VehicleType" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Offer" ADD COLUMN "category" TEXT;
ALTER TABLE "Offer" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Offer" ADD COLUMN "images" TEXT[];

UPDATE "Offer" SET "category" = CAST("type" AS TEXT);
UPDATE "Offer" SET "description" = COALESCE("description", '');
UPDATE "Offer" SET "images" = ARRAY["imageBase64"]::TEXT[] WHERE "imageBase64" IS NOT NULL AND TRIM("imageBase64") <> '';
UPDATE "Offer" SET "images" = ARRAY[]::TEXT[] WHERE "images" IS NULL;

ALTER TABLE "Offer" DROP CONSTRAINT "Offer_cityId_fkey";

ALTER TABLE "Offer" DROP COLUMN "cityId";
ALTER TABLE "Offer" DROP COLUMN "relatedSlug";
ALTER TABLE "Offer" DROP COLUMN "type";
ALTER TABLE "Offer" DROP COLUMN "imageBase64";

ALTER TABLE "Offer" ALTER COLUMN "category" SET NOT NULL;

DROP TYPE "OfferType";
