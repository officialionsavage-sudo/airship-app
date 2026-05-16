import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactRequest } from '../models/app.models';

export interface ContactSubmitResponse {
  success: boolean;
  message: string;
  payload: ContactRequest;
}

@Injectable({ providedIn: 'root' })
export class ContactApiService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  submitContact(request: ContactRequest): Observable<ContactSubmitResponse> {
    return this.http.post<ContactSubmitResponse>(`${this.base}/contact`, request);
  }
}
