-- Portal cards on public city landing (images + copy); empty = API uses fallbacks.
ALTER TABLE "City" ADD COLUMN "portalRealEstateTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "portalRealEstateDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "portalRealEstateImageBase64" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "portalToursTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "portalToursDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "portalToursImageBase64" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "portalTransportTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "portalTransportDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "portalTransportImageBase64" TEXT NOT NULL DEFAULT '';
