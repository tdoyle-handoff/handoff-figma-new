import { Fragment } from 'react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ArrowLeftRight,
  Copy,
  Search,
  Database,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  User,
  Building,
  Ruler,
  Hash,
  FileText,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// ATTOM API endpoints
const ATTOM_ENDPOINTS = [
  { id: 'basicprofile', name: 'Basic Profile', description: 'Core property information, address, basic characteristics' },
  { id: 'detail', name: 'Property Detail', description: 'Detailed building information, construction details, interior features' },
  { id: 'saledetail', name: 'Sale Detail', description: 'Sale history, transaction information, pricing data' },
  { id: 'expandedprofile', name: 'Expanded Profile', description: 'Comprehensive data including all basic, detail, and sale information' }
];

// All suggested paths organized by endpoint
const getAllPathSuggestions = () => {
  const basePaths = [
    'property[0].identifier.id',
    'property[0].identifier.fips',
    'property[0].identifier.apn',
    'property[0].address.country',
    'property[0].address.countrySubd',
    'property[0].address.line1',
    'property[0].address.line2',
    'property[0].address.locality',
    'property[0].address.oneLine',
    'property[0].address.postal1',
    'property[0].address.postal2',
    'property[0].location.latitude',
    'property[0].location.longitude',
    'property[0].location.accuracy',
    'property[0].summary.propclass',
    'property[0].summary.proptype',
    'property[0].summary.yearbuilt',
    'property[0].summary.propLandUse',
    'property[0].area.areaSqFt',
    'property[0].area.bedrooms',
    'property[0].area.bathrooms',
    'property[0].area.bathroomsFull',
    'property[0].area.bathroomsPartial',
    'property[0].area.roomsTotal',
    'property[0].lot.situsCounty',
    'property[0].lot.subdname',
    'property[0].lot.lotsize1',
    'property[0].lot.lotsize2',
    'property[0].lot.pooltype',
    'property[0].vintage.lastModified',
    'property[0].vintage.pubDate'
  ];

  const detailPaths = [
    ...basePaths,
    'property[0].building.construction.style',
    'property[0].building.construction.condition',
    'property[0].building.construction.exteriorWalls',
    'property[0].building.construction.roofCover',
    'property[0].building.construction.quality',
    'property[0].building.construction.foundationMaterial',
    'property[0].building.construction.constructionType',
    'property[0].building.construction.roofFrame',
    'property[0].building.interior.heating',
    'property[0].building.interior.fuel',
    'property[0].building.interior.fplctype',
    'property[0].building.parking.garagetype',
    'property[0].building.parking.prkgSize',
    'property[0].building.parking.prkgType',
    'property[0].building.size.livingSize',
    'property[0].building.size.universalSize',
    'property[0].building.size.grossSizeGeneral',
    'property[0].building.size.grossSizeAdjusted',
    'property[0].building.size.sizeInd',
    'property[0].building.summary.levels',
    'property[0].building.summary.story',
    'property[0].building.summary.yearBuilt',
    'property[0].building.summary.archStyle',
    'property[0].building.summary.noOfBeds',
    'property[0].building.summary.noOfBaths',
    'property[0].building.summary.noOfPartialBaths',
    'property[0].building.summary.noOfRooms',
    'property[0].building.summary.proptype',
    'property[0].building.summary.unitsCount',
    'property[0].building.summary.yearBuiltEffective'
  ];

  const salePaths = [
    ...basePaths,
    'property[0].sale.amount.saleAmt',
    'property[0].sale.amount.saleAmtCurr',
    'property[0].sale.calculation.pricePerSizeUnit',
    'property[0].sale.calculation.saleAmtCurr',
    'property[0].sale.transaction.saleTransDate',
    'property[0].sale.transaction.contractDate',
    'property[0].sale.transaction.saleRecDate',
    'property[0].sale.transaction.saleSearchDate',
    'property[0].sale.salesHistory[0].amount.saleAmt',
    'property[0].sale.salesHistory[0].amount.saleAmtRounded',
    'property[0].sale.salesHistory[0].calculation.pricePerSizeUnit',
    'property[0].sale.salesHistory[0].salesSearchDate',
    'property[0].sale.salesHistory[0].saleTransDate'
  ];

  const expandedPaths = [
    ...detailPaths,
    ...salePaths,
    'property[0].assessment.assessor.assdValue',
    'property[0].assessment.assessor.mktValue',
    'property[0].assessment.assessor.taxYear',
    'property[0].assessment.assessor.apn',
    'property[0].assessment.market.apprCurr',
    'property[0].assessment.market.apprPrev',
    'property[0].assessment.market.apprYear',
    'property[0].assessment.market.taxYear',
    'property[0].assessment.appraised.apprisedTtl',
    'property[0].assessment.appraised.apprisedVal',
    'property[0].assessment.appraised.assdTtl',
    'property[0].assessment.appraised.assdVal',
    'property[0].assessment.appraised.mktTtl',
    'property[0].assessment.appraised.mktVal',
    'property[0].assessment.appraised.taxYear',
    'property[0].assessment.tax.taxAmt',
    'property[0].assessment.tax.taxPerSizeUnit',
    'property[0].assessment.tax.taxRate',
    'property[0].assessment.tax.taxYear',
    'property[0].assessment.tax.exemptflag',
    'property[0].owner.owner1Full',
    'property[0].owner.owner2Full',
    'property[0].owner.owner3Full',
    'property[0].owner.owner4Full',
    'property[0].owner.corporateIndicator',
    'property[0].owner.lastName',
    'property[0].owner.firstName',
    'property[0].owner.middleName',
    'property[0].owner.mailingAddress.oneLine',
    'property[0].owner.mailingAddress.line1',
    'property[0].owner.mailingAddress.line2',
    'property[0].owner.mailingAddress.locality',
    'property[0].owner.mailingAddress.countrySubd',
    'property[0].owner.mailingAddress.country',
    'property[0].owner.mailingAddress.postal1',
    'property[0].owner.mailingAddress.postal2'
  ];

  return {
    basicprofile: {
      paths: basePaths,
      total: basePaths.length,
      categories: ['Identifier', 'Address', 'Location', 'Property Summary', 'Area & Rooms', 'Lot Information', 'Data Information']
    },
    detail: {
      paths: detailPaths,
      total: detailPaths.length,
      categories: ['All Basic Profile', 'Building Construction', 'Building Interior', 'Building Parking', 'Building Size', 'Building Summary']
    },
    saledetail: {
      paths: salePaths,
      total: salePaths.length,
      categories: ['All Basic Profile', 'Sale Information', 'Sale History', 'Sale Calculations']
    },
    expandedprofile: {
      paths: expandedPaths,
      total: expandedPaths.length,
      categories: ['All Detail & Sale Profile', 'Assessment Values', 'Tax Information', 'Owner Information', 'Owner Mailing Address']
    }
  };
};

