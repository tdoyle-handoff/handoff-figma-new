import { Fragment } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Key, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  Settings,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ApiKeyTestResult {
  success: boolean;
  hasKey: boolean;
  keyLength: number;
  keyPreview?: string;
  testResult?: {
    status: number;
    statusText: string;
    hasData?: boolean;
    responsePreview?: string;
  };
  message: string;
  recommendation?: string;
}

interface ApiKeyInfo {
  hasKey: boolean;
  keyLength: number;
  keyPreview: string | null;
  estimatedTier: string | null;
  lastTested: string;
}

export function AttomApiKeyConfigurator() {
  const [currentKeyInfo, setCurrentKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [testResult, setTestResult] = useState<ApiKeyTestResult | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testingNewKey, setTestingNewKey] = useState(false);

  // Test current API key
  const testCurrentKey = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-key-updater/test-current-key`,
        {
          method: 'GET',
          headers: {
'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        hasKey: false,
        keyLength: 0,
        message: `Error testing current key: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get current key info
  const getCurrentKeyInfo = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-key-updater/key-info`,
        {
          method: 'GET',
          headers: {
'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      setCurrentKeyInfo(result);
    } catch (error) {
      console.error('Error getting key info:', error);
    }
  };

  // Test new API key
  const testNewKey = async () => {
    if (!newApiKey.trim()) {
      setTestResult({
        success: false,
        hasKey: false,
        keyLength: 0,
        message: 'Please enter an API key to test'
      });
      return;
    }

    setTestingNewKey(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-key-updater/test-new-key`,
        {
          method: 'POST',
          headers: {
'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ apiKey: newApiKey })
        }
      );

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        hasKey: false,
        keyLength: 0,
        message: `Error testing new key: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTestingNewKey(false);
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('API key copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy API key:', err);
    });
  };

  // Load initial data
  useEffect(() => {
    getCurrentKeyInfo();
    testCurrentKey();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            ATTOM API Key Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure and test your ATTOM Data API key. This key is required for property data fetching.
          </p>
        </CardContent>
      </Card>

      {/* Current Key Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Current API Key Status
            <Button 
              onClick={testCurrentKey} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentKeyInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Key Present:</span>
                    {currentKeyInfo.hasKey ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        No
                      </Badge>
                    )}
                  </div>
                  
                  {currentKeyInfo.hasKey && (
                    <Fragment>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Length:</span>
                        <span className="text-sm">{currentKeyInfo.keyLength} characters</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Preview:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {currentKeyInfo.keyPreview || 'N/A'}
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Estimated Tier:</span>
                        <Badge variant="secondary">
                          {currentKeyInfo.estimatedTier || 'Unknown'}
                        </Badge>
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            )}

            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                      {testResult.message}
                    </p>
                    
                    {testResult.testResult && (
                      <div className="text-xs space-y-1">
                        <p>Status: {testResult.testResult.status} {testResult.testResult.statusText}</p>
                        {testResult.testResult.hasData !== undefined && (
                          <p>Has Data: {testResult.testResult.hasData ? 'Yes' : 'No'}</p>
                        )}
                      </div>
                    )}
                    
                    {testResult.recommendation && (
                      <p className="text-xs font-medium mt-2">
                        💡 {testResult.recommendation}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test New Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Test New API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showNewKey ? 'text' : 'password'}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Enter your ATTOM API key here..."
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewKey(!showNewKey)}
                    className="p-1 h-auto"
                  >
                    {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  {newApiKey && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(newApiKey)}
                      className="p-1 h-auto"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={testNewKey}
                disabled={testingNewKey || !newApiKey.trim()}
              >
                {testingNewKey ? (
                  <Fragment>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </Fragment>
                ) : (
                  <Fragment>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test Key
                  </Fragment>
                )}
              </Button>
            </div>

            {/* Quick fill button with the provided key */}
            <div className="flex gap-2 items-center">
              <Button
                onClick={() => setNewApiKey('cca24467d5861c7e58a2bc7c9cc926af')}
                variant="outline"
                size="sm"
              >
                Use Provided Key
              </Button>
              <span className="text-xs text-muted-foreground">
                Fill with the API key provided in the conversation
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Configuration Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">To configure your ATTOM API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Test your API key using the form above</li>
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to Settings → Edge Functions → Environment Variables</li>
                    <li>Add/update the environment variable: <code className="bg-muted px-1">ATTOM_API_KEY</code></li>
                    <li>Set the value to your working API key</li>
                    <li>Redeploy your edge functions: <code className="bg-muted px-1">supabase functions deploy --no-verify-jwt</code></li>
                    <li>Test the configuration using the "Test Current Key" button above</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <Key className="w-4 h-4" />
              <AlertDescription>
                <p className="text-sm">
                  <strong>Security Note:</strong> Never expose API keys in client-side code or commit them to version control. 
                  Always use environment variables for sensitive credentials.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}