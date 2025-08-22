import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';
import { ATTOM_API_KEY, ATTOM_BASE_URL } from './shared/attom_config.ts';

const attomComprehensive = new Hono();

// Enable CORS
attomComprehensive.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Get Attom API configuration
function getAttomConfig() {
  const apiKey = ATTOM_API_KEY;
  const baseUrl = ATTOM_BASE_URL;
  return { apiKey, baseUrl };
}

// Create standardized error response
function createErrorResponse(code: string, message: string, details?: any): any {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}

// Enhanced API call with better error handling and correct ATTOM API format
async function callAttomAPI(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const { apiKey, baseUrl } = getAttomConfig();
  
  // Clean parameters - remove empty or undefined values
  const cleanParams = Object.entries(params)
    .filter(([key, value]) => value !== undefined && value !== null && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {});
  
  // API key goes in headers per ATTOM documentation
  
  // Construct URL with query parameters (ATTOM API format)
  const url = new URL(`${baseUrl}${endpoint}`);
  Object.entries(cleanParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Create safe URL for logging
  const safeUrl = url.toString();
  console.log('Calling ATTOM API with official header format:', safeUrl);
  console.log('Request params:', cleanParams);
  console.log('Request headers:', { accept: 'application/json', apikey: 'HIDDEN_KEY' });
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'apikey': apiKey,
      'User-Agent': 'Handoff-Real-Estate/1.0'
    },
  });
  
  const responseText = await response.text();
  console.log('ATTOM API Response Status:', response.status);
  console.log('ATTOM API Response Headers:', Object.fromEntries(response.headers.entries()));
  console.log('ATTOM API Response (first 1000 chars):', responseText.substring(0, 1000));
  
  if (!response.ok) {
    console.error('ATTOM API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
      url: safeUrl
    });
    
    // Provide more specific error messages based on status codes
    let errorMessage = responseText;
    if (response.status === 401) {
      errorMessage = 'API key authentication failed. Check that ATTOM_API_KEY is correct and active.';
    } else if (response.status === 404) {
      errorMessage = 'API endpoint not found. This may indicate an incorrect endpoint URL or the property is not in the ATTOM database.';
    } else if (response.status === 400) {
      // Try to parse the error response for better messaging
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.status && errorData.status.msg === 'SuccessWithoutResult') {
          // This is actually a successful query with no results
          console.log('ATTOM API: SuccessWithoutResult (property not found in database)');
          return { property: [] };
        }
        errorMessage = errorData.status?.msg || errorData.message || responseText;
      } catch (parseError) {
        errorMessage = responseText || 'Bad request - check address parameters';
      }
    }
    
    throw new Error(`ATTOM API error (${response.status}): ${errorMessage}`);
  }
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('Failed to parse ATTOM API response:', parseError);
    console.error('Raw response:', responseText);
    throw new Error(`ATTOM API returned invalid JSON: ${parseError.message}`);
  }
  
  // Check for API-specific success/error conditions
  if (data.status) {
    if (data.status.code === 0) {
      // Success
      console.log('ATTOM API request successful');
    } else {
      // Handle different status codes
      if (data.status.msg === 'SuccessWithoutResult') {
        console.log('ATTOM API: SuccessWithoutResult (no data found for this property)');
        return { property: [] }; // Return empty results rather than throwing error
      } else {
        console.error('ATTOM API status error:', data.status);
        throw new Error(`ATTOM API status error: ${data.status.msg} (Code: ${data.status.code})`);
      }
    }
  }
  
  console.log('ATTOM API Response parsed successfully');
  return data;
}

