import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Database, 
  ArrowRight, 
  Eye, 
  Save, 
  RefreshCw, 
  Settings, 
  MapPin,
  Home,
  DollarSign,
  Calendar,
  User,
  Copy,
  Check,
  X,
  Plus,
  Trash2,
  ArrowLeftRight
} from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { PropertyOverviewWithAttomData } from './PropertyOverviewWithAttomData';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

interface EndpointSchema {
  id: string;
  name: string;
  path: string;
  sampleData: any;
  fields: Array<{
    path: string;
    type: string;
    description: string;
    sampleValue: any;
  }>;
}

// Predefined target fields for property overview
const TARGET_FIELDS = [
  { id: 'property.address.street', name: 'Street Address', category: 'Address', icon: MapPin },
  { id: 'property.address.city', name: 'City', category: 'Address', icon: MapPin },
  { id: 'property.address.state', name: 'State', category: 'Address', icon: MapPin },
  { id: 'property.address.zipCode', name: 'ZIP Code', category: 'Address', icon: MapPin },
  { id: 'property.basic.yearBuilt', name: 'Year Built', category: 'Basic Info', icon: Home },
  { id: 'property.basic.propertyType', name: 'Property Type', category: 'Basic Info', icon: Home },
  { id: 'property.basic.bedrooms', name: 'Bedrooms', category: 'Basic Info', icon: Home },
  { id: 'property.basic.bathrooms', name: 'Bathrooms', category: 'Basic Info', icon: Home },
  { id: 'property.basic.squareFootage', name: 'Square Footage', category: 'Basic Info', icon: Home },
  { id: 'property.financial.listPrice', name: 'List Price', category: 'Financial', icon: DollarSign },
  { id: 'property.financial.assessedValue', name: 'Assessed Value', category: 'Financial', icon: DollarSign },
  { id: 'property.financial.marketValue', name: 'Market Value', category: 'Financial', icon: DollarSign },
  { id: 'property.owner.name', name: 'Owner Name', category: 'Owner Info', icon: User },
  { id: 'property.owner.company', name: 'Owner Company', category: 'Owner Info', icon: User },
  { id: 'property.dates.lastSaleDate', name: 'Last Sale Date', category: 'Dates', icon: Calendar },
  { id: 'property.dates.recordingDate', name: 'Recording Date', category: 'Dates', icon: Calendar },
];

// ATTOM API endpoints
const ATTOM_ENDPOINTS = [
  {
    id: 'basicprofile',
    name: 'Basic Profile',
    path: '/propertyapi/v1.0.0/property/basicprofile',
    description: 'Basic property information'
  },
  {
    id: 'detail',
    name: 'Property Detail', 
    path: '/propertyapi/v1.0.0/property/detail',
    description: 'Detailed property information'
  },
  {
    id: 'saledetail',
    name: 'Sale Detail',
    path: '/propertyapi/v1.0.0/sale/detail', 
    description: 'Sale history and transaction details'
  },
  {
    id: 'expandedprofile',
    name: 'Expanded Profile',
    path: '/propertyapi/v1.0.0/property/expandedprofile',
    description: 'Comprehensive property data'
  }
];

