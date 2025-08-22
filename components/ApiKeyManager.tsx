import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Settings,
  TestTube,
  Wrench
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { projectId, SUPABASE_ANON_KEY } from '../utils/supabase/info';

interface ApiKeyStatus {
  name: string;
  key: string;
  isConfigured: boolean;
  isValid: boolean | null;
  error: string | null;
  lastTested: Date | null;
  maskedKey: string;
}

interface ApiTestResult {
  success: boolean;
  message: string;
  details?: any;
  response?: any;
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKeyStatus[]>([
    {
      name: 'ATTOM API',
      key: 'ATTOM_API_KEY',
      isConfigured: false,
      isValid: null,
      error: null,
      lastTested: null,
      maskedKey: ''
    },
    {
      name: 'Google Places API',
      key: 'GOOGLE_PLACES_API_KEY',
      isConfigured: false,
      isValid: null,
      error: null,
      lastTested: null,
      maskedKey: ''
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [testLoading, setTestLoading] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [setupInstructions, setSetupInstructions] = useState('');

  // Check API key status on component mount
  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/api-key-status`, {
        method: 'GET',
        headers: {
'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(prev => prev.map(key => ({
          ...key,
          isConfigured: data[key.key]?.configured || false,
          maskedKey: data[key.key]?.masked || '',
          error: data[key.key]?.error || null
        })));
      } else {
        toast.error('Failed to check API key status');
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
      toast.error('Error checking API key status');
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async (keyName: string) => {
    setTestLoading(keyName);
    try {
      let endpoint = '';
      let testData = {};

      if (keyName === 'ATTOM_API_KEY') {
        endpoint = 'test-attom-api';
        testData = { address: '123 Main St, Los Angeles, CA 90210' };
      } else if (keyName === 'GOOGLE_PLACES_API_KEY') {
        endpoint = 'test-places-api';
        testData = { query: 'Los Angeles, CA' };
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/${endpoint}`, {
        method: 'POST',
        headers: {
'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      const success = response.ok && result.success;

      setApiKeys(prev => prev.map(key => 
        key.key === keyName ? {
          ...key,
          isValid: success,
          error: success ? null : result.error || 'Test failed',
          lastTested: new Date()
        } : key
      ));

      if (success) {
        toast.success(`${keyName} test successful!`);
      } else {
        toast.error(`${keyName} test failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error testing ${keyName}:`, error);
      setApiKeys(prev => prev.map(key => 
        key.key === keyName ? {
          ...key,
          isValid: false,
          error: 'Network error during test',
          lastTested: new Date()
        } : key
      ));
      toast.error(`Error testing ${keyName}`);
    } finally {
      setTestLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleShowKey = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const getStatusIcon = (apiKey: ApiKeyStatus) => {
    if (!apiKey.isConfigured) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (apiKey.isValid === true) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    if (apiKey.isValid === false) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusBadge = (apiKey: ApiKeyStatus) => {
    if (!apiKey.isConfigured) {
      return <Badge variant="destructive">Not Configured</Badge>;
    }
    if (apiKey.isValid === true) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge>;
    }
    if (apiKey.isValid === false) {
      return <Badge variant="destructive">Invalid</Badge>;
    }
    return <Badge variant="secondary">Untested</Badge>;
  };

  const generateSetupInstructions = () => {
    return `
# API Key Setup Instructions

## ATTOM API Key Setup

1. Go to https://developer.attomdata.com/
2. Sign up for an account or log in
3. Create a new subscription plan (free tier available)
4. Navigate to "API Keys" section
5. Generate a new API key
6. Copy the API key

## Google Places API Key Setup

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable "Places API (New)" in the API Library
4. Go to "Credentials" and create an API key
5. Restrict the API key to Places API only
6. Set up billing (required for Places API)
7. Copy the API key

## Adding Keys to Supabase

1. Go to your Supabase project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - ATTOM_API_KEY: [your-attom-api-key]
   - GOOGLE_PLACES_API_KEY: [your-google-places-api-key]
4. Restart your edge functions if needed

## Important Notes

- API keys are sensitive - never share them publicly
- Both APIs have usage limits and billing considerations
- Test the keys after setup to ensure they work
- The ATTOM API requires a paid subscription for production use
- Google Places API requires billing setup even for free tier usage
    `;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Key Manager</h1>
          <p className="text-muted-foreground">Configure and validate your API keys</p>
        </div>
        <Button onClick={checkApiKeyStatus} disabled={isLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">
            <Settings className="w-4 h-4 mr-2" />
            Status & Testing
          </TabsTrigger>
          <TabsTrigger value="setup">
            <Wrench className="w-4 h-4 mr-2" />
            Setup Guide
          </TabsTrigger>
          <TabsTrigger value="troubleshoot">
            <TestTube className="w-4 h-4 mr-2" />
            Troubleshoot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.key}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(apiKey)}
                      <span>{apiKey.name}</span>
                      {getStatusBadge(apiKey)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => testApiKey(apiKey.key)}
                        disabled={!apiKey.isConfigured || testLoading === apiKey.key}
                        size="sm"
                        variant="outline"
                      >
                        {testLoading === apiKey.key ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                        Test
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apiKey.isConfigured ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">API Key:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showKeys[apiKey.key] ? apiKey.maskedKey : '••••••••••••••••'}
                        </code>
                        <Button
                          onClick={() => toggleShowKey(apiKey.key)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          {showKeys[apiKey.key] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          onClick={() => copyToClipboard(apiKey.maskedKey)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {apiKey.lastTested && (
                        <div className="text-sm text-muted-foreground">
                          Last tested: {apiKey.lastTested.toLocaleString()}
                        </div>
                      )}
                      
                      {apiKey.error && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{apiKey.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertDescription>
                        API key not configured. Please add {apiKey.key} to your Supabase environment variables.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">ATTOM API</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Visit <a href="https://developer.attomdata.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">ATTOM Developer Portal <ExternalLink className="w-3 h-3" /></a></li>
                        <li>Sign up or log in to your account</li>
                        <li>Choose a subscription plan (free trial available)</li>
                        <li>Navigate to "API Keys" section</li>
                        <li>Generate a new API key</li>
                        <li>Copy the API key</li>
                      </ol>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Free trial includes limited requests. Production use requires a paid subscription.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Google Places API</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Visit <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
                        <li>Create new project or select existing</li>
                        <li>Enable "Places API (New)" in API Library</li>
                        <li>Go to Credentials and create API key</li>
                        <li>Set up billing (required)</li>
                        <li>Restrict API key to Places API</li>
                        <li>Copy the API key</li>
                      </ol>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Billing setup is required even for free tier usage.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Adding to Supabase</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to your Supabase project dashboard</li>
                      <li>Navigate to Settings → Environment Variables</li>
                      <li>Add the following variables:</li>
                    </ol>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <code className="text-sm">ATTOM_API_KEY=your-attom-api-key-here</code>
                        <Button onClick={() => copyToClipboard('ATTOM_API_KEY')} size="sm" variant="ghost">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <code className="text-sm">GOOGLE_PLACES_API_KEY=your-google-places-api-key-here</code>
                        <Button onClick={() => copyToClipboard('GOOGLE_PLACES_API_KEY')} size="sm" variant="ghost">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <ol start={4} className="list-decimal list-inside space-y-2 text-sm">
                      <li>Save the environment variables</li>
                      <li>Restart your edge functions if needed</li>
                      <li>Test the API keys using the Status & Testing tab</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">ATTOM API Issues</h3>
                <div className="space-y-3">
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>401 Unauthorized:</strong> API key is invalid, expired, or not properly configured. Check your ATTOM developer account and ensure the API key is active.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Quota Exceeded:</strong> You've reached your API usage limits. Upgrade your plan or wait for the quota to reset.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Subscription Required:</strong> Some endpoints require a paid subscription. Free trial has limited access.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Google Places API Issues</h3>
                <div className="space-y-3">
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>REQUEST_DENIED:</strong> API key is invalid or Places API is not enabled. Check your Google Cloud Console settings.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Billing Required:</strong> Google Places API requires billing setup even for free tier usage. Set up billing in Google Cloud Console.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>API Restrictions:</strong> Ensure your API key is not restricted to specific IPs or domains that would block server requests.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">General Troubleshooting</h3>
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Environment Variables:</strong> Ensure API keys are properly set in Supabase environment variables with correct names.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Edge Function Restart:</strong> After updating environment variables, restart your edge functions or redeploy.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Network Issues:</strong> Check if your server can make outbound HTTPS requests to external APIs.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}