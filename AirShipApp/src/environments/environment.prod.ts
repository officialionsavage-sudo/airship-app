export const environment = {
  production: true,
  /** Public Express API (Railway). No trailing slash — services append `/api`. */
  apiBaseUrl: 'https://airship-app-production.up.railway.app',
  /**
   * Keep **false** for Vercel / static `browser/` deploys. Set **true** only if you run Angular SSR
   * (`npm run serve:ssr`) behind Node so serialized HTML matches the client bundle.
   */
  clientHydration: false,
};
