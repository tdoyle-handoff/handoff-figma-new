import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy, 
  Key, Settings, Search, TestTube, FileText, Lightbulb,
  Code, Globe, Database, Wrench
} from 'lucide-react';
import { toast } from 'sonner';

interface FixedItem {
  issue: string;
  fix: string;
  status: 'completed' | 'in-progress' | 'verification-needed';
  category: 'server' | 'client' | 'configuration' | 'documentation';
  impact: 'high' | 'medium' | 'low';
}

const FIXED_ISSUES: FixedItem[] = [
  {
    issue: 'API Key sent as header instead of query parameter',
    fix: 'Updated both attom.ts and attom-comprehensive.ts to send apikey as query parameter per ATTOM API requirements',
    status: 'completed',
    category: 'server',
    impact: 'high'
  },
  {
    issue: 'Missing "accept" parameter in API requests',
    fix: 'Added accept=application/json parameter to all ATTOM API calls as required by documentation',
    status: 'completed',
    category: 'server', 
    impact: 'high'
  },
  {
    issue: 'Incorrect error handling for "SuccessWithoutResult"',
    fix: 'Updated error detection to properly handle SuccessWithoutResult as valid response with no data',
    status: 'completed',
    category: 'server',
    impact: 'medium'
  },
  {
    issue: 'Enhanced ATTOM API error messages and status codes',
    fix: 'Improved error parsing to provide specific messages for 401, 404, 400, 429, and 500+ errors',
    status: 'completed',
    category: 'server',
    impact: 'medium'
  },
  {
    issue: 'Search diagnostic tool using wrong endpoint paths',
    fix: 'Updated AttomSearchDiagnostic to use correct endpoint paths without /propertyapi/v1.0.0 prefix',
    status: 'completed',
    category: 'client',
    impact: 'medium'
  },
  {
    issue: 'Incomplete parameter format documentation',
    fix: 'Added comprehensive ATTOM API format guide showing correct URL structure with all required parameters',
    status: 'completed',
    category: 'documentation',
    impact: 'low'
  },
  {
    issue: 'Missing API key validation in server responses',
    fix: 'Enhanced server logging and error responses to help diagnose API key authentication issues',
    status: 'completed',
    category: 'server',
    impact: 'medium'
  }
];

const VERIFICATION_TESTS = [
  {
    test: 'API Key Authentication',
    description: 'Verify ATTOM_API_KEY is sent correctly as query parameter',
    tool: '?api-key-validator=true'
  },
  {
    test: 'Search Parameter Format',
    description: 'Test address1 & address2 parameter format with documented example',
    tool: '?attom-search-diagnostic=true'
  },
  {
    test: 'Endpoint Configuration', 
    description: 'Check all endpoint URLs match ATTOM API documentation',
    tool: '?attom-admin-diagnostic=true'
  }
];

