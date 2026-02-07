import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { CoinService } from '../../services/coin.service';
import { GroupedCoinSearchResponse } from '../../models/coin.model';
import { PortfolioValuationResponse, Timeframe } from '../../models/valuation.model';
import { ValuationChartComponent } from '../chart/valuation-chart.component';
import { formatCurrency, formatWeight } from '../../utils/format.utils';

@Component({
  selector: 'app-portfolio-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, ValuationChartComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">Portfolio Overview</h1>
        <p class="text-sm text-text-secondary mt-1">
          Track your collection's total value
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Coins -->
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-text-muted uppercase tracking-wider">Total Coins</p>
              <p class="text-xl font-semibold text-text-primary">{{ totalQuantity() }}</p>
              @if (totalCoins() !== totalQuantity()) {
                <p class="text-xs text-text-muted mt-0.5">{{ totalCoins() }} unique issues</p>
              }
            </div>
          </div>
        </div>

        <!-- Gold Holdings -->
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-accent-gold/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-text-muted uppercase tracking-wider">Gold</p>
              <p class="text-xl font-semibold text-text-primary">{{ formatWeight(goldGrams()) }}</p>
            </div>
          </div>
        </div>

        <!-- Silver Holdings -->
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-400/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-text-muted uppercase tracking-wider">Silver</p>
              <p class="text-xl font-semibold text-text-primary">{{ formatWeight(silverGrams()) }}</p>
            </div>
          </div>
        </div>

        <!-- Platinum Holdings -->
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-text-muted uppercase tracking-wider">Platinum</p>
              <p class="text-xl font-semibold text-text-primary">{{ formatWeight(platinumGrams()) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="spinner"></div>
        </div>
      } @else {
        <!-- Valuation Chart -->
        <div class="mt-8">
        <app-valuation-chart
          title="Portfolio Value"
          [data]="valuationData()"
          [loading]="valuationLoading"
          [selectedTimeframe]="selectedTimeframe"
          (selectedTimeframeChange)="onTimeframeChange($event)"
        />
        </div>


        <!-- Empty State -->
        @if (!hasData()) {
          <div class="card">
            <div class="empty-state">
              <div class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-text-primary mb-2">No valuation data yet</h3>
              <p class="text-text-secondary text-sm mb-4">
                Add coins with metal content to see portfolio valuations
              </p>
              <a routerLink="/coins/new" class="btn btn-primary">
                Add Your First Coin
              </a>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class PortfolioOverviewComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  private coinService = inject(CoinService);

  // State
  loading = signal(true);
  valuationData = signal<PortfolioValuationResponse | null>(null);
  valuationLoading = signal(false);
  selectedTimeframe = signal<Timeframe>('1d');
  totalCoins = signal(0);
  totalQuantity = signal(0);

  // Utility functions
  formatCurrency = formatCurrency;
  formatWeight = formatWeight;

  // Computed values
  goldGrams = computed(() => {
    const points = this.valuationData()?.metalValuation?.dataPoints;
    if (!points || points.length === 0) return 0;
    return points[points.length - 1].goldGrams;
  });

  silverGrams = computed(() => {
    const points = this.valuationData()?.metalValuation?.dataPoints;
    if (!points || points.length === 0) return 0;
    return points[points.length - 1].silverGrams;
  });

  platinumGrams = computed(() => {
    const points = this.valuationData()?.metalValuation?.dataPoints;
    if (!points || points.length === 0) return 0;
    return points[points.length - 1].platinumGrams;
  });

  hasData = computed(() => {
    const data = this.valuationData();
    if (!data) return false;
    const metalPoints = data.metalValuation?.dataPoints?.length ?? 0;
    const collectorPoints = data.collectorValuation?.dataPoints?.length ?? 0;
    return metalPoints > 0 || collectorPoints > 0;
  });

  ngOnInit(): void {
    this.loadCoinCount();
    this.loadValuation();
  }

  loadCoinCount(): void {
    this.coinService.getCoinsGrouped({ size: 1 }).subscribe({
      next: (response) => {
        this.totalCoins.set(response.totalCoinCount);
        this.totalQuantity.set(response.totalQuantityCount);
      }
    });
  }

  loadValuation(): void {
    this.valuationLoading.set(true);
    this.portfolioService.getPortfolioValuation(this.selectedTimeframe()).subscribe({
      next: (data) => {
        this.valuationData.set(data);
        this.valuationLoading.set(false);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading portfolio valuation:', err);
        this.valuationLoading.set(false);
        this.loading.set(false);
      }
    });
  }

  onTimeframeChange(timeframe: Timeframe): void {
    this.selectedTimeframe.set(timeframe);
    this.loadValuation();
  }
}
