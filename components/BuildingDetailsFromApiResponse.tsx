import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Home, 
  Building, 
  Ruler, 
  Calendar,
  Layers,
  Thermometer,
  Zap,
  Droplets,
  Shield,
  Wrench,
  MapPin,
  Info,
  ChevronDown,
  ChevronUp,
  Square,
  Bed,
  Bath,
  Car,
  Trees,
  Flame,
  Wind,
  Snowflake
} from 'lucide-react';

interface BuildingDetailsFromApiResponseProps {
  propertyDetailResponse?: any;
  className?: string;
  showAllDetails?: boolean;
}

interface BuildingInfo {
  // Basic Building Information
  propertyType?: string;
  propertySubType?: string;
  yearBuilt?: number;
  yearBuiltEffective?: number;
  stories?: number;
  units?: number;
  
  // Size Information
  livingAreaSqFt?: number;
  grossAreaSqFt?: number;
  adjustedGrossAreaSqFt?: number;
  basementAreaSqFt?: number;
  garageAreaSqFt?: number;
  
  // Room Information
  bedrooms?: number;
  bathrooms?: number;
  partialBaths?: number;
  fullBaths?: number;
  roomsTotal?: number;
  
  // Construction Details
  constructionType?: string;
  wallType?: string;
  roofType?: string;
  foundationType?: string;
  exteriorWalls?: string;
  
  // Systems and Features
  heating?: string;
  cooling?: string;
  fuel?: string;
  sewer?: string;
  water?: string;
  
  // Condition and Quality
  condition?: string;
  quality?: string;
  
  // Parking and Garage
  garageType?: string;
  parkingSpaces?: number;
  parkingType?: string;
  
  // Additional Features
  fireplace?: boolean;
  fireplaceType?: string;
  pool?: boolean;
  poolType?: string;
  
  // Architectural Details
  architecturalStyle?: string;
  buildingStyle?: string;
  
  // Raw data for debugging
  rawBuildingData?: any;
}

