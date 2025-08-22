import { Fragment } from 'react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useIsMobile } from './ui/use-mobile';
import { SupabaseAuthTest } from './SupabaseAuthTest';
import { AttomApiKeyConfigurator } from './AttomApiKeyConfigurator';
import { 
  Code, 
  Database, 
  MapPin, 
  Search, 
  Home, 
  ExternalLink,
  Settings,
  Eye,
  Shield,
  Key
} from 'lucide-react';

interface DevToolsProps {
  onNavigate?: (page: string) => void;
}

export function DevTools({ onNavigate }: DevToolsProps) {
  const isMobile = useIsMobile();
  const [apiStatus, setApiStatus] = useState<'unknown' | 'checking' | 'available' | 'unavailable'>('unknown');
  const [activeTab, setActiveTab] = useState<'overview' | 'auth-test' | 'attom-config'>('overview');

  const handleTestAPI = async () => {
    setApiStatus('checking');
    try {
      // Test the health endpoint
      const response = await fetch('/api/health');
      if (response.ok) {
        setApiStatus('available');
      } else {
        setApiStatus('unavailable');
      }
    } catch (error) {
      setApiStatus('unavailable');
    }
  };

  const demoPages = [
    {
      id: 'address-demo',
      title: 'Address Validation Demo',
      description: 'Test Google Places API integration and address autocomplete',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'mls-demo',
      title: 'MLS Integration Demo',
      description: 'Test MLS property lookup and data integration',
      icon: <Database className="w-5 h-5" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'attom-api-config',
      title: 'ATTOM API Configuration',
      description: 'Comprehensive tool for configuring and testing ATTOM Data API',
      icon: <Key className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      external: true,
      url: '?attom-api-config=true'
    }
  ];

  const apiEndpoints = [
    {
      name: 'Health Check',
      endpoint: '/api/health',
      method: 'GET',
      description: 'Test server connectivity'
    },
    {
      name: 'MLS Search by Address',
      endpoint: '/api/mls/search-by-address',
      method: 'GET',
      description: 'Search MLS by property address'
    },
    {
      name: 'MLS Search by MLS Number',
      endpoint: '/api/mls/search-by-mls',
      method: 'GET',
      description: 'Search MLS by listing number'
    }
  ];

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${isMobile ? 'page-content-mobile' : 'page-content'}`}>
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-semibold`}>
              Development Tools
            </h1>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Dev Mode
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Testing utilities and demo pages for development and integration testing.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="rounded-b-none"
          >
            <Eye className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'auth-test' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('auth-test')}
            className="rounded-b-none"
          >
            <Shield className="w-4 h-4 mr-2" />
            Auth Test
          </Button>
          <Button
            variant={activeTab === 'attom-config' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('attom-config')}
            className="rounded-b-none"
          >
            <Key className="w-4 h-4 mr-2" />
            ATTOM API
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'auth-test' ? (
        <SupabaseAuthTest />
      ) : activeTab === 'attom-config' ? (
        <AttomApiKeyConfigurator />
      ) : (
        <Fragment>
          {/* Demo Pages */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Demo Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoPages.map((page) => (
              <div key={page.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${page.color}`}>
                    {page.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if ((page as any).external && (page as any).url) {
                      window.location.href = (page as any).url;
                    } else {
                      onNavigate?.(page.id);
                    }
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {(page as any).external ? 'Open Tool' : 'Open Demo'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            API Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Server Status</h3>
              <p className="text-sm text-muted-foreground">Test backend connectivity</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  apiStatus === 'available' ? 'default' : 
                  apiStatus === 'unavailable' ? 'destructive' : 
                  'secondary'
                }
              >
                {apiStatus === 'checking' ? 'Checking...' : 
                 apiStatus === 'available' ? 'Available' : 
                 apiStatus === 'unavailable' ? 'Unavailable' : 
                 'Unknown'}
              </Badge>
              <Button onClick={handleTestAPI} size="sm" variant="outline">
                Test API
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Available Endpoints</h4>
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm">{endpoint.endpoint}</span>
                  <Badge variant="outline" className="text-xs">
                    {endpoint.method}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Environment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Required Environment Variables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <code className="bg-gray-100 px-1 rounded">ATTOM_API_KEY</code></li>
                <li>• <code className="bg-gray-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code></li>
                <li>• <code className="bg-gray-100 px-1 rounded">MLS_API_KEY</code></li>
                <li>• <code className="bg-gray-100 px-1 rounded">MLS_API_BASE_URL</code></li>
                <li>• <code className="bg-gray-100 px-1 rounded">SUPABASE_URL</code></li>
                <li>• <code className="bg-gray-100 px-1 rounded">SUPABASE_ANON_KEY</code></li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Integration Status</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>ATTOM Data API</span>
                  <Badge variant="outline">Configurable</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Google Places API</span>
                  <Badge variant="outline">Configured</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>MLS Integration</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Supabase Backend</span>
                  <Badge variant="outline">Connected</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Address Validation</span>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Testing Address Validation:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
              <li>Open the "Address Validation Demo" page</li>
              <li>Start typing any real address in the input field</li>
              <li>See autocomplete suggestions appear in real-time</li>
              <li>Select an address to see detailed address parsing</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Testing MLS Integration:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
              <li>Open the "MLS Integration Demo" page</li>
              <li>Enter a property address in the address form</li>
              <li>Watch automatic MLS lookup triggered on address selection</li>
              <li>View comprehensive property details if found in MLS</li>
              <li>Test the complete property setup workflow</li>
            </ol>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> These tools are for development and testing purposes. 
              In production, ensure all API keys are properly configured and secured.
            </p>
          </div>
        </CardContent>
      </Card>
        </Fragment>
      )}
    </div>
  );
}