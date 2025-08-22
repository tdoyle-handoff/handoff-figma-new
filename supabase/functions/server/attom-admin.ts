import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Apply CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Address parsing utility for Attom API
function parseAddressForAttom(fullAddress: string) {
  // Simple address parsing for Attom API format
  // Expected format: "11 village st, deep river, ct"
  
  const parts = fullAddress.split(',').map(part => part.trim());
  
  if (parts.length < 2) {
    // If no commas, assume it's just the street address
    return {
      address1: fullAddress.trim(),
      address2: '',
      locality: '',
      countrySubd: '',
      postalCode: ''
    };
  }
  
  const streetAddress = parts[0] || '';
  let locality = '';
  let countrySubd = '';
  let postalCode = '';
  
  if (parts.length >= 2) {
    // Second part might be "City, State ZIP" or just "City"
    const cityStatePart = parts[1] || '';
    
    if (parts.length >= 3) {
      // Format: "Street, City, State ZIP"
      locality = cityStatePart;
      const stateZipPart = parts[2] || '';
      
      // Extract state and ZIP from "CA 90210" format
      const stateZipMatch = stateZipPart.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/);
      if (stateZipMatch) {
        countrySubd = stateZipMatch[1];
        postalCode = stateZipMatch[2] || '';
      } else {
        // Fallback: just use the whole part as state
        countrySubd = stateZipPart;
      }
    } else {
      // Format: "Street, City State ZIP"
      const cityStateMatch = cityStatePart.match(/^(.+?)\s+([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/);
      if (cityStateMatch) {
        locality = cityStateMatch[1];
        countrySubd = cityStateMatch[2];
        postalCode = cityStateMatch[3] || '';
      } else {
        // Fallback: just use as locality
        locality = cityStatePart;
      }
    }
  }
  
  return {
    address1: streetAddress,
    address2: '',
    locality: locality,
    countrySubd: countrySubd,
    postalCode: postalCode
  };
}

interface AttomEndpointConfig {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  category: string;
  requiredParams: AttomParameter[];
  optionalParams: AttomParameter[];
  responseFields: AttomResponseField[];
  isActive: boolean;
  showInPropertyDetails: boolean;
  displayOrder: number;
  lastTested?: string;
  testResult?: 'success' | 'error' | 'warning';
  created: string;
  modified: string;
}

interface AttomParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  example: string;
  validation?: string;
  defaultValue?: string;
}

interface AttomResponseField {
  name: string;
  path: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isRequired: boolean;
  mapping?: string;
  displayInPropertyDetails: boolean;
  displayName?: string;
}

interface ConfigurationSet {
  name: string;
  version: string;
  endpoints: AttomEndpointConfig[];
  created: string;
  description: string;
}