// Property Expanded Detail endpoint
attomComprehensive.get('/property-expanded-detail', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    console.log('Property Expanded Detail request:', { attomId });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    const result = await callAttomAPI('/property/expandedprofile', { attomid: attomId });
    
    // Store successful result in KV store for caching
    if (result.property && result.property.length > 0) {
      const cacheKey = `attom_expanded_detail_${attomId}`;
      const cacheData = {
        attomId,
        response: result,
        timestamp: new Date().toISOString()
      };
      
      try {
        await kv.set(cacheKey, cacheData);
        console.log('Cached Attom Property Expanded Detail result');
      } catch (cacheError) {
        console.warn('Failed to cache Attom Property Expanded Detail result:', cacheError);
      }
    }
    
    console.log('Attom Property Expanded Detail request completed successfully');
    return c.json(result);
    
  } catch (error) {
    console.error('Property Expanded Detail endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// School District endpoint
attomComprehensive.get('/school-district', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    console.log('School District request:', { attomId });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    // Note: This endpoint may not exist in current Attom API
    // This is a placeholder for when school district data becomes available
    const result = await callAttomAPI('/school/district', { attomid: attomId });
    
    return c.json(result);
    
  } catch (error) {
    console.error('School District endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `School district data not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// Neighborhood Demographics endpoint
attomComprehensive.get('/neighborhood-demographics', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    console.log('Neighborhood Demographics request:', { attomId });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    // Note: This endpoint may need to be adjusted based on actual Attom API
    const result = await callAttomAPI('/neighborhood/demographics', { attomid: attomId });
    
    return c.json(result);
    
  } catch (error) {
    console.error('Neighborhood Demographics endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `Neighborhood demographics data not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// Risk Data endpoint
attomComprehensive.get('/risk-data', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    console.log('Risk Data request:', { attomId });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    // Note: This may need to be adjusted based on actual Attom API endpoints
    const result = await callAttomAPI('/risk/hazards', { attomid: attomId });
    
    return c.json(result);
    
  } catch (error) {
    console.error('Risk Data endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `Risk assessment data not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// Market Trends endpoint
attomComprehensive.get('/market-trends', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    console.log('Market Trends request:', { attomId });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    // Note: This may use sales history or market analysis endpoints
    const result = await callAttomAPI('/market/trends', { attomid: attomId });
    
    return c.json(result);
    
  } catch (error) {
    console.error('Market Trends endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `Market trends data not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// Environmental Hazards endpoint
attomComprehensive.get('/environmental-hazards', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    console.log('Environmental Hazards request:', { attomId });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    const result = await callAttomAPI('/environmental/hazards', { attomid: attomId });
    
    return c.json(result);
    
  } catch (error) {
    console.error('Environmental Hazards endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `Environmental data not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// Utility Data endpoint
attomComprehensive.get('/utility-data', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    console.log('Utility Data request:', { attomId });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    const result = await callAttomAPI('/utility/providers', { attomid: attomId });
    
    return c.json(result);
    
  } catch (error) {
    console.error('Utility Data endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `Utility data not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// Property Valuation endpoint (AVM)
attomComprehensive.get('/property-valuation', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    console.log('Property Valuation request:', { attomId });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    const result = await callAttomAPI('/avm/values', { attomid: attomId });
    
    return c.json(result);
    
  } catch (error) {
    console.error('Property Valuation endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `Valuation data not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// Comparable Sales endpoint
attomComprehensive.get('/comparable-sales', async (c) => {
  try {
    const attomId = c.req.query('attomid');
    const radius = c.req.query('radius') || '0.5';
    console.log('Comparable Sales request:', { attomId, radius });
    
    if (!attomId) {
      return c.json(createErrorResponse(
        'MISSING_ATTOM_ID',
        'attomid parameter is required'
      ), 400);
    }

    const result = await callAttomAPI('/property/comps', { 
      attomid: attomId, 
      radius: radius
    });
    
    return c.json(result);
    
  } catch (error) {
    console.error('Comparable Sales endpoint error:', error);
    return c.json(createErrorResponse(
      'SERVER_ERROR',
      `Comparable sales data not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    ), 500);
  }
});

// Enhanced search by address with multiple strategies for diagnostic purposes
attomComprehensive.post('/search-by-address', async (c) => {
  try {
    console.log('=== ATTOM Comprehensive Search By Address ===');
    
    const requestBody = await c.req.json();
    const { address, strategy, addressParams, addressFormat } = requestBody;
    
    if (!address) {
      return c.json({
        success: false,
        error: {
          code: 'MISSING_ADDRESS',
          message: 'Address parameter is required',
          details: { providedParams: Object.keys(requestBody) }
        },
        status: 400,
        timestamp: new Date().toISOString()
      }, 400);
    }

    const startTime = Date.now();
    
    // Define search strategies with their endpoints
    const strategies = {
      'sale-detail': '/sale/detail',
      'property-detail': '/property/detail',
      'property-basic': '/property/basicprofile', 
      'property-expanded': '/property/expandedprofile',
      'avm-details': '/avm/details',
      'sales-history': '/saleshistory/detail'
    };

    // Use provided strategy or default fallback
    const endpoint = strategies[strategy] || '/property/basicprofile';
    
    console.log(`Using search strategy: ${strategy || 'property-basic'} -> ${endpoint}`);
    console.log('Address format:', addressFormat);
    
    // Use provided address parameters or create default ATTOM format
    let searchParams = {};
    
    if (addressParams) {
      // Use the provided parameters (already formatted by client)
      searchParams = addressParams;
    } else {
      // Fallback: Parse address string into ATTOM standard format
      const addressParts = address.split(',').map(part => part.trim());
      
      if (addressParts.length >= 2) {
        const streetAddress = addressParts[0];
        const cityStateZip = addressParts.slice(1).join(' ');
        
        searchParams = {
          address1: streetAddress,
          address2: cityStateZip
        };
      } else {
        searchParams = { address1: address };
      }
    }

    console.log('Search parameters:', searchParams);

    try {
      const result = await callAttomAPI(endpoint, searchParams);
      const duration = Date.now() - startTime;
      
      console.log(`Search completed successfully in ${duration}ms`);
      
      return c.json({
        success: true,
        endpoint: `${strategy || 'property-basic'} (${address})`,
        duration,
        status: 200,
        data: result,
        searchParams,
        addressFormat,
        timestamp: new Date().toISOString()
      });
      
    } catch (apiError) {
      const duration = Date.now() - startTime;
      
      console.error('ATTOM API Error:', apiError.message);
      
      // Parse error details for better diagnostic information
      let errorDetails = {
        message: apiError.message,
        endpoint,
        searchParams,
        addressFormat,
        duration
      };

      // Extract status code and detailed error message from API error
      const statusMatch = apiError.message.match(/Attom API error: (\d+) - (.+)/);
      if (statusMatch) {
        const [, statusCode, errorBody] = statusMatch;
        errorDetails = {
          ...errorDetails,
          status: parseInt(statusCode),
          errorBody
        };
        
        try {
          const parsedError = JSON.parse(errorBody);
          errorDetails = { ...errorDetails, parsedError };
        } catch (parseError) {
          // Error body is not JSON, keep as string
        }
      }
      
      return c.json({
        success: false,
        endpoint: `${strategy || 'property-basic'} (${address})`,
        duration,
        status: errorDetails.status || 500,
        data: {
          error: errorDetails
        },
        error: `ATTOM API search failed for address: ${address}. Error: ${apiError.message}`,
        searchParams,
        addressFormat,
        timestamp: new Date().toISOString()
      }, 500);
    }
    
  } catch (error) {
    console.error('Search by address endpoint error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          errorType: error.constructor.name,
          timestamp: new Date().toISOString()
        }
      },
      status: 500,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Health check endpoint
attomComprehensive.get('/health', async (c) => {
  try {
    const { apiKey } = getAttomConfig();
    
    return c.json({
      status: 'healthy',
      service: 'attom-comprehensive-api',
      timestamp: new Date().toISOString(),
      api_key_configured: !!apiKey,
      endpoints: [
        '/property-expanded-detail',
        '/school-district',
        '/neighborhood-demographics',
        '/risk-data',
        '/market-trends',
        '/environmental-hazards',
        '/utility-data',
        '/property-valuation',
        '/comparable-sales',
        '/search-by-address',
        '/health'
      ]
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default attomComprehensive;