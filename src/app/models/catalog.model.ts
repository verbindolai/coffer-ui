// Catalog search
export interface CatalogSearchItem {
  typeId: string;
  title: string;
  category: string | null;
  issuerCode: string | null;
  issuerName: string | null;
  minYear: number | null;
  maxYear: number | null;
  obverseThumbnailUrl: string | null;
  reverseThumbnailUrl: string | null;
}

export interface CatalogSearchResponse {
  totalCount: number;
  results: CatalogSearchItem[];
}

// Catalog coin details for form pre-fill
export interface CatalogCoinDetails {
  numistaId: string;
  title: string;
  coinType: string;
  issuerCode: string | null;
  issuerName: string | null;
  weightInGrams: number | null;
  diameterInMillimeters: number | null;
  thicknessInMillimeters: number | null;
  metalType: string | null;
  purity: number | null;
  compositionText: string | null;
  denomination: number | null;
  valueText: string | null;
  suggestedCurrency: string | null;
  minYear: number | null;
  maxYear: number | null;
  obverseImageUrl: string | null;
  reverseImageUrl: string | null;
  obverseThumbnailUrl: string | null;
  reverseThumbnailUrl: string | null;
  shape: string | null;
  rulers: string[];
}

// Search params
export interface CatalogSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}
