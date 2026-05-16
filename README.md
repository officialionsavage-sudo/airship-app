# Airship

Monorepo layout:

| Folder | Purpose |
|--------|---------|
| **`AirShipApp/`** | Public Angular SPA + SSR — **own** `package.json`, `angular.json`, `tsconfig.json`, [`proxy.conf.json`](AirShipApp/proxy.conf.json) |
| **`AirShipAdmin/`** | Staff Angular admin SPA — **own** `package.json`, `angular.json`, `tsconfig.json`, [`proxy.conf.json`](AirShipAdmin/proxy.conf.json) |
| **`AirShipBackend/`** | Express API + Prisma — **own** `package.json` and tooling |

Each app installs dependencies into its own **`node_modules`** (no shared Angular workspace at the repo root). The repo root only has a tiny [**`package.json`**](package.json) with helper scripts such as **`npm run install:all`**.

**First-time setup:** from the repo root run **`npm run install:all`**, or run **`npm install`** inside each of **`AirShipApp/`**, **`AirShipAdmin/`**, and **`AirShipBackend/`**.

## Development server

Public site — from **`AirShip/`**:

```bash
cd AirShipApp && npm start
```

Opens **`http://localhost:4200/`** (sources under [`AirShipApp/src/`](AirShipApp/src/)).

### Admin SPA ([`AirShipAdmin/`](AirShipAdmin/))

Staff UI for `/api/admin/*` (CMS, catalog CRUD, moderation):

```bash
cd AirShipAdmin && npm start
```

Dev server uses port **4201** and [`AirShipAdmin/proxy.conf.json`](AirShipAdmin/proxy.conf.json) (same proxy rules as the public app’s [`AirShipApp/proxy.conf.json`](AirShipApp/proxy.conf.json)).

1. Optionally set **`ADMIN_USERNAME`** and **`ADMIN_PASSWORD`** in `AirShipBackend/.env` (see [`AirShipBackend/.env.example`](AirShipBackend/.env.example)). If you omit both password env vars (**`ADMIN_PASSWORD`** and **`ADMIN_API_KEY`**), the API uses **`admin`** / **`admin123`**. If you set a password secret without **`ADMIN_USERNAME`**, legacy **Bearer** auth is used (not the admin SPA flow). The admin SPA sends **HTTP Basic** when signing in; wrong credentials get **401**.
2. Put both SPA origins in **`CORS_ORIGIN`** (comma-separated), including **`127.0.0.1`** variants if you open the apps via **`http://127.0.0.1:…`** instead of **`localhost`**—otherwise the browser blocks cross-origin responses (see example in [`.env.example`](AirShipBackend/.env.example)).
3. Open **`http://localhost:4201`** (or **`127.0.0.1:4201`** if listed in CORS), sign in with the same username and password as in `.env` (stored in `sessionStorage` only).

After editing **`AirShipBackend/.env`**, **restart the API** so env vars reload. The API loads **`.env` from `AirShipBackend/`** regardless of shell cwd. In production, always set strong **`ADMIN_PASSWORD`** (and **`ADMIN_USERNAME`**) — do not rely on built-in defaults on a public host.

**Site content (`home`):** edit structured fields in the admin **Form** tab or switch to **Raw JSON**. Preview uses **tabs** (Phone / Tablet / Desktop) over one iframe loading **`environment.publicSiteOrigin`** (default **`http://localhost:4200`**) with **`?cmsPreview=1`** and **`postMessage`** sync. Run **`cd AirShipApp && npm start`** alongside the admin; CMS-driven hero / sections update from your edits while **city cards** and **approved reviews** still load from the API. The admin resolves **`mergeHomePageContent`** from **`AirShipApp`** via **`AirShipAdmin/tsconfig.json`** path aliases — keep both apps aligned when changing defaults.

Never ship **`ADMIN_USERNAME`**, **`ADMIN_PASSWORD`** (or legacy **`ADMIN_API_KEY`**), or admin bundles to public hosting without tightening auth further (JWT, SSO, IP allowlist, etc.).

