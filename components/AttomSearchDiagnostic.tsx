import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { toast } from 'sonner';
import { 
  Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, 
  MapPin, Database, Target, Zap, Copy, ExternalLink, 
  FileText, Settings, Key, Bug, Lightbulb, Home, 
  Wrench, TestTube
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SearchResult {
  strategy: string;
  endpoint: string;
  success: boolean;
  status: number;
  message: string;
  data?: any;
  error?: string;
  url?: string;
  duration?: number;
  addressUsed?: string;
  parameters?: any;
  recommendations?: string[];
}

interface AddressVariation {
  label: string;
  format: string;
  description: string;
  example: string;
}

// Known working addresses for testing with proper ATTOM format
const RECOMMENDED_TEST_ADDRESSES = [
  {
    address: "586 Franklin Ave, Brooklyn, NY 11238",
    description: "Example from ATTOM documentation - Known format",
    type: "Documentation Example"
  },
  {
    address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    description: "White House - High-profile property likely in database",
    type: "Government"
  },
  {
    address: "350 5th Ave, New York, NY 10118",
    description: "Empire State Building - Landmark property",
    type: "Landmark"
  },
  {
    address: "1 Apple Park Way, Cupertino, CA 95014",
    description: "Apple Park - Corporate headquarters",
    type: "Corporate"
  },
  {
    address: "221B Baker Street, New York, NY 10001",
    description: "Modified fictional address for testing error handling",
    type: "Test Case"
  },
  {
    address: "123 Main Street, Beverly Hills, CA 90210",
    description: "Common street name in well-known ZIP code",
    type: "Generic"
  }
];

export function AttomSearchDiagnostic() {
  const [testAddress, setTestAddress] = useState('586 Franklin Ave, Brooklyn, NY 11238');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [lastSearchAddress, setLastSearchAddress] = useState('');

  // Address format variations to test with ATTOM-specific formatting
  const addressVariations: AddressVariation[] = [
    {
      label: 'ATTOM Standard Format',
      format: 'attom-standard',
      description: 'address1=STREET&address2=CITY STATE ZIP (ATTOM preferred)',
      example: 'address1=586 FRANKLIN AVE&address2=brooklyn NY 11238'
    },
    {
      label: 'Legacy Component Format',
      format: 'legacy-components',
      description: 'address1, locality, countrySubd, postalCode (old format)',
      example: 'address1=586 Franklin Ave&locality=Brooklyn&countrySubd=NY&postalCode=11238'
    },
    {
      label: 'Abbreviated Street Types',
      format: 'abbreviated',
      description: 'Convert Street→St, Avenue→Ave for address1',
      example: 'address1=586 FRANKLIN AVE&address2=brooklyn NY 11238'
    },
    {
      label: 'Full Street Types',
      format: 'full-street',
      description: 'Convert St→Street, Ave→Avenue for address1',
      example: 'address1=586 FRANKLIN AVENUE&address2=brooklyn NY 11238'
    },
    {
      label: 'Uppercase Format',
      format: 'uppercase',
      description: 'Convert all text to uppercase (some APIs prefer this)',
      example: 'address1=586 FRANKLIN AVE&address2=BROOKLYN NY 11238'
    },
    {
      label: 'URL Encoded Format',
      format: 'url-encoded',
      description: 'URL encode special characters and spaces',
      example: 'address1=586+FRANKLIN+AVE&address2=brooklyn+NY+11238'
    }
  ];

  // Search strategies to test based on ATTOM API documentation
  const searchStrategies = [
    {
      id: 'sale-detail',
      name: 'Sale Detail',
      endpoint: '/sale/detail',
      description: 'Sales history and transaction details (from documentation example)',
      priority: 'high',
      isDocumented: true
    },
    {
      id: 'property-detail',
      name: 'Property Detail', 
      endpoint: '/property/detail',
      description: 'Comprehensive property information and characteristics',
      priority: 'high',
      isDocumented: true
    },
    {
      id: 'property-basic',
      name: 'Property Basic Profile',
      endpoint: '/property/basicprofile',
      description: 'Basic property information and current owner details',
      priority: 'high',
      isDocumented: true
    },
    {
      id: 'property-expanded',
      name: 'Property Expanded Profile',
      endpoint: '/property/expandedprofile',
      description: 'Detailed property characteristics, history, and assessments',
      priority: 'medium',
      isDocumented: true
    },
    {
      id: 'avm-details',
      name: 'AVM Details',
      endpoint: '/avm/details',
      description: 'Automated Valuation Model data and price estimates',
      priority: 'low',
      isDocumented: true
    }
  ];

  const formatAddressForAttom = (address: string, format: string) => {
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length < 2) {
      return { address1: address, address2: '' };
    }

    let streetAddress = parts[0];
    let cityStateZip = parts.slice(1).join(' ');

    // Apply formatting based on type
    switch (format) {
      case 'attom-standard':
      case 'url-encoded':
        return {
          address1: streetAddress,
          address2: cityStateZip
        };

      case 'legacy-components':
        // Parse into separate components
        if (parts.length >= 3) {
          const city = parts[1];
          const stateZipMatch = parts[2].match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/);
          if (stateZipMatch) {
            const [, state, zip] = stateZipMatch;
            return {
              address1: streetAddress,
              locality: city,
              countrySubd: state,
              postalCode: zip
            };
          }
        }
        return { address1: streetAddress, address2: cityStateZip };

      case 'abbreviated':
        streetAddress = streetAddress
          .replace(/\bStreet\b/gi, 'St')
          .replace(/\bAvenue\b/gi, 'Ave')
          .replace(/\bBoulevard\b/gi, 'Blvd')
          .replace(/\bRoad\b/gi, 'Rd')
          .replace(/\bDrive\b/gi, 'Dr')
          .replace(/\bLane\b/gi, 'Ln')
          .replace(/\bCourt\b/gi, 'Ct')
          .replace(/\bPlace\b/gi, 'Pl');
        return { address1: streetAddress, address2: cityStateZip };

      case 'full-street':
        streetAddress = streetAddress
          .replace(/\bSt\b/gi, 'Street')
          .replace(/\bAve\b/gi, 'Avenue')
          .replace(/\bBlvd\b/gi, 'Boulevard')
          .replace(/\bRd\b/gi, 'Road')
          .replace(/\bDr\b/gi, 'Drive')
          .replace(/\bLn\b/gi, 'Lane')
          .replace(/\bCt\b/gi, 'Court')
          .replace(/\bPl\b/gi, 'Place');
        return { address1: streetAddress, address2: cityStateZip };

      case 'uppercase':
        return {
          address1: streetAddress.toUpperCase(),
          address2: cityStateZip.toUpperCase()
        };

      default:
        return { address1: streetAddress, address2: cityStateZip };
    }
  };

  const analyzeErrorType = (status: number, errorMessage: string) => {
    // Check for specific ATTOM API error patterns
    if (errorMessage.includes('SuccessWithoutResult') || status === 400 && errorMessage.includes('no data found')) {
      return {
        type: 'NO_DATA',
        title: 'Property Not Found in Database',
        severity: 'warning',
        suggestions: [
          'This property address is not in the ATTOM database',
          'Try the documented example: "586 Franklin Ave, Brooklyn, NY 11238"',
          'Verify the address is spelled correctly and exists',
          'Some properties (rural, new construction, or unique addresses) may not be covered',
          'This is normal behavior - not all properties are in commercial databases'
        ]
      };
    } else if (status === 401) {
      return {
        type: 'AUTH',
        title: 'Authentication Failed',
        severity: 'error',
        suggestions: [
          'API key authentication failed - check ATTOM_API_KEY environment variable',
          'Ensure your API key is active and not expired',
          'Verify your ATTOM Data account has sufficient credits',
          'API key must be sent as a query parameter "apikey" (not header)',
          'Use the API Key Validator tool to test authentication'
        ]
      };
    } else if (status === 404) {
      return {
        type: 'ENDPOINT_ERROR',
        title: 'API Endpoint Not Found',
        severity: 'error',
        suggestions: [
          'The API endpoint path may be incorrect',
          'Verify the endpoint exists in the ATTOM API documentation',
          'Check that your subscription includes access to this endpoint',
          'Some endpoints may require different parameter formats',
          'Try a different search strategy or endpoint'
        ]
      };
    } else if (status === 403) {
      return {
        type: 'PERMISSION',
        title: 'Access Forbidden',
        severity: 'error',
        suggestions: [
          'Your API key lacks permissions for this specific endpoint',
          'Check your ATTOM Data subscription plan and included data types',
          'Some endpoints require premium or enterprise subscriptions',
          'Contact ATTOM Data support to upgrade your access level'
        ]
      };
    } else if (status === 400 && !errorMessage.includes('SuccessWithoutResult')) {
      return {
        type: 'BAD_REQUEST',
        title: 'Invalid Request Parameters',
        severity: 'error',
        suggestions: [
          'Check that address1 and address2 parameters are correctly formatted',
          'Address1 should contain street address only (e.g., "586 Franklin Ave")',
          'Address2 should contain "city state zip" (e.g., "brooklyn NY 11238")',
          'Remove special characters or extra spacing from addresses',
          'Try the URL-encoded format with "+" for spaces'
        ]
      };
    } else if (status === 429) {
      return {
        type: 'RATE_LIMIT',
        title: 'Rate Limit Exceeded',
        severity: 'warning',
        suggestions: [
          'You have exceeded the API rate limit for your subscription',
          'Wait a few minutes before making more requests',
          'Consider upgrading your ATTOM Data plan for higher limits',
          'Implement request throttling in production applications'
        ]
      };
    } else if (status === 500 || status >= 500) {
      return {
        type: 'SERVER_ERROR',
        title: 'ATTOM API Server Error',
        severity: 'error',
        suggestions: [
          'The ATTOM API is experiencing server issues',
          'Try again in a few minutes',
          'Check ATTOM Data status page for service interruptions',
          'Contact ATTOM support if the issue persists'
        ]
      };
    } else {
      return {
        type: 'UNKNOWN',
        title: 'Unknown API Error',
        severity: 'error',
        suggestions: [
          'An unexpected error occurred with the ATTOM API',
          'Check the detailed error message and status code below',
          'Try the documented example address format',
          'Verify all required parameters are included',
          'Contact support if the issue persists'
        ]
      };
    }
  };

  const testSearchStrategy = async (strategy: any, addressVariation: AddressVariation): Promise<SearchResult> => {
    const startTime = Date.now();
    const addressParams = formatAddressForAttom(testAddress, addressVariation.format);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-comprehensive/search-by-address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: testAddress,
          strategy: strategy.id,
          addressParams,
          addressFormat: addressVariation.format,
          debug: true
        })
      });

      const duration = Date.now() - startTime;
      const result = await response.json();

      let recommendations: string[] = [];

      if (!response.ok || !result.success) {
        const errorAnalysis = analyzeErrorType(result.status || response.status, result.error || 'Unknown error');
        recommendations = errorAnalysis.suggestions;

        return {
          strategy: `${strategy.name} (${addressVariation.label})`,
          endpoint: strategy.endpoint,
          success: false,
          status: result.status || response.status,
          message: `${errorAnalysis.title}: ${result.error || 'Unknown error'}`,
          error: result.error,
          url: result.url,
          duration,
          addressUsed: testAddress,
          parameters: addressParams,
          recommendations
        };
      }

      return {
        strategy: `${strategy.name} (${addressVariation.label})`,
        endpoint: strategy.endpoint,
        success: true,
        status: 200,
        message: 'Search successful - property data found',
        data: result.data,
        duration,
        addressUsed: testAddress,
        parameters: addressParams,
        recommendations: [
          'Property found successfully',
          'This address format works with this endpoint',
          'Consider using this parameter format for consistent results'
        ]
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        strategy: `${strategy.name} (${addressVariation.label})`,
        endpoint: strategy.endpoint,
        success: false,
        status: 0,
        message: `Network error: ${error.message}`,
        error: error.message,
        duration,
        addressUsed: testAddress,
        parameters: addressParams,
        recommendations: [
          'Check your internet connection',
          'Verify the server is running',
          'Try again in a few moments'
        ]
      };
    }
  };

  const runComprehensiveSearch = async () => {
    if (!testAddress.trim()) {
      toast.error('Please enter an address to test');
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setLastSearchAddress(testAddress);

    const results: SearchResult[] = [];

    // Test the documented example format first with sale-detail endpoint
    const saleDetailStrategy = searchStrategies.find(s => s.id === 'sale-detail');
    const attomStandardFormat = addressVariations.find(v => v.format === 'attom-standard');
    
    if (saleDetailStrategy && attomStandardFormat) {
      const result = await testSearchStrategy(saleDetailStrategy, attomStandardFormat);
      results.push(result);
      setSearchResults([...results]);
    }

    // Test high-priority strategies with ATTOM standard format
    const highPriorityStrategies = searchStrategies.filter(s => s.priority === 'high' && s.id !== 'sale-detail');
    for (const strategy of highPriorityStrategies) {
      if (attomStandardFormat) {
        const result = await testSearchStrategy(strategy, attomStandardFormat);
        results.push(result);
        setSearchResults([...results]);
      }
    }

    // If no successful results, test different address formats with the most promising strategy
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) {
      const basicStrategy = searchStrategies.find(s => s.id === 'property-basic');
      if (basicStrategy) {
        for (let i = 1; i < Math.min(addressVariations.length, 4); i++) {
          const result = await testSearchStrategy(basicStrategy, addressVariations[i]);
          results.push(result);
          setSearchResults([...results]);
        }
      }
    }

    setIsSearching(false);
    
    const finalSuccessCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (finalSuccessCount > 0) {
      toast.success(`Search completed: ${finalSuccessCount}/${totalCount} strategies successful`);
    } else {
      toast.error(`Search completed: No successful results found. Try the documented example address.`);
    }
  };

  const useRecommendedAddress = (address: string) => {
    setTestAddress(address);
    toast.success('Address updated - click "Run Comprehensive Search" to test');
  };

  const getStatusIcon = (result: SearchResult) => {
    if (result.success) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (result.status === 400 || result.status === 404) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (result: SearchResult) => {
    if (result.success) return 'text-green-600';
    if (result.status === 400 || result.status === 404) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorSeverityColor = (status: number) => {
    if (status === 400) return 'border-yellow-200 bg-yellow-50';
    if (status === 401 || status === 403) return 'border-red-200 bg-red-50';
    if (status === 404) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-gray-50';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatParametersForDisplay = (params: any) => {
    if (!params) return 'No parameters';
    
    const paramPairs = Object.entries(params)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    return paramPairs || 'No parameters';
  };

  const successCount = searchResults.filter(r => r.success).length;
  const errorCount = searchResults.filter(r => !r.success).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">ATTOM API Search Diagnostic</h1>
            <p className="text-sm text-muted-foreground">
              Diagnose and troubleshoot ATTOM API search failures with correct parameter formatting
            </p>
          </div>
        </div>

        {/* ATTOM Format Example */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-500" />
              ATTOM API Parameter Format
            </CardTitle>
            <CardDescription>
              Official ATTOM Data API request format with required parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Complete ATTOM API URL format:</p>
                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                  https://api.gateway.attomdata.com/propertyapi/v1.0.0/sale/detail?address1=586+FRANKLIN+AVE&address2=brooklyn+NY+11238&apikey=YOUR_KEY&accept=application/json&debug=True
                </code>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Required Parameters:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">address1:</span> Street address only
                      <br />
                      <span className="text-muted-foreground">Example: "586 FRANKLIN AVE"</span>
                    </div>
                    <div>
                      <span className="font-medium">address2:</span> City, State, ZIP
                      <br />
                      <span className="text-muted-foreground">Example: "brooklyn NY 11238"</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">System Parameters:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">apikey:</span> Your ATTOM API key
                      <br />
                      <span className="text-muted-foreground">Sent as query parameter</span>
                    </div>
                    <div>
                      <span className="font-medium">accept:</span> application/json
                      <br />
                      <span className="text-muted-foreground">Response format</span>
                    </div>
                    <div>
                      <span className="font-medium">debug:</span> True
                      <br />
                      <span className="text-muted-foreground">Include all fields (even null)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> ATTOM API requires the API key as a query parameter, not a header. 
                  The "accept" parameter is also required for proper JSON responses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Analysis Card */}
        {searchResults.length > 0 && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Quick Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {successCount > 0 ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Success!</strong> {successCount} search {successCount === 1 ? 'strategy' : 'strategies'} found data using the correct ATTOM parameter format.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Address Issue:</strong> Try the documented example "586 Franklin Ave, Brooklyn, NY 11238" which uses the correct ATTOM parameter format.
                    </AlertDescription>
                  </Alert>
                )}
                
                {errorCount > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Issues Found:</strong>
                    <ul className="mt-1 space-y-1">
                      {searchResults.filter(r => !r.success && r.status === 400).length > 0 && (
                        <li>• "SuccessWithoutResult" - Property not in database (try documented example)</li>
                      )}
                      {searchResults.filter(r => !r.success && r.status === 404).length > 0 && (
                        <li>• "No rule matched" - Wrong parameter format (use address1 & address2)</li>
                      )}
                      {searchResults.filter(r => !r.success && r.status === 401).length > 0 && (
                        <li>• Authentication failed - Check API key configuration</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Search Configuration
            </CardTitle>
            <CardDescription>
              Test addresses using the correct ATTOM API parameter format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-address">Test Address</Label>
              <Input
                id="test-address"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                placeholder="586 Franklin Ave, Brooklyn, NY 11238"
                disabled={isSearching}
              />
              <p className="text-xs text-muted-foreground">
                Format: "Street Address, City, State ZIP" - will be converted to address1 & address2 parameters
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={runComprehensiveSearch}
                disabled={isSearching || !testAddress.trim()}
                className="flex-1 sm:flex-none"
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {isSearching ? 'Testing ATTOM Formats...' : 'Test ATTOM API Formats'}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.href = '?api-key-validator=true'}
                className="flex-1 sm:flex-none"
              >
                <Key className="w-4 h-4 mr-2" />
                API Key Validator
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.href = '?attom-admin=true'}
                className="flex-1 sm:flex-none"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Test Addresses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Recommended Test Addresses
            </CardTitle>
            <CardDescription>
              Addresses that work with ATTOM API, including the documented example
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RECOMMENDED_TEST_ADDRESSES.map((addr, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {addr.type}
                        </Badge>
                        {addr.type === 'Documentation Example' && (
                          <Badge variant="default" className="text-xs bg-blue-500">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm mb-1">{addr.address}</p>
                      <p className="text-xs text-muted-foreground">{addr.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => useRecommendedAddress(addr.address)}
                      className="shrink-0"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Progress */}
        {(isSearching || searchResults.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Search Results
                {lastSearchAddress && (
                  <Badge variant="outline" className="ml-2">
                    {lastSearchAddress}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Testing multiple ATTOM API endpoints with different parameter formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{successCount} Successful</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{errorCount} Failed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{searchResults.length} Total Tests</span>
                </div>
              </div>

              {isSearching && (
                <Alert className="mb-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <AlertDescription>
                    Testing ATTOM API parameter formats... This may take a few moments.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getErrorSeverityColor(result.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result)}
                        <span className="font-medium">{result.strategy}</span>
                        <Badge variant="outline">{result.duration}ms</Badge>
                      </div>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className={`text-sm ${getStatusColor(result)} mb-2`}>
                      {result.message}
                    </p>
                    {result.parameters && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-muted-foreground">Parameters used:</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {formatParametersForDisplay(result.parameters)}
                        </code>
                      </div>
                    )}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Recommendations:</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address Format Testing Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              ATTOM Parameter Format Testing
            </CardTitle>
            <CardDescription>
              Different parameter formats that will be tested with ATTOM API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {addressVariations.map((variation, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{variation.label}</h4>
                    {variation.format === 'attom-standard' && (
                      <Badge variant="default" className="text-xs bg-green-500">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {variation.description}
                  </p>
                  <div className="bg-muted/50 rounded p-2">
                    <code className="text-xs">
                      {variation.example}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '?attom-admin=true'}
                className="justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '?api-key-validator=true'}
                className="justify-start"
              >
                <Key className="w-4 h-4 mr-2" />
                API Key Validator
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