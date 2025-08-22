import { Fragment } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  Settings, 
  Key, 
  TestTube, 
  Save, 
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Database,
  Zap,
  Home,
  MapPin,
  DollarSign,
  FileText,
  Search,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ATTOM_API_DEFAULT_KEY } from '../utils/attom/config';

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
    parsedStatus?: any;
  };
  message: string;
  recommendation?: string;
}

interface AttomEndpoint {
  id: string;
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
  parameters: AttomParameter[];
  sampleAddress?: string;
}

interface AttomParameter {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'boolean';
  required: boolean;
  description: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface TestConfiguration {
  endpoint: string;
  parameters: Record<string, any>;
  apiKey: string;
}

interface SavedConfiguration {
  id: string;
  name: string;
  endpoint: string;
  parameters: Record<string, any>;
  createdAt: string;
}

export function AttomApiConfigurationTool() {
  // State management
  const [activeTab, setActiveTab] = useState('api-key');
  const [apiKey, setApiKey] = useState(ATTOM_API_DEFAULT_KEY);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<ApiKeyTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('basicprofile');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [testResponse, setTestResponse] = useState<any>(null);
  const [savedConfigurations, setSavedConfigurations] = useState<SavedConfiguration[]>([]);
  const [configurationName, setConfigurationName] = useState('');
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false);

  // ATTOM API endpoints configuration
  const endpoints: AttomEndpoint[] = [
    {
      id: 'basicprofile',
      name: 'Basic Profile',
      path: '/propertyapi/v1.0.0/property/basicprofile',
      description: 'Get basic property information including address, lot size, and building details',
      icon: <Home className="w-4 h-4" />,
      parameters: [
        {
          name: 'address1',
          label: 'Street Address',
          type: 'text',
          required: true,
          description: 'Street address of the property',
          placeholder: '586 Franklin Ave'
        },
        {
          name: 'address2',
          label: 'City, State',
          type: 'text',
          required: true,
          description: 'City and state',
          placeholder: 'Brooklyn, NY'
        },
        {
          name: 'geoid',
          label: 'Geographic ID',
          type: 'text',
          required: false,
          description: 'Optional geographic identifier'
        }
      ],
      sampleAddress: '586 Franklin Ave, Brooklyn, NY'
    },
    {
      id: 'detail',
      name: 'Property Detail',
      path: '/propertyapi/v1.0.0/property/detail',
      description: 'Get detailed property information including rooms, features, and history',
      icon: <Database className="w-4 h-4" />,
      parameters: [
        {
          name: 'address1',
          label: 'Street Address',
          type: 'text',
          required: true,
          description: 'Street address of the property',
          placeholder: '586 Franklin Ave'
        },
        {
          name: 'address2',
          label: 'City, State',
          type: 'text',
          required: true,
          description: 'City and state',
          placeholder: 'Brooklyn, NY'
        }
      ]
    },
    {
      id: 'valuation',
      name: 'Property Valuation',
      path: '/propertyapi/v1.0.0/property/valuation',
      description: 'Get property valuation and market data',
      icon: <DollarSign className="w-4 h-4" />,
      parameters: [
        {
          name: 'address1',
          label: 'Street Address',
          type: 'text',
          required: true,
          description: 'Street address of the property',
          placeholder: '586 Franklin Ave'
        },
        {
          name: 'address2',
          label: 'City, State',
          type: 'text',
          required: true,
          description: 'City and state',
          placeholder: 'Brooklyn, NY'
        }
      ]
    },
    {
      id: 'expandedprofile',
      name: 'Expanded Profile',
      path: '/propertyapi/v1.0.0/property/expandedprofile',
      description: 'Get comprehensive property data including all available information',
      icon: <FileText className="w-4 h-4" />,
      parameters: [
        {
          name: 'address1',
          label: 'Street Address',
          type: 'text',
          required: true,
          description: 'Street address of the property',
          placeholder: '586 Franklin Ave'
        },
        {
          name: 'address2',
          label: 'City, State',
          type: 'text',
          required: true,
          description: 'City and state',
          placeholder: 'Brooklyn, NY'
        }
      ]
    }
  ];

  // Get current endpoint configuration
  const currentEndpoint = endpoints.find(e => e.id === selectedEndpoint) || endpoints[0];

  // Initialize parameters when endpoint changes
  useEffect(() => {
    const newParams: Record<string, any> = {};
    currentEndpoint.parameters.forEach(param => {
      newParams[param.name] = param.defaultValue || '';
    });
    setParameters(newParams);
  }, [selectedEndpoint]);

  // Load API key from environment on component mount
  useEffect(() => {
    loadCurrentApiKey();
    loadSavedConfigurations();
  }, []);

