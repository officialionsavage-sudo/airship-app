-- Standalone offers: remove legacy category dimension (no FK to tours/projects).
ALTER TABLE "Offer" DROP COLUMN IF EXISTS "category";
