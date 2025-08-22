# Google Places API Setup Guide

Configure Google Places API for address validation, geocoding, and location services in Handoff.

## Overview

Google Places API provides:
- **Address Autocomplete** - Real-time address suggestions
- **Address Validation** - Verify and standardize addresses  
- **Geocoding** - Convert addresses to coordinates
- **Place Details** - Business information and reviews
- **Nearby Search** - Find local amenities and services

## Getting Started

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable billing (required for Places API)
4. Note your project ID

### 2. Enable Places API

1. Navigate to **APIs & Services** → **Library**
2. Search for "Places API"
3. Enable the following APIs:
   - **Places API** - For place details and search
   - **Geocoding API** - For address to coordinate conversion
   - **Places API (New)** - For enhanced features (optional)

### 3. Create API Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key
4. Click **Restrict Key** for security

### 4. Configure API Key Restrictions

#### Application Restrictions
Choose one based on your deployment:

**HTTP Referrers (websites)**
```
https://yourdomain.com/*
https://your-app.vercel.app/*
http://localhost:3000/* (for development)
```

**IP Addresses (servers)**
```
Your server IP addresses
Your Vercel deployment IPs
```

#### API Restrictions
Limit access to only needed APIs:
- Places API
- Geocoding API
- Maps JavaScript API (if using maps)

## Integration Setup

### 1. Add API Key to Environment

#### Option A: API Key Manager (Recommended)
1. Navigate to `/?api-key-manager=true`
2. Enter your Google Places API key
3. Test connectivity with built-in validation
4. Save configuration

#### Option B: Environment Variables
```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### 2. Test Integration

Use the built-in testing tools:
```bash
# Visit API Key Manager for interactive testing
/?api-key-manager=true

# Or test programmatically
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=123%20main%20st&key=YOUR_API_KEY"
```

## Address Autocomplete

### Basic Implementation

The address autocomplete provides real-time suggestions:

```typescript
// Address input with autocomplete
<AddressAutocompleteInput
  onAddressSelect={(address) => {
    console.log('Selected address:', address);
  }}
  placeholder="Enter property address"
/>
```

### Features

#### Real-time Suggestions
- **Predictive Text** - Suggestions appear as user types
- **Formatted Addresses** - Standardized address format
- **Geographic Filtering** - Bias results to specific regions
- **Debounced Requests** - Efficient API usage

#### Address Components
```typescript
interface AddressComponents {
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
}
```

#### Custom Filtering
```typescript
// Restrict to specific countries
const autocompleteOptions = {
  componentRestrictions: { country: 'us' },
  types: ['address'],
  fields: ['formatted_address', 'geometry', 'address_components']
};
```

## Address Validation

### Validation Process

1. **Input Normalization** - Clean and format user input
2. **API Lookup** - Query Google Places for matches
3. **Component Extraction** - Parse address components
4. **Validation Status** - Return confidence and suggestions

```typescript
// Validate address with detailed response
const validation = await validateAddress(userInput);

console.log(validation);
// {
//   isValid: true,
//   confidence: 0.95,
//   formattedAddress: "123 Main St, Austin, TX 78701, USA",
//   components: { ... },
//   coordinates: { lat: 30.2672, lng: -97.7431 }
// }
```

### Error Handling

```typescript
// Handle common validation scenarios
switch (validation.status) {
  case 'EXACT_MATCH':
    // Address found with high confidence
    break;
  case 'PARTIAL_MATCH': 
    // Suggest corrections to user
    break;
  case 'NOT_FOUND':
    // Prompt user to verify address
    break;
  case 'AMBIGUOUS':
    // Show multiple options for selection
    break;
}
```

## Geocoding Integration

### Address to Coordinates
```typescript
// Convert address to GPS coordinates
const geocoding = await geocodeAddress("123 Main St, Austin, TX");

console.log(geocoding);
// {
//   lat: 30.2672,
//   lng: -97.7431,
//   accuracy: 'ROOFTOP',
//   placeId: 'ChIJrw7QBK20RIYRzMh-FStUCnI'
// }
```

### Reverse Geocoding
```typescript
// Convert coordinates to address
const reverseGeocoding = await reverseGeocode(30.2672, -97.7431);

console.log(reverseGeocoding);
// {
//   formattedAddress: "123 Main St, Austin, TX 78701, USA",
//   neighborhood: "Downtown",
//   city: "Austin",
//   state: "Texas"
// }
```

## Place Details Enhancement

### Business Information
```typescript
// Get detailed place information
const placeDetails = await getPlaceDetails(placeId);

