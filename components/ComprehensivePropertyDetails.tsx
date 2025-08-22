import React, { useState, useCallback, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useIsMobile } from './ui/use-mobile';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  Building, 
  Ruler,
  Bed,
  Bath,
  Car,
  Zap,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  School,
  Shield,
  Droplets,
  Flame,
  TreePine,
  Users,
  BarChart3,
  Calculator,
  Landmark,
  Phone,
  Globe,
  Wifi,
  Lightbulb,
  Waves,
  Mountain
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Enhanced property data interfaces for multiple API endpoints
interface ComprehensivePropertyData {
  basicProfile?: any;
  expandedDetail?: any;
  schoolData?: any;
  neighborhoodData?: any;
  riskData?: any;
  marketTrends?: any;
  environmental?: any;
  utilities?: any;
  demographics?: any;
  comparable?: any;
  valuation?: any;
}

interface APIEndpoint {
  name: string;
  endpoint: string;
  description: string;
  params: Record<string, any>;
  required: boolean;
}

interface ComprehensivePropertyDetailsProps {
  defaultAttomId?: string;
  defaultAddress?: string;
  onPropertyFound?: (data: ComprehensivePropertyData) => void;
  className?: string;
}

export function ComprehensivePropertyDetails({ 
  defaultAttomId = '184713191', 
  defaultAddress,
  onPropertyFound, 
  className = '' 
}: ComprehensivePropertyDetailsProps) {
  const isMobile = useIsMobile();
  const [searchInput, setSearchInput] = useState(defaultAttomId);
  const [searchType, setSearchType] = useState<'attomid' | 'address'>('attomid');
  const [propertyData, setPropertyData] = useState<ComprehensivePropertyData>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('overview');

  // Define all available Attom API endpoints
  const apiEndpoints: APIEndpoint[] = [
    {
      name: 'Property Basic Profile',
      endpoint: '/property-basic-profile',
      description: 'Basic property info, address, and current owner',
      params: { attomid: searchInput },
      required: true
    },
    {
      name: 'Property Expanded Detail',
      endpoint: '/property-expanded-detail',
      description: 'Comprehensive property characteristics and features',
      params: { attomid: searchInput },
      required: false
    },
    {
      name: 'School District Info',
      endpoint: '/school-district',
      description: 'School district boundaries and school information',
      params: { attomid: searchInput },
      required: false
    },
    {
      name: 'Neighborhood Data',
      endpoint: '/neighborhood-demographics',
      description: 'Neighborhood statistics and demographics',
      params: { attomid: searchInput },
      required: false
    },
    {
      name: 'Risk Assessment',
      endpoint: '/risk-data',
      description: 'Flood, fire, earthquake, and environmental risk data',
      params: { attomid: searchInput },
      required: false
    },
    {
      name: 'Market Trends',
      endpoint: '/market-trends',
      description: 'Local market trends and price history',
      params: { attomid: searchInput },
      required: false
    },
    {
      name: 'Environmental Data',
      endpoint: '/environmental-hazards',
      description: 'Environmental hazards and site conditions',
      params: { attomid: searchInput },
      required: false
    },
    {
      name: 'Utility Information',
      endpoint: '/utility-data',
      description: 'Utility providers and service information',
      params: { attomid: searchInput },
      required: false
    },
    {
      name: 'Property Valuation',
      endpoint: '/property-valuation',
      description: 'AVM estimates and valuation data',
      params: { attomid: searchInput },
      required: false
    },
    {
      name: 'Comparable Sales',
      endpoint: '/comparable-sales',
      description: 'Recent comparable sales in the area',
      params: { attomid: searchInput, radius: '0.5' },
      required: false
    }
  ];

  // Format currency values
  const formatCurrency = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  // Format square footage
  const formatSquareFeet = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value) + ' sq ft';
  }, []);

  // Format percentage
  const formatPercentage = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(1)}%`;
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  // Call individual API endpoint
  const callAPIEndpoint = useCallback(async (endpoint: APIEndpoint) => {
    const endpointKey = endpoint.name.replace(/\s+/g, '_').toLowerCase();
    
    setLoadingStates(prev => ({ ...prev, [endpointKey]: true }));
    setErrors(prev => ({ ...prev, [endpointKey]: '' }));

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom${endpoint.endpoint}`;
      const params = new URLSearchParams();
      
      Object.entries(endpoint.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      
      params.append('debug', 'True');
      
      console.log(`Calling ${endpoint.name} API:`, url + '?' + params.toString());

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${endpoint.name} API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`${endpoint.name} response:`, data);

      if (data.status?.code === 0 || data.success) {
        setPropertyData(prev => ({
          ...prev,
          [endpointKey]: data
        }));
        
        return data;
      } else if (data.status?.msg === 'SuccessWithoutResult') {
        console.log(`${endpoint.name}: No data available`);
        setErrors(prev => ({ 
          ...prev, 
          [endpointKey]: `No ${endpoint.name.toLowerCase()} data available for this property` 
        }));
        return null;
      } else {
        throw new Error(data.status?.msg || data.error?.message || 'Unknown API error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error(`Error fetching ${endpoint.name}:`, err);
      setErrors(prev => ({ 
        ...prev, 
        [endpointKey]: errorMessage 
      }));
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, [endpointKey]: false }));
    }
  }, []);

  // Search for comprehensive property data
  const searchProperty = useCallback(async () => {
    if (!searchInput.trim()) {
      alert('Please enter an Attom ID or address');
      return;
    }

    console.log('Starting comprehensive property search:', searchInput);
    
    // Clear previous data
    setPropertyData({});
    setErrors({});
    
    // Call all API endpoints
    const results = await Promise.allSettled(
      apiEndpoints.map(endpoint => callAPIEndpoint(endpoint))
    );
    
    // Process results
    const successfulResults = results.filter(result => result.status === 'fulfilled');
    const failedResults = results.filter(result => result.status === 'rejected');
    
    console.log(`Comprehensive search completed: ${successfulResults.length} successful, ${failedResults.length} failed`);
    
    // Combine all successful data
    const combinedData: ComprehensivePropertyData = {};
    apiEndpoints.forEach((endpoint, index) => {
      const result = results[index];
      const endpointKey = endpoint.name.replace(/\s+/g, '_').toLowerCase();
      
      if (result.status === 'fulfilled' && result.value) {
        combinedData[endpointKey] = result.value;
      }
    });
    
    // Call callback with combined data
    if (Object.keys(combinedData).length > 0) {
      onPropertyFound?.(combinedData);
      
      // Cache the results
      localStorage.setItem('handoff-comprehensive-property-data', JSON.stringify({
        searchInput,
        data: combinedData,
        timestamp: new Date().toISOString()
      }));
    }
  }, [searchInput, apiEndpoints, callAPIEndpoint, onPropertyFound]);

  // Load cached data on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('handoff-comprehensive-property-data');
      if (cached) {
        const { searchInput: cachedInput, data, timestamp } = JSON.parse(cached);
        
        // Use cached data if it's for the current search and less than 1 hour old
        const cacheAge = Date.now() - new Date(timestamp).getTime();
        const oneHour = 60 * 60 * 1000;
        
        if (cachedInput === searchInput && cacheAge < oneHour) {
          setPropertyData(data);
          console.log('Loaded cached comprehensive property data');
        }
      }
    } catch (error) {
      console.warn('Failed to load cached comprehensive property data:', error);
    }
  }, [searchInput]);

  // Handle search button click
  const handleSearch = useCallback(() => {
    searchProperty();
  }, [searchProperty]);

  // Handle enter key in input
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Get basic property info from any available source
  const getBasicPropertyInfo = useCallback(() => {
    const basicProfile = propertyData.property_basic_profile?.property?.[0];
    const expandedDetail = propertyData.property_expanded_detail?.property?.[0];
    
    return basicProfile || expandedDetail || null;
  }, [propertyData]);

  // Check if any data is loading
  const isAnyLoading = Object.values(loadingStates).some(loading => loading);
  
  // Check if we have any property data
  const hasAnyData = Object.keys(propertyData).length > 0;
  
  // Get basic property info for display
  const basicInfo = getBasicPropertyInfo();

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Loading Progress */}
      {isAnyLoading && (
        <Card className="modern-card">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                <h3 className="font-semibold">Loading Property Data</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {apiEndpoints.map((endpoint) => {
                  const endpointKey = endpoint.name.replace(/\s+/g, '_').toLowerCase();
                  const isLoading = loadingStates[endpointKey];
                  const hasError = errors[endpointKey];
                  const hasData = propertyData[endpointKey];
                  
                  return (
                    <div key={endpoint.name} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      ) : hasError ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : hasData ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-300 rounded-full" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{endpoint.name}</div>
                        {hasError && (
                          <div className="text-xs text-red-600 truncate">{hasError}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Property Data Display */}
      {hasAnyData && !isAnyLoading && (
        <div className="space-y-6">
          {/* Property Header */}
          {basicInfo && (
            <Card className="modern-card">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {basicInfo.address?.oneLine || 'Property Details'}
                    </h2>
                    <p className="text-muted-foreground">
                      Attom ID: {basicInfo.identifier?.id || searchInput}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {Object.keys(propertyData).length} Data Sources
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold">
                      {basicInfo.building?.summary?.noOfBeds || basicInfo.area?.bedrooms || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold">
                      {basicInfo.building?.summary?.noOfBaths || basicInfo.area?.bathrooms || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold">
                      {basicInfo.area?.areaSqFt ? formatSquareFeet(basicInfo.area.areaSqFt) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Square Feet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold">
                      {basicInfo.building?.summary?.yearBuilt || basicInfo.summary?.yearbuilt || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Year Built</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tabbed Data Display */}
          <Card className="modern-card">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b p-4">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
                  <TabsTrigger value="overview" className={isMobile ? 'mobile-tab text-xs' : ''}>
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="owner" className={isMobile ? 'mobile-tab text-xs' : ''}>
                    Owner
                  </TabsTrigger>
                  <TabsTrigger value="financial" className={isMobile ? 'mobile-tab text-xs' : ''}>
                    Financial
                  </TabsTrigger>
                  <TabsTrigger value="schools" className={isMobile ? 'mobile-tab text-xs' : ''}>
                    Schools
                  </TabsTrigger>
                  <TabsTrigger value="neighborhood" className={isMobile ? 'mobile-tab text-xs' : ''}>
                    Area
                  </TabsTrigger>
                  <TabsTrigger value="risks" className={isMobile ? 'mobile-tab text-xs' : ''}>
                    Risks
                  </TabsTrigger>
                  <TabsTrigger value="market" className={isMobile ? 'mobile-tab text-xs' : ''}>
                    Market
                  </TabsTrigger>
                  <TabsTrigger value="utilities" className={isMobile ? 'mobile-tab text-xs' : ''}>
                    Utilities
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6">
                {basicInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Property Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Property Details
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Property Type:</span>
                            <p className="font-medium">{basicInfo.summary?.proptype || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Property Class:</span>
                            <p className="font-medium">{basicInfo.summary?.propclass || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Land Use:</span>
                            <p className="font-medium">{basicInfo.summary?.propLandUse || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">County:</span>
                            <p className="font-medium">{basicInfo.lot?.situsCounty || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Construction Details */}
                        {basicInfo.building?.construction && (
                          <div className="pt-3 border-t">
                            <h4 className="font-medium mb-2">Construction</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {basicInfo.building.construction.style && (
                                <div>
                                  <span className="text-muted-foreground">Style:</span>
                                  <p>{basicInfo.building.construction.style}</p>
                                </div>
                              )}
                              {basicInfo.building.construction.condition && (
                                <div>
                                  <span className="text-muted-foreground">Condition:</span>
                                  <p>{basicInfo.building.construction.condition}</p>
                                </div>
                              )}
                              {basicInfo.building.construction.exteriorWalls && (
                                <div>
                                  <span className="text-muted-foreground">Exterior:</span>
                                  <p>{basicInfo.building.construction.exteriorWalls}</p>
                                </div>
                              )}
                              {basicInfo.building.construction.roofCover && (
                                <div>
                                  <span className="text-muted-foreground">Roof:</span>
                                  <p>{basicInfo.building.construction.roofCover}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location & Lot */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Location & Lot
                      </h3>
                      
                      <div className="space-y-3">
                        {basicInfo.location && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Coordinates:</span>
                            <p className="font-medium">
                              {basicInfo.location.latitude}, {basicInfo.location.longitude}
                            </p>
                          </div>
                        )}

                        {basicInfo.lot && (
                          <div className="space-y-2 text-sm">
                            {basicInfo.lot.lotsize1 && (
                              <div>
                                <span className="text-muted-foreground">Lot Size:</span>
                                <p className="font-medium">{formatSquareFeet(basicInfo.lot.lotsize1)}</p>
                              </div>
                            )}
                            
                            {basicInfo.lot.subdname && (
                              <div>
                                <span className="text-muted-foreground">Subdivision:</span>
                                <p className="font-medium">{basicInfo.lot.subdname}</p>
                              </div>
                            )}

                            {basicInfo.lot.pooltype && (
                              <div className="flex items-center gap-2">
                                <Waves className="w-4 h-4 text-blue-500" />
                                <span>Pool: {basicInfo.lot.pooltype}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Owner Tab */}
              <TabsContent value="owner" className="p-6 space-y-6">
                {basicInfo?.owner && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Current Owner Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Primary Owner:</span>
                          <p className="font-medium text-lg">
                            {basicInfo.owner.owner1Full || 
                             `${basicInfo.owner.firstName || ''} ${basicInfo.owner.lastName || ''}`.trim() || 
                             'N/A'}
                          </p>
                        </div>

                        {basicInfo.owner.owner2Full && (
                          <div>
                            <span className="text-muted-foreground">Co-Owner:</span>
                            <p className="font-medium">{basicInfo.owner.owner2Full}</p>
                          </div>
                        )}

                        {basicInfo.owner.corporateIndicator && (
                          <div>
                            <span className="text-muted-foreground">Ownership Type:</span>
                            <Badge variant="outline">
                              {basicInfo.owner.corporateIndicator === 'Y' ? 'Corporate' : 'Individual'}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {basicInfo.owner.mailingAddress && (
                        <div className="space-y-3">
                          <span className="text-muted-foreground">Mailing Address:</span>
                          <p className="font-medium">
                            {basicInfo.owner.mailingAddress.oneLine || 
                             `${basicInfo.owner.mailingAddress.line1 || ''} ${basicInfo.owner.mailingAddress.line2 || ''}, ${basicInfo.owner.mailingAddress.locality || ''}, ${basicInfo.owner.mailingAddress.countrySubd || ''} ${basicInfo.owner.mailingAddress.postal1 || ''}`.trim()}
                          </p>

                          {basicInfo.owner.mailingAddress.oneLine !== basicInfo.address?.oneLine && (
                            <Alert>
                              <Info className="w-4 h-4" />
                              <AlertDescription>
                                Mailing address differs from property address (Absentee Owner)
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assessment Information */}
                  {basicInfo?.assessment && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Tax Assessment
                      </h3>
                      
                      <div className="space-y-3 text-sm">
                        {basicInfo.assessment.assessor?.assdValue && (
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground">Assessed Value:</span>
                            <span className="font-semibold text-lg">
                              {formatCurrency(basicInfo.assessment.assessor.assdValue)}
                            </span>
                          </div>
                        )}
                        
                        {basicInfo.assessment.market?.apprCurr && (
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground">Market Value:</span>
                            <span className="font-semibold text-lg">
                              {formatCurrency(basicInfo.assessment.market.apprCurr)}
                            </span>
                          </div>
                        )}

                        {basicInfo.assessment.tax?.taxAmt && (
                          <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-muted-foreground">Annual Tax:</span>
                            <span className="font-semibold text-lg text-green-700">
                              {formatCurrency(basicInfo.assessment.tax.taxAmt)}
                            </span>
                          </div>
                        )}

                        {basicInfo.assessment.tax?.taxYear && (
                          <div className="text-center">
                            <span className="text-muted-foreground">Tax Year: </span>
                            <span className="font-medium">{basicInfo.assessment.tax.taxYear}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sale Information */}
                  {basicInfo?.sale && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Sales History
                      </h3>
                      
                      <div className="space-y-3">
                        {basicInfo.sale.amount?.saleAmt && (
                          <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="text-muted-foreground">Last Sale Price:</span>
                            <span className="font-semibold text-lg text-blue-700">
                              {formatCurrency(basicInfo.sale.amount.saleAmt)}
                            </span>
                          </div>
                        )}

                        {basicInfo.sale.transaction?.saleTransDate && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Sale Date:</span>
                            <p className="font-medium">{formatDate(basicInfo.sale.transaction.saleTransDate)}</p>
                          </div>
                        )}

                        {basicInfo.sale.calculation?.pricePerSizeUnit && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Price per Sq Ft:</span>
                            <p className="font-medium">{formatCurrency(basicInfo.sale.calculation.pricePerSizeUnit)}</p>
                          </div>
                        )}

                        {/* Sales History */}
                        {basicInfo.sale.salesHistory && basicInfo.sale.salesHistory.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Previous Sales</h4>
                            {basicInfo.sale.salesHistory.slice(0, 3).map((sale, index) => (
                              <div key={index} className="p-2 border border-border rounded text-xs">
                                <div className="flex justify-between items-center">
                                  <span>{formatDate(sale.saleTransDate)}</span>
                                  <span className="font-medium">{formatCurrency(sale.amount.saleAmt)}</span>
                                </div>
                                {sale.calculation?.pricePerSizeUnit && (
                                  <div className="text-muted-foreground">
                                    {formatCurrency(sale.calculation.pricePerSizeUnit)}/sq ft
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Schools Tab */}
              <TabsContent value="schools" className="p-6 space-y-6">
                <div className="text-center py-8">
                  <School className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">School District Information</h3>
                  <p className="text-muted-foreground mb-4">
                    School data will be displayed here when the School District API endpoint is implemented.
                  </p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </TabsContent>

              {/* Neighborhood Tab */}
              <TabsContent value="neighborhood" className="p-6 space-y-6">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Neighborhood Demographics</h3>
                  <p className="text-muted-foreground mb-4">
                    Neighborhood and demographic data will be displayed here when the Demographics API endpoint is implemented.
                  </p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </TabsContent>

              {/* Risks Tab */}
              <TabsContent value="risks" className="p-6 space-y-6">
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Risk Assessment</h3>
                  <p className="text-muted-foreground mb-4">
                    Flood, fire, earthquake, and environmental risk data will be displayed here when the Risk API endpoint is implemented.
                  </p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </TabsContent>

              {/* Market Tab */}
              <TabsContent value="market" className="p-6 space-y-6">
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Market Trends</h3>
                  <p className="text-muted-foreground mb-4">
                    Local market trends and price analysis will be displayed here when the Market Trends API endpoint is implemented.
                  </p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </TabsContent>

              {/* Utilities Tab */}
              <TabsContent value="utilities" className="p-6 space-y-6">
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Utility Information</h3>
                  <p className="text-muted-foreground mb-4">
                    Utility providers and service information will be displayed here when the Utilities API endpoint is implemented.
                  </p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}

      {/* API Status Summary */}
      {hasAnyData && (
        <Card className="modern-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              API Data Sources
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {apiEndpoints.map((endpoint) => {
                const endpointKey = endpoint.name.replace(/\s+/g, '_').toLowerCase();
                const hasData = propertyData[endpointKey];
                const hasError = errors[endpointKey];
                
                return (
                  <div key={endpoint.name} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    {hasData ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : hasError ? (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{endpoint.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {endpoint.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}


    </div>
  );
}