-- Tour listing filters per city (maps UI buckets to TourType enum values).

CREATE TABLE "TourTypeFilter" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tourTypes" "TourType"[],
    CONSTRAINT "TourTypeFilter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TourTypeFilter_cityId_slug_key" ON "TourTypeFilter"("cityId", "slug");

CREATE INDEX "TourTypeFilter_cityId_idx" ON "TourTypeFilter"("cityId");

ALTER TABLE "TourTypeFilter" ADD CONSTRAINT "TourTypeFilter_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
