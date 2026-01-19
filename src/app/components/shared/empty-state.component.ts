import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
        <ng-content select="[icon]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </ng-content>
      </div>
      <h3 class="text-lg font-medium text-text-primary mb-2">{{ title }}</h3>
      <p class="text-text-secondary text-sm mb-4 max-w-sm">{{ message }}</p>

      @if (actionLink && actionText) {
        <a [routerLink]="actionLink" class="btn btn-primary">
          {{ actionText }}
        </a>
      }

      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here';
  @Input() message = '';
  @Input() actionText = '';
  @Input() actionLink: string | any[] = '';
}
