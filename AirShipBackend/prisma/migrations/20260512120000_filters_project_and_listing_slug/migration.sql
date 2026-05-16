-- Decouple listing filters from City FK:
-- LocationFilter → scoped by Project (per-project CRUD in Admin).
-- TourTypeFilter → `listingCitySlug` (city slug string, no FK) for tour listing market.

-- 1) TourTypeFilter: cityId → listingCitySlug
ALTER TABLE "TourTypeFilter" ADD COLUMN "listingCitySlug" TEXT;

UPDATE "TourTypeFilter" AS tf
SET "listingCitySlug" = c.slug
FROM "City" AS c
WHERE c.id = tf."cityId";

ALTER TABLE "TourTypeFilter" DROP CONSTRAINT "TourTypeFilter_cityId_fkey";

DROP INDEX IF EXISTS "TourTypeFilter_cityId_idx";
DROP INDEX IF EXISTS "TourTypeFilter_cityId_slug_key";

ALTER TABLE "TourTypeFilter" DROP COLUMN "cityId";

ALTER TABLE "TourTypeFilter" ALTER COLUMN "listingCitySlug" SET NOT NULL;

CREATE UNIQUE INDEX "TourTypeFilter_listingCitySlug_slug_key" ON "TourTypeFilter"("listingCitySlug", "slug");
CREATE INDEX "TourTypeFilter_listingCitySlug_idx" ON "TourTypeFilter"("listingCitySlug");

-- 2) LocationFilter: cityId → projectId (duplicate rows per project in same city)
CREATE TABLE "LocationFilter_new" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LocationFilter_new_pkey" PRIMARY KEY ("id")
);

INSERT INTO "LocationFilter_new" ("id", "projectId", "title", "slug", "sortOrder")
SELECT lf."id" || '_' || p."id", p."id", lf."title", lf."slug", lf."sortOrder"
FROM "LocationFilter" AS lf
INNER JOIN "Project" AS p ON p."cityId" = lf."cityId";

DROP TABLE "LocationFilter";

ALTER TABLE "LocationFilter_new" RENAME TO "LocationFilter";

CREATE UNIQUE INDEX "LocationFilter_projectId_slug_key" ON "LocationFilter"("projectId", "slug");
CREATE INDEX "LocationFilter_projectId_idx" ON "LocationFilter"("projectId");

ALTER TABLE "LocationFilter"
  ADD CONSTRAINT "LocationFilter_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
