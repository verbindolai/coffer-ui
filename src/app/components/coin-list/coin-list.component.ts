import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoinService } from '../../services/coin.service';
import {
  CoinResponse,
  CoinSearchParams,
  CoinGrade,
  CoinType,
  MetalType,
  COIN_GRADE_LABELS,
  COIN_TYPE_LABELS,
  METAL_TYPE_LABELS
} from '../../models/coin.model';
import { CurrentPricesResponse } from '../../models/valuation.model';
import { formatCurrency as formatCurrencyUtil, formatPurity, getRarityTier, getRarityColor } from '../../utils/format.utils';
import { CoinViewer3dComponent } from '../coin-viewer-3d/coin-viewer-3d.component';

@Component({
  selector: 'app-coin-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CoinViewer3dComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-text-primary">My Collection</h1>
          <p class="text-sm text-text-secondary mt-1">
            {{ totalElements() }} coins in your collection
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="flex flex-wrap gap-4">
          <!-- Search -->
          <div class="flex-1 min-w-[200px]">
            <input
              type="text"
              [(ngModel)]="searchTitle"
              (ngModelChange)="onFilterChange()"
              placeholder="Search by title..."
              class="input"
            />
          </div>

          <!-- Country Filter -->
          <div class="w-32">
            <input
              type="text"
              [(ngModel)]="filterCountry"
              (ngModelChange)="onFilterChange()"
              placeholder="Country"
              maxlength="2"
              class="input uppercase"
            />
          </div>

          <!-- Metal Type Filter -->
          <div class="w-40">
            <select [(ngModel)]="filterMetalType" (ngModelChange)="onFilterChange()" class="input">
              <option value="">All Metals</option>
              @for (metal of metalTypes; track metal) {
                <option [value]="metal">{{ metalTypeLabels[metal] }}</option>
              }
            </select>
          </div>

          <!-- Grade Filter -->
          <div class="w-48">
            <select [(ngModel)]="filterGrade" (ngModelChange)="onFilterChange()" class="input">
              <option value="">All Grades</option>
              @for (grade of grades; track grade) {
                <option [value]="grade">{{ gradeLabels[grade] }}</option>
              }
            </select>
          </div>

          <!-- Coin Type Filter -->
          <div class="w-56">
            <select [(ngModel)]="filterCoinType" (ngModelChange)="onFilterChange()" class="input">
              <option value="">All Types</option>
              @for (type of coinTypes; track type) {
                <option [value]="type">{{ coinTypeLabels[type] }}</option>
              }
            </select>
          </div>

          <!-- Clear Filters -->
          @if (hasActiveFilters()) {
            <button (click)="clearFilters()" class="btn btn-ghost">
              Clear
            </button>
          }
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="spinner"></div>
        </div>
      }

      <!-- Empty State -->
      @else if (coins().length === 0) {
        <div class="empty-state">
          <div class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-text-primary mb-2">
            {{ hasActiveFilters() ? 'No coins found' : 'Your collection is empty' }}
          </h3>
          <p class="text-text-secondary text-sm mb-4">
            {{ hasActiveFilters() ? 'Try adjusting your filters' : 'Add your first coin to get started!' }}
          </p>
          @if (!hasActiveFilters()) {
            <a routerLink="/coins/new" class="btn btn-primary">
              Add Your First Coin
            </a>
          }
        </div>
      }

      <!-- Coin Grid -->
      @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (coin of coins(); track coin.id) {
            <a
              [routerLink]="['/coins', coin.id]"
              class="card hover:border-border-medium transition-all cursor-pointer group"
            >
              <div class="flex gap-4">
                <!-- 3D Coin Viewer -->
                <div class="w-20 h-20 rounded-lg shrink-0 overflow-hidden">
                  <app-coin-viewer-3d
                    [coinId]="coin.id"
                    [coin]="coin"
                    size="small"
                    [interactive]="false"
                    [showControls]="false"
                    [autoRotate]="true"
                    [metalType]="coin.metalType"
                    [rarityScore]="coin.rarity?.score ?? null"
                  ></app-coin-viewer-3d>
                </div>

                <!-- Coin Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                    {{ coin.title }}
                  </h3>
                  <p class="text-sm text-text-secondary mt-0.5">
                    {{ coin.yearOfMinting }} · {{ coin.issuerCountry }}
                  </p>

                  <div class="flex flex-wrap gap-2 mt-2">
                    <!-- Metal Badge -->
                    @if (coin.metalType) {
                      <span [class]="getMetalBadgeClass(coin.metalType)">
                        {{ metalTypeLabels[coin.metalType] }}
                      </span>
                    }

                    <!-- Grade Badge -->
                    @if (coin.grade) {
                      <span class="badge bg-bg-tertiary text-text-secondary">
                        {{ gradeLabels[coin.grade] }}
                      </span>
                    }

                    <!-- Rarity -->
                    @if (coin.rarity && coin.rarity.score) {
                      <span [class]="'badge bg-bg-tertiary ' + getRarityColor(coin.rarity.score)">
                        {{ getRarityTier(coin.rarity.score) }}
                      </span>
                    }
                  </div>

                  <!-- Weight & Purity -->
                  <div class="flex gap-4 mt-2 text-xs text-text-muted">
                    <span>{{ coin.weightInGrams }}g</span>
                    @if (coin.purity) {
                      <span>{{ formatPurity(coin.purity) }} pure</span>
                    }
                    @if (coin.quantity > 1) {
                      <span>×{{ coin.quantity }}</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Prices -->
              @if (getCoinPrice(coin.id).metal || getCoinPrice(coin.id).collector) {
                <div class="mt-3 pt-3 border-t border-border-subtle flex gap-4 text-xs">
                  @if (getCoinPrice(coin.id).metal) {
                    <div class="flex items-center gap-1.5">
                      <div class="w-1 h-3 bg-accent-emerald rounded-full"></div>
                      <span class="text-text-muted">Metal:</span>
                      <span class="text-text-primary font-medium font-mono">{{ formatPrice(getCoinPrice(coin.id).metal!) }}</span>
                    </div>
                  }
                  @if (getCoinPrice(coin.id).collector) {
                    <div class="flex items-center gap-1.5">
                      <div class="w-1 h-3 bg-accent-gold rounded-full"></div>
                      <span class="text-text-muted">Collector:</span>
                      <span class="text-text-primary font-medium font-mono">{{ formatPrice(getCoinPrice(coin.id).collector!) }}</span>
                    </div>
                  }
                </div>
              }
            </a>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between pt-4 border-t border-border-subtle">
            <p class="text-sm text-text-muted">
              Showing {{ (currentPage() * pageSize()) + 1 }}-{{ Math.min((currentPage() + 1) * pageSize(), totalElements()) }}
              of {{ totalElements() }} coins
            </p>

            <div class="flex gap-2">
              <button
                (click)="goToPage(currentPage() - 1)"
                [disabled]="currentPage() === 0"
                class="btn btn-secondary"
                [class.opacity-50]="currentPage() === 0"
              >
                Previous
              </button>
              <button
                (click)="goToPage(currentPage() + 1)"
                [disabled]="currentPage() >= totalPages() - 1"
                class="btn btn-secondary"
                [class.opacity-50]="currentPage() >= totalPages() - 1"
              >
                Next
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class CoinListComponent implements OnInit {
  private coinService = inject(CoinService);

  // State
  coins = signal<CoinResponse[]>([]);
  coinPrices = signal<Record<string, CurrentPricesResponse>>({});
  loading = signal(true);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(12);

  // Filters
  searchTitle = '';
  filterCountry = '';
  filterMetalType = '';
  filterGrade = '';
  filterCoinType = '';

  // Filter options
  grades = Object.values(CoinGrade);
  coinTypes = Object.values(CoinType);
  metalTypes = Object.values(MetalType);
  gradeLabels = COIN_GRADE_LABELS;
  coinTypeLabels = COIN_TYPE_LABELS;
  metalTypeLabels = METAL_TYPE_LABELS;

  // Utility functions
  formatPurity = formatPurity;
  getRarityTier = getRarityTier;
  formatPrice = formatCurrencyUtil;
  getRarityColor = getRarityColor;
  Math = Math;

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadCoins();
  }

  loadCoins(): void {
    this.loading.set(true);

    const params: CoinSearchParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sort: 'createdAt,desc'
    };

    if (this.searchTitle) params.title = this.searchTitle;
    if (this.filterCountry) params.country = this.filterCountry.toUpperCase();
    if (this.filterMetalType) params.metalType = this.filterMetalType as MetalType;
    if (this.filterGrade) params.grade = this.filterGrade as CoinGrade;
    if (this.filterCoinType) params.coinType = this.filterCoinType as CoinType;

    this.coinService.getCoins(params).subscribe({
      next: (response) => {
        this.coins.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
        this.loadCoinPrices(response.content);
      },
      error: (err) => {
        console.error('Error loading coins:', err);
        this.loading.set(false);
      }
    });
  }

  loadCoinPrices(coins: CoinResponse[]): void {
    coins.forEach(coin => {
      this.coinService.getCurrentPrices(coin.id).subscribe({
        next: (prices) => {
          this.coinPrices.update(current => ({
            ...current,
            [coin.id]: prices
          }));
        },
        error: () => {
          // Silently fail for price loading
        }
      });
    });
  }

  getCoinPrice(coinId: string): { metal: number | null; collector: number | null } {
    const prices = this.coinPrices()[coinId];
    if (!prices) return { metal: null, collector: null };

    // Get metal value
    const metalValue = prices.metalValue?.totalValue ?? null;

    // Get collector value for the coin's grade
    let collectorValue: number | null = null;
    const collectorPrices = prices.collectorPrices;
    if (collectorPrices?.gradePrices?.length) {
      // Find the price for the coin's grade, or use the first available
      const coinGrade = collectorPrices.coinGrade;
      const gradePrice = coinGrade
        ? collectorPrices.gradePrices.find(gp => gp.grade === coinGrade)
        : collectorPrices.gradePrices[0];

      if (gradePrice) {
        collectorValue = gradePrice.minPrice;
      }
    }

    return {
      metal: metalValue,
      collector: collectorValue
    };
  }

  onFilterChange(): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadCoins();
    }, 300);
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTitle || this.filterCountry || this.filterMetalType || this.filterGrade || this.filterCoinType);
  }

  clearFilters(): void {
    this.searchTitle = '';
    this.filterCountry = '';
    this.filterMetalType = '';
    this.filterGrade = '';
    this.filterCoinType = '';
    this.currentPage.set(0);
    this.loadCoins();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadCoins();
    }
  }

  getMetalBadgeClass(metalType: MetalType): string {
    switch (metalType) {
      case MetalType.GOLD:
        return 'badge badge-gold';
      case MetalType.SILVER:
        return 'badge badge-silver';
      case MetalType.PLATINUM:
        return 'badge badge-platinum';
      default:
        return 'badge bg-bg-tertiary text-text-secondary';
    }
  }
}
