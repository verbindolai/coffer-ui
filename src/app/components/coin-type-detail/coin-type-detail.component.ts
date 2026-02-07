import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CoinService } from '../../services/coin.service';
import {
  CoinResponse,
  CoinGrade,
  COIN_GRADE_LABELS,
  COIN_TYPE_LABELS,
  METAL_TYPE_LABELS,
  MetalType
} from '../../models/coin.model';
import { CurrentPricesResponse } from '../../models/valuation.model';
import { formatCurrency, formatPurity, formatWeight, formatDate } from '../../utils/format.utils';
import { CoinViewer3dComponent } from '../coin-viewer-3d/coin-viewer-3d.component';

@Component({
  selector: 'app-coin-type-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CoinViewer3dComponent],
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
      } @else if (coins().length > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column: 3D Viewer -->
          <div class="space-y-6">
            <div class="card p-0 overflow-hidden">
              <div class="aspect-square">
                <app-coin-viewer-3d
                  [coinId]="coins()[0].id"
                  [coin]="coins()[0]"
                  [metalType]="coins()[0].metalType"
                  [rarityScore]="coins()[0].rarity?.score ?? null"
                  size="large"
                  [showControls]="true"
                />
              </div>
            </div>
          </div>

          <!-- Right Column: Type Info -->
          <div class="space-y-6">
            <!-- Title & Type Info -->
            <div class="card">
              <h1 class="text-2xl font-semibold text-text-primary">{{ coins()[0].title }}</h1>
              <p class="text-text-secondary mt-1">
                {{ getYearRange() }} · {{ coins()[0].issuerCountry }}
              </p>

              <!-- Badges -->
              <div class="flex flex-wrap gap-2 mt-4">
                @if (coins()[0].metalType) {
                  <span [class]="getMetalBadgeClass(coins()[0].metalType!)">
                    {{ metalTypeLabels[coins()[0].metalType!] }}
                  </span>
                }
                <span class="badge bg-bg-tertiary text-text-secondary">
                  {{ coinTypeLabels[coins()[0].type] }}
                </span>
                <span class="badge bg-accent/10 text-accent">
                  {{ coins().length }} variants
                </span>
                @if (getTotalQuantity() > coins().length) {
                  <span class="badge bg-bg-tertiary text-text-secondary">
                    ×{{ getTotalQuantity() }} total
                  </span>
                }
              </div>

              <!-- Specs summary -->
              <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border-subtle">
                <div>
                  <p class="text-xs text-text-muted uppercase tracking-wider">Weight</p>
                  <p class="text-text-primary font-medium">{{ formatWeight(coins()[0].weightInGrams) }}</p>
                </div>
                @if (coins()[0].purity) {
                  <div>
                    <p class="text-xs text-text-muted uppercase tracking-wider">Purity</p>
                    <p class="text-text-primary font-medium">{{ formatPurity(coins()[0].purity) }}</p>
                  </div>
                }
                @if (coins()[0].numistaId) {
                  <div>
                    <p class="text-xs text-text-muted uppercase tracking-wider">Numista ID</p>
                    <a class="text-text-primary font-medium underline"
                       [href]="'https://en.numista.com/' + coins()[0].numistaId">{{ coins()[0].numistaId }}</a>
                  </div>
                }
              </div>
            </div>

            <!-- Variants List -->
            <div class="card">
              <h2 class="text-lg font-medium text-text-primary mb-4">Variants</h2>
              <div class="space-y-2">
                @for (coin of coins(); track coin.id) {
                  <a
                    [routerLink]="['/coins', coin.id]"
                    class="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:border-border-medium transition-colors group"
                  >
                    <div class="flex items-center gap-4 min-w-0">
                      <div class="flex flex-col min-w-0">
                        <span class="text-text-primary font-medium group-hover:text-accent transition-colors">
                          {{ coin.yearOfMinting }}
                          @if (coin.mintMark) {
                            <span class="text-text-secondary font-normal">· {{ coin.mintMark }}</span>
                          }
                        </span>
                        <div class="flex gap-2 mt-1">
                          @if (coin.grade) {
                            <span class="text-xs text-text-muted">{{ gradeLabels[coin.grade] }}</span>
                          }
                          @if (coin.quantity > 1) {
                            <span class="text-xs text-text-muted">×{{ coin.quantity }}</span>
                          }
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-4 shrink-0">
                      <!-- Price for this variant -->
                      @if (getCoinPrice(coin.id).metal) {
                        <span class="text-sm text-text-primary font-mono">{{ formatCurrency(getCoinPrice(coin.id).metal!) }}</span>
                      }
                      <!-- Arrow -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <h3 class="text-lg font-medium text-text-primary mb-2">No coins found for this type</h3>
          <a routerLink="/" class="btn btn-primary mt-4">Back to Collection</a>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CoinTypeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private coinService = inject(CoinService);

  loading = signal(true);
  coins = signal<CoinResponse[]>([]);
  coinPrices = signal<Record<string, CurrentPricesResponse>>({});

  gradeLabels = COIN_GRADE_LABELS;
  coinTypeLabels = COIN_TYPE_LABELS;
  metalTypeLabels = METAL_TYPE_LABELS;

  formatCurrency = formatCurrency;
  formatPurity = formatPurity;
  formatWeight = formatWeight;
  formatDate = formatDate;

  ngOnInit(): void {
    const numistaId = this.route.snapshot.paramMap.get('numistaId');
    if (numistaId) {
      this.loadCoins(numistaId);
    } else {
      this.loading.set(false);
    }
  }

  loadCoins(numistaId: string): void {
    this.coinService.getCoinsByType(numistaId).subscribe({
      next: (coins) => {
        this.coins.set(coins.sort((a, b) => b.yearOfMinting - a.yearOfMinting));
        this.loading.set(false);
        this.loadPrices(coins);
      },
      error: (err) => {
        console.error('Error loading coins by type:', err);
        this.loading.set(false);
      }
    });
  }

  loadPrices(coins: CoinResponse[]): void {
    coins.forEach(coin => {
      this.coinService.getCurrentPrices(coin.id).subscribe({
        next: (prices) => {
          this.coinPrices.update(current => ({
            ...current,
            [coin.id]: prices
          }));
        },
        error: () => {}
      });
    });
  }

  getCoinPrice(coinId: string): { metal: number | null; collector: number | null } {
    const prices = this.coinPrices()[coinId];
    if (!prices) return { metal: null, collector: null };
    return {
      metal: prices.metalValue?.totalValue ?? null,
      collector: null
    };
  }

  getYearRange(): string {
    const years = this.coins().map(c => c.yearOfMinting);
    const min = Math.min(...years);
    const max = Math.max(...years);
    return min === max ? String(min) : `${min}–${max}`;
  }

  getTotalQuantity(): number {
    return this.coins().reduce((sum, c) => sum + c.quantity, 0);
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
