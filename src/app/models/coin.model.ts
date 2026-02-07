// Enums
export enum CoinGrade {
  GOOD = 'GOOD',
  VERY_GOOD = 'VERY_GOOD',
  FINE = 'FINE',
  VERY_FINE = 'VERY_FINE',
  EXTREMELY_FINE = 'EXTREMELY_FINE',
  ABOUT_UNCIRCULATED = 'ABOUT_UNCIRCULATED',
  UNCIRCULATED = 'UNCIRCULATED',
  PROOF = 'PROOF'
}

export enum CoinType {
  BULLION = 'BULLION',
  COMMEMORATIVE_CIRCULATION = 'COMMEMORATIVE_CIRCULATION',
  STANDARD_CIRCULATION = 'STANDARD_CIRCULATION',
  COMMEMORATIVE_NON_CIRCULATION = 'COMMEMORATIVE_NON_CIRCULATION',
  OTHER = 'OTHER'
}

export enum MetalType {
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  PLATINUM = 'PLATINUM',
  NICKEL = 'NICKEL',
  BASE_METAL = 'BASE_METAL'
}

export enum CoinShape {
  CIRCULAR = 'CIRCULAR',
  TRIANGULAR = 'TRIANGULAR',
  SQUARE = 'SQUARE',
  PENTAGON = 'PENTAGON',
  HEXAGON = 'HEXAGON',
  HEPTAGON = 'HEPTAGON',
  OCTAGON = 'OCTAGON',
  NONAGON = 'NONAGON',
  DECAGON = 'DECAGON',
  UNDECAGON = 'UNDECAGON',
  DODECAGON = 'DODECAGON',
  TRIDECAGON = 'TRIDECAGON',
  TETRADECAGON = 'TETRADECAGON',
  PENTADECAGON = 'PENTADECAGON',
  HEXADECAGON = 'HEXADECAGON',
  HEPTADECAGON = 'HEPTADECAGON',
  OCTADECAGON = 'OCTADECAGON',
  ENNEADECAGON = 'ENNEADECAGON',
  ICOSAGON = 'ICOSAGON',
  POLYGONAL = 'POLYGONAL',
  SCALLOPED = 'SCALLOPED',
  IRREGULAR = 'IRREGULAR',
  UNKNOWN = 'UNKNOWN'
}

export enum CoinSide {
  OBVERSE = 'OBVERSE',
  REVERSE = 'REVERSE'
}

// Display labels for enums
export const COIN_GRADE_LABELS: Record<CoinGrade, string> = {
  [CoinGrade.GOOD]: 'Good (G)',
  [CoinGrade.VERY_GOOD]: 'Very Good (VG)',
  [CoinGrade.FINE]: 'Fine (F)',
  [CoinGrade.VERY_FINE]: 'Very Fine (VF)',
  [CoinGrade.EXTREMELY_FINE]: 'Extremely Fine (XF/EF)',
  [CoinGrade.ABOUT_UNCIRCULATED]: 'About Uncirculated (AU)',
  [CoinGrade.UNCIRCULATED]: 'Uncirculated (UNC)',
  [CoinGrade.PROOF]: 'Proof'
};

export const COIN_TYPE_LABELS: Record<CoinType, string> = {
  [CoinType.BULLION]: 'Bullion',
  [CoinType.COMMEMORATIVE_CIRCULATION]: 'Commemorative (Circulating)',
  [CoinType.STANDARD_CIRCULATION]: 'Standard Circulation',
  [CoinType.COMMEMORATIVE_NON_CIRCULATION]: 'Commemorative (Non-Circulating)',
  [CoinType.OTHER]: 'Other'
};

export const METAL_TYPE_LABELS: Record<MetalType, string> = {
  [MetalType.GOLD]: 'Gold',
  [MetalType.SILVER]: 'Silver',
  [MetalType.PLATINUM]: 'Platinum',
  [MetalType.NICKEL]: 'Nickel',
  [MetalType.BASE_METAL]: 'Base Metal'
};