## Local API + Postgres (Docker)

From the repo root:

1. Start Postgres: `docker compose up -d` (or from `AirShipBackend/`: `npm run db:up`).
2. Configure the API: `cp AirShipBackend/.env.example AirShipBackend/.env` (adjust `DATABASE_URL` if you change credentials in `docker-compose.yml`).
3. Apply schema: `cd AirShipBackend && npm run db:deploy` (first time) or `npm run db:migrate` while iterating.
4. Seed catalog data (cities, catalog filters, projects/units, tours, offers, sample approved reviews): `cd AirShipBackend && npm run db:seed`. This clears **catalog** tables plus **approved app reviews** from fixtures (`City`, `CatalogFilter`, `Project`, `Unit`, `Tour`, `Offer`, seeded `Review` rows) and re-inserts fixtures—safe to re-run in dev; it does **not** wipe pending/rejected reviews or booking/contact rows.
5. Run the API: `cd AirShipBackend && npm run dev` — serves `http://localhost:3000` (`/health`, `/api/cities`, `/api/projects`, …).

Stop the database: `docker compose down` (or `cd AirShipBackend && npm run db:down`). Postgres listens on host port **5433** (maps to 5432 in the container) to avoid colliding with a local Postgres on 5432. URL: `postgresql://airship:airship@localhost:5433/airship?schema=public`.

### Database UI (development)

- **Prisma Studio** (recommended, uses your schema): from `AirShipBackend/` run `npm run db:studio` — opens **`http://localhost:5555`** and reads `DATABASE_URL` from `AirShipBackend/.env`.
- **Adminer** (browser, phpMyAdmin-like): `docker compose up -d` also starts Adminer at **`http://localhost:8080`**. Log in with **System: PostgreSQL**, **Server: `postgres`** (Docker service name), **Username: `airship`**, **Password: `airship`**, **Database: `airship`**. From your Mac you still use port **5433** for CLI/desktop tools; Adminer runs inside the compose network and talks to Postgres on **`postgres:5432`**.

Backend env vars (`AirShipBackend/.env`): `DATABASE_URL`, `PORT` (default `3000`), `CORS_ORIGIN` (comma-separated origins, e.g. `http://localhost:4200,http://localhost:4201`). In production, list every SPA origin explicitly—do **not** use a wildcard.

### API baseline security

The Express app applies:

- **Helmet** for safer default HTTP headers (CSP is disabled so Swagger UI works locally; tighten or proxy `/api-docs` in production if you expose this server publicly).
- **`express.json({ limit: '100kb' })`** on public routes; **`15mb`** on **`/api/admin`** only for large base64 payloads.
- **Rate limiting**: roughly **300 requests / 15 minutes / IP** on public `/api/**` routes (**`/api/admin` is excluded** from this general bucket), and a stricter **25 / 15 minutes / IP** budget shared across `POST /api/bookings`, `POST /api/contact`, and `POST /api/reviews` (responds with **429** when exceeded).

This is not a substitute for WAF, auth on admin routes, or hiding Swagger behind a gateway in production.

### Images (self-hosted on the API)

**New uploads:** Admin image fields upload to **`POST /api/admin/uploads`** (multipart). Files are stored on disk (`MEDIA_ROOT`, default `AirShipBackend/uploads/`; on Railway attach a **Volume** at e.g. `/data/media`) and served at **`GET /media/…`**. Postgres stores the **public URL** (e.g. `https://your-api.railway.app/media/catalog/…`) in the same columns as before (`imageBase64`, `images[]`, etc.).

Env (`AirShipBackend/.env`): **`MEDIA_ROOT`**, **`MEDIA_PUBLIC_BASE_URL`** (your API origin, no trailing slash). See [`.env.example`](AirShipBackend/.env.example).

