import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogListingFilter, Project } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  getProjectsByCity(citySlug: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/cities/${encodeURIComponent(citySlug)}/projects`).pipe(catchError(() => of([])));
  }

  getProjectBySlug(citySlug: string, projectSlug: string): Observable<Project | undefined> {
    return this.http
      .get<Project>(
        `${this.base}/cities/${encodeURIComponent(citySlug)}/projects/${encodeURIComponent(projectSlug)}`,
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

  getLocationFilters(citySlug: string): Observable<CatalogListingFilter[]> {
    return this.http
      .get<CatalogListingFilter[]>(`${this.base}/cities/${encodeURIComponent(citySlug)}/location-filters`)
      .pipe(catchError(() => of([])));
  }
}
