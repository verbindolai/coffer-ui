// Currency formatting
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Percent formatting
export function formatPercent(value: number, showSign = true): string {
  const prefix = showSign && value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

// Date formatting
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Purity formatting (1-1000 to percentage)
export function formatPurity(purity: number | null): string {
  if (purity === null) return '-';
  return `${(purity / 10).toFixed(1)}%`;
}

// Weight formatting
export function formatWeight(weightInGrams: number): string {
  if (weightInGrams >= 1000) {
    return `${(weightInGrams / 1000).toFixed(2)} kg`;
  }
  return `${weightInGrams.toFixed(2)} g`;
}

// Dimension formatting
export function formatDimension(value: number | null, unit = 'mm'): string {
  if (value === null) return '-';
  return `${value.toFixed(1)} ${unit}`;
}

// Country code validation
export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

// Currency code validation
export function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

// Rarity score to tier
export function getRarityTier(score: number | null): string {
  if (score === null) return 'Unknown';
  if (score >= 90) return 'Legendary';
  if (score >= 70) return 'Epic';
  if (score >= 50) return 'Rare';
  if (score >= 30) return 'Uncommon';
  return 'Common';
}

export function getRarityColor(score: number | null): string {
  if (score === null) return 'text-text-muted';
  if (score >= 90) return 'text-yellow-400';
  if (score >= 70) return 'text-purple-400';
  if (score >= 50) return 'text-blue-400';
  if (score >= 30) return 'text-green-400';
  return 'text-gray-400';
}

// Year range display for catalog
export function formatYearRange(minYear: number | null, maxYear: number | null): string {
  if (minYear === null && maxYear === null) return '-';
  if (minYear === maxYear) return String(minYear);
  if (maxYear === null) return `${minYear}-present`;
  return `${minYear}-${maxYear}`;
}
