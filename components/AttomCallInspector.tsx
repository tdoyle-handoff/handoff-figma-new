import { Fragment } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Play, 
  Copy, 
  Settings, 
  Eye, 
  Code, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Edit3,
  Trash2,
  Plus,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Database
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AttomEndpoint {
  id: string;
  name: string;
  path: string;
  description: string;
  category: 'basic' | 'detail' | 'expanded' | 'market' | 'risk' | 'utility';
  parameters: {
    required: string[];
    optional: string[];
  };
}

interface ApiCall {
  id: string;
  timestamp: string;
  endpoint: AttomEndpoint;
  method: string;
  url: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  status: number | null;
  responseTime: number | null;
  response: any;
  error: string | null;
}

interface CallConfiguration {
  endpoint: AttomEndpoint;
  customHeaders: Record<string, string>;
  queryParams: Record<string, string>;
  address1?: string;
  address2?: string;
  attomId?: string;
}

const ATTOM_ENDPOINTS: AttomEndpoint[] = [
  {
    id: 'basic-profile',
    name: 'Basic Profile',
    path: '/property/basicprofile',
    description: 'Get basic property information including ownership, tax, and basic characteristics',
    category: 'basic',
    parameters: {
      required: ['address1', 'address2'],
      optional: ['oneline', 'geoid']
    }
  },
  {
    id: 'property-detail',
    name: 'Property Detail',
    path: '/property/detail',
    description: 'Get detailed property information including building details, lot info, and assessments',
    category: 'detail',
    parameters: {
      required: ['address1', 'address2'],
      optional: ['attomid']
    }
  },
  {
    id: 'expanded-profile',
    name: 'Expanded Profile',
    path: '/property/expandedprofile',
    description: 'Get comprehensive property data including historical information',
    category: 'expanded',
    parameters: {
      required: ['attomid'],
      optional: []
    }
  },
  {
    id: 'sale-detail',
    name: 'Sale Detail',
    path: '/sale/detail',
    description: 'Get property sale transaction details',
    category: 'market',
    parameters: {
      required: ['address1', 'address2'],
      optional: ['attomid']
    }
  },
  {
    id: 'sales-history',
    name: 'Sales History',
    path: '/saleshistory/detail',
    description: 'Get historical sales data for a property',
    category: 'market',
    parameters: {
      required: ['address1', 'address2'],
      optional: ['attomid']
    }
  },
  {
    id: 'avm-detail',
    name: 'AVM Detail',
    path: '/avm/detail',
    description: 'Get automated valuation model data',
    category: 'market',
    parameters: {
      required: ['address1', 'address2'],
      optional: ['attomid']
    }
  }
];

const DEFAULT_HEADERS = {
  'accept': 'application/json',
  'User-Agent': 'Handoff-RealEstate/1.0'
};

