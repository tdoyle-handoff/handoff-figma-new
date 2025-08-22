import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { ATTOM_API_KEY } from './shared/attom_config.ts';

const attom = new Hono();

// Enable CORS
attom.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Health check endpoint
attom.get('/health', (c) => {
  console.log('🏥 ATTOM service health check requested');
  
  const healthResponse = {
    success: true,
    status: 'healthy',
    service: 'attom',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /test',
      'GET /property-basic-profile',
      'GET /search-by-address',
      'GET /debug'
    ],
    environment: {
      attom_api_key: !!Deno.env.get('ATTOM_API_KEY')
    }
  };
  
  console.log('🏥 ATTOM health check response:', JSON.stringify(healthResponse));
  return c.json(healthResponse);
});

// Test endpoint
attom.get('/test', (c) => {
  return c.json({
    success: true,
    message: 'ATTOM service test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Basic property profile endpoint
attom.get('/property-basic-profile', async (c) => {
  try {
    console.log('🏠 Property basic profile request received');
    
    const url = c.req.url;
    const urlObj = new URL(url);
    const address1 = urlObj.searchParams.get('address1');
    const address2 = urlObj.searchParams.get('address2');
    const attomid = urlObj.searchParams.get('attomid');
    const debug = urlObj.searchParams.get('debug') === 'True';
    
    console.log('📊 Request parameters:', { address1, address2, attomid, debug });

    if (!address1 && !attomid) {
      return c.json({
        success: false,
        error: 'Either address1 or attomid parameter is required',
        timestamp: new Date().toISOString()
      }, 400);
    }

    const attomApiKey = ATTOM_API_KEY;

    // Build API URL
    let apiUrl = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile';
    const params = new URLSearchParams();
    
    if (attomid) {
      params.append('attomid', attomid);
    } else if (address1) {
      params.append('address1', address1);
      if (address2) {
        params.append('address2', address2);
      }
    }
    
    if (params.toString()) {
      apiUrl += '?' + params.toString();
    }

    console.log('🌐 Making ATTOM API request to:', apiUrl);

    // Make request to ATTOM API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'User-Agent': 'Handoff-RealEstate/1.0',
        'apikey': attomApiKey
      }
    });

    console.log('📡 ATTOM API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ATTOM API error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 401) {
        return c.json({
          success: false,
          error: 'ATTOM API authentication failed. Please check your API key.',
          code: 'ATTOM_AUTH_FAILED',
          details: errorText,
          timestamp: new Date().toISOString()
        }, 401);
      } else if (response.status === 403) {
        return c.json({
          success: false,
          error: 'ATTOM API access forbidden. Please check your API key permissions.',
          code: 'ATTOM_ACCESS_FORBIDDEN',
          details: errorText,
          timestamp: new Date().toISOString()
        }, 403);
      } else if (response.status === 429) {
        return c.json({
          success: false,
          error: 'ATTOM API rate limit exceeded. Please try again later.',
          code: 'ATTOM_RATE_LIMIT',
          details: errorText,
          timestamp: new Date().toISOString()
        }, 429);
      } else {
        return c.json({
          success: false,
          error: `ATTOM API error: ${response.status} - ${errorText}`,
          code: 'ATTOM_API_ERROR',
          details: errorText,
          timestamp: new Date().toISOString()
        }, response.status);
      }
    }

    const data = await response.json();
    console.log('✅ ATTOM API response received successfully');
    
    if (debug) {
      console.log('🔍 Debug mode - Full response:', JSON.stringify(data, null, 2));
    }

    // Return the ATTOM API response directly
    return c.json(data);
    
  } catch (error) {
    console.error('❌ Property basic profile error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Property lookup failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Search by address endpoint - proxy to property-basic-profile
attom.get('/search-by-address', async (c) => {
  try {
    console.log('🔍 Search by address request received');
    
    const url = c.req.url;
    const urlObj = new URL(url);
    const address = urlObj.searchParams.get('address');
    const debug = urlObj.searchParams.get('debug') === 'true';
    
    console.log('📊 Search parameters:', { address, debug });

    if (!address) {
      return c.json({
        success: false,
        error: 'Address parameter is required',
        timestamp: new Date().toISOString()
      }, 400);
    }

    const attomApiKey = ATTOM_API_KEY;

    // Parse address into components
    const addressParts = address.split(',').map(part => part.trim());
    let address1 = addressParts[0] || '';
    let address2 = addressParts.slice(1).join(', ') || '';

    // Build API URL
    let apiUrl = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile';
    const params = new URLSearchParams();
    
    if (address1) {
      params.append('address1', address1);
      if (address2) {
        params.append('address2', address2);
      }
    }
    
    if (params.toString()) {
      apiUrl += '?' + params.toString();
    }

    console.log('🌐 Making ATTOM API search request to:', apiUrl);

    // Make request to ATTOM API with enhanced error handling
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'User-Agent': 'Handoff-RealEstate/1.0',
          'apikey': attomApiKey
        }
      });

      console.log('📡 ATTOM API search response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ATTOM API search error:', response.status, errorText);
        
        // Handle specific error cases
        if (response.status === 401) {
          return c.json({
            success: false,
            error: 'ATTOM API authentication failed. Please check your API key.',
            details: errorText,
            timestamp: new Date().toISOString()
          }, 401);
        } else if (response.status === 403) {
          return c.json({
            success: false,
            error: 'ATTOM API access forbidden. Please check your API key permissions.',
            details: errorText,
            timestamp: new Date().toISOString()
          }, 403);
        } else if (response.status === 429) {
          return c.json({
            success: false,
            error: 'ATTOM API rate limit exceeded. Please try again later.',
            details: errorText,
            timestamp: new Date().toISOString()
          }, 429);
        } else {
          return c.json({
            success: false,
            error: `ATTOM API error: ${response.status}`,
            details: errorText,
            timestamp: new Date().toISOString()
          }, response.status);
        }
      }

      const data = await response.json();
      console.log('✅ ATTOM API search response received successfully');
      
      if (debug) {
        console.log('🔍 Debug mode - Full search response:', JSON.stringify(data, null, 2));
      }

      // Return the ATTOM API response with success wrapper
      return c.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      });
      
    } catch (fetchError) {
      console.error('❌ ATTOM API fetch error:', fetchError);
      return c.json({
        success: false,
        error: 'Failed to connect to ATTOM API',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        timestamp: new Date().toISOString()
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ Search by address error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Debug endpoint for ATTOM API troubleshooting
attom.get('/debug', async (c) => {
  try {
    console.log('🔍 ATTOM debug endpoint requested');
    
    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    const hasApiKey = !!attomApiKey;
    const apiKeyLength = attomApiKey ? attomApiKey.length : 0;
    const maskedKey = attomApiKey ? `${attomApiKey.substring(0, 4)}...${attomApiKey.substring(attomApiKey.length - 4)}` : 'Not set';
    
    // Test basic API connectivity
    let connectionTest = null;
    try {
      const testResponse = await fetch('https://api.gateway.attomdata.com/health', {
        method: 'GET',
        headers: {
          'User-Agent': 'Handoff-RealEstate/1.0'
        }
      });
      connectionTest = {
        success: testResponse.ok,
        status: testResponse.status,
        accessible: true
      };
    } catch (error) {
      connectionTest = {
        success: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test ATTOM API with key if available
    let apiKeyTest = null;
    if (hasApiKey) {
      try {
        const apiTestResponse = await fetch('https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile?address1=6605+fawn+court&address2=gilbert%2C+az', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'User-Agent': 'Handoff-RealEstate/1.0',
            'apikey': attomApiKey
          }
        });
        
        const responseText = await apiTestResponse.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText.substring(0, 200) + '...';
        }
        
        apiKeyTest = {
          success: apiTestResponse.ok,
          status: apiTestResponse.status,
          statusText: apiTestResponse.statusText,
          headers: Object.fromEntries(apiTestResponse.headers.entries()),
          responsePreview: responseData
        };
      } catch (error) {
        apiKeyTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    const debugInfo = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        attom_api_key_present: hasApiKey,
        attom_api_key_length: apiKeyLength,
        attom_api_key_masked: maskedKey,
        deno_version: Deno.version.deno,
        node_env: Deno.env.get('NODE_ENV') || 'development'
      },
      connectivity: connectionTest,
      api_authentication: apiKeyTest,
      endpoints: {
        health: '/health',
        test: '/test',
        basic_profile: '/property-basic-profile',
        search: '/search-by-address',
        search_by_id: '/search-by-id',
        test_endpoint: '/test-endpoint',
        debug: '/debug'
      },
      sample_requests: {
        by_address: '/property-basic-profile?address1=6605+fawn+court&address2=gilbert%2C+az',
        by_attom_id: '/property-basic-profile?attomid=184713191',
        search: '/search-by-address?address=6605 Fawn Court, Gilbert, AZ'
      }
    };
    
    console.log('🔍 Debug info generated:', JSON.stringify(debugInfo, null, 2));
    
    return c.json(debugInfo);
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Proxy to test arbitrary ATTOM endpoints used by client summary component
attom.post('/test-endpoint', async (c) => {
  try {
    const body = await c.req.json();
    const { endpoint, address1, address2, attomid, params } = body || {};

    if (!endpoint || typeof endpoint !== 'string') {
      return c.json({ success: false, error: 'Missing or invalid endpoint' }, 400);
    }

    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    if (!attomApiKey) {
      return c.json({ success: false, error: 'ATTOM API key not configured on server' }, 500);
    }

    // Build target URL
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let apiUrl = `https://api.gateway.attomdata.com${normalizedEndpoint}`;
    const qs = new URLSearchParams();

    if (attomid) qs.append('attomid', String(attomid));
    if (address1) qs.append('address1', String(address1));
    if (address2) qs.append('address2', String(address2));

    // Pass-through any additional params
    if (params && typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) qs.append(k, String(v));
      }
    }

    if (qs.toString()) {
      apiUrl += `?${qs.toString()}`;
    }

    console.log('🔧 Testing ATTOM endpoint:', apiUrl);

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'User-Agent': 'Handoff-RealEstate/1.0',
        'apikey': attomApiKey
      }
    });

    const text = await resp.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text.slice(0, 500) + (text.length > 500 ? '...' : '') };
    }

    if (!resp.ok) {
      return c.json({ success: false, status: resp.status, statusText: resp.statusText, data }, resp.status);
    }

    return c.json(data);
  } catch (error) {
    console.error('❌ test-endpoint error:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Search by ATTOM ID - convenience wrapper
attom.get('/search-by-id', async (c) => {
  try {
    const urlObj = new URL(c.req.url);
    const attomId = urlObj.searchParams.get('attom_id') || urlObj.searchParams.get('attomid');
    if (!attomId) {
      return c.json({ success: false, error: 'attom_id (or attomid) is required' }, 400);
    }

    // Reuse property-basic-profile logic by calling ATTOM directly
    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    let apiUrl = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile?';
    apiUrl += new URLSearchParams({ attomid: attomId }).toString();

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'User-Agent': 'Handoff-RealEstate/1.0',
        'apikey': attomApiKey || ''
      }
    });

    const data = await resp.json();
    if (!resp.ok) {
      return c.json({ success: false, error: 'ATTOM error', status: resp.status, data }, resp.status);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ search-by-id error:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Error handler
attom.onError((err, c) => {
  console.error('ATTOM service error:', err);
  return c.json({
    success: false,
    error: {
      code: 'ATTOM_SERVICE_ERROR',
      message: err.message || 'ATTOM service error occurred'
    },
    timestamp: new Date().toISOString()
  }, 500);
});

console.log('✅ ATTOM service router configured');

export default attom;