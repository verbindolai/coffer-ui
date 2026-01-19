import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timeframe, TIMEFRAMES, TIMEFRAME_LABELS } from '../../models/valuation.model';

@Component({
  selector: 'app-timeframe-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="controls-group">
      @for (tf of timeframes; track tf) {
        <button
          (click)="onSelect(tf)"
          [class.active]="selected === tf"
          class="timeframe-btn"
        >
          {{ labels[tf] }}
        </button>
      }
    </div>
  `,
  styles: []
})
export class TimeframeSelectorComponent {
  @Input() selected: Timeframe = '1d';
  @Output() selectedChange = new EventEmitter<Timeframe>();

  timeframes = TIMEFRAMES;
  labels = TIMEFRAME_LABELS;

  onSelect(timeframe: Timeframe): void {
    this.selected = timeframe;
    this.selectedChange.emit(timeframe);
  }
}
