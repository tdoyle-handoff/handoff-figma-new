import { Fragment } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Database, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw,
  Download,
  Filter,
  Info,
  MapPin,
  Home,
  DollarSign,
  User,
  FileText,
  Settings,
  Zap,
  Send,
  Code,
  Globe
} from 'lucide-react';
import { projectId, SUPABASE_ANON_KEY } from '../utils/supabase/info';
import { parseAddressForAPI } from '../utils/propertyHelpers';

interface RequestDetails {
  url: string;
  method: string;
  headers: Record<string, string>;
  parameters: Record<string, any>;
  timestamp: string;
}

interface EndpointData {
  endpoint: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  testData?: any;
  error?: string;
  isLoading?: boolean;
  requestDetails?: RequestDetails;
  responseTime?: number;
  mappedFields?: Array<{
    sourcePath: string;
    targetField: string;
    value: any;
    status: 'available' | 'missing' | 'error';
  }>;
}

interface FieldAnalysis {
  fieldName: string;
  displayName: string;
  expectedSources: string[];
  actualValue: any;
  status: 'found' | 'not_available' | 'error';
  availableInEndpoints: string[];
  mappingIssues: string[];
}

export function AttomEndpointFieldMappingDebugger() {
  const [testAddress, setTestAddress] = useState('1600 Amphitheatre Parkway, Mountain View, CA');
  const [endpoints, setEndpoints] = useState<EndpointData[]>([]);
  const [fieldAnalysis, setFieldAnalysis] = useState<FieldAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize endpoints configuration
  useEffect(() => {
    const endpointConfigs: EndpointData[] = [
      {
        endpoint: 'property-basic-profile',
        name: 'Basic Profile',
        description: 'Basic property information including address, ownership, and summary data',
        icon: <Home className="w-4 h-4" />
      },
      {
        endpoint: 'property-expanded-profile',
        name: 'Expanded Profile',
        description: 'Comprehensive property data including construction, utilities, and detailed characteristics',
        icon: <Database className="w-4 h-4" />
      },
      {
        endpoint: 'property-detail',
        name: 'Property Detail',
        description: 'Detailed property information including lot details, schools, and environmental data',
        icon: <FileText className="w-4 h-4" />
      },
      {
        endpoint: 'sale-details',
        name: 'Sale Details',
        description: 'Property sale history and transaction details',
        icon: <DollarSign className="w-4 h-4" />
      },
      {
        endpoint: 'expanded-sale-details',
        name: 'Expanded Sale Details',
        description: 'Comprehensive sale history with market trends and comparable sales',
        icon: <DollarSign className="w-4 h-4" />
      },
      {
        endpoint: 'avm',
        name: 'AVM (Automated Valuation)',
        description: 'Automated valuation model data with estimated property values',
        icon: <DollarSign className="w-4 h-4" />
      }
    ];

    setEndpoints(endpointConfigs.map(config => ({
      ...config,
      isLoading: false
    })));
  }, []);

  // Test all endpoints with the provided address
  const testAllEndpoints = useCallback(async () => {
    if (!testAddress.trim()) {
      alert('Please enter a test address');
      return;
    }

    const addressComponents = parseAddressForAPI(testAddress);
    if (!addressComponents) {
      alert('Invalid address format');
      return;
    }

    setIsLoading(true);
    
    const updatedEndpoints = [...endpoints];
    
    // Mark all as loading
    updatedEndpoints.forEach(endpoint => {
      endpoint.isLoading = true;
      endpoint.error = undefined;
      endpoint.testData = undefined;
      endpoint.requestDetails = undefined;
      endpoint.responseTime = undefined;
    });
    setEndpoints(updatedEndpoints);

    // Test each endpoint
    for (let i = 0; i < updatedEndpoints.length; i++) {
      const endpoint = updatedEndpoints[i];
      
      try {
        console.log(`Testing endpoint: ${endpoint.endpoint}`);
        
        // Build query parameters
        const params = new URLSearchParams({
          address1: addressComponents.address1,
          debug: 'true'
        });
        
        if (addressComponents.address2) {
          params.append('address2', addressComponents.address2);
        }

        const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/${endpoint.endpoint}?${params.toString()}`;
        
        // ENHANCED: Capture request details
        const headers = {
          'Content-Type': 'application/json',
'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        };

        const requestDetails: RequestDetails = {
          url: url,
          method: 'GET',
          headers: headers,
          parameters: {
            address1: addressComponents.address1,
            address2: addressComponents.address2 || null,
            debug: 'true'
          },
          timestamp: new Date().toISOString()
        };

        const startTime = performance.now();
        
        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
        });

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Store the response data with request details
        updatedEndpoints[i] = {
          ...endpoint,
          testData: data,
          isLoading: false,
          requestDetails: requestDetails,
          responseTime: responseTime,
          mappedFields: analyzeEndpointData(endpoint.endpoint, data)
        };
        
        console.log(`✅ ${endpoint.endpoint} completed in ${responseTime}ms:`, data);
        
      } catch (error) {
        console.error(`❌ ${endpoint.endpoint} failed:`, error);
        
        updatedEndpoints[i] = {
          ...endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false,
          requestDetails: updatedEndpoints[i].requestDetails || undefined,
          responseTime: undefined
        };
      }
      
      // Update state after each endpoint completes
      setEndpoints([...updatedEndpoints]);
    }

    // After all endpoints are tested, analyze field mappings
    setTimeout(() => {
      analyzeFieldMappings(updatedEndpoints);
      setIsLoading(false);
    }, 500);

  }, [testAddress, endpoints]);

  // Analyze data from a specific endpoint
  const analyzeEndpointData = (endpointName: string, data: any): Array<{
    sourcePath: string;
    targetField: string;
    value: any;
    status: 'available' | 'missing' | 'error';
  }> => {
    const mappedFields: Array<{
      sourcePath: string;
      targetField: string;
      value: any;
      status: 'available' | 'missing' | 'error';
    }> = [];

    if (!data?.property?.[0]) {
      return mappedFields;
    }

    const property = data.property[0];

    // Define field mappings for each endpoint
    const fieldMappings = getFieldMappingsForEndpoint(endpointName);
    
    fieldMappings.forEach(mapping => {
      const value = getNestedValue(property, mapping.sourcePath);
      mappedFields.push({
        sourcePath: mapping.sourcePath,
        targetField: mapping.targetField,
        value: value,
        status: value !== null && value !== undefined && value !== '' ? 'available' : 'missing'
      });
    });

    return mappedFields;
  };

  // Get field mappings for specific endpoint
  const getFieldMappingsForEndpoint = (endpointName: string) => {
    const commonMappings = [
      { sourcePath: 'address.oneLine', targetField: 'property.address.street' },
      { sourcePath: 'address.line1', targetField: 'property.address.street' },
      { sourcePath: 'address.locality', targetField: 'property.address.city' },
      { sourcePath: 'address.countrySubd', targetField: 'property.address.state' },
      { sourcePath: 'address.postal1', targetField: 'property.address.zipCode' },
      { sourcePath: 'location.latitude', targetField: 'property.location.latitude' },
      { sourcePath: 'location.longitude', targetField: 'property.location.longitude' }
    ];

    switch (endpointName) {
      case 'property-basic-profile':
        return [
          ...commonMappings,
          { sourcePath: 'summary.proptype', targetField: 'property.basic.propertyType' },
          { sourcePath: 'summary.yearbuilt', targetField: 'property.basic.yearBuilt' },
          { sourcePath: 'area.bedrooms', targetField: 'property.characteristics.bedrooms' },
          { sourcePath: 'area.bathrooms', targetField: 'property.characteristics.bathrooms' },
          { sourcePath: 'area.areaSqFt', targetField: 'property.characteristics.squareFeet' },
          { sourcePath: 'lot.situsCounty', targetField: 'property.location.county' }
        ];

      case 'property-expanded-profile':
        return [
          ...commonMappings,
          { sourcePath: 'building.summary.propertyType', targetField: 'property.basic.propertyType' },
          { sourcePath: 'building.summary.yearBuilt', targetField: 'property.basic.yearBuilt' },
          { sourcePath: 'building.summary.noOfBeds', targetField: 'property.characteristics.bedrooms' },
          { sourcePath: 'building.summary.noOfBaths', targetField: 'property.characteristics.bathrooms' },
          { sourcePath: 'building.size.universalSize', targetField: 'property.characteristics.squareFeet' },
          { sourcePath: 'building.construction.style', targetField: 'property.construction.style' },
          { sourcePath: 'building.construction.condition', targetField: 'property.construction.condition' },
          { sourcePath: 'building.construction.quality', targetField: 'property.construction.quality' },
          { sourcePath: 'building.interior.heating', targetField: 'property.systems.heating' },
          { sourcePath: 'building.interior.cooling', targetField: 'property.systems.cooling' },
          { sourcePath: 'utilities.water', targetField: 'property.systems.water' },
          { sourcePath: 'utilities.sewer', targetField: 'property.systems.sewer' },
          { sourcePath: 'owner.owner1.owner1FullName', targetField: 'property.owner.primaryName' },
          { sourcePath: 'owner.ownershipType', targetField: 'property.owner.ownershipType' }
        ];

      case 'property-detail':
        return [
          ...commonMappings,
          { sourcePath: 'lot.frontfootage', targetField: 'property.lot.frontFootage' },
          { sourcePath: 'lot.depth', targetField: 'property.lot.depth' },
          { sourcePath: 'lot.topography', targetField: 'property.lot.topography' },
          { sourcePath: 'school.elementary.schoolName', targetField: 'property.schools.elementary.name' },
          { sourcePath: 'school.middle.schoolName', targetField: 'property.schools.middle.name' },
          { sourcePath: 'school.high.schoolName', targetField: 'property.schools.high.name' },
          { sourcePath: 'area.zoning', targetField: 'property.location.zoning' },
          { sourcePath: 'area.munname', targetField: 'property.location.municipality' }
        ];

      case 'sale-details':
      case 'expanded-sale-details':
        return [
          ...commonMappings,
          { sourcePath: 'market.saleHistory[0].saleAmt', targetField: 'property.sale.lastPrice' },
          { sourcePath: 'market.saleHistory[0].saleTransDate', targetField: 'property.sale.lastDate' },
          { sourcePath: 'market.saleHistory[0].saleTransType', targetField: 'property.sale.lastType' }
        ];

      case 'avm':
        return [
          ...commonMappings,
          { sourcePath: 'avm.amount.value', targetField: 'property.valuation.estimatedValue' },
          { sourcePath: 'avm.amount.high', targetField: 'property.valuation.estimatedHigh' },
          { sourcePath: 'avm.amount.low', targetField: 'property.valuation.estimatedLow' },
          { sourcePath: 'avm.eventDate', targetField: 'property.valuation.estimatedDate' }
        ];

      default:
        return commonMappings;
    }
  };

  // Get nested value from object using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    if (!obj || !path) return null;
    
    // Handle array indices in path (e.g., "market.saleHistory[0].saleAmt")
    const pathWithArrays = path.replace(/\[(\d+)\]/g, '.$1');
    const keys = pathWithArrays.split('.');
    
    let value = obj;
    for (const key of keys) {
      if (value === null || value === undefined) return null;
      if (typeof value === 'object') {
        value = value[key];
      } else {
        return null;
      }
    }
    
    return value;
  };

  // Analyze field mappings across all endpoints
  const analyzeFieldMappings = (endpointData: EndpointData[]) => {
    // Define all expected fields that should be displayed
    const expectedFields: FieldAnalysis[] = [
      {
        fieldName: 'property.address.street',
        displayName: 'Street Address',
        expectedSources: ['address.oneLine', 'address.line1'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.address.city',
        displayName: 'City',
        expectedSources: ['address.locality'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.basic.propertyType',
        displayName: 'Property Type',
        expectedSources: ['summary.proptype', 'building.summary.propertyType'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.basic.yearBuilt',
        displayName: 'Year Built',
        expectedSources: ['summary.yearbuilt', 'building.summary.yearBuilt'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.characteristics.bedrooms',
        displayName: 'Bedrooms',
        expectedSources: ['area.bedrooms', 'building.summary.noOfBeds', 'building.rooms.beds'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.characteristics.bathrooms',
        displayName: 'Bathrooms',
        expectedSources: ['area.bathrooms', 'building.summary.noOfBaths', 'building.rooms.baths'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.characteristics.squareFeet',
        displayName: 'Square Feet',
        expectedSources: ['area.areaSqFt', 'building.size.universalSize', 'building.size.livingSize'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.construction.style',
        displayName: 'Architectural Style',
        expectedSources: ['building.construction.style', 'building.summary.archStyle'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.systems.heating',
        displayName: 'Heating System',
        expectedSources: ['building.interior.heating', 'utilities.heating'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      },
      {
        fieldName: 'property.owner.primaryName',
        displayName: 'Property Owner',
        expectedSources: ['owner.owner1.owner1FullName', 'owner.owner1.owner1Name'],
        actualValue: null,
        status: 'not_available',
        availableInEndpoints: [],
        mappingIssues: []
      }
    ];

    // Analyze each field across all endpoints
    expectedFields.forEach(field => {
      let foundValue = null;
      const availableEndpoints: string[] = [];
      const mappingIssues: string[] = [];

      endpointData.forEach(endpoint => {
        if (!endpoint.testData?.property?.[0]) return;

        const property = endpoint.testData.property[0];
        
        // Check each possible source path for this field
        field.expectedSources.forEach(sourcePath => {
          const value = getNestedValue(property, sourcePath);
          if (value !== null && value !== undefined && value !== '') {
            foundValue = value;
            if (!availableEndpoints.includes(endpoint.name)) {
              availableEndpoints.push(endpoint.name);
            }
          }
        });

        // Check if this endpoint has mapped fields for this target field
        const mappedField = endpoint.mappedFields?.find(mf => mf.targetField === field.fieldName);
        if (mappedField && mappedField.status === 'missing') {
          mappingIssues.push(`Missing in ${endpoint.name} despite endpoint availability`);
        }
      });

      field.actualValue = foundValue;
      field.status = foundValue !== null ? 'found' : 'not_available';
      field.availableInEndpoints = availableEndpoints;
      field.mappingIssues = mappingIssues;

      // Additional analysis for common issues
      if (foundValue !== null && field.mappingIssues.length === 0) {
        field.mappingIssues.push('Data available but may need component update to display properly');
      }
    });

    setFieldAnalysis(expectedFields);
  };

  // ENHANCED: Format request details for display
  const formatRequestDetails = (requestDetails: RequestDetails) => {
    return {
      url: requestDetails.url,
      method: requestDetails.method,
      headers: Object.entries(requestDetails.headers).map(([key, value]) => `${key}: ${value}`).join('\n'),
      parameters: Object.entries(requestDetails.parameters)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${key}: ${String(value)}`).join('\n'),
      timestamp: new Date(requestDetails.timestamp).toLocaleString()
    };
  };

  // Filter endpoints and fields based on current filters
  const filteredEndpoints = endpoints.filter(endpoint => {
    if (selectedEndpoint !== 'all' && endpoint.endpoint !== selectedEndpoint) return false;
    if (searchTerm && !endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredFields = fieldAnalysis.filter(field => {
    if (filterStatus !== 'all' && field.status !== filterStatus) return false;
    if (searchTerm && !field.displayName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !field.fieldName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Export debug data
  const exportDebugData = () => {
    const debugData = {
      testAddress,
      timestamp: new Date().toISOString(),
      endpoints: endpoints.map(ep => ({
        ...ep,
        icon: undefined, // Remove React component for serialization
        requestDetails: ep.requestDetails
      })),
      fieldAnalysis,
      summary: {
        totalEndpoints: endpoints.length,
        successfulEndpoints: endpoints.filter(ep => ep.testData && !ep.error).length,
        totalFields: fieldAnalysis.length,
        fieldsWithData: fieldAnalysis.filter(f => f.status === 'found').length,
        fieldsNotAvailable: fieldAnalysis.filter(f => f.status === 'not_available').length,
        averageResponseTime: endpoints.filter(ep => ep.responseTime).reduce((sum, ep) => sum + (ep.responseTime || 0), 0) / endpoints.filter(ep => ep.responseTime).length || 0
      }
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attom-field-mapping-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              ATTOM API Endpoint Field Mapping Debugger
            </CardTitle>
            <p className="text-muted-foreground">
              Comprehensive analysis of ATTOM API endpoints and field mappings to identify "not available" data issues
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Test Address</label>
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="Enter property address to test..."
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="flex gap-2 items-end">
                <Button 
                  onClick={testAllEndpoints} 
                  disabled={isLoading}
                  className="px-6"
                >
                  {isLoading ? (
                    <Fragment>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Search className="w-4 h-4 mr-2" />
                      Test All Endpoints
                    </Fragment>
                  )}
                </Button>
                <Button 
                  onClick={exportDebugData} 
                  variant="outline"
                  disabled={endpoints.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {fieldAnalysis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Endpoints Tested</p>
                    <p className="text-2xl font-semibold">
                      {endpoints.filter(ep => ep.testData || ep.error).length}/{endpoints.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fields With Data</p>
                    <p className="text-2xl font-semibold">
                      {fieldAnalysis.filter(f => f.status === 'found').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Not Available</p>
                    <p className="text-2xl font-semibold">
                      {fieldAnalysis.filter(f => f.status === 'not_available').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mapping Issues</p>
                    <p className="text-2xl font-semibold">
                      {fieldAnalysis.filter(f => f.mappingIssues.length > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ENHANCED: Add average response time */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-semibold">
                      {endpoints.filter(ep => ep.responseTime).length > 0
                        ? `${Math.round(
                            endpoints.filter(ep => ep.responseTime).reduce((sum, ep) => sum + (ep.responseTime || 0), 0) /
                            endpoints.filter(ep => ep.responseTime).length
                          )}ms`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoints">Endpoint Analysis</TabsTrigger>
            <TabsTrigger value="requests">Request Details</TabsTrigger>
            <TabsTrigger value="fields">Field Mapping Analysis</TabsTrigger>
            <TabsTrigger value="raw-data">Raw Data Inspection</TabsTrigger>
          </TabsList>

          {/* Endpoint Analysis Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="all">All Endpoints</option>
                {endpoints.map(ep => (
                  <option key={ep.endpoint} value={ep.endpoint}>{ep.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEndpoints.map((endpoint, index) => (
                <Card key={endpoint.endpoint} className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {endpoint.icon}
                      {endpoint.name}
                      {endpoint.isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                      {endpoint.testData && !endpoint.error && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {endpoint.error && <XCircle className="w-4 h-4 text-red-600" />}
                      {/* ENHANCED: Show response time */}
                      {endpoint.responseTime && (
                        <Badge variant="outline" className="text-xs">
                          {endpoint.responseTime}ms
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  </CardHeader>
                  <CardContent>
                    {endpoint.error && (
                      <Alert className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{endpoint.error}</AlertDescription>
                      </Alert>
                    )}

                    {endpoint.testData && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {endpoint.testData.status?.msg || 'Success'}
                          </Badge>
                        </div>

                        {endpoint.mappedFields && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Mapped Fields ({endpoint.mappedFields.length}):</h4>
                            <ScrollArea className="h-32">
                              <div className="space-y-1">
                                {endpoint.mappedFields.map((field, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="truncate mr-2">{field.sourcePath}</span>
                                    <Badge 
                                      variant={field.status === 'available' ? 'default' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {field.status === 'available' ? '✓' : '✗'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-sm">
                          <span>Available Fields:</span>
                          <span className="font-semibold">
                            {endpoint.mappedFields?.filter(f => f.status === 'available').length || 0} / {endpoint.mappedFields?.length || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ENHANCED: Request Details Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Alert>
              <Send className="h-4 w-4" />
              <AlertDescription>
                View detailed request information including URLs, parameters, headers, and timing for each ATTOM API endpoint call.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              {endpoints.filter(ep => ep.requestDetails).map((endpoint) => (
                <Card key={endpoint.endpoint}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {endpoint.icon}
                      {endpoint.name} - Request Details
                      {endpoint.responseTime && (
                        <Badge variant="outline" className="ml-auto">
                          {endpoint.responseTime}ms
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Request Information */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Request URL
                          </h4>
                          <ScrollArea className="h-20 w-full">
                            <pre className="text-xs bg-muted p-3 rounded overflow-auto whitespace-pre-wrap break-all">
                              {endpoint.requestDetails?.url}
                            </pre>
                          </ScrollArea>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Request Method & Timing
                          </h4>
                          <div className="text-sm space-y-1">
                            <p><span className="font-medium">Method:</span> {endpoint.requestDetails?.method}</p>
                            <p><span className="font-medium">Timestamp:</span> {formatRequestDetails(endpoint.requestDetails!).timestamp}</p>
                            <p><span className="font-medium">Response Time:</span> {endpoint.responseTime ? `${endpoint.responseTime}ms` : 'N/A'}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Parameters
                          </h4>
                          <ScrollArea className="h-24 w-full">
                            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                              {formatRequestDetails(endpoint.requestDetails!).parameters}
                            </pre>
                          </ScrollArea>
                        </div>
                      </div>

                      {/* Headers and Response Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Request Headers
                          </h4>
                          <ScrollArea className="h-32 w-full">
                            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                              {formatRequestDetails(endpoint.requestDetails!).headers}
                            </pre>
                          </ScrollArea>
                        </div>

                        {/* Response Status */}
                        {endpoint.testData && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Response Status
                            </h4>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Status:</span> {endpoint.testData.status?.msg || 'Success'}</p>
                              <p><span className="font-medium">Properties Found:</span> {endpoint.testData.property?.length || 0}</p>
                              {endpoint.testData.status?.code !== undefined && (
                                <p><span className="font-medium">Status Code:</span> {endpoint.testData.status.code}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {endpoint.error && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-600" />
                              Error Details
                            </h4>
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {endpoint.error}
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Field Mapping Analysis Tab */}
          <TabsContent value="fields" className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="all">All Statuses</option>
                <option value="found">Found</option>
                <option value="not_available">Not Available</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredFields.map((field, index) => (
                <Card key={field.fieldName}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{field.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{field.fieldName}</p>
                      </div>
                      <Badge 
                        variant={field.status === 'found' ? 'default' : 'destructive'}
                        className={field.status === 'found' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {field.status === 'found' ? 'Found' : 'Not Available'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Expected Sources:</h4>
                        <div className="space-y-1">
                          {field.expectedSources.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Available In Endpoints:</h4>
                        <div className="space-y-1">
                          {field.availableInEndpoints.length > 0 ? (
                            field.availableInEndpoints.map((endpoint, idx) => (
                              <Badge key={idx} variant="default" className="text-xs bg-blue-100 text-blue-700">
                                {endpoint}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">None found</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Current Value:</h4>
                        <p className="text-sm p-2 bg-muted rounded">
                          {field.actualValue !== null ? String(field.actualValue) : 'null'}
                        </p>
                      </div>
                    </div>

                    {field.mappingIssues.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="text-sm font-medium mb-2 text-yellow-700">Mapping Issues:</h4>
                        <div className="space-y-1">
                          {field.mappingIssues.map((issue, idx) => (
                            <Alert key={idx} className="py-2">
                              <AlertTriangle className="h-3 w-3" />
                              <AlertDescription className="text-xs">{issue}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Raw Data Inspection Tab */}
          <TabsContent value="raw-data" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Raw response data from each endpoint. Use this to inspect the actual data structure and identify missing fields.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              {endpoints.filter(ep => ep.testData).map((endpoint) => (
                <Card key={endpoint.endpoint}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {endpoint.icon}
                      {endpoint.name} - Raw Response
                      {endpoint.responseTime && (
                        <Badge variant="outline" className="ml-auto">
                          {endpoint.responseTime}ms
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full">
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                        {JSON.stringify(endpoint.testData, null, 2)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}