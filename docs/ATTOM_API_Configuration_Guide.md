# ATTOM API Configuration Guide

Complete guide for integrating ATTOM Data API with Handoff to provide comprehensive property information, valuations, and market analytics.

## Overview

ATTOM Data provides:
- **Property Details** - Comprehensive property characteristics
- **Valuations** - Current market values and estimates  
- **Market Analytics** - Comparable sales and market trends
- **Property History** - Sales history and ownership records
- **Location Data** - School districts, demographics, and local amenities

## Getting Started

### 1. Obtain ATTOM API Credentials

1. Visit [ATTOM Data Developer Portal](https://api.developer.attomdata.com)
2. Create an account and request API access
3. Choose appropriate subscription plan
4. Receive API key and endpoint URLs

### 2. Configure API Key

#### Option A: Using API Key Manager (Recommended)
1. Navigate to `/?api-key-manager=true` in your Handoff application
2. Enter your ATTOM API key
3. Test connectivity using built-in validation tools
4. Save configuration

#### Option B: Environment Variables
Add to your `.env.local` file:
```env
ATTOM_API_KEY=your_attom_api_key_here
```

## API Integration

### Supported Endpoints

Handoff integrates with these ATTOM API endpoints:

#### Property Detail API
```typescript
// Get comprehensive property information
const propertyData = await fetchAttomPropertyData(address);
```

**Data Includes:**
- Property characteristics (bedrooms, bathrooms, square footage)
- Lot information and property type
- Construction details and year built
- Tax assessment and market values

#### Automated Valuation Model (AVM)
```typescript  
// Get current market valuation
const valuation = await fetchAttomValuation(address);
```

**Data Includes:**
- Current estimated value
- Value range and confidence score
- Price per square foot comparisons

#### Sales History
```typescript
// Get property transaction history  
const salesHistory = await fetchAttomSalesHistory(address);
```

**Data Includes:**
- Historical sale prices and dates
- Previous owners and transfer details
- Market appreciation trends

### Field Mapping Configuration

#### Access Field Mapping Interface
Navigate to `/?property-field-mapping=true` to:

1. **View Available Fields** - See all ATTOM API response fields
2. **Map to Display Fields** - Configure which fields appear in your UI
3. **Test Mappings** - Verify field mapping with live data
4. **Save Configuration** - Store mappings in your database

#### Example Field Mapping
```json
{
  "property_characteristics": {
    "bedrooms": "building.rooms.beds",
    "bathrooms": "building.rooms.bathstotal", 
    "square_feet": "building.size.gross",
    "year_built": "building.construction.yearbuilt"
  },
  "valuation": {
    "estimated_value": "avm.amount.value",
    "value_range_low": "avm.amount.low",
    "value_range_high": "avm.amount.high"
  }
}
```

## Property Data Display

### Comprehensive Property Overview

The property overview displays ATTOM data in organized sections:

#### Property Information
- **Address** - Formatted street address with geocoding
- **Property Type** - Residential, commercial, land, etc.
- **Year Built** - Construction year and age
- **Lot Size** - Acreage or square footage

#### Property Characteristics  
- **Bedrooms** - Number of bedrooms
- **Bathrooms** - Total and partial bathroom counts
- **Living Space** - Gross and living square footage
- **Parking** - Garage and parking space details

#### Valuation Information
- **Current Value** - AVM estimated market value
- **Value Range** - Low to high value estimates
- **Price per Sq Ft** - Cost efficiency metrics
- **Tax Assessment** - Official tax assessed value

#### Market Analytics
- **Comparable Sales** - Recent nearby transactions
- **Market Trends** - Price appreciation over time
- **Days on Market** - Average time to sell
- **Sale-to-List Ratio** - Pricing accuracy metrics

## Advanced Features

### Property Search Integration

```typescript
// Search properties by criteria
const searchResults = await searchAttomProperties({
  location: "Austin, TX",
  propertyType: "SFR", 
  priceRange: { min: 300000, max: 500000 },
  bedrooms: { min: 3 },
  bathrooms: { min: 2 }
});
```

### Batch Property Processing
```typescript
// Process multiple properties efficiently
const batchResults = await fetchAttomBatchData([
  "123 Main St, Austin, TX",
  "456 Oak Ave, Austin, TX", 
  "789 Elm St, Austin, TX"
]);
```

### Market Analytics Dashboard
- **Neighborhood Analysis** - Local market conditions
- **Investment Metrics** - Cap rates and cash flow projections
- **Risk Assessment** - Market volatility and trend analysis

## Error Handling & Troubleshooting

### Common Issues

#### API Key Problems
```typescript
// Error: 401 Unauthorized
{
  "error": "Invalid or missing API key",
  "solution": "Verify API key in API Key Manager"
}
```

#### Rate Limiting
```typescript  
// Error: 429 Too Many Requests
{
  "error": "API rate limit exceeded", 
  "solution": "Implement request throttling and retry logic"
}
```

#### Invalid Address Format
```typescript
// Error: 400 Bad Request
{
  "error": "Address not found or invalid format",
  "solution": "Use Google Places API for address validation first"
}
```

### Debugging Tools

#### ATTOM API Inspector
Access debugging tools at `/?dev-tools=true`:

1. **API Call Inspector** - View request/response details
2. **Response Data Browser** - Explore API response structure
3. **Field Mapping Tester** - Test field extractions
4. **Error Log Viewer** - Diagnose API integration issues

#### Request Logging
```typescript
// Enable detailed logging
console.log('ATTOM API Request:', { url, params, headers });
console.log('ATTOM API Response:', { status, data, timing });
```

## Performance Optimization

### Caching Strategy
```typescript
// Cache frequently accessed property data
const cacheKey = `attom:property:${propertyId}`;
const cachedData = await cache.get(cacheKey);

if (!cachedData) {
  const freshData = await fetchAttomData(address);
  await cache.set(cacheKey, freshData, { ttl: 3600 }); // 1 hour
  return freshData;
}
```

### Request Optimization
- **Batch Requests** - Group multiple property lookups
- **Field Filtering** - Request only needed data fields  
- **Conditional Requests** - Use ETags for cache validation
- **Connection Pooling** - Reuse HTTP connections

## Data Privacy & Compliance

### Data Usage Guidelines
- **Property Data** - Public record information, appropriate for display
- **Owner Information** - Handle PII according to privacy policies
- **Financial Data** - Secure storage and transmission required
- **Retention Policies** - Delete cached data according to terms

### ATTOM Terms of Service
- Review and comply with ATTOM API terms
- Respect rate limits and usage quotas
- Properly attribute data sources
- Follow data redistribution guidelines

## Production Deployment

### Environment Configuration
```env
# Production ATTOM API settings
ATTOM_API_KEY=your_production_api_key
ATTOM_API_URL=https://api.gateway.attomdata.com
ATTOM_RATE_LIMIT=1000
ATTOM_CACHE_TTL=3600
```

### Monitoring & Alerts
- **API Usage Tracking** - Monitor quota consumption
- **Error Rate Monitoring** - Alert on elevated error rates
- **Response Time Tracking** - Performance degradation alerts
- **Data Quality Checks** - Validate response data integrity

## Support Resources

### ATTOM Data Support
- **Developer Portal** - [api.developer.attomdata.com](https://api.developer.attomdata.com)
- **Documentation** - Comprehensive API reference
- **Support Tickets** - Technical assistance
- **Community Forum** - Developer discussions

### Handoff Integration Support
- **API Key Manager** - `/?api-key-manager=true`
- **Field Mapping Tool** - `/?property-field-mapping=true`
- **Development Tools** - `/?dev-tools=true`
- **GitHub Issues** - Report integration bugs

---

## Next Steps

- [Configure Google Places API](GooglePlacesSetup.md)
- [Set up Address Validation](AddressValidation.md)
- [Deploy to Production](production-deployment.md)

For advanced use cases and custom integrations, see the [ATTOM API documentation](https://api.developer.attomdata.com/docs) or contact our development team.