import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Key, Lock, Unlock, Info, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EndpointTest {
  name: string;
  endpoint: string;
  description: string;
  category: 'Basic' | 'Enhanced' | 'Premium' | 'Enterprise';
  requiredSubscription: string;
  testParams: Record<string, string>;
  sampleAddress: string;
}

interface TestResult {
  endpoint: string;
  success: boolean;
  status: number;
  message: string;
  hasAccess: boolean;
  errorType: 'AUTH' | 'ACCESS' | 'CONFIG' | 'DATA' | 'UNKNOWN';
  responseTime: number;
  timestamp: string;
}

const ENDPOINT_TESTS: EndpointTest[] = [
  {
    name: 'Property Basic',
    endpoint: '/property/basic',
    description: 'Basic property information including address, APN, and basic characteristics',
    category: 'Basic',
    requiredSubscription: 'Basic Plan or higher',
    testParams: {
      address1: '11 Village Street',
      address2: 'Deep River, CT 06412'
    },
    sampleAddress: '11 Village Street, Deep River, CT 06412'
  },
  {
    name: 'Property Detail',
    endpoint: '/property/detail',
    description: 'Detailed property information including assessments, building details, and more',
    category: 'Enhanced',
    requiredSubscription: 'Enhanced Plan or higher',
    testParams: {
      address1: '11 Village Street',
      address2: 'Deep River, CT 06412'
    },
    sampleAddress: '11 Village Street, Deep River, CT 06412'
  },
  {
    name: 'Property Expanded Profile',
    endpoint: '/property/expandedprofile',
    description: 'Comprehensive property profile with detailed assessments and history',
    category: 'Premium',
    requiredSubscription: 'Premium Plan or higher',
    testParams: {
      address1: '11 Village Street',
      address2: 'Deep River, CT 06412'
    },
    sampleAddress: '11 Village Street, Deep River, CT 06412'
  },
  {
    name: 'AVM (Automated Valuation Model)',
    endpoint: '/avm',
    description: 'Current estimated property value using ATTOM\'s valuation model',
    category: 'Premium',
    requiredSubscription: 'Premium Plan or higher',
    testParams: {
      address1: '11 Village Street',
      address2: 'Deep River, CT 06412'
    },
    sampleAddress: '11 Village Street, Deep River, CT 06412'
  },
  {
    name: 'Sales History',
    endpoint: '/saleshistory/detail',
    description: 'Historical sales transactions for the property',
    category: 'Enhanced',
    requiredSubscription: 'Enhanced Plan or higher',
    testParams: {
      address1: '11 Village Street',
      address2: 'Deep River, CT 06412'
    },
    sampleAddress: '11 Village Street, Deep River, CT 06412'
  },
  {
    name: 'Tax Assessment',
    endpoint: '/assessment/detail',
    description: 'Detailed tax assessment information and history',
    category: 'Enhanced',
    requiredSubscription: 'Enhanced Plan or higher',
    testParams: {
      address1: '11 Village Street',
      address2: 'Deep River, CT 06412'
    },
    sampleAddress: '11 Village Street, Deep River, CT 06412'
  },
  {
    name: 'Comparable Sales',
    endpoint: '/sales/comps',
    description: 'Comparable sales in the area (comps)',
    category: 'Premium',
    requiredSubscription: 'Premium Plan or higher',
    testParams: {
      address1: '11 Village Street',
      address2: 'Deep River, CT 06412',
      radius: '0.5'
    },
    sampleAddress: '11 Village Street, Deep River, CT 06412'
  },
  {
    name: 'Market Trends',
    endpoint: '/market/trends',
    description: 'Local market trends and statistics',
    category: 'Enterprise',
    requiredSubscription: 'Enterprise Plan',
    testParams: {
      address1: '11 Village Street',
      address2: 'Deep River, CT 06412'
    },
    sampleAddress: '11 Village Street, Deep River, CT 06412'
  }
];

const SUBSCRIPTION_INFO = {
  'Basic': {
    color: 'bg-blue-100 text-blue-800',
    description: 'Entry-level access to basic property information',
    features: ['Basic property details', 'Address validation', 'Property characteristics']
  },
  'Enhanced': {
    color: 'bg-green-100 text-green-800', 
    description: 'Enhanced property data with assessments and sales history',
    features: ['All Basic features', 'Tax assessments', 'Sales history', 'Building details']
  },
  'Premium': {
    color: 'bg-purple-100 text-purple-800',
    description: 'Premium features including valuations and comparables',
    features: ['All Enhanced features', 'AVM valuations', 'Comparable sales', 'Market analytics']
  },
  'Enterprise': {
    color: 'bg-orange-100 text-orange-800',
    description: 'Full enterprise access with market trends and analytics',
    features: ['All Premium features', 'Market trends', 'Advanced analytics', 'Custom endpoints']
  }
};

