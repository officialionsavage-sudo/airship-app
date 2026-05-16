import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from './api-url';

export type MediaUploadResponse = { url: string; path: string };

@Injectable({ providedIn: 'root' })
export class AdminMediaUploadService {
  private readonly http = inject(HttpClient);

  uploadImage(file: File, scope = 'catalog'): Observable<MediaUploadResponse> {
    const form = new FormData();
    form.append('file', file, file.name);
    const params = new HttpParams().set('scope', scope);
    return this.http.post<MediaUploadResponse>(apiUrl('/api/admin/uploads'), form, { params });
  }
}
