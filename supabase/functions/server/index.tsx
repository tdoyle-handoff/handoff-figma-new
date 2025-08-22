import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';

// Import route modules
import userRoutes from './user.ts';
import attomRoutes from './attom.ts';
import placesRoutes from './places.ts';
import mlsRoutes from './mls.ts';
import attomAdminRoutes from './attom-admin.ts';
import attomKeyUpdaterRoutes from './attom-key-updater.ts';
import attomCallInspectorRoutes from './attom-call-inspector.ts';
import attomComprehensiveRoutes from './attom-comprehensive.ts';
import attomOfficialPatternsRoutes from './attom-official-patterns.ts';
import propertyFieldMappingsRoutes from './property-field-mappings.ts';
import apiKeyManagerRoutes from './api-key-manager.ts';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
  exposeHeaders: ['*'],
  maxAge: 600,
  credentials: false,
}));

app.use('*', logger(console.log));

// Health check endpoint
app.get('/make-server-a24396d5/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount route modules
app.route('/make-server-a24396d5', userRoutes);
app.route('/make-server-a24396d5', attomRoutes);
app.route('/make-server-a24396d5', placesRoutes);
app.route('/make-server-a24396d5', mlsRoutes);
app.route('/make-server-a24396d5', attomAdminRoutes);
app.route('/make-server-a24396d5', attomKeyUpdaterRoutes);
app.route('/make-server-a24396d5', attomCallInspectorRoutes);
app.route('/make-server-a24396d5', attomComprehensiveRoutes);
app.route('/make-server-a24396d5', attomOfficialPatternsRoutes);
app.route('/make-server-a24396d5', propertyFieldMappingsRoutes);
app.route('/make-server-a24396d5', apiKeyManagerRoutes);

// Catch-all for unmatched routes
app.get('/make-server-a24396d5/*', (c) => {
  return c.json({ 
    error: 'Endpoint not found',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

app.post('/make-server-a24396d5/*', (c) => {
  return c.json({ 
    error: 'Endpoint not found',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: err.message
  }, 500);
});

// Start the server
Deno.serve(app.fetch);