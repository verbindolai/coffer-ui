import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioValuationResponse, Timeframe } from '../models/valuation.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/portfolio';

  getPortfolioValuation(timeframe: Timeframe = '1d'): Observable<PortfolioValuationResponse> {
    const params = new HttpParams().set('timeframe', timeframe);
    return this.http.get<PortfolioValuationResponse>(`${this.baseUrl}/valuation`, { params });
  }
}
