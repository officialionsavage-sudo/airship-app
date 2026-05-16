import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { HomePageContent } from '../models/home-page.models';

@Injectable({ providedIn: 'root' })
export class SiteContentApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  getHome(): Observable<Partial<HomePageContent> | null> {
    return this.http.get<Partial<HomePageContent>>(`${this.base}/site-content/home`).pipe(
      catchError(() => of(null)),
    );
  }
}
