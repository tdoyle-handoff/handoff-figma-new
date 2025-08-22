import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Search,
  Copy,
  Home,
  MapPin,
  DollarSign,
  TrendingUp,
  Info
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TestResult {
  success: boolean;
  endpoint: string;
  duration: number;
  status: number;
  data: any;
  error?: string;
  timestamp: string;
}

interface AddressComponents {
  address1: string;
  address2: string;
  city?: string;
  state?: string;
  postalcode?: string;
  original: string;
}

export function AttomApiTestTool() {
  const [testAddress, setTestAddress] = useState('11 Village Street, Deep River, CT 06412');
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [isTestingSingle, setIsTestingSingle] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [addressAnalysis, setAddressAnalysis] = useState<AddressComponents | null>(null);

  // Common test addresses with different formats
  const testAddresses = [
    '11 Village Street, Deep River, CT 06412',
    '123 Main Street, Anytown, CA 90210',
    '456 Oak Avenue, Unit 4B, Springfield, TX 75001',
    '789 Elm Drive, Denver, CO 80202',
    '1000 Maple Lane, Riverside, FL 33101',
    '555 Broadway, New York, NY 10012',
    '2000 University Avenue, Berkeley, CA 94720',
    '300 North Michigan Avenue, Chicago, IL 60601',
    '1234 Sunset Boulevard, Los Angeles, CA 90028',
    '567 Commonwealth Avenue, Boston, MA 02115'
  ];

  // Parse address on the frontend to show how server would process it
  const parseAddressClient = (fullAddress: string): AddressComponents => {
    const normalized = fullAddress.trim().replace(/\s+/g, ' ');
    const commaParts = normalized.split(',').map(part => part.trim()).filter(part => part.length > 0);
    
    if (commaParts.length >= 3) {
      const address1 = commaParts[0];
      const city = commaParts[1];
      const stateZip = commaParts[2];
      
      const stateZipMatch = stateZip.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/);
      let state = '';
      let postalcode = '';
      
      if (stateZipMatch) {
        state = stateZipMatch[1];
        postalcode = stateZipMatch[2];
      }
      
      return {
        address1,
        address2: `${city}, ${state} ${postalcode}`.trim(),
        city,
        state,
        postalcode,
        original: fullAddress
      };
    }
    
    if (commaParts.length === 2) {
      const address1 = commaParts[0];
      const cityStateZip = commaParts[1];
      
      const cityStateZipMatch = cityStateZip.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      if (cityStateZipMatch) {
        const city = cityStateZipMatch[1];
        const state = cityStateZipMatch[2];
        const postalcode = cityStateZipMatch[3];
        
        return {
          address1,
          address2: `${city}, ${state} ${postalcode}`,
          city,
          state,
          postalcode,
          original: fullAddress
        };
      }
      
      return {
        address1,
        address2: cityStateZip,
        original: fullAddress
      };
    }
    
    return {
      address1: normalized,
      address2: 'United States',
      original: fullAddress
    };
  };

  // Update address analysis when address changes
  React.useEffect(() => {
    if (testAddress) {
      setAddressAnalysis(parseAddressClient(testAddress));
    }
  }, [testAddress]);

  // Test a single endpoint
  const testEndpoint = async (endpoint: string, address: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/${endpoint}`;
      let requestUrl = url;
      
      if (endpoint === 'search-by-address') {
        requestUrl = `${url}?address=${encodeURIComponent(address)}`;
      } else if (endpoint === 'valuation') {
        requestUrl = `${url}?address=${encodeURIComponent(address)}`;
      } else if (endpoint === 'comparables') {
        requestUrl = `${url}?address=${encodeURIComponent(address)}&radius=0.5`;
      }
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const duration = Date.now() - startTime;
      const data = await response.json();
      
      return {
        success: response.ok && data.success,
        endpoint,
        duration,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        endpoint,
        duration,
        status: 0,
        data: null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };

  // Test all endpoints with current address
  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    
    const endpoints = ['search-by-address', 'valuation', 'comparables'];
    const results: TestResult[] = [];
    
    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint}...`);
      const result = await testEndpoint(endpoint, testAddress);
      results.push(result);
      setTestResults([...results]); // Update incrementally
    }
    
    setIsTestingAll(false);
  };

  // Test single endpoint
  const testSingleEndpoint = async (endpoint: string) => {
    setIsTestingSingle(true);
    
    const result = await testEndpoint(endpoint, testAddress);
    setTestResults(prev => [result, ...prev.filter(r => r.endpoint !== endpoint)]);
    
    setIsTestingSingle(false);
  };

  // Run comprehensive test with multiple addresses
  const runComprehensiveTest = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    
    const allResults: TestResult[] = [];
    
    for (const address of testAddresses.slice(0, 5)) { // Test first 5 addresses
      console.log(`Testing address: ${address}`);
      
      // Test search-by-address endpoint for each address
      const result = await testEndpoint('search-by-address', address);
      allResults.push({
        ...result,
        endpoint: `search-by-address (${address.substring(0, 30)}...)`
      });
      setTestResults([...allResults]);
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsTestingAll(false);
  };

  // Copy result to clipboard
  const copyResult = (result: TestResult) => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  // Get status badge for result
  const getResultBadge = (result: TestResult) => {
    if (result.success) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Success</Badge>;
    } else if (result.status === 0) {
      return <Badge variant="destructive">Network Error</Badge>;
    } else {
      return <Badge variant="destructive">API Error</Badge>;
    }
  };

  // Get error explanation
  const getErrorExplanation = (result: TestResult) => {
    if (result.success) return null;
    
    if (result.data?.error?.code === 'PROPERTY_NOT_FOUND') {
      return (
        <Alert className="bg-blue-50 border-blue-200 mt-2">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Property Not Found:</strong> This is normal - the address may not exist in the Attom database or may be a new property.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (result.data?.error?.code === 'VALUATION_ERROR' || result.data?.error?.code === 'VALUATION_NOT_FOUND') {
      return (
        <Alert className="bg-yellow-50 border-yellow-200 mt-2">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            <strong>Valuation Unavailable:</strong> AVM data is not available for all properties. This is normal.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (result.status === 400 && result.data?.includes?.('Address1 and Address2 are required')) {
      return (
        <Alert className="bg-red-50 border-red-200 mt-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>API Parameter Error:</strong> The address parsing is not providing the required parameters correctly.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (result.status === 404) {
      return (
        <Alert className="bg-red-50 border-red-200 mt-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Endpoint Not Found:</strong> The API endpoint may be incorrect or the service may be down.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Search className="w-8 h-8 text-primary" />
          Attom API Test Tool
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing tool for the Attom Data API integration with detailed error analysis and debugging information.
        </p>
      </div>

      <Tabs defaultValue="single-test" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single-test">Single Test</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Single Test Tab */}
        <TabsContent value="single-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Single Address Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-address">Test Address</Label>
                <Input
                  id="test-address"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="Enter a property address..."
                  className="mt-1"
                />
              </div>

              {/* Address Analysis */}
              {addressAnalysis && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Address Parsing Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Address1:</strong> {addressAnalysis.address1}
                      </div>
                      <div>
                        <strong>Address2:</strong> {addressAnalysis.address2}
                      </div>
                      {addressAnalysis.city && (
                        <div>
                          <strong>City:</strong> {addressAnalysis.city}
                        </div>
                      )}
                      {addressAnalysis.state && (
                        <div>
                          <strong>State:</strong> {addressAnalysis.state}
                        </div>
                      )}
                      {addressAnalysis.postalcode && (
                        <div>
                          <strong>ZIP:</strong> {addressAnalysis.postalcode}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={testAllEndpoints} 
                  disabled={isTestingAll || !testAddress.trim()}
                  className="flex-1 min-w-[200px]"
                >
                  {isTestingAll ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Test All Endpoints
                </Button>
                
                <Button 
                  onClick={() => testSingleEndpoint('search-by-address')} 
                  disabled={isTestingSingle || !testAddress.trim()}
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Property Search
                </Button>
                
                <Button 
                  onClick={() => testSingleEndpoint('valuation')} 
                  disabled={isTestingSingle || !testAddress.trim()}
                  variant="outline"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Valuation
                </Button>
                
                <Button 
                  onClick={() => testSingleEndpoint('comparables')} 
                  disabled={isTestingSingle || !testAddress.trim()}
                  variant="outline"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Comparables
                </Button>
              </div>

              {/* Quick Test Addresses */}
              <div>
                <Label className="text-sm font-medium">Quick Test Addresses:</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {testAddresses.slice(0, 6).map((address, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setTestAddress(address)}
                      className="text-xs"
                    >
                      {address.split(',')[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comprehensive Test Tab */}
        <TabsContent value="comprehensive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Comprehensive Testing
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test multiple addresses to evaluate API reliability and performance.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Test Addresses ({testAddresses.length})</h4>
                  <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
                    {testAddresses.map((address, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                        {address}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Test Configuration</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Endpoints:</strong> search-by-address</p>
                    <p><strong>Addresses:</strong> First 5 from test set</p>
                    <p><strong>Delay:</strong> 500ms between requests</p>
                    <p><strong>Timeout:</strong> 30 seconds per request</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={runComprehensiveTest} 
                disabled={isTestingAll}
                className="w-full"
              >
                {isTestingAll ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Run Comprehensive Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Test Results ({testResults.length})
                </CardTitle>
                <Button 
                  onClick={() => setTestResults([])} 
                  variant="outline" 
                  size="sm"
                >
                  Clear Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-4">
                  {testResults.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No test results yet. Run some tests to see results here.
                    </p>
                  ) : (
                    testResults.map((result, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{result.endpoint}</h4>
                            {getResultBadge(result)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{result.duration}ms</span>
                            <Button
                              onClick={() => copyResult(result)}
                              size="sm"
                              variant="ghost"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-2">
                          <div className="flex items-center gap-4">
                            <span><strong>Status:</strong> {result.status}</span>
                            <span><strong>Duration:</strong> {result.duration}ms</span>
                            <span><strong>Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}</span>
                          </div>
                          
                          {result.error && (
                            <div className="text-red-600">
                              <strong>Error:</strong> {result.error}
                            </div>
                          )}
                          
                          {result.data?.error && (
                            <div className="text-red-600">
                              <strong>API Error:</strong> {result.data.error.message}
                              {result.data.error.code && (
                                <span className="ml-2 text-xs">({result.data.error.code})</span>
                              )}
                            </div>
                          )}
                          
                          {result.success && result.data?.data && (
                            <div className="text-green-600">
                              <strong>Success:</strong> Data received
                              {result.data.data.id && (
                                <span className="ml-2 text-xs">(ID: {result.data.data.id})</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {getErrorExplanation(result)}
                        
                        <details className="mt-3">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            Show raw response
                          </summary>
                          <ScrollArea className="h-32 w-full mt-2">
                            <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </ScrollArea>
                        </details>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {Math.round((testResults.filter(r => r.success).length / testResults.length) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testResults.filter(r => r.success).length} of {testResults.length} successful
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Successful:</span>
                        <span className="text-green-600">{testResults.filter(r => r.success).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Failed:</span>
                        <span className="text-red-600">{testResults.filter(r => !r.success).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Property Not Found:</span>
                        <span className="text-blue-600">
                          {testResults.filter(r => r.data?.error?.code === 'PROPERTY_NOT_FOUND').length}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No test data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {Math.round(testResults.reduce((sum, r) => sum + r.duration, 0) / testResults.length)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Average Response Time</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fastest:</span>
                        <span className="text-green-600">{Math.min(...testResults.map(r => r.duration))}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Slowest:</span>
                        <span className="text-red-600">{Math.max(...testResults.map(r => r.duration))}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Time:</span>
                        <span>{testResults.reduce((sum, r) => sum + r.duration, 0)}ms</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No performance data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error Analysis */}
          {testResults.some(r => !r.success) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Error Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(testResults.filter(r => !r.success).map(r => {
                    if (r.data?.error?.code) return r.data.error.code;
                    if (r.status === 0) return 'NETWORK_ERROR';
                    if (r.status === 404) return 'ENDPOINT_NOT_FOUND';
                    if (r.status === 400) return 'BAD_REQUEST';
                    return 'UNKNOWN_ERROR';
                  }))).map(errorType => {
                    const count = testResults.filter(r => {
                      if (r.data?.error?.code === errorType) return true;
                      if (errorType === 'NETWORK_ERROR' && r.status === 0) return true;
                      if (errorType === 'ENDPOINT_NOT_FOUND' && r.status === 404) return true;
                      if (errorType === 'BAD_REQUEST' && r.status === 400) return true;
                      return false;
                    }).length;
                    
                    return (
                      <div key={errorType} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm font-medium">{errorType}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}