import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoinService } from '../../services/coin.service';
import { CatalogService } from '../../services/catalog.service';
import {
  CoinResponse,
  CoinGrade,
  CoinType,
  MetalType,
  CoinShape,
  COIN_GRADE_LABELS,
  COIN_TYPE_LABELS,
  METAL_TYPE_LABELS,
  COIN_SHAPE_LABELS,
  CreateCoinRequest,
  UpdateCoinRequest
} from '../../models/coin.model';
import { CatalogCoinDetails } from '../../models/catalog.model';

@Component({
  selector: 'app-coin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </a>
        <h1 class="text-2xl font-semibold text-text-primary">
          {{ isEditMode() ? 'Edit Coin' : 'Add New Coin' }}
        </h1>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="spinner"></div>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Catalog Search / Numista ID -->
          @if (!isEditMode()) {
            <div class="card bg-bg-tertiary">
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium text-text-primary">Search Numista Catalog</h3>
                    <p class="text-sm text-text-secondary mt-1">
                      Auto-fill form fields by searching the coin catalog
                    </p>
                  </div>
                  <button
                    type="button"
                    (click)="openCatalogSearch()"
                    class="btn btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Search Catalog
                  </button>
                </div>

                <div class="border-t border-border-subtle pt-4">
                  <p class="text-sm text-text-secondary mb-3">
                    Or enter a Numista ID directly:
                  </p>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      [(ngModel)]="directNumistaId"
                      [ngModelOptions]="{standalone: true}"
                      class="input flex-1"
                      placeholder="Enter Numista ID (e.g., 12345)"
                      (keyup.enter)="fetchByNumistaId()"
                    />
                    <button
                      type="button"
                      (click)="fetchByNumistaId()"
                      class="btn btn-secondary"
                      [disabled]="!directNumistaId || fetchingNumistaId()"
                    >
                      @if (fetchingNumistaId()) {
                        <div class="w-4 h-4 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin"></div>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      }
                      Fetch
                    </button>
                  </div>
                  @if (numistaIdError()) {
                    <p class="text-negative text-xs mt-2">{{ numistaIdError() }}</p>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Basic Info -->
          <div class="card">
            <h2 class="text-lg font-medium text-text-primary mb-4">Basic Information</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Title -->
              <div class="md:col-span-2">
                <label class="input-label">Title *</label>
                <input
                  type="text"
                  formControlName="title"
                  class="input"
                  placeholder="e.g., American Gold Eagle 1 oz"
                />
                @if (form.get('title')?.touched && form.get('title')?.errors?.['required']) {
                  <p class="text-negative text-xs mt-1">Title is required</p>
                }
              </div>

              <!-- Year -->
              <div>
                <label class="input-label">Year of Minting *</label>
                <input
                  type="number"
                  formControlName="year"
                  class="input"
                  placeholder="2023"
                  min="1"
                  max="2100"
                />
                @if (form.get('year')?.touched && form.get('year')?.errors) {
                  <p class="text-negative text-xs mt-1">Year must be between 1 and 2100</p>
                }
              </div>

              <!-- Country -->
              <div>
                <label class="input-label">Country Code *</label>
                <input
                  type="text"
                  formControlName="countryCode"
                  class="input uppercase"
                  placeholder="US"
                  maxlength="2"
                />
                @if (form.get('countryCode')?.touched && form.get('countryCode')?.errors) {
                  <p class="text-negative text-xs mt-1">2-letter country code required</p>
                }
              </div>

              <!-- Currency -->
              <div>
                <label class="input-label">Currency *</label>
                <input
                  type="text"
                  formControlName="currency"
                  class="input uppercase"
                  placeholder="USD"
                  maxlength="3"
                />
                @if (form.get('currency')?.touched && form.get('currency')?.errors) {
                  <p class="text-negative text-xs mt-1">3-letter currency code required</p>
                }
              </div>

              <!-- Denomination -->
              <div>
                <label class="input-label">Denomination</label>
                <input
                  type="number"
                  formControlName="denomination"
                  class="input"
                  placeholder="50"
                  min="0"
                  step="0.01"
                />
              </div>

              <!-- Mint Mark -->
              <div>
                <label class="input-label">Mint Mark</label>
                <input
                  type="text"
                  formControlName="mintMark"
                  class="input"
                  placeholder="W"
                />
              </div>

              <!-- Coin Type -->
              <div>
                <label class="input-label">Coin Type *</label>
                <select formControlName="coinType" class="input">
                  @for (type of coinTypes; track type) {
                    <option [value]="type">{{ coinTypeLabels[type] }}</option>
                  }
                </select>
              </div>

              <!-- Grade -->
              <div>
                <label class="input-label">Grade *</label>
                <select formControlName="grade" class="input">
                  @for (grade of grades; track grade) {
                    <option [value]="grade">{{ gradeLabels[grade] }}</option>
                  }
                </select>
              </div>

              <!-- Quantity -->
              <div>
                <label class="input-label">Quantity</label>
                <input
                  type="number"
                  formControlName="quantity"
                  class="input"
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>
          </div>

          <!-- Physical Specifications -->
          <div class="card">
            <h2 class="text-lg font-medium text-text-primary mb-4">Physical Specifications</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Weight -->
              <div>
                <label class="input-label">Weight (grams) *</label>
                <input
                  type="number"
                  formControlName="weightInGrams"
                  class="input"
                  placeholder="31.1035"
                  min="0"
                  step="0.0001"
                />
                @if (form.get('weightInGrams')?.touched && form.get('weightInGrams')?.errors) {
                  <p class="text-negative text-xs mt-1">Weight must be greater than 0</p>
                }
              </div>

              <!-- Metal Type -->
              <div>
                <label class="input-label">Metal Type</label>
                <select formControlName="metalType" class="input">
                  <option value="">Select...</option>
                  @for (metal of metalTypes; track metal) {
                    <option [value]="metal">{{ metalTypeLabels[metal] }}</option>
                  }
                </select>
              </div>

              <!-- Purity -->
              <div>
                <label class="input-label">
                  Purity
                  <span class="text-text-muted">(1-1000, e.g., 999 = 99.9%)</span>
                </label>
                <input
                  type="number"
                  formControlName="purity"
                  class="input"
                  placeholder="999"
                  min="1"
                  max="1000"
                />
              </div>

              <!-- Diameter -->
              <div>
                <label class="input-label">Diameter (mm)</label>
                <input
                  type="number"
                  formControlName="diameterInMillimeters"
                  class="input"
                  placeholder="32.7"
                  min="0"
                  step="0.1"
                />
              </div>

              <!-- Thickness -->
              <div>
                <label class="input-label">Thickness (mm)</label>
                <input
                  type="number"
                  formControlName="thicknessInMillimeters"
                  class="input"
                  placeholder="2.87"
                  min="0"
                  step="0.01"
                />
              </div>

              <!-- Shape -->
              <div>
                <label class="input-label">Shape</label>
                <select formControlName="shape" class="input">
                  @for (shape of shapes; track shape) {
                    <option [value]="shape">{{ shapeLabels[shape] }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="card">
            <h2 class="text-lg font-medium text-text-primary mb-4">Additional Information</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Numista ID -->
              <div>
                <label class="input-label">
                  Numista ID
                  <span class="text-text-muted">(enables auto image fetch)</span>
                </label>
                <input
                  type="text"
                  formControlName="numistaId"
                  class="input"
                  placeholder="12345"
                  maxlength="50"
                />
              </div>

              <!-- Rarity Score -->
              <div>
                <label class="input-label">Rarity Score (1-100)</label>
                <input
                  type="number"
                  formControlName="rarityScore"
                  class="input"
                  placeholder="25"
                  min="1"
                  max="100"
                />
              </div>

              <!-- Notes -->
              <div class="md:col-span-2">
                <label class="input-label">Notes</label>
                <textarea
                  formControlName="notes"
                  class="input min-h-[100px] resize-y"
                  placeholder="Any additional notes about this coin..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            @if (isEditMode()) {
              <button
                type="button"
                (click)="onDelete()"
                class="btn btn-danger mr-auto"
                [disabled]="submitting()"
              >
                Delete Coin
              </button>
            }
            <a routerLink="/" class="btn btn-ghost">Cancel</a>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="form.invalid || submitting()"
            >
              @if (submitting()) {
                <div class="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin"></div>
              }
              {{ isEditMode() ? 'Save Changes' : 'Create Coin' }}
            </button>
          </div>
        </form>
      }

      <!-- Catalog Search Modal -->
      @if (showCatalogSearch()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-bg-secondary rounded-xl border border-border-subtle shadow-card max-w-2xl w-full max-h-[80vh] flex flex-col">
            <!-- Modal Header -->
            <div class="p-4 border-b border-border-subtle flex items-center justify-between">
              <h3 class="text-lg font-medium text-text-primary">Search Numista Catalog</h3>
              <button (click)="closeCatalogSearch()" class="btn btn-ghost p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Search Input -->
            <div class="p-4 border-b border-border-subtle">
              <input
                type="text"
                [(ngModel)]="catalogSearchQuery"
                (keyup.enter)="searchCatalog()"
                class="input"
                placeholder="Search for coins..."
                autofocus
              />
            </div>

            <!-- Results -->
            <div class="flex-1 overflow-auto p-4">
              @if (catalogSearching()) {
                <div class="flex items-center justify-center py-8">
                  <div class="spinner"></div>
                </div>
              } @else if (catalogResults().length === 0 && catalogSearchQuery) {
                <p class="text-text-secondary text-center py-8">No results found</p>
              } @else {
                <div class="space-y-2">
                  @for (result of catalogResults(); track result.typeId) {
                    <button
                      type="button"
                      (click)="selectCatalogItem(result.typeId)"
                      class="w-full p-3 rounded-lg border border-border-subtle hover:border-border-medium hover:bg-bg-card transition-all text-left flex gap-3"
                    >
                      @if (result.obverseThumbnailUrl) {
                        <img [src]="result.obverseThumbnailUrl" alt="" class="w-12 h-12 rounded object-cover shrink-0" />
                      } @else {
                        <div class="w-12 h-12 rounded bg-bg-tertiary shrink-0"></div>
                      }
                      <div class="min-w-0">
                        <p class="font-medium text-text-primary truncate">{{ result.title }}</p>
                        <p class="text-sm text-text-secondary">
                          {{ result.issuerName || result.issuerCode }}
                          @if (result.minYear) {
                            · {{ result.minYear }}{{ result.maxYear && result.maxYear !== result.minYear ? '-' + result.maxYear : '' }}
                          }
                        </p>
                        @if (result.category) {
                          <p class="text-xs text-text-muted">{{ result.category }}</p>
                        }
                      </div>
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CoinFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private coinService = inject(CoinService);
  private catalogService = inject(CatalogService);

  // State
  loading = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);
  coinId = signal<string | null>(null);

  // Catalog search
  showCatalogSearch = signal(false);
  catalogSearchQuery = '';
  catalogSearching = signal(false);
  catalogResults = signal<any[]>([]);

  // Direct Numista ID input
  directNumistaId = '';
  fetchingNumistaId = signal(false);
  numistaIdError = signal<string | null>(null);

  // Form options
  grades = Object.values(CoinGrade);
  coinTypes = Object.values(CoinType);
  metalTypes = Object.values(MetalType);
  shapes = Object.values(CoinShape);
  gradeLabels = COIN_GRADE_LABELS;
  coinTypeLabels = COIN_TYPE_LABELS;
  metalTypeLabels = METAL_TYPE_LABELS;
  shapeLabels = COIN_SHAPE_LABELS;

  // Form
  form: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    year: [null, [Validators.required, Validators.min(1), Validators.max(2100)]],
    countryCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    currency: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    denomination: [null],
    mintMark: [''],
    coinType: [CoinType.BULLION, [Validators.required]],
    grade: [CoinGrade.UNCIRCULATED, [Validators.required]],
    quantity: [1, [Validators.min(1)]],
    weightInGrams: [null, [Validators.required, Validators.min(0.0001)]],
    metalType: [''],
    purity: [null, [Validators.min(1), Validators.max(1000)]],
    diameterInMillimeters: [null],
    thicknessInMillimeters: [null],
    numistaId: [''],
    rarityScore: [null, [Validators.min(1), Validators.max(100)]],
    notes: [''],
    shape: [CoinShape.CIRCULAR]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.coinId.set(id);
      this.isEditMode.set(true);
      this.loadCoin(id);
    }
  }

  loadCoin(id: string): void {
    this.loading.set(true);
    this.coinService.getCoin(id).subscribe({
      next: (coin) => {
        this.form.patchValue({
          title: coin.title,
          year: coin.yearOfMinting,
          countryCode: coin.issuerCountry,
          currency: coin.currency,
          denomination: coin.denomination,
          mintMark: coin.mintMark,
          coinType: coin.type,
          grade: coin.grade,
          quantity: coin.quantity,
          weightInGrams: coin.weightInGrams,
          metalType: coin.metalType || '',
          purity: coin.purity,
          diameterInMillimeters: coin.diameterInMillimeters,
          thicknessInMillimeters: coin.thicknessInMillimeters,
          numistaId: coin.numistaId || '',
          rarityScore: coin.rarity?.score,
          notes: coin.notes || '',
          shape: coin.shape
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading coin:', err);
        this.loading.set(false);
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;

    const request: CreateCoinRequest = {
      title: formValue.title,
      year: formValue.year,
      countryCode: formValue.countryCode.toUpperCase(),
      currency: formValue.currency.toUpperCase(),
      grade: formValue.grade,
      coinType: formValue.coinType,
      weightInGrams: formValue.weightInGrams
    };

    // Optional fields
    if (formValue.denomination) request.denomination = formValue.denomination;
    if (formValue.mintMark) request.mintMark = formValue.mintMark;
    if (formValue.quantity > 1) request.quantity = formValue.quantity;
    if (formValue.metalType) request.metalType = formValue.metalType;
    if (formValue.purity) request.purity = formValue.purity;
    if (formValue.diameterInMillimeters) request.diameterInMillimeters = formValue.diameterInMillimeters;
    if (formValue.thicknessInMillimeters) request.thicknessInMillimeters = formValue.thicknessInMillimeters;
    if (formValue.numistaId) request.numistaId = formValue.numistaId;
    if (formValue.rarityScore) request.rarityScore = formValue.rarityScore;
    if (formValue.notes) request.notes = formValue.notes;
    if (formValue.shape) request.shape = formValue.shape;

    if (this.isEditMode() && this.coinId()) {
      const updateRequest: UpdateCoinRequest = { ...request };

      this.coinService.updateCoin(this.coinId()!, updateRequest).subscribe({
        next: (coin) => {
          this.submitting.set(false);
          this.router.navigate(['/coins', coin.id]);
        },
        error: (err) => {
          console.error('Error updating coin:', err);
          this.submitting.set(false);
        }
      });
    } else {
      this.coinService.createCoin(request).subscribe({
        next: (coin) => {
          this.submitting.set(false);
          this.router.navigate(['/coins', coin.id]);
        },
        error: (err) => {
          console.error('Error creating coin:', err);
          this.submitting.set(false);
        }
      });
    }
  }

  onDelete(): void {
    if (!this.coinId()) return;

    if (confirm('Are you sure you want to delete this coin?')) {
      this.submitting.set(true);
      this.coinService.deleteCoin(this.coinId()!).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error deleting coin:', err);
          this.submitting.set(false);
        }
      });
    }
  }

  openCatalogSearch(): void {
    this.showCatalogSearch.set(true);
    this.catalogSearchQuery = '';
    this.catalogResults.set([]);
  }

  closeCatalogSearch(): void {
    this.showCatalogSearch.set(false);
  }

  searchCatalog(): void {
    if (!this.catalogSearchQuery.trim()) return;

    this.catalogSearching.set(true);
    this.catalogService.searchCatalog({ query: this.catalogSearchQuery, pageSize: 20 }).subscribe({
      next: (response) => {
        this.catalogResults.set(response.results);
        this.catalogSearching.set(false);
      },
      error: (err) => {
        console.error('Error searching catalog:', err);
        this.catalogSearching.set(false);
      }
    });
  }

  selectCatalogItem(typeId: string): void {
    this.catalogSearching.set(true);
    this.catalogService.getCoinDetails(typeId).subscribe({
      next: (details) => {
        this.applyDetailToForm(details);
        this.closeCatalogSearch();
        this.catalogSearching.set(false);
      },
      error: (err) => {
        console.error('Error loading catalog details:', err);
        this.catalogSearching.set(false);
      }
    });
  }

  fetchByNumistaId(): void {
    const numistaId = this.directNumistaId.trim();
    if (!numistaId) return;

    this.fetchingNumistaId.set(true);
    this.numistaIdError.set(null);

    this.catalogService.getCoinDetails(numistaId).subscribe({
      next: (details) => {
        this.applyDetailToForm(details);
        this.fetchingNumistaId.set(false);
        this.directNumistaId = '';
      },
      error: (err) => {
        console.error('Error fetching by Numista ID:', err);
        this.fetchingNumistaId.set(false);
        this.numistaIdError.set('Could not find coin with this Numista ID. Please check the ID and try again.');
      }
    });
  }

  private applyDetailToForm(details: CatalogCoinDetails): void {
    this.form.patchValue({
      title: details.title,
      countryCode: details.issuerCode || '',
      currency: details.suggestedCurrency || '',
      coinType: this.mapCoinType(details.coinType),
      weightInGrams: details.weightInGrams,
      metalType: details.metalType || '',
      purity: details.purity,
      diameterInMillimeters: details.diameterInMillimeters,
      thicknessInMillimeters: details.thicknessInMillimeters,
      numistaId: details.numistaId,
      denomination: details.denomination,
      shape: details.shape || CoinShape.CIRCULAR
    });

    // Set year to max year if available
    if (details.maxYear) {
      this.form.patchValue({ year: details.maxYear });
    } else if (details.minYear) {
      this.form.patchValue({ year: details.minYear });
    }
  }

  private mapCoinType(catalogType: string | null): CoinType {
    if (!catalogType) return CoinType.OTHER;
    switch (catalogType) {
      case 'BULLION': return CoinType.BULLION;
      case 'COMMEMORATIVE_CIRCULATION': return CoinType.COMMEMORATIVE_CIRCULATION;
      case 'STANDARD_CIRCULATION': return CoinType.STANDARD_CIRCULATION;
      case 'COMMEMORATIVE_NON_CIRCULATION': return CoinType.COMMEMORATIVE_NON_CIRCULATION;
      default: return CoinType.OTHER;
    }
  }
}