export function AttomEndpointAccessDiagnostic() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  const testEndpoint = async (endpointTest: EndpointTest): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`Testing endpoint: ${endpointTest.name}`);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom${endpointTest.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(endpointTest.testParams)
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      console.log(`Endpoint ${endpointTest.name} response:`, {
        status: response.status,
        data: responseData
      });

      // Analyze the response to determine access level
      let hasAccess = false;
      let errorType: TestResult['errorType'] = 'UNKNOWN';
      let message = '';

      if (response.ok) {
        hasAccess = true;
        errorType = 'DATA';
        
        if (responseData.success) {
          if (responseData.data && Object.keys(responseData.data).length > 0) {
            message = 'Endpoint accessible - Data returned successfully';
          } else {
            message = 'Endpoint accessible - No data found for test address (this is normal)';
          }
        } else {
          message = 'Endpoint accessible - Server processed request but no data available';
        }
      } else {
        hasAccess = false;
        
        switch (response.status) {
          case 401:
            errorType = 'AUTH';
            message = 'Authentication failed - Invalid or missing API key';
            break;
          case 403:
            errorType = 'ACCESS';
            message = `Access denied - Your subscription does not include this endpoint. Requires: ${endpointTest.requiredSubscription}`;
            break;
          case 404:
            errorType = 'CONFIG';
            message = 'Endpoint not found - May be incorrectly configured or unavailable';
            break;
          case 400:
            errorType = 'CONFIG';
            message = 'Bad request - Parameter format issue or endpoint configuration problem';
            break;
          case 429:
            errorType = 'ACCESS';
            message = 'Rate limit exceeded - Too many requests';
            break;
          case 500:
            errorType = 'UNKNOWN';
            message = 'Server error - ATTOM API internal issue';
            break;
          default:
            errorType = 'UNKNOWN';
            message = `Unexpected error (${response.status}): ${responseData.message || 'Unknown error'}`;
        }
      }

      return {
        endpoint: endpointTest.name,
        success: response.ok,
        status: response.status,
        message,
        hasAccess,
        errorType,
        responseTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Error testing endpoint ${endpointTest.name}:`, error);
      
      return {
        endpoint: endpointTest.name,
        success: false,
        status: 0,
        message: `Network error: ${error.message}`,
        hasAccess: false,
        errorType: 'UNKNOWN',
        responseTime,
        timestamp: new Date().toISOString()
      };
    }
  };

  const testSingleEndpoint = async (endpointTest: EndpointTest) => {
    setCurrentTest(endpointTest.name);
    const result = await testEndpoint(endpointTest);
    setResults(prev => [...prev.filter(r => r.endpoint !== result.endpoint), result]);
    setCurrentTest(null);
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    setResults([]);
    
    // Test endpoints sequentially to avoid rate limiting
    for (const endpointTest of ENDPOINT_TESTS) {
      setCurrentTest(endpointTest.name);
      const result = await testEndpoint(endpointTest);
      setResults(prev => [...prev, result]);
      
      // Small delay between requests to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTest(null);
    setIsTestingAll(false);
    
    // Determine overall API key status
    const authFailures = results.filter(r => r.errorType === 'AUTH').length;
    if (authFailures === results.length) {
      setApiKeyStatus('invalid');
    } else if (authFailures === 0) {
      setApiKeyStatus('valid');
    } else {
      setApiKeyStatus('unknown');
    }
  };

  const getStatusIcon = (result: TestResult) => {
    if (result.hasAccess) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else {
      switch (result.errorType) {
        case 'AUTH':
          return <XCircle className="w-5 h-5 text-red-600" />;
        case 'ACCESS':
          return <Lock className="w-5 h-5 text-orange-600" />;
        case 'CONFIG':
          return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
        default:
          return <XCircle className="w-5 h-5 text-red-600" />;
      }
    }
  };

  const getStatusColor = (result: TestResult) => {
    if (result.hasAccess) return 'border-green-200 bg-green-50';
    switch (result.errorType) {
      case 'AUTH': return 'border-red-200 bg-red-50';
      case 'ACCESS': return 'border-orange-200 bg-orange-50';
      case 'CONFIG': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-red-200 bg-red-50';
    }
  };

  const categorizeResults = () => {
    const accessible = results.filter(r => r.hasAccess);
    const authIssues = results.filter(r => r.errorType === 'AUTH');
    const accessDenied = results.filter(r => r.errorType === 'ACCESS');
    const configIssues = results.filter(r => r.errorType === 'CONFIG');
    const unknownIssues = results.filter(r => r.errorType === 'UNKNOWN');

    return { accessible, authIssues, accessDenied, configIssues, unknownIssues };
  };

  const { accessible, authIssues, accessDenied, configIssues, unknownIssues } = categorizeResults();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Key className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">ATTOM API Endpoint Access Diagnostic</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test your ATTOM API key's access to different endpoints and identify subscription limitations.
          This tool helps distinguish between authentication failures (invalid API key) and authorization 
          failures (valid API key but insufficient subscription level).
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Test all endpoints or review subscription requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={testAllEndpoints} 
              disabled={isTestingAll}
              className="flex items-center gap-2"
            >
              {isTestingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Test All Endpoints
            </Button>
            
            <Button variant="outline" asChild>
              <a 
                href="https://api.developer.attomdata.com/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                ATTOM API Documentation
              </a>
            </Button>
            
            <Button variant="outline" asChild>
              <a 
                href="https://api.developer.attomdata.com/pricing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Subscription Plans
              </a>
            </Button>
          </div>

          {currentTest && (
            <Alert>
              <Loader2 className="w-4 h-4 animate-spin" />
              <AlertDescription>
                Testing endpoint: <strong>{currentTest}</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="endpoints">Endpoint Tests</TabsTrigger>
          <TabsTrigger value="results">Results Summary</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription Info</TabsTrigger>
        </TabsList>

        {/* Endpoint Tests Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid gap-4">
            {ENDPOINT_TESTS.map((endpointTest) => {
              const result = results.find(r => r.endpoint === endpointTest.name);
              const isLoading = currentTest === endpointTest.name;
              
              return (
                <Card key={endpointTest.name} className={result ? getStatusColor(result) : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{endpointTest.name}</CardTitle>
                          <Badge className={SUBSCRIPTION_INFO[endpointTest.category].color}>
                            {endpointTest.category}
                          </Badge>
                          {result && getStatusIcon(result)}
                        </div>
                        <CardDescription>{endpointTest.description}</CardDescription>
                        <div className="text-sm text-muted-foreground">
                          <strong>Required:</strong> {endpointTest.requiredSubscription}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Test Address:</strong> {endpointTest.sampleAddress}
                        </div>
                      </div>
                      <Button
                        onClick={() => testSingleEndpoint(endpointTest)}
                        disabled={isLoading || isTestingAll}
                        variant="outline"
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {result && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Status:</span>
                          <span className={result.hasAccess ? 'text-green-600' : 'text-red-600'}>
                            HTTP {result.status} - {result.hasAccess ? 'Accessible' : 'Not Accessible'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Result:</span> {result.message}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Response Time: {result.responseTime}ms</span>
                          <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Results Summary Tab */}
        <TabsContent value="results" className="space-y-6">
          {results.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No test results yet. Run endpoint tests to see results here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{accessible.length}</div>
                    <div className="text-sm text-green-700">Accessible</div>
                  </CardContent>
                </Card>
                
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-6 text-center">
                    <Lock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">{accessDenied.length}</div>
                    <div className="text-sm text-orange-700">Access Denied</div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6 text-center">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">{authIssues.length}</div>
                    <div className="text-sm text-red-700">Auth Failed</div>
                  </CardContent>
                </Card>
                
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6 text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">{configIssues.length + unknownIssues.length}</div>
                    <div className="text-sm text-yellow-700">Other Issues</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis */}
              {authIssues.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription>
                    <strong>Authentication Issues:</strong> {authIssues.length} endpoint(s) failed with authentication errors. 
                    This suggests your API key is invalid, missing, or expired. Check your ATTOM_API_KEY environment variable.
                  </AlertDescription>
                </Alert>
              )}

              {accessDenied.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <AlertDescription>
                    <strong>Subscription Limitations:</strong> {accessDenied.length} endpoint(s) are not accessible with your current subscription. 
                    Consider upgrading your ATTOM Data plan to access these features.
                  </AlertDescription>
                </Alert>
              )}

              {accessible.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription>
                    <strong>Working Endpoints:</strong> {accessible.length} endpoint(s) are accessible and working correctly. 
                    Your API key is valid for these features.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </TabsContent>

        {/* Subscription Info Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(SUBSCRIPTION_INFO).map(([tier, info]) => (
              <Card key={tier}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge className={info.color}>{tier}</Badge>
                    <CardTitle>{tier} Plan</CardTitle>
                  </div>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">Included Features:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {info.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4">
                    <div className="font-medium mb-2">Endpoints Available:</div>
                    <div className="flex flex-wrap gap-2">
                      {ENDPOINT_TESTS
                        .filter(test => test.category === tier || 
                          (tier === 'Enhanced' && test.category === 'Basic') ||
                          (tier === 'Premium' && ['Basic', 'Enhanced'].includes(test.category)) ||
                          (tier === 'Enterprise'))
                        .map(test => (
                          <Badge key={test.name} variant="outline" className="text-xs">
                            {test.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}