export function PropertyFieldMapping() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('mapping');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [endpointSchemas, setEndpointSchemas] = useState<EndpointSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [selectedTargetField, setSelectedTargetField] = useState('');
  const [testAddress, setTestAddress] = useState('586 Franklin Ave, Brooklyn, NY');
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing mappings from Supabase
  const loadMappings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/property-field-mappings`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFieldMappings(data.mappings || []);
      }
    } catch (error) {
      console.error('Error loading mappings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save mappings to Supabase
  const saveMappings = useCallback(async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/property-field-mappings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mappings: fieldMappings })
      });

      if (!response.ok) {
        throw new Error('Failed to save mappings');
      }

      // Show success feedback
      setError(null);
    } catch (error) {
      console.error('Error saving mappings:', error);
      setError('Failed to save mappings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [fieldMappings]);

  // Load endpoint schemas
  const loadEndpointSchemas = useCallback(async () => {
    try {
      setIsLoading(true);
      const schemas: EndpointSchema[] = [];

      for (const endpoint of ATTOM_ENDPOINTS) {
        try {
          // Get sample data for each endpoint
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/endpoint-schema`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              endpoint: endpoint.id,
              sampleAddress: testAddress
            })
          });

          if (response.ok) {
            const data = await response.json();
            schemas.push({
              id: endpoint.id,
              name: endpoint.name,
              path: endpoint.path,
              sampleData: data.sampleData,
              fields: extractFieldsFromData(data.sampleData, endpoint.id)
            });
          }
        } catch (error) {
          console.warn(`Failed to load schema for ${endpoint.name}:`, error);
        }
      }

      setEndpointSchemas(schemas);
    } catch (error) {
      console.error('Error loading endpoint schemas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [testAddress]);

  // Extract fields from API response data
  const extractFieldsFromData = (data: any, endpoint: string, prefix = ''): Array<{path: string, type: string, description: string, sampleValue: any}> => {
    const fields: Array<{path: string, type: string, description: string, sampleValue: any}> = [];
    
    const traverse = (obj: any, currentPath: string) => {
      if (obj === null || obj === undefined) return;
      
      if (Array.isArray(obj)) {
        if (obj.length > 0) {
          traverse(obj[0], `${currentPath}[0]`);
        }
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            traverse(obj[key], newPath);
          } else {
            fields.push({
              path: newPath,
              type: Array.isArray(obj[key]) ? 'array' : typeof obj[key],
              description: generateFieldDescription(key, newPath),
              sampleValue: obj[key]
            });
          }
        });
      }
    };

    if (data && data.property && Array.isArray(data.property) && data.property.length > 0) {
      traverse(data.property[0], 'property[0]');
    }

    return fields;
  };

  // Generate field description based on field name and path
  const generateFieldDescription = (fieldName: string, fullPath: string): string => {
    const descriptions: Record<string, string> = {
      'address': 'Property address information',
      'yearBuilt': 'Year the property was built',
      'proptype': 'Property type classification',
      'livingAreaSqFt': 'Living area in square feet',
      'bedsCount': 'Number of bedrooms',
      'bathsTotal': 'Total number of bathrooms',
      'listPrice': 'Current listing price',
      'assessedValue': 'Assessed value for tax purposes',
      'marketValue': 'Estimated market value',
      'ownerName': 'Property owner name',
      'saleDate': 'Date of last sale',
      'recordingDate': 'Date transaction was recorded'
    };

    return descriptions[fieldName] || `${fieldName} from ${fullPath}`;
  };

  // Add new field mapping
  const addMapping = useCallback(() => {
    if (!selectedEndpoint || !selectedTargetField) {
      setError('Please select both source endpoint and target field');
      return;
    }

    const newMapping: FieldMapping = {
      id: `mapping_${Date.now()}`,
      sourceEndpoint: selectedEndpoint,
      sourcePath: '',
      targetField: selectedTargetField,
      displayName: TARGET_FIELDS.find(f => f.id === selectedTargetField)?.name || selectedTargetField,
      dataType: 'string',
      isEnabled: true
    };

    setFieldMappings(prev => [...prev, newMapping]);
    setSelectedEndpoint('');
    setSelectedTargetField('');
    setError(null);
  }, [selectedEndpoint, selectedTargetField]);

  // Remove field mapping
  const removeMapping = useCallback((mappingId: string) => {
    setFieldMappings(prev => prev.filter(m => m.id !== mappingId));
  }, []);

  // Update field mapping
  const updateMapping = useCallback((mappingId: string, updates: Partial<FieldMapping>) => {
    setFieldMappings(prev => 
      prev.map(m => m.id === mappingId ? { ...m, ...updates } : m)
    );
  }, []);

  // Test mappings with preview
  const testMappings = useCallback(async () => {
    if (!testAddress) return;

    try {
      setIsLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/property-field-mappings/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          address: testAddress,
          mappings: fieldMappings 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      }
    } catch (error) {
      console.error('Error testing mappings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [testAddress, fieldMappings]);

  // Load data on component mount
  useEffect(() => {
    loadMappings();
    loadEndpointSchemas();
  }, [loadMappings, loadEndpointSchemas]);

  // Group target fields by category
  const targetFieldsByCategory = TARGET_FIELDS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof TARGET_FIELDS>);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2">
              <ArrowLeftRight className="w-6 h-6 text-primary" />
              Property Field Mapping Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure how ATTOM API endpoint data maps to property overview fields
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadEndpointSchemas} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={saveMappings} disabled={isSaving || fieldMappings.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Mappings'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mapping" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Field Mapping
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 w-4" />
              Live Preview
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              API Endpoints
            </TabsTrigger>
          </TabsList>

          {/* Field Mapping Tab */}
          <TabsContent value="mapping" className="space-y-6">
            {/* Add New Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Field Mapping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Endpoint</Label>
                    <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ATTOM API endpoint" />
                      </SelectTrigger>
                      <SelectContent>
                        {ATTOM_ENDPOINTS.map(endpoint => (
                          <SelectItem key={endpoint.id} value={endpoint.id}>
                            {endpoint.name} - {endpoint.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Field</Label>
                    <Select value={selectedTargetField} onValueChange={setSelectedTargetField}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target field" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(targetFieldsByCategory).map(([category, fields]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                              {category}
                            </div>
                            {fields.map(field => (
                              <SelectItem key={field.id} value={field.id}>
                                <div className="flex items-center gap-2">
                                  <field.icon className="w-4 h-4" />
                                  {field.name}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={addMapping} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Mapping
                </Button>
              </CardContent>
            </Card>

            {/* Existing Mappings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-primary" />
                    Field Mappings
                  </div>
                  <Badge variant="outline">
                    {fieldMappings.length} mappings
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fieldMappings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No field mappings configured yet.</p>
                    <p className="text-sm">Add your first mapping above to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fieldMappings.map(mapping => (
                      <div key={mapping.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{mapping.displayName}</h4>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline">{mapping.sourceEndpoint}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateMapping(mapping.id, { isEnabled: !mapping.isEnabled })}
                            >
                              {mapping.isEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeMapping(mapping.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label>Source Path</Label>
                            <Input
                              placeholder="e.g., property[0].address.oneLine"
                              value={mapping.sourcePath}
                              onChange={(e) => updateMapping(mapping.id, { sourcePath: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Data Type</Label>
                            <Select
                              value={mapping.dataType}
                              onValueChange={(value: any) => updateMapping(mapping.id, { dataType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Transform Function (Optional)</Label>
                            <Input
                              placeholder="e.g., value => value.toUpperCase()"
                              value={mapping.transformFunction || ''}
                              onChange={(e) => updateMapping(mapping.id, { transformFunction: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Test Address</Label>
                    <Input
                      value={testAddress}
                      onChange={(e) => setTestAddress(e.target.value)}
                      placeholder="Enter property address for testing"
                    />
                  </div>
                  <Button onClick={testMappings} disabled={isLoading || !testAddress}>
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    Test Mappings
                  </Button>
                </div>

                {previewData && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">Mapped Property Data Preview</h4>
                    <PropertyOverviewWithAttomData
                      propertyAddress={testAddress}
                      customMappings={fieldMappings}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {endpointSchemas.map(schema => (
                <Card key={schema.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      {schema.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Endpoint Path</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 p-2 bg-muted rounded text-sm">{schema.path}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigator.clipboard.writeText(schema.path)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Available Fields</Label>
                        <ScrollArea className="h-48 mt-2 border rounded">
                          <div className="p-2 space-y-1">
                            {schema.fields.map((field, index) => (
                              <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded text-sm">
                                <div className="flex-1">
                                  <div className="font-mono">{field.path}</div>
                                  <div className="text-xs text-muted-foreground">{field.description}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {field.type}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigator.clipboard.writeText(field.path)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
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