export const COIN_SHAPE_LABELS: Record<CoinShape, string> = {
  [CoinShape.CIRCULAR]: 'Round/Circular',
  [CoinShape.TRIANGULAR]: 'Triangular',
  [CoinShape.SQUARE]: 'Square',
  [CoinShape.PENTAGON]: 'Pentagon (5 sides)',
  [CoinShape.HEXAGON]: 'Hexagon (6 sides)',
  [CoinShape.HEPTAGON]: 'Heptagon (7 sides)',
  [CoinShape.OCTAGON]: 'Octagon (8 sides)',
  [CoinShape.NONAGON]: 'Nonagon (9 sides)',
  [CoinShape.DECAGON]: 'Decagon (10 sides)',
  [CoinShape.UNDECAGON]: 'Undecagon (11 sides)',
  [CoinShape.DODECAGON]: 'Dodecagon (12 sides)',
  [CoinShape.TRIDECAGON]: 'Tridecagon (13 sides)',
  [CoinShape.TETRADECAGON]: 'Tetradecagon (14 sides)',
  [CoinShape.PENTADECAGON]: 'Pentadecagon (15 sides)',
  [CoinShape.HEXADECAGON]: 'Hexadecagon (16 sides)',
  [CoinShape.HEPTADECAGON]: 'Heptadecagon (17 sides)',
  [CoinShape.OCTADECAGON]: 'Octadecagon (18 sides)',
  [CoinShape.ENNEADECAGON]: 'Enneadecagon (19 sides)',
  [CoinShape.ICOSAGON]: 'Icosagon (20 sides)',
  [CoinShape.POLYGONAL]: 'Polygonal',
  [CoinShape.SCALLOPED]: 'Scalloped',
  [CoinShape.IRREGULAR]: 'Irregular',
  [CoinShape.UNKNOWN]: 'Unknown'
};

// Interfaces
export interface Rarity {
  score: number;
}

export interface CoinResponse {
  id: string;
  title: string;
  denomination: number | null;
  currency: string;
  yearOfMinting: number;
  issuerCountry: string;
  mintMark: string | null;
  grade: CoinGrade | null;
  type: CoinType;
  notes: string | null;
  numistaId: string | null;
  shape: CoinShape;
  weightInGrams: number;
  purity: number | null;
  metalType: MetalType | null;
  rarity: Rarity | null;
  createdAt: string;
  diameterInMillimeters: number | null;
  thicknessInMillimeters: number | null;
  quantity: number;
}

export interface CreateCoinRequest {
  title: string;
  denomination?: number;
  year: number;
  countryCode: string;
  currency: string;
  mintMark?: string;
  grade: CoinGrade;
  coinType: CoinType;
  notes?: string;
  numistaId?: string;
  metalType?: MetalType;
  weightInGrams: number;
  purity?: number;
  quantity?: number;
  rarityScore?: number;
  diameterInMillimeters?: number;
  thicknessInMillimeters?: number;
  shape?: CoinShape;
}

export interface UpdateCoinRequest extends CreateCoinRequest {}

export interface CoinImageResponse {
  id: string;
  coinId: string;
  side: CoinSide;
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  createdAt: string;
}

// Pagination
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; empty: boolean };
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CoinSearchParams {
  country?: string;
  denomination?: string;
  grade?: CoinGrade;
  coinType?: CoinType;
  yearFrom?: number;
  yearTo?: number;
  metalType?: MetalType;
  shape?: CoinShape;
  currency?: string;
  title?: string;
  numistaId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// Grouped coin responses
export interface CoinVariantSummary {
  id: string;
  yearOfMinting: number;
  mintMark: string | null;
  grade: CoinGrade | null;
  quantity: number;
}

export interface CoinGroupResponse {
  numistaId: string | null;
  isGroup: boolean;
  representativeCoinId: string;
  title: string;
  issuerCountry: string;
  metalType: MetalType | null;
  type: CoinType;
  weightInGrams: number;
  purity: number | null;
  shape: CoinShape;
  variantCount: number;
  totalQuantity: number;
  yearMin: number;
  yearMax: number;
  variants: CoinVariantSummary[];
}

export interface GroupedCoinSearchResponse {
  groups: CoinGroupResponse[];
  totalGroups: number;
  totalCoinCount: number;
  totalQuantityCount: number;
  page: number;
  size: number;
  totalPages: number;
}

// Error response
export interface ErrorResponse {
  message: string;
}
