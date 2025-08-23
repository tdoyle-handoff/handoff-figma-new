/**
 * Comprehensive utility for extracting and merging data from all ATTOM API endpoints
 */

export interface ComprehensivePropertyData {
  // Basic Property Information
  propertyId?: string;
  apn?: string;
  fips?: string;
  
  // Address Information
  address?: {
    line1?: string;
    line2?: string;
    locality?: string;
    adminArea1?: string;
    adminArea2?: string;
    postalCode?: string;
    countryCode?: string;
    formatted?: string;
  };
  
  // Geographic Information
  location?: {
    latitude?: number;
    longitude?: number;
    geoId?: string;
    censusTract?: string;
    censusBlock?: string;
  };
  
  // Property Characteristics
  lot?: {
    lotSizeAcres?: number;
    lotSizeSqFt?: number;
    frontFootage?: number;
    depth?: number;
    topography?: string;
    waterfront?: boolean;
    waterBody?: string;
  };
  
  // Building Details
  building?: {
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
  };
  
  // Assessment Information
  assessment?: {
    assessedYear?: number;
    assessedValue?: number;
    marketValue?: number;
    taxValue?: number;
    landValue?: number;
    improvementValue?: number;
    totalValue?: number;
    exemptions?: number;
    taxAmount?: number;
    taxYear?: number;
    millRate?: number;
  };
  
  // Market Information
  market?: {
    lastSaleDate?: string;
    lastSalePrice?: number;
    lastSaleTransactionType?: string;
    priorSaleDate?: string;
    priorSalePrice?: number;
    estimatedValue?: number;
    estimatedValueDate?: string;
    pricePerSqFt?: number;
    marketTrends?: any;
  };
  
  // Ownership Information
  owner?: {
    names?: string[];
    mailingAddress?: {
      line1?: string;
      line2?: string;
      locality?: string;
      adminArea1?: string;
      postalCode?: string;
    };
    ownershipType?: string;
    ownershipTransferDate?: string;
  };
  
  // Legal Description
  legal?: {
    legalDescription?: string;
    subdivision?: string;
    block?: string;
    lot?: string;
    section?: string;
    township?: string;
    range?: string;
  };
  
  // Utilities and Services
  utilities?: {
    electricity?: string;
    gas?: string;
    water?: string;
    sewer?: string;
    internet?: string;
    cable?: string;
  };
  
  // Zoning and Land Use
  zoning?: {
    zoning?: string;
    zoningDescription?: string;
    landUse?: string;
    landUseDescription?: string;
    restrictions?: string[];
  };
  
  // Environmental Information
  environmental?: {
    floodZone?: string;
    floodRisk?: string;
    earthquakeRisk?: string;
    fireRisk?: string;
    environmentalHazards?: string[];
  };
  
  // School Information
  schools?: {
    elementary?: {
      name?: string;
      district?: string;
      rating?: number;
    };
    middle?: {
      name?: string;
      district?: string;
      rating?: number;
    };
    high?: {
      name?: string;
      district?: string;
      rating?: number;
    };
  };
  
  // Data Sources and Metadata
  dataSources?: {
    basicProfile?: boolean;
    expandedProfile?: boolean;
    propertyDetail?: boolean;
    saleDetails?: boolean;
    expandedSaleDetails?: boolean;
  };
  
  lastUpdated?: string;
  dataCompleteness?: number;
}

export interface DataSourceInfo {
  field: string;
  value: any;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  lastUpdated?: string;
}

/**
 * Extract data from Basic Profile API response
 */
