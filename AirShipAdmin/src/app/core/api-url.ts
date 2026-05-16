import { environment } from '../../environments/environment';

/** Build absolute or same-origin URL for HttpClient. */
export function apiUrl(path: string): string {
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
