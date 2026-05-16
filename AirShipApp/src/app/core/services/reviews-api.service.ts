import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PublicReview, ReviewSubmitRequest } from '../models/app.models';

export interface ReviewSubmitResponse {
  success: boolean;
  id: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewsApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  getApproved(targetType: 'app' = 'app'): Observable<PublicReview[]> {
    const params = new HttpParams().set('targetType', targetType);
    return this.http
      .get<PublicReview[]>(`${this.base}/reviews`, { params })
      .pipe(catchError(() => of([])));
  }

  submitReview(body: ReviewSubmitRequest): Observable<ReviewSubmitResponse> {
    return this.http.post<ReviewSubmitResponse>(`${this.base}/reviews`, body);
  }
}
