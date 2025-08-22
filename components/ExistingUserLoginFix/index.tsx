import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle, 
  UserPlus, 
  LogIn,
  Key,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { LoginTestResult, UserCredentials } from './types';
import { createTestResult, testServerConnection, testSignIn, createAccount } from './helpers';

export function ExistingUserLoginFix() {
  const [credentials, setCredentials] = useState<UserCredentials>({
    email: '',
    password: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testResults, setTestResults] = useState<LoginTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const addResult = (result: LoginTestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateLastResult = (updates: Partial<LoginTestResult>) => {
    setTestResults(prev => {
      const newResults = [...prev];
      if (newResults.length > 0) {
        newResults[newResults.length - 1] = { ...newResults[newResults.length - 1], ...updates };
      }
      return newResults;
    });
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentStep(0);
  };

  const runLoginDiagnostic = async () => {
    if (!credentials.email || !credentials.password) {
      alert('Please enter your email and password');
      return;
    }

    setIsRunning(true);
    clearResults();
    setCurrentStep(1);

    // Step 1: Test Server Connection
    addResult(createTestResult('Server Connection', 'running', 'Checking if authentication server is available...'));
    
    const connectionResult = await testServerConnection();
    updateLastResult(connectionResult);
    
    if (connectionResult.status === 'error') {
      setIsRunning(false);
      return;
    }

    setCurrentStep(2);

    // Step 2: Attempt Sign In
    addResult(createTestResult('Sign In Attempt', 'running', `Attempting to sign in with ${credentials.email}...`));
    
    const signInResult = await testSignIn(credentials);
    updateLastResult(signInResult);

    if (signInResult.status === 'success') {
      addResult(createTestResult('Account Status', 'success', 'Your account is working properly', 'You can now use the main login form'));
      setIsRunning(false);
      return;
    }

    if (signInResult.message.includes('Invalid credentials')) {
      setCurrentStep(3);
      addResult(createTestResult(
        'Account Creation Check',
        'pending',
        'Account does not exist with these credentials',
        'Would you like to create an account with this email?'
      ));
    }

    setIsRunning(false);
  };

  const handleCreateAccount = async () => {
    if (!credentials.fullName) {
      alert('Please enter your full name to create an account');
      return;
    }

    setIsRunning(true);
    setCurrentStep(4);

    updateLastResult({
      status: 'running',
      message: 'Creating account...',
      action: undefined
    });

    const createResult = await createAccount(credentials);
    updateLastResult(createResult);

    if (createResult.status === 'success') {
      addResult(createTestResult(
        'Next Steps',
        'success',
        'Your account is ready to use',
        'Return to the main app and sign in with your credentials'
      ));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: LoginTestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: LoginTestResult['status']) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Action Needed</Badge>;
      case 'running': return <Badge variant="secondary">Running...</Badge>;
    }
  };

  const hasAccountCreationOption = testResults.some(r => 
    r.step === 'Account Creation Check' && r.status === 'pending'
  );

  const isSuccessful = testResults.some(r => r.status === 'success' && r.step !== 'Server Connection');

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Existing User Login Troubleshooter
          </CardTitle>
          <CardDescription>
            Having trouble signing in? This tool will help diagnose and fix login issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isRunning}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isRunning}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {hasAccountCreationOption && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (for account creation)</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={credentials.fullName}
                  onChange={(e) => setCredentials(prev => ({ ...prev, fullName: e.target.value }))}
                  disabled={isRunning}
                />
              </div>
            )}

            <Button 
              onClick={runLoginDiagnostic} 
              disabled={isRunning || !credentials.email || !credentials.password}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isRunning ? 'Running Diagnostic...' : 'Test My Login'}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Diagnostic Results</h3>
                {!isRunning && (
                  <Button onClick={clearResults} variant="outline" size="sm">
                    Clear Results
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{result.step}</h4>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.message}
                        </p>
                        {result.action && (
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">
                              {result.action}
                            </span>
                          </div>
                        )}
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Technical Details
                            </summary>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {hasAccountCreationOption && !isSuccessful && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <UserPlus className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          Account Creation Recommended
                        </h4>
                        <p className="text-sm text-yellow-700 mb-4">
                          It looks like you don't have an account yet with the email address <strong>{credentials.email}</strong>. 
                          Would you like to create one now?
                        </p>
                        <Button 
                          onClick={handleCreateAccount}
                          disabled={isRunning || !credentials.fullName}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Account with This Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isSuccessful && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Great news!</strong> Your login is working correctly. You can now return to the main app and sign in with your credentials.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}