# Frontend Developer Guide - Coffer2

A comprehensive guide for frontend developers building the UI for the Coffer2 coin collection management application.

---

## Table of Contents

1. [Overview](#overview)
2. [API Basics](#api-basics)
3. [Core Concepts](#core-concepts)
4. [Pages & Features](#pages--features)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Data Models](#data-models)
7. [Enums & Select Options](#enums--select-options)
8. [Form Validation Rules](#form-validation-rules)
9. [Error Handling](#error-handling)
10. [Pagination](#pagination)
11. [Charts & Valuation Data](#charts--valuation-data)
12. [Numista Catalog Integration](#numista-catalog-integration)
13. [Images](#images)
14. [Recommended UI Patterns](#recommended-ui-patterns)

---

## Overview

Coffer2 is a **coin collection portfolio management** application that allows users to:

- **Catalog coins** with detailed metadata (year, country, grade, metal content, etc.)
- **Track portfolio value** based on precious metal prices (gold, silver, platinum)
- **Track collector value** based on Numista market data
- **View historical valuations** with multiple timeframes
- **Search the Numista catalog** to auto-populate coin details

### Key Value Propositions
1. **Metal Value**: Calculates intrinsic value based on precious metal content
2. **Collector Value**: Tracks numismatic/collector premiums from market data
3. **Portfolio Analytics**: Aggregated views across the entire collection

---

## API Basics

### Base URL
```
http://localhost:8080/api/v1
```

### Content Type
All requests and responses use `application/json`.

### Authentication
Currently **no authentication** is implemented. All endpoints are open.

### Interactive Docs
When running locally:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

---

## Core Concepts

### Coin
The central entity. Each coin has:
- **Basic info**: title, year, country, denomination, currency
- **Physical specs**: weight, diameter, thickness, shape
- **Metal content**: type (gold/silver/platinum), purity (e.g., 999 = 99.9%)
- **Grading**: condition from GOOD to PROOF
- **Classification**: type (bullion, commemorative, circulation)
- **Optional Numista link**: enables automatic image fetching and price tracking

### Valuation Types
1. **Metal Valuation**: `weight × (purity/1000) × current_metal_price`
   - Updated every 5 minutes during weekdays
   - Source: Swissquote metal quotes

2. **Issue/Collector Valuation**: Market prices from Numista
   - Based on grade and issue matching
   - Can be exact price or min/max range

### Timeframes
Used for historical charts:
| Code | Label | Description |
|------|-------|-------------|
| `1h` | 1 Hour | Last 60 minutes |
| `1d` | 1 Day | Last 24 hours (default) |
| `1w` | 1 Week | Last 7 days |
| `1m` | 1 Month | Last 30 days |
| `1y` | 1 Year | Last 365 days |
| `max` | All Time | Full history |

---

## Pages & Features

### Suggested Page Structure

#### 1. Dashboard / Portfolio Overview
- Total portfolio metal value (current)
- Total portfolio collector value (current)
- Value chart with timeframe selector
- Metal breakdown (gold/silver/platinum grams)
- Quick stats: total coins, countries, etc.

**API**: `GET /api/v1/portfolio/valuation?timeframe=1d`

#### 2. Coin List / Collection
- Paginated table/grid of coins
- Search by title
- Filters: country, metal type, grade, coin type, year range
- Sort by: date added, year, title, value

**API**: `GET /api/v1/coins?country=US&metalType=GOLD&page=0&size=20`

#### 3. Coin Detail Page
- All coin metadata
- Obverse/reverse images
- Metal valuation chart
- Collector valuation chart
- Edit/delete actions

**APIs**:
- `GET /api/v1/coins/{id}`
- `GET /api/v1/coins/{id}/images`
- `GET /api/v1/coins/{id}/valuation?timeframe=1d`

#### 4. Add/Edit Coin Form
- Manual entry form with all fields
- **Numista search integration**: search catalog → select coin → auto-fill form
- Image preview from Numista (auto-fetched when numistaId provided)

**APIs**:
- `POST /api/v1/coins` (create)
- `PUT /api/v1/coins/{id}` (update)
- `GET /api/v1/catalog/search?query=...` (Numista search)
- `GET /api/v1/catalog/types/{typeId}` (get details for form)

#### 5. Catalog Search (Numista)
- Search interface for Numista catalog
- Display results with thumbnails
- "Add to Collection" action → pre-fills add coin form

**APIs**:
- `GET /api/v1/catalog/search?query=eagle&page=1&pageSize=20`
- `GET /api/v1/catalog/types/{typeId}`

---

## API Endpoints Reference

### Coins CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/coins` | Create new coin |
| `GET` | `/coins/{id}` | Get coin by ID |
| `PUT` | `/coins/{id}` | Update coin |
| `DELETE` | `/coins/{id}` | Delete coin |
| `GET` | `/coins` | Search/list coins (paginated) |

### Coin Images

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/coins/{coinId}/images` | List all images for a coin |
| `GET` | `/coins/{coinId}/images/{imageId}` | Get image metadata |
| `GET` | `/coins/{coinId}/images/{imageId}/content` | Download image binary |

### Valuation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/coins/{coinId}/valuation?timeframe=1d` | Get coin valuation history |
| `GET` | `/portfolio/valuation?timeframe=1d` | Get portfolio valuation history |

### Catalog (Numista)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/catalog/search?query=...&page=1&pageSize=20` | Search Numista catalog |
| `GET` | `/catalog/types/{typeId}` | Get coin details for form pre-fill |

---

## Data Models

### CoinResponse (GET /coins/{id})

```typescript
interface CoinResponse {
  id: string;                      // UUID
  title: string;
  denomination: number | null;     // Face value
  currency: string;                // ISO 4217 (USD, EUR, etc.)
  yearOfMinting: number;
  issuerCountry: string;           // ISO 3166-1 alpha-2 (US, DE, etc.)
  mintMark: string | null;
  grade: CoinGrade | null;
  type: CoinType;
  notes: string | null;
  numistaId: string | null;        // Links to Numista catalog
  shape: CoinShape;
  weightInGrams: number;
  purity: number | null;           // 1-1000 (e.g., 999 = 99.9%)
  metalType: MetalType | null;
  rarity: { score: number } | null; // 1-100
  createdAt: string;               // ISO 8601 datetime
  diameterInMillimeters: number | null;
  thicknessInMillimeters: number | null;
  quantity: number;                // How many identical coins
}
```

### CreateCoinRequest (POST /coins)

```typescript
interface CreateCoinRequest {
  title: string;                   // Required
  denomination?: number;
  year: number;                    // Required, 1-2100
  countryCode: string;             // Required, 2 chars (ISO 3166-1)
  currency: string;                // Required (ISO 4217)
  mintMark?: string;
  grade: CoinGrade;                // Required
  coinType: CoinType;              // Required
  notes?: string;
  numistaId?: string;              // Max 50 chars - enables auto image fetch
  metalType?: MetalType;
  weightInGrams: number;           // Required, > 0
  purity?: number;                 // 1-1000
  quantity?: number;               // Default: 1, min: 1
  rarityScore?: number;            // 1-100
  diameterInMillimeters?: number;
  thicknessInMillimeters?: number;
}
```

### UpdateCoinRequest (PUT /coins/{id})
Same as CreateCoinRequest, plus:
```typescript
interface UpdateCoinRequest extends CreateCoinRequest {
  shape?: CoinShape;               // Can override detected shape
}
```

### CoinValuationResponse

```typescript
interface CoinValuationResponse {
  coinId: string;
  timeframe: string;               // "1h" | "1d" | "1w" | "1m" | "1y" | "max"
  metalValuation: MetalValuation | null;
  issueValuation: IssueValuation | null;
}

interface MetalValuation {
  metalType: string;               // "GOLD" | "SILVER" | "PLATINUM"
  pureMetalMassInGrams: number;    // weight × (purity/1000)
  currency: string;
  dataPoints: MetalDataPoint[];
}

interface MetalDataPoint {
  timestamp: string;               // ISO 8601
  pricePerGram: number;
  totalValue: number;              // pureMetalMass × pricePerGram
}

interface IssueValuation {
  grade: string | null;
  isExactMatch: boolean;           // true = exact price, false = range
  currency: string;
  dataPoints: IssueDataPoint[];
}

interface IssueDataPoint {
  timestamp: string;
  price: number | null;            // Set if isExactMatch = true
  minPrice: number | null;         // Set if isExactMatch = false
  maxPrice: number | null;         // Set if isExactMatch = false
}
```

### PortfolioValuationResponse

```typescript
interface PortfolioValuationResponse {
  timeframe: string;
  currency: string;
  metalValuation: PortfolioMetalValuation | null;
  collectorValuation: PortfolioCollectorValuation | null;
}

interface PortfolioMetalValuation {
  dataPoints: PortfolioMetalPoint[];
}

interface PortfolioMetalPoint {
  timestamp: string;
  totalValue: number;              // Combined metal value
  goldGrams: number;               // Total pure gold in portfolio
  silverGrams: number;
  platinumGrams: number;
}

interface PortfolioCollectorValuation {
  dataPoints: PortfolioCollectorPoint[];
}

interface PortfolioCollectorPoint {
  timestamp: string;
  exactValue: number | null;       // Only if ALL coins have exact matches
  minValue: number | null;
  maxValue: number | null;
}
```

### CatalogSearchResponse

```typescript
interface CatalogSearchResponse {
  totalCount: number;
  results: CatalogSearchItem[];
}

interface CatalogSearchItem {
  typeId: string;                  // Use this to fetch details
  title: string;
  category: string | null;         // "Bullion coins", etc.
  issuerCode: string | null;       // Country code
  issuerName: string | null;       // "United States"
  minYear: number | null;
  maxYear: number | null;          // null = still minted
  obverseThumbnailUrl: string | null;
  reverseThumbnailUrl: string | null;
}
```

### CatalogCoinDetails (for form pre-fill)

```typescript
interface CatalogCoinDetails {
  numistaId: string;
  title: string;
  coinType: string;                // Maps to CoinType enum
  issuerCode: string | null;
  issuerName: string | null;
  weightInGrams: number | null;
  diameterInMillimeters: number | null;
  thicknessInMillimeters: number | null;
  metalType: string | null;        // "GOLD", "SILVER", etc.
  purity: number | null;           // 1-1000
  compositionText: string | null;  // "Silver (.999)" - for display
  denomination: number | null;
  valueText: string | null;        // "1 Dollar" - for display
  suggestedCurrency: string | null;
  minYear: number | null;
  maxYear: number | null;
  obverseImageUrl: string | null;
  reverseImageUrl: string | null;
  obverseThumbnailUrl: string | null;
  reverseThumbnailUrl: string | null;
  shape: string | null;
  rulers: string[];                // Depicted figures
}
```

---

## Enums & Select Options

### CoinGrade (Dropdown - condition)
Display in this order (worst to best):

| Value | Display Label | Description |
|-------|---------------|-------------|
| `GOOD` | Good (G) | Heavy wear |
| `VERY_GOOD` | Very Good (VG) | Well worn |
| `FINE` | Fine (F) | Moderate wear |
| `VERY_FINE` | Very Fine (VF) | Light wear |
| `EXTREMELY_FINE` | Extremely Fine (XF/EF) | Minimal wear |
| `ABOUT_UNCIRCULATED` | About Uncirculated (AU) | Slight wear on high points |
| `UNCIRCULATED` | Uncirculated (UNC) | No wear |
| `PROOF` | Proof | Special mirror finish |

### CoinType (Dropdown - category)

| Value | Display Label | Description |
|-------|---------------|-------------|
| `BULLION` | Bullion | Investment coins (Eagles, Maples, etc.) |
| `COMMEMORATIVE_CIRCULATION` | Commemorative (Circulating) | Special designs for circulation |
| `STANDARD_CIRCULATION` | Standard Circulation | Regular money |
| `COMMEMORATIVE_NON_CIRCULATION` | Commemorative (Non-Circulating) | Collector-only commemoratives |
| `OTHER` | Other | Anything else |

### MetalType (Dropdown - optional)

| Value | Display Label | Price Symbol |
|-------|---------------|--------------|
| `GOLD` | Gold | XAU |
| `SILVER` | Silver | XAG |
| `PLATINUM` | Platinum | XPT |
| `NICKEL` | Nickel | - |

**Note**: Only GOLD, SILVER, PLATINUM have live pricing. NICKEL is tracked but not valued.

### CoinShape (Dropdown - usually auto-detected)

| Value | Display Label |
|-------|---------------|
| `CIRCULAR` | Round/Circular |
| `TRIANGULAR` | Triangular |
| `SQUARE` | Square |
| `PENTAGON` | Pentagon (5 sides) |
| `HEXAGON` | Hexagon (6 sides) |
| `HEPTAGON` | Heptagon (7 sides) |
| `OCTAGON` | Octagon (8 sides) |
| `SCALLOPED` | Scalloped |
| `IRREGULAR` | Irregular |
| `UNKNOWN` | Unknown |

(Full list includes NONAGON through ICOSAGON for 9-20 sides, plus POLYGONAL for >20)

### CoinSide (For images)

| Value | Display Label |
|-------|---------------|
| `OBVERSE` | Obverse (Front/Heads) |
| `REVERSE` | Reverse (Back/Tails) |

---

## Form Validation Rules

### Required Fields
- `title` - Non-blank
- `year` - Integer, 1-2100
- `countryCode` - Exactly 2 characters (ISO 3166-1 alpha-2)
- `currency` - Valid ISO 4217 code
- `grade` - Must be one of CoinGrade values
- `coinType` - Must be one of CoinType values
- `weightInGrams` - Positive number (> 0)

### Optional Field Constraints
| Field | Constraint |
|-------|------------|
| `denomination` | Must be positive if provided |
| `purity` | 1-1000 (represents 0.1% to 100%) |
| `quantity` | Min: 1 (default: 1) |
| `rarityScore` | 1-100 |
| `numistaId` | Max 50 characters |

### Client-Side Validation Tips
```typescript
// Purity display helper
function formatPurity(purity: number): string {
  return `${(purity / 10).toFixed(1)}%`;  // 999 → "99.9%"
}

// Country code validation
const isValidCountryCode = (code: string) => /^[A-Z]{2}$/.test(code);

// Currency code validation
const isValidCurrencyCode = (code: string) => /^[A-Z]{3}$/.test(code);
```

---

## Error Handling

### Error Response Format
All errors return:
```typescript
interface ErrorResponse {
  message: string;
}
```

### HTTP Status Codes

| Code | Meaning | UI Action |
|------|---------|-----------|
| `200` | Success | Display data |
| `204` | Success (no content) | e.g., after DELETE |
| `400` | Validation error | Show field errors |
| `404` | Not found | Show "not found" message |
| `500` | Server error | Show generic error |

### Common Error Messages

| Scenario | Message |
|----------|---------|
| Missing title | `Title is required` |
| Invalid country | `Country code must be exactly 2 characters` |
| Invalid year | `Year must be at least 1` / `Year must be at most 2100` |
| Invalid purity | `Purity must be at least 1` / `Purity must be at most 1000` |
| Coin not found | `Coin not found with id: {uuid}` |

### Suggested Error Display
```typescript
// Parse validation errors from 400 response
async function handleApiError(response: Response) {
  const error = await response.json();

  if (response.status === 400) {
    // Show as form field error or toast
    showFieldError(error.message);
  } else if (response.status === 404) {
    // Redirect to list or show not found
    showNotFound();
  } else {
    // Generic error
    showToast("Something went wrong. Please try again.");
  }
}
```

---

## Pagination

### Request Parameters
```
GET /api/v1/coins?page=0&size=20&sort=createdAt,desc
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 0 | Page number (0-indexed) |
| `size` | 20 | Items per page |
| `sort` | `createdAt,desc` | Field and direction |

### Sort Options
- `createdAt,desc` - Newest first (default)
- `createdAt,asc` - Oldest first
- `yearOfMinting,desc` - Newest coins first
- `yearOfMinting,asc` - Oldest coins first
- `title,asc` - Alphabetical

### Response Format (Spring Page)
```typescript
interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; empty: boolean };
  };
  totalElements: number;    // Total items across all pages
  totalPages: number;
  size: number;             // Requested page size
  number: number;           // Current page (0-indexed)
  empty: boolean;
}
```

### Pagination UI Example
```typescript
// Calculate pagination display
const page = response.number;
const totalPages = response.totalPages;
const showing = response.content.length;
const total = response.totalElements;

// "Showing 1-20 of 156 coins"
const start = page * response.size + 1;
const end = start + showing - 1;
```

---

## Charts & Valuation Data

### Timeframe Selector
Provide buttons/dropdown for: `1h`, `1d`, `1w`, `1m`, `1y`, `max`

### Data Point Density

| Timeframe | Approx Points | Interval |
|-----------|---------------|----------|
| 1h | ~12 | 5 min |
| 1d | ~288 | 5 min |
| 1w | ~7 | Daily snapshots |
| 1m | ~30 | Daily snapshots |
| 1y | ~365 | Daily snapshots |
| max | Variable | Daily snapshots |

### Chart Data Structure

**For Metal Valuation:**
```typescript
// X-axis: timestamp
// Y-axis: totalValue (or pricePerGram for price charts)
const chartData = response.metalValuation.dataPoints.map(p => ({
  x: new Date(p.timestamp),
  y: p.totalValue
}));
```

**For Collector Valuation (with ranges):**
```typescript
// If isExactMatch = true: single line
// If isExactMatch = false: show as range/band
const chartData = response.issueValuation.dataPoints.map(p => ({
  x: new Date(p.timestamp),
  y: p.price,           // Exact value (may be null)
  yMin: p.minPrice,     // Range min (may be null)
  yMax: p.maxPrice      // Range max (may be null)
}));
```

### Portfolio Chart - Metal Breakdown
```typescript
// For stacked area chart showing metal composition
const chartData = response.metalValuation.dataPoints.map(p => ({
  x: new Date(p.timestamp),
  total: p.totalValue,
  goldGrams: p.goldGrams,
  silverGrams: p.silverGrams,
  platinumGrams: p.platinumGrams
}));
```

### Currency Display
All values are in **USD**. Format appropriately:
```typescript
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
```

---

## Numista Catalog Integration

### Workflow: Add Coin from Catalog

```
1. User searches catalog
   GET /catalog/search?query=American Eagle

2. Display results with thumbnails
   Show: title, issuer, year range, category, thumbnails

3. User clicks "Add to Collection" on a result

4. Fetch full details
   GET /catalog/types/{typeId}

5. Pre-fill the coin form with:
   - title
   - countryCode (from issuerCode)
   - currency (from suggestedCurrency)
   - coinType (map from coinType string)
   - weightInGrams
   - diameterInMillimeters
   - thicknessInMillimeters
   - metalType
   - purity
   - numistaId (IMPORTANT: enables auto image fetch)
   - year (use minYear or let user pick from range)

6. User reviews, adjusts (especially year, grade, quantity), and submits
   POST /api/v1/coins
```

### CoinType Mapping
Map catalog's `coinType` string to enum:
```typescript
function mapCoinType(catalogType: string): CoinType {
  switch (catalogType) {
    case 'BULLION': return 'BULLION';
    case 'COMMEMORATIVE_CIRCULATION': return 'COMMEMORATIVE_CIRCULATION';
    case 'STANDARD_CIRCULATION': return 'STANDARD_CIRCULATION';
    case 'COMMEMORATIVE_NON_CIRCULATION': return 'COMMEMORATIVE_NON_CIRCULATION';
    default: return 'OTHER';
  }
}
```

### Year Selection
If catalog shows a range (e.g., 1986-2023):
- Show a year picker constrained to `minYear` - `maxYear`
- Default to `maxYear` (most recent)

---

## Images

### Auto-Fetched Images
When a coin is created with a valid `numistaId`, the backend **automatically fetches** obverse and reverse images from Numista asynchronously. This may take a few seconds.

### Displaying Images

```typescript
// Get image list
const images = await fetch(`/api/v1/coins/${coinId}/images`).then(r => r.json());

// Display each image
images.forEach(img => {
  const imageUrl = `/api/v1/coins/${coinId}/images/${img.id}/content`;
  // img.side = "OBVERSE" or "REVERSE"
});
```

### Image Response Headers
The `/content` endpoint returns:
- `Content-Type`: `image/jpeg`, `image/png`, or `image/webp`
- `Content-Disposition`: `inline; filename="..."`

### Fallback for Missing Images
If no images exist yet (async fetch pending or no numistaId):
- Show placeholder image
- Or show thumbnails from catalog search results

### Supported Formats
- JPEG
- PNG
- WebP

---

## Recommended UI Patterns

### Loading States
- Show skeleton loaders for lists/cards
- Show spinner on form submission
- Disable submit button while loading

### Empty States
- No coins: "Your collection is empty. Add your first coin!"
- No search results: "No coins found matching your filters"
- No valuation data: "Valuation data not available for this coin"

### Form UX
1. **Search-first flow**: Encourage using Numista search to auto-fill
2. **Manual fallback**: Allow manual entry for unlisted coins
3. **Grade guide**: Consider tooltip explaining grade meanings
4. **Purity helper**: Show percentage conversion (999 → 99.9%)

### Filters Persistence
Consider persisting filter state in URL query params:
```
/coins?country=US&metalType=GOLD&yearFrom=2020
```

### Responsive Breakpoints
Suggested breakpoints:
- Mobile: < 640px (card view for coins)
- Tablet: 640-1024px (compact table)
- Desktop: > 1024px (full table with all columns)

### Color Coding
Suggestions for metal types:
- Gold: `#FFD700` or amber
- Silver: `#C0C0C0` or gray
- Platinum: `#E5E4E2` or light gray

### Toast Notifications
Show toasts for:
- Coin created successfully
- Coin updated successfully
- Coin deleted successfully
- Error messages

---

## Quick Reference Card

### Most Common API Calls

```typescript
// List coins (paginated)
GET /api/v1/coins?page=0&size=20

// Get single coin
GET /api/v1/coins/{id}

// Create coin
POST /api/v1/coins
Body: CreateCoinRequest

// Update coin
PUT /api/v1/coins/{id}
Body: UpdateCoinRequest

// Delete coin
DELETE /api/v1/coins/{id}

// Get coin images
GET /api/v1/coins/{id}/images

// Get image file
GET /api/v1/coins/{coinId}/images/{imageId}/content

// Get coin valuation
GET /api/v1/coins/{id}/valuation?timeframe=1d

// Get portfolio valuation
GET /api/v1/portfolio/valuation?timeframe=1d

// Search Numista catalog
GET /api/v1/catalog/search?query=eagle&page=1&pageSize=20

// Get catalog coin details (for form pre-fill)
GET /api/v1/catalog/types/{typeId}
```

### Required Create Fields
```typescript
{
  title: string,
  year: number,
  countryCode: string,  // 2 chars
  currency: string,     // 3 chars
  grade: CoinGrade,
  coinType: CoinType,
  weightInGrams: number
}
```

---

## Questions?

Check the interactive Swagger documentation at `/swagger-ui.html` for live API testing and detailed schema information.