export function AttomApiFixSummary() {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const copyExampleUrl = () => {
    const exampleUrl = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0/sale/detail?address1=586+FRANKLIN+AVE&address2=brooklyn+NY+11238&apikey=YOUR_KEY&accept=application/json&debug=True';
    navigator.clipboard.writeText(exampleUrl);
    setCopySuccess('URL copied to clipboard');
    toast.success('Example URL copied to clipboard');
    setTimeout(() => setCopySuccess(null), 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'verification-needed':
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'server':
        return <Database className="w-4 h-4" />;
      case 'client':
        return <Globe className="w-4 h-4" />;
      case 'configuration':
        return <Settings className="w-4 h-4" />;
      case 'documentation':
        return <FileText className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedCount = FIXED_ISSUES.filter(item => item.status === 'completed').length;
  const totalCount = FIXED_ISSUES.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-semibold">ATTOM API Integration Fixes</h1>
            <p className="text-sm text-muted-foreground">
              Summary of issues fixed to resolve ATTOM API authentication and parameter errors
            </p>
          </div>
        </div>

        {/* Progress Summary */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Fix Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Complete!</strong> {completedCount}/{totalCount} issues fixed. 
                  The ATTOM API integration now follows the official documentation requirements.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                  <div className="text-muted-foreground">Fixes Applied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-muted-foreground">Server Files Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">1</div>
                  <div className="text-muted-foreground">Diagnostic Tool Enhanced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-muted-foreground">Verification Tests</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Critical Fixes Applied
            </CardTitle>
            <CardDescription>
              These changes resolve the core authentication and parameter format issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  API Key Authentication Fix
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-red-700"><strong>Before:</strong> API key sent in Authorization header</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-green-700"><strong>After:</strong> API key sent as "apikey" query parameter</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-green-600" />
                  Parameter Format Fix
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-red-700"><strong>Before:</strong> Missing "accept" parameter, incorrect error handling</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-green-700"><strong>After:</strong> All required parameters included, proper error detection</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corrected API Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Corrected ATTOM API Format
            </CardTitle>
            <CardDescription>
              The fixed implementation now matches ATTOM documentation exactly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Complete ATTOM API Request URL:</p>
                  <Button size="sm" variant="outline" onClick={copyExampleUrl}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <code className="text-xs bg-background px-3 py-2 rounded border block break-all">
                  https://api.gateway.attomdata.com/propertyapi/v1.0.0/sale/detail?address1=586+FRANKLIN+AVE&address2=brooklyn+NY+11238&apikey=YOUR_KEY&accept=application/json&debug=True
                </code>
                {copySuccess && (
                  <p className="text-xs text-green-600 mt-1">{copySuccess}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Required Parameters:</h4>
                  <div className="space-y-1 text-sm">
                    <div><code className="text-xs bg-muted px-1 rounded">address1</code> = Street address only</div>
                    <div><code className="text-xs bg-muted px-1 rounded">address2</code> = City, State, ZIP</div>
                    <div><code className="text-xs bg-muted px-1 rounded">apikey</code> = Your ATTOM API key</div>
                    <div><code className="text-xs bg-muted px-1 rounded">accept</code> = application/json</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Optional Parameters:</h4>
                  <div className="space-y-1 text-sm">
                    <div><code className="text-xs bg-muted px-1 rounded">debug</code> = True (include null fields)</div>
                    <div><code className="text-xs bg-muted px-1 rounded">callback</code> = JSONP callback name</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Fix List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detailed Fix List
            </CardTitle>
            <CardDescription>
              All issues identified and resolved in the ATTOM API integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {FIXED_ISSUES.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(item.status)}
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{item.issue}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{item.fix}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.category}
                          </Badge>
                          <Badge className={`text-xs border ${getImpactColor(item.impact)}`}>
                            {item.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-orange-600" />
              Verification & Testing
            </CardTitle>
            <CardDescription>
              Use these tools to verify the fixes are working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {VERIFICATION_TESTS.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{test.test}</h4>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = test.tool}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                Testing Recommendations
              </h4>
              <ul className="text-sm space-y-1 text-blue-800">
                <li>• Start with the documented example address: "586 Franklin Ave, Brooklyn, NY 11238"</li>
                <li>• Verify your API key is active using the API Key Validator</li>
                <li>• Use the Search Diagnostic tool to test different address formats</li>
                <li>• Check server logs for detailed error messages if issues persist</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-600" />
              What's Fixed & Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-600">✅ Now Working:</h4>
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>• API key authentication via query parameter</li>
                    <li>• Correct parameter format (address1 & address2)</li>
                    <li>• Proper error handling for "SuccessWithoutResult"</li>
                    <li>• Enhanced error messages and debugging</li>
                    <li>• All required ATTOM API parameters included</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 text-blue-600">📋 Test With:</h4>
                  <ul className="text-sm space-y-1 text-blue-700">
                    <li>• Documented example address from ATTOM</li>
                    <li>• Well-known landmark addresses</li>
                    <li>• Your specific property addresses</li>
                    <li>• Different endpoint types (sale, property, AVM)</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Ready to Use:</strong> The ATTOM API integration has been fixed and should now work correctly 
                  with proper authentication and parameter formatting. Test with the diagnostic tools to verify functionality.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '?attom-search-diagnostic=true'}
                className="justify-start"
              >
                <Search className="w-4 h-4 mr-2" />
                Test Search
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '?api-key-validator=true'}
                className="justify-start"
              >
                <Key className="w-4 h-4 mr-2" />
                Validate API Key
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = window.location.pathname}
                className="justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Return to App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}