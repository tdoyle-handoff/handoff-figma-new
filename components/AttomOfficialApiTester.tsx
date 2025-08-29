import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Code, Globe, Key, TestTube, GitCompare } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TestResult {
  endpoint: string;
  method: 'current' | 'official';
  success: boolean;
  responseTime: number;
  status: number;
  data?: any;
  error?: string;
  timestamp: string;
}

interface ComparisonResult {
  current: TestResult | null;
  official: TestResult | null;
  differences: string[];
  recommendation: string;
}

const SAMPLE_ADDRESSES: any[] = [];

export function AttomOfficialApiTester() {
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('Brooklyn, NY 11238');
  const [isTestingCurrent, setIsTestingCurrent] = useState(false);
  const [isTestingOfficial, setIsTestingOfficial] = useState(false);
  const [isComparingAll, setIsComparingAll] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const testCurrentImplementation = async (testAddress1: string, testAddress2: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      console.log('Testing current ATTOM implementation:', { address1: testAddress1, address2: testAddress2 });
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/property/basic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          address1: testAddress1,
          address2: testAddress2
        })
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      return {
        endpoint: '/attom/property/basic',
        method: 'current',
        success: response.ok,
        responseTime,
        status: response.status,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.error || `HTTP ${response.status}` : undefined,
        timestamp: new Date().toISOString()
      };

    } catch (err: unknown) {
      const responseTime = Date.now() - startTime;
      console.error('Current implementation test error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      
      return {
        endpoint: '/attom/property/basic',
        method: 'current',
        success: false,
        responseTime,
        status: 0,
        error: `Network error: ${msg}`,
        timestamp: new Date().toISOString()
      };
    }
  };

  const testOfficialImplementation = async (testAddress1: string, testAddress2: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      console.log('Testing official ATTOM implementation:', { address1: testAddress1, address2: testAddress2 });
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-official/property/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          address1: testAddress1,
          address2: testAddress2
        })
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      return {
        endpoint: '/attom-official/property/search',
        method: 'official',
        success: response.ok,
        responseTime,
        status: response.status,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.error || `HTTP ${response.status}` : undefined,
        timestamp: new Date().toISOString()
      };

    } catch (err: unknown) {
      const responseTime = Date.now() - startTime;
      console.error('Official implementation test error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      
      return {
        endpoint: '/attom-official/property/search',
        method: 'official',
        success: false,
        responseTime,
        status: 0,
        error: `Network error: ${msg}`,
        timestamp: new Date().toISOString()
      };
    }
  };

  const runSingleTest = async (method: 'current' | 'official') => {
    if (method === 'current') {
      setIsTestingCurrent(true);
      const result = await testCurrentImplementation(address1, address2);
      setResults(prev => [...prev.filter(r => !(r.method === 'current' && r.endpoint.includes('property'))), result]);
      setIsTestingCurrent(false);
    } else {
      setIsTestingOfficial(true);
      const result = await testOfficialImplementation(address1, address2);
      setResults(prev => [...prev.filter(r => !(r.method === 'official' && r.endpoint.includes('property'))), result]);
      setIsTestingOfficial(false);
    }
  };

  const runComparison = async () => {
    setIsComparingAll(true);
    setResults([]);
    setComparison(null);

    console.log('Running comprehensive comparison...');

    const currentResult = await testCurrentImplementation(address1, address2);
    const officialResult = await testOfficialImplementation(address1, address2);

    setResults([currentResult, officialResult]);

    // Analyze differences
    const differences: string[] = [];
    let recommendation = '';

    // Compare success rates
    if (currentResult.success !== officialResult.success) {
      if (officialResult.success && !currentResult.success) {
        differences.push('Official implementation succeeded while current implementation failed');
        recommendation = 'Switch to official implementation patterns for better reliability';
      } else if (currentResult.success && !officialResult.success) {
        differences.push('Current implementation succeeded while official implementation failed');
        recommendation = 'Current implementation may be working, but verify against official patterns';
      }
    } else if (!currentResult.success && !officialResult.success) {
      differences.push('Both implementations failed - check API key and address format');
      recommendation = 'Fix API key or address format issues before comparing implementations';
    } else {
      differences.push('Both implementations succeeded');
      recommendation = 'Compare response data quality and performance to choose best approach';
    }

    // Compare response times
    const timeDiff = Math.abs(currentResult.responseTime - officialResult.responseTime);
    if (timeDiff > 500) {
      const faster = currentResult.responseTime < officialResult.responseTime ? 'current' : 'official';
      differences.push(`${faster} implementation is significantly faster (${timeDiff}ms difference)`);
    }

    // Compare status codes
    if (currentResult.status !== officialResult.status) {
      differences.push(`Different HTTP status codes: Current=${currentResult.status}, Official=${officialResult.status}`);
    }

    // Compare error messages
    if (currentResult.error && officialResult.error) {
      if (currentResult.error !== officialResult.error) {
        differences.push('Different error messages returned');
      }
    }

    // Compare data structure (if both successful)
    if (currentResult.success && officialResult.success && currentResult.data && officialResult.data) {
      const currentHasProperty = !!(currentResult.data.data?.property || currentResult.data.property);
      const officialHasProperty = !!(officialResult.data.data?.property || officialResult.data.property);
      
      if (currentHasProperty !== officialHasProperty) {
        differences.push('Different data availability between implementations');
      }
    }

    setComparison({
      current: currentResult,
      official: officialResult,
      differences,
      recommendation
    });

    setIsComparingAll(false);
  };

  const loadSampleAddress = (sample: any) => {
    setAddress1(sample.address1);
    setAddress2(sample.address2);
  };

  const getStatusIcon = (result: TestResult) => {
    if (result.success) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (result: TestResult) => {
    return result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <GitCompare className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">ATTOM API Implementation Comparison</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compare our current ATTOM API implementation with the official patterns from ATTOM's sample code.
          This helps identify authentication issues, request format problems, and implementation improvements.
        </p>
      </div>

      <Tabs defaultValue="testing" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="samples">Sample Addresses</TabsTrigger>
        </TabsList>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test Configuration
              </CardTitle>
              <CardDescription>
                Enter an address to test both implementations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="e.g., 586 Franklin Ave"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="e.g., Brooklyn, NY 11238"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => runSingleTest('current')} 
                  disabled={isTestingCurrent || isComparingAll}
                  variant="outline"
                >
                  {isTestingCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Code className="w-4 h-4 mr-2" />
                  )}
                  Test Current Implementation
                </Button>

                <Button 
                  onClick={() => runSingleTest('official')} 
                  disabled={isTestingOfficial || isComparingAll}
                  variant="outline"
                >
                  {isTestingOfficial ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Globe className="w-4 h-4 mr-2" />
                  )}
                  Test Official Implementation
                </Button>

                <Button 
                  onClick={runComparison} 
                  disabled={isComparingAll || isTestingCurrent || isTestingOfficial}
                >
                  {isComparingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <GitCompare className="w-4 h-4 mr-2" />
                  )}
                  Run Full Comparison
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Individual Test Results */}
          {results.length > 0 && (
            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={`${result.method}-${index}`} className={getStatusColor(result)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result)}
                        <CardTitle className="text-lg">
                          {result.method === 'current' ? 'Current Implementation' : 'Official Implementation'}
                        </CardTitle>
                        <Badge variant={result.success ? 'default' : 'destructive'}>
                          HTTP {result.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.responseTime}ms
                      </div>
                    </div>
                    <CardDescription>{result.endpoint}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.error && (
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="w-4 h-4" />
                        <AlertDescription>
                          <strong>Error:</strong> {result.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {result.success && result.data && (
                      <div className="space-y-2">
                        <Label>Response Data:</Label>
                        <Textarea
                          value={JSON.stringify(result.data, null, 2)}
                          readOnly
                          className="font-mono text-xs"
                          rows={8}
                        />
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Test completed at {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {comparison ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5" />
                    Implementation Comparison Results
                  </CardTitle>
                  <CardDescription>
                    Analysis of differences between current and official implementations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Recommendation:</strong> {comparison.recommendation}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Label>Key Differences:</Label>
                    <div className="space-y-2">
                      {comparison.differences.map((diff, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{diff}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        <h3 className="font-medium">Current Implementation</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>Success: {comparison.current?.success ? '✅ Yes' : '❌ No'}</div>
                        <div>Status: {comparison.current?.status}</div>
                        <div>Response Time: {comparison.current?.responseTime}ms</div>
                        {comparison.current?.error && (
                          <div className="text-red-600">Error: {comparison.current.error}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <h3 className="font-medium">Official Implementation</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>Success: {comparison.official?.success ? '✅ Yes' : '❌ No'}</div>
                        <div>Status: {comparison.official?.status}</div>
                        <div>Response Time: {comparison.official?.responseTime}ms</div>
                        {comparison.official?.error && (
                          <div className="text-red-600">Error: {comparison.official.error}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <GitCompare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No comparison data yet. Run a full comparison test to see results here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sample Addresses Tab */}
        <TabsContent value="samples" className="space-y-4">
          <div className="grid gap-4">
            {SAMPLE_ADDRESSES.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sample addresses available</h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    Sample addresses can be configured by developers for testing purposes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              SAMPLE_ADDRESSES.map((sample, index) => (
                <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => loadSampleAddress(sample)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sample.name}</CardTitle>
                      <Button size="sm" variant="outline">Use This Address</Button>
                    </div>
                    <CardDescription>{sample.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <div><strong>Address 1:</strong> {sample.address1}</div>
                      <div><strong>Address 2:</strong> {sample.address2}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
