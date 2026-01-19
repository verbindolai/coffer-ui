import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getRarityTier, getRarityColor } from '../../utils/format.utils';

@Component({
  selector: 'app-rarity-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (score !== null && score !== undefined) {
      <span [class]="badgeClass">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        {{ tier }}
        @if (showScore) {
          <span class="opacity-60">({{ score }})</span>
        }
      </span>
    }
  `,
  styles: []
})
export class RarityBadgeComponent {
  @Input() score: number | null = null;
  @Input() showScore = false;

  get tier(): string {
    return getRarityTier(this.score);
  }

  get badgeClass(): string {
    const colorClass = getRarityColor(this.score);
    return `badge bg-bg-tertiary inline-flex items-center gap-1 ${colorClass}`;
  }
}
