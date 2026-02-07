import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoinService } from '../../services/coin.service';
import {
  CoinGroupResponse,
  CoinSearchParams,
  CoinGrade,
  CoinType,
  MetalType,
  COIN_GRADE_LABELS,
  COIN_TYPE_LABELS,
  METAL_TYPE_LABELS
} from '../../models/coin.model';
import { CurrentPricesResponse } from '../../models/valuation.model';
import { formatCurrency as formatCurrencyUtil, formatPurity } from '../../utils/format.utils';
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
            {{ totalQuantityCount() }} coins in your collection
            @if (totalCoinCount() !== totalQuantityCount()) {
              <span class="text-text-muted"> · {{ totalCoinCount() }} unique issues</span>
            }
            @if (totalGroups() !== totalCoinCount()) {
              <span class="text-text-muted"> · {{ totalGroups() }} types</span>
            }
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
      } @else if (groups().length === 0) {
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
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (group of groups(); track groupTrackBy(group)) {
            <a
              [routerLink]="getGroupLink(group)"
              class="relative block cursor-pointer group"
              [class.mb-3]="group.variantCount >= 3"
              [class.mb-1.5]="group.variantCount === 2"
            >
              <!-- Stack layer 2 (deepest, for 3+ variants) -->
              @if (group.variantCount >= 3) {
                <div class="card absolute inset-0 mx-3 pointer-events-none
                            translate-y-2.5 opacity-30
                            transition-all duration-200 ease-out
                            group-hover:translate-y-3 group-hover:mx-3.5 group-hover:opacity-40"
                     aria-hidden="true"></div>
              }
              <!-- Stack layer 1 (for 2+ variants) -->
              @if (group.variantCount >= 2) {
                <div class="card absolute inset-0 mx-1.5 pointer-events-none
                            translate-y-[5px] opacity-50
                            transition-all duration-200 ease-out
                            group-hover:translate-y-1.5 group-hover:mx-2 group-hover:opacity-60"
                     aria-hidden="true"></div>
              }

              <!-- Main Card -->
              <div class="card hover:border-border-medium relative z-10
                          transition-all duration-200 ease-out
                          group-hover:-translate-y-px">
                <div class="flex gap-4">
                  <!-- 3D Coin Viewer -->
                  <div class="w-20 h-20 rounded-lg shrink-0 overflow-hidden">
                    <app-coin-viewer-3d
                      [coinId]="group.representativeCoinId"
                      size="small"
                      [interactive]="false"
                      [showControls]="false"
                      [autoRotate]="true"
                      [metalType]="group.metalType"
                    ></app-coin-viewer-3d>
                  </div>

                  <!-- Coin Info -->
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                      {{ group.title }}
                    </h3>
                    <p class="text-sm text-text-secondary mt-0.5">
                      {{ getYearDisplay(group) }} · {{ group.issuerCountry }}
                    </p>

                    <div class="flex flex-wrap gap-2 mt-2">
                      <!-- Metal Badge -->
                      @if (group.metalType) {
                        <span [class]="getMetalBadgeClass(group.metalType)">
                          {{ metalTypeLabels[group.metalType] }}
                        </span>
                      }

                      <!-- Variant Count Badge -->
                      @if (group.isGroup) {
                        <span class="badge bg-accent/10 text-accent">
                          {{ group.variantCount }} variants
                        </span>
                      }

                      <!-- Total Quantity Badge -->
                      @if (group.totalQuantity > 1) {
                        <span class="badge bg-bg-tertiary text-text-secondary">
                          ×{{ group.totalQuantity }} total
                        </span>
                      }
                    </div>

                    <!-- Weight & Purity -->
                    <div class="flex gap-4 mt-2 text-xs text-text-muted">
                      <span>{{ group.weightInGrams }}g</span>
                      @if (group.purity) {
                        <span>{{ formatPurity(group.purity) }} pure</span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Prices -->
                @if (getCoinPrice(group.representativeCoinId).metal || getCoinPrice(group.representativeCoinId).collector) {
                  <div class="mt-3 pt-3 border-t border-border-subtle text-xs">
                    <div class="flex gap-4">
                      @if (getCoinPrice(group.representativeCoinId).metal) {
                        <div class="flex items-center gap-1.5">
                          <div class="w-1 h-3 bg-accent-emerald rounded-full"></div>
                          <span class="text-text-muted">Metal{{ group.totalQuantity > 1 ? ' /ea' : '' }}:</span>
                          <span class="text-text-primary font-medium font-mono">{{ formatPrice(getCoinPrice(group.representativeCoinId).metal!) }}</span>
                        </div>
                      }
                      @if (getCoinPrice(group.representativeCoinId).collector) {
                        <div class="flex items-center gap-1.5">
                          <div class="w-1 h-3 bg-accent-gold rounded-full"></div>
                          <span class="text-text-muted">Collector{{ group.totalQuantity > 1 ? ' /ea' : '' }}:</span>
                          <span class="text-text-primary font-medium font-mono">{{ formatPrice(getCoinPrice(group.representativeCoinId).collector!) }}</span>
                        </div>
                      }
                    </div>
                    @if (group.totalQuantity > 1 && getCoinPrice(group.representativeCoinId).metal) {
                      <div class="flex items-center gap-1.5 mt-1.5">
                        <div class="w-1 h-3 bg-accent-emerald/50 rounded-full"></div>
                        <span class="text-text-muted">Total (×{{ group.totalQuantity }}):</span>
                        <span class="text-text-primary font-semibold font-mono">{{ formatPrice(getCoinPrice(group.representativeCoinId).metal! * group.totalQuantity) }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </a>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between pt-4 border-t border-border-subtle">
            <p class="text-sm text-text-muted">
              Showing page {{ currentPage() + 1 }} of {{ totalPages() }}
              ({{ totalQuantityCount() }} coins total)
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
  groups = signal<CoinGroupResponse[]>([]);
  coinPrices = signal<Record<string, CurrentPricesResponse>>({});
  loading = signal(true);
  totalGroups = signal(0);
  totalCoinCount = signal(0);
  totalQuantityCount = signal(0);
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
  formatPrice = formatCurrencyUtil;

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

    this.coinService.getCoinsGrouped(params).subscribe({
      next: (response) => {
        this.groups.set(response.groups);
        this.totalGroups.set(response.totalGroups);
        this.totalCoinCount.set(response.totalCoinCount);
        this.totalQuantityCount.set(response.totalQuantityCount);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
        this.loadCoinPrices(response.groups);
      },
      error: (err) => {
        console.error('Error loading coins:', err);
        this.loading.set(false);
      }
    });
  }

  loadCoinPrices(groups: CoinGroupResponse[]): void {
    groups.forEach(group => {
      this.coinService.getCurrentPrices(group.representativeCoinId).subscribe({
        next: (prices) => {
          this.coinPrices.update(current => ({
            ...current,
            [group.representativeCoinId]: prices
          }));
        },
        error: () => {}
      });
    });
  }

  getCoinPrice(coinId: string): { metal: number | null; collector: number | null } {
    const prices = this.coinPrices()[coinId];
    if (!prices) return { metal: null, collector: null };

    const metalValue = prices.metalValue?.totalValue ?? null;

    let collectorValue: number | null = null;
    const collectorPrices = prices.collectorPrices;
    if (collectorPrices?.gradePrices?.length) {
      const coinGrade = collectorPrices.coinGrade;
      const gradePrice = coinGrade
        ? collectorPrices.gradePrices.find(gp => gp.grade === coinGrade)
        : collectorPrices.gradePrices[0];

      if (gradePrice) {
        collectorValue = gradePrice.minPrice;
      }
    }

    return { metal: metalValue, collector: collectorValue };
  }

  getYearDisplay(group: CoinGroupResponse): string {
    if (group.yearMin === group.yearMax) {
      return String(group.yearMin);
    }
    return `${group.yearMin}–${group.yearMax}`;
  }

  getGroupLink(group: CoinGroupResponse): string[] {
    if (group.isGroup && group.numistaId) {
      return ['/coins/type', group.numistaId];
    }
    return ['/coins', group.representativeCoinId];
  }

  groupTrackBy(group: CoinGroupResponse): string {
    return group.numistaId ?? group.representativeCoinId;
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
