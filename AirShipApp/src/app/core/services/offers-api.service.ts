import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offer } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class OffersApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.base}/offers`).pipe(catchError(() => of([])));
  }

  getOfferById(id: string): Observable<Offer | null> {
    const safe = encodeURIComponent(id);
    return this.http.get<Offer>(`${this.base}/offers/${safe}`).pipe(catchError(() => of(null)));
  }
}