**Legacy rows** may still contain base64 data URIs; the API continues to serve them until you re-save with an upload. New saves reject embedded base64 (use upload or paste an `https://` URL).

Legacy relative paths such as `assets/…` still work for old seed assets.

**Dev seed catalog:** `npm run db:seed` loads JPEG **data URIs** from [`AirShipBackend/prisma/seed-images/img1.b64`](AirShipBackend/prisma/seed-images/img1.b64) … `img5.b64` (see [`seed-images.loader.ts`](AirShipBackend/prisma/seed-images.loader.ts)). To regenerate those files from a chat-style markdown paste, drop it in `AirShipBackend/prisma/seed-images-source.md` and run `node prisma/split-seed-images.mjs` from `AirShipBackend/`.

### Backend REST routes (`http://localhost:3000`)

| Method | Path | Description |
|--------|------|--------------|
| GET | `/health` | Liveness |
| GET | `/api/cities` | List cities |
| GET | `/api/cities/:slug` | City by slug |
| GET | `/api/cities/:slug/location-filters` | Location filters for city |
| GET | `/api/cities/:slug/tour-type-filters` | Tour type filter buckets for city |
| GET | `/api/cities/:citySlug/projects` | Projects in city |
| GET | `/api/cities/:citySlug/projects/:projectSlug` | Project detail (city must match) |
| GET | `/api/projects` | Projects; optional `?city=citySlug` |
| GET | `/api/projects/:slug` | Project by slug; optional `?citySlug=` to enforce city |
| GET | `/api/projects/:projectSlug/units` | Units in project |
| GET | `/api/projects/:projectSlug/units/:unitSlug` | Unit detail |
| GET | `/api/cities/:citySlug/tours` | Tours; optional `?type=TourType` enum |
| GET | `/api/cities/:citySlug/tours/:tourSlug` | Tour detail |
| GET | `/api/offers` | Offers; optional `?type=property|trip` |
| GET | `/api/reviews` | Approved reviews only; optional `?targetType=app` (home) |
| GET | `/api/site-content/:key` | CMS JSON payload |
| GET | `/api/site-settings` | Key/value map |
| POST | `/api/bookings` | Booking inquiry body → [`BookingRequest`](AirShipApp/src/app/core/models/app.models.ts) |
| POST | `/api/contact` | Contact form → [`ContactRequest`](AirShipApp/src/app/core/models/app.models.ts) |
| POST | `/api/reviews` | Submit review (`pending` until admin approves) |

### Admin API (`ADMIN_USERNAME` + `ADMIN_PASSWORD`, or legacy Bearer)

All routes are prefixed with **`/api/admin`**. With **HTTP Basic**, username is **`ADMIN_USERNAME`** if set, otherwise **`admin`** when no **`ADMIN_PASSWORD`** / **`ADMIN_API_KEY`** is configured (built-in dev defaults **`admin`** / **`admin123`** apply). Password is **`ADMIN_PASSWORD`** or legacy **`ADMIN_API_KEY`**, or **`admin123`** when neither secret env var is set. If **`ADMIN_PASSWORD`** or **`ADMIN_API_KEY`** is set but **`ADMIN_USERNAME`** is not, auth is **`Authorization: Bearer <secret>`** or **`X-Admin-Password`** / **`X-Admin-Key`** (legacy single-secret mode).

Representative routes (full surface lives under [`AirShipBackend/src/routes/admin/`](AirShipBackend/src/routes/admin/)):

