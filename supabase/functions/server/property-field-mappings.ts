import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';

const propertyFieldMappings = new Hono();

// Apply CORS
propertyFieldMappings.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Field mapping types
interface FieldMapping {
  id: string;
  sourceEndpoint: string;
  sourcePath: string;
  targetField: string;
  displayName: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
  isEnabled: boolean;
  transformFunction?: string;
}

// Health check endpoint
propertyFieldMappings.get('/property-field-mappings/health', (c) => {
  console.log('Property field mappings health check');
  return c.json({
    success: true,
    service: 'property-field-mappings',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /property-field-mappings/health',
      'GET /property-field-mappings',
      'POST /property-field-mappings',
      'POST /property-field-mappings/test',
      'POST /property-field-mappings/endpoint-schema'
    ]
  });
});

// Get all field mappings
propertyFieldMappings.get('/property-field-mappings', async (c) => {
  try {
    console.log('Getting property field mappings');
    
    const mappings = await kv.get('property_field_mappings');
    
    return c.json({
      success: true,
      mappings: mappings || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting field mappings:', error);
    return c.json({
      success: false,
      error: 'Failed to get field mappings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Save field mappings
propertyFieldMappings.post('/property-field-mappings', async (c) => {
  try {
    console.log('Saving property field mappings');
    
    const { mappings } = await c.req.json();
    
    if (!Array.isArray(mappings)) {
      return c.json({
        success: false,
        error: 'Invalid mappings format - expected array'
      }, 400);
    }

    // Validate each mapping
    for (const mapping of mappings) {
      if (!mapping.id || !mapping.sourceEndpoint || !mapping.targetField) {
        return c.json({
          success: false,
          error: 'Invalid mapping - missing required fields'
        }, 400);
      }
    }

    await kv.set('property_field_mappings', mappings);
    
    return c.json({
      success: true,
      message: 'Field mappings saved successfully',
      count: mappings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving field mappings:', error);
    return c.json({
      success: false,
      error: 'Failed to save field mappings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test field mappings with a property address
propertyFieldMappings.post('/property-field-mappings/test', async (c) => {
  try {
    console.log('Testing property field mappings');
    
    const { address, mappings } = await c.req.json();
    
    if (!address || !Array.isArray(mappings)) {
      return c.json({
        success: false,
        error: 'Invalid request - address and mappings required'
      }, 400);
    }

    // Get ATTOM API key
    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    if (!attomApiKey) {
      return c.json({
        success: false,
        error: 'ATTOM API key not configured'
      }, 500);
    }

    // Parse address for API calls
    const addressParts = address.split(', ');
    const address1 = addressParts[0] || '';
    const address2 = addressParts.slice(1).join(', ') || '';

    if (!address1 || !address2) {
      return c.json({
        success: false,
        error: 'Invalid address format'
      }, 400);
    }

    // Fetch data from all required endpoints
    const endpointData: Record<string, any> = {};
    const uniqueEndpoints = [...new Set(mappings.map((m: FieldMapping) => m.sourceEndpoint))];

    for (const endpoint of uniqueEndpoints) {
      try {
        const endpointPath = getEndpointPath(endpoint);
        if (!endpointPath) continue;

        const url = new URL(`https://api.gateway.attomdata.com${endpointPath}`);
        url.searchParams.append('address1', address1);
        url.searchParams.append('address2', address2);

        const response = await fetch(url.toString(), {
          headers: {
            'accept': 'application/json',
            'apikey': attomApiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          endpointData[endpoint] = data;
        } else {
          console.warn(`Failed to fetch data from ${endpoint}: ${response.status}`);
        }
      } catch (error) {
        console.warn(`Error fetching from ${endpoint}:`, error);
      }
    }

    // Apply mappings to create mapped property data
    const mappedData: Record<string, any> = {};
    
    for (const mapping of mappings.filter((m: FieldMapping) => m.isEnabled)) {
      try {
        const sourceData = endpointData[mapping.sourceEndpoint];
        if (!sourceData) continue;

        const value = extractValueFromPath(sourceData, mapping.sourcePath);
        if (value !== undefined && value !== null) {
          let processedValue = value;

          // Apply data type conversion
          processedValue = convertDataType(processedValue, mapping.dataType);

          // Apply transform function if provided
          if (mapping.transformFunction) {
            try {
              const transformFn = new Function('value', `return ${mapping.transformFunction}`);
              processedValue = transformFn(processedValue);
            } catch (error) {
              console.warn(`Transform function failed for ${mapping.id}:`, error);
            }
          }

          setValueAtPath(mappedData, mapping.targetField, processedValue);
        }
      } catch (error) {
        console.warn(`Error applying mapping ${mapping.id}:`, error);
      }
    }

    return c.json({
      success: true,
      mappedData,
      sourceData: endpointData,
      appliedMappings: mappings.filter((m: FieldMapping) => m.isEnabled).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing field mappings:', error);
    return c.json({
      success: false,
      error: 'Failed to test field mappings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get endpoint schema (sample data and field structure)
propertyFieldMappings.post('/property-field-mappings/endpoint-schema', async (c) => {
  try {
    console.log('Getting endpoint schema');
    
    const { endpoint, sampleAddress } = await c.req.json();
    
    if (!endpoint || !sampleAddress) {
      return c.json({
        success: false,
        error: 'Endpoint and sampleAddress required'
      }, 400);
    }

    // Get ATTOM API key
    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    if (!attomApiKey) {
      return c.json({
        success: false,
        error: 'ATTOM API key not configured'
      }, 500);
    }

    const endpointPath = getEndpointPath(endpoint);
    if (!endpointPath) {
      return c.json({
        success: false,
        error: 'Unknown endpoint'
      }, 400);
    }

    // Parse address for API call
    const addressParts = sampleAddress.split(', ');
    const address1 = addressParts[0] || '';
    const address2 = addressParts.slice(1).join(', ') || '';

    if (!address1 || !address2) {
      return c.json({
        success: false,
        error: 'Invalid address format'
      }, 400);
    }

    const url = new URL(`https://api.gateway.attomdata.com${endpointPath}`);
    url.searchParams.append('address1', address1);
    url.searchParams.append('address2', address2);

    const response = await fetch(url.toString(), {
      headers: {
        'accept': 'application/json',
        'apikey': attomApiKey,
      },
    });

    if (!response.ok) {
      return c.json({
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`
      }, response.status);
    }

    const data = await response.json();

    return c.json({
      success: true,
      endpoint,
      sampleAddress,
      sampleData: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting endpoint schema:', error);
    return c.json({
      success: false,
      error: 'Failed to get endpoint schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Helper function to get endpoint path
function getEndpointPath(endpoint: string): string | null {
  const endpoints: Record<string, string> = {
    'basicprofile': '/propertyapi/v1.0.0/property/basicprofile',
    'detail': '/propertyapi/v1.0.0/property/detail',
    'saledetail': '/propertyapi/v1.0.0/sale/detail',
    'expandedprofile': '/propertyapi/v1.0.0/property/expandedprofile'
  };
  
  return endpoints[endpoint] || null;
}

// Helper function to extract value from nested object path
function extractValueFromPath(obj: any, path: string): any {
  if (!path || !obj) return undefined;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    
    // Handle array notation like "property[0]"
    if (key.includes('[') && key.includes(']')) {
      const arrayKey = key.substring(0, key.indexOf('['));
      const indexStr = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
      const index = parseInt(indexStr, 10);
      
      if (current[arrayKey] && Array.isArray(current[arrayKey]) && current[arrayKey][index] !== undefined) {
        current = current[arrayKey][index];
      } else {
        return undefined;
      }
    } else {
      current = current[key];
    }
  }
  
  return current;
}

// Helper function to set value at nested object path
function setValueAtPath(obj: any, path: string, value: any): void {
  if (!path) return;
  
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Helper function to convert data types
function convertDataType(value: any, dataType: string): any {
  switch (dataType) {
    case 'string':
      return String(value);
    case 'number':
      const num = Number(value);
      return isNaN(num) ? value : num;
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    case 'date':
      if (value instanceof Date) return value;
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    case 'array':
      return Array.isArray(value) ? value : [value];
    default:
      return value;
  }
}

// Error handler
propertyFieldMappings.onError((err, c) => {
  console.error('Property field mappings service error:', err);
  return c.json({
    success: false,
    error: {
      code: 'PROPERTY_FIELD_MAPPINGS_ERROR',
      message: err.message || 'Property field mappings service error occurred'
    },
    timestamp: new Date().toISOString()
  }, 500);
});

console.log('✅ Property field mappings service router configured');

export default propertyFieldMappings;