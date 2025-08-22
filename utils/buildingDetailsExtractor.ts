/**
 * Utility functions for extracting building details from ATTOM API responses
 */

export interface ExtractedBuildingDetails {
  // Basic Information
  propertyType?: string;
  propertySubType?: string;
  propertyClass?: string;
  standardUse?: string;
  yearBuilt?: number;
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
  
  // Source and metadata
  dataSource?: string;
  extractedAt?: string;
  apiEndpoint?: string;
}

/**
 * Extract building details from ATTOM property detail API response
 */
export function extractBuildingDetailsFromPropertyDetail(response: any): ExtractedBuildingDetails {
  if (!response?.data?.property?.[0]?.building) {
    return {
      dataSource: 'property-detail-api',
      extractedAt: new Date().toISOString(),
      apiEndpoint: 'property/detail'
    };
  }

  const building = response.data.property[0].building;
  const summary = building.summary || {};
  const size = building.size || {};
  const rooms = building.rooms || {};
  const construction = building.construction || {};
  const interior = building.interior || {};
  const parking = building.parking || {};

  return {
    // Basic Information
    propertyType: summary.propertyType,
    propertySubType: summary.propSubType,
    propertyClass: summary.propClass,
    standardUse: summary.propLandUse,
    yearBuilt: summary.yearBuilt,
    stories: summary.levels,
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
    
    // Source and metadata
    dataSource: 'property-detail-api',
    extractedAt: new Date().toISOString(),
    apiEndpoint: 'property/detail'
  };
}

/**
 * Extract building details from ATTOM basic profile API response
 */
export function extractBuildingDetailsFromBasicProfile(response: any): ExtractedBuildingDetails {
  if (!response?.data?.property?.[0]?.building) {
    return {
      dataSource: 'basic-profile-api',
      extractedAt: new Date().toISOString(),
      apiEndpoint: 'property/basicprofile'
    };
  }

  const building = response.data.property[0].building;
  const summary = building.summary || {};
  const size = building.size || {};
  const rooms = building.rooms || {};

  return {
    // Basic Information
    propertyType: summary.propertyType,
    propertySubType: summary.propSubType,
    propertyClass: summary.propClass,
    standardUse: summary.propLandUse,
    yearBuilt: summary.yearBuilt,
    stories: summary.levels,
    
    // Size Information
    livingAreaSqFt: size.livingAreaSqFt,
    
    // Room Information
    bedrooms: rooms.bedsCount,
    bathrooms: rooms.bathsTotal,
    roomsTotal: rooms.roomsTotal,
    
    // Source and metadata
    dataSource: 'basic-profile-api',
    extractedAt: new Date().toISOString(),
    apiEndpoint: 'property/basicprofile'
  };
}

/**
 * Extract building details from ATTOM expanded profile API response
 */
export function extractBuildingDetailsFromExpandedProfile(response: any): ExtractedBuildingDetails {
  if (!response?.data?.property?.[0]?.building) {
    return {
      dataSource: 'expanded-profile-api',
      extractedAt: new Date().toISOString(),
      apiEndpoint: 'property/expandedprofile'
    };
  }

  const building = response.data.property[0].building;
  
  // Expanded profile typically contains all the same fields as property detail
  return {
    ...extractBuildingDetailsFromPropertyDetail(response),
    dataSource: 'expanded-profile-api',
    apiEndpoint: 'property/expandedprofile'
  };
}

/**
 * Auto-detect the API response type and extract building details accordingly
 */
export function extractBuildingDetailsFromAnyResponse(response: any): ExtractedBuildingDetails {
  // Try to determine the endpoint from the response structure or URL
  const url = response?.url || response?.config?.url || '';
  
  if (url.includes('detail')) {
    return extractBuildingDetailsFromPropertyDetail(response);
  } else if (url.includes('expandedprofile')) {
    return extractBuildingDetailsFromExpandedProfile(response);
  } else if (url.includes('basicprofile')) {
    return extractBuildingDetailsFromBasicProfile(response);
  } else {
    // Default to property detail extraction (most comprehensive)
    return extractBuildingDetailsFromPropertyDetail(response);
  }
}

/**
 * Merge building details from multiple API responses
 */
export function mergeBuildingDetails(...details: ExtractedBuildingDetails[]): ExtractedBuildingDetails {
  const merged: ExtractedBuildingDetails = {
    dataSource: 'merged-sources',
    extractedAt: new Date().toISOString(),
    apiEndpoint: 'multiple-endpoints'
  };

  // Merge all details, with later sources taking precedence for non-null values
  details.forEach(detail => {
    Object.entries(detail).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        (merged as any)[key] = value;
      }
    });
  });

  // Create a combined data source list
  const sources = details
    .map(d => d.dataSource)
    .filter(s => s && s !== 'merged-sources')
    .filter((s, i, arr) => arr.indexOf(s) === i); // Remove duplicates
  
  merged.dataSource = sources.join(', ');

  return merged;
}

/**
 * Get a human-readable summary of building details
 */
export function getBuildingSummary(details: ExtractedBuildingDetails): string {
  const parts: string[] = [];

  if (details.yearBuilt) {
    parts.push(`Built in ${details.yearBuilt}`);
  }

  if (details.livingAreaSqFt) {
    parts.push(`${details.livingAreaSqFt.toLocaleString()} sq ft`);
  }

  if (details.bedrooms || details.bathrooms) {
    const bed = details.bedrooms ? `${details.bedrooms} bed` : '';
    const bath = details.bathrooms ? `${details.bathrooms} bath` : '';
    const bedBath = [bed, bath].filter(Boolean).join(', ');
    if (bedBath) {
      parts.push(bedBath);
    }
  }

  if (details.stories && details.stories > 1) {
    parts.push(`${details.stories} stories`);
  }

  if (details.propertyType) {
    parts.push(details.propertyType.toLowerCase());
  }

  return parts.join(' • ') || 'Property details not available';
}

/**
 * Format building details for display
 */
export function formatBuildingDetail(key: keyof ExtractedBuildingDetails, value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'Not specified';
  }

  switch (key) {
    case 'livingAreaSqFt':
    case 'grossAreaSqFt':
    case 'adjustedGrossAreaSqFt':
    case 'basementAreaSqFt':
    case 'garageAreaSqFt':
      return `${value.toLocaleString()} sq ft`;
    
    case 'fireplace':
    case 'pool':
      return value ? 'Yes' : 'No';
    
    case 'yearBuilt':
    case 'stories':
    case 'units':
    case 'bedrooms':
    case 'bathrooms':
    case 'partialBaths':
    case 'fullBaths':
    case 'roomsTotal':
    case 'parkingSpaces':
      return value.toLocaleString();
    
    default:
      return String(value);
  }
}

/**
 * Validate if building details are complete
 */
export function validateBuildingDetails(details: ExtractedBuildingDetails): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} {
  const requiredFields = [
    'propertyType',
    'yearBuilt',
    'livingAreaSqFt',
    'bedrooms',
    'bathrooms'
  ];

  const optionalFields = [
    'propertySubType',
    'propertyClass',
    'standardUse',
    'stories',
    'constructionType',
    'heating',
    'cooling',
    'garageType'
  ];

  const allFields = [...requiredFields, ...optionalFields];
  
  const missingRequired = requiredFields.filter(field => 
    !details[field as keyof ExtractedBuildingDetails]
  );
  
  const presentFields = allFields.filter(field => 
    details[field as keyof ExtractedBuildingDetails]
  );

  return {
    isComplete: missingRequired.length === 0,
    missingFields: missingRequired,
    completionPercentage: Math.round((presentFields.length / allFields.length) * 100)
  };
}