import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Unit } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class UnitsApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  getUnitsByProject(projectSlug: string): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${this.base}/projects/${encodeURIComponent(projectSlug)}/units`).pipe(catchError(() => of([])));
  }

  getUnitBySlug(projectSlug: string, unitSlug: string): Observable<Unit | undefined> {
    return this.http
      .get<Unit>(
        `${this.base}/projects/${encodeURIComponent(projectSlug)}/units/${encodeURIComponent(unitSlug)}`,
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
}