console.log(placeDetails);
// {
//   name: "Local Business",
//   rating: 4.5,
//   phoneNumber: "(512) 123-4567",
//   website: "https://example.com",
//   openingHours: [...],
//   photos: [...],
//   reviews: [...]
// }
```

### Nearby Amenities
```typescript
// Find nearby schools, hospitals, shopping
const nearbyPlaces = await findNearbyPlaces({
  location: { lat: 30.2672, lng: -97.7431 },
  radius: 2000, // 2km
  types: ['school', 'hospital', 'shopping_mall']
});
```

## Performance Optimization

### Caching Strategy
```typescript
// Cache geocoding results
const cacheKey = `geocode:${address}`;
const cached = await cache.get(cacheKey);

if (!cached) {
  const result = await geocodeAddress(address);
  await cache.set(cacheKey, result, { ttl: 86400 }); // 24 hours
  return result;
}
```

### Request Debouncing
```typescript
// Debounce autocomplete requests
const debouncedSearch = useMemo(
  () => debounce(async (input: string) => {
    const suggestions = await getPlaceSuggestions(input);
    setSuggestions(suggestions);
  }, 300),
  []
);
```

### Session Tokens
```typescript
// Use session tokens for cost optimization
const sessionToken = generateSessionToken();

// Use same token for related requests
const autocomplete = await getAutocompleteSuggestions(input, { 
  sessionToken 
});
const details = await getPlaceDetails(placeId, { 
  sessionToken 
});
```

## Error Handling & Troubleshooting

### Common Issues

#### API Key Issues
```javascript
// Error: This API project is not authorized
{
  error: "API key not authorized",
  solution: "Check API key restrictions in Google Cloud Console"
}
```

#### Quota Exceeded
```javascript
// Error: You have exceeded your daily request quota
{
  error: "Quota exceeded", 
  solution: "Monitor usage and increase quota or optimize requests"
}
```

#### Invalid Requests
```javascript
// Error: Invalid request parameters
{
  error: "Invalid request",
  solution: "Verify request format and required parameters"
}
```

### Debugging Tools

#### Places API Tester
Access at `/?api-key-manager=true`:
- **Test Autocomplete** - Interactive address suggestions
- **Test Geocoding** - Address to coordinate conversion
- **View API Responses** - Inspect raw API data
- **Monitor Usage** - Track request quotas

#### Network Diagnostics
```typescript
// Log API requests for debugging
console.log('Places API Request:', {
  endpoint: 'autocomplete',
  input: userInput,
  timestamp: Date.now()
});
```

## Security Best Practices

### API Key Protection
- **Restrict by domain** - Limit to your application domains
- **Use environment variables** - Never commit keys to code
- **Monitor usage** - Set up billing alerts
- **Rotate keys regularly** - Update keys periodically

### Request Validation
```typescript
// Validate user input before API calls
const isValidInput = (input: string): boolean => {
  return input.length > 2 && input.length < 200 && 
         /^[a-zA-Z0-9\s,.-]+$/.test(input);
};
```

## Cost Optimization

### Usage Monitoring
- **Set billing alerts** - Monitor monthly costs
- **Track request patterns** - Identify optimization opportunities
- **Use session tokens** - Reduce per-request costs
- **Cache responses** - Avoid duplicate requests

### Efficient Requests
```typescript
// Request only needed fields
const autocompleteOptions = {
  fields: ['formatted_address', 'geometry.location'],
  types: ['address']
};
```

## Production Configuration

### Environment Variables
```env
# Production Google Places settings
GOOGLE_PLACES_API_KEY=your_production_api_key
GOOGLE_PLACES_CACHE_TTL=86400
GOOGLE_PLACES_RATE_LIMIT=100
```

### Monitoring
- **Usage Dashboards** - Google Cloud Console monitoring
- **Error Rate Tracking** - Application performance monitoring
- **Response Time Alerts** - Performance degradation alerts
- **Cost Tracking** - Monthly usage and billing reports

## Support Resources

### Google Documentation
- **Places API Documentation** - [developers.google.com/maps/documentation/places](https://developers.google.com/maps/documentation/places)
- **Geocoding API Guide** - [developers.google.com/maps/documentation/geocoding](https://developers.google.com/maps/documentation/geocoding)
- **Best Practices** - [developers.google.com/maps/premium/optimization](https://developers.google.com/maps/premium/optimization)

### Handoff Integration
- **API Key Manager** - `/?api-key-manager=true`
- **Address Demo** - Built-in address validation testing
- **Development Tools** - `/?dev-tools=true`

---

## Next Steps

- [Configure ATTOM API](ATTOM_API_Configuration_Guide.md)
- [Set up Address Validation](AddressValidation.md)
- [Deploy to Production](production-deployment.md)

For advanced customization and troubleshooting, see the [Google Places API documentation](https://developers.google.com/maps/documentation/places) or create a GitHub issue.