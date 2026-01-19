# Coffer2 API Documentation

A RESTful API for managing coin collections with portfolio valuation capabilities.

## Base URL

```
http://localhost:8080/api/v1
```

## Interactive Documentation

When the application is running, interactive Swagger UI documentation is available at:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`
- **OpenAPI YAML**: `http://localhost:8080/v3/api-docs.yaml`

---

## Table of Contents

1. [Coins](#coins)
   - [Create Coin](#create-coin)
   - [Get Coin by ID](#get-coin-by-id)
   - [Update Coin](#update-coin)
   - [Delete Coin](#delete-coin)
   - [Search Coins](#search-coins)
   - [Get Coin Images](#get-coin-images)
   - [Get Coin Image Metadata](#get-coin-image-metadata)
   - [Download Coin Image](#download-coin-image)
2. [Coin Catalog](#coin-catalog)
   - [Search Catalog](#search-catalog)
   - [Get Coin Details](#get-coin-details)
3. [Coin Valuation](#coin-valuation)
   - [Get Coin Valuation](#get-coin-valuation)
4. [Portfolio Valuation](#portfolio-valuation)
   - [Get Portfolio Valuation](#get-portfolio-valuation)
5. [Enums](#enums)
6. [Error Handling](#error-handling)

---

## Coins

Endpoints for managing your coin collection.

### Create Coin

Add a new coin to the collection.

```
POST /api/v1/coins
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Coin title/name |
| `denomination` | decimal | No | Face value denomination |
| `year` | integer | Yes | Year of minting (1-2100) |
| `countryCode` | string | Yes | ISO 3166-1 alpha-2 country code (2 chars) |
| `currency` | string | Yes | ISO 4217 currency code |
| `mintMark` | string | No | Mint mark identifier |
| `grade` | CoinGrade | Yes | Coin grade/condition |
| `coinType` | CoinType | Yes | Type of coin |
| `notes` | string | No | Additional notes |
| `numistaId` | string | No | Numista catalog type ID (max 50 chars) |
| `metalType` | MetalType | No | Primary metal composition |
| `weightInGrams` | decimal | Yes | Total weight in grams |
| `purity` | integer | No | Metal purity (1-1000, e.g., 999 for 99.9%) |
| `quantity` | integer | No | Number of identical coins (default: 1) |
| `rarityScore` | integer | No | Rarity score (1-100) |
| `diameterInMillimeters` | decimal | No | Coin diameter in mm |
| `thicknessInMillimeters` | decimal | No | Coin thickness in mm |

#### Example Request

```json
{
  "title": "American Gold Eagle 1 oz",
  "denomination": 50,
  "year": 2023,
  "countryCode": "US",
  "currency": "USD",
  "mintMark": "W",
  "grade": "UNCIRCULATED",
  "coinType": "BULLION",
  "notes": "First year of new design",
  "numistaId": "12345",
  "metalType": "GOLD",
  "weightInGrams": 31.1035,
  "purity": 916,
  "quantity": 1,
  "rarityScore": 25,
  "diameterInMillimeters": 32.7,
  "thicknessInMillimeters": 2.87
}
```

#### Response

**200 OK**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "American Gold Eagle 1 oz",
  "denomination": 50,
  "currency": "USD",
  "yearOfMinting": 2023,
  "issuerCountry": "US",
  "mintMark": "W",
  "grade": "UNCIRCULATED",
  "type": "BULLION",
  "notes": "First year of new design",
  "numistaId": "12345",
  "shape": "CIRCULAR",
  "weightInGrams": 31.1035,
  "purity": 916,
  "metalType": "GOLD",
  "rarity": { "score": 25 },
  "createdAt": "2023-06-15T10:30:00Z",
  "diameterInMillimeters": 32.7,
  "thicknessInMillimeters": 2.87,
  "quantity": 1
}
```

**400 Bad Request**

```json
{
  "message": "Title is required"
}
```

---

### Get Coin by ID

Retrieve a specific coin by its ID.

```
GET /api/v1/coins/{id}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Coin identifier |

#### Response

**200 OK** - Returns [CoinResponse](#coinresponse)

**404 Not Found**

```json
{
  "message": "Coin not found with id: 550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Update Coin

Update an existing coin's details.

```
PUT /api/v1/coins/{id}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Coin identifier |

#### Request Body

Same as [Create Coin](#create-coin), with an additional optional field:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `shape` | CoinShape | No | Physical shape of the coin |

#### Response

**200 OK** - Returns [CoinResponse](#coinresponse)

**400 Bad Request** - Validation error

**404 Not Found** - Coin not found

---

### Delete Coin

Delete a coin from the collection.

```
DELETE /api/v1/coins/{id}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Coin identifier |

#### Response

**204 No Content** - Successfully deleted

**404 Not Found** - Coin not found

---

### Search Coins

Search and filter coins with pagination.

```
GET /api/v1/coins
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `country` | string | Filter by issuer country code (ISO 3166-1 alpha-2) |
| `denomination` | string | Filter by denomination value |
| `grade` | CoinGrade | Filter by coin grade |
| `coinType` | CoinType | Filter by coin type |
| `yearFrom` | integer | Filter by minimum year of minting |
| `yearTo` | integer | Filter by maximum year of minting |
| `metalType` | MetalType | Filter by metal type |
| `shape` | CoinShape | Filter by coin shape |
| `currency` | string | Filter by currency code (ISO 4217) |
| `title` | string | Search by title (partial match) |
| `numistaId` | string | Filter by Numista ID |
| `page` | integer | Page number (0-based, default: 0) |
| `size` | integer | Results per page (default: 20) |
| `sort` | string | Sort field and direction (default: createdAt,desc) |

#### Example Request

```
GET /api/v1/coins?country=US&metalType=GOLD&yearFrom=2020&size=10&sort=yearOfMinting,desc
```

#### Response

**200 OK**

```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "American Gold Eagle 1 oz",
      ...
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": { "sorted": true, "empty": false }
  },
  "totalElements": 42,
  "totalPages": 5,
  "size": 10,
  "number": 0,
  "empty": false
}
```

---

### Get Coin Images

Retrieve all images for a specific coin.

```
GET /api/v1/coins/{coinId}/images
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `coinId` | UUID | Coin identifier |

#### Response

**200 OK**

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "coinId": "550e8400-e29b-41d4-a716-446655440000",
    "side": "OBVERSE",
    "fileName": "gold-eagle-obverse.jpg",
    "contentType": "image/jpeg",
    "sizeInBytes": 245678,
    "createdAt": "2023-06-15T10:30:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "coinId": "550e8400-e29b-41d4-a716-446655440000",
    "side": "REVERSE",
    "fileName": "gold-eagle-reverse.jpg",
    "contentType": "image/jpeg",
    "sizeInBytes": 198432,
    "createdAt": "2023-06-15T10:30:00Z"
  }
]
```

---

### Get Coin Image Metadata

Retrieve metadata for a specific coin image.

```
GET /api/v1/coins/{coinId}/images/{imageId}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `coinId` | UUID | Coin identifier |
| `imageId` | UUID | Image identifier |

#### Response

**200 OK** - Returns [CoinImageResponse](#coinimageresponse)

**404 Not Found** - Image not found

---

### Download Coin Image

Download the actual image file.

```
GET /api/v1/coins/{coinId}/images/{imageId}/content
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `coinId` | UUID | Coin identifier |
| `imageId` | UUID | Image identifier |

#### Response

**200 OK** - Returns binary image data with appropriate `Content-Type` header

**404 Not Found** - Image not found

---

## Coin Catalog

Search the Numista coin catalog and retrieve pre-populated coin data.

### Search Catalog

Search Numista catalog for coins.

```
GET /api/v1/catalog/search
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query text |
| `page` | integer | 1 | Page number (1-based) |
| `pageSize` | integer | 20 | Results per page |

#### Example Request

```
GET /api/v1/catalog/search?query=American%20Eagle&page=1&pageSize=20
```

#### Response

**200 OK**

```json
{
  "totalCount": 1523,
  "results": [
    {
      "typeId": "12345",
      "title": "1 Dollar - American Silver Eagle",
      "category": "Bullion coins",
      "issuerCode": "US",
      "issuerName": "United States",
      "minYear": 1986,
      "maxYear": null,
      "obverseThumbnailUrl": "https://en.numista.com/catalogue/photos/...",
      "reverseThumbnailUrl": "https://en.numista.com/catalogue/photos/..."
    }
  ]
}
```

---

### Get Coin Details

Get detailed coin data from Numista for form pre-population.

```
GET /api/v1/catalog/types/{typeId}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `typeId` | string | Numista type ID |

#### Response

**200 OK**

```json
{
  "numistaId": "12345",
  "title": "1 Dollar - American Silver Eagle",
  "coinType": "BULLION",
  "issuerCode": "US",
  "issuerName": "United States",
  "weightInGrams": 31.1035,
  "diameterInMillimeters": 40.6,
  "thicknessInMillimeters": 2.98,
  "metalType": "SILVER",
  "purity": 999,
  "compositionText": "Silver (.999)",
  "denomination": 1,
  "valueText": "1 Dollar",
  "suggestedCurrency": "USD",
  "minYear": 1986,
  "maxYear": null,
  "obverseImageUrl": "https://en.numista.com/catalogue/photos/...",
  "reverseImageUrl": "https://en.numista.com/catalogue/photos/...",
  "obverseThumbnailUrl": "https://en.numista.com/catalogue/photos/...",
  "reverseThumbnailUrl": "https://en.numista.com/catalogue/photos/...",
  "shape": "Round",
  "rulers": ["Walking Liberty"]
}
```

**404 Not Found** - Coin type not found in Numista catalog

---

## Coin Valuation

Get historical valuation data for individual coins.

### Get Coin Valuation

Returns historical valuation data based on metal prices and collector prices.

```
GET /api/v1/coins/{coinId}/valuation
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `coinId` | UUID | Coin identifier |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeframe` | string | `1d` | Timeframe: `1h`, `1d`, `1w`, `1m`, `1y`, `max` |

#### Timeframes

| Code | Description |
|------|-------------|
| `1h` | Last hour |
| `1d` | Last 24 hours |
| `1w` | Last 7 days |
| `1m` | Last 30 days |
| `1y` | Last 365 days |
| `max` | All available history |

#### Response

**200 OK**

```json
{
  "coinId": "550e8400-e29b-41d4-a716-446655440000",
  "timeframe": "1d",
  "metalValuation": {
    "metalType": "GOLD",
    "pureMetalMassInGrams": 28.5,
    "currency": "USD",
    "dataPoints": [
      {
        "timestamp": "2023-06-15T08:00:00Z",
        "pricePerGram": 62.45,
        "totalValue": 1779.83
      },
      {
        "timestamp": "2023-06-15T10:00:00Z",
        "pricePerGram": 62.78,
        "totalValue": 1789.23
      }
    ]
  },
  "issueValuation": {
    "grade": "UNCIRCULATED",
    "isExactMatch": true,
    "currency": "USD",
    "dataPoints": [
      {
        "timestamp": "2023-06-15T00:00:00Z",
        "price": 2150.00,
        "minPrice": null,
        "maxPrice": null
      }
    ]
  }
}
```

#### Valuation Notes

- **Metal Valuation**: Calculated as `pureMetalMass × pricePerGram`, where `pureMetalMass = weight × (purity / 1000)`
- **Issue Valuation**:
  - If `isExactMatch` is `true`: exact `price` is provided
  - If `isExactMatch` is `false`: `minPrice` and `maxPrice` range is provided

**404 Not Found** - Coin not found

---

## Portfolio Valuation

Get aggregated valuation data for the entire coin collection.

### Get Portfolio Valuation

Returns historical portfolio valuation aggregating all coins.

```
GET /api/v1/portfolio/valuation
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeframe` | string | `1d` | Timeframe: `1h`, `1d`, `1w`, `1m`, `1y`, `max` |

#### Response

**200 OK**

```json
{
  "timeframe": "1d",
  "currency": "USD",
  "metalValuation": {
    "dataPoints": [
      {
        "timestamp": "2023-06-15T10:00:00Z",
        "totalValue": 45678.90,
        "goldGrams": 62.207,
        "silverGrams": 311.035,
        "platinumGrams": 31.103
      }
    ]
  },
  "collectorValuation": {
    "dataPoints": [
      {
        "timestamp": "2023-06-15T00:00:00Z",
        "exactValue": null,
        "minValue": 48500.00,
        "maxValue": 56200.00
      }
    ]
  }
}
```

#### Notes

- **Short timeframes** (`1h`, `1d`): Computed real-time from current price data
- **Longer timeframes** (`1w`, `1m`, `1y`, `max`): Uses pre-computed daily snapshots
- **Collector valuation**:
  - `exactValue` is provided only if all coins have exact issue matches
  - Otherwise, `minValue` and `maxValue` represent the aggregate range

---

## Enums

### CoinGrade

| Value | Description | Numista Code |
|-------|-------------|--------------|
| `GOOD` | Good | g |
| `VERY_GOOD` | Very Good | vg |
| `FINE` | Fine | f |
| `VERY_FINE` | Very Fine | vf |
| `EXTREMELY_FINE` | Extremely Fine | xf |
| `ABOUT_UNCIRCULATED` | About Uncirculated | au |
| `UNCIRCULATED` | Uncirculated | unc |
| `PROOF` | Proof | - |

### CoinType

| Value | Description |
|-------|-------------|
| `BULLION` | Bullion/investment coins |
| `COMMEMORATIVE_CIRCULATION` | Circulating commemorative coins |
| `STANDARD_CIRCULATION` | Standard circulation coins |
| `COMMEMORATIVE_NON_CIRCULATION` | Non-circulating commemorative coins |
| `OTHER` | Other types |

### MetalType

| Value | Symbol | Description |
|-------|--------|-------------|
| `GOLD` | XAU | Gold |
| `SILVER` | XAG | Silver |
| `PLATINUM` | XPT | Platinum |
| `NICKEL` | XNIK | Nickel |

### CoinShape

| Value | Description |
|-------|-------------|
| `CIRCULAR` | Standard round coins |
| `TRIANGULAR` | 3-sided coins |
| `SQUARE` | 4-sided coins |
| `PENTAGON` | 5-sided coins |
| `HEXAGON` | 6-sided coins |
| `HEPTAGON` | 7-sided coins (e.g., UK 50p) |
| `OCTAGON` | 8-sided coins |
| `NONAGON` | 9-sided coins |
| `DECAGON` | 10-sided coins |
| `UNDECAGON` | 11-sided coins |
| `DODECAGON` | 12-sided coins |
| `POLYGONAL` | >20 sides |
| `SCALLOPED` | Wavy/scalloped edges |
| `IRREGULAR` | Irregular shapes |
| `UNKNOWN` | Shape not detected |

### CoinSide

| Value | Description |
|-------|-------------|
| `OBVERSE` | Front side (heads) |
| `REVERSE` | Back side (tails) |

---

## Error Handling

All errors return a consistent JSON response:

```json
{
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `204` | Success (no content) |
| `400` | Bad Request - Invalid input or validation error |
| `404` | Not Found - Resource does not exist |
| `500` | Internal Server Error |

### Common Error Messages

| Scenario | Message Example |
|----------|-----------------|
| Coin not found | `Coin not found with id: {uuid}` |
| Validation error | `Title is required` |
| Invalid country code | `Country code must be exactly 2 characters` |
| Invalid year | `Year must be at least 1` |
| Invalid purity | `Purity must be at most 1000` |

---

## Response Models

### CoinResponse

```json
{
  "id": "string (UUID)",
  "title": "string",
  "denomination": "decimal",
  "currency": "string",
  "yearOfMinting": "integer",
  "issuerCountry": "string",
  "mintMark": "string",
  "grade": "CoinGrade",
  "type": "CoinType",
  "notes": "string",
  "numistaId": "string",
  "shape": "CoinShape",
  "weightInGrams": "decimal",
  "purity": "decimal",
  "metalType": "MetalType",
  "rarity": { "score": "integer" },
  "createdAt": "ISO 8601 datetime",
  "diameterInMillimeters": "decimal",
  "thicknessInMillimeters": "decimal",
  "quantity": "integer"
}
```

### CoinImageResponse

```json
{
  "id": "string (UUID)",
  "coinId": "string (UUID)",
  "side": "CoinSide",
  "fileName": "string",
  "contentType": "string",
  "sizeInBytes": "long",
  "createdAt": "ISO 8601 datetime"
}
```

### ErrorResponse

```json
{
  "message": "string"
}
```
