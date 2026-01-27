import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="h-16 border-b border-border-subtle bg-bg-elevated sticky top-0 z-50">
        <div class="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" class="w-7 h-7">
              <rect x="15" y="15" width="70" height="18" rx="5" ry="5"/>
              <rect x="20" y="41" width="65" height="18" rx="5" ry="5"/>
              <rect x="10" y="67" width="70" height="18" rx="5" ry="5"/>
            </svg>
            <span class="font-semibold text-base tracking-tight">Coffer</span>
          </a>

          <!-- Navigation -->
          <nav class="flex items-center gap-1">
            <a
              routerLink="/"
              routerLinkActive="bg-bg-tertiary text-text-primary"
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-4 py-2 rounded text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
            >
              Collection
            </a>
            <a
              routerLink="/portfolio"
              routerLinkActive="bg-bg-tertiary text-text-primary"
              class="px-4 py-2 rounded text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
            >
              Portfolio
            </a>
          </nav>

          <!-- Actions -->
          <a
            routerLink="/coins/new"
            class="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Coin
          </a>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1">
        <div class="max-w-7xl mx-auto px-6 py-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {}
