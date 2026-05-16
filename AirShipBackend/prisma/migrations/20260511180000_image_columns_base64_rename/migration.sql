-- Rename image columns to reflect base64 / data-URI storage (values remain TEXT).
ALTER TABLE "City" RENAME COLUMN "imageUrl" TO "imageBase64";
ALTER TABLE "City" RENAME COLUMN "heroImageUrl" TO "heroImageBase64";
ALTER TABLE "Project" RENAME COLUMN "heroImageUrl" TO "heroImageBase64";
ALTER TABLE "Offer" RENAME COLUMN "imageUrl" TO "imageBase64";
