import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CoinService } from '../../services/coin.service';
import { CoinResponse, CoinGrade, COIN_GRADE_LABELS, COIN_TYPE_LABELS, METAL_TYPE_LABELS, COIN_SHAPE_LABELS, MetalType } from '../../models/coin.model';
import { CoinValuationResponse, CurrentPricesResponse, Timeframe } from '../../models/valuation.model';
import { CoinViewer3dComponent } from '../coin-viewer-3d/coin-viewer-3d.component';
import { ValuationChartComponent } from '../chart/valuation-chart.component';
import { formatCurrency, formatPurity, formatWeight, formatDimension, formatDate, getRarityTier, getRarityColor } from '../../utils/format.utils';

@Component({
  selector: 'app-coin-details',
  standalone: true,
  imports: [CommonModule, RouterLink, CoinViewer3dComponent, ValuationChartComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </a>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="spinner"></div>
        </div>
      } @else if (coin()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column: 3D Viewer -->
          <div class="space-y-6">
            <div class="card p-0 overflow-hidden">
              <div class="aspect-square">
                <app-coin-viewer-3d
                  [coinId]="coin()!.id"
                  [coin]="coin()"
                  [metalType]="coin()!.metalType"
                  [rarityScore]="coin()!.rarity?.score ?? null"
                  size="large"
                  [showControls]="true"
                />
              </div>
            </div>
          </div>

          <!-- Right Column: Info -->
          <div class="space-y-6">
            <!-- Title & Actions -->
            <div class="card">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h1 class="text-2xl font-semibold text-text-primary">{{ coin()!.title }}</h1>
                  <p class="text-text-secondary mt-1">
                    {{ coin()!.yearOfMinting }} · {{ coin()!.issuerCountry }}
                    @if (coin()!.mintMark) {
                      · {{ coin()!.mintMark }}
                    }
                  </p>
                </div>
                <a [routerLink]="['/coins', coin()!.id, 'edit']" class="btn btn-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </a>
              </div>

              <!-- Badges -->
              <div class="flex flex-wrap gap-2 mt-4">
                @if (coin()!.metalType) {
                  <span [class]="getMetalBadgeClass(coin()!.metalType!)">
                    {{ metalTypeLabels[coin()!.metalType!] }}
                  </span>
                }
                @if (coin()!.grade) {
                  <span class="badge bg-bg-tertiary text-text-secondary">
                    {{ gradeLabels[coin()!.grade!] }}
                  </span>
                }
                <span class="badge bg-bg-tertiary text-text-secondary">
                  {{ coinTypeLabels[coin()!.type] }}
                </span>
                @if (coin()!.rarity?.score) {
                  <span [class]="'badge bg-bg-tertiary ' + getRarityColor(coin()!.rarity!.score)">
                    {{ getRarityTier(coin()!.rarity!.score) }} ({{ coin()!.rarity!.score }})
                  </span>
                }
              </div>
            </div>

            <!-- Specifications -->
            <div class="card">
              <h2 class="text-lg font-medium text-text-primary mb-4">Specifications</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-text-muted uppercase tracking-wider">Weight</p>
                  <p class="text-text-primary font-medium">{{ formatWeight(coin()!.weightInGrams) }}</p>
                </div>
                @if (coin()!.purity) {
                  <div>
                    <p class="text-xs text-text-muted uppercase tracking-wider">Purity</p>
                    <p class="text-text-primary font-medium">{{ formatPurity(coin()!.purity) }}</p>
                  </div>
                }
                @if (coin()!.diameterInMillimeters) {
                  <div>
                    <p class="text-xs text-text-muted uppercase tracking-wider">Diameter</p>
                    <p class="text-text-primary font-medium">{{ formatDimension(coin()!.diameterInMillimeters) }}</p>
                  </div>
                }
                @if (coin()!.thicknessInMillimeters) {
                  <div>
                    <p class="text-xs text-text-muted uppercase tracking-wider">Thickness</p>
                    <p class="text-text-primary font-medium">{{ formatDimension(coin()!.thicknessInMillimeters) }}</p>
                  </div>
                }
                <div>
                  <p class="text-xs text-text-muted uppercase tracking-wider">Shape</p>
                  <p class="text-text-primary font-medium">{{ shapeLabels[coin()!.shape] }}</p>
                </div>
                <div>
                  <p class="text-xs text-text-muted uppercase tracking-wider">Quantity</p>
                  <p class="text-text-primary font-medium">{{ coin()!.quantity }}</p>
                </div>
                @if (coin()!.denomination) {
                  <div>
                    <p class="text-xs text-text-muted uppercase tracking-wider">Face Value</p>
                    <p class="text-text-primary font-medium">{{ coin()!.denomination }} {{ coin()!.currency }}</p>
                  </div>
                }
                @if (coin()!.numistaId) {
                  <div>
                    <p class="text-xs text-text-muted uppercase tracking-wider">Numista ID</p>
                    <a class="text-text-primary font-medium underline"
                       [href]="'https://en.numista.com/' + coin()!.numistaId">{{ coin()!.numistaId }}</a>
                  </div>
                }
              </div>

              @if (coin()!.notes) {
                <div class="mt-4 pt-4 border-t border-border-subtle">
                  <p class="text-xs text-text-muted uppercase tracking-wider mb-1">Notes</p>
                  <p class="text-text-secondary text-sm">{{ coin()!.notes }}</p>
                </div>
              }

              <div class="mt-4 pt-4 border-t border-border-subtle">
                <p class="text-xs text-text-muted">
                  Added {{ formatDate(coin()!.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Price Overview -->
            @if (currentPricesData() || currentPricesLoading()) {
              <div class="card">
                <h2 class="text-lg font-medium text-text-primary mb-4">Current Prices</h2>

                @if (currentPricesLoading()) {
                  <div class="flex items-center justify-center py-8">
                    <div class="spinner"></div>
                  </div>
                } @else if (currentPricesData()) {
                  <div class="space-y-4">
                    <!-- Metal Value -->
                    @if (getCurrentMetalValue(); as metalValue) {
                      <div class="p-4 bg-bg-tertiary rounded-lg border border-accent-emerald/20">
                        <div class="flex items-center gap-2 mb-2">
                          <div class="w-1 h-6 bg-accent-emerald rounded-full"></div>
                          <span class="text-xs font-medium text-text-muted uppercase tracking-wider">Metal Value</span>
                        </div>
                        <p class="text-2xl font-semibold text-text-primary font-mono">
                          {{ formatCurrency(metalValue) }}
                        </p>
                      </div>
                    }

                    <!-- Collector Prices by Grade -->
                    @if (getCollectorPrices(); as collectorPrices) {
                      <div class="p-4 bg-bg-tertiary rounded-lg border border-accent-gold/20">
                        <div class="flex items-center gap-2 mb-3">
                          <div class="w-1 h-6 bg-accent-gold rounded-full"></div>
                          <span class="text-xs font-medium text-text-muted uppercase tracking-wider">Collector Values by Grade</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          @for (gradePrice of collectorPrices.gradePrices; track gradePrice.grade) {
                            <div
                              [class]="gradePrice.grade === collectorPrices.coinGrade
                                ? 'p-3 bg-accent-gold/5 rounded-lg border border-accent-gold/20'
                                : 'p-3 bg-bg-secondary rounded-lg border border-border-subtle'"
                            >
                              <p class="text-xs text-text-muted mb-1">
                                {{ getGradeDisplay(gradePrice.grade) }}
                                @if (gradePrice.grade === collectorPrices.coinGrade) {
                                  <span class="text-accent-gold font-medium ml-1">★</span>
                                }
                              </p>
                              @if (gradePrice.minPrice === gradePrice.maxPrice) {
                                <p [class]="gradePrice.grade === collectorPrices.coinGrade
                                  ? 'text-lg font-semibold text-accent-gold font-mono'
                                  : 'text-lg font-semibold text-text-primary font-mono'">
                                  {{ formatCurrency(gradePrice.minPrice) }}
                                </p>
                              } @else {
                                <p [class]="gradePrice.grade === collectorPrices.coinGrade
                                  ? 'text-base font-semibold text-accent-gold font-mono'
                                  : 'text-base font-semibold text-text-primary font-mono'">
                                  {{ formatCurrency(gradePrice.minPrice) }} - {{ formatCurrency(gradePrice.maxPrice) }}
                                </p>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }

                    @if (getCurrentMetalValue() === null && !getCollectorPrices()) {
                      <p class="text-text-muted text-sm text-center py-4">
                        No price data available yet
                      </p>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
        <div class="Alsmt-8">
          <!-- Valuation Chart -->
          <app-valuation-chart
            title="Coin Valuation"
            [data]="valuationData()"
            [loading]="valuationLoading"
            [selectedTimeframe]="selectedTimeframe"
            (selectedTimeframeChange)="onTimeframeChange($event)"
          />
        </div>

      } @else {
        <div class="empty-state">
          <h3 class="text-lg font-medium text-text-primary mb-2">Coin not found</h3>
          <a routerLink="/" class="btn btn-primary mt-4">Back to Collection</a>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CoinDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coinService = inject(CoinService);

  // State
  loading = signal(true);
  coin = signal<CoinResponse | null>(null);
  valuationData = signal<CoinValuationResponse | null>(null);
  valuationLoading = signal(false);
  selectedTimeframe = signal<Timeframe>('1d');
  currentPricesData = signal<CurrentPricesResponse | null>(null);
  currentPricesLoading = signal(false);

  // Labels
  gradeLabels = COIN_GRADE_LABELS;
  coinTypeLabels = COIN_TYPE_LABELS;
  metalTypeLabels = METAL_TYPE_LABELS;
  shapeLabels = COIN_SHAPE_LABELS;

  // Utility functions
  formatCurrency = formatCurrency;
  formatPurity = formatPurity;
  formatWeight = formatWeight;
  formatDimension = formatDimension;
  formatDate = formatDate;
  getRarityTier = getRarityTier;
  getRarityColor = getRarityColor;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCoin(id);
      this.loadValuation(id);
      this.loadCurrentPrices(id);
    } else {
      this.loading.set(false);
    }
  }

  loadCoin(id: string): void {
    this.coinService.getCoin(id).subscribe({
      next: (coin) => {
        this.coin.set(coin);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading coin:', err);
        this.loading.set(false);
      }
    });
  }

  loadValuation(id: string): void {
    this.valuationLoading.set(true);
    this.coinService.getCoinValuation(id, this.selectedTimeframe()).subscribe({
      next: (data) => {
        this.valuationData.set(data);
        this.valuationLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading valuation:', err);
        this.valuationLoading.set(false);
      }
    });
  }

  loadCurrentPrices(id: string): void {
    this.currentPricesLoading.set(true);
    this.coinService.getCurrentPrices(id).subscribe({
      next: (data) => {
        this.currentPricesData.set(data);
        this.currentPricesLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading current prices:', err);
        this.currentPricesLoading.set(false);
      }
    });
  }

  getCurrentMetalValue(): number | null {
    const data = this.currentPricesData();
    return data?.metalValue?.totalValue ?? null;
  }

  getCollectorPrices(): CurrentPricesResponse['collectorPrices'] {
    return this.currentPricesData()?.collectorPrices ?? null;
  }

  getGradeDisplay(grade: string): string {
    return this.gradeLabels[grade as CoinGrade] || grade.replace(/_/g, ' ');
  }

  onTimeframeChange(timeframe: Timeframe): void {
    this.selectedTimeframe.set(timeframe);
    const coinId = this.coin()?.id;
    if (coinId) {
      this.loadValuation(coinId);
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
