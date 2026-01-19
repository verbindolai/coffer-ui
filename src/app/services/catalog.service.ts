import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogSearchResponse, CatalogCoinDetails, CatalogSearchParams } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/catalog';

  searchCatalog(params: CatalogSearchParams): Observable<CatalogSearchResponse> {
    let httpParams = new HttpParams().set('query', params.query);

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<CatalogSearchResponse>(`${this.baseUrl}/search`, { params: httpParams });
  }

  getCoinDetails(typeId: string): Observable<CatalogCoinDetails> {
    return this.http.get<CatalogCoinDetails>(`${this.baseUrl}/types/${typeId}`);
  }
}
