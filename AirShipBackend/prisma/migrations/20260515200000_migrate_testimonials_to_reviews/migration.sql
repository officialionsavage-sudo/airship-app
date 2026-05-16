-- Migrate curated testimonials into approved app reviews, then drop Testimonial.
INSERT INTO "Review" (
  "id",
  "targetType",
  "targetSlug",
  "name",
  "email",
  "text",
  "rating",
  "role",
  "citySlug",
  "status",
  "createdAt"
)
SELECT
  "id",
  'app'::"ReviewTarget",
  NULL,
  "name",
  NULL,
  "text",
  "rating",
  "role",
  "citySlug",
  'approved'::"ReviewStatus",
  TIMESTAMP '2020-01-01 00:00:00' + ("sortOrder" * INTERVAL '1 second')
FROM "Testimonial";

DROP TABLE "Testimonial";
