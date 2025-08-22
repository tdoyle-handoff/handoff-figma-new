import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { ATTOM_API_KEY } from './shared/attom_config.ts';

const attomKeyUpdater = new Hono();

// Enable CORS
attomKeyUpdater.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Test if current API key works
attomKeyUpdater.get('/test-current-key', async (c) => {
  try {
    const apiKey = ATTOM_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'No ATTOM_API_KEY environment variable found',
        hasKey: false,
        keyLength: 0
      });
    }

    // Test the key with ATTOM API using official header-based authentication
    const testUrl = new URL('https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile');
    testUrl.searchParams.append('address1', '586 Franklin Ave');
    testUrl.searchParams.append('address2', 'Brooklyn, NY 11238');

    const response = await fetch(testUrl.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'apikey': apiKey,
        'User-Agent': 'Handoff-RealEstate/1.0'
      }
    });

    const responseData = await response.text();
    
    return c.json({
      success: response.ok,
      hasKey: true,
      keyLength: apiKey.length,
      keyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      testResult: {
        status: response.status,
        statusText: response.statusText,
        responsePreview: responseData.substring(0, 200)
      },
      message: response.ok 
        ? 'Current API key is working correctly'
        : `Current API key failed with status ${response.status}`
    });

  } catch (error) {
    return c.json({
      success: false,
      error: `Error testing API key: ${error.message}`,
      hasKey: !!Deno.env.get('ATTOM_API_KEY')
    }, 500);
  }
});

// Test a new API key without setting it
attomKeyUpdater.post('/test-new-key', async (c) => {
  try {
    const { apiKey } = await c.req.json();
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'API key is required'
      }, 400);
    }

    // Validate key format
    if (apiKey.length < 20 || apiKey.length > 100) {
      return c.json({
        success: false,
        error: `API key length (${apiKey.length}) seems invalid. Expected 20-100 characters.`,
        keyLength: apiKey.length
      }, 400);
    }

    // Test the key with ATTOM API using official header-based authentication
    const testUrl = new URL('https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile');
    testUrl.searchParams.append('address1', '586 Franklin Ave');
    testUrl.searchParams.append('address2', 'Brooklyn, NY 11238');

    console.log('Testing new API key with ATTOM API using official header format...');
    
    const response = await fetch(testUrl.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'apikey': apiKey,
        'User-Agent': 'Handoff-RealEstate/1.0'
      }
    });

    const responseData = await response.text();
    console.log('ATTOM API test response:', {
      status: response.status,
      statusText: response.statusText,
      responseLength: responseData.length
    });

    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch (parseError) {
      console.error('Failed to parse ATTOM response:', parseError);
    }

    return c.json({
      success: response.ok,
      keyLength: apiKey.length,
      keyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      testResult: {
        status: response.status,
        statusText: response.statusText,
        hasData: !!(parsedData?.property?.length > 0),
        responsePreview: responseData.substring(0, 300),
        parsedStatus: parsedData?.status || null
      },
      message: response.ok 
        ? '✅ New API key is working correctly! Ready to use.'
        : `❌ New API key failed with status ${response.status}`,
      recommendation: response.ok 
        ? 'This API key is working. You can use it to replace your current key.'
        : response.status === 401
          ? 'API key authentication failed. Check that the key is correct and active.'
          : response.status === 403
            ? 'API key is valid but lacks permissions for this endpoint. Check your subscription.'
            : 'API key test failed. Please verify the key and try again.'
    });

  } catch (error) {
    console.error('Error testing new API key:', error);
    return c.json({
      success: false,
      error: `Error testing API key: ${error.message}`
    }, 500);
  }
});

// Get API key information (without exposing the actual key)
attomKeyUpdater.get('/key-info', async (c) => {
  try {
    const apiKey = Deno.env.get('ATTOM_API_KEY');
    
    return c.json({
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPreview: apiKey 
        ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
        : null,
      estimatedTier: apiKey 
        ? apiKey.length >= 40 ? 'Enterprise' 
          : apiKey.length >= 35 ? 'Premium'
          : apiKey.length >= 30 ? 'Enhanced'
          : 'Basic'
        : null,
      lastTested: new Date().toISOString()
    });

  } catch (error) {
    return c.json({
      hasKey: false,
      error: `Error getting key info: ${error.message}`
    }, 500);
  }
});

// Instructions for updating the environment variable
attomKeyUpdater.get('/update-instructions', async (c) => {
  return c.json({
    instructions: {
      step1: "Test your new API key using the /test-new-key endpoint",
      step2: "Once confirmed working, contact your system administrator",
      step3: "Have them update the ATTOM_API_KEY environment variable",
      step4: "Restart the application/server for changes to take effect",
      step5: "Use /test-current-key to verify the update worked"
    },
    security_note: "Never expose API keys in client-side code or logs",
    environment_variable: "ATTOM_API_KEY",
    current_status: {
      has_key: !!Deno.env.get('ATTOM_API_KEY'),
      key_length: Deno.env.get('ATTOM_API_KEY')?.length || 0
    }
  });
});

export default attomKeyUpdater;