// Path categorization for better organization
const categorizePath = (path: string) => {
  if (path.includes('identifier')) return { category: 'Identifier', icon: Hash, color: 'blue' };
  if (path.includes('address') && !path.includes('mailing')) return { category: 'Address', icon: MapPin, color: 'green' };
  if (path.includes('location')) return { category: 'Location', icon: MapPin, color: 'teal' };
  if (path.includes('summary')) return { category: 'Property Summary', icon: Home, color: 'orange' };
  if (path.includes('area')) return { category: 'Area & Rooms', icon: Ruler, color: 'purple' };
  if (path.includes('lot')) return { category: 'Lot Information', icon: Home, color: 'indigo' };
  if (path.includes('building.construction')) return { category: 'Building Construction', icon: Building, color: 'red' };
  if (path.includes('building.interior')) return { category: 'Building Interior', icon: Home, color: 'pink' };
  if (path.includes('building.parking')) return { category: 'Building Parking', icon: Home, color: 'yellow' };
  if (path.includes('building.size')) return { category: 'Building Size', icon: Ruler, color: 'cyan' };
  if (path.includes('building.summary')) return { category: 'Building Summary', icon: Building, color: 'lime' };
  if (path.includes('sale')) return { category: 'Sale Information', icon: DollarSign, color: 'emerald' };
  if (path.includes('assessment') && !path.includes('tax')) return { category: 'Assessment Values', icon: DollarSign, color: 'amber' };
  if (path.includes('tax')) return { category: 'Tax Information', icon: FileText, color: 'rose' };
  if (path.includes('owner') && !path.includes('mailing')) return { category: 'Owner Information', icon: User, color: 'violet' };
  if (path.includes('mailingAddress')) return { category: 'Owner Mailing Address', icon: MapPin, color: 'fuchsia' };
  if (path.includes('vintage')) return { category: 'Data Information', icon: Calendar, color: 'slate' };
  return { category: 'Other', icon: FileText, color: 'gray' };
};

