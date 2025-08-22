import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DirectApiTestTool() {
  const [testAddress, setTestAddress] = useState('5 WHITNEY DR, GREENWICH, CT 06831');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectApi = async () => {
    setResults(null);
    setLogs([]);
    setIsLoading(true);
    
    try {
      addLog(`🚀 Testing direct API call`);
      addLog(`📍 Address: ${testAddress}`);
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/search-by-address?address=${encodeURIComponent(testAddress)}&debug=true`;
      addLog(`🌐 URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      addLog(`📡 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        addLog(`❌ Error response: ${errorText}`);
        setResults({ error: errorText, status: response.status });
        return;
      }
      
      const data = await response.json();
      addLog(`✅ Response received`);
      addLog(`📊 Properties found: ${data.property?.length || 0}`);
      
      setResults(data);
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`💥 Exception: ${msg}`);
      setResults({ error: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLogs([]);
    setIsLoading(true);
    
    try {
      addLog(`🏥 Testing health check`);
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/health`;
      addLog(`🌐 URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      addLog(`📡 Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      addLog(`✅ Health check response received`);
      
      setResults(data);
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`💥 Exception: ${msg}`);
      setResults({ error: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const testServerHealth = async () => {
    setLogs([]);
    setIsLoading(true);
    
    try {
      addLog(`🔧 Testing main server health`);
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/health`;
      addLog(`🌐 URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      addLog(`📡 Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      addLog(`✅ Server health response received`);
      
      setResults(data);
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`💥 Exception: ${msg}`);
      setResults({ error: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setLogs([]);
    setResults(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Direct API Test Tool</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test the Attom API endpoints directly to debug connectivity issues
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                placeholder="Enter address to test"
              />
              
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  onClick={testDirectApi} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Testing...' : 'Test Address Search'}
                </Button>
                
                <Button 
                  onClick={testHealthCheck} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Test Attom Health
                </Button>
                
                <Button 
                  onClick={testServerHealth} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Test Server Health
                </Button>
                
                <Button 
                  onClick={clearResults} 
                  variant="outline"
                  className="w-full"
                >
                  Clear Results
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm">
                <h3 className="font-medium mb-2">Environment Info</h3>
                <div className="space-y-1 text-xs">
                  <div>Project ID: <Badge variant="outline">{projectId}</Badge></div>
                  <div>API Key: <Badge variant="outline">{publicAnonKey ? 'Configured' : 'Missing'}</Badge></div>
                </div>
              </div>
            </div>
          </div>

          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-3 rounded font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  API Response
                  {results.status && (
                    <Badge variant={results.status === 200 ? "default" : "destructive"} className="ml-2">
                      {results.status}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {!results && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              Click any test button above to check API connectivity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}