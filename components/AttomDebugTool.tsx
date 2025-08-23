import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search, 
  Database, 
  Globe, 
  Settings, 
  Eye,
  Copy,
  Trash2,
  Home,
  MapPin,
  FileText,
  Info,
  Wifi,
  WifiOff,
  Server,
  Lightbulb,
  ExternalLink,
  Calculator,
  TrendingUp,
  Building,
  Bug,
  Zap,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  BarChart3
} from 'lucide-react';

// Import project configuration with error handling
let projectId = 'unknown';
let publicAnonKey = 'unknown';

try {
  const supabaseInfo = require('../utils/supabase/info');
  projectId = supabaseInfo.projectId || 'unknown';
  publicAnonKey = supabaseInfo.publicAnonKey || 'unknown';
} catch (error) {
  console.error('Failed to load Supabase configuration:', error);
}

// Type for actual API response structure
interface AttomApiResponse {
  status: {
    version: string;
    code: number;
    msg: string;
    total: number;
    page: number;
    pagesize: number;
    responseDateTime: string;
    transactionID: string;
  };
  property: Array<{
    identifier: {
      Id: number;
      fips: string;
      apn: string;
      attomId: number;
    };
    lot: {
      lotSize1?: number;
    };
    address: {
      country: string;
      countrySubd: string;
      line1: string;
      line2: string;
      locality: string;
      matchCode: string;
      oneLine: string;
      postal1: string;
      postal2?: string;
      postal3?: string;
    };
    location: {
      accuracy: string;
      latitude: string;
      longitude: string;
      distance: number;
      geoid: string;
      geoIdV4?: any;
    };
    summary: {
      propclass: string;
      propsubtype: string;
      proptype: string;
      propertyType: string;
      yearbuilt?: number;
      propLandUse: string;
      propIndicator: string;
    };
    building: {
      size: {
        universalsize?: number;
      };
      rooms: {
        bathstotal?: number;
        beds?: number;
      };
    };
    sale: {
      salesearchdate: string;
      saleTransDate: string;
      amount: {
        saleamt: number;
        salecode?: string;
        salerecdate: string;
        saledisclosuretype: number;
        saledoctype?: string;
        saledocnum: string;
        saletranstype: string;
      };
      calculation: {
        pricepersizeunit?: number;
        priceperbed?: number;
      };
      vintage: {
        lastModified: string;
      };
    };
    vintage: {
      lastModified: string;
      pubDate: string;
    };
    [key: string]: any; // Allow for additional fields
  }>;
}

// Collapsible JSON tree component
interface JsonTreeProps {
  data: any;
  level?: number;
  maxLevel?: number;
}

