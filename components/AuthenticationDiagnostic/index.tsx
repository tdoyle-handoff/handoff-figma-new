import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle, 
  Users, 
  Database, 
  Server,
  Key,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { TestResult, UserTestData } from './types';
import { AuthTestRunner } from './TestRunner';

export function AuthenticationDiagnostic() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userTestData, setUserTestData] = useState<UserTestData>({
    email: '',
    password: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('connection');

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testRunner = new AuthTestRunner(addTestResult);

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    await testRunner.runConnectionTests();

    if (userTestData.email && userTestData.password) {
      await testRunner.runAuthenticationTests(userTestData);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'running': return <Badge variant="secondary">Running...</Badge>;
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Diagnostic Tool
          </CardTitle>
          <CardDescription>
            Diagnose and troubleshoot authentication issues with your Handoff application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTest} onValueChange={setSelectedTest}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connection">
                <Server className="h-4 w-4 mr-2" />
                Connection
              </TabsTrigger>
              <TabsTrigger value="authentication">
                <Key className="h-4 w-4 mr-2" />
                Authentication
              </TabsTrigger>
              <TabsTrigger value="results">
                <Users className="h-4 w-4 mr-2" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Server Connection Tests</h3>
                <p className="text-sm text-muted-foreground">
                  Test the connection to your Supabase Edge Functions and authentication services.
                </p>
                <Button onClick={() => testRunner.runConnectionTests()} disabled={isRunning}>
                  <Server className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication Flow Tests</h3>
                <p className="text-sm text-muted-foreground">
                  Test sign in and sign up functionality with your credentials.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Test Email</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="user@example.com"
                      value={userTestData.email}
                      onChange={(e) => setUserTestData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="test-name">Full Name</Label>
                    <Input
                      id="test-name"
                      type="text"
                      placeholder="John Doe"
                      value={userTestData.fullName}
                      onChange={(e) => setUserTestData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-password">Test Password</Label>
                  <div className="relative">
                    <Input
                      id="test-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 6 characters)"
                      value={userTestData.password}
                      onChange={(e) => setUserTestData(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={() => testRunner.runAuthenticationTests(userTestData)} 
                  disabled={isRunning || !userTestData.email || !userTestData.password}
                  variant="outline"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Test Authentication
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Test Results</h3>
                  <div className="flex items-center gap-4">
                    {testResults.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="default" className="bg-green-100 text-green-800">{successCount}</Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{warningCount}</Badge>
                        <Badge variant="destructive">{errorCount}</Badge>
                      </div>
                    )}
                    <Button onClick={runAllTests} disabled={isRunning}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                      Run All Tests
                    </Button>
                    {testResults.length > 0 && (
                      <Button onClick={clearResults} variant="outline" size="sm">
                        Clear Results
                      </Button>
                    )}
                  </div>
                </div>

                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No test results yet. Run some tests to see diagnostics information.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{result.test}</h4>
                                {getStatusBadge(result.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {result.message}
                              </p>
                              {result.details && (
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    View Details
                                  </summary>
                                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                    {JSON.stringify(result.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}