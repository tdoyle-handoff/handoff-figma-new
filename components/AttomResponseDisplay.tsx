import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Calendar,
  User,
  Building,
  Ruler,
  Car,
  Zap,
  Droplets,
  Thermometer,
  Shield,
  Info,
  TrendingUp,
  Building2,
  TreePine,
  Hammer,
  CheckCircle,
  AlertCircle,
  Receipt,
  FileText,
  Clock
} from 'lucide-react';

interface AttomResponseDisplayProps {
  response: any;
  endpointName: string;
}

export function AttomResponseDisplay({ response, endpointName }: AttomResponseDisplayProps) {
  // Enhanced error boundary protection
  try {
    if (!response || !response.success) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>API Error:</strong> {String(response?.error || 'Unknown error occurred')}
          </AlertDescription>
        </Alert>
      );
    }

    const data = response.data;
    
    // Handle 401 errors specifically
    if (response.status === 401) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Authentication Error:</strong> API key is invalid or expired. Please check your ATTOM API configuration.
          </AlertDescription>
        </Alert>
      );
    }
    
    // Handle different endpoint response structures
    const isSaleDetail = endpointName === 'Sale Detail';
    const isPropertyEndpoint = ['Basic Profile', 'Property Detail', 'Expanded Profile'].includes(endpointName);
    
    // For sale detail, look for sale array; for property endpoints, look for property array
    const dataArray = isSaleDetail ? data?.sale : data?.property;
    
    if (!data || !dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No {isSaleDetail ? 'sale' : 'property'} data found in the API response.
          </AlertDescription>
        </Alert>
      );
    }

    const item = dataArray[0]; // Get the first item
    
    // Extract data based on endpoint type with null checks
    let propertyInfo = {};
    let address = {};
    let lot = {};
    let area = {};
    let summary = {};
    let sale = {};
    let assessment = {};
    let building = {};
    let utilities = {};
    let vintage = {};
    
    try {
      if (isSaleDetail) {
        // Sale detail structure
        propertyInfo = item?.identifier || {};
        address = item?.address || {};
        sale = item?.sale || {};
        assessment = item?.assessment || {};
        // Sale records might have property info embedded
        const propertyData = item?.property || {};
        lot = propertyData?.lot || {};
        area = propertyData?.area || {};
        summary = propertyData?.summary || {};
        building = propertyData?.building || {};
        utilities = propertyData?.utilities || {};
        vintage = propertyData?.vintage || {};
      } else {
        // Property endpoint structure
        propertyInfo = item?.identifier || {};
        address = item?.address || {};
        lot = item?.lot || {};
        area = item?.area || {};
        summary = item?.summary || {};
        sale = item?.sale || {};
        assessment = item?.assessment || {};
        building = item?.building || {};
        utilities = item?.utilities || {};
        vintage = item?.vintage || {};
      }
    } catch (error) {
      console.error('Error extracting property data:', error);
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Data Processing Error:</strong> Unable to process the API response data.
          </AlertDescription>
        </Alert>
      );
    }

    const formatCurrency = (value: any): string => {
      try {
        if (!value || value === 0 || value === '0') return 'Not available';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return String(value || 'Not available');
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(num);
      } catch {
        return 'Not available';
      }
    };

    const formatNumber = (value: any): string => {
      try {
        if (!value || value === 0 || value === '0') return 'Not available';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return String(value || 'Not available');
        return new Intl.NumberFormat('en-US').format(num);
      } catch {
        return 'Not available';
      }
    };

    const formatDate = (value: any): string => {
      try {
        if (!value) return 'Not available';
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value || 'Not available');
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return 'Not available';
      }
    };

    const formatSquareFeet = (value: any): string => {
      try {
        if (!value || value === 0 || value === '0') return 'Not available';
        return `${formatNumber(value)} sq ft`;
      } catch {
        return 'Not available';
      }
    };

    const formatAcres = (value: any): string => {
      try {
        if (!value || value === 0 || value === '0') return 'Not available';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return 'Not available';
        return `${num.toFixed(2)} acres`;
      } catch {
        return 'Not available';
      }
    };

    // Enhanced safe value renderer with comprehensive type checking
    const safeRender = (value: any, fallback: string = 'Not available'): string => {
      try {
        if (value === null || value === undefined || value === '') return fallback;
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number') {
          if (isNaN(value)) return fallback;
          return String(value);
        }
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            if (value.length === 0) return fallback;
            return value.map(item => String(item || '')).join(', ') || fallback;
          }
          return JSON.stringify(value) || fallback;
        }
        return String(value) || fallback;
      } catch {
        return fallback;
      }
    };

    // Enhanced safe property access with comprehensive error handling
    const safeGet = (obj: any, path: string, fallback: string = 'Not available'): string => {
      try {
        if (!obj || typeof obj !== 'object') return fallback;
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
          if (current === null || current === undefined || typeof current !== 'object') {
            return fallback;
          }
          current = current[key];
        }
        
        return safeRender(current, fallback);
      } catch {
        return fallback;
      }
    };

    return (
      <div className="space-y-6">
        {/* API Response Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {String(endpointName)} Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="default">{String(response.status)} {String(response.statusText)}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-sm font-medium">{new Date(response.timestamp).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isSaleDetail ? 'Sale' : 'Property'} ID</p>
                <p className="text-sm font-medium font-mono">{safeGet(propertyInfo, 'attomId', 'N/A')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Property Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-lg">
                  {safeGet(address, 'oneLine') || 
                   `${safeGet(address, 'line1', '')} ${safeGet(address, 'line2', '')}`.trim() || 
                   'Address not available'}
                </h4>
                <p className="text-muted-foreground">
                  {safeGet(address, 'locality')}, {safeGet(address, 'countrySubd')} {safeGet(address, 'postal1')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">County</p>
                  <p className="font-medium">{safeGet(address, 'country')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Postal Code</p>
                  <p className="font-medium">{safeGet(address, 'postal1')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-medium font-mono text-xs">
                    {(() => {
                      try {
                        const coords = address?.geometry?.coordinates;
                        if (coords && Array.isArray(coords) && coords.length >= 2) {
                          const lat = Number(coords[1]);
                          const lng = Number(coords[0]);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                          }
                        }
                        return 'Not available';
                      } catch {
                        return 'Not available';
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sale Detail Specific Information */}
        {isSaleDetail && sale && Object.keys(sale).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Sale Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Sale Price and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(() => {
                    try {
                      const saleAmount = sale?.amount || sale?.saleAmt;
                      if (saleAmount) {
                        return (
                          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900">Sale Price</h4>
                            <p className="text-2xl font-bold text-green-700">{formatCurrency(saleAmount)}</p>
                            <p className="text-sm text-green-600">{formatDate(sale?.saleTransDate || sale?.saleRecordingDate || sale?.saleRecDate)}</p>
                          </div>
                        );
                      }
                      return null;
                    } catch {
                      return null;
                    }
                  })()}
                  
                  {(() => {
                    try {
                      const searchDate = sale?.saleSearchDate || sale?.saleRecDate;
                      if (searchDate) {
                        return (
                          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900">Sale Date</h4>
                            <p className="text-lg font-semibold text-blue-700">{formatDate(searchDate)}</p>
                            <p className="text-sm text-blue-600">Transaction date</p>
                          </div>
                        );
                      }
                      return null;
                    } catch {
                      return null;
                    }
                  })()}
                </div>

                {/* Sale Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction Type</p>
                    <p className="font-medium">{safeGet(sale, 'transactionType') || safeGet(sale, 'saleTransType', 'Not specified')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sale Category</p>
                    <p className="font-medium">{safeGet(sale, 'saleCategory') || safeGet(sale, 'saleCode', 'Not specified')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Document Number</p>
                    <p className="font-medium">{safeGet(sale, 'saleDocNum', 'Not available')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Disclosure Type</p>
                    <p className="font-medium">{safeGet(sale, 'saleDisclosureType', 'Not available')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recording Date</p>
                    <p className="font-medium">{formatDate(sale?.saleRecordingDate || sale?.saleRecDate)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property Overview (for both sale and property endpoints) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium">{safeGet(summary, 'proptype', 'Not specified')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{safeGet(vintage, 'lastModified') || safeGet(vintage, 'pubDate') || safeGet(building, 'summary.yearBuilt')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{safeGet(building, 'rooms.beds', 'Not specified')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">
                    {safeGet(building, 'rooms.bathstotal') || safeGet(building, 'rooms.baths', 'Not specified')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stories</p>
                  <p className="font-medium">{safeGet(building, 'summary.stories', 'Not specified')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Garage Spaces</p>
                  <p className="font-medium">{safeGet(building, 'parking.garagespaces', 'Not specified')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size & Lot Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary" />
                Size & Lot Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Building Area</p>
                  <p className="font-medium">{formatSquareFeet(area?.building)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Living Area</p>
                  <p className="font-medium">{formatSquareFeet(building?.size?.livingsize)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lot Size</p>
                  <p className="font-medium">{formatSquareFeet(lot?.lotsize1)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lot Size (Acres)</p>
                  <p className="font-medium">{formatAcres(lot?.lotsizeacres)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lot Frontage</p>
                  <p className="font-medium">{safeGet(lot, 'frontage')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Information (from assessment or sale data) */}
        {(() => {
          try {
            const hasFinancialData = sale?.amount || assessment?.assessed || assessment?.market;
            if (!hasFinancialData) return null;

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {!isSaleDetail && sale?.amount && (
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900">Last Sale Price</h4>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(sale.amount)}</p>
                        <p className="text-sm text-green-600">{formatDate(sale.saleSearchDate)}</p>
                      </div>
                    )}
                    
                    {assessment?.assessed && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900">Assessed Value</h4>
                        <p className="text-2xl font-bold text-blue-700">{formatCurrency(assessment.assessed.total)}</p>
                        <p className="text-sm text-blue-600">{formatDate(assessment.assessedDate)}</p>
                      </div>
                    )}
                    
                    {assessment?.market && (
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-900">Market Value</h4>
                        <p className="text-2xl font-bold text-purple-700">{formatCurrency(assessment.market.total)}</p>
                        <p className="text-sm text-purple-600">{formatDate(assessment.marketDate)}</p>
                      </div>
                    )}
                  </div>

                  {assessment?.tax && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-medium mb-3">Tax Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Annual Tax</p>
                          <p className="font-medium">{formatCurrency(assessment.tax.taxamt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tax Year</p>
                          <p className="font-medium">{safeGet(assessment, 'tax.taxyear')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tax Rate</p>
                          <p className="font-medium">{safeGet(assessment, 'tax.taxrate')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          } catch {
            return null;
          }
        })()}

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Property Identifiers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ATTOM ID:</span>
                    <span className="font-mono">{safeGet(propertyInfo, 'attomId', 'N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">APN:</span>
                    <span className="font-mono">{safeGet(propertyInfo, 'apn', 'N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FIPS:</span>
                    <span className="font-mono">{safeGet(propertyInfo, 'fips', 'N/A')}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Data Freshness</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Modified:</span>
                    <span>{formatDate(vintage?.lastModified)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published:</span>
                    <span>{formatDate(vintage?.pubDate)}</span>
                  </div>
                  {isSaleDetail && sale?.saleRecordingDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sale Recorded:</span>
                      <span>{formatDate(sale.saleRecordingDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  } catch (error) {
    console.error('AttomResponseDisplay error:', error);
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          <strong>Component Error:</strong> Unable to display the API response data. Please check the console for details.
        </AlertDescription>
      </Alert>
    );
  }
}