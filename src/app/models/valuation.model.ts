// Timeframes
export type Timeframe = '1h' | '1d' | '1w' | '1m' | '1y' | 'max';

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '1h': '1H',
  '1d': '1D',
  '1w': '1W',
  '1m': '1M',
  '1y': '1Y',
  'max': 'MAX'
};

export const TIMEFRAMES: Timeframe[] = ['1h', '1d', '1w', '1m', '1y', 'max'];

// Coin Valuation
export interface MetalDataPoint {
  timestamp: string;
  pricePerGram: number;
  totalValue: number;
}

export interface MetalValuation {
  metalType: string;
  pureMetalMassInGrams: number;
  currency: string;
  dataPoints: MetalDataPoint[];
}

export interface IssueDataPoint {
  timestamp: string;
  price: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface IssueValuation {
  grade: string | null;
  exactMatch: boolean;
  currency: string;
  dataPoints: IssueDataPoint[];
}

export interface CoinValuationResponse {
  coinId: string;
  timeframe: Timeframe;
  metalValuation: MetalValuation | null;
  issueValuation: IssueValuation | null;
}

// Portfolio Valuation
export interface PortfolioMetalPoint {
  timestamp: string;
  totalValue: number;
  goldGrams: number;
  silverGrams: number;
  platinumGrams: number;
}

export interface PortfolioMetalValuation {
  dataPoints: PortfolioMetalPoint[];
}

export interface PortfolioCollectorPoint {
  timestamp: string;
  exactValue: number | null;
  minValue: number | null;
  maxValue: number | null;
}

export interface PortfolioCollectorValuation {
  dataPoints: PortfolioCollectorPoint[];
}

export interface PortfolioValuationResponse {
  timeframe: Timeframe;
  currency: string;
  metalValuation: PortfolioMetalValuation | null;
  collectorValuation: PortfolioCollectorValuation | null;
}

// Chart data structures
export interface ChartDataPoint {
  time: number; // Unix timestamp in seconds
  value: number;
}

export interface ChartRangeDataPoint {
  time: number;
  value?: number;
  min?: number;
  max?: number;
}
