import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { City } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class CitiesApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.base}/cities`).pipe(catchError(() => of([])));
  }

  getCityBySlug(citySlug: string): Observable<City | undefined> {
    return this.http.get<City>(`${this.base}/cities/${encodeURIComponent(citySlug)}`).pipe(
      catchError((err: HttpErrorResponse | unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          return of(undefined);
        }
        throw err;
      }),
    );
  }
}
