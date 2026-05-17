import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { resolveSiteContact, type ResolvedSiteContact } from '../site-contact';

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private readonly http = inject(HttpClient);
  private cache$: Observable<Record<string, string>> | null = null;
  private contactCache$: Observable<ResolvedSiteContact> | null = null;

  /** Cached GET /api/site-settings (empty object on failure). */
  getSettings(): Observable<Record<string, string>> {
    if (!this.cache$) {
      const base = environment.apiBaseUrl.replace(/\/$/, '');
      const url = `${base}/api/site-settings`;
      this.cache$ = this.http.get<Record<string, string>>(url).pipe(
        catchError(() => of({})),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.cache$;
  }

  /** Resolved contact + WhatsApp digits from site settings. */
  getContact(): Observable<ResolvedSiteContact> {
    if (!this.contactCache$) {
      this.contactCache$ = this.getSettings().pipe(
        map((map) => resolveSiteContact(map)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.contactCache$;
  }
}