| Method | Path | Description |
|--------|------|-------------|
| GET/PUT/DELETE | `/api/admin/site-content`, `/api/admin/site-content/:key` | CMS rows |
| GET/PUT/DELETE | `/api/admin/site-settings`, `/api/admin/site-settings/:key` | Settings strings |
| GET/PATCH | `/api/admin/reviews`, `/api/admin/reviews/:id` | Review moderation (`status`) |
| GET | `/api/admin/booking-inquiries`, `.../:id` | Read-only |
| GET | `/api/admin/contact-inquiries`, `.../:id` | Read-only |
| CRUD | `/api/admin/cities`, `/api/admin/cities/:id` | Cities |
| CRUD | `/api/admin/cities/:cityId/location-filters`, `/api/admin/location-filters/:id` | Project listing filters |
| CRUD | `/api/admin/cities/:cityId/tour-type-filters`, `/api/admin/tour-type-filters/:id` | Tour listing filters |
| CRUD | `/api/admin/projects`, `/api/admin/projects/:id` | Projects |
| GET/POST | `/api/admin/projects/:projectId/units` | List/create units |
| GET/PUT/DELETE | `/api/admin/units/:id` | Single unit |
| CRUD | `/api/admin/tours`, `/api/admin/tours/:id` | Tours + nested prices |
| CRUD | `/api/admin/offers`, `/api/admin/offers/:id` | Offers |

**Swagger UI:** [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) (when `npm run dev` is running). Raw OpenAPI JSON: `GET http://localhost:3000/openapi.json`.

Examples:

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3000/api/cities
```

After many repeated `POST`s to `/api/contact` (or bookings/reviews), you should eventually see HTTP **429** from the stricter inquiry limiter—useful smoke-check that rate limiting is active.

### Deploy API + Postgres on Railway

1. Add **PostgreSQL** and a **Node service** from this repo with root **`AirShipBackend`**.
2. Set **`DATABASE_URL=${{Postgres.DATABASE_URL}}`** on the API service (private URL like `postgres.railway.internal` is correct **only inside Railway**).
3. **Do not** put Railway internal URLs in your laptop `.env` if you run Prisma locally—they fail from your Mac with **P1001**. Use Railway’s **public** Postgres URL from the dashboard **only** for optional local tools (`psql`, one-off imports).
4. **Migrations:** **`npm start`** runs **`prisma migrate deploy`** then starts the server, so each deploy applies migrations automatically ([`AirShipBackend/package.json`](AirShipBackend/package.json)).
5. Copy **local Docker data** to hosted Postgres: deploy API once so tables exist, then follow **[`AirShipBackend/scripts/COPY_DATA_TO_RAILWAY.txt`](AirShipBackend/scripts/COPY_DATA_TO_RAILWAY.txt)** (`export-local-db.sh` → **`public`** `DATABASE_URL` → `import-to-hosted-db.sh`). Internal Railway URLs (`postgres.railway.internal`) **will not work** from your laptop.
6. **Secrets:** If a DB URL or password was ever pasted into chat or tickets, **rotate credentials** in Railway Postgres variables.
7. **Media volume:** Attach a Railway **Volume** to the API service (e.g. mount at `/data/media`), set **`MEDIA_ROOT=/data/media`** and **`MEDIA_PUBLIC_BASE_URL=https://your-api.up.railway.app`** (no trailing slash). Without a volume, uploads are lost on redeploy.

#### Slow admin API (small JSON, many seconds)

A **40 KB** response should not take tens of seconds to **download**; that wait is almost always **time to first byte** (server or database), not bandwidth.

Typical causes on Railway-style hosting:

- **Service sleep / cold start** — After idle, the first request pays container wake-up plus Prisma connecting to Postgres. That can look like **10–30 s** once, then faster until idle again. Fix: keep the service awake (paid tier, or an external cron hitting **`GET /health`** every few minutes), or accept the first-hit delay.
- **Postgres far from the API** — Put the DB in the **same region** as the Node service. The API’s **`DATABASE_URL`** should use Railway’s **private** Postgres URL on the API service (see above).
- **Public vs internal DB URL** — On the **API** service, prefer the **internal** `DATABASE_URL` Railway injects from the Postgres plugin. Using a **public** proxy URL for every request adds extra network hops (usually not 20 s alone, but avoid it when both run on Railway).
- **Huge admin list payloads** — List endpoints used to SELECT every column (including multi‑megabyte base64 images per row). They now return **thin rows**; full payloads load when you open an editor (e.g. **Cities** and **Cars** fetch `GET …/:id` on edit).

