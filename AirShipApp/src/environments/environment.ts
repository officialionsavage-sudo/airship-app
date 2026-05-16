export const environment = {
  production: false,
  /**
   * Empty string = browser calls `/api/...` on the dev-server origin; `proxy.conf.json` forwards to
   * `http://localhost:3000`. Much faster than pulling multi‑MB JSON from a hosted API during `ng serve`.
   * Production builds replace this file with `environment.prod.ts` (absolute API URL for deployed SSR).
   */
  apiBaseUrl: '',
  /**
   * `provideClientHydration()` only when you actually serve SSR HTML from Node (`serve:ssr`).
   * Static hosting (Vercel, S3) must keep this **false** or bootstrap can hang behind the boot overlay.
   */
  clientHydration: false,
};
