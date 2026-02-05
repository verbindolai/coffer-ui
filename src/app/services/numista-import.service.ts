import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NumistaAuthUrlResponse {
  url: string;
}

export interface NumistaImportResult {
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NumistaImportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/import/numista';

  getAuthUrl(): Observable<NumistaAuthUrlResponse> {
    return this.http.get<NumistaAuthUrlResponse>(`${this.baseUrl}/auth-url`);
  }

  importCollection(code: string, redirectUri: string): Observable<NumistaImportResult> {
    return this.http.post<NumistaImportResult>(`${this.baseUrl}/callback`, { code, redirectUri });
  }
}
