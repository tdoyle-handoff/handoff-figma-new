import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { 
  Building, 
  Database, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Info,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  MapPin,
  Home,
  DollarSign,
  Users,
  FileBarChart,
  Zap,
  Shield,
  GraduationCap,
  Globe
} from 'lucide-react';
import { 
  extractFromBasicProfile,
  extractFromExpandedProfile,
  extractFromPropertyDetail,
  extractFromSaleDetails,
  mergeComprehensiveData,
  generateFieldComparisonReport,
  exportComprehensiveData,
  type ComprehensivePropertyData,
  type DataSourceInfo
} from '../utils/comprehensiveAttomDataExtractor';
import { projectId, publicAnonKey, projectUrl } from '../utils/supabase/info';

interface ComprehensiveAttomDataSummaryTableProps {
  className?: string;
  defaultAddress?: string;
  autoFetch?: boolean;
}

interface ApiResponse {
  data: any;
  error?: string;
  timestamp: string;
}

interface SectionData {
  title: string;
  icon: React.ReactNode;
  fields: Array<{
    label: string;
    key: string;
    format?: (value: any) => string;
    type?: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'percentage';
  }>;
}

export function ComprehensiveAttomDataSummaryTable({
  className = '',
  defaultAddress = '586 Franklin Ave, Brooklyn, NY',
  autoFetch = false
}: ComprehensiveAttomDataSummaryTableProps) {
  // Parse default address
  const parseDefaultAddress = (addr: string) => {
    const parts = addr.split(',').map(p => p.trim());
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2]?.split(' ')[0] || '',
      zipCode: parts[2]?.split(' ')[1] || ''
    };
  };

  const defaultParsed = parseDefaultAddress(defaultAddress);
  const [addressFields, setAddressFields] = useState({
    street: defaultParsed.street,
    city: defaultParsed.city,
    state: defaultParsed.state,
    zipCode: defaultParsed.zipCode
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponses, setApiResponses] = useState<Record<string, ApiResponse>>({});
  const [mergedData, setMergedData] = useState<ComprehensivePropertyData | null>(null);
  const [sourceMap, setSourceMap] = useState<Record<string, DataSourceInfo>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBySource, setFilterBySource] = useState<string>('all');
  const [filterByConfidence, setFilterByConfidence] = useState<string>('all');

  const endpoints = [
    {
      id: 'basicprofile',
      name: 'Basic Profile',
      path: '/propertyapi/v1.0.0/property/basicprofile',
      priority: 1,
      description: 'Core property information'
    },
    {
      id: 'expandedprofile', 
      name: 'Expanded Profile',
      path: '/propertyapi/v1.0.0/property/expandedprofile',
      priority: 2,
      description: 'Extended property details'
    },
    {
      id: 'detail',
      name: 'Property Detail',
      path: '/propertyapi/v1.0.0/property/detail',
      priority: 3,
      description: 'Comprehensive property information'
    },
    {
      id: 'sale',
      name: 'Sale Details',
      path: '/propertyapi/v1.0.0/sale/detail',
      priority: 2,
      description: 'Sale history and market data'
    }
  ];

  const sectionDefinitions: SectionData[] = [
    {
      title: 'Basic Information',
      icon: <Info className="w-4 h-4" />,
      fields: [
        { label: 'Property ID', key: 'propertyId' },
        { label: 'APN', key: 'apn' },
        { label: 'FIPS Code', key: 'fips' },
        { label: 'Property Type', key: 'building.propertyType' },
        { label: 'Property Sub-Type', key: 'building.propertySubType' },
        { label: 'Property Class', key: 'building.propertyClass' },
        { label: 'Standard Use', key: 'building.standardUse' },
        { label: 'Year Built', key: 'building.yearBuilt', type: 'number' },
        { label: 'Number of Stories', key: 'building.stories', type: 'number' },
        { label: 'Units', key: 'building.units', type: 'number' },
      ]
    },
    {
      title: 'Address & Location',
      icon: <MapPin className="w-4 h-4" />,
      fields: [
        { label: 'Address Line 1', key: 'address.line1' },
        { label: 'Address Line 2', key: 'address.line2' },
        { label: 'City', key: 'address.locality' },
        { label: 'State', key: 'address.adminArea1' },
        { label: 'County', key: 'address.adminArea2' },
        { label: 'Postal Code', key: 'address.postalCode' },
        { label: 'Latitude', key: 'location.latitude', type: 'number' },
        { label: 'Longitude', key: 'location.longitude', type: 'number' },
        { label: 'Geo ID', key: 'location.geoId' },
        { label: 'Census Tract', key: 'location.censusTract' },
      ]
    },
    {
      title: 'Building Details',
      icon: <Building className="w-4 h-4" />,
      fields: [
        { label: 'Living Area (sq ft)', key: 'building.livingAreaSqFt', type: 'number' },
        { label: 'Gross Area (sq ft)', key: 'building.grossAreaSqFt', type: 'number' },
        { label: 'Basement Area (sq ft)', key: 'building.basementAreaSqFt', type: 'number' },
        { label: 'Garage Area (sq ft)', key: 'building.garageAreaSqFt', type: 'number' },
        { label: 'Bedrooms', key: 'building.bedrooms', type: 'number' },
        { label: 'Total Bathrooms', key: 'building.bathrooms', type: 'number' },
        { label: 'Full Bathrooms', key: 'building.fullBaths', type: 'number' },
        { label: 'Partial Bathrooms', key: 'building.partialBaths', type: 'number' },
        { label: 'Total Rooms', key: 'building.roomsTotal', type: 'number' },
      ]
    },
    {
      title: 'Construction & Features',
      icon: <Home className="w-4 h-4" />,
      fields: [
        { label: 'Construction Type', key: 'building.constructionType' },
        { label: 'Wall Type', key: 'building.wallType' },
        { label: 'Roof Type', key: 'building.roofType' },
        { label: 'Foundation Type', key: 'building.foundationType' },
        { label: 'Exterior Walls', key: 'building.exteriorWalls' },
        { label: 'Architectural Style', key: 'building.architecturalStyle' },
        { label: 'Building Style', key: 'building.buildingStyle' },
        { label: 'Condition', key: 'building.condition' },
        { label: 'Quality', key: 'building.quality' },
      ]
    },
    {
      title: 'Systems & Utilities',
      icon: <Zap className="w-4 h-4" />,
      fields: [
        { label: 'Heating', key: 'building.heating' },
        { label: 'Cooling', key: 'building.cooling' },
        { label: 'Fuel Type', key: 'building.fuel' },
        { label: 'Water', key: 'building.water' },
        { label: 'Sewer', key: 'building.sewer' },
        { label: 'Electricity', key: 'utilities.electricity' },
        { label: 'Gas', key: 'utilities.gas' },
        { label: 'Internet', key: 'utilities.internet' },
      ]
    },
    {
      title: 'Parking & Amenities',
      icon: <Shield className="w-4 h-4" />,
      fields: [
        { label: 'Garage Type', key: 'building.garageType' },
        { label: 'Parking Spaces', key: 'building.parkingSpaces', type: 'number' },
        { label: 'Parking Type', key: 'building.parkingType' },
        { label: 'Fireplace', key: 'building.fireplace', type: 'boolean' },
        { label: 'Fireplace Type', key: 'building.fireplaceType' },
        { label: 'Pool', key: 'building.pool', type: 'boolean' },
        { label: 'Pool Type', key: 'building.poolType' },
      ]
    },
    {
      title: 'Lot Information',
      icon: <Globe className="w-4 h-4" />,
      fields: [
        { label: 'Lot Size (acres)', key: 'lot.lotSizeAcres', type: 'number' },
        { label: 'Lot Size (sq ft)', key: 'lot.lotSizeSqFt', type: 'number' },
        { label: 'Front Footage', key: 'lot.frontFootage', type: 'number' },
        { label: 'Depth', key: 'lot.depth', type: 'number' },
        { label: 'Topography', key: 'lot.topography' },
        { label: 'Waterfront', key: 'lot.waterfront', type: 'boolean' },
        { label: 'Water Body', key: 'lot.waterBody' },
      ]
    },
    {
      title: 'Assessment & Taxes',
      icon: <FileBarChart className="w-4 h-4" />,
      fields: [
        { label: 'Assessed Year', key: 'assessment.assessedYear', type: 'number' },
        { label: 'Assessed Value', key: 'assessment.assessedValue', type: 'currency' },
        { label: 'Market Value', key: 'assessment.marketValue', type: 'currency' },
        { label: 'Land Value', key: 'assessment.landValue', type: 'currency' },
        { label: 'Improvement Value', key: 'assessment.improvementValue', type: 'currency' },
        { label: 'Tax Amount', key: 'assessment.taxAmount', type: 'currency' },
        { label: 'Tax Year', key: 'assessment.taxYear', type: 'number' },
      ]
    },
    {
      title: 'Market Information',
      icon: <DollarSign className="w-4 h-4" />,
      fields: [
        { label: 'Last Sale Date', key: 'market.lastSaleDate', type: 'date' },
        { label: 'Last Sale Price', key: 'market.lastSalePrice', type: 'currency' },
        { label: 'Sale Transaction Type', key: 'market.lastSaleTransactionType' },
        { label: 'Prior Sale Date', key: 'market.priorSaleDate', type: 'date' },
        { label: 'Prior Sale Price', key: 'market.priorSalePrice', type: 'currency' },
        { label: 'Estimated Value', key: 'market.estimatedValue', type: 'currency' },
        { label: 'Price per Sq Ft', key: 'market.pricePerSqFt', type: 'currency' },
      ]
    },
    {
      title: 'Ownership',
      icon: <Users className="w-4 h-4" />,
      fields: [
        { label: 'Owner Names', key: 'owner.names', format: (val) => Array.isArray(val) ? val.join(', ') : val },
        { label: 'Ownership Type', key: 'owner.ownershipType' },
        { label: 'Transfer Date', key: 'owner.ownershipTransferDate', type: 'date' },
        { label: 'Mailing Address', key: 'owner.mailingAddress.line1' },
        { label: 'Mailing City', key: 'owner.mailingAddress.locality' },
        { label: 'Mailing State', key: 'owner.mailingAddress.adminArea1' },
      ]
    },
    {
      title: 'Schools',
      icon: <GraduationCap className="w-4 h-4" />,
      fields: [
        { label: 'Elementary School', key: 'schools.elementary.name' },
        { label: 'Elementary District', key: 'schools.elementary.district' },
        { label: 'Middle School', key: 'schools.middle.name' },
        { label: 'Middle District', key: 'schools.middle.district' },
        { label: 'High School', key: 'schools.high.name' },
        { label: 'High District', key: 'schools.high.district' },
      ]
    },
  ];

  const getFullAddress = () => {
    const { street, city, state, zipCode } = addressFields;
    return `${street}, ${city}, ${state} ${zipCode}`.trim();
  };

  const updateAddressField = (field: keyof typeof addressFields, value: string) => {
    setAddressFields(prev => ({ ...prev, [field]: value }));
  };

  const isAddressComplete = () => {
    return addressFields.street.trim() && addressFields.city.trim() &&
           addressFields.state.trim() && addressFields.zipCode.trim();
  };

  const fetchAllData = async () => {
    if (!isAddressComplete()) {
      alert('Please fill in all address fields');
      return;
    }

    setIsLoading(true);
    const responses: Record<string, ApiResponse> = {};

    try {
      const address1 = addressFields.street.trim();
      const address2 = `${addressFields.city}, ${addressFields.state} ${addressFields.zipCode}`.trim();

      if (!address1 || !address2) {
        throw new Error('Please provide a complete address');
      }

      // Test each endpoint
      for (const endpoint of endpoints) {
        try {
          // Force Vercel route
          const proxyBase = '/api/attom';
          const url = `${proxyBase}/test-endpoint`;

          const headers: Record<string, string> = { 'Content-Type': 'application/json' };

          const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              endpoint: endpoint.path,
              address1,
              address2
            })
          });

          if (response.ok) {
            const data = await response.json();
            responses[endpoint.id] = {
              data,
              timestamp: new Date().toISOString()
            };
          } else {
            responses[endpoint.id] = {
              data: null,
              error: `HTTP ${response.status}: ${response.statusText}`,
              timestamp: new Date().toISOString()
            };
          }
        } catch (error) {
          responses[endpoint.id] = {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setApiResponses(responses);

      // Extract and merge data
      const extractedData = [];

      if (responses.basicprofile?.data) {
        extractedData.push({
          data: extractFromBasicProfile(responses.basicprofile.data),
          priority: 1,
          sourceName: 'basicProfile'
        });
      }

      if (responses.expandedprofile?.data) {
        extractedData.push({
          data: extractFromExpandedProfile(responses.expandedprofile.data),
          priority: 2,
          sourceName: 'expandedProfile'
        });
      }

      if (responses.detail?.data) {
        extractedData.push({
          data: extractFromPropertyDetail(responses.detail.data),
          priority: 3,
          sourceName: 'propertyDetail'
        });
      }

      if (responses.sale?.data) {
        extractedData.push({
          data: extractFromSaleDetails(responses.sale.data),
          priority: 2,
          sourceName: 'saleDetails'
        });
      }

      if (extractedData.length > 0) {
        const { merged, sourceMap } = mergeComprehensiveData(...extractedData);
        setMergedData(merged);
        setSourceMap(sourceMap);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && isAddressComplete()) {
      fetchAllData();
    }
  }, [autoFetch, addressFields]);

  const formatValue = (value: any, type?: string, customFormat?: (value: any) => string): string => {
    if (customFormat) return customFormat(value);
    if (value === null || value === undefined || value === '') return 'Not specified';
    
    switch (type) {
      case 'currency':
        return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return value ? new Date(value).toLocaleDateString() : 'Not specified';
      case 'percentage':
        return typeof value === 'number' ? `${value}%` : value;
      default:
        return String(value);
    }
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const getSourceInfo = (fieldKey: string): DataSourceInfo | null => {
    return sourceMap[fieldKey] || null;
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary'; 
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredSections = sectionDefinitions.map(section => ({
    ...section,
    fields: section.fields.filter(field => {
      const value = getNestedValue(mergedData, field.key);
      const sourceInfo = getSourceInfo(field.key);
      const hasValue = !(value === null || value === undefined || value === '');
      
      // Hide fields with no data when not actively filtering/searching
      const noActiveFilters = !searchTerm && filterBySource === 'all' && filterByConfidence === 'all';
      if (!hasValue && !sourceInfo && noActiveFilters) {
        return false;
      }
      
      // Search filter
      if (searchTerm && !field.label.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !String(value).toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Source filter
      if (filterBySource !== 'all' && sourceInfo?.source !== filterBySource) {
        return false;
      }
      
      // Confidence filter
      if (filterByConfidence !== 'all' && sourceInfo?.confidence !== filterByConfidence) {
        return false;
      }
      
      return hasValue || !!sourceInfo;
    })
  })).filter(section => section.fields.length > 0);

  const exportData = (format: 'json' | 'csv' | 'summary') => {
    if (!mergedData) return;
    
    const exported = exportComprehensiveData(mergedData, sourceMap, format);
    const blob = new Blob([exported], { 
      type: format === 'csv' ? 'text/csv' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-data-${getFullAddress().replace(/[^a-zA-Z0-9]/g, '-')}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const report = mergedData ? generateFieldComparisonReport(sourceMap) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Find out more details about a home
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Street Address
                </label>
                <Input
                  value={addressFields.street}
                  onChange={(e) => updateAddressField('street', e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  City
                </label>
                <Input
                  value={addressFields.city}
                  onChange={(e) => updateAddressField('city', e.target.value)}
                  placeholder="Brooklyn"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  State
                </label>
                <Input
                  value={addressFields.state}
                  onChange={(e) => updateAddressField('state', e.target.value)}
                  placeholder="NY"
                  className="w-full"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  ZIP Code
                </label>
                <Input
                  value={addressFields.zipCode}
                  onChange={(e) => updateAddressField('zipCode', e.target.value)}
                  placeholder="11238"
                  className="w-full"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-600 flex-1">
                {isAddressComplete() && (
                  <span>📍 {getFullAddress()}</span>
                )}
              </div>
              <Button
                onClick={fetchAllData}
                disabled={isLoading || !isAddressComplete()}
                className="min-w-24"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Data Status Summary */}
          {report && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{report.populatedFields}</div>
                  <div className="text-sm text-muted-foreground">Fields Populated</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{report.completionPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Completion</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Object.keys(mergedData?.dataSources || {}).filter(key => mergedData?.dataSources?.[key]).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Data Sources</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Object.values(sourceMap).filter(info => info.confidence === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Confidence</div>
                </div>
              </Card>
            </div>
          )}

          {/* Filters and Export */}
          {mergedData && (
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
              
              <select
                value={filterBySource}
                onChange={(e) => setFilterBySource(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Sources</option>
                <option value="basicProfile">Basic Profile</option>
                <option value="expandedProfile">Expanded Profile</option>
                <option value="propertyDetail">Property Detail</option>
                <option value="saleDetails">Sale Details</option>
              </select>
              
              <select
                value={filterByConfidence}
                onChange={(e) => setFilterByConfidence(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Confidence</option>
                <option value="high">High Confidence</option>
                <option value="medium">Medium Confidence</option>
                <option value="low">Low Confidence</option>
              </select>

              <div className="flex gap-1 ml-auto">
                <Button variant="outline" size="sm" onClick={() => exportData('json')}>
                  <Download className="w-3 h-3 mr-1" />
                  JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                  <Download className="w-3 h-3 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportData('summary')}>
                  <Download className="w-3 h-3 mr-1" />
                  Summary
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Summary Table */}
      {mergedData && (
        <div className="space-y-4">
          {filteredSections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                  <Badge variant="outline">{section.fields.length} fields</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Field</th>
                        <th className="text-left p-2 font-medium">Value</th>
                        <th className="text-left p-2 font-medium">Source</th>
                        <th className="text-left p-2 font-medium">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.fields.map((field, fieldIndex) => {
                        const value = getNestedValue(mergedData, field.key);
                        const sourceInfo = getSourceInfo(field.key);
                        const formattedValue = formatValue(value, field.type, field.format);
                        const hasValue = value !== null && value !== undefined && value !== '';

                        return (
                          <tr key={fieldIndex} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{field.label}</td>
                            <td className={`p-2 ${hasValue ? '' : 'text-muted-foreground italic'}`}>
                              {formattedValue}
                            </td>
                            <td className="p-2">
                              {sourceInfo ? (
                                <Badge variant="outline" className="text-xs">
                                  {sourceInfo.source}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">No data</span>
                              )}
                            </td>
                            <td className="p-2">
                              {sourceInfo ? (
                                <Badge variant={getConfidenceBadgeColor(sourceInfo.confidence)} className="text-xs">
                                  {sourceInfo.confidence}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* API Response Status */}
      {Object.keys(apiResponses).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Response Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {endpoints.map(endpoint => {
                const response = apiResponses[endpoint.id];
                const hasData = response?.data && !response.error;
                
                return (
                  <div key={endpoint.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{endpoint.name}</h4>
                      {hasData ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {endpoint.description}
                    </p>
                    {response && (
                      <p className="text-xs">
                        {hasData ? (
                          <span className="text-green-600">Success</span>
                        ) : (
                          <span className="text-red-600">{response.error}</span>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
