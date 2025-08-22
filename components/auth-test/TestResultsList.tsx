import { Fragment } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

interface TestResultsListProps {
  testResults: TestResult[];
}

export function TestResultsList({ testResults }: TestResultsListProps) {
  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const pendingCount = testResults.filter(r => r.status === 'pending').length;

  if (testResults.length === 0) return null;

  return (
    <Fragment>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-700 border-green-300">
            ✅ {successCount} Passed
          </Badge>
          <Badge variant="outline" className="text-red-700 border-red-300">
            ❌ {errorCount} Failed
          </Badge>
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              ⏳ {pendingCount} Running
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {testResults.map((result, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(result.status)}
                <span className="font-medium capitalize">{result.test.replace('-', ' ')} Test</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{result.message}</p>
              {result.data && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </Fragment>
  );
}