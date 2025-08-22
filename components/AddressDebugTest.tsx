import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface APITestResult {
  test: string;
  status: 'loading' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

export function AddressDebugTest() {
  const [testResults, setTestResults] = useState<APITestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testAddress, setTestAddress] = useState('123 Main Street, San Francisco, CA');
  const [apiKeyInfo, setApiKeyInfo] = useState<any>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion,
    clearSuggestions,
    selectedAddress,
    fallbackMode,
    apiKeyValid
  } = useAddressAutocomplete({
    onAddressSelect: (address) => {
      console.log('Address selected:', address);
    },
    debounceMs: 300,
    debugMode: true
  });

  const runTest = async (testName: string, testFn: () => Promise<any>): Promise<APITestResult> => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      return {
        test: testName,
        status: 'success',
        result,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: testName,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  };

  const testServerConnection = async () => {
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5`;
    const response = await fetch(`${baseUrl}/health`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server health check failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  };

  const testAPIKeyValidation = async () => {
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5`;
    const response = await fetch(`${baseUrl}/places/validate-key`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API key validation failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    setApiKeyInfo(result);
    return result;
  };

  const testAddressAutocomplete = async () => {
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5`;
    const params = new URLSearchParams({
      input: 'San Francisco',
      country: 'US',
      types: 'address'
    });
    
    const response = await fetch(`${baseUrl}/places/autocomplete?${params}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Address autocomplete failed: ${response.status} - ${errorData.error || response.statusText}`);
    }
    
    return await response.json();
  };

  const testAddressDetails = async () => {
    // First get a place ID from autocomplete
    const autocompleteResult = await testAddressAutocomplete();
    if (!autocompleteResult.predictions || autocompleteResult.predictions.length === 0) {
      throw new Error('No predictions found for address details test');
    }
    
    const placeId = autocompleteResult.predictions[0].place_id;
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5`;
    const params = new URLSearchParams({
      place_id: placeId
    });
    
    const response = await fetch(`${baseUrl}/places/details?${params}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Address details failed: ${response.status} - ${errorData.error || response.statusText}`);
    }
    
    return await response.json();
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Server Connection',
        fn: testServerConnection
      },
      {
        name: 'API Key Validation',
        fn: testAPIKeyValidation
      },
      {
        name: 'Address Autocomplete',
        fn: testAddressAutocomplete
      },
      {
        name: 'Address Details',
        fn: testAddressDetails
      }
    ];

    const results: APITestResult[] = [];
    
    for (const test of tests) {
      const result = await runTest(test.name, test.fn);
      results.push(result);
      setTestResults([...results]);
      
      // If a test fails, show what we have so far
      if (result.status === 'error') {
        console.error(`Test failed: ${test.name}`, result.error);
      }
    }
    
    setIsRunningTests(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatResult = (result: any) => {
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runAllTests();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Google Places API Debug Tool</h1>
        <p className="text-muted-foreground">
          This tool helps diagnose Google Places API integration issues in your Handoff application.
        </p>
      </div>

      {/* API Key Status */}
      {apiKeyInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              API Key Status
              <Badge variant={apiKeyInfo.valid ? 'default' : 'destructive'}>
                {apiKeyInfo.valid ? 'Valid' : 'Invalid'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeyInfo.valid ? (
              <Alert>
                <AlertDescription>
                  ✅ Your Google Places API key is properly configured and working.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  ❌ Google Places API key issue: {apiKeyInfo.error || 'Unknown error'}
                  {apiKeyInfo.apiResponse && (
                    <details className="mt-2">
                      <summary>API Response Details</summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(apiKeyInfo.apiResponse, null, 2)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {apiKeyInfo.fallbackAvailable && (
              <div className="mt-2">
                <Badge variant="outline">Fallback Mode Available</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Manual address entry will work even without a valid API key.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            API Test Results
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              variant="outline"
            >
              {isRunningTests ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.length === 0 && !isRunningTests && (
              <p className="text-muted-foreground text-center py-4">
                Click "Run Tests" to start API diagnostics
              </p>
            )}
            
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-3 h-3 rounded-full ${getStatusColor(result.status)}`}
                    />
                    <span className="font-medium">{result.test}</span>
                    {result.duration && (
                      <Badge variant="outline">{result.duration}ms</Badge>
                    )}
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                
                {result.error && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
                
                {result.result && (
                  <details>
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      View Result Data
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                      {formatResult(result.result)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            
            {isRunningTests && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Running API tests...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Address Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Live Address Search Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type an address to test autocomplete..."
                className="flex-1"
              />
              <Button 
                onClick={() => setShowSuggestions(true)}
                variant="outline"
              >
                Search
              </Button>
              <Button 
                onClick={clearSuggestions}
                variant="outline"
              >
                Clear
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant={fallbackMode ? 'destructive' : 'default'}>
                {fallbackMode ? 'Fallback Mode' : 'API Mode'}
              </Badge>
              <Badge variant={apiKeyValid === true ? 'default' : apiKeyValid === false ? 'destructive' : 'outline'}>
                {apiKeyValid === true ? 'API Key Valid' : apiKeyValid === false ? 'API Key Invalid' : 'API Key Checking'}
              </Badge>
              {isLoading && (
                <Badge variant="outline">Loading...</Badge>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Suggestions ({suggestions.length})</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.place_id}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left p-2 hover:bg-muted rounded border"
                    >
                      <div className="font-medium">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Address */}
            {selectedAddress && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Selected Address</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Formatted:</strong> {selectedAddress.formatted_address}</div>
                  <div><strong>Place ID:</strong> {selectedAddress.place_id}</div>
                  {selectedAddress.street_number && (
                    <div><strong>Street Number:</strong> {selectedAddress.street_number}</div>
                  )}
                  {selectedAddress.route && (
                    <div><strong>Route:</strong> {selectedAddress.route}</div>
                  )}
                  {selectedAddress.locality && (
                    <div><strong>City:</strong> {selectedAddress.locality}</div>
                  )}
                  {selectedAddress.administrative_area_level_1 && (
                    <div><strong>State:</strong> {selectedAddress.administrative_area_level_1}</div>
                  )}
                  {selectedAddress.postal_code && (
                    <div><strong>ZIP:</strong> {selectedAddress.postal_code}</div>
                  )}
                  {selectedAddress.geometry && (
                    <div>
                      <strong>Coordinates:</strong> {selectedAddress.geometry.location.lat}, {selectedAddress.geometry.location.lng}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Help */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">If you're seeing API key errors:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Make sure you have a valid Google Places API key from Google Cloud Console</li>
                <li>The API key has been configured using the Supabase secret management system</li>
                <li>Verify the key has enabled: Places API, Geocoding API, and Maps JavaScript API</li>
                <li>Check your Google Cloud Console for quota limits and billing setup</li>
                <li>Confirm there are no API restrictions blocking your requests (HTTP referrers, IP restrictions)</li>
                <li>Ensure your Google Cloud project has billing enabled for Places API usage</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">API Key Configuration:</h4>
              <div className="space-y-2">
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  GOOGLE_PLACES_API_KEY=your_api_key_here
                </div>
                <p className="text-xs text-muted-foreground">
                  The Google Places API key is configured securely using Supabase's secret management system.
                  This provides proper security for API keys in the serverless environment.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Fallback Mode:</h4>
              <p className="text-sm text-muted-foreground">
                If the Google Places API is not available, the application will automatically switch to fallback mode 
                where users can manually enter addresses. This ensures the application continues to work even without 
                a valid API key.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}