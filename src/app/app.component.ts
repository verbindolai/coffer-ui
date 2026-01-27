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
          <a routerLink="/" class="flex items-center gap-3 text-text-primary hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" class="w-7 h-7">
              <!-- Top bar -->
              <rect x="10" y="10" width="80" height="22" rx="6" ry="6"/>
              <!-- Middle bar - indented left to form C shape -->
              <rect x="10" y="39" width="65" height="22" rx="6" ry="6"/>
              <!-- Bottom bar - same position as top -->
              <rect x="10" y="68" width="80" height="22" rx="6" ry="6"/>
            </svg>
            <span class="font-medium text-sm uppercase tracking-[0.2em]">Coffer</span>
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
