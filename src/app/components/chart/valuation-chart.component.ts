import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createChart, IChartApi, ISeriesApi, ColorType, CrosshairMode, LineStyle, LineSeries, Time } from 'lightweight-charts';
import {
  Timeframe,
  TIMEFRAMES,
  TIMEFRAME_LABELS,
  CoinValuationResponse,
  PortfolioValuationResponse
} from '../../models/valuation.model';
import { formatCurrency, formatPercent } from '../../utils/format.utils';

type ValuationData = CoinValuationResponse | PortfolioValuationResponse;

interface LineDataPoint {
  time: Time;
  value: number;
}

@Component({
  selector: 'app-valuation-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div class="flex-1 min-w-[300px]">
          <!-- Title -->
          <div class="flex items-center gap-3 mb-4">
            <h2 class="text-xl font-semibold text-text-primary">{{ title }}</h2>
            <span class="font-mono text-xs font-medium text-text-muted bg-bg-tertiary px-2.5 py-1 rounded border border-border-subtle">
              {{ currency }}
            </span>
          </div>

          <!-- Stats -->
          <div class="flex gap-7">
            <!-- Metal Value -->
            @if (showMetalValue()) {
              <div class="flex items-stretch gap-3">
                <div class="stat-indicator stat-indicator-metal h-auto"></div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs font-medium text-text-muted uppercase tracking-wider">Metal Value</span>
                  <span class="font-mono text-2xl font-semibold text-text-primary">{{ formatCurrency(currentMetalValue()) }}</span>
                  <span [class]="'font-mono text-sm font-medium ' + (metalChange() >= 0 ? 'text-positive' : 'text-negative')">
                    {{ formatPercent(metalChange()) }}
                  </span>
                </div>
              </div>
            }

            <!-- Collector Value -->
            @if (showCollectorValue()) {
              <div class="flex items-stretch gap-3">
                <div class="stat-indicator stat-indicator-collector h-auto"></div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {{ collectorValueLabel() }}
                  </span>
                  <span class="font-mono text-2xl font-semibold text-text-primary">{{ formatCurrency(currentCollectorValue()) }}</span>
                  <span [class]="'font-mono text-sm font-medium ' + (collectorChange() >= 0 ? 'text-positive' : 'text-negative')">
                    {{ formatPercent(collectorChange()) }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Controls -->
        <div class="flex flex-col gap-3 items-end">
          <!-- Timeframe Selector -->
          <div class="controls-group">
            @for (tf of timeframes; track tf) {
              <button
                (click)="onTimeframeClick(tf)"
                [class.active]="selectedTimeframe() === tf"
                class="timeframe-btn"
              >
                {{ timeframeLabels[tf] }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-5 mb-4 p-3 bg-bg-tertiary border border-border-subtle rounded-lg">
        @if (showMetalValue()) {
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-0.5 rounded bg-accent-emerald shadow-emerald-glow"></span>
            <span class="text-xs font-medium text-text-secondary">Metal Value</span>
          </div>
        }
        @if (showCollectorValue()) {
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-0.5 rounded bg-accent-gold shadow-gold-glow"></span>
            <span class="text-xs font-medium text-text-secondary">Collector Value</span>
          </div>
        }
      </div>

      <!-- Chart Container -->
      <div class="relative h-[380px] bg-bg-tertiary border border-border-subtle rounded-xl overflow-hidden">
        <div #chartContainer class="w-full h-full"></div>

        <!-- Loading Overlay -->
        @if (loading()) {
          <div class="absolute inset-0 bg-bg-primary/80 flex items-center justify-center">
            <div class="spinner"></div>
          </div>
        }

        <!-- No Data Message -->
        @if (!loading() && !hasData()) {
          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-text-muted text-sm">No valuation data available</p>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center mt-4 pt-4 border-t border-border-subtle text-xs text-text-muted">
        <span class="flex items-center gap-1.5">
          <svg class="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Data updates every snapshot
        </span>
        <span class="font-mono text-[0.65rem] opacity-50">
          Powered by TradingView Lightweight Charts
        </span>
      </div>
    </div>
  `,
  styles: []
})
export class ValuationChartComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef<HTMLDivElement>;

  @Input() title = 'Valuation';
  @Input() set data(value: ValuationData | null) {
    this._data.set(value);
  }
  private _data = signal<ValuationData | null>(null);
  @Input() loading = signal(false);
  @Input() selectedTimeframe = signal<Timeframe>('1d');
  @Output() selectedTimeframeChange = new EventEmitter<Timeframe>();

  // State
  currency = 'USD';

  // Options
  timeframes = TIMEFRAMES;
  timeframeLabels = TIMEFRAME_LABELS;

  // Utility functions
  formatCurrency = formatCurrency;
  formatPercent = formatPercent;

  // Chart
  private chart: IChartApi | null = null;
  private metalSeries: ISeriesApi<'Line'> | null = null;
  private collectorSeries: ISeriesApi<'Line'> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Computed values
  hasData = computed(() => {
    if (!this._data()) return false;
    const metalPoints = this.getMetalDataPoints();
    const collectorPoints = this.getCollectorDataPoints();
    return metalPoints.length > 0 || collectorPoints.length > 0;
  });

  showMetalValue = computed(() => {
    return this.getMetalDataPoints().length > 0;
  });

  showCollectorValue = computed(() => {
    return this.getCollectorDataPoints().length > 0;
  });

  currentMetalValue = computed(() => {
    const points = this.getMetalDataPoints();
    if (points.length === 0) return 0;
    return points[points.length - 1].totalValue;
  });

  currentCollectorValue = computed(() => {
    const points = this.getCollectorDataPoints();
    if (points.length === 0) return 0;
    const last = points[points.length - 1];
    return last.minPrice ?? last.price ?? 0;
  });

  metalChange = computed(() => {
    const points = this.getMetalDataPoints();
    if (points.length < 2) return 0;
    const first = points[0].totalValue;
    const last = points[points.length - 1].totalValue;
    return ((last - first) / first) * 100;
  });

  collectorChange = computed(() => {
    const points = this.getCollectorDataPoints();
    if (points.length < 2) return 0;
    const first = points[0];
    const last = points[points.length - 1];

    const firstValue = first.minPrice ?? first.price ?? 0;
    const lastValue = last.minPrice ?? last.price ?? 0;

    if (firstValue === 0) return 0;
    return ((lastValue - firstValue) / firstValue) * 100;
  });

  collectorValueLabel = computed(() => {
    return 'Collector Value';
  });

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChartData();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.chart) {
      this.chart.remove();
    }
  }

  onTimeframeClick(timeframe: Timeframe): void {
    this.selectedTimeframe.set(timeframe);
    this.selectedTimeframeChange.emit(timeframe);
  }

  private initChart(): void {
    if (!this.chartContainer) return;

    const container = this.chartContainer.nativeElement;

    this.chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#16161e' },
        textColor: 'rgba(255, 255, 255, 0.6)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.025)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.025)' }
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.15)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: 'rgba(22, 22, 30, 0.95)'
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.15)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: 'rgba(22, 22, 30, 0.95)'
        }
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        scaleMargins: { top: 0.12, bottom: 0.12 }
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true
      },
      handleScroll: { vertTouchDrag: false }
    });

    // Collector Value Series (Gold)
    this.collectorSeries = this.chart.addSeries(LineSeries, {
      color: '#F7931A',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: '#F7931A',
      crosshairMarkerBackgroundColor: '#0f0f14'
    });

    // Metal Value Series (Green/Teal) - added last so it's drawn on top
    this.metalSeries = this.chart.addSeries(LineSeries, {
      color: '#10B981',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: '#10B981',
      crosshairMarkerBackgroundColor: '#0f0f14'
    });

    // Handle resize
    this.resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0 && this.chart) {
        const { width, height } = entries[0].contentRect;
        this.chart.applyOptions({ width, height });
      }
    });
    this.resizeObserver.observe(container);

    this.updateChartData();
  }

  private toLocalTime(timestamp: string): Time {
    const date = new Date(timestamp);
    const utcSeconds = Math.floor(date.getTime() / 1000);
    const offsetSeconds = date.getTimezoneOffset() * 60;
    return (utcSeconds - offsetSeconds) as Time;
  }

  private updateChartData(): void {
    if (!this.chart || !this._data()) return;

    this.currency = this.getCurrency();

    const metalPoints = this.getMetalDataPoints();
    let metalData: LineDataPoint[] = metalPoints.map(p => ({
      time: this.toLocalTime(p.timestamp),
      value: p.totalValue
    }));

    // Deduplicate by timestamp (keep last value for each timestamp)
    metalData = this.deduplicateByTime(metalData);

    // For single metal data point, show only a dot
    const metalSingle = metalData.length === 1;
    this.metalSeries?.applyOptions({ pointMarkersVisible: metalSingle, lineVisible: !metalSingle });

    const collectorPoints = this.getCollectorDataPoints();

    let collectorData: LineDataPoint[] = collectorPoints
      .filter(p => (p.minPrice ?? p.price) !== null)
      .map(p => ({
        time: this.toLocalTime(p.timestamp),
        value: p.minPrice ?? p.price!
      }));

    // Deduplicate by timestamp (keep last value for each timestamp)
    collectorData = this.deduplicateByTime(collectorData);

    this.metalSeries?.setData(metalData);

    const collectorSingle = collectorData.length === 1;
    this.collectorSeries?.applyOptions({ pointMarkersVisible: collectorSingle, lineVisible: !collectorSingle });
    this.collectorSeries?.setData(collectorData);

    this.chart.timeScale().fitContent();
  }

  private deduplicateByTime(data: LineDataPoint[]): LineDataPoint[] {
    const seen = new Map<number, LineDataPoint>();
    for (const point of data) {
      seen.set(point.time as number, point);
    }
    return Array.from(seen.values()).sort((a, b) => (a.time as number) - (b.time as number));
  }

  private getMetalDataPoints(): any[] {
    const data = this._data();
    if (!data) return [];

    if ('coinId' in data) {
      return data.metalValuation?.dataPoints ?? [];
    }

    return data.metalValuation?.dataPoints ?? [];
  }

  private getCollectorDataPoints(): any[] {
    const data = this._data();
    if (!data) return [];

    if ('coinId' in data) {
      return data.issueValuation?.dataPoints ?? [];
    }

    const points = data.collectorValuation?.dataPoints ?? [];
    return points.map(p => ({
      timestamp: p.timestamp,
      price: p.exactValue,
      minPrice: p.minValue,
      maxPrice: p.maxValue
    }));
  }

  private getCurrency(): string {
    const data = this._data();
    if (!data) return 'USD';

    if ('coinId' in data) {
      return data.metalValuation?.currency ?? data.issueValuation?.currency ?? 'USD';
    }

    return data.currency ?? 'USD';
  }
}
