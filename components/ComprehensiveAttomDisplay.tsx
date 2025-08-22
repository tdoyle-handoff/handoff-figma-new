import { Fragment } from 'react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Building,
  Zap,
  Shield,
  TreePine,
  Activity,
  PieChart,
  BarChart3,
  Info,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Calculator
} from 'lucide-react';
import { AttomProperty } from '../types/attom';
import { 
  formatCurrency, 
  formatSquareFeet, 
  formatLotSize, 
  formatPropertyType,
  formatConfidenceScore,
  calculatePropertyScore
} from '../hooks/useAttomData';

interface ComprehensiveAttomDisplayProps {
  property: AttomProperty;
  isLoading?: boolean;
  onRefresh?: () => void;
  showAllSections?: boolean;
  className?: string;
  onNavigate?: (page: string) => void;
}

export function ComprehensiveAttomDisplay({ 
  property, 
  isLoading = false, 
  onRefresh,
  showAllSections = true,
  className = "",
  onNavigate
}: ComprehensiveAttomDisplayProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Safely calculate scores and metrics
  const propertyScore = property ? calculatePropertyScore(property) : 0;
  const dataFreshness = property?.data_freshness_score || 0;
  const confidenceScore = property?.valuation?.confidence_score || 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const getRiskLevel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score <= 3) return 'Low';
    if (score <= 6) return 'Moderate';
    if (score <= 8) return 'High';
    return 'Very High';
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-700';
    if (score <= 3) return 'bg-green-100 text-green-700';
    if (score <= 6) return 'bg-yellow-100 text-yellow-700';
    if (score <= 8) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  // Safe address access
  const addressFormatted = property?.address?.formatted || 'Address not available';
  const coordinates = property?.address?.coordinates;

  // Early return if no property data
  if (!property) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No property data available. Please try refreshing or selecting a different property.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Property Score */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-6 h-6 text-primary" />
                Property Analysis Report
              </CardTitle>
              <p className="text-muted-foreground">
                {addressFormatted}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onNavigate && (
                <Button
                  onClick={() => onNavigate('property-report')}
                  size="sm"
                  variant="default"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Full Report
                </Button>
              )}
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh Data
                </Button>
              )}
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                <Star className="w-3 h-3 mr-1" />
                Score: {propertyScore}/100
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Quality</span>
                <span className="text-sm text-muted-foreground">{dataFreshness}%</span>
              </div>
              <Progress value={dataFreshness} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Value Confidence</span>
                <span className="text-sm text-muted-foreground">{confidenceScore}%</span>
              </div>
              <Progress value={confidenceScore} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Rating</span>
                <span className="text-sm text-muted-foreground">{propertyScore}%</span>
              </div>
              <Progress value={propertyScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Tabs with User-Friendly Names */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="valuation">Property Value</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="details">Features</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Key Financial Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Key Financial Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Value</span>
                  <span className="font-semibold">
                    {formatCurrency(property?.valuation?.estimated_value)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sale Price</span>
                  <span className="font-semibold">
                    {formatCurrency(property?.valuation?.last_sale_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per Sq Ft</span>
                  <span className="font-semibold">
                    {formatCurrency(property?.valuation?.price_per_sqft)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Taxes</span>
                  <span className="font-semibold">
                    {formatCurrency(property?.tax_assessment?.annual_tax_amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Property Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Property Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-semibold">
                    {formatPropertyType(property?.property_details?.property_type || 'Unknown')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bedrooms</span>
                  <span className="font-semibold">
                    {property?.property_details?.bedrooms || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bathrooms</span>
                  <span className="font-semibold">
                    {property?.property_details?.bathrooms || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Square Feet</span>
                  <span className="font-semibold">
                    {formatSquareFeet(property?.property_details?.square_feet)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year Built</span>
                  <span className="font-semibold">
                    {property?.property_details?.year_built || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lot Size</span>
                  <span className="font-semibold">
                    {formatLotSize(property?.property_details?.lot_size_sqft, property?.property_details?.lot_size_acres)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-muted-foreground text-sm">Full Address</span>
                  <p className="font-semibold">{addressFormatted}</p>
                </div>
                {coordinates?.latitude && coordinates?.longitude && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">Coordinates</span>
                    <p className="font-mono text-sm">
                      {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">County</span>
                  <span className="font-semibold">
                    {property?.neighborhood?.county || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Neighborhood</span>
                  <span className="font-semibold">
                    {property?.neighborhood?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">School District</span>
                  <span className="font-semibold">
                    {property?.neighborhood?.school_district || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Property Value Tab */}
        <TabsContent value="valuation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Current Property Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Estimated Market Value</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(property?.valuation?.estimated_value)}
                    </p>
                    {property?.valuation?.confidence_score && (
                      <p className="text-sm text-green-600">
                        Confidence: {formatConfidenceScore(property.valuation.confidence_score)}
                      </p>
                    )}
                  </div>
                </div>
                
                {(property?.valuation?.value_range_low || property?.valuation?.value_range_high) && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Estimated Value Range</span>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Low</span>
                      <span>{formatCurrency(property?.valuation?.value_range_low)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">High</span>
                      <span>{formatCurrency(property?.valuation?.value_range_high)}</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per Sq Ft</span>
                    <span className="font-semibold">
                      {formatCurrency(property?.valuation?.price_per_sqft)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Value</span>
                    <span className="font-semibold">
                      {formatCurrency(property?.valuation?.market_value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assessed Value</span>
                    <span className="font-semibold">
                      {formatCurrency(property?.valuation?.assessed_value)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Sale History & Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sale Price</span>
                    <span className="font-semibold">
                      {formatCurrency(property?.valuation?.last_sale_price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sale Date</span>
                    <span className="font-semibold">
                      {formatDate(property?.valuation?.last_sale_date)}
                    </span>
                  </div>
                </div>

                {(property?.valuation?.value_change_1yr !== undefined || property?.valuation?.value_change_5yr !== undefined) && (
                  <Fragment>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Value Changes</h4>
                      {property?.valuation?.value_change_1yr !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">1 Year Change</span>
                          <span className={`font-semibold ${(property.valuation.value_change_1yr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(property.valuation.value_change_1yr || 0) >= 0 ? '+' : ''}{formatPercent(property.valuation.value_change_1yr)}
                          </span>
                        </div>
                      )}
                      {property?.valuation?.value_change_5yr !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">5 Year Change</span>
                          <span className={`font-semibold ${(property.valuation.value_change_5yr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(property.valuation.value_change_5yr || 0) >= 0 ? '+' : ''}{formatPercent(property.valuation.value_change_5yr)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Fragment>
                )}

                {property?.market_data?.price_history && Array.isArray(property.market_data.price_history) && property.market_data.price_history.length > 0 && (
                  <Fragment>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Recent Price History</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {property.market_data.price_history.slice(0, 5).map((entry, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {formatDate(entry?.date)} - {entry?.event_type || 'Sale'}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(entry?.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Fragment>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Data Tab */}
        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Current Market Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property?.market_data?.listing_status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listing Status</span>
                    <Badge variant="outline">
                      {property.market_data.listing_status}
                    </Badge>
                  </div>
                )}
                
                {property?.market_data?.list_price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current List Price</span>
                    <span className="font-semibold">
                      {formatCurrency(property.market_data.list_price)}
                    </span>
                  </div>
                )}

                {property?.market_data?.days_on_market && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days on Market</span>
                    <span className="font-semibold">
                      {property.market_data.days_on_market} days
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {property?.market_data?.neighborhood_stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-orange-600" />
                    Neighborhood Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.market_data.neighborhood_stats.median_home_value && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Median Home Value</span>
                      <span className="font-semibold">
                        {formatCurrency(property.market_data.neighborhood_stats.median_home_value)}
                      </span>
                    </div>
                  )}
                  
                  {property.market_data.neighborhood_stats.median_price_per_sqft && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Median Price/Sq Ft</span>
                      <span className="font-semibold">
                        {formatCurrency(property.market_data.neighborhood_stats.median_price_per_sqft)}
                      </span>
                    </div>
                  )}

                  {property.market_data.neighborhood_stats.price_trend_3months && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">3-Month Trend</span>
                      <Badge 
                        variant="outline"
                        className={
                          property.market_data.neighborhood_stats.price_trend_3months === 'Up' ? 'border-green-500 text-green-700' :
                          property.market_data.neighborhood_stats.price_trend_3months === 'Down' ? 'border-red-500 text-red-700' :
                          'border-gray-500 text-gray-700'
                        }
                      >
                        {property.market_data.neighborhood_stats.price_trend_3months}
                      </Badge>
                    </div>
                  )}

                  {property.market_data.neighborhood_stats.inventory_months && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Inventory</span>
                      <span className="font-semibold">
                        {property.market_data.neighborhood_stats.inventory_months} months
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {property?.market_data?.comparable_sales && Array.isArray(property.market_data.comparable_sales) && property.market_data.comparable_sales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Comparable Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.market_data.comparable_sales.slice(0, 5).map((comp, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">{comp?.address || 'Address not available'}</p>
                        <Badge variant="outline">{formatCurrency(comp?.sold_price)}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <span>Sold: {formatDate(comp?.sold_date)}</span>
                        <span>{comp?.bedrooms || 'N/A'} bed / {comp?.bathrooms || 'N/A'} bath</span>
                        <span>{formatSquareFeet(comp?.square_feet)}</span>
                        <span>{comp?.distance_miles?.toFixed(2) || 'N/A'} mi away</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Detailed Property Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stories</span>
                    <span>{property?.property_details?.stories || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units</span>
                    <span>{property?.property_details?.units_count || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rooms</span>
                    <span>{property?.property_details?.total_rooms || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Bathrooms</span>
                    <span>{property?.property_details?.full_bathrooms || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Half Bathrooms</span>
                    <span>{property?.property_details?.half_bathrooms || 'N/A'}</span>
                  </div>
                </div>

                {(property?.property_details?.pool || property?.property_details?.fireplace || property?.property_details?.basement || property?.property_details?.attic || property?.property_details?.garage || property?.property_details?.central_air) && (
                  <Fragment>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Amenities & Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {property.property_details.pool && <Badge variant="secondary">Pool</Badge>}
                        {property.property_details.fireplace && <Badge variant="secondary">Fireplace</Badge>}
                        {property.property_details.basement && <Badge variant="secondary">Basement</Badge>}
                        {property.property_details.attic && <Badge variant="secondary">Attic</Badge>}
                        {property.property_details.garage && <Badge variant="secondary">Garage</Badge>}
                        {property.property_details.central_air && <Badge variant="secondary">Central Air</Badge>}
                      </div>
                    </div>
                  </Fragment>
                )}
              </CardContent>
            </Card>

            {/* Utilities & Systems */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Utilities & Systems
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heating System</span>
                  <span>{property?.property_details?.heating_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cooling System</span>
                  <span>{property?.property_details?.cooling_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Water Source</span>
                  <span>{property?.utilities?.water_source || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sewer System</span>
                  <span>{property?.utilities?.sewer_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Electric Provider</span>
                  <span>{property?.utilities?.electric_provider || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Provider</span>
                  <span>{property?.utilities?.gas_provider || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tax Information - Enhanced */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Tax Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Check if we have any tax assessment data */}
                {(property?.tax_assessment?.annual_tax_amount || 
                  property?.tax_assessment?.total_assessed_value ||
                  property?.tax_assessment?.land_assessed_value ||
                  property?.valuation?.assessed_value ||
                  property?.tax_assessment?.assessment_year ||
                  property?.tax_assessment?.tax_year) ? (
                  <Fragment>
                    {property?.tax_assessment?.annual_tax_amount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Property Tax</span>
                        <span className="font-semibold">
                          {formatCurrency(property.tax_assessment.annual_tax_amount)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Assessed Value</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          property?.tax_assessment?.total_assessed_value ||
                          property?.valuation?.assessed_value
                        )}
                      </span>
                    </div>
                    
                    {property?.tax_assessment?.land_assessed_value && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Land Assessed Value</span>
                        <span>
                          {formatCurrency(property.tax_assessment.land_assessed_value)}
                        </span>
                      </div>
                    )}
                    
                    {property?.tax_assessment?.improvement_assessed_value && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Improvement Value</span>
                        <span>
                          {formatCurrency(property.tax_assessment.improvement_assessed_value)}
                        </span>
                      </div>
                    )}
                    
                    {(property?.tax_assessment?.assessment_year || 
                      property?.tax_assessment?.tax_year || 
                      property?.valuation?.assessed_year) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assessment Year</span>
                        <span>
                          {property?.tax_assessment?.assessment_year || 
                           property?.tax_assessment?.tax_year || 
                           property?.valuation?.assessed_year}
                        </span>
                      </div>
                    )}
                    
                    {property?.tax_assessment?.tax_rate_per_1000 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Rate (per $1000)</span>
                        <span>
                          ${property.tax_assessment.tax_rate_per_1000.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Tax Exemptions */}
                    {property?.tax_assessment?.exemptions && property.tax_assessment.exemptions.length > 0 && (
                      <Fragment>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Tax Exemptions</h4>
                          {property.tax_assessment.exemptions.map((exemption, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{exemption.type}</span>
                              <span>{formatCurrency(exemption.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </Fragment>
                    )}
                  </Fragment>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Tax assessment data is not available for this property. This may be because:
                      <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                        <li>The property is new construction or recently built</li>
                        <li>Tax records have not been updated in the database</li>
                        <li>The property is exempt from taxation</li>
                        <li>The data is not available from the current data source</li>
                        <li>Some rural or remote properties may have limited tax data</li>
                      </ul>
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-700">
                          <strong>For Developers:</strong> To troubleshoot missing tax data, add <code>?attom-debug=true</code> to the URL 
                          to access comprehensive debugging tools and data availability analysis.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Environmental Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-green-600" />
                  Environmental Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property?.risk_factors ? (
                  <Fragment>
                    {property.risk_factors.flood_risk_score !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Flood Risk</span>
                        <Badge className={getRiskColor(property.risk_factors.flood_risk_score)}>
                          {getRiskLevel(property.risk_factors.flood_risk_score)}
                        </Badge>
                      </div>
                    )}
                    
                    {property.risk_factors.fire_risk && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fire Risk</span>
                        <Badge variant="outline">
                          {property.risk_factors.fire_risk}
                        </Badge>
                      </div>
                    )}
                    
                    {property.risk_factors.earthquake_risk && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Earthquake Risk</span>
                        <Badge variant="outline">
                          {property.risk_factors.earthquake_risk}
                        </Badge>
                      </div>
                    )}
                    
                    {property.risk_factors.walkability_score !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Walkability Score</span>
                        <span className="font-semibold">
                          {property.risk_factors.walkability_score}/100
                        </span>
                      </div>
                    )}
                    
                    {property.risk_factors.school_score !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">School Score</span>
                        <span className="font-semibold">
                          {property.risk_factors.school_score}/10
                        </span>
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Environmental risk data is not available for this property at this time.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Market & Investment Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Market Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Market risk analysis is not available for this property at this time. Risk factors depend on market conditions, comparable sales data, and economic indicators that may vary by location and property type.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investment Analysis Tab */}
        <TabsContent value="investment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Investment Potential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property?.rental_data ? (
                  <Fragment>
                    {property.rental_data.estimated_rent && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Monthly Rent</span>
                        <span className="font-semibold">
                          {formatCurrency(property.rental_data.estimated_rent)}
                        </span>
                      </div>
                    )}
                    
                    {(property.rental_data.rent_range_low || property.rental_data.rent_range_high) && (
                      <Fragment>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rent Range (Low)</span>
                          <span>{formatCurrency(property.rental_data.rent_range_low)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rent Range (High)</span>
                          <span>{formatCurrency(property.rental_data.rent_range_high)}</span>
                        </div>
                      </Fragment>
                    )}
                    
                    {property.rental_data.cap_rate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cap Rate</span>
                        <span className="font-semibold">
                          {formatPercent(property.rental_data.cap_rate)}
                        </span>
                      </div>
                    )}
                    
                    {property.rental_data.gross_yield && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gross Yield</span>
                        <span className="font-semibold">
                          {formatPercent(property.rental_data.gross_yield)}
                        </span>
                      </div>
                    )}
                    
                    {property.rental_data.cash_on_cash_return && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash-on-Cash Return</span>
                        <span className="font-semibold">
                          {formatPercent(property.rental_data.cash_on_cash_return)}
                        </span>
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Investment analysis data is not available for this property. This may be because the property is not suitable for rental investment or the data is not yet available.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(property?.valuation?.estimated_value && property?.rental_data?.estimated_rent) ? (
                  <Fragment>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-blue-600 font-medium">Purchase Price to Rent Ratio</p>
                        <p className="text-xl font-bold text-blue-900">
                          {Math.round((property.valuation.estimated_value || 0) / ((property.rental_data?.estimated_rent || 0) * 12))}:1
                        </p>
                        <p className="text-xs text-blue-600">
                          Lower is generally better for investors
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Key Metrics</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Property Value</span>
                        <span>{formatCurrency(property.valuation.estimated_value)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Rent</span>
                        <span>{formatCurrency(property.rental_data.estimated_rent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annual Rent</span>
                        <span>{formatCurrency(property.rental_data.estimated_rent * 12)}</span>
                      </div>
                      {property.tax_assessment?.annual_tax_amount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Annual Taxes</span>
                          <span>{formatCurrency(property.tax_assessment.annual_tax_amount)}</span>
                        </div>
                      )}
                    </div>
                  </Fragment>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Financial analysis requires both property valuation and rental market data. Some information may not be available for this property.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}