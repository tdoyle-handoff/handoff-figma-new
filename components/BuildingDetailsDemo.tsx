import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Building, 
  Database, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Info,
  RefreshCw,
  Download
} from 'lucide-react';
import { BuildingDetailsFromApiResponse } from './BuildingDetailsFromApiResponse';
import { 
  extractBuildingDetailsFromAnyResponse,
  extractBuildingDetailsFromPropertyDetail,
  extractBuildingDetailsFromBasicProfile,
  mergeBuildingDetails,
  getBuildingSummary,
  validateBuildingDetails,
  type ExtractedBuildingDetails
} from '../utils/buildingDetailsExtractor';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BuildingDetailsDemoProps {
  className?: string;
  defaultAddress?: string;
}

export function BuildingDetailsDemo({ 
  className = '',
  defaultAddress = '586 Franklin Ave, Brooklyn, NY 11238'
}: BuildingDetailsDemoProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponses, setApiResponses] = useState<Record<string, any>>({});
  const [extractedDetails, setExtractedDetails] = useState<Record<string, ExtractedBuildingDetails>>({});
  const [mergedDetails, setMergedDetails] = useState<ExtractedBuildingDetails | null>(null);

  const endpoints = [
    {
      id: 'basicprofile',
      name: 'Basic Profile',
      path: '/propertyapi/v1.0.0/property/basicprofile',
      description: 'Basic property information including core building details'
    },
    {
      id: 'detail',
      name: 'Property Detail',
      path: '/propertyapi/v1.0.0/property/detail',
      description: 'Comprehensive property details with extensive building information'
    },
    {
      id: 'expandedprofile',
      name: 'Expanded Profile',
      path: '/propertyapi/v1.0.0/property/expandedprofile',
      description: 'Complete property profile with all available building data'
    }
  ];

  const fetchPropertyData = async () => {
    if (!address.trim()) return;

    setIsLoading(true);
    const responses: Record<string, any> = {};
    const details: Record<string, ExtractedBuildingDetails> = {};

    try {
      // Parse address for API parameters
      const addressParts = address.split(',');
      const address1 = addressParts[0]?.trim() || '';
      const address2 = addressParts.slice(1).join(',').trim() || '';

      if (!address1 || !address2) {
        throw new Error('Please provide a complete address with street and city/state');
      }

      // Test each endpoint
      for (const endpoint of endpoints) {
        try {
          const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/test-endpoint`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              endpoint: endpoint.path,
              address1,
              address2
            })
          });

          if (response.ok) {
            const data = await response.json();
            responses[endpoint.id] = data;

            // Extract building details from this response
            switch (endpoint.id) {
              case 'basicprofile':
                details[endpoint.id] = extractBuildingDetailsFromBasicProfile(data);
                break;
              case 'detail':
                details[endpoint.id] = extractBuildingDetailsFromPropertyDetail(data);
                break;
              default:
                details[endpoint.id] = extractBuildingDetailsFromAnyResponse(data);
            }
          } else {
            responses[endpoint.id] = { error: `HTTP ${response.status}: ${response.statusText}` };
            details[endpoint.id] = { 
              dataSource: endpoint.id,
              extractedAt: new Date().toISOString(),
              apiEndpoint: endpoint.path
            };
          }
        } catch (error) {
          responses[endpoint.id] = { error: error instanceof Error ? error.message : 'Unknown error' };
          details[endpoint.id] = { 
            dataSource: endpoint.id,
            extractedAt: new Date().toISOString(),
            apiEndpoint: endpoint.path
          };
        }

        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Merge all building details
      const validDetails = Object.values(details).filter(d => 
        Object.keys(d).length > 3 // More than just metadata fields
      );

      const merged = mergeBuildingDetails(...validDetails);
      setMergedDetails(merged);

    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setApiResponses(responses);
      setExtractedDetails(details);
      setIsLoading(false);
    }
  };

  const getEndpointStatus = (endpointId: string) => {
    const response = apiResponses[endpointId];
    const details = extractedDetails[endpointId];
    
    if (!response) return { status: 'pending', color: 'secondary' };
    if (response.error) return { status: 'error', color: 'destructive' };
    
    const validation = validateBuildingDetails(details || {});
    if (validation.completionPercentage > 80) return { status: 'excellent', color: 'default' };
    if (validation.completionPercentage > 50) return { status: 'good', color: 'secondary' };
    if (validation.completionPercentage > 20) return { status: 'partial', color: 'outline' };
    return { status: 'minimal', color: 'destructive' };
  };

  const exportBuildingDetails = () => {
    if (!mergedDetails) return;

    const dataStr = JSON.stringify(mergedDetails, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `building-details-${address.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Building Details Extraction Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter property address..."
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <Button 
              onClick={fetchPropertyData} 
              disabled={isLoading || !address.trim()}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Fetch Building Details
            </Button>
          </div>

          {/* Endpoint Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {endpoints.map(endpoint => {
              const { status, color } = getEndpointStatus(endpoint.id);
              const details = extractedDetails[endpoint.id];
              const validation = details ? validateBuildingDetails(details) : null;

              return (
                <Card key={endpoint.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{endpoint.name}</h4>
                    <Badge variant={color as any}>{status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {endpoint.description}
                  </p>
                  {validation && (
                    <div className="text-xs">
                      <div className="flex items-center justify-between">
                        <span>Completion:</span>
                        <span className="font-medium">{validation.completionPercentage}%</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Merged Summary */}
          {mergedDetails && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Merged Building Summary</h4>
                  <Button variant="outline" size="sm" onClick={exportBuildingDetails}>
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getBuildingSummary(mergedDetails)}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Sources: {mergedDetails.dataSource}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {Object.keys(apiResponses).length > 0 && (
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visual">Visual Display</TabsTrigger>
            <TabsTrigger value="basicprofile">Basic Profile</TabsTrigger>
            <TabsTrigger value="detail">Property Detail</TabsTrigger>
            <TabsTrigger value="expandedprofile">Expanded Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            <BuildingDetailsFromApiResponse 
              propertyDetailResponse={apiResponses.detail}
              showAllDetails={true}
            />
          </TabsContent>

          {endpoints.map(endpoint => (
            <TabsContent key={endpoint.id} value={endpoint.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {endpoint.name} - Extracted Building Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {apiResponses[endpoint.id]?.error ? (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <strong>Error:</strong> {apiResponses[endpoint.id].error}
                      </AlertDescription>
                    </Alert>
                  ) : extractedDetails[endpoint.id] ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Building details successfully extracted
                        </span>
                        {(() => {
                          const validation = validateBuildingDetails(extractedDetails[endpoint.id]);
                          return (
                            <Badge variant="outline">
                              {validation.completionPercentage}% complete
                            </Badge>
                          );
                        })()}
                      </div>
                      
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                        {JSON.stringify(extractedDetails[endpoint.id], null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No building details extracted yet. Try fetching data for this endpoint.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This demo shows how building details are extracted from different ATTOM API endpoints. 
          The Property Detail endpoint typically provides the most comprehensive building information, 
          while Basic Profile offers essential details, and Expanded Profile includes additional features.
        </AlertDescription>
      </Alert>
    </div>
  );
}