  // Load current API key
  const loadCurrentApiKey = async () => {
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

      if (response.ok) {
        const result = await response.json();
        if (result.hasKey) {
          // Key exists on server; for security, do not expose it in the client.
          // You can test endpoints via server proxies that attach the key.
        }
      }
    } catch (error) {
      console.error('Error loading current API key:', error);
    }
  };

  // Test API key
  const testApiKey = async (keyToTest?: string) => {
    const testKey = keyToTest || apiKey;
    if (!testKey.trim()) {
      setTestResult({
        success: false,
        hasKey: false,
        keyLength: 0,
        message: 'Please enter an API key to test'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-key-updater/test-new-key`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ apiKey: testKey })
        }
      );

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        hasKey: false,
        keyLength: 0,
        message: `Error testing API key: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test endpoint with current configuration
  const testEndpoint = async () => {
    if (!apiKey.trim()) {
      alert('Please configure your API key first');
      return;
    }

    setIsTestingEndpoint(true);
    setTestResponse(null);

    try {
      // Build URL with parameters
      const baseUrl = `https://api.gateway.attomdata.com${currentEndpoint.path}`;
      const url = new URL(baseUrl);
      
      // Add parameters to URL
      Object.entries(parameters).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          url.searchParams.append(key, value.toString());
        }
      });

      console.log('Testing endpoint:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'apikey': apiKey,
          'User-Agent': 'Handoff-RealEstate/1.0'
        }
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { 
          rawResponse: responseText,
          parseError: 'Failed to parse as JSON'
        };
      }

      setTestResponse({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        url: url.toString(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      setTestResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingEndpoint(false);
    }
  };

  // Parameter update handler
  const updateParameter = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Save configuration
  const saveConfiguration = () => {
    if (!configurationName.trim()) {
      alert('Please enter a configuration name');
      return;
    }

    const newConfig: SavedConfiguration = {
      id: Date.now().toString(),
      name: configurationName,
      endpoint: selectedEndpoint,
      parameters: { ...parameters },
      createdAt: new Date().toISOString()
    };

    setSavedConfigurations(prev => [newConfig, ...prev]);
    setConfigurationName('');
    
    // Save to localStorage
    try {
      localStorage.setItem('attom-saved-configurations', JSON.stringify([newConfig, ...savedConfigurations]));
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  // Load saved configurations
  const loadSavedConfigurations = () => {
    try {
      const saved = localStorage.getItem('attom-saved-configurations');
      if (saved) {
        setSavedConfigurations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved configurations:', error);
    }
  };

  // Load a saved configuration
  const loadConfiguration = (config: SavedConfiguration) => {
    setSelectedEndpoint(config.endpoint);
    setParameters(config.parameters);
    setActiveTab('endpoint-testing');
  };

  // Delete a saved configuration
  const deleteConfiguration = (configId: string) => {
    const updated = savedConfigurations.filter(config => config.id !== configId);
    setSavedConfigurations(updated);
    
    try {
      localStorage.setItem('attom-saved-configurations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving configurations:', error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // Fill sample data
  const fillSampleData = () => {
    if (currentEndpoint.sampleAddress) {
      const addressParts = currentEndpoint.sampleAddress.split(', ');
      if (addressParts.length >= 2) {
        // For format "586 Franklin Ave, Brooklyn, NY"
        const address1 = addressParts[0]; // "586 Franklin Ave"
        const address2 = addressParts.slice(1).join(', '); // "Brooklyn, NY"
        setParameters(prev => ({
          ...prev,
          address1: address1 || '',
          address2: address2 || ''
        }));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            ATTOM API Configuration Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comprehensive tool for configuring, testing, and managing ATTOM Data API integrations.
            Configure your API key, test different endpoints, and save parameter configurations for reuse.
          </p>
        </CardContent>
      </Card>

      {/* Main Configuration Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-key" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Key
          </TabsTrigger>
          <TabsTrigger value="endpoint-testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Endpoint Testing
          </TabsTrigger>
          <TabsTrigger value="saved-configs" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Saved Configs
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* API Key Configuration Tab */}
        <TabsContent value="api-key" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Key Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">ATTOM API Key</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your ATTOM API key..."
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1 h-auto"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      {apiKey && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey)}
                          className="p-1 h-auto"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => testApiKey()}
                    disabled={isLoading || !apiKey.trim()}
                  >
                    {isLoading ? (
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
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 items-center">
                <Button
                  onClick={() => setApiKey(ATTOM_API_DEFAULT_KEY)}
                  variant="outline"
                  size="sm"
                >
                  Use Provided Key
                </Button>
                <Button
                  onClick={() => setApiKey('')}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
              </div>

              {/* Test Results */}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoint Testing Tab */}
        <TabsContent value="endpoint-testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Endpoint Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Endpoint Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ATTOM API Endpoint</Label>
                  <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {endpoints.map((endpoint) => (
                        <SelectItem key={endpoint.id} value={endpoint.id}>
                          <div className="flex items-center gap-2">
                            {endpoint.icon}
                            {endpoint.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {currentEndpoint.description}
                  </p>
                  <p className="text-xs font-mono mt-1">
                    {currentEndpoint.path}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Parameters Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Parameters
                  <Button
                    onClick={fillSampleData}
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                  >
                    Fill Sample
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentEndpoint.parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name}>
                      {param.label}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {param.type === 'text' || param.type === 'number' ? (
                      <Input
                        id={param.name}
                        type={param.type}
                        value={parameters[param.name] || ''}
                        onChange={(e) => updateParameter(param.name, e.target.value)}
                        placeholder={param.placeholder}
                        required={param.required}
                      />
                    ) : param.type === 'select' ? (
                      <Select
                        value={parameters[param.name] || ''}
                        onValueChange={(value) => updateParameter(param.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option..." />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : param.type === 'boolean' ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={parameters[param.name] || false}
                          onCheckedChange={(checked) => updateParameter(param.name, checked)}
                        />
                        <Label>{param.description}</Label>
                      </div>
                    ) : null}
                    
                    <p className="text-xs text-muted-foreground">
                      {param.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-center">
                <Button
                  onClick={testEndpoint}
                  disabled={isTestingEndpoint || !apiKey.trim()}
                  className="flex-1 max-w-xs"
                >
                  {isTestingEndpoint ? (
                    <Fragment>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Zap className="w-4 h-4 mr-2" />
                      Test API Call
                    </Fragment>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Input
                    value={configurationName}
                    onChange={(e) => setConfigurationName(e.target.value)}
                    placeholder="Configuration name..."
                    className="w-48"
                  />
                  <Button
                    onClick={saveConfiguration}
                    variant="outline"
                    disabled={!configurationName.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Test Response */}
              {testResponse && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={testResponse.success ? 'default' : 'destructive'}>
                      {testResponse.success ? 'Success' : 'Error'}
                    </Badge>
                    {testResponse.status && (
                      <Badge variant="outline">
                        {testResponse.status} {testResponse.statusText}
                      </Badge>
                    )}
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(testResponse, null, 2))}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Request URL</Label>
                      <Textarea
                        value={testResponse.url || 'N/A'}
                        readOnly
                        className="text-xs font-mono mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Response Headers</Label>
                      <Textarea
                        value={JSON.stringify(testResponse.headers || {}, null, 2)}
                        readOnly
                        className="text-xs font-mono mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Response Data</Label>
                    <Textarea
                      value={JSON.stringify(testResponse.data || testResponse.error || {}, null, 2)}
                      readOnly
                      className="text-xs font-mono mt-1"
                      rows={15}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Configurations Tab */}
        <TabsContent value="saved-configs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Saved Configurations
                <Badge variant="outline" className="ml-auto">
                  {savedConfigurations.length} saved
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedConfigurations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved configurations yet. Create and save configurations from the Endpoint Testing tab.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedConfigurations.map((config) => (
                    <Card key={config.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {endpoints.find(e => e.id === config.endpoint)?.icon}
                          {config.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-xs text-muted-foreground">
                          <p>Endpoint: {endpoints.find(e => e.id === config.endpoint)?.name}</p>
                          <p>Created: {new Date(config.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="text-xs">
                          <p className="font-medium mb-1">Parameters:</p>
                          <div className="space-y-1">
                            {Object.entries(config.parameters).map(([key, value]) => (
                              value && (
                                <p key={key} className="text-muted-foreground">
                                  {key}: {value.toString()}
                                </p>
                              )
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => loadConfiguration(config)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Load
                          </Button>
                          <Button
                            onClick={() => deleteConfiguration(config.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-medium">Configuration Management</p>
                  <p className="text-sm mt-1">
                    Export your configurations for backup or import from another setup.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Export Configurations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        const dataStr = JSON.stringify(savedConfigurations, null, 2);
                        const dataBlob = new Blob([dataStr], {type: 'application/json'});
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `attom-configurations-${new Date().toISOString().split('T')[0]}.json`;
                        link.click();
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Configurations
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Import Configurations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const configs = JSON.parse(event.target?.result as string);
                                setSavedConfigurations(prev => [...configs, ...prev]);
                                localStorage.setItem('attom-saved-configurations', JSON.stringify([...configs, ...savedConfigurations]));
                              } catch (error) {
                                alert('Failed to import configurations: Invalid file format');
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        input.click();
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Configurations
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all saved configurations? This cannot be undone.')) {
                        setSavedConfigurations([]);
                        localStorage.removeItem('attom-saved-configurations');
                      }
                    }}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Configurations
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}