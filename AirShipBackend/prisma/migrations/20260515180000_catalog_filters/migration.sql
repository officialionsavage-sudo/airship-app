-- City-scoped catalog filters + explicit project/tour assignments.
-- Replaces LocationFilter and TourTypeFilter.

CREATE TYPE "CatalogFilterDomain" AS ENUM ('REAL_ESTATE', 'TOURS');

CREATE TABLE "CatalogFilter" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "domain" "CatalogFilterDomain" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CatalogFilter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CatalogFilter_cityId_domain_slug_key" ON "CatalogFilter"("cityId", "domain", "slug");
CREATE INDEX "CatalogFilter_cityId_domain_idx" ON "CatalogFilter"("cityId", "domain");

ALTER TABLE "CatalogFilter" ADD CONSTRAINT "CatalogFilter_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProjectCatalogFilter" (
    "projectId" TEXT NOT NULL,
    "catalogFilterId" TEXT NOT NULL,

    CONSTRAINT "ProjectCatalogFilter_pkey" PRIMARY KEY ("projectId","catalogFilterId")
);

CREATE INDEX "ProjectCatalogFilter_catalogFilterId_idx" ON "ProjectCatalogFilter"("catalogFilterId");

ALTER TABLE "ProjectCatalogFilter" ADD CONSTRAINT "ProjectCatalogFilter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectCatalogFilter" ADD CONSTRAINT "ProjectCatalogFilter_catalogFilterId_fkey" FOREIGN KEY ("catalogFilterId") REFERENCES "CatalogFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "TourCatalogFilter" (
    "tourId" TEXT NOT NULL,
    "catalogFilterId" TEXT NOT NULL,

    CONSTRAINT "TourCatalogFilter_pkey" PRIMARY KEY ("tourId","catalogFilterId")
);

CREATE INDEX "TourCatalogFilter_catalogFilterId_idx" ON "TourCatalogFilter"("catalogFilterId");

ALTER TABLE "TourCatalogFilter" ADD CONSTRAINT "TourCatalogFilter_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TourCatalogFilter" ADD CONSTRAINT "TourCatalogFilter_catalogFilterId_fkey" FOREIGN KEY ("catalogFilterId") REFERENCES "CatalogFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- REAL_ESTATE: one CatalogFilter row per (city, slug) from legacy per-project rows
INSERT INTO "CatalogFilter" ("id", "cityId", "domain", "title", "slug", "sortOrder")
SELECT gen_random_uuid()::text,
       sub."cityId",
       'REAL_ESTATE'::"CatalogFilterDomain",
       sub.title,
       sub.slug,
       sub."sortOrder"
FROM (
  SELECT DISTINCT ON (p."cityId", lf.slug)
    p."cityId",
    lf.title,
    lf.slug,
    lf."sortOrder"
  FROM "LocationFilter" lf
  INNER JOIN "Project" p ON p.id = lf."projectId"
  ORDER BY p."cityId", lf.slug, lf."sortOrder" ASC, lf.title ASC
) AS sub;

INSERT INTO "ProjectCatalogFilter" ("projectId", "catalogFilterId")
SELECT p.id, cf.id
FROM "Project" p
INNER JOIN "CatalogFilter" cf
  ON cf."cityId" = p."cityId"
 AND cf."domain" = 'REAL_ESTATE'::"CatalogFilterDomain"
 AND cf.slug = p."locationSlug";

-- TOURS: one row per legacy TourTypeFilter (city resolved by listing slug)
INSERT INTO "CatalogFilter" ("id", "cityId", "domain", "title", "slug", "sortOrder")
SELECT gen_random_uuid()::text,
       c.id,
       'TOURS'::"CatalogFilterDomain",
       tf.title,
       tf.slug,
       tf."sortOrder"
FROM "TourTypeFilter" tf
INNER JOIN "City" c ON c.slug = tf."listingCitySlug";

INSERT INTO "TourCatalogFilter" ("tourId", "catalogFilterId")
SELECT DISTINCT t.id, cf.id
FROM "Tour" t
INNER JOIN "City" cit ON cit.id = t."cityId"
INNER JOIN "TourTypeFilter" tf ON tf."listingCitySlug" = cit.slug
INNER JOIN "CatalogFilter" cf
  ON cf."cityId" = cit.id
 AND cf."domain" = 'TOURS'::"CatalogFilterDomain"
 AND cf.slug = tf.slug
WHERE t.type = ANY (tf."tourTypes");

DROP TABLE "LocationFilter";
DROP TABLE "TourTypeFilter";
