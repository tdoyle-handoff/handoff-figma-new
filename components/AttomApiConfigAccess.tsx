import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Settings, 
  Key, 
  ExternalLink,
  ArrowRight,
  Zap,
  TestTube
} from 'lucide-react';

export function AttomApiConfigAccess() {
  const openConfigTool = () => {
    window.location.href = '?attom-api-config=true';
  };

  const openDevTools = () => {
    window.location.href = '?dev=true';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Key className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-semibold">ATTOM API Tools</h1>
          </div>
          <p className="text-muted-foreground">
            Access comprehensive tools for configuring and testing the ATTOM Data API integration.
          </p>
        </div>

        {/* Main Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Tool */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={openConfigTool}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Configuration Tool
                <Badge variant="default" className="ml-auto">
                  New
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Comprehensive tool for API key management, endpoint testing, and parameter configuration.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Key className="w-3 h-3" />
                  <span>API Key Configuration & Testing</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <TestTube className="w-3 h-3" />
                  <span>Endpoint Testing with Parameters</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="w-3 h-3" />
                  <span>Save & Load Configurations</span>
                </div>
              </div>

              <Button className="w-full" onClick={openConfigTool}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Configuration Tool
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          {/* Dev Tools Access */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={openDevTools}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-muted-foreground" />
                Developer Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Access the full developer tools suite including API testing, debugging, and demo pages.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span>Address Validation Demo</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>MLS Integration Demo</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>Authentication Testing</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={openDevTools}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Developer Tools
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '?attom-api-config=true'}
                className="justify-start"
              >
                <Key className="w-4 h-4 mr-2" />
                API Config
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '?dev=true'}
                className="justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Dev Tools
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '?attom-debug=true'}
                className="justify-start"
              >
                <TestTube className="w-4 h-4 mr-2" />
                ATTOM Debug
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/'}
                className="justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Main App
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* URL Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Direct URL Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">ATTOM API Configuration Tool:</p>
                <code className="text-xs bg-background px-2 py-1 rounded mt-1 block">
                  {window.location.origin}?attom-api-config=true
                </code>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Developer Tools:</p>
                <code className="text-xs bg-background px-2 py-1 rounded mt-1 block">
                  {window.location.origin}?dev=true
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}