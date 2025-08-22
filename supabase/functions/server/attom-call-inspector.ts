import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';

const attomCallInspector = new Hono();

// Enable CORS
attomCallInspector.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
}));

// Health check endpoint
attomCallInspector.get('/health', (c) => {
  console.log('🏥 ATTOM Call Inspector health check requested');
  
  try {
    const apiKey = Deno.env.get('ATTOM_API_KEY');
    
    const healthResponse = {
      success: true,
      status: 'healthy',
      service: 'attom-call-inspector',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: [
        'GET /health',
        'POST /inspect',
        'POST /test-endpoints',
        'GET /endpoints'
      ],
      environment: {
        attom_api_key: !!apiKey
      }
    };
    
    console.log('🏥 ATTOM Call Inspector health check response:', JSON.stringify(healthResponse));
    return c.json(healthResponse);
  } catch (error) {
    console.error('ATTOM Call Inspector health check error:', error);
    return c.json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Test endpoint
attomCallInspector.get('/test', (c) => {
  return c.json({
    success: true,
    message: 'ATTOM Call Inspector test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Inspect endpoint for analyzing ATTOM API calls
attomCallInspector.post('/inspect', async (c) => {
  try {
    console.log('🔍 ATTOM Call inspection request received');
    
    const requestBody = await c.req.json().catch(() => ({}));
    const { endpoint, parameters, headers } = requestBody;
    
    console.log('📊 Inspection parameters:', { endpoint, parameters, headers });

    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    if (!attomApiKey) {
      console.error('❌ ATTOM_API_KEY environment variable not set');
      return c.json({
        success: false,
        error: 'ATTOM API key not configured. Please set up your ATTOM API key.',
        timestamp: new Date().toISOString()
      }, 500);
    }

    // Default to property basic profile if no endpoint specified
    const targetEndpoint = endpoint || 'property/basicprofile';
    const baseUrl = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';
    
    // Build API URL
    let apiUrl = `${baseUrl}/${targetEndpoint.replace(/^\//, '')}`;
    
    // Add parameters if provided
    if (parameters && typeof parameters === 'object') {
      const params = new URLSearchParams();
      Object.entries(parameters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      
      if (params.toString()) {
        apiUrl += '?' + params.toString();
      }
    }

    console.log('🌐 Making ATTOM API inspection request to:', apiUrl);

    // Prepare headers
    const requestHeaders = {
      'accept': 'application/json',
      'User-Agent': 'Handoff-RealEstate/1.0',
      'apikey': attomApiKey,
      ...headers
    };

    // Make request to ATTOM API
    try {
      const startTime = Date.now();
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: requestHeaders
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log('📡 ATTOM API inspection response status:', response.status);
      console.log('⏱️ Response time:', responseTime, 'ms');

      // Get response data
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      // Analyze the response
      const analysis = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime: responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        requestInfo: {
          url: apiUrl,
          headers: requestHeaders,
          method: 'GET'
        }
      };

      console.log('✅ ATTOM API inspection completed');

      return c.json({
        success: true,
        inspection: analysis,
        timestamp: new Date().toISOString()
      });
      
    } catch (fetchError) {
      console.error('❌ ATTOM API inspection fetch error:', fetchError);
      return c.json({
        success: false,
        error: 'Failed to connect to ATTOM API',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        requestInfo: {
          url: apiUrl,
          headers: requestHeaders,
          method: 'GET'
        },
        timestamp: new Date().toISOString()
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ ATTOM Call inspection error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Inspection failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Error handler
attomCallInspector.onError((err, c) => {
  console.error('ATTOM Call Inspector error:', err);
  return c.json({
    success: false,
    error: {
      code: 'ATTOM_CALL_INSPECTOR_ERROR',
      message: err.message || 'ATTOM Call Inspector error occurred'
    },
    timestamp: new Date().toISOString()
  }, 500);
});

console.log('✅ ATTOM Call Inspector router configured');

export default attomCallInspector;