export function extractFromBasicProfile(response: any): Partial<ComprehensivePropertyData> {
  const root = response?.data ?? response;
  const property = root?.property?.[0];
  if (!property) return {};
  const identifier = property.identifier || {};
  const address = property.address || {};
  const location = property.location || {};
  const summary = property.summary || {};
  const building = property.building || {};
  const buildingSummary = building.summary || {};
  const buildingSize = building.size || {};
  const buildingRooms = building.rooms || {};
  const lot = property.lot || {};
  const assessment = property.assessment || {};
  const market = property.market || {};
  
  return {
    propertyId: identifier.obPropId || identifier.attomId,
    apn: identifier.apn,
    fips: identifier.fips,
    
    address: {
      line1: address.line1,
      line2: address.line2,
      locality: address.locality,
      adminArea1: address.adminArea1,
      adminArea2: address.adminArea2,
      postalCode: address.postalCode,
      countryCode: address.countryCode,
    },
    
    location: {
      latitude: typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude,
      longitude: typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude,
      geoId: location.geoId,
    },
    
    lot: {
      lotSizeAcres: lot.lotSizeAcres,
      lotSizeSqFt: lot.lotSizeSqFt,
    },
    
    building: {
      propertyType: buildingSummary.propertyType,
      propertySubType: buildingSummary.propSubType,
      propertyClass: buildingSummary.propClass,
      standardUse: buildingSummary.propLandUse,
      yearBuilt: buildingSummary.yearBuilt,
      stories: buildingSummary.levels,
      livingAreaSqFt: buildingSize.livingAreaSqFt ?? buildingSize.livingSize,
      bedrooms: buildingRooms.bedsCount ?? buildingRooms.beds,
      bathrooms: buildingRooms.bathsTotal,
      roomsTotal: buildingRooms.roomsTotal,
    },
    
    assessment: {
      assessedYear: assessment.assessed?.assdYear,
      assessedValue: assessment.assessed?.assdTtlValue,
      marketValue: assessment.market?.mktTtlValue,
      taxValue: assessment.tax?.taxAmt,
      taxYear: assessment.tax?.taxYear,
    },
    
    market: {
      lastSaleDate: market.saleHistory?.[0]?.saleTransDate ?? property.sale?.saleTransDate ?? property.sale?.amount?.saleRecDate,
      lastSalePrice: market.saleHistory?.[0]?.saleAmt ?? property.sale?.amount?.saleAmt,
      lastSaleTransactionType: market.saleHistory?.[0]?.saleTransType ?? property.sale?.saleTransType,
    },
    
    dataSources: {
      basicProfile: true,
    },
    
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Extract data from Expanded Profile API response
 */
export function extractFromExpandedProfile(response: any): Partial<ComprehensivePropertyData> {
  const root = response?.data ?? response;
  const property = root?.property?.[0];
  if (!property) return {};
  
  const basicData = extractFromBasicProfile(response);
  const building = property.building || {};
  const construction = building.construction || {};
  const interior = building.interior || {};
  const parking = building.parking || {};
  const owner = property.owner || {};
  const utilities = property.utilities || {};
  const area = property.area || {};
  
  return {
    ...basicData,
    
    building: {
      ...basicData.building,
      constructionType: construction.constructionType,
      wallType: construction.wallType,
      roofType: construction.roofType,
      foundationType: construction.foundationType,
      exteriorWalls: construction.exteriorWalls,
      heating: interior.heating ?? (property.utilities?.heatingType as any),
      cooling: interior.cooling,
      fuel: interior.fuel ?? (property.utilities?.heatingFuel as any),
      sewer: interior.sewer ?? (property.utilities?.sewer as any),
      water: interior.water ?? (property.utilities?.water as any),
      condition: building.summary?.condition,
      quality: building.summary?.quality,
      garageType: parking.garageType,
      parkingSpaces: parking.prkgSpaces ?? parking.prkgSize,
      parkingType: parking.prkgType,
      fireplace: interior.fireplaceInd === 'Y' || interior.fplcInd === 'Y',
      fireplaceType: interior.fireplaceType ?? interior.fplcType,
      pool: interior.poolInd === 'Y',
      poolType: interior.poolType,
    },
    
    owner: {
      names: owner.owner1?.owner1FullName
        ? [owner.owner1.owner1FullName]
        : (property.assessment?.owner?.mailingAddressOneLine ? [property.assessment.owner.mailingAddressOneLine] : []),
      ownershipType: owner.ownershipType,
    },
    
    utilities: {
      electricity: utilities.electric,
      gas: utilities.gas,
      water: utilities.water,
      sewer: utilities.sewer,
    },
    
    zoning: {
      zoning: area.zoning,
      landUse: area.landUse,
    },
    
    dataSources: {
      ...basicData.dataSources,
      expandedProfile: true,
    },
  };
}

/**
 * Extract data from Property Detail API response
 */
export function extractFromPropertyDetail(response: any): Partial<ComprehensivePropertyData> {
  const root = response?.data ?? response;
  const property = root?.property?.[0];
  if (!property) return {};
  
  const expandedData = extractFromExpandedProfile(response);
  const building = property.building || {};
  const buildingSize = building.size || {};
  const lot = property.lot || {};
  const area = property.area || {};
  const school = property.school || {};
  
  return {
    ...expandedData,
    
    lot: {
      ...expandedData.lot,
      frontFootage: lot.frontFootage,
      depth: lot.depth,
      topography: lot.topography,
      waterfront: lot.waterfrontInd === 'Y',
      waterBody: lot.waterBody,
    },
    
    building: {
      ...expandedData.building,
      grossAreaSqFt: buildingSize.grossAreaSqFt ?? buildingSize.grossSize,
      adjustedGrossAreaSqFt: buildingSize.adjustedGrossAreaSqFt ?? buildingSize.grossSizeAdjusted,
      basementAreaSqFt: buildingSize.basementAreaSqFt ?? (building.interior?.bsmtSize as any),
      garageAreaSqFt: buildingSize.garageAreaSqFt ?? (building.parking?.prkgSize as any),
      architecturalStyle: building.summary?.archStyle,
      buildingStyle: building.summary?.bldgStyle,
    },
    
    location: {
      ...expandedData.location,
      censusTract: area.censusTract,
      censusBlock: area.censusBlock,
    },
    
    schools: {
      elementary: {
        name: school.elementary?.schoolName,
        district: school.elementary?.district,
      },
      middle: {
        name: school.middle?.schoolName,
        district: school.middle?.district,
      },
      high: {
        name: school.high?.schoolName,
        district: school.high?.district,
      },
    },
    
    dataSources: {
      ...expandedData.dataSources,
      propertyDetail: true,
    },
  };
}

/**
 * Extract data from Sale Details API response
 */
export function extractFromSaleDetails(response: any): Partial<ComprehensivePropertyData> {
  const root = response?.data ?? response;
  const property = root?.property?.[0];
  if (!property) return {};
  const saleHistory = property.saleHistory || [];
  
  const latestSale = saleHistory[0] || {};
  const priorSale = saleHistory[1] || {};
  
  return {
    market: {
      lastSaleDate: latestSale.saleTransDate,
      lastSalePrice: latestSale.saleAmt,
      lastSaleTransactionType: latestSale.saleTransType,
      priorSaleDate: priorSale.saleTransDate,
      priorSalePrice: priorSale.saleAmt,
    },
    
    dataSources: {
      saleDetails: true,
    },
    
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Merge multiple data sources with priority and source tracking
 */
export function mergeComprehensiveData(
  ...dataSources: Array<{ data: Partial<ComprehensivePropertyData>; priority: number; sourceName: string }>
): { 
  merged: ComprehensivePropertyData; 
  sourceMap: Record<string, DataSourceInfo>; 
} {
  
  // Sort by priority (higher number = higher priority)
  const sortedSources = dataSources.sort((a, b) => b.priority - a.priority);
  
  const merged: ComprehensivePropertyData = {
    dataSources: {},
    lastUpdated: new Date().toISOString(),
    dataCompleteness: 0,
  };
  
  const sourceMap: Record<string, DataSourceInfo> = {};
  
  // Deep merge function with source tracking
  function deepMerge(target: any, source: any, sourceName: string, path: string = '') {
    for (const key in source) {
      if (source[key] !== null && source[key] !== undefined && source[key] !== '') {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          deepMerge(target[key], source[key], sourceName, currentPath);
        } else {
          // Only update if we don't have this value yet, or if it's from a higher priority source
          if (!target[key] || !sourceMap[currentPath] || 
              dataSources.find(d => d.sourceName === sourceName)?.priority > 
              dataSources.find(d => d.sourceName === sourceMap[currentPath]?.source)?.priority) {
            
            target[key] = source[key];
            sourceMap[currentPath] = {
              field: currentPath,
              value: source[key],
              source: sourceName,
              confidence: getConfidenceLevel(sourceName, currentPath),
              lastUpdated: new Date().toISOString(),
            };
          }
        }
      }
    }
  }
  
  // Merge all sources
  sortedSources.forEach(({ data, sourceName }) => {
    deepMerge(merged, data, sourceName);
    if (data.dataSources) {
      merged.dataSources = { ...merged.dataSources, ...data.dataSources };
    }
  });
  
  // Calculate data completeness
  const totalFields = Object.keys(sourceMap).length;
  const completedFields = Object.values(sourceMap).filter(info => 
    info.value !== null && info.value !== undefined && info.value !== ''
  ).length;
  
  merged.dataCompleteness = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  
  return { merged, sourceMap };
}

/**
 * Get confidence level based on data source and field type
 */
function getConfidenceLevel(sourceName: string, fieldPath: string): 'high' | 'medium' | 'low' {
  // Property Detail has highest confidence for building details
  if (sourceName === 'propertyDetail') {
    return 'high';
  }
  
  // Expanded Profile has high confidence for most fields
  if (sourceName === 'expandedProfile') {
    return fieldPath.includes('building') ? 'high' : 'medium';
  }
  
  // Sale Details has high confidence for market data
  if (sourceName === 'saleDetails') {
    return fieldPath.includes('market') ? 'high' : 'low';
  }
  
  // Basic Profile has medium confidence
  if (sourceName === 'basicProfile') {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Generate field comparison report
 */
export function generateFieldComparisonReport(sourceMap: Record<string, DataSourceInfo>): {
  bySource: Record<string, DataSourceInfo[]>;
  byConfidence: Record<string, DataSourceInfo[]>;
  totalFields: number;
  populatedFields: number;
  completionPercentage: number;
} {
  const fields = Object.values(sourceMap);
  
  const bySource: Record<string, DataSourceInfo[]> = {};
  const byConfidence: Record<string, DataSourceInfo[]> = {};
  
  fields.forEach(field => {
    if (!bySource[field.source]) bySource[field.source] = [];
    if (!byConfidence[field.confidence]) byConfidence[field.confidence] = [];
    
    bySource[field.source].push(field);
    byConfidence[field.confidence].push(field);
  });
  
  const populatedFields = fields.filter(f => 
    f.value !== null && f.value !== undefined && f.value !== ''
  ).length;
  
  return {
    bySource,
    byConfidence,
    totalFields: fields.length,
    populatedFields,
    completionPercentage: fields.length > 0 ? Math.round((populatedFields / fields.length) * 100) : 0,
  };
}

/**
 * Export data in various formats
 */
export function exportComprehensiveData(
  data: ComprehensivePropertyData,
  sourceMap: Record<string, DataSourceInfo>,
  format: 'json' | 'csv' | 'summary' = 'json'
): string {
  switch (format) {
    case 'csv':
      const headers = ['Field', 'Value', 'Source', 'Confidence'];
      const rows = Object.values(sourceMap).map(info => [
        info.field,
        String(info.value),
        info.source,
        info.confidence
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
      
    case 'summary':
      const report = generateFieldComparisonReport(sourceMap);
      return `Data Completeness Report\n\nTotal Fields: ${report.totalFields}\nPopulated Fields: ${report.populatedFields}\nCompletion: ${report.completionPercentage}%\n\nBy Source:\n${Object.entries(report.bySource).map(([source, fields]) => `${source}: ${fields.length} fields`).join('\n')}\n\nBy Confidence:\n${Object.entries(report.byConfidence).map(([conf, fields]) => `${conf}: ${fields.length} fields`).join('\n')}`;
      
    default:
      return JSON.stringify({ data, sourceMap }, null, 2);
  }
}