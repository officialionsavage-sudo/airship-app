import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AdminNoticeService } from '../shared/admin-notice/admin-notice.service';
import { AdminAuthService } from './admin-auth.service';

/** Match admin routes whether HttpClient used a relative path or a full origin URL. */
function isAdminApiUrl(url: string): boolean {
  const withoutQueryHash = url.split(/[?#]/, 1)[0] ?? url;
  try {
    if (withoutQueryHash.startsWith('http://') || withoutQueryHash.startsWith('https://')) {
      return new URL(withoutQueryHash).pathname.includes('/api/admin');
    }
  } catch {
    /* ignore */
  }
  return withoutQueryHash.includes('/api/admin');
}

/** RFC 7617-style UTF-8 Basic payload (ASCII-safe `btoa` wrapper). */
function basicAuthHeader(username: string, password: string): string {
  const raw = `${username}:${password}`;
  const bytes = new TextEncoder().encode(raw);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return btoa(bin);
}

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AdminAuthService);
  const notice = inject(AdminNoticeService);
  const c = auth.credentials();
  const cloned =
    c && isAdminApiUrl(req.url)
      ? req.clone({ setHeaders: { Authorization: `Basic ${basicAuthHeader(c.username, c.password)}` } })
      : req;

  return next(cloned).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 403 && isAdminApiUrl(req.url)) {
        notice.error('Read-only account: you cannot change data.');
      }
      return throwError(() => err);
    }),
  );
};
