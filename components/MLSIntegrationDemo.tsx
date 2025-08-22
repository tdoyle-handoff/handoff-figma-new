import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AddressForm } from './AddressForm';
import { PropertySetupWithMLS } from './PropertySetupWithMLS';
import { MLSPropertyCard } from './MLSPropertyCard';
import { MLSPropertyDetails } from './MLSPropertyDetails';
import { useMLSData } from '../hooks/useMLSData';
import { useIsMobile } from './ui/use-mobile';
import { MLSProperty } from '../types/mls';
import { 
  Database, 
  Search, 
  Home, 
  MapPin, 
  DollarSign, 
  Eye, 
  Settings, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Zap
} from 'lucide-react';

export function MLSIntegrationDemo() {
  const isMobile = useIsMobile();
  const [selectedDemo, setSelectedDemo] = useState('overview');
  const [demoProperty, setDemoProperty] = useState<MLSProperty | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showPropertySetup, setShowPropertySetup] = useState(false);

  const {
    property,
    isLoading,
    error,
    searchByAddress,
    searchByMLSNumber,
    clearData
  } = useMLSData({
    onPropertyFound: (prop) => {
      setDemoProperty(prop);
      console.log('Demo: Property found', prop);
    }
  });

  const handleTestSearch = async () => {
    // Test with a common address format
    await searchByAddress("123 Oak Street, Riverside Heights, CA 90210");
  };

  const handleTestMLSSearch = async () => {
    // Test with a sample MLS number
    await searchByMLSNumber("ML12345678");
  };

  const resetDemo = () => {
    clearData();
    setDemoProperty(null);
    setShowPropertyDetails(false);
    setShowPropertySetup(false);
  };

  // Show full property details view
  if (showPropertyDetails && demoProperty) {
    return (
      <div className="w-full">
        <MLSPropertyDetails
          property={demoProperty}
          onBack={() => setShowPropertyDetails(false)}
          onSelect={(prop) => {
            console.log('Selected property:', prop);
            setShowPropertyDetails(false);
          }}
          className="max-w-6xl mx-auto"
        />
      </div>
    );
  }

  // Show property setup flow
  if (showPropertySetup) {
    return (
      <div className="w-full">
        <PropertySetupWithMLS
          onComplete={(data) => {
            console.log('Property setup complete:', data);
            setShowPropertySetup(false);
          }}
          onBack={() => setShowPropertySetup(false)}
          className="max-w-4xl mx-auto"
        />
      </div>
    );
  }

  return (
    <div className={`w-full ${isMobile ? 'page-content-mobile' : 'page-content'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            MLS Integration Demo
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore how address validation automatically pulls property details from MLS databases
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Database className="w-3 h-3" />
              MLS Database
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Search className="w-3 h-3" />
              Real-time lookup
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Home className="w-3 h-3" />
              Property details
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Market data
            </Badge>
          </div>
        </div>

        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              MLS API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Environment Variables Required:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <code className="bg-gray-100 px-1 rounded">MLS_API_KEY</code> - Your MLS provider API key</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">MLS_API_BASE_URL</code> - MLS provider base URL</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Supported MLS Providers:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Spark API (FBS/MLS Grid)</li>
                    <li>• RETS (Real Estate Transaction Standard)</li>
                    <li>• CoreLogic Matrix</li>
                    <li>• Custom integrations</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Demo Mode</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      This demo shows the integration flow. In production, real MLS data would be fetched 
                      based on your MLS provider configuration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Tabs */}
        <Tabs value={selectedDemo} onValueChange={setSelectedDemo}>
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="address">Address + MLS</TabsTrigger>
            <TabsTrigger value="search">Search Demo</TabsTrigger>
            <TabsTrigger value="integration">Full Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">1. Address Entry</h3>
                    <p className="text-sm text-muted-foreground">
                      User enters property address with Google Places autocomplete
                    </p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">2. MLS Lookup</h3>
                    <p className="text-sm text-muted-foreground">
                      System automatically searches MLS database for property details
                    </p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">3. Auto-populate</h3>
                    <p className="text-sm text-muted-foreground">
                      Property details, photos, and market data are automatically populated
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Data Retrieved from MLS:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Property details (beds, baths, sqft, lot size)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Listing information (price, status, MLS#)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        High-resolution property photos
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Agent and office contact information
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Market history and comparable sales
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Property features and amenities
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Integration Benefits:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Eliminates manual data entry
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Ensures data accuracy
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Provides real-time market data
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Speeds up property setup
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Enhances user experience
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Supports transaction management
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Address Input with MLS Lookup</CardTitle>
              </CardHeader>
              <CardContent>
                <AddressForm
                  title="Property Address"
                  description="Enter an address to see automatic MLS lookup in action"
                  enableMLSLookup={true}
                  onMLSPropertyFound={(property) => {
                    setDemoProperty(property);
                    console.log('MLS property found in demo:', property);
                  }}
                  showMLSResults={true}
                />
              </CardContent>
            </Card>

            {demoProperty && (
              <Card>
                <CardHeader>
                  <CardTitle>Retrieved MLS Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <MLSPropertyCard
                    property={demoProperty}
                    onSelect={() => setShowPropertyDetails(true)}
                    showPhotos={true}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MLS Search Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleTestSearch}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    {isLoading ? 'Searching...' : 'Test Address Search'}
                  </Button>
                  
                  <Button
                    onClick={handleTestMLSSearch}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    {isLoading ? 'Searching...' : 'Test MLS Number Search'}
                  </Button>
                </div>

                <Separator />

                {/* Loading State */}
                {isLoading && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Searching MLS Database</h4>
                        <p className="text-xs text-blue-700">Querying property information...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-red-900">MLS Search Error</h4>
                        <p className="text-xs text-red-700 mt-1">{error.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {property && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-green-900">Property Found</h4>
                          <p className="text-xs text-green-700 mt-1">
                            Successfully retrieved property data from MLS database
                          </p>
                        </div>
                      </div>
                    </div>

                    <MLSPropertyCard
                      property={property}
                      onSelect={() => setShowPropertyDetails(true)}
                      showPhotos={true}
                    />
                  </div>
                )}

                <Button
                  onClick={resetDemo}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  Reset Demo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Property Setup Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Experience the complete property setup flow with integrated MLS lookup, 
                  from address entry to transaction management setup.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setShowPropertySetup(true)}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Home className="w-5 h-5" />
                    Start Property Setup
                  </Button>
                  
                  {demoProperty && (
                    <Button
                      onClick={() => setShowPropertyDetails(true)}
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      View Property Details
                    </Button>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium mb-2">What You'll Experience:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Address entry with Google Places autocomplete</li>
                    <li>• Automatic MLS database lookup</li>
                    <li>• Property details pre-population</li>
                    <li>• Transaction details entry</li>
                    <li>• Complete property setup workflow</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}