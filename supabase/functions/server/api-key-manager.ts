import { Hono } from 'npm:hono';

const app = new Hono();

// Check API key status endpoint
app.get('/api-key-status', async (c) => {
  try {
    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    const googlePlacesApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    const maskApiKey = (key: string | undefined): string => {
      if (!key) return '';
      if (key.length <= 8) return '••••••••';
      return key.substring(0, 4) + '••••••••••••' + key.substring(key.length - 4);
    };

    const status = {
      ATTOM_API_KEY: {
        configured: !!attomApiKey,
        masked: maskApiKey(attomApiKey),
        error: attomApiKey ? null : 'API key not configured'
      },
      GOOGLE_PLACES_API_KEY: {
        configured: !!googlePlacesApiKey,
        masked: maskApiKey(googlePlacesApiKey),
        error: googlePlacesApiKey ? null : 'API key not configured'
      }
    };

    return c.json(status);
  } catch (error) {
    console.error('Error checking API key status:', error);
    return c.json({ error: 'Failed to check API key status' }, 500);
  }
});

// Test ATTOM API endpoint
app.post('/test-attom-api', async (c) => {
  try {
    const { address } = await c.req.json();
    const apiKey = Deno.env.get('ATTOM_API_KEY');

    if (!apiKey) {
      return c.json({
        success: false,
        error: 'ATTOM API key not configured'
      }, 400);
    }

    // Test with ATTOM property search endpoint
    const searchUrl = new URL('https://search.onboard-apis.com/propertyapi/v1.0.0/property/address');
    searchUrl.searchParams.set('address1', address);

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'apikey': apiKey,
      },
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = { rawResponse: responseText };
    }

    if (response.ok) {
      return c.json({
        success: true,
        message: 'ATTOM API test successful',
        response: responseData,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      });
    } else {
      let errorMessage = 'ATTOM API test failed';
      
      if (response.status === 401) {
        errorMessage = 'Unauthorized: API key is invalid or expired';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: API key lacks required permissions';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded: Too many requests';
      } else if (responseData?.Response?.status?.msg) {
        errorMessage = `ATTOM API Error: ${responseData.Response.status.msg}`;
      }

      return c.json({
        success: false,
        error: errorMessage,
        response: responseData,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      }, response.status);
    }
  } catch (error) {
    console.error('Error testing ATTOM API:', error);
    return c.json({
      success: false,
      error: `Network error: ${error.message}`
    }, 500);
  }
});

// Test Google Places API endpoint
app.post('/test-places-api', async (c) => {
  try {
    const { query } = await c.req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Google Places API key not configured'
      }, 400);
    }

    // Test with Google Places Autocomplete API
    const placesUrl = 'https://places.googleapis.com/v1/places:autocomplete';
    
    const requestBody = {
      input: query,
      includedPrimaryTypes: ['address'],
      languageCode: 'en'
    };

    const response = await fetch(placesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = { rawResponse: responseText };
    }

    if (response.ok) {
      return c.json({
        success: true,
        message: 'Google Places API test successful',
        response: responseData,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      });
    } else {
      let errorMessage = 'Google Places API test failed';
      
      if (response.status === 401) {
        errorMessage = 'Unauthorized: API key is invalid';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: API key lacks required permissions or billing not set up';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded: Too many requests';
      } else if (responseData?.error?.message) {
        errorMessage = `Google Places API Error: ${responseData.error.message}`;
      } else if (responseData?.error?.status) {
        errorMessage = `Google Places API Error: ${responseData.error.status}`;
      }

      return c.json({
        success: false,
        error: errorMessage,
        response: responseData,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      }, response.status);
    }
  } catch (error) {
    console.error('Error testing Google Places API:', error);
    return c.json({
      success: false,
      error: `Network error: ${error.message}`
    }, 500);
  }
});

// Comprehensive API diagnostics endpoint
app.get('/api-diagnostics', async (c) => {
  try {
    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    const googlePlacesApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    const diagnostics = {
      environment: {
        hasAttomKey: !!attomApiKey,
        hasGoogleKey: !!googlePlacesApiKey,
        attomKeyLength: attomApiKey?.length || 0,
        googleKeyLength: googlePlacesApiKey?.length || 0
      },
      recommendations: []
    };

    // Add recommendations based on current state
    if (!attomApiKey) {
      diagnostics.recommendations.push({
        type: 'error',
        api: 'ATTOM',
        message: 'ATTOM API key is not configured. Add ATTOM_API_KEY to environment variables.',
        action: 'Visit https://developer.attomdata.com/ to get an API key'
      });
    }

    if (!googlePlacesApiKey) {
      diagnostics.recommendations.push({
        type: 'error',
        api: 'Google Places',
        message: 'Google Places API key is not configured. Add GOOGLE_PLACES_API_KEY to environment variables.',
        action: 'Visit https://console.cloud.google.com/ to get an API key'
      });
    }

    if (attomApiKey && attomApiKey.length < 20) {
      diagnostics.recommendations.push({
        type: 'warning',
        api: 'ATTOM',
        message: 'ATTOM API key appears to be too short. Verify the key is complete.',
        action: 'Check your ATTOM developer account for the full API key'
      });
    }

    if (googlePlacesApiKey && googlePlacesApiKey.length < 30) {
      diagnostics.recommendations.push({
        type: 'warning',
        api: 'Google Places',
        message: 'Google Places API key appears to be too short. Verify the key is complete.',
        action: 'Check your Google Cloud Console for the full API key'
      });
    }

    return c.json(diagnostics);
  } catch (error) {
    console.error('Error running API diagnostics:', error);
    return c.json({ error: 'Failed to run API diagnostics' }, 500);
  }
});

export default app;