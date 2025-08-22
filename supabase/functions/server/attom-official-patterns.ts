import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { ATTOM_API_KEY, ATTOM_BASE_URL } from './shared/attom_config.ts';

const attomOfficial = new Hono();

// Enable CORS
attomOfficial.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Official ATTOM API request pattern based on their Java sample code
interface AttomAPIConfig {
  apiKey: string;
  baseUrl: string;
}

// Get ATTOM API configuration following official patterns
function getOfficialAttomConfig(): AttomAPIConfig {
  const apiKey = ATTOM_API_KEY;
  const baseUrl = ATTOM_BASE_URL;
  return { apiKey, baseUrl };
}

// Official ATTOM API request pattern
async function makeOfficialAttomRequest(
  endpoint: string, 
  params: Record<string, string | number | boolean>
): Promise<any> {
  const { apiKey, baseUrl } = getOfficialAttomConfig();
  
  // Clean and prepare parameters following ATTOM's official patterns
  const cleanParams: Record<string, string> = {};
  
  // Process parameters according to ATTOM documentation
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = String(value);
    }
  });
  
  // Note: API key will be passed in headers per official ATTOM documentation
  // Do NOT add apikey to query parameters - use headers instead
  
  // Optional: Add debug parameter to get all fields including null ones
  if (!cleanParams['debug']) {
    cleanParams['debug'] = 'True';  // Ensures all fields are returned, including null fields
  }
  
  // Construct URL with query parameters (official ATTOM format)
  // Note: API key is NOT included in query parameters per official documentation
  const url = new URL(`${baseUrl}${endpoint}`);
  Object.entries(cleanParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Create safe URL for logging
  const safeUrl = url.toString();
  console.log('Official ATTOM API Request:', {
    endpoint,
    method: 'GET',
    url: safeUrl,
    parameters: cleanParams,
    headers: { accept: 'application/json', apikey: '[HIDDEN_API_KEY]' }
  });
  
  try {
    // Make the request using official ATTOM patterns with header-based authentication
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'apikey': apiKey,
        'User-Agent': 'Handoff-RealEstate/1.0',
      },
    });
    
    // Log response details for debugging
    console.log('ATTOM API Response Status:', response.status);
    console.log('ATTOM API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    // Get response text for parsing
    const responseText = await response.text();
    console.log('ATTOM API Response (first 500 chars):', responseText.substring(0, 500));
    
    // Handle different response scenarios
    if (!response.ok) {
      console.error('ATTOM API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.substring(0, 1000),
        requestUrl: safeUrl
      });
      
      // Provide specific error messages based on HTTP status codes
      let errorMessage = responseText;
      
      switch (response.status) {
        case 401:
          errorMessage = `Authentication failed. Please verify your ATTOM API key is correct and active. Status: ${response.status}`;
          break;
        case 403:
          errorMessage = `Access forbidden. Your API key is valid but your subscription does not include access to this endpoint (${endpoint}). Please upgrade your ATTOM Data subscription or contact ATTOM support.`;
          break;
        case 404:
          errorMessage = `Endpoint not found (${endpoint}). This may indicate an incorrect endpoint URL or the property is not in the ATTOM database.`;
          break;
        case 400:
          // Try to parse error response for more details
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.status?.msg === 'SuccessWithoutResult') {
              // This is actually a successful query with no data found
              console.log('ATTOM API: SuccessWithoutResult - Property not found in database');
              return {
                success: true,
                data: { property: [] },
                message: 'Property not found in ATTOM database',
                status: errorData.status
              };
            } else if (errorData.status?.msg === 'No rule matched') {
              console.log('ATTOM API: No rule matched - Address format may be incorrect');
              return {
                success: false,
                error: 'Address format not recognized by ATTOM API. Please verify the address format.',
                status: errorData.status
              };
            } else {
              errorMessage = errorData.status?.msg || errorData.message || 'Bad request - please check your parameters';
            }
          } catch (parseError) {
            errorMessage = 'Bad request - please check your address parameters and format';
          }
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please wait before making additional requests.';
          break;
        case 500:
          errorMessage = 'ATTOM API server error. Please try again later.';
          break;
        default:
          errorMessage = `ATTOM API error: ${responseText || 'Unknown error'}`;
      }
      
      throw new Error(`ATTOM API error (${response.status}): ${errorMessage}`);
    }
    
    // Parse JSON response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse ATTOM API JSON response:', parseError);
      console.error('Raw response text:', responseText);
      throw new Error(`ATTOM API returned invalid JSON: ${parseError.message}`);
    }
    
    // Handle ATTOM API status codes (embedded in response)
    if (responseData.status) {
      console.log('ATTOM API Status:', responseData.status);
      
      if (responseData.status.code === 0) {
        console.log('ATTOM API request completed successfully');
      } else {
        // Handle specific ATTOM status messages
        if (responseData.status.msg === 'SuccessWithoutResult') {
          console.log('ATTOM API: SuccessWithoutResult - No data available for this property');
          return {
            success: true,
            data: { property: [] },
            message: 'Property found but no detailed data available',
            status: responseData.status
          };
        } else if (responseData.status.msg === 'No rule matched') {
          console.log('ATTOM API: No rule matched - Address validation failed');
          return {
            success: false,
            error: 'Address format not recognized or property not found',
            message: responseData.status.msg,
            status: responseData.status
          };
        } else {
          console.error('ATTOM API returned error status:', responseData.status);
          throw new Error(`ATTOM API status error: ${responseData.status.msg} (Code: ${responseData.status.code})`);
        }
      }
    }
    
    console.log('ATTOM API request successful - data available');
    return {
      success: true,
      data: responseData,
      status: responseData.status
    };
    
  } catch (fetchError) {
    console.error('Network error calling ATTOM API:', fetchError);
    throw new Error(`Network error calling ATTOM API: ${fetchError.message}`);
  }
}

