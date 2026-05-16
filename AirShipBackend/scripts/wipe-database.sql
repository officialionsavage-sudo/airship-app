-- Wipe all application data and reclaim space (keeps empty public schema).
-- Run after: export DATABASE_URL='your-railway-public-url?sslmode=require'
--   psql "$DATABASE_URL" -f scripts/wipe-database.sql
-- Then: npm run db:deploy

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;
GRANT ALL ON SCHEMA public TO public;