export function AttomApiPathReference() {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedEndpoints, setExpandedEndpoints] = useState<string[]>(['basicprofile']);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const allPathData = getAllPathSuggestions();

  // Filter paths based on search, endpoint, and category
  const getFilteredPaths = () => {
    let paths: string[] = [];
    
    if (selectedEndpoint) {
      paths = allPathData[selectedEndpoint as keyof typeof allPathData]?.paths || [];
    } else {
      // Show all unique paths from all endpoints
      const allPaths = new Set<string>();
      Object.values(allPathData).forEach(endpoint => {
        endpoint.paths.forEach(path => allPaths.add(path));
      });
      paths = Array.from(allPaths).sort();
    }

    // Apply search filter
    if (searchFilter) {
      paths = paths.filter(path => 
        path.toLowerCase().includes(searchFilter.toLowerCase()) ||
        categorizePath(path).category.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      paths = paths.filter(path => categorizePath(path).category === selectedCategory);
    }

    return paths;
  };

  const filteredPaths = getFilteredPaths();

  // Group paths by category
  const pathsByCategory = filteredPaths.reduce((acc, path) => {
    const { category } = categorizePath(path);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(path);
    return acc;
  }, {} as Record<string, string[]>);

  // Get all unique categories
  const allCategories = Array.from(new Set(
    Object.values(allPathData)
      .flatMap(endpoint => endpoint.paths)
      .map(path => categorizePath(path).category)
  )).sort();

  // Copy path to clipboard
  const copyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (error) {
      console.error('Failed to copy path:', error);
    }
  };

  // Toggle endpoint expansion
  const toggleEndpointExpansion = (endpointId: string) => {
    setExpandedEndpoints(prev => 
      prev.includes(endpointId) 
        ? prev.filter(id => id !== endpointId)
        : [...prev, endpointId]
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              ATTOM API Path Reference Guide
            </h1>
            <p className="text-muted-foreground">
              Complete reference of all available data paths for ATTOM API endpoints
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ATTOM_ENDPOINTS.map(endpoint => {
            const endpointData = allPathData[endpoint.id as keyof typeof allPathData];
            return (
              <Card key={endpoint.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowLeftRight className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">{endpoint.name}</h3>
                  </div>
                  <p className="text-2xl font-semibold text-primary">{endpointData.total}</p>
                  <p className="text-sm text-muted-foreground">Available paths</p>
                  <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Search & Filter Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Search Paths</Label>
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by path or category..."
                />
              </div>
              <div>
                <Label>Filter by Endpoint</Label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="w-full h-10 px-3 text-sm border rounded-md"
                >
                  <option value="">All endpoints</option>
                  {ATTOM_ENDPOINTS.map(endpoint => (
                    <option key={endpoint.id} value={endpoint.id}>
                      {endpoint.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Filter by Category</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 text-sm border rounded-md"
                >
                  <option value="">All categories</option>
                  {allCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPaths.length} paths
                {selectedEndpoint && ` from ${ATTOM_ENDPOINTS.find(e => e.id === selectedEndpoint)?.name}`}
                {selectedCategory && ` in ${selectedCategory} category`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoint Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ATTOM_ENDPOINTS.map(endpoint => {
                const isExpanded = expandedEndpoints.includes(endpoint.id);
                const endpointData = allPathData[endpoint.id as keyof typeof allPathData];
                
                return (
                  <div key={endpoint.id} className="border rounded-lg">
                    <div 
                      className="p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleEndpointExpansion(endpoint.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <h3 className="font-medium">{endpoint.name}</h3>
                        </div>
                        <Badge variant="outline">
                          {endpointData.total} paths
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground text-right max-w-md">
                        {endpoint.description}
                      </p>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {endpointData.categories.map(category => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          Click a category above to filter paths by that category, or expand the sections below to see all paths.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Paths by Category */}
        <div className="space-y-4">
          {Object.entries(pathsByCategory).map(([category, paths]) => {
            const { icon: IconComponent, color } = categorizePath(paths[0]);
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    {category}
                    <Badge variant="outline">
                      {paths.length} paths
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                    {paths.map((path, index) => (
                      <div 
                        key={`${category}-${index}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <code className="text-sm font-mono text-muted-foreground flex-1 mr-3">
                          {path}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyPath(path)}
                          className="flex items-center gap-1 shrink-0"
                        >
                          {copiedPath === path ? (
                            <Fragment>
                              <Check className="w-3 h-3" />
                              Copied
                            </Fragment>
                          ) : (
                            <Fragment>
                              <Copy className="w-3 h-3" />
                              Copy
                            </Fragment>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use These Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Path Structure Explanation</h4>
                <p className="text-muted-foreground mb-2">
                  All paths follow the pattern: <code className="bg-muted px-1 rounded">property[0].section.field</code>
                </p>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li><code>property[0]</code> - Refers to the first property in the API response array</li>
                  <li><code>section</code> - The main data category (address, building, sale, etc.)</li>
                  <li><code>field</code> - The specific data field within that section</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Using in Property Field Mapping Manager</h4>
                <ol className="text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Navigate to the Property Field Mapping Manager (<code>?mapping-manager=true</code>)</li>
                  <li>Click "Create Mapping" for any property field you want to map</li>
                  <li>Select the appropriate ATTOM API endpoint from the dropdown</li>
                  <li>Copy a path from this reference and paste it into the "Source Path" field</li>
                  <li>Set the appropriate data type and save your mapping</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">Endpoint Selection Guide</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="border rounded p-3">
                    <h5 className="font-medium text-green-600">Basic Profile</h5>
                    <p className="text-xs text-muted-foreground">Use for: Address, basic property info, area/rooms, lot information</p>
                  </div>
                  <div className="border rounded p-3">
                    <h5 className="font-medium text-blue-600">Property Detail</h5>
                    <p className="text-xs text-muted-foreground">Use for: Building construction, interior features, parking, detailed sizing</p>
                  </div>
                  <div className="border rounded p-3">
                    <h5 className="font-medium text-purple-600">Sale Detail</h5>
                    <p className="text-xs text-muted-foreground">Use for: Sale prices, transaction dates, price calculations, sale history</p>
                  </div>
                  <div className="border rounded p-3">
                    <h5 className="font-medium text-orange-600">Expanded Profile</h5>
                    <p className="text-xs text-muted-foreground">Use for: Assessment values, tax info, owner details, comprehensive data</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Path Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-blue-600">
                  {Object.values(allPathData).reduce((sum, endpoint) => sum + endpoint.total, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Unique Paths</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-green-600">{allCategories.length}</p>
                <p className="text-sm text-muted-foreground">Data Categories</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-purple-600">{ATTOM_ENDPOINTS.length}</p>
                <p className="text-sm text-muted-foreground">API Endpoints</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-orange-600">{filteredPaths.length}</p>
                <p className="text-sm text-muted-foreground">Filtered Results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}