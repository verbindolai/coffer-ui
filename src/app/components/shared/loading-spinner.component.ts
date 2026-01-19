import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass">
      <div [class]="spinnerClass"></div>
      @if (text) {
        <p class="text-text-muted text-sm mt-3">{{ text }}</p>
      }
    </div>
  `,
  styles: []
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() text = '';
  @Input() fullPage = false;

  get containerClass(): string {
    return this.fullPage
      ? 'fixed inset-0 flex flex-col items-center justify-center bg-bg-primary/80 z-50'
      : 'flex flex-col items-center justify-center py-8';
  }

  get spinnerClass(): string {
    const sizeClasses = {
      sm: 'w-5 h-5 border-2',
      md: 'w-8 h-8 border-2',
      lg: 'w-12 h-12 border-3'
    };
    return `${sizeClasses[this.size]} border-border-subtle border-t-accent rounded-full animate-spin`;
  }
}