// Official property search endpoint following ATTOM documentation
attomOfficial.post('/property/search', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Official ATTOM property search request:', body);
    
    // Validate required parameters
    if (!body.address1 && !body.address2) {
      return c.json({
        success: false,
        error: 'Either address1 or address2 is required for property search'
      }, 400);
    }
    
    // Prepare search parameters according to ATTOM documentation
    const searchParams: Record<string, string> = {};
    
    if (body.address1) {
      searchParams['address1'] = body.address1;
    }
    
    if (body.address2) {
      searchParams['address2'] = body.address2;
    }
    
    // Add optional parameters if provided
    if (body.geoid) {
      searchParams['geoid'] = body.geoid;
    }
    
    if (body.oneline) {
      searchParams['oneline'] = body.oneline;
    }
    
    // Make the official ATTOM API request
    const result = await makeOfficialAttomRequest('/property/basicprofile', searchParams);
    
    if (result.success) {
      console.log('Property search successful');
      return c.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('Property search failed:', result.error);
      return c.json({
        success: false,
        error: result.error,
        message: result.message,
        timestamp: new Date().toISOString()
      }, 400);
    }
    
  } catch (error) {
    console.error('Error in official property search:', error);
    return c.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Official property detail endpoint
attomOfficial.post('/property/detail', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Official ATTOM property detail request:', body);
    
    // Validate required parameters
    if (!body.address1 && !body.address2) {
      return c.json({
        success: false,
        error: 'Either address1 or address2 is required for property detail'
      }, 400);
    }
    
    // Prepare detail parameters
    const detailParams: Record<string, string> = {};
    
    if (body.address1) {
      detailParams['address1'] = body.address1;
    }
    
    if (body.address2) {
      detailParams['address2'] = body.address2;
    }
    
    // Make the official ATTOM API request for detailed data
    const result = await makeOfficialAttomRequest('/property/detail', detailParams);
    
    if (result.success) {
      console.log('Property detail request successful');
      return c.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('Property detail request failed:', result.error);
      return c.json({
        success: false,
        error: result.error,
        message: result.message,
        timestamp: new Date().toISOString()
      }, 400);
    }
    
  } catch (error) {
    console.error('Error in official property detail:', error);
    return c.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Test endpoint to validate API key and connection
attomOfficial.get('/test-connection', async (c) => {
  try {
    console.log('Testing ATTOM API connection with official patterns...');
    
    // Use a known working address from ATTOM documentation
    const testParams = {
      address1: '586 Franklin Ave',
      address2: 'Brooklyn, NY 11238'
    };
    
    const result = await makeOfficialAttomRequest('/property/basicprofile', testParams);
    
    return c.json({
      success: true,
      message: 'ATTOM API connection test successful',
      testAddress: `${testParams.address1}, ${testParams.address2}`,
      hasData: !!(result.data?.property?.length > 0),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('ATTOM API connection test failed:', error);
    return c.json({
      success: false,
      error: error.message,
      message: 'ATTOM API connection test failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Diagnostic endpoint for troubleshooting API issues
attomOfficial.post('/diagnose', async (c) => {
  try {
    const body = await c.req.json();
    const { address1, address2 } = body;
    
    console.log('Running ATTOM API diagnostic...');
    
    const diagnosticResults = {
      apiKeyStatus: 'unknown',
      endpointAccess: {},
      addressValidation: 'unknown',
      dataAvailability: 'unknown',
      recommendations: []
    };
    
    // Test 1: API Key validation
    try {
      const apiKey = Deno.env.get('ATTOM_API_KEY');
      if (!apiKey) {
        diagnosticResults.apiKeyStatus = 'missing';
        diagnosticResults.recommendations.push('Set ATTOM_API_KEY environment variable');
      } else if (apiKey.length < 10) {
        diagnosticResults.apiKeyStatus = 'invalid_format';
        diagnosticResults.recommendations.push('Check ATTOM API key format - it should be longer');
      } else {
        diagnosticResults.apiKeyStatus = 'present';
      }
    } catch (error) {
      diagnosticResults.apiKeyStatus = 'error';
      diagnosticResults.recommendations.push(`API key check failed: ${error.message}`);
    }
    
    // Test 2: Basic endpoint access
    const testEndpoints = [
      '/property/basicprofile',
      '/property/detail',
      '/property/expandedprofile'
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        const testResult = await makeOfficialAttomRequest(endpoint, { address1: '123 Main St', address2: 'Anytown, CA' });
        diagnosticResults.endpointAccess[endpoint] = {
          accessible: true,
          hasData: !!(testResult.data?.property?.length > 0)
        };
      } catch (error) {
        diagnosticResults.endpointAccess[endpoint] = {
          accessible: false,
          error: error.message
        };
        
        if (error.message.includes('403')) {
          diagnosticResults.recommendations.push(`Upgrade subscription to access ${endpoint}`);
        } else if (error.message.includes('401')) {
          diagnosticResults.recommendations.push('Check API key validity - authentication failed');
        }
      }
    }
    
    // Test 3: Address validation with provided address
    if (address1 || address2) {
      try {
        const addressResult = await makeOfficialAttomRequest('/property/basicprofile', { address1, address2 });
        diagnosticResults.addressValidation = 'valid';
        diagnosticResults.dataAvailability = addressResult.data?.property?.length > 0 ? 'available' : 'none';
      } catch (error) {
        diagnosticResults.addressValidation = 'invalid';
        diagnosticResults.recommendations.push(`Address validation failed: ${error.message}`);
      }
    }
    
    return c.json({
      success: true,
      diagnostic: diagnosticResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error running diagnostic:', error);
    return c.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default attomOfficial;