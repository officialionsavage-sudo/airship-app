import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingRequest } from '../models/app.models';

export interface BookingSubmitResponse {
  success: boolean;
  confirmationId: string;
  payload: BookingRequest;
}

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  submitBooking(request: BookingRequest): Observable<BookingSubmitResponse> {
    return this.http.post<BookingSubmitResponse>(`${this.base}/bookings`, request);
  }
}