export function BuildingDetailsFromApiResponse({ 
  propertyDetailResponse, 
  className = '',
  showAllDetails = false 
}: BuildingDetailsFromApiResponseProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showRawData, setShowRawData] = useState(false);

  // Extract building information from the API response
  const extractBuildingInfo = (): BuildingInfo => {
    if (!propertyDetailResponse?.data?.property?.[0]?.building) {
      return {};
    }

    const building = propertyDetailResponse.data.property[0].building;
    const summary = building.summary || {};
    const size = building.size || {};
    const rooms = building.rooms || {};
    const construction = building.construction || {};
    const interior = building.interior || {};
    const parking = building.parking || {};

    return {
      // Basic Information
      propertyType: summary.propType,
      propertySubType: summary.propSubType,
      yearBuilt: summary.yearBuilt,
      yearBuiltEffective: summary.yearBuiltEffective,
      stories: summary.stories,
      units: summary.units,
      
      // Size Information
      livingAreaSqFt: size.livingAreaSqFt,
      grossAreaSqFt: size.grossAreaSqFt,
      adjustedGrossAreaSqFt: size.adjustedGrossAreaSqFt,
      basementAreaSqFt: size.basementAreaSqFt,
      garageAreaSqFt: size.garageAreaSqFt,
      
      // Room Information
      bedrooms: rooms.bedsCount,
      bathrooms: rooms.bathsTotal,
      partialBaths: rooms.bathsPartial,
      fullBaths: rooms.bathsFull,
      roomsTotal: rooms.roomsTotal,
      
      // Construction Details
      constructionType: construction.constructionType,
      wallType: construction.wallType,
      roofType: construction.roofType,
      foundationType: construction.foundationType,
      exteriorWalls: construction.exteriorWalls,
      
      // Systems and Features
      heating: interior.heating,
      cooling: interior.cooling,
      fuel: interior.fuel,
      sewer: interior.sewer,
      water: interior.water,
      
      // Condition and Quality
      condition: summary.condition,
      quality: summary.quality,
      
      // Parking and Garage
      garageType: parking.garageType,
      parkingSpaces: parking.prkgSpaces,
      parkingType: parking.prkgType,
      
      // Additional Features
      fireplace: interior.fireplaceInd === 'Y',
      fireplaceType: interior.fireplaceType,
      pool: interior.poolInd === 'Y',
      poolType: interior.poolType,
      
      // Architectural Details
      architecturalStyle: summary.archStyle,
      buildingStyle: summary.bldgStyle,
      
      // Raw data for debugging
      rawBuildingData: building
    };
  };

  const buildingInfo = extractBuildingInfo();

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Not specified';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  const formatSquareFootage = (sqft: number | undefined): string => {
    if (!sqft) return 'Not specified';
    return `${sqft.toLocaleString()} sq ft`;
  };

  const renderInfoItem = (icon: React.ReactNode, label: string, value: any, suffix?: string) => {
    const formattedValue = formatValue(value);
    if (formattedValue === 'Not specified') return null;

    return (
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-sm text-muted-foreground">
            {formattedValue}{suffix ? ` ${suffix}` : ''}
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: React.ReactNode[],
    sectionKey: string,
    defaultExpanded = false
  ) => {
    const validItems = items.filter(item => item !== null);
    if (validItems.length === 0) return null;

    const isExpanded = expandedSections.has(sectionKey) || defaultExpanded || showAllDetails;

    return (
      <Card className="overflow-hidden">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection(sectionKey)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              {title}
              <Badge variant="outline">{validItems.length}</Badge>
            </div>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {validItems}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  // Check if we have building data
  if (!propertyDetailResponse?.data?.property?.[0]?.building) {
    return (
      <div className={className}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No building details found in the property detail API response. Make sure the property detail endpoint has been called and returned building information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Basic Information Items
  const basicInfoItems = [
    renderInfoItem(<Home className="w-4 h-4" />, "Property Type", buildingInfo.propertyType),
    renderInfoItem(<Building className="w-4 h-4" />, "Property Sub-Type", buildingInfo.propertySubType),
    renderInfoItem(<Calendar className="w-4 h-4" />, "Year Built", buildingInfo.yearBuilt),
    renderInfoItem(<Calendar className="w-4 h-4" />, "Effective Year Built", buildingInfo.yearBuiltEffective),
    renderInfoItem(<Layers className="w-4 h-4" />, "Stories", buildingInfo.stories),
    renderInfoItem(<Building className="w-4 h-4" />, "Units", buildingInfo.units),
    renderInfoItem(<Building className="w-4 h-4" />, "Condition", buildingInfo.condition),
    renderInfoItem(<Building className="w-4 h-4" />, "Quality", buildingInfo.quality),
  ];

  // Size Information Items
  const sizeInfoItems = [
    renderInfoItem(<Square className="w-4 h-4" />, "Living Area", formatSquareFootage(buildingInfo.livingAreaSqFt)),
    renderInfoItem(<Square className="w-4 h-4" />, "Gross Area", formatSquareFootage(buildingInfo.grossAreaSqFt)),
    renderInfoItem(<Square className="w-4 h-4" />, "Adjusted Gross Area", formatSquareFootage(buildingInfo.adjustedGrossAreaSqFt)),
    renderInfoItem(<Square className="w-4 h-4" />, "Basement Area", formatSquareFootage(buildingInfo.basementAreaSqFt)),
    renderInfoItem(<Car className="w-4 h-4" />, "Garage Area", formatSquareFootage(buildingInfo.garageAreaSqFt)),
  ];

  // Room Information Items
  const roomInfoItems = [
    renderInfoItem(<Bed className="w-4 h-4" />, "Bedrooms", buildingInfo.bedrooms),
    renderInfoItem(<Bath className="w-4 h-4" />, "Total Bathrooms", buildingInfo.bathrooms),
    renderInfoItem(<Bath className="w-4 h-4" />, "Full Bathrooms", buildingInfo.fullBaths),
    renderInfoItem(<Bath className="w-4 h-4" />, "Partial Bathrooms", buildingInfo.partialBaths),
    renderInfoItem(<Home className="w-4 h-4" />, "Total Rooms", buildingInfo.roomsTotal),
  ];

  // Construction Details Items
  const constructionItems = [
    renderInfoItem(<Building className="w-4 h-4" />, "Construction Type", buildingInfo.constructionType),
    renderInfoItem(<Building className="w-4 h-4" />, "Wall Type", buildingInfo.wallType),
    renderInfoItem(<Building className="w-4 h-4" />, "Roof Type", buildingInfo.roofType),
    renderInfoItem(<Building className="w-4 h-4" />, "Foundation Type", buildingInfo.foundationType),
    renderInfoItem(<Building className="w-4 h-4" />, "Exterior Walls", buildingInfo.exteriorWalls),
    renderInfoItem(<Building className="w-4 h-4" />, "Architectural Style", buildingInfo.architecturalStyle),
    renderInfoItem(<Building className="w-4 h-4" />, "Building Style", buildingInfo.buildingStyle),
  ];

  // Systems and Features Items
  const systemsItems = [
    renderInfoItem(<Thermometer className="w-4 h-4" />, "Heating", buildingInfo.heating),
    renderInfoItem(<Snowflake className="w-4 h-4" />, "Cooling", buildingInfo.cooling),
    renderInfoItem(<Flame className="w-4 h-4" />, "Fuel Type", buildingInfo.fuel),
    renderInfoItem(<Droplets className="w-4 h-4" />, "Sewer", buildingInfo.sewer),
    renderInfoItem(<Droplets className="w-4 h-4" />, "Water", buildingInfo.water),
  ];

  // Parking and Additional Features Items
  const featuresItems = [
    renderInfoItem(<Car className="w-4 h-4" />, "Garage Type", buildingInfo.garageType),
    renderInfoItem(<Car className="w-4 h-4" />, "Parking Spaces", buildingInfo.parkingSpaces),
    renderInfoItem(<Car className="w-4 h-4" />, "Parking Type", buildingInfo.parkingType),
    renderInfoItem(<Flame className="w-4 h-4" />, "Fireplace", buildingInfo.fireplace),
    renderInfoItem(<Flame className="w-4 h-4" />, "Fireplace Type", buildingInfo.fireplaceType),
    renderInfoItem(<Droplets className="w-4 h-4" />, "Pool", buildingInfo.pool),
    renderInfoItem(<Droplets className="w-4 h-4" />, "Pool Type", buildingInfo.poolType),
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Building Details from API Response</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRawData(!showRawData)}
          >
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (expandedSections.size > 0) {
                setExpandedSections(new Set());
              } else {
                setExpandedSections(new Set(['basic', 'size', 'rooms', 'construction', 'systems', 'features']));
              }
            }}
          >
            {expandedSections.size > 0 ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {buildingInfo.yearBuilt || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Year Built</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatSquareFootage(buildingInfo.livingAreaSqFt)}
              </div>
              <div className="text-sm text-muted-foreground">Living Area</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {buildingInfo.bedrooms || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Bedrooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {buildingInfo.bathrooms || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Bathrooms</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Sections */}
      <div className="space-y-4">
        {renderSection("Basic Information", <Info className="w-4 h-4" />, basicInfoItems, "basic", true)}
        {renderSection("Size Details", <Ruler className="w-4 h-4" />, sizeInfoItems, "size")}
        {renderSection("Room Details", <Home className="w-4 h-4" />, roomInfoItems, "rooms")}
        {renderSection("Construction Details", <Building className="w-4 h-4" />, constructionItems, "construction")}
        {renderSection("Systems & Utilities", <Zap className="w-4 h-4" />, systemsItems, "systems")}
        {renderSection("Features & Amenities", <Shield className="w-4 h-4" />, featuresItems, "features")}
      </div>

      {/* Raw Data Display */}
      {showRawData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Raw Building Data from API Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(buildingInfo.rawBuildingData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Data Source Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Building details extracted from ATTOM property detail API response. Data includes construction information, room details, systems, and architectural features parsed from the building object in the API response.
        </AlertDescription>
      </Alert>
    </div>
  );
}