import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';

const placesRouter = new Hono();

// Enable CORS
placesRouter.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Helper function to validate API key
function validateApiKey(): { valid: boolean; error?: string } {
  if (!GOOGLE_PLACES_API_KEY) {
    return { valid: false, error: 'Google Places API key is not configured' };
  }
  if (GOOGLE_PLACES_API_KEY.length < 30) {
    return { valid: false, error: 'Google Places API key appears to be invalid' };
  }
  return { valid: true };
}

// Helper function to make Google Places API requests
async function makeGooglePlacesRequest(endpoint: string, params: URLSearchParams) {
  const keyValidation = validateApiKey();
  if (!keyValidation.valid) {
    throw new Error(keyValidation.error);
  }

  params.set('key', GOOGLE_PLACES_API_KEY!);
  const url = `${GOOGLE_PLACES_BASE_URL}${endpoint}?${params.toString()}`;
  
  console.log('Making Google Places API request to:', endpoint);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Places API error:', response.status, errorText);
    throw new Error(`Google Places API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Google Places API status error:', data.status, data.error_message);
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }
  
  return data;
}

// Health check endpoint
placesRouter.get('/health', (c) => {
  console.log('🏥 Places service health check requested');
  
  const keyValidation = validateApiKey();
  
  const healthResponse = {
    success: true,
    status: 'healthy',
    service: 'places',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /test',
      'GET /validate-key',
      'GET /autocomplete',
      'GET /details'
    ],
    environment: {
      google_places_api_key: !!GOOGLE_PLACES_API_KEY,
      api_key_valid: keyValidation.valid
    }
  };
  
  console.log('🏥 Places health check response:', JSON.stringify(healthResponse));
  return c.json(healthResponse);
});

// Test endpoint
placesRouter.get('/test', (c) => {
  return c.json({
    success: true,
    message: 'Places service test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Validate key endpoint
placesRouter.get('/validate-key', async (c) => {
  const keyValidation = validateApiKey();
  
  if (!keyValidation.valid) {
    return c.json({
      success: true,
      valid: false,
      message: keyValidation.error || 'API key is not configured',
      timestamp: new Date().toISOString()
    });
  }

  // Test the API key with a simple request
  try {
    const params = new URLSearchParams({
      input: 'New York',
      types: 'address'
    });
    
    await makeGooglePlacesRequest('/autocomplete/json', params);
    
    return c.json({
      success: true,
      valid: true,
      message: 'Google Places API key is valid and working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API key validation test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Determine if this is an API key issue specifically
    let isKeyError = false;
    if (errorMessage.includes('API key') || 
        errorMessage.includes('REQUEST_DENIED') || 
        errorMessage.includes('invalid') ||
        errorMessage.includes('denied')) {
      isKeyError = true;
    }
    
    return c.json({
      success: true,
      valid: false,
      message: isKeyError 
        ? 'Google Places API key is invalid or not properly configured'
        : `API test failed: ${errorMessage}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Address autocomplete endpoint
placesRouter.get('/autocomplete', async (c) => {
  try {
    const input = c.req.query('input');
    const country = c.req.query('country') || 'US';
    const types = c.req.query('types') || 'address';
    
    if (!input) {
      return c.json({
        success: false,
        error: 'Missing required parameter: input'
      }, 400);
    }

    if (input.length < 3) {
      return c.json({
        success: true,
        predictions: [],
        status: 'OK'
      });
    }

    // Check if API key is configured before making request
    const keyValidation = validateApiKey();
    if (!keyValidation.valid) {
      return c.json({
        success: false,
        error: 'Google Places API key is not configured or invalid',
        fallback_available: true,
        timestamp: new Date().toISOString()
      }, 503); // Service Unavailable
    }

    console.log('Places autocomplete request:', { input, country, types });

    const params = new URLSearchParams({
      input: input,
      types: types,
      components: `country:${country.toLowerCase()}`
    });

    const data = await makeGooglePlacesRequest('/autocomplete/json', params);
    
    console.log('Places autocomplete response:', {
      status: data.status,
      predictions_count: data.predictions?.length || 0
    });

    return c.json({
      success: true,
      predictions: data.predictions || [],
      status: data.status
    });

  } catch (error) {
    console.error('Places autocomplete error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if this is an API key related error
    const isApiKeyError = errorMessage.includes('API key') || 
                         errorMessage.includes('REQUEST_DENIED') || 
                         errorMessage.includes('invalid') ||
                         errorMessage.includes('denied');
    
    return c.json({
      success: false,
      error: isApiKeyError 
        ? 'Google Places API key is invalid or not properly configured'
        : errorMessage,
      fallback_available: true,
      api_key_error: isApiKeyError,
      timestamp: new Date().toISOString()
    }, isApiKeyError ? 403 : 500);
  }
});

// Address details endpoint
placesRouter.get('/details', async (c) => {
  try {
    const placeId = c.req.query('place_id');
    
    if (!placeId) {
      return c.json({
        success: false,
        error: 'Missing required parameter: place_id'
      }, 400);
    }

    // Check if API key is configured before making request
    const keyValidation = validateApiKey();
    if (!keyValidation.valid) {
      return c.json({
        success: false,
        error: 'Google Places API key is not configured or invalid',
        fallback_available: true,
        timestamp: new Date().toISOString()
      }, 503); // Service Unavailable
    }

    console.log('Places details request for place_id:', placeId);

    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'formatted_address,address_components,geometry,place_id'
    });

    const data = await makeGooglePlacesRequest('/details/json', params);
    
    console.log('Places details response:', {
      status: data.status,
      has_result: !!data.result
    });

    return c.json({
      success: true,
      result: data.result || null,
      status: data.status
    });

  } catch (error) {
    console.error('Places details error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if this is an API key related error
    const isApiKeyError = errorMessage.includes('API key') || 
                         errorMessage.includes('REQUEST_DENIED') || 
                         errorMessage.includes('invalid') ||
                         errorMessage.includes('denied');
    
    return c.json({
      success: false,
      error: isApiKeyError 
        ? 'Google Places API key is invalid or not properly configured'
        : errorMessage,
      fallback_available: true,
      api_key_error: isApiKeyError,
      timestamp: new Date().toISOString()
    }, isApiKeyError ? 403 : 500);
  }
});

// Error handler
placesRouter.onError((err, c) => {
  console.error('Places service error:', err);
  return c.json({
    success: false,
    error: {
      code: 'PLACES_SERVICE_ERROR',
      message: err.message || 'Places service error occurred'
    },
    timestamp: new Date().toISOString()
  }, 500);
});

console.log('✅ Places service router configured with Google Places API integration');

export default placesRouter;