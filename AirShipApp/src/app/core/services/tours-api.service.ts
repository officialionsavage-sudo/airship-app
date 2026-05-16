import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tour, TourPrice, CatalogListingFilter } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class ToursApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  getToursByCity(citySlug: string): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.base}/cities/${encodeURIComponent(citySlug)}/tours`).pipe(catchError(() => of([])));
  }

  getTourBySlug(citySlug: string, tourSlug: string): Observable<Tour | undefined> {
    return this.http
      .get<Tour>(
        `${this.base}/cities/${encodeURIComponent(citySlug)}/tours/${encodeURIComponent(tourSlug)}`,
      )
      .pipe(
        catchError((err: HttpErrorResponse | unknown) => {
          if (err instanceof HttpErrorResponse && err.status === 404) {
            return of(undefined);
          }
          throw err;
        }),
      );
  }

  getPriceLabel(price: TourPrice): string {
    return price.discountPercent === 100 ? 'Free' : `EGP ${price.amount.toLocaleString()}`;
  }

  /** Dynamic filters per city (Admin → Tour filters). */
  getTourTypeFilters(citySlug: string): Observable<CatalogListingFilter[]> {
    return this.http
      .get<CatalogListingFilter[]>(
        `${this.base}/cities/${encodeURIComponent(citySlug)}/tour-type-filters`,
      )
      .pipe(catchError(() => of([])));
  }

  formatTourKind(type: Tour['type']): string {
    const labels: Record<Tour['type'], string> = {
      sea: 'Sea',
      desert: 'Desert',
      island: 'Island',
      city: 'City',
      adventure: 'Adventure',
      wellness: 'Wellness',
    };
    return labels[type] ?? type;
  }
}