export function AttomCallInspector() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<AttomEndpoint>(ATTOM_ENDPOINTS[0]);
  const [callHistory, setCallHistory] = useState<ApiCall[]>([]);
  const [currentCall, setCurrentCall] = useState<ApiCall | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [configuration, setConfiguration] = useState<CallConfiguration>({
    endpoint: ATTOM_ENDPOINTS[0],
    customHeaders: { ...DEFAULT_HEADERS },
    queryParams: {},
    address1: '4529 Winona Court',
    address2: 'Denver, CO'
  });

  // Update configuration when endpoint changes
  useEffect(() => {
    setConfiguration(prev => ({
      ...prev,
      endpoint: selectedEndpoint,
      queryParams: {}
    }));
  }, [selectedEndpoint]);

  const buildApiUrl = (config: CallConfiguration): string => {
    const baseUrl = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';
    const url = new URL(`${baseUrl}${config.endpoint.path}`);
    
    // Add query parameters
    Object.entries(config.queryParams).forEach(([key, value]) => {
      if (value && value.trim()) {
        url.searchParams.append(key, value);
      }
    });

    // Add address parameters if provided
    if (config.address1) {
      url.searchParams.append('address1', config.address1);
    }
    if (config.address2) {
      url.searchParams.append('address2', config.address2);
    }
    if (config.attomId) {
      url.searchParams.append('attomid', config.attomId);
    }

    return url.toString();
  };

  const executeApiCall = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    const newCall: ApiCall = {
      id: `call_${Date.now()}`,
      timestamp: new Date().toISOString(),
      endpoint: configuration.endpoint,
      method: 'GET',
      url: buildApiUrl(configuration),
      headers: { ...configuration.customHeaders },
      queryParams: { ...configuration.queryParams },
      status: null,
      responseTime: null,
      response: null,
      error: null
    };

    try {
      console.log('🚀 ATTOM API Call Inspector - Making Request:');
      console.log('URL:', newCall.url);
      console.log('Headers:', newCall.headers);
      console.log('Configuration:', configuration);

      // Make the API call through our call inspector backend
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-call-inspector/inspect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: configuration.endpoint.path,
          address1: configuration.address1,
          address2: configuration.address2,
          attomid: configuration.attomId,
          queryParams: configuration.queryParams,
          customHeaders: configuration.customHeaders
        })
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      newCall.status = response.status;
      newCall.responseTime = responseTime;

      // Extract the actual inspection data
      if (responseData.success && responseData.inspection) {
        newCall.response = responseData.inspection;
        // Override with actual ATTOM API response details
        if (responseData.inspection.response) {
          newCall.status = responseData.inspection.response.status;
          newCall.responseTime = responseData.inspection.response.responseTime;
        }
      } else {
        newCall.response = responseData;
      }

      if (!response.ok) {
        newCall.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      console.log('✅ ATTOM API Call Inspector - Response Received:');
      console.log('Status:', response.status);
      console.log('Response Time:', `${responseTime}ms`);
      console.log('Response Data:', responseData);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      newCall.responseTime = responseTime;
      newCall.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ ATTOM API Call Inspector - Error:', error);
    }

    // Update call history and current call
    setCallHistory(prev => [newCall, ...prev.slice(0, 49)]); // Keep last 50 calls
    setCurrentCall(newCall);
    setIsLoading(false);
  };

  const updateQueryParam = (key: string, value: string) => {
    setConfiguration(prev => ({
      ...prev,
      queryParams: {
        ...prev.queryParams,
        [key]: value
      }
    }));
  };

  const updateHeader = (key: string, value: string) => {
    setConfiguration(prev => ({
      ...prev,
      customHeaders: {
        ...prev.customHeaders,
        [key]: value
      }
    }));
  };

  const removeQueryParam = (key: string) => {
    setConfiguration(prev => {
      const newParams = { ...prev.queryParams };
      delete newParams[key];
      return {
        ...prev,
        queryParams: newParams
      };
    });
  };

  const addQueryParam = () => {
    const key = prompt('Parameter name:');
    if (key && key.trim()) {
      updateQueryParam(key.trim(), '');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportCallHistory = () => {
    const dataStr = JSON.stringify(callHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `attom-api-calls-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatResponseSize = (response: any): string => {
    const sizeBytes = new Blob([JSON.stringify(response)]).size;
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      detail: 'bg-green-100 text-green-800',
      expanded: 'bg-purple-100 text-purple-800',
      market: 'bg-orange-100 text-orange-800',
      risk: 'bg-red-100 text-red-800',
      utility: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.basic;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ATTOM API Call Inspector</h1>
            <p className="text-muted-foreground mt-1">
              View, edit, and test ATTOM API calls with detailed request/response inspection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={exportCallHistory}
              variant="outline"
              size="sm"
              disabled={callHistory.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export History
            </Button>
            <Button
              onClick={() => window.open('https://api.developer.attomdata.com/docs', '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              API Docs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Request Configuration
                </CardTitle>
                <CardDescription>
                  Configure your ATTOM API request parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Endpoint Selection */}
                <div className="space-y-2">
                  <Label>Endpoint</Label>
                  <Select
                    value={selectedEndpoint.id}
                    onValueChange={(value) => {
                      const endpoint = ATTOM_ENDPOINTS.find(e => e.id === value);
                      if (endpoint) setSelectedEndpoint(endpoint);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTOM_ENDPOINTS.map((endpoint) => (
                        <SelectItem key={endpoint.id} value={endpoint.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={getCategoryColor(endpoint.category)}>
                              {endpoint.category}
                            </Badge>
                            {endpoint.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {selectedEndpoint.description}
                  </p>
                </div>

                {/* Address Parameters */}
                {selectedEndpoint.parameters.required.includes('address1') && (
                  <div className="space-y-2">
                    <Label>Address Line 1 *</Label>
                    <Input
                      value={configuration.address1 || ''}
                      onChange={(e) => setConfiguration(prev => ({
                        ...prev,
                        address1: e.target.value
                      }))}
                      placeholder="e.g., 4529 Winona Court"
                    />
                  </div>
                )}

                {selectedEndpoint.parameters.required.includes('address2') && (
                  <div className="space-y-2">
                    <Label>Address Line 2 *</Label>
                    <Input
                      value={configuration.address2 || ''}
                      onChange={(e) => setConfiguration(prev => ({
                        ...prev,
                        address2: e.target.value
                      }))}
                      placeholder="e.g., Denver, CO"
                    />
                  </div>
                )}

                {selectedEndpoint.parameters.required.includes('attomid') && (
                  <div className="space-y-2">
                    <Label>ATTOM ID *</Label>
                    <Input
                      value={configuration.attomId || ''}
                      onChange={(e) => setConfiguration(prev => ({
                        ...prev,
                        attomId: e.target.value
                      }))}
                      placeholder="e.g., 169834420"
                    />
                  </div>
                )}

                {/* Query Parameters */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Query Parameters</Label>
                    <Button onClick={addQueryParam} size="sm" variant="outline">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {Object.keys(configuration.queryParams).length === 0 && (
                    <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      💡 <strong>Tip:</strong> Most ATTOM endpoints work best without additional query parameters. 
                      The debug parameter has been removed by default as it can cause API calls to fail.
                    </div>
                  )}
                  <div className="space-y-2">
                    {Object.entries(configuration.queryParams).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Input
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const oldParams = { ...configuration.queryParams };
                            delete oldParams[key];
                            setConfiguration(prev => ({
                              ...prev,
                              queryParams: {
                                ...oldParams,
                                [newKey]: value
                              }
                            }));
                          }}
                          className="flex-1"
                          placeholder="Parameter name"
                        />
                        <Input
                          value={value}
                          onChange={(e) => updateQueryParam(key, e.target.value)}
                          className="flex-1"
                          placeholder="Value"
                        />
                        <Button
                          onClick={() => removeQueryParam(key)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execute Button */}
                <Button
                  onClick={executeApiCall}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <Fragment>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Making Request...
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Play className="w-4 h-4 mr-2" />
                      Execute API Call
                    </Fragment>
                  )}
                </Button>

                {/* Generated URL Preview */}
                <div className="space-y-2">
                  <Label>Generated URL</Label>
                  <div className="relative">
                    <Textarea
                      value={buildApiUrl(configuration)}
                      readOnly
                      className="text-xs font-mono min-h-[80px] resize-none"
                    />
                    <Button
                      onClick={() => copyToClipboard(buildApiUrl(configuration))}
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Headers Preview */}
                <div className="space-y-2">
                  <Label>Request Headers</Label>
                  <div className="relative">
                    <Textarea
                      value={JSON.stringify({
                        ...configuration.customHeaders,
                        apikey: '[YOUR_API_KEY]'
                      }, null, 2)}
                      readOnly
                      className="text-xs font-mono min-h-[100px] resize-none"
                    />
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(configuration.customHeaders, null, 2))}
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Response and History */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="response" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="response">Current Response</TabsTrigger>
                <TabsTrigger value="history">Call History</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              {/* Current Response Tab */}
              <TabsContent value="response" className="space-y-4">
                {currentCall ? (
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {currentCall.status && currentCall.status < 400 ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                          {currentCall.endpoint.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={currentCall.status && currentCall.status < 400 ? "default" : "destructive"}>
                            {currentCall.status || 'ERROR'}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {currentCall.responseTime}ms
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {new Date(currentCall.timestamp).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="formatted" className="w-full">
                        <TabsList>
                          <TabsTrigger value="formatted">Formatted</TabsTrigger>
                          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                          <TabsTrigger value="headers">Headers</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="formatted" className="mt-4">
                          {currentCall.error ? (
                            <Alert variant="destructive">
                              <AlertCircle className="w-4 h-4" />
                              <AlertDescription>{currentCall.error}</AlertDescription>
                            </Alert>
                          ) : (
                            <div className="space-y-4">
                              {/* Inspection Summary */}
                              {currentCall.response?.summary && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="text-lg font-semibold">
                                      {currentCall.response.summary.success ? (
                                        <span className="text-green-600">Success</span>
                                      ) : (
                                        <span className="text-red-600">Failed</span>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Status</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold">{currentCall.response.summary.responseTime}ms</div>
                                    <div className="text-sm text-muted-foreground">Response Time</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold">{currentCall.response.summary.dataSize}</div>
                                    <div className="text-sm text-muted-foreground">Data Size</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold">
                                      {currentCall.response.summary.hasData ? 'Yes' : 'No'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Has Data</div>
                                  </div>
                                </div>
                              )}

                              {/* ATTOM Message */}
                              {currentCall.response?.summary?.attomMessage && (
                                <Alert>
                                  <AlertCircle className="w-4 h-4" />
                                  <AlertDescription>
                                    <strong>ATTOM API:</strong> {currentCall.response.summary.attomMessage}
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Request/Response Tabs */}
                              <Tabs defaultValue="response-data" className="w-full">
                                <TabsList>
                                  <TabsTrigger value="response-data">Response Data</TabsTrigger>
                                  <TabsTrigger value="request-details">Request Details</TabsTrigger>
                                  <TabsTrigger value="response-details">Response Details</TabsTrigger>
                                </TabsList>

                                <TabsContent value="response-data" className="mt-4">
                                  <ScrollArea className="h-[500px] w-full border rounded-lg p-4">
                                    <pre className="text-xs">
                                      {JSON.stringify(
                                        currentCall.response?.response?.data || currentCall.response?.data || currentCall.response, 
                                        null, 
                                        2
                                      )}
                                    </pre>
                                  </ScrollArea>
                                </TabsContent>

                                <TabsContent value="request-details" className="mt-4">
                                  <ScrollArea className="h-[500px] w-full border rounded-lg p-4">
                                    <pre className="text-xs">
                                      {JSON.stringify(currentCall.response?.request || {
                                        url: currentCall.url,
                                        method: currentCall.method,
                                        headers: currentCall.headers
                                      }, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                </TabsContent>

                                <TabsContent value="response-details" className="mt-4">
                                  <ScrollArea className="h-[500px] w-full border rounded-lg p-4">
                                    <pre className="text-xs">
                                      {JSON.stringify(currentCall.response?.response || {
                                        status: currentCall.status,
                                        responseTime: currentCall.responseTime
                                      }, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="raw" className="mt-4">
                          <div className="relative">
                            <ScrollArea className="h-[600px] w-full border rounded-lg p-4">
                              <pre className="text-xs font-mono">
                                {JSON.stringify(currentCall.response, null, 2)}
                              </pre>
                            </ScrollArea>
                            <Button
                              onClick={() => copyToClipboard(JSON.stringify(currentCall.response, null, 2))}
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="headers" className="mt-4">
                          <div className="space-y-4">
                            <div>
                              <Label>Request Headers</Label>
                              <ScrollArea className="h-[200px] w-full border rounded-lg p-4 mt-2">
                                <pre className="text-xs">
                                  {JSON.stringify(currentCall.headers, null, 2)}
                                </pre>
                              </ScrollArea>
                            </div>
                            <div>
                              <Label>Request URL</Label>
                              <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                                {currentCall.url}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center text-muted-foreground">
                        <Database className="w-8 h-8 mx-auto mb-2" />
                        <p>No API call made yet</p>
                        <p className="text-sm">Configure your request and click "Execute API Call"</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Call History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent API Calls</CardTitle>
                    <CardDescription>
                      {callHistory.length} calls made in this session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {callHistory.length > 0 ? (
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                          {callHistory.map((call) => (
                            <div
                              key={call.id}
                              className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setCurrentCall(call)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={call.status && call.status < 400 ? "default" : "destructive"}>
                                    {call.status || 'ERROR'}
                                  </Badge>
                                  <span className="font-medium">{call.endpoint.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {call.responseTime}ms
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(call.timestamp).toLocaleString()}
                              </div>
                              <div className="text-xs font-mono mt-1 truncate">
                                {call.url}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Clock className="w-8 h-8 mx-auto mb-2" />
                        <p>No API calls made yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Call Analysis</CardTitle>
                    <CardDescription>
                      Performance and success rate statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {callHistory.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {callHistory.filter(call => call.status && call.status < 400).length}
                            <span className="text-sm font-normal text-muted-foreground">
                              /{callHistory.length}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">Successful Calls</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {Math.round(callHistory.reduce((acc, call) => acc + (call.responseTime || 0), 0) / callHistory.length)}ms
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Response Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {Math.round((callHistory.filter(call => call.status && call.status < 400).length / callHistory.length) * 100)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Eye className="w-8 h-8 mx-auto mb-2" />
                        <p>No data to analyze yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>🎉 Authentication Fixed:</strong> API calls now use the correct ATTOM header-based authentication format 
            (<code>apikey</code> in headers). The debug parameter has been removed by default as it was causing 401 errors. 
            Ensure your ATTOM API key is properly set in the environment variables.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}