function JsonTree({ data, level = 0, maxLevel = 3 }: JsonTreeProps) {
  const [collapsed, setCollapsed] = useState(level >= maxLevel);

  if (data === null) return <span className="text-gray-400">null</span>;
  if (data === undefined) return <span className="text-gray-400">undefined</span>;
  if (typeof data === 'string') return <span className="text-green-600">"{data}"</span>;
  if (typeof data === 'number') return <span className="text-blue-600">{data}</span>;
  if (typeof data === 'boolean') return <span className="text-purple-600">{data.toString()}</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-gray-400">[]</span>;
    
    return (
      <div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span className="ml-1">Array ({data.length} items)</span>
        </button>
        {!collapsed && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {data.map((item, index) => (
              <div key={index} className="py-1">
                <span className="text-gray-500 text-sm">[{index}]: </span>
                <JsonTree data={item} level={level + 1} maxLevel={maxLevel} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span className="text-gray-400">{'{}'}</span>;

    return (
      <div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span className="ml-1">Object ({keys.length} keys)</span>
        </button>
        {!collapsed && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {keys.map((key) => (
              <div key={key} className="py-1">
                <span className="text-blue-800 font-medium text-sm">{key}: </span>
                <JsonTree data={data[key]} level={level + 1} maxLevel={maxLevel} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span>{String(data)}</span>;
}

// Property field analyzer component
interface PropertyFieldAnalyzerProps {
  property: any;
}

function PropertyFieldAnalyzer({ property }: PropertyFieldAnalyzerProps) {
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  useEffect(() => {
    if (!property) return;

    // Analyze the property data structure
    const analysis = {
      totalFields: 0,
      populatedFields: 0,
      nullFields: 0,
      undefinedFields: 0,
      emptyFields: 0,
      fieldsBySection: {},
      missingImportantFields: [],
      dataCompleteness: 0
    };

    const importantFields = [
      'identifier.attomId',
      'address.oneLine',
      'building.size.universalsize',
      'building.rooms.bathstotal',
      'building.rooms.beds',
      'summary.yearbuilt',
      'sale.amount.saleamt',
      'sale.calculation.pricepersizeunit',
      'lot.lotSize1'
    ];

    function analyzeObject(obj: any, path = '', section = 'root') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const currentSection = path.split('.')[0] || section;
        
        analysis.totalFields++;
        
        if (!analysis.fieldsBySection[currentSection]) {
          analysis.fieldsBySection[currentSection] = { total: 0, populated: 0 };
        }
        analysis.fieldsBySection[currentSection].total++;

        if (value === null) {
          analysis.nullFields++;
        } else if (value === undefined) {
          analysis.undefinedFields++;
        } else if (value === '' || (Array.isArray(value) && value.length === 0)) {
          analysis.emptyFields++;
        } else {
          analysis.populatedFields++;
          analysis.fieldsBySection[currentSection].populated++;
          
          if (typeof value === 'object' && !Array.isArray(value)) {
            analyzeObject(value, currentPath, currentSection);
          }
        }
      }
    }

    analyzeObject(property);

    // Check for missing important fields
    importantFields.forEach(fieldPath => {
      const pathParts = fieldPath.split('.');
      let current = property;
      let exists = true;
      
      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          exists = false;
          break;
        }
      }
      
      if (!exists || current === null || current === undefined) {
        analysis.missingImportantFields.push(fieldPath);
      }
    });

    analysis.dataCompleteness = Math.round((analysis.populatedFields / analysis.totalFields) * 100);
    setAnalysisResults(analysis);
  }, [property]);

  if (!analysisResults) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Property Data Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Data Completeness */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Data Completeness</h4>
              <span className="text-xl font-bold text-blue-900">{analysisResults.dataCompleteness}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analysisResults.dataCompleteness}%` }}
              />
            </div>
          </div>

          {/* Field Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded border border-green-200">
              <div className="text-2xl font-bold text-green-800">{analysisResults.populatedFields}</div>
              <div className="text-green-600">Populated</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">{analysisResults.nullFields}</div>
              <div className="text-gray-600">Null</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">{analysisResults.emptyFields}</div>
              <div className="text-yellow-600">Empty</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">{analysisResults.totalFields}</div>
              <div className="text-blue-600">Total Fields</div>
            </div>
          </div>

          {/* Missing Important Fields */}
          {analysisResults.missingImportantFields.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Missing Important Fields</h4>
              <div className="space-y-1">
                {analysisResults.missingImportantFields.map((field, index) => (
                  <div key={index} className="text-sm text-red-700 font-mono">
                    {field}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Breakdown */}
          <div>
            <h4 className="font-medium mb-2">Field Population by Section</h4>
            <div className="space-y-2">
              {Object.entries(analysisResults.fieldsBySection).map(([section, stats]: [string, any]) => (
                <div key={section} className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{section}</span>
                  <div className="flex items-center gap-2">
                    <span>{stats.populated}/{stats.total}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stats.populated / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((stats.populated / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AttomDebugTool() {
  const [testAddress, setTestAddress] = useState('');
  const [testResults, setTestResults] = useState<AttomApiResponse | null>(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState('search-by-address');
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Safe localStorage loading with error handling
  useEffect(() => {
    try {
      const loadLocalStorageData = () => {
        try {
          const data = {
            'handoff-screening-data': localStorage.getItem('handoff-screening-data'),
            'handoff-property-data': localStorage.getItem('handoff-property-data'),
            'handoff-initial-setup-data': localStorage.getItem('handoff-initial-setup-data'),
            'handoff-attom-property': localStorage.getItem('handoff-attom-property'),
            'handoff-initial-setup-complete': localStorage.getItem('handoff-initial-setup-complete'),
            'handoff-questionnaire-complete': localStorage.getItem('handoff-questionnaire-complete'),
            'handoff-current-page': localStorage.getItem('handoff-current-page')
          };
          
          // Parse JSON data safely
          const parsedData = {};
          Object.entries(data).forEach(([key, value]) => {
            if (value) {
              try {
                parsedData[key] = JSON.parse(value);
              } catch {
                parsedData[key] = value;
              }
            } else {
              parsedData[key] = null;
            }
          });
          
          setLocalStorageData(parsedData);
        } catch (err) {
          console.error('Error loading localStorage data:', err);
          setError('Failed to load localStorage data');
        }
      };

      loadLocalStorageData();
      
      // Refresh every 5 seconds instead of 2 to reduce load
      const interval = setInterval(loadLocalStorageData, 5000);
      return () => clearInterval(interval);
    } catch (err) {
      console.error('Error setting up localStorage monitoring:', err);
      setError('Failed to setup localStorage monitoring');
    }
  }, []);

  // Safe server status check with error handling
  useEffect(() => {
    const testServerStatus = async () => {
      try {
        if (!navigator.onLine) {
          setServerStatus({ 
            success: false, 
            error: 'No network connection detected',
            timestamp: new Date().toISOString()
          });
          return;
        }

        if (projectId === 'unknown' || publicAnonKey === 'unknown') {
          setServerStatus({ 
            success: false, 
            error: 'Supabase configuration not available',
            timestamp: new Date().toISOString()
          });
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced timeout

        const startTime = Date.now();
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          setServerStatus({ 
            success: true, 
            status: response.status, 
            data,
            responseTime,
            timestamp: new Date().toISOString()
          });
        } else {
          const errorText = await response.text().catch(() => 'Unable to read response');
          setServerStatus({ 
            success: false, 
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            responseTime,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        setServerStatus({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };

    testServerStatus();
    // Test less frequently to reduce load
    const interval = setInterval(testServerStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const addToLogs = (type: 'info' | 'success' | 'error' | 'warning', message: string, data?: any) => {
    try {
      const logEntry = {
        id: Date.now(),
        type,
        message,
        data,
        timestamp: new Date().toISOString()
      };
      setApiLogs(prev => [logEntry, ...prev].slice(0, 20)); // Reduced log size
    } catch (err) {
      console.error('Error adding to logs:', err);
    }
  };

  const testDirectAPI = async () => {
    if (!testAddress.trim()) {
      addToLogs('error', 'Please enter an address to test');
      return;
    }

    if (!serverStatus?.success) {
      addToLogs('error', 'Cannot test API - server is not reachable');
      return;
    }

    setIsTestingAPI(true);
    setTestResults(null);
    setSelectedProperty(null);
    
    addToLogs('info', `Testing ${selectedEndpoint} with address: ${testAddress}`);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/${selectedEndpoint}`;
      
      let requestUrl = url;
      if (selectedEndpoint === 'search-by-address') {
        requestUrl = `${url}?address=${encodeURIComponent(testAddress)}&debug=true`;
      } else if (selectedEndpoint === 'valuation') {
        requestUrl = `${url}?address=${encodeURIComponent(testAddress)}&debug=true`;
      } else if (selectedEndpoint === 'comparables') {
        requestUrl = `${url}?address=${encodeURIComponent(testAddress)}&radius=0.5&debug=true`;
      }

      const startTime = Date.now();
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: AbortSignal.timeout(30000)
      });
      
      const duration = Date.now() - startTime;
      const responseData = await response.json();
      
      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        data: responseData,
        timestamp: new Date().toISOString()
      };

      setTestResults(responseData);
      
      // Auto-select first property if available
      if (responseData?.property && Array.isArray(responseData.property) && responseData.property.length > 0) {
        setSelectedProperty(responseData.property[0]);
      }
      
      if (response.ok) {
        addToLogs('success', `API test successful (${duration}ms) - Found ${responseData?.property?.length || 0} properties`, result);
      } else {
        addToLogs('error', `API test failed: ${response.status} ${response.statusText}`, result);
      }
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      setTestResults(null);
      addToLogs('error', 'API test network error', errorResult);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem('handoff-attom-property');
      addToLogs('info', 'Cleared Attom cache');
      setLocalStorageData(prev => ({ ...prev, 'handoff-attom-property': null }));
    } catch (err) {
      addToLogs('error', 'Failed to clear cache');
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL localStorage data? This cannot be undone.')) {
      try {
        localStorage.clear();
        addToLogs('warning', 'Cleared all localStorage data');
        setLocalStorageData({});
      } catch (err) {
        addToLogs('error', 'Failed to clear all data');
      }
    }
  };

  const copyToClipboard = async (data: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      addToLogs('info', 'Data copied to clipboard');
    } catch (err) {
      addToLogs('error', 'Failed to copy to clipboard');
    }
  };

  const extractAddressFromData = () => {
    try {
      const screeningData = localStorageData['handoff-screening-data'];
      const propertyData = localStorageData['handoff-property-data'];
      
      let suggestedAddress = '';
      
      if (screeningData?.propertyAddress) {
        suggestedAddress = screeningData.propertyAddress;
      } else if (propertyData?.address && propertyData?.city) {
        suggestedAddress = `${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`.trim();
      }
      
      if (suggestedAddress) {
        setTestAddress(suggestedAddress);
        addToLogs('info', 'Auto-filled address from localStorage data', { address: suggestedAddress });
      } else {
        addToLogs('warning', 'No address found in localStorage data');
      }
    } catch (err) {
      addToLogs('error', 'Failed to extract address from data');
    }
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        <CheckCircle className="w-3 h-3 mr-1" />
        Connected
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Error
      </Badge>
    );
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (err) {
      return 'Unable to format data';
    }
  };

  const goBackToApp = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('attom-debug');
      window.location.href = url.toString();
    } catch (err) {
      window.location.href = '/';
    }
  };

  const openAddressFormatGuide = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('attom-debug');
      url.searchParams.set('address-format-guide', 'true');
      window.open(url.toString(), '_blank');
    } catch (err) {
      addToLogs('error', 'Failed to open address format guide');
    }
  };

  // Show error state if there's a critical error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Debug Tool Error:</strong> {error}
            <div className="mt-2">
              <Button onClick={() => window.location.reload()} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Attom API Debug Tool</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive debugging tool for Attom Data API integration with full field analysis
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            <strong>Project ID:</strong> {projectId} | <strong>Server:</strong> https://{projectId}.supabase.co
            <br />
            <span className="text-blue-600 font-medium">🚀 Debug Mode Active: All API requests include debug=True parameter for complete field visibility</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddressFormatGuide} variant="outline">
            <Lightbulb className="w-4 h-4 mr-2" />
            Address Guide
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={goBackToApp} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {!navigator.onLine && (
        <Alert className="border-red-200 bg-red-50">
          <WifiOff className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>No Network Connection:</strong> Your device appears to be offline.
          </AlertDescription>
        </Alert>
      )}

      {serverStatus?.success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Server Connected:</strong> Successfully connected to the Handoff server.
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Mode Enhancement Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>🚀 Enhanced Debug Mode Active:</strong> The Attom API integration automatically includes the <code className="bg-blue-100 px-1 rounded">debug=True</code> parameter 
          in all requests, ensuring all property fields are returned including null values.
          
          <div className="mt-3 text-sm">
            <strong>Benefits:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Complete field visibility (including null values)</li>
              <li>Better data completeness analysis</li>
              <li>Enhanced troubleshooting capabilities</li>
              <li>More accurate missing field identification</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="api-test" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="api-test">API Test</TabsTrigger>
          <TabsTrigger value="property-analysis">Property Analysis</TabsTrigger>
          <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
          <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* API Test Tab */}
        <TabsContent value="api-test" className="space-y-6 bg-white">
          <Card>
            <CardHeader>
              <CardTitle>API Testing with Complete Field Analysis</CardTitle>
              {!serverStatus?.success && (
                <Alert className="mt-2 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Server connection failed. API testing is disabled until connection is restored.
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-address">Test Address</Label>
                  <Input
                    id="test-address"
                    value={testAddress}
                    onChange={(e) => setTestAddress(e.target.value)}
                    placeholder="Enter a property address..."
                    disabled={!serverStatus?.success}
                  />
                </div>
                <div>
                  <Label htmlFor="endpoint-select">API Endpoint</Label>
                  <select
                    id="endpoint-select"
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="w-full p-2 border border-border rounded-md"
                    disabled={!serverStatus?.success}
                  >
                    <option value="search-by-address">Search by Address</option>
                    <option value="valuation">Get Valuation (AVM)</option>
                    <option value="comparables">Get Comparables</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={testDirectAPI} 
                  disabled={isTestingAPI || !serverStatus?.success}
                >
                  {isTestingAPI ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Test API
                </Button>
                <Button onClick={extractAddressFromData} variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Use Stored Address
                </Button>
              </div>

              {testResults && (
                <div className="mt-6 space-y-4">
                  {/* API Response Status */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">API Response Status</h3>
                    <div className="flex gap-2">
                      <Badge variant={testResults.status?.code === 0 ? "default" : "destructive"}>
                        {testResults.status?.msg || 'Unknown'}
                      </Badge>
                      {testResults.status?.total && (
                        <Badge variant="outline">
                          {testResults.status.total} properties found
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Properties List */}
                  {testResults.property && testResults.property.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Found Properties ({testResults.property.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {testResults.property.map((property, index) => (
                            <div
                              key={property.identifier?.Id || index}
                              className={`p-3 border rounded cursor-pointer transition-colors ${
                                selectedProperty?.identifier?.Id === property.identifier?.Id
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:border-primary/50'
                              }`}
                              onClick={() => setSelectedProperty(property)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{property.address?.oneLine || 'No address'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {property.summary?.propertyType || 'Unknown type'} • 
                                    Built: {property.summary?.yearbuilt || 'Unknown'} • 
                                    {property.building?.size?.universalsize ? `${property.building.size.universalsize.toLocaleString()} sq ft` : 'Size unknown'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    {property.sale?.amount?.saleamt ? `$${property.sale.amount.saleamt.toLocaleString()}` : 'No sale data'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Attom ID: {property.identifier?.attomId || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Analysis Tab */}
        <TabsContent value="property-analysis" className="space-y-6 bg-white">
          {selectedProperty ? (
            <PropertyFieldAnalyzer property={selectedProperty} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Property Selected</h3>
                <p className="text-muted-foreground">
                  Run an API test and select a property to see detailed field analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Raw Data Tab */}
        <TabsContent value="raw-data" className="space-y-6 bg-white">
          {selectedProperty ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selected Property Raw Data</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => copyToClipboard(selectedProperty)} size="sm" variant="outline">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy JSON
                    </Button>
                    <Button onClick={() => copyToClipboard(testResults)} size="sm" variant="outline">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Full Response
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Property Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Property Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-blue-700">Address:</span> {selectedProperty.address?.oneLine}</div>
                      <div><span className="text-blue-700">Attom ID:</span> {selectedProperty.identifier?.attomId}</div>
                      <div><span className="text-blue-700">Type:</span> {selectedProperty.summary?.propertyType}</div>
                      <div><span className="text-blue-700">Year Built:</span> {selectedProperty.summary?.yearbuilt}</div>
                      <div><span className="text-blue-700">Size:</span> {selectedProperty.building?.size?.universalsize ? `${selectedProperty.building.size.universalsize.toLocaleString()} sq ft` : 'N/A'}</div>
                      <div><span className="text-blue-700">Sale Price:</span> {selectedProperty.sale?.amount?.saleamt ? `$${selectedProperty.sale.amount.saleamt.toLocaleString()}` : 'N/A'}</div>
                    </div>
                  </div>

                  {/* Interactive JSON Tree */}
                  <div>
                    <h4 className="font-medium mb-2">Interactive Data Explorer</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-auto">
                      <JsonTree data={selectedProperty} />
                    </div>
                  </div>

                  {/* Raw JSON */}
                  <div>
                    <h4 className="font-medium mb-2">Raw JSON</h4>
                    <ScrollArea className="h-64 w-full">
                      <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                        {formatJson(selectedProperty)}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : testResults ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Full API Response</CardTitle>
                  <Button onClick={() => copyToClipboard(testResults)} size="sm" variant="outline">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                    {formatJson(testResults)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground">
                  Run an API test to see raw response data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Connectivity Tab */}
        <TabsContent value="connectivity" className="space-y-6 bg-white">
          <Card>
            <CardHeader>
              <CardTitle>Network & Server Connectivity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Network Status</span>
                  <Badge variant={navigator.onLine ? "default" : "destructive"}>
                    {navigator.onLine ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Server Status</span>
                  {getStatusBadge(serverStatus?.success || false)}
                </div>
                {serverStatus?.error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <strong>Connection Error:</strong> {serverStatus.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6 bg-white">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Local Storage Data</CardTitle>
                <Button onClick={clearAllData} variant="destructive" size="sm">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(localStorageData).map(([key, value]) => (
                  <div key={key} className="border border-border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{key}</h4>
                      <Button onClick={() => copyToClipboard(value)} size="sm" variant="outline">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    {value ? (
                      <ScrollArea className="h-32 w-full">
                        <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded">
                          {formatJson(value)}
                        </pre>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No data stored</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6 bg-white">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Debug Logs</CardTitle>
                <Button onClick={() => setApiLogs([])} size="sm" variant="outline">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-2">
                  {apiLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-8">
                      No logs yet. Perform actions to see debug information.
                    </p>
                  ) : (
                    apiLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded border-l-4 ${
                          log.type === 'success' ? 'bg-green-50 border-green-500' :
                          log.type === 'error' ? 'bg-red-50 border-red-500' :
                          log.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {log.data && (
                            <Button
                              onClick={() => copyToClipboard(log.data)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        {log.data && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-muted-foreground">
                              Show details
                            </summary>
                            <pre className="text-xs mt-1 bg-white p-2 rounded border max-h-32 overflow-auto">
                              {formatJson(log.data)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
