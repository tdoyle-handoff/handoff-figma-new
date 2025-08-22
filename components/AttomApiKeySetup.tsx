import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Key, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Eye, 
  EyeOff,
  Loader2,
  Globe,
  CreditCard,
  Shield,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ApiKeyValidation {
  isValid: boolean;
  format: 'valid' | 'short' | 'long' | 'invalid';
  hasSpecialChars: boolean;
  length: number;
  estimated_tier: string;
}

const ATTOM_SUBSCRIPTION_TIERS = [
  {
    name: 'Basic',
    price: '$99/month',
    features: [
      'Basic Property Data',
      'Property Search',
      'Basic Property Details',
      '10,000 API calls/month'
    ],
    endpoints: [
      '/property/basicprofile',
      '/property/address'
    ]
  },
  {
    name: 'Enhanced',
    price: '$199/month',
    features: [
      'All Basic features',
      'Enhanced Property Data',
      'Tax Assessment Data',
      'Property History',
      '25,000 API calls/month'
    ],
    endpoints: [
      '/property/detail',
      '/property/expandedprofile',
      '/property/sale'
    ]
  },
  {
    name: 'Premium',
    price: '$399/month',
    features: [
      'All Enhanced features',
      'AVM (Automated Valuation)',
      'Comparable Sales',
      'Market Analytics',
      '50,000 API calls/month'
    ],
    endpoints: [
      '/avm',
      '/property/comparison',
      '/market/snapshot'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'All Premium features',
      'Bulk Data Access',
      'Custom Integrations',
      'Dedicated Support',
      'Unlimited API calls'
    ],
    endpoints: [
      '/property/bulk',
      '/market/trends',
      '/analytics/comprehensive'
    ]
  }
];

