import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAttomData } from '../hooks/useAttomData';

export function AttomTestComponent() {
  const [testAddress, setTestAddress] = useState('5 WHITNEY DR, GREENWICH, CT 06831');
  const [results, setResults] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const attomData = useAttomData({
    onPropertyFound: (property) => {
      addLog(`✅ Property found: ${property.address?.formatted || 'Unknown address'}`);
    },
    onError: (error) => {
      addLog(`❌ Error: ${error.message}`);
    }
  });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSearch = async () => {
    setResults(null);
    setLogs([]);
    addLog(`🔍 Starting search for: ${testAddress}`);
    
    try {
      const result = await attomData.searchByAddress(testAddress);
      addLog(`📊 Raw result: ${result ? 'Data received' : 'No data'}`);
      setResults(result);
      
      if (result) {
        addLog(`📍 Properties found: ${result.property?.length || 0}`);
        if (result.property?.length > 0) {
          addLog(`🏠 First property: ${result.property[0].address?.oneLine || 'No address'}`);
        }
      }
    } catch (error) {
      addLog(`💥 Exception: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attom API Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="Enter address to test"
              className="flex-1"
            />
            <Button onClick={testSearch} disabled={attomData.isLoading}>
              {attomData.isLoading ? 'Searching...' : 'Test Search'}
            </Button>
            <Button onClick={clearLogs} variant="outline">
              Clear
            </Button>
          </div>

          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Debug Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-3 rounded font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {attomData.error && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-sm text-red-600">Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-red-50 p-3 rounded overflow-auto">
                  {JSON.stringify(attomData.error, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {!results && !attomData.isLoading && !attomData.error && (
            <div className="text-center text-gray-500 py-8">
              Enter an address and click "Test Search" to debug the API
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}