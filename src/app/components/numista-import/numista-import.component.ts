import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NumistaImportService, NumistaImportResult } from '../../services/numista-import.service';

type ImportState = 'initial' | 'importing' | 'result' | 'error';

@Component({
  selector: 'app-numista-import',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-xl mx-auto py-12">

      <!-- Initial State -->
      @if (state() === 'initial') {
        <div class="card p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-bg-tertiary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <h1 class="text-xl font-semibold text-text-primary mb-2">Import from Numista</h1>
          <p class="text-text-muted text-sm mb-8">
            Connect your Numista account to import your entire coin collection. Coins already in your collection will be skipped.
          </p>
          <button
            (click)="connectToNumista()"
            [disabled]="connecting()"
            class="btn btn-primary"
          >
            @if (connecting()) {
              <div class="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin"></div>
              Connecting...
            } @else {
              Connect to Numista
            }
          </button>
        </div>
      }

      <!-- Importing State -->
      @if (state() === 'importing') {
        <div class="card p-8 text-center">
          <div class="w-12 h-12 mx-auto mb-6 border-2 border-border-subtle border-t-accent rounded-full animate-spin"></div>
          <h2 class="text-lg font-semibold text-text-primary mb-2">Importing your collection...</h2>
          <p class="text-text-muted text-sm">This may take a few minutes depending on the size of your collection.</p>
        </div>
      }

      <!-- Result State -->
      @if (state() === 'result' && result()) {
        <div class="card p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-positive/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-text-primary">Import Complete</h2>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-bg-tertiary rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-positive">{{ result()!.imported }}</p>
              <p class="text-xs text-text-muted mt-1">Imported</p>
            </div>
            <div class="bg-bg-tertiary rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-text-muted">{{ result()!.skipped }}</p>
              <p class="text-xs text-text-muted mt-1">Skipped</p>
            </div>
            <div class="bg-bg-tertiary rounded-lg p-4 text-center">
              <p class="text-2xl font-bold" [class.text-negative]="result()!.failed > 0" [class.text-text-muted]="result()!.failed === 0">{{ result()!.failed }}</p>
              <p class="text-xs text-text-muted mt-1">Failed</p>
            </div>
          </div>

          @if (result()!.errors.length > 0) {
            <div class="bg-negative/5 border border-negative/20 rounded-lg p-4 mb-6">
              <p class="text-sm font-medium text-negative mb-2">Errors:</p>
              <ul class="text-xs text-text-muted space-y-1">
                @for (error of result()!.errors; track error) {
                  <li>{{ error }}</li>
                }
              </ul>
            </div>
          }

          <div class="flex gap-3 justify-center">
            <a routerLink="/" class="btn btn-primary">View Collection</a>
            <button (click)="reset()" class="btn btn-secondary">Import Again</button>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (state() === 'error') {
        <div class="card p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-negative/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-negative" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-text-primary mb-2">Import Failed</h2>
          <p class="text-text-muted text-sm mb-6">{{ errorMessage() }}</p>
          <button (click)="reset()" class="btn btn-secondary">Try Again</button>
        </div>
      }

    </div>
  `,
  styles: []
})
export class NumistaImportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly importService = inject(NumistaImportService);

  state = signal<ImportState>('initial');
  connecting = signal(false);
  result = signal<NumistaImportResult | null>(null);
  errorMessage = signal('');

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.startImport(code);
    }
  }

  connectToNumista(): void {
    this.connecting.set(true);
    this.importService.getAuthUrl().subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: () => {
        this.connecting.set(false);
        this.state.set('error');
        this.errorMessage.set('Failed to get authorization URL. Please try again.');
      }
    });
  }

  private startImport(code: string): void {
    this.state.set('importing');
    const redirectUri = window.location.origin + '/import/numista/callback';
    this.importService.importCollection(code, redirectUri).subscribe({
      next: (result) => {
        this.result.set(result);
        this.state.set('result');
      },
      error: (err) => {
        this.state.set('error');
        this.errorMessage.set(err?.error?.message || 'An unexpected error occurred during import.');
      }
    });
  }

  reset(): void {
    this.state.set('initial');
    this.result.set(null);
    this.errorMessage.set('');
    this.connecting.set(false);
  }
}