export function AttomApiKeySetup() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ApiKeyValidation | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const validateApiKeyFormat = (key: string): ApiKeyValidation => {
    const length = key.length;
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(key);
    const hasNumbers = /\d/.test(key);
    const hasLetters = /[a-zA-Z]/.test(key);
    
    let format: ApiKeyValidation['format'] = 'invalid';
    let estimated_tier = 'Unknown';
    
    if (length >= 20 && length <= 50 && hasNumbers && hasLetters) {
      format = 'valid';
      
      // Estimate tier based on key patterns (this is just a guess)
      if (length >= 40) {
        estimated_tier = 'Enterprise';
      } else if (length >= 35) {
        estimated_tier = 'Premium';
      } else if (length >= 30) {
        estimated_tier = 'Enhanced';
      } else {
        estimated_tier = 'Basic';
      }
    } else if (length < 20) {
      format = 'short';
    } else if (length > 50) {
      format = 'long';
    }
    
    return {
      isValid: format === 'valid',
      format,
      hasSpecialChars,
      length,
      estimated_tier
    };
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (value.length > 0) {
      const validation = validateApiKeyFormat(value);
      setValidation(validation);
    } else {
      setValidation(null);
    }
  };

  const testApiKey = async () => {
    if (!apiKey) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Test the API key with a simple request
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-key-updater/test-new-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });
      
      const result = await response.json();
      setTestResult(result);
      
    } catch (error) {
      setTestResult({
        success: false,
        error: `Network error: ${error.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case 'valid': return 'default';
      case 'short': return 'destructive';
      case 'long': return 'secondary';
      default: return 'destructive';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Key className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">ATTOM API Key Setup</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get a new ATTOM Data API key to fix authentication issues and access comprehensive property data.
        </p>
      </div>

      <Tabs defaultValue="get-key" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="get-key">Get API Key</TabsTrigger>
          <TabsTrigger value="enter-key">Enter Key</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="troubleshoot">Troubleshoot</TabsTrigger>
        </TabsList>

        {/* Get API Key Tab */}
        <TabsContent value="get-key" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Get Your ATTOM Data API Key
              </CardTitle>
              <CardDescription>
                Follow these steps to get a new API key from ATTOM Data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Visit ATTOM Developer Portal</h3>
                    <p className="text-sm text-muted-foreground">
                      Go to the official ATTOM Data developer portal to create an account or sign in.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://api.developer.attomdata.com/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open ATTOM Developer Portal
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Create Account or Sign In</h3>
                    <p className="text-sm text-muted-foreground">
                      Register for a new account or log in with your existing credentials.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Use a business email address if possible</li>
                      <li>Provide accurate company information</li>
                      <li>Verify your email address</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Choose Your Subscription</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the subscription tier that meets your needs. Most real estate applications need at least Enhanced.
                    </p>
                    <Badge variant="secondary">
                      Recommended: Enhanced ($199/month) for property details and tax data
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Generate API Key</h3>
                    <p className="text-sm text-muted-foreground">
                      Navigate to "API Keys" or "Dashboard" and generate a new API key.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Copy the API key immediately (it may not be shown again)</li>
                      <li>Store it securely</li>
                      <li>Never share it publicly</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    5
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Add Key to Handoff</h3>
                    <p className="text-sm text-muted-foreground">
                      Once you have your API key, enter it in the "Enter Key" tab to test and configure it.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => {
                      const enterKeyTab = document.querySelector('[value="enter-key"]') as HTMLElement;
                      enterKeyTab?.click();
                    }}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Go to Enter Key Tab
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  <strong>Implementation Note:</strong> We follow ATTOM's official authentication format 
                  using headers (accept: application/json, apikey: your-key) as specified in their 
                  JavaScript documentation, not query parameters.
                </AlertDescription>
              </Alert>

              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> ATTOM API keys provide access to valuable property data. 
                  Keep your key secure and never commit it to version control or share it publicly.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enter Key Tab */}
        <TabsContent value="enter-key" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Enter Your ATTOM API Key
              </CardTitle>
              <CardDescription>
                Paste your API key here to validate and test it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">ATTOM API Key</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="Enter your ATTOM Data API key..."
                      className="pr-20"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-7 w-7 p-0"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      {apiKey && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey)}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {validation && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">Key Validation:</h4>
                      <Badge variant={getFormatBadgeColor(validation.format)}>
                        {validation.format === 'valid' ? 'Valid Format' : 
                         validation.format === 'short' ? 'Too Short' :
                         validation.format === 'long' ? 'Too Long' : 'Invalid Format'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        {validation.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span>Format</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Length:</span>
                        <span>{validation.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tier:</span>
                        <span>{validation.estimated_tier}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {validation.hasSpecialChars ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        <span>Characters</span>
                      </div>
                    </div>

                    {validation.hasSpecialChars && (
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          Your API key contains special characters. While this might be normal, 
                          ensure you've copied it correctly without any extra spaces or characters.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={testApiKey} 
                    disabled={!apiKey || !validation?.isValid || isTesting}
                    className="flex-1"
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Test API Key
                  </Button>
                </div>

                {testResult && (
                  <Card className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {testResult.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="space-y-2">
                          <h4 className="font-medium">
                            {testResult.success ? 'API Key Test Successful!' : 'API Key Test Failed'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {testResult.success 
                              ? 'Your API key is working correctly and can access ATTOM Data.'
                              : testResult.error || 'The API key test failed. Please check your key and try again.'
                            }
                          </p>
                          
                          {testResult.success && (
                            <Alert>
                              <CheckCircle className="w-4 h-4" />
                              <AlertDescription>
                                <strong>Next Step:</strong> Contact your system administrator to update the 
                                ATTOM_API_KEY environment variable with this working API key.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid gap-6">
            {ATTOM_SUBSCRIPTION_TIERS.map((tier, index) => (
              <Card key={tier.name} className={tier.name === 'Enhanced' ? 'border-primary bg-primary/5' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{tier.name}</CardTitle>
                      {tier.name === 'Enhanced' && (
                        <Badge>Recommended</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-bold">{tier.price}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">API Endpoints</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {tier.endpoints.map((endpoint, idx) => (
                          <li key={idx} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {endpoint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Troubleshoot Tab */}
        <TabsContent value="troubleshoot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Common Issues & Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-red-600 mb-2">401 Unauthorized Error</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    This usually means your API key is invalid, expired, or incorrectly formatted.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Check if your API key is correct and fully copied</li>
                    <li>Verify your ATTOM Data account is active</li>
                    <li>Ensure your subscription hasn't expired</li>
                    <li>Generate a new API key if the current one is old</li>
                    <li><strong>Note:</strong> We use ATTOM's official header-based authentication (apikey in headers)</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-yellow-600 mb-2">403 Forbidden Error</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your API key is valid but your subscription doesn't include access to the requested endpoint.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Check which subscription tier you have</li>
                    <li>Upgrade to access premium endpoints</li>
                    <li>Contact ATTOM support for endpoint clarification</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-blue-600 mb-2">SuccessWithoutResult</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    The API call succeeded but no data was found for the requested property.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Try a different address format</li>
                    <li>Verify the property exists in ATTOM's database</li>
                    <li>Use a well-known address for testing</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-purple-600 mb-2">No Rule Matched</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    The address format wasn't recognized by ATTOM's address parsing system.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Use standard address formats: "123 Main St, City, State ZIP"</li>
                    <li>Avoid abbreviations when possible</li>
                    <li>Include city, state, and ZIP code</li>
                    <li>Test with the format guide in our address tools</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Quick Test Addresses</h4>
                <p className="text-sm text-muted-foreground">
                  Use these addresses to test your API key:
                </p>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-mono text-sm">586 Franklin Ave, Brooklyn, NY 11238</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('586 Franklin Ave, Brooklyn, NY 11238')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-mono text-sm">11 Village Street, Deep River, CT 06412</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('11 Village Street, Deep River, CT 06412')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}