To see where time goes: watch Railway logs for **`[slow http]`** (warns when a request takes **≥ `LOG_SLOW_REQUEST_MS`**, default **3000** ms). For SQL detail, set **`LOG_PRISMA_QUERIES=1`** on the API **briefly** (noisy). See [`AirShipBackend/.env.example`](AirShipBackend/.env.example).

### Frontend + API

- Dev builds use [`AirShipApp/src/environments/environment.ts`](AirShipApp/src/environments/environment.ts) with **`apiBaseUrl: ''`** so the browser calls **`/api/…`** on the dev-server origin and [`proxy.conf.json`](AirShipApp/proxy.conf.json) forwards to **`http://localhost:3000`** (avoids huge hosted responses during `ng serve`).
- Production builds replace with [`environment.prod.ts`](AirShipApp/src/environments/environment.prod.ts) (`apiBaseUrl` → Railway API origin `https://airship-production.up.railway.app`, or change when your API URL changes).
- Each Angular app wires **`proxy.conf.json`** for **`ng serve`** / **`npm start`** so **`apiBaseUrl: ''`** still reaches the API on port **3000** during local development.

### Deploy AirShipApp (Vercel)

Angular writes static files to **`AirShipApp/dist/airship/browser/`** (not `dist/`). If Vercel’s **Output Directory** is wrong, the deployment succeeds but every URL returns **404**.

Use **`AirShipApp`** as the Vercel **Root Directory** (monorepo). [`AirShipApp/vercel.json`](AirShipApp/vercel.json) pins **`buildCommand`**, **`outputDirectory`**, and SPA **`rewrites`** so client routes such as **`/city/…`** work on refresh (only a few routes are prerendered as static HTML).

Keep **`environment.clientHydration`** at **`false`** in [`environment.prod.ts`](AirShipApp/src/environments/environment.prod.ts) for static hosting — **`provideClientHydration()`** is only for a real Node SSR deployment (`serve:ssr`). Turning it on while uploading only the **`browser/`** folder can prevent Angular from finishing bootstrap (endless tab spinner stuck on the boot splash).

This ships the **browser** bundle only; the **`dist/airship/server/`** SSR bundle is not executed unless you add a separate Node/serverless setup.

### Deploy AirShipAdmin (Vercel)

Treat this like the public app: static assets live under **`AirShipAdmin/dist/airship-admin/browser/`**. [`AirShipAdmin/vercel.json`](AirShipAdmin/vercel.json) sets **`outputDirectory`**, SPA **`rewrites`**, and **`npm run build -- --configuration production`** (the admin project’s Angular **`defaultConfiguration`** is **`development`**, so a bare **`npm run build`** would ship an unoptimized dev bundle).

Use **`AirShipAdmin`** as the Vercel **Root Directory** for a separate admin deployment.

## Code scaffolding

From **`AirShipApp/`** or **`AirShipAdmin/`**, run `npx ng generate component component-name` (or `ng generate …` if you use a globally installed CLI).

## Build

- Public app: `cd AirShipApp && npm run build` → **`AirShipApp/dist/airship/browser/`** (and **`dist/airship/server/`** if SSR is enabled)
- Admin: `cd AirShipAdmin && npm run build -- --configuration production` → **`AirShipAdmin/dist/airship-admin/browser/`**
- API: `cd AirShipBackend && npm run build` → **`AirShipBackend/dist/`**

From the repo root you can also run **`npm run build:app`**, **`npm run build:admin`**, **`npm run build:api`**.

## Running unit tests

From **`AirShipApp/`** or **`AirShipAdmin/`**, run **`npm test`** ([Karma](https://karma-runner.github.io)).

## Further help

Angular CLI: **`ng help`** or [Angular CLI docs](https://angular.io/cli).
