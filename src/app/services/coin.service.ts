import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CoinResponse,
  CreateCoinRequest,
  UpdateCoinRequest,
  CoinImageResponse,
  PageResponse,
  CoinSearchParams,
  GroupedCoinSearchResponse
} from '../models';
import { CoinValuationResponse, CurrentPricesResponse, Timeframe } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CoinService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/coins';

  // CRUD Operations
  getCoins(params: CoinSearchParams = {}): Observable<PageResponse<CoinResponse>> {
    let httpParams = new HttpParams();

    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.denomination) httpParams = httpParams.set('denomination', params.denomination);
    if (params.grade) httpParams = httpParams.set('grade', params.grade);
    if (params.coinType) httpParams = httpParams.set('coinType', params.coinType);
    if (params.yearFrom) httpParams = httpParams.set('yearFrom', params.yearFrom.toString());
    if (params.yearTo) httpParams = httpParams.set('yearTo', params.yearTo.toString());
    if (params.metalType) httpParams = httpParams.set('metalType', params.metalType);
    if (params.shape) httpParams = httpParams.set('shape', params.shape);
    if (params.currency) httpParams = httpParams.set('currency', params.currency);
    if (params.title) httpParams = httpParams.set('title', params.title);
    if (params.numistaId) httpParams = httpParams.set('numistaId', params.numistaId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http.get<PageResponse<CoinResponse>>(this.baseUrl, { params: httpParams });
  }

  getCoinsGrouped(params: CoinSearchParams = {}): Observable<GroupedCoinSearchResponse> {
    let httpParams = new HttpParams();

    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.denomination) httpParams = httpParams.set('denomination', params.denomination);
    if (params.grade) httpParams = httpParams.set('grade', params.grade);
    if (params.coinType) httpParams = httpParams.set('coinType', params.coinType);
    if (params.yearFrom) httpParams = httpParams.set('yearFrom', params.yearFrom.toString());
    if (params.yearTo) httpParams = httpParams.set('yearTo', params.yearTo.toString());
    if (params.metalType) httpParams = httpParams.set('metalType', params.metalType);
    if (params.shape) httpParams = httpParams.set('shape', params.shape);
    if (params.currency) httpParams = httpParams.set('currency', params.currency);
    if (params.title) httpParams = httpParams.set('title', params.title);
    if (params.numistaId) httpParams = httpParams.set('numistaId', params.numistaId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http.get<GroupedCoinSearchResponse>(`${this.baseUrl}/grouped`, { params: httpParams });
  }

  getCoinsByType(numistaId: string): Observable<CoinResponse[]> {
    return this.http.get<CoinResponse[]>(`${this.baseUrl}/type/${numistaId}`);
  }

  getCoin(id: string): Observable<CoinResponse> {
    return this.http.get<CoinResponse>(`${this.baseUrl}/${id}`);
  }

  createCoin(coin: CreateCoinRequest): Observable<CoinResponse> {
    return this.http.post<CoinResponse>(this.baseUrl, coin);
  }

  updateCoin(id: string, coin: UpdateCoinRequest): Observable<CoinResponse> {
    return this.http.put<CoinResponse>(`${this.baseUrl}/${id}`, coin);
  }

  deleteCoin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Images
  getCoinImages(coinId: string): Observable<CoinImageResponse[]> {
    return this.http.get<CoinImageResponse[]>(`${this.baseUrl}/${coinId}/images`);
  }

  getCoinImage(coinId: string, imageId: string): Observable<CoinImageResponse> {
    return this.http.get<CoinImageResponse>(`${this.baseUrl}/${coinId}/images/${imageId}`);
  }

  getCoinImageUrl(coinId: string, imageId: string): string {
    return `${this.baseUrl}/${coinId}/images/${imageId}/content`;
  }

  // Valuation
  getCoinValuation(coinId: string, timeframe: Timeframe = '1d'): Observable<CoinValuationResponse> {
    const params = new HttpParams().set('timeframe', timeframe);
    return this.http.get<CoinValuationResponse>(`${this.baseUrl}/${coinId}/valuation`, { params });
  }

  getCurrentPrices(coinId: string): Observable<CurrentPricesResponse> {
    return this.http.get<CurrentPricesResponse>(`${this.baseUrl}/${coinId}/current-prices`);
  }
}