// Default configuration template
function getDefaultConfigurationTemplate(): ConfigurationSet {
  return {
    name: 'Handoff Default Configuration',
    version: '1.0.0',
    description: 'Default Attom API configuration for Handoff platform with all essential property data endpoints',
    created: new Date().toISOString(),
    endpoints: [
      {
        id: 'property_basic_profile',
        name: 'Property Basic Profile',
        endpoint: '/propertyapi/v1.0.0/property/basicprofile',
        method: 'GET',
        description: 'Get basic property information including address, lot size, building area, and ownership details',
        category: 'property-basic',
        displayOrder: 1,
        isActive: true,
        showInPropertyDetails: true,
        requiredParams: [
          {
            name: 'address1',
            type: 'string',
            description: 'Street address line 1 (street number and name)',
            example: '11 village st',
            validation: 'Required street number and name',
            format: 'street_number street_name'
          },
          {
            name: 'apikey',
            type: 'string',
            description: 'Attom API key for authentication',
            example: 'your_api_key_here',
            validation: 'Valid Attom API key required',
            defaultValue: 'from_environment'
          },
          {
            name: 'accept',
            type: 'string',
            description: 'Response format preference',
            example: 'application/json',
            validation: 'Must be application/json or application/xml',
            defaultValue: 'application/json'
          }
        ],
        optionalParams: [
          {
            name: 'address2',
            type: 'string',
            description: 'Street address line 2 (unit, apt, suite)',
            example: 'Apt 4B',
            format: ''
          },
          {
            name: 'locality',
            type: 'string',
            description: 'City name',
            example: 'deep river'
          },
          {
            name: 'countrySubd',
            type: 'string',
            description: 'State abbreviation',
            example: 'CT'
          },
          {
            name: 'postalCode',
            type: 'string',
            description: 'ZIP code',
            example: '06417'
          },

        ],
        responseFields: [
          {
            name: 'property_address',
            path: 'property[0].address',
            type: 'object',
            description: 'Complete property address information',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Property Address'
          },
          {
            name: 'lot_info',
            path: 'property[0].lot',
            type: 'object',
            description: 'Lot size and dimensions',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Lot Information'
          },
          {
            name: 'building_info',
            path: 'property[0].building',
            type: 'object',
            description: 'Building details and characteristics',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Building Information'
          },
          {
            name: 'owner_info',
            path: 'property[0].owner',
            type: 'object',
            description: 'Current property owner information',
            isRequired: false,
            displayInPropertyDetails: true,
            displayName: 'Owner Information'
          }
        ],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      {
        id: 'property_expanded_profile',
        name: 'Property Expanded Profile',
        endpoint: '/propertyapi/v1.0.0/property/expandedprofile',
        method: 'GET',
        description: 'Get comprehensive property information including detailed building characteristics, room counts, and features',
        category: 'property-expanded',
        displayOrder: 2,
        isActive: true,
        showInPropertyDetails: true,
        requiredParams: [
          {
            name: 'address',
            type: 'string',
            description: 'Full property address',
            example: '11 village st, deep river, ct'
          },
          {
            name: 'apikey',
            type: 'string',
            description: 'Attom API key for authentication',
            example: 'your_api_key_here',
            validation: 'Valid Attom API key required',
            defaultValue: 'from_environment'
          },
          {
            name: 'accept',
            type: 'string',
            description: 'Response format preference',
            example: 'application/json',
            validation: 'Must be application/json or application/xml',
            defaultValue: 'application/json'
          }
        ],
        optionalParams: [
          {
            name: 'debug',
            type: 'string',
            description: 'Include debug information in response',
            example: 'True',
            defaultValue: 'True'
          }
        ],
        responseFields: [
          {
            name: 'building_details',
            path: 'property[0].building',
            type: 'object',
            description: 'Detailed building information',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Building Details'
          },
          {
            name: 'room_information',
            path: 'property[0].building.rooms',
            type: 'object',
            description: 'Room counts and details',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Room Information'
          },
          {
            name: 'property_features',
            path: 'property[0].building.construction',
            type: 'object',
            description: 'Construction and feature details',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Property Features'
          }
        ],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      {
        id: 'school_data',
        name: 'School Information',
        endpoint: '/schoolapi/v1.0.0/school/detail',
        method: 'GET',
        description: 'Get school district and individual school information for a property address',
        category: 'school',
        displayOrder: 3,
        isActive: true,
        showInPropertyDetails: true,
        requiredParams: [
          {
            name: 'address',
            type: 'string',
            description: 'Full property address',
            example: '11 village st, deep river, ct'
          },
          {
            name: 'apikey',
            type: 'string',
            description: 'Attom API key for authentication',
            example: 'your_api_key_here',
            validation: 'Valid Attom API key required',
            defaultValue: 'from_environment'
          },
          {
            name: 'accept',
            type: 'string',
            description: 'Response format preference',
            example: 'application/json',
            validation: 'Must be application/json or application/xml',
            defaultValue: 'application/json'
          }
        ],
        optionalParams: [
          {
            name: 'debug',
            type: 'string',
            description: 'Include debug information in response',
            example: 'True',
            defaultValue: 'True'
          }
        ],
        responseFields: [
          {
            name: 'school_district',
            path: 'school[0].district',
            type: 'object',
            description: 'School district information',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'School District'
          },
          {
            name: 'schools',
            path: 'school[0].institution',
            type: 'array',
            description: 'List of schools serving this address',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Schools'
          }
        ],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      {
        id: 'neighborhood_data',
        name: 'Neighborhood Information',
        endpoint: '/neighborhoodapi/v1.0.0/neighborhood/detail',
        method: 'GET',
        description: 'Get neighborhood characteristics, demographics, and local amenities',
        category: 'neighborhood',
        displayOrder: 4,
        isActive: true,
        showInPropertyDetails: true,
        requiredParams: [
          {
            name: 'address',
            type: 'string',
            description: 'Full property address',
            example: '11 village st, deep river, ct'
          },
          {
            name: 'apikey',
            type: 'string',
            description: 'Attom API key for authentication',
            example: 'your_api_key_here',
            validation: 'Valid Attom API key required',
            defaultValue: 'from_environment'
          },
          {
            name: 'accept',
            type: 'string',
            description: 'Response format preference',
            example: 'application/json',
            validation: 'Must be application/json or application/xml',
            defaultValue: 'application/json'
          }
        ],
        optionalParams: [
          {
            name: 'debug',
            type: 'string',
            description: 'Include debug information in response',
            example: 'True',
            defaultValue: 'True'
          }
        ],
        responseFields: [
          {
            name: 'neighborhood_profile',
            path: 'neighborhood[0]',
            type: 'object',
            description: 'Complete neighborhood profile',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Neighborhood Profile'
          },
          {
            name: 'demographics',
            path: 'neighborhood[0].demographics',
            type: 'object',
            description: 'Population and demographic data',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Demographics'
          }
        ],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      {
        id: 'risk_assessment',
        name: 'Risk Assessment',
        endpoint: '/riskapi/v1.0.0/riskassessment/detail',
        method: 'GET',
        description: 'Get natural disaster risk assessments and environmental hazards',
        category: 'risk-assessment',
        displayOrder: 5,
        isActive: true,
        showInPropertyDetails: true,
        requiredParams: [
          {
            name: 'address',
            type: 'string',
            description: 'Full property address',
            example: '11 village st, deep river, ct'
          },
          {
            name: 'apikey',
            type: 'string',
            description: 'Attom API key for authentication',
            example: 'your_api_key_here',
            validation: 'Valid Attom API key required',
            defaultValue: 'from_environment'
          },
          {
            name: 'accept',
            type: 'string',
            description: 'Response format preference',
            example: 'application/json',
            validation: 'Must be application/json or application/xml',
            defaultValue: 'application/json'
          }
        ],
        optionalParams: [
          {
            name: 'debug',
            type: 'string',
            description: 'Include debug information in response',
            example: 'True',
            defaultValue: 'True'
          }
        ],
        responseFields: [
          {
            name: 'risk_profile',
            path: 'riskassessment[0]',
            type: 'object',
            description: 'Complete risk assessment',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Risk Profile'
          },
          {
            name: 'natural_hazards',
            path: 'riskassessment[0].natural',
            type: 'object',
            description: 'Natural disaster risks',
            isRequired: true,
            displayInPropertyDetails: true,
            displayName: 'Natural Hazards'
          }
        ],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    ]
  };
}

// Initialize default configurations if they don't exist
async function initializeDefaultConfigurations() {
  try {
    const existingConfigs = await kv.get('attom_admin_configurations');
    if (!existingConfigs) {
      console.log('Initializing default Attom API configurations...');
      
      const defaultConfig = getDefaultConfigurationTemplate();
      
      await kv.set('attom_admin_configurations', {
        configurations: [defaultConfig],
        endpoints: defaultConfig.endpoints
      });

      console.log('Default Attom API configurations initialized successfully');
    } else {
      console.log('Attom API configurations already exist');
    }
  } catch (error) {
    console.error('Failed to initialize default configurations:', error);
  }
}

// Get all configurations
app.get('/configurations', async (c) => {
  try {
    console.log('Loading Attom API configurations...');
    
    await initializeDefaultConfigurations();
    const data = await kv.get('attom_admin_configurations');
    
    console.log('Configurations loaded:', {
      endpoints: data?.endpoints?.length || 0,
      configurations: data?.configurations?.length || 0
    });
    
    return c.json({
      success: true,
      endpoints: data?.endpoints || [],
      configurations: data?.configurations || []
    });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch configurations',
      details: error.message
    }, 500);
  }
});

// Save or update an endpoint configuration
app.post('/endpoints', async (c) => {
  try {
    const endpointConfig: AttomEndpointConfig = await c.req.json();
    
    console.log('Saving endpoint configuration:', endpointConfig.name);
    
    // Validate required fields
    if (!endpointConfig.name || !endpointConfig.endpoint) {
      return c.json({
        success: false,
        error: 'Name and endpoint are required'
      }, 400);
    }

    // Validate endpoint URL format for Attom API
    if (!endpointConfig.endpoint.startsWith('/')) {
      return c.json({
        success: false,
        error: 'Endpoint must start with /'
      }, 400);
    }

    // Check for common Attom API endpoint issues
    if (endpointConfig.endpoint.includes('propertyapi') && !endpointConfig.endpoint.includes('v1.0.0')) {
      return c.json({
        success: false,
        error: 'Attom Property API endpoints must include version (e.g., /propertyapi/v1.0.0/...)'
      }, 400);
    }

    // Auto-fix common endpoint path issues
    let correctedEndpoint = endpointConfig.endpoint;
    if (correctedEndpoint === '/property/basicprofile') {
      correctedEndpoint = '/propertyapi/v1.0.0/property/basicprofile';
      console.log('Auto-corrected endpoint path from', endpointConfig.endpoint, 'to', correctedEndpoint);
    }
    
    if (correctedEndpoint === '/property/expandedprofile') {
      correctedEndpoint = '/propertyapi/v1.0.0/property/expandedprofile';
      console.log('Auto-corrected endpoint path from', endpointConfig.endpoint, 'to', correctedEndpoint);
    }

    // Ensure all required fields are present and apply corrections
    const completeEndpoint: AttomEndpointConfig = {
      ...endpointConfig,
      endpoint: correctedEndpoint,
      showInPropertyDetails: endpointConfig.showInPropertyDetails ?? true,
      displayOrder: endpointConfig.displayOrder ?? 1,
      responseFields: endpointConfig.responseFields?.map(field => ({
        ...field,
        displayInPropertyDetails: field.displayInPropertyDetails ?? true,
        displayName: field.displayName || field.name
      })) || []
    };

    // Get existing configurations
    const data = await kv.get('attom_admin_configurations') || { 
      endpoints: [], 
      configurations: [] 
    };

    // Find existing endpoint or add new one
    const existingIndex = data.endpoints.findIndex(ep => ep.id === completeEndpoint.id);
    
    if (existingIndex >= 0) {
      data.endpoints[existingIndex] = {
        ...completeEndpoint,
        modified: new Date().toISOString()
      };
      console.log('Updated existing endpoint:', completeEndpoint.name);
    } else {
      data.endpoints.push({
        ...completeEndpoint,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      });
      console.log('Added new endpoint:', completeEndpoint.name);
    }

    // Sort endpoints by display order
    data.endpoints.sort((a, b) => a.displayOrder - b.displayOrder);

    // Save updated configurations
    await kv.set('attom_admin_configurations', data);

    return c.json({
      success: true,
      message: 'Endpoint configuration saved successfully',
      endpoint: completeEndpoint
    });
  } catch (error) {
    console.error('Error saving endpoint configuration:', error);
    return c.json({
      success: false,
      error: 'Failed to save endpoint configuration',
      details: error.message
    }, 500);
  }
});

// Delete an endpoint configuration
app.delete('/endpoints/:id', async (c) => {
  try {
    const endpointId = c.req.param('id');
    
    console.log('Deleting endpoint configuration:', endpointId);
    
    // Get existing configurations
    const data = await kv.get('attom_admin_configurations') || { 
      endpoints: [], 
      configurations: [] 
    };

    // Filter out the endpoint to delete
    const updatedEndpoints = data.endpoints.filter(ep => ep.id !== endpointId);
    
    if (updatedEndpoints.length === data.endpoints.length) {
      return c.json({
        success: false,
        error: 'Endpoint not found'
      }, 404);
    }

    // Save updated configurations
    data.endpoints = updatedEndpoints;
    await kv.set('attom_admin_configurations', data);

    console.log('Endpoint deleted successfully:', endpointId);

    return c.json({
      success: true,
      message: 'Endpoint configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting endpoint configuration:', error);
    return c.json({
      success: false,
      error: 'Failed to delete endpoint configuration',
      details: error.message
    }, 500);
  }
});

// Test an endpoint configuration
app.post('/test-endpoint', async (c) => {
  try {
    const { endpointId, testParams } = await c.req.json();
    
    console.log('Testing endpoint:', endpointId, 'with params:', testParams);
    
    // Get endpoint configuration
    const data = await kv.get('attom_admin_configurations');
    const endpoint = data?.endpoints?.find(ep => ep.id === endpointId);
    
    if (!endpoint) {
      return c.json({
        success: false,
        error: 'Endpoint configuration not found',
        testResult: 'error'
      }, 404);
    }

    // Get Attom API credentials
    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    const attomBaseUrl = Deno.env.get('ATTOM_API_BASE_URL') || 'https://search.onboard-apis.com';
    
    if (!attomApiKey) {
      return c.json({
        success: false,
        error: 'Attom API key not configured',
        testResult: 'error'
      }, 500);
    }

    // Build API URL with parameters
    const url = new URL(endpoint.endpoint, attomBaseUrl);
    
    // Special handling for property basic profile endpoint with address parsing
    if (endpoint.id === 'property_basic_profile' && testParams.address) {
      // Parse the full address into components for Attom API
      const addressParts = parseAddressForAttom(testParams.address);
      
      console.log('Parsed address components:', addressParts);
      
      // Add parsed address components
      if (addressParts.address1) url.searchParams.append('address1', addressParts.address1);
      if (addressParts.address2) url.searchParams.append('address2', addressParts.address2);
      if (addressParts.locality) url.searchParams.append('locality', addressParts.locality);
      if (addressParts.countrySubd) url.searchParams.append('countrySubd', addressParts.countrySubd);
      if (addressParts.postalCode) url.searchParams.append('postalCode', addressParts.postalCode);
      
      // Add required API parameters
      url.searchParams.append('apikey', attomApiKey);
      url.searchParams.append('accept', 'application/json');
    } else {
      // Standard parameter handling for other endpoints
      Object.entries(testParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });

      // Add required API parameters
      url.searchParams.append('apikey', attomApiKey);
      url.searchParams.append('accept', 'application/json');
    }

    console.log(`Testing endpoint URL: ${url.toString()}`);

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    let responseData;
    let responseText = '';
    
    try {
      response = await fetch(url.toString(), {
        method: endpoint.method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Handoff-Platform/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Get the response as text first to handle non-JSON responses
      responseText = await response.text();
      console.log(`API Response Status: ${response.status}`);
      console.log(`API Response Headers:`, Object.fromEntries(response.headers.entries()));
      console.log(`API Response Text (first 500 chars):`, responseText.substring(0, 500));
      
      // Try to parse as JSON
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        console.warn('Response is not valid JSON:', jsonError.message);
        // If it's not JSON, create a response object with the raw text
        responseData = {
          error: 'API returned non-JSON response',
          responseText: responseText,
          contentType: response.headers.get('content-type'),
          status: response.status,
          statusText: response.statusText
        };
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - API took longer than 30 seconds to respond');
      } else {
        throw new Error(`Network error: ${fetchError.message}`);
      }
    }

    // Determine if the test was successful
    // For Attom API, a 200 response with valid JSON structure indicates success
    // Even if there are no results (SuccessWithoutResult)
    let isSuccess = false;
    
    if (response.ok && responseData) {
      if (responseData.error) {
        // Explicit error in response
        isSuccess = false;
      } else if (responseData.status) {
        // Attom API response with status object
        const statusCode = responseData.status.code;
        // 200 = success, 400 with "SuccessWithoutResult" = valid API call but no data found
        isSuccess = statusCode === 200 || (statusCode === 400 && responseData.status.msg === 'SuccessWithoutResult');
      } else {
        // Generic success for responses without status object
        isSuccess = true;
      }
    }
    
    // Update endpoint test result
    const updatedEndpoint = {
      ...endpoint,
      lastTested: new Date().toISOString(),
      testResult: isSuccess ? 'success' : 'error'
    };

    // Save updated endpoint
    const updatedEndpoints = data.endpoints.map(ep => 
      ep.id === endpointId ? updatedEndpoint : ep
    );
    
    await kv.set('attom_admin_configurations', {
      ...data,
      endpoints: updatedEndpoints
    });

    const resultMessage = isSuccess ? 'SUCCESS' : 'FAILED';
    console.log(`Endpoint test completed: ${endpoint.name} - ${resultMessage}`);

    // Prepare error message
    let errorMessage = null;
    if (!isSuccess) {
      if (!response.ok) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      } else if (responseData?.error) {
        errorMessage = responseData.error;
      } else if (responseData?.status?.msg === 'SuccessWithoutResult') {
        errorMessage = 'No property data found for this address - address may not exist in Attom database';
      } else {
        errorMessage = 'Unknown API error';
      }
    } else if (responseData?.status?.msg === 'SuccessWithoutResult') {
      // For successful "no results" case, include helpful info
      errorMessage = 'API endpoint working correctly - no property data found for test address';
    }

    return c.json({
      success: isSuccess,
      status: response.status,
      statusText: response.statusText,
      endpoint: endpoint.name,
      url: url.toString(),
      data: responseData,
      error: errorMessage,
      testResult: isSuccess ? 'success' : 'error',
      responseHeaders: Object.fromEntries(response.headers.entries()),
      contentType: response.headers.get('content-type'),
      responseSize: responseText.length
    });

  } catch (error) {
    console.error('Error testing endpoint:', error);
    return c.json({
      success: false,
      error: 'Failed to test endpoint',
      details: error.message,
      testResult: 'error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Get endpoint configuration by ID
app.get('/endpoints/:id', async (c) => {
  try {
    const endpointId = c.req.param('id');
    
    const data = await kv.get('attom_admin_configurations');
    const endpoint = data?.endpoints?.find(ep => ep.id === endpointId);
    
    if (!endpoint) {
      return c.json({
        success: false,
        error: 'Endpoint configuration not found'
      }, 404);
    }

    return c.json({
      success: true,
      endpoint
    });
  } catch (error) {
    console.error('Error fetching endpoint configuration:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch endpoint configuration',
      details: error.message
    }, 500);
  }
});

// Import configuration set
app.post('/import-configuration', async (c) => {
  try {
    const configurationSet: ConfigurationSet = await c.req.json();
    
    console.log('Importing configuration:', configurationSet.name, 'with', configurationSet.endpoints.length, 'endpoints');
    
    // Validate configuration set
    if (!configurationSet.endpoints || !Array.isArray(configurationSet.endpoints)) {
      return c.json({
        success: false,
        error: 'Invalid configuration format - endpoints must be an array'
      }, 400);
    }

    // Ensure all endpoints have required fields
    const validatedEndpoints = configurationSet.endpoints.map((endpoint, index) => ({
      ...endpoint,
      displayOrder: endpoint.displayOrder ?? index + 1,
      showInPropertyDetails: endpoint.showInPropertyDetails ?? true,
      responseFields: endpoint.responseFields?.map(field => ({
        ...field,
        displayInPropertyDetails: field.displayInPropertyDetails ?? true,
        displayName: field.displayName || field.name
      })) || [],
      modified: new Date().toISOString()
    }));

    // Get existing configurations
    const data = await kv.get('attom_admin_configurations') || { 
      endpoints: [], 
      configurations: [] 
    };

    // Add imported configuration to configurations list
    data.configurations.push({
      ...configurationSet,
      created: new Date().toISOString()
    });

    // Replace endpoints with imported ones
    data.endpoints = validatedEndpoints;

    // Sort endpoints by display order
    data.endpoints.sort((a, b) => a.displayOrder - b.displayOrder);

    // Save updated configurations
    await kv.set('attom_admin_configurations', data);

    console.log('Configuration imported successfully:', configurationSet.name);

    return c.json({
      success: true,
      message: 'Configuration imported successfully',
      importedEndpoints: validatedEndpoints.length
    });
  } catch (error) {
    console.error('Error importing configuration:', error);
    return c.json({
      success: false,
      error: 'Failed to import configuration',
      details: error.message
    }, 500);
  }
});

// Export configuration set
app.get('/export-configuration', async (c) => {
  try {
    const data = await kv.get('attom_admin_configurations');
    
    const configurationSet: ConfigurationSet = {
      name: 'Handoff Attom Configuration Export',
      version: '1.0.0',
      endpoints: data?.endpoints || [],
      created: new Date().toISOString(),
      description: 'Exported Attom API configuration from Handoff admin panel'
    };

    return c.json(configurationSet);
  } catch (error) {
    console.error('Error exporting configuration:', error);
    return c.json({
      success: false,
      error: 'Failed to export configuration',
      details: error.message
    }, 500);
  }
});

// Get property display configuration
app.get('/property-display-config', async (c) => {
  try {
    const data = await kv.get('attom_admin_configurations');
    
    if (!data?.endpoints) {
      // Return default configuration if none exists
      const defaultConfig = getDefaultConfigurationTemplate();
      return c.json({
        success: true,
        displayConfig: defaultConfig.endpoints
          .filter(endpoint => endpoint.isActive && endpoint.showInPropertyDetails)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(endpoint => ({
            id: endpoint.id,
            name: endpoint.name,
            category: endpoint.category,
            displayOrder: endpoint.displayOrder,
            endpoint: endpoint.endpoint,
            responseFields: endpoint.responseFields.filter(field => field.displayInPropertyDetails)
          }))
      });
    }
    
    // Filter and sort endpoints for property display
    const displayConfig = data.endpoints
      .filter(endpoint => endpoint.isActive && endpoint.showInPropertyDetails)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(endpoint => ({
        id: endpoint.id,
        name: endpoint.name,
        category: endpoint.category,
        displayOrder: endpoint.displayOrder,
        endpoint: endpoint.endpoint,
        responseFields: endpoint.responseFields.filter(field => field.displayInPropertyDetails)
      }));

    console.log('Property display config retrieved:', displayConfig.length, 'active endpoints');

    return c.json({
      success: true,
      displayConfig
    });
  } catch (error) {
    console.error('Error fetching property display configuration:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch property display configuration',
      details: error.message
    }, 500);
  }
});

// Reset to default configuration
app.post('/reset-default', async (c) => {
  try {
    console.log('Resetting to default configuration...');
    
    const defaultConfig = getDefaultConfigurationTemplate();
    
    await kv.set('attom_admin_configurations', {
      configurations: [defaultConfig],
      endpoints: defaultConfig.endpoints
    });

    console.log('Default configuration reset successfully');

    return c.json({
      success: true,
      message: 'Configuration reset to default successfully',
      endpoints: defaultConfig.endpoints.length
    });
  } catch (error) {
    console.error('Error resetting to default configuration:', error);
    return c.json({
      success: false,
      error: 'Failed to reset to default configuration',
      details: error.message
    }, 500);
  }
});

// Validate ATTOM API key
app.get('/validate-api-key', async (c) => {
  try {
    console.log('Validating ATTOM API key...');
    
    // Get Attom API credentials
    const attomApiKey = Deno.env.get('ATTOM_API_KEY');
    const attomBaseUrl = Deno.env.get('ATTOM_API_BASE_URL') || 'https://search.onboard-apis.com';
    
    // Check if API key exists
    if (!attomApiKey) {
      return c.json({
        success: false,
        error: 'ATTOM_API_KEY environment variable is not set',
        details: 'The ATTOM_API_KEY must be configured in your environment variables.',
        recommendations: [
          'Check that ATTOM_API_KEY is set in your deployment environment',
          'Verify the API key is not empty or null',
          'Ensure the key has not expired'
        ]
      }, 500);
    }

    // Check if API key looks valid (basic format check)
    if (attomApiKey.length < 10) {
      return c.json({
        success: false,
        error: 'ATTOM_API_KEY appears to be invalid',
        details: 'The API key is too short to be a valid Attom API key.',
        keyLength: attomApiKey.length,
        recommendations: [
          'Verify you copied the complete API key',
          'Check for any extra spaces or characters',
          'Regenerate the API key if necessary'
        ]
      }, 400);
    }

    // Test the API key with a simple endpoint
    const testUrl = new URL('/propertyapi/v1.0.0/property/basicprofile', attomBaseUrl);
    testUrl.searchParams.append('address1', '123 Main Street');
    testUrl.searchParams.append('locality', 'Los Angeles');
    testUrl.searchParams.append('countrySubd', 'CA');
    testUrl.searchParams.append('apikey', attomApiKey);
    testUrl.searchParams.append('accept', 'application/json');

    console.log('Testing API key with URL:', testUrl.toString());

    // Make test request with shorter timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let response;
    let responseText = '';
    
    try {
      response = await fetch(testUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Handoff-Platform/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      responseText = await response.text();
      
      console.log(`API Key Test Response Status: ${response.status}`);
      console.log(`API Key Test Response: ${responseText.substring(0, 200)}`);
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('API Key Test Fetch Error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return c.json({
          success: false,
          error: 'API key validation timeout',
          details: 'The Attom API took too long to respond during key validation.',
          recommendations: [
            'Check your internet connection',
            'Verify the Attom API service is available',
            'Try again in a few minutes'
          ]
        }, 500);
      }
      
      return c.json({
        success: false,
        error: 'Network error during API key validation',
        details: `Failed to connect to Attom API: ${fetchError.message}`,
        recommendations: [
          'Check your internet connection',
          'Verify the ATTOM_API_BASE_URL is correct',
          'Check if the Attom API service is available'
        ]
      }, 500);
    }

    // Parse response to check for authentication errors
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      // If response is not JSON, check HTTP status
      if (response.status === 401 || response.status === 403) {
        return c.json({
          success: false,
          error: 'API key authentication failed',
          details: 'The Attom API rejected the authentication credentials.',
          httpStatus: response.status,
          recommendations: [
            'Verify your ATTOM_API_KEY is correct',
            'Check if your API key has expired',
            'Ensure your API key has the necessary permissions',
            'Contact Attom Data support if the key should be valid'
          ]
        }, 401);
      }

      return c.json({
        success: false,
        error: 'Invalid response from Attom API',
        details: 'Received non-JSON response from Attom API during validation.',
        httpStatus: response.status,
        responsePreview: responseText.substring(0, 200),
        recommendations: [
          'Check if you\'re using the correct API endpoint URL',
          'Verify the Attom API service status',
          'Try again later if this is a temporary issue'
        ]
      }, 500);
    }

    // Check for API-level authentication errors
    if (response.status === 401 || response.status === 403) {
      return c.json({
        success: false,
        error: 'API key authentication failed',
        details: responseData?.message || 'The Attom API rejected the authentication credentials.',
        httpStatus: response.status,
        apiResponse: responseData,
        recommendations: [
          'Verify your ATTOM_API_KEY is correct',
          'Check if your API key has expired',
          'Ensure your API key has the necessary permissions',
          'Contact Attom Data support if the key should be valid'
        ]
      }, 401);
    }

    // Check for other error responses
    if (!response.ok) {
      return c.json({
        success: false,
        error: `HTTP ${response.status} error during API validation`,
        details: responseData?.message || `Received HTTP ${response.status} from Attom API`,
        httpStatus: response.status,
        apiResponse: responseData,
        recommendations: [
          'Check the API endpoint URL and parameters',
          'Verify your API key permissions',
          'Contact Attom Data support if the error persists'
        ]
      }, response.status);
    }

    // Success - API key is working
    let validationMessage = 'API key is valid and authentication successful';
    let apiStatus = 'active';
    
    // Check if we got actual data or just successful auth
    if (responseData?.status?.code === 200 && responseData?.property) {
      validationMessage = 'API key is valid with successful data retrieval';
      apiStatus = 'active_with_data';
    } else if (responseData?.status?.code === 400 && responseData?.status?.msg === 'SuccessWithoutResult') {
      validationMessage = 'API key is valid (test returned no data for sample address, which is normal)';
      apiStatus = 'active_no_data';
    }

    return c.json({
      success: true,
      message: validationMessage,
      details: 'ATTOM API key validation completed successfully',
      validation: {
        apiKeySet: true,
        apiKeyLength: attomApiKey.length,
        authenticationSuccessful: true,
        apiStatus: apiStatus,
        baseUrl: attomBaseUrl,
        testEndpoint: '/propertyapi/v1.0.0/property/basicprofile',
        httpStatus: response.status,
        responseStatus: responseData?.status || null
      },
      recommendations: [
        'API key is configured correctly',
        'You can now use the Attom API endpoints',
        'Monitor your API usage limits'
      ]
    });

  } catch (error) {
    console.error('Error validating API key:', error);
    return c.json({
      success: false,
      error: 'Internal error during API key validation',
      details: error.message,
      recommendations: [
        'Check your server environment configuration',
        'Ensure all required environment variables are set',
        'Contact support if the issue persists'
      ]
    }, 500);
  }
});

// Fix common endpoint configuration issues
app.post('/fix-endpoints', async (c) => {
  try {
    console.log('Fixing common endpoint configuration issues...');
    
    // Get existing configurations
    const data = await kv.get('attom_admin_configurations') || { 
      endpoints: [], 
      configurations: [] 
    };

    let fixCount = 0;
    const fixedEndpoints = data.endpoints.map(endpoint => {
      let needsFix = false;
      let correctedEndpoint = endpoint.endpoint;

      // Fix common path issues
      if (correctedEndpoint === '/property/basicprofile') {
        correctedEndpoint = '/propertyapi/v1.0.0/property/basicprofile';
        needsFix = true;
      }
      
      if (correctedEndpoint === '/property/expandedprofile') {
        correctedEndpoint = '/propertyapi/v1.0.0/property/expandedprofile';
        needsFix = true;
      }

      if (correctedEndpoint === '/school/detail') {
        correctedEndpoint = '/schoolapi/v1.0.0/school/detail';
        needsFix = true;
      }

      if (correctedEndpoint === '/neighborhood/detail') {
        correctedEndpoint = '/neighborhoodapi/v1.0.0/neighborhood/detail';
        needsFix = true;
      }

      if (correctedEndpoint === '/riskassessment/detail') {
        correctedEndpoint = '/riskapi/v1.0.0/riskassessment/detail';
        needsFix = true;
      }

      if (needsFix) {
        fixCount++;
        console.log(`Fixed endpoint: ${endpoint.name} - ${endpoint.endpoint} -> ${correctedEndpoint}`);
        return {
          ...endpoint,
          endpoint: correctedEndpoint,
          modified: new Date().toISOString()
        };
      }

      return endpoint;
    });

    // Save fixed configurations
    if (fixCount > 0) {
      await kv.set('attom_admin_configurations', {
        ...data,
        endpoints: fixedEndpoints
      });
    }

    console.log(`Fixed ${fixCount} endpoint configurations`);

    return c.json({
      success: true,
      message: `Fixed ${fixCount} endpoint configuration issues`,
      fixedEndpoints: fixCount,
      details: fixCount > 0 ? `Updated endpoint URLs to include proper API versions` : 'No issues found'
    });
  } catch (error) {
    console.error('Error fixing endpoint configurations:', error);
    return c.json({
      success: false,
      error: 'Failed to fix endpoint configurations',
      details: error.message
    }, 500);
  }
});

export default app;