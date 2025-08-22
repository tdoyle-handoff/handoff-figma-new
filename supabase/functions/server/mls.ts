import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';

const mls = new Hono();

// Enable CORS
mls.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Health check endpoint
mls.get('/health', (c) => {
  console.log('🏥 MLS service health check requested');
  
  const healthResponse = {
    success: true,
    status: 'healthy',
    service: 'mls',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /test'
    ],
    environment: {
      mls_api_key: !!Deno.env.get('MLS_API_KEY'),
      mls_api_base_url: !!Deno.env.get('MLS_API_BASE_URL')
    }
  };
  
  console.log('🏥 MLS health check response:', JSON.stringify(healthResponse));
  return c.json(healthResponse);
});

// Test endpoint
mls.get('/test', (c) => {
  return c.json({
    success: true,
    message: 'MLS service test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Error handler
mls.onError((err, c) => {
  console.error('MLS service error:', err);
  return c.json({
    success: false,
    error: {
      code: 'MLS_SERVICE_ERROR',
      message: err.message || 'MLS service error occurred'
    },
    timestamp: new Date().toISOString()
  }, 500);
});

console.log('✅ MLS service router configured');

export default mls;