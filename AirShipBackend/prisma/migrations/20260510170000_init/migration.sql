-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('launching', 'under_construction', 'ready');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('apartment', 'villa', 'townhouse', 'chalet', 'studio');

-- CreateEnum
CREATE TYPE "TourType" AS ENUM ('sea', 'desert', 'island', 'city', 'adventure', 'wellness');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('property', 'trip');

-- CreateEnum
CREATE TYPE "ReviewTarget" AS ENUM ('app', 'service', 'tour', 'project');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "heroImageUrl" TEXT NOT NULL,
    "isComingSoon" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationFilter" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LocationFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startingPrice" INTEGER,
    "locationName" TEXT NOT NULL,
    "locationSlug" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "images" TEXT[],
    "heroImageUrl" TEXT NOT NULL,
    "features" TEXT[],
    "amenities" TEXT[],
    "developerName" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "mapEmbedUrl" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "images" TEXT[],
    "size" DOUBLE PRECISION NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "pricePerDay" INTEGER NOT NULL,
    "pricePerWeek" INTEGER NOT NULL,
    "pricePerMonth" INTEGER NOT NULL,
    "discountDay" INTEGER NOT NULL,
    "discountWeek" INTEGER NOT NULL,
    "discountMonth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "TourType" NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startPrice" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "groupSize" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "images" TEXT[],
    "itinerary" TEXT[],
    "included" TEXT[],
    "notIncluded" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourPrice" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL,

    CONSTRAINT "TourPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cityId" TEXT,
    "type" "OfferType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "oldPrice" INTEGER NOT NULL,
    "newPrice" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "relatedSlug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "citySlug" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "targetType" "ReviewTarget" NOT NULL,
    "targetSlug" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "role" TEXT,
    "citySlug" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingInquiry" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "citySlug" TEXT NOT NULL,
    "relatedSlug" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "guests" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "LocationFilter_cityId_idx" ON "LocationFilter"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationFilter_cityId_slug_key" ON "LocationFilter"("cityId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_cityId_idx" ON "Project"("cityId");

-- CreateIndex
CREATE INDEX "Project_locationSlug_idx" ON "Project"("locationSlug");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_propertyType_idx" ON "Project"("propertyType");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_slug_key" ON "Unit"("slug");

-- CreateIndex
CREATE INDEX "Unit_projectId_idx" ON "Unit"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Tour_slug_key" ON "Tour"("slug");

-- CreateIndex
CREATE INDEX "Tour_cityId_idx" ON "Tour"("cityId");

-- CreateIndex
CREATE INDEX "Tour_type_idx" ON "Tour"("type");

-- CreateIndex
CREATE INDEX "TourPrice_tourId_idx" ON "TourPrice"("tourId");

-- CreateIndex
CREATE INDEX "Offer_cityId_idx" ON "Offer"("cityId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_targetType_idx" ON "Review"("targetType");

-- AddForeignKey
ALTER TABLE "LocationFilter" ADD CONSTRAINT "LocationFilter_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourPrice" ADD CONSTRAINT "TourPrice_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

