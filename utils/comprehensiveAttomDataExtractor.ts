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
  const area = property.area || {};
  const assessment = property.assessment || {};
  const market = property.market || {};
  const sale = property.sale || {};
  const saleAmountData = sale.saleAmountData || {};
  
  return {
    propertyId: identifier.obPropId || identifier.attomId || identifier.Id,
    apn: identifier.apn,
    fips: identifier.fips,
    
    address: {
      line1: address.line1,
      line2: address.line2,
      locality: address.locality,
      adminArea1: address.adminArea1 ?? address.countrySubd,
      adminArea2: address.adminArea2 ?? area.countrySecSubd,
      postalCode: address.postalCode ?? address.postal1,
      countryCode: address.country ?? address.countryCode,
    },
    
    location: {
      latitude: typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude,
      longitude: typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude,
      geoId: (location as any).geoId ?? (location as any).geoid,
      censusTract: area.censusTractIdent,
    },
    
    lot: {
      lotSizeAcres: lot.lotSizeAcres ?? lot.lotSize1,
      lotSizeSqFt: lot.lotSizeSqFt ?? lot.lotSize2,
    },
    
    building: {
      propertyType: summary.propertyType ?? buildingSummary.propertyType,
      propertySubType: summary.propSubType ?? buildingSummary.propSubType,
      propertyClass: summary.propClass ?? buildingSummary.propClass,
      standardUse: summary.propLandUse ?? buildingSummary.propLandUse,
      yearBuilt: summary.yearBuilt ?? buildingSummary.yearBuilt,
      stories: buildingSummary.levels,
      livingAreaSqFt: buildingSize.livingAreaSqFt ?? buildingSize.livingSize,
      bedrooms: buildingRooms.bedsCount ?? buildingRooms.beds,
      fullBaths: buildingRooms.bathsFull,
      bathrooms: buildingRooms.bathsTotal,
      roomsTotal: buildingRooms.roomsTotal,
      wallType: (property.utilities && (property.utilities as any).wallType) as any,
      condition: (building.construction && (building.construction as any).condition) ?? buildingSummary.condition,
    },
    
    assessment: {
      assessedYear: assessment.assessed?.assdYear,
      assessedValue: assessment.assessed?.assdTtlValue,
      marketValue: assessment.market?.mktTtlValue,
      taxValue: assessment.tax?.taxAmt,
      taxYear: assessment.tax?.taxYear,
    },
    
    market: {
      lastSaleDate: market.saleHistory?.[0]?.saleTransDate ?? sale.saleTransDate ?? saleAmountData.saleRecDate,
      lastSalePrice: market.saleHistory?.[0]?.saleAmt ?? saleAmountData.saleAmt,
      lastSaleTransactionType: market.saleHistory?.[0]?.saleTransType ?? saleAmountData.saleTransType,
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
  const assessment = property.assessment || {};
  const summary = property.summary || {};
  const lot = property.lot || {};
  
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
        : (assessment.owner?.owner1?.fullName ? [assessment.owner.owner1.fullName] : (assessment.owner?.mailingAddressOneLine ? [assessment.owner.mailingAddressOneLine] : [])),
      ownershipType: owner.ownershipType,
      mailingAddress: {
        line1: assessment.owner?.mailingAddressOneLine,
      }
    },
    
    utilities: {
      electricity: utilities.electric,
      gas: utilities.gas,
      water: utilities.water,
      sewer: utilities.sewer,
    },
    
    zoning: {
      zoning: area.zoning ?? lot.zoningType,
      landUse: area.landUse ?? summary.propLandUse,
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
  const construction = building.construction || {};
  const utilities = property.utilities || {};

  // Compute schools data only if present
  const hasSchoolData = Boolean(
    school?.elementary?.schoolName || school?.elementary?.district ||
    school?.middle?.schoolName || school?.middle?.district ||
    school?.high?.schoolName || school?.high?.district
  );

  const schoolsData = hasSchoolData ? {
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
  } : undefined;
  
  const detailData: Partial<ComprehensivePropertyData> = {
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
      // Enrich construction from detail when available
      constructionType: construction.constructionType ?? expandedData.building?.constructionType,
      wallType: construction.wallType ?? expandedData.building?.wallType,
      roofType: construction.roofType ?? expandedData.building?.roofType,
      foundationType: construction.foundationType ?? expandedData.building?.foundationType,
      exteriorWalls: construction.exteriorWalls ?? expandedData.building?.exteriorWalls,
      condition: building.summary?.condition ?? expandedData.building?.condition,
      quality: building.summary?.quality ?? expandedData.building?.quality,
      // Utilities fallback from detail payload if present
      heating: expandedData.building?.heating ?? (utilities as any).heatingType,
      fuel: expandedData.building?.fuel ?? (utilities as any).heatingFuel,
      water: expandedData.building?.water ?? (utilities as any).water,
      sewer: expandedData.building?.sewer ?? (utilities as any).sewer,
    },
    
    location: {
      ...expandedData.location,
      censusTract: area.censusTract,
      censusBlock: area.censusBlock,
    },
    
    dataSources: {
      ...expandedData.dataSources,
      propertyDetail: true,
    },
  };

  if (schoolsData) {
    (detailData as any).schools = schoolsData;
  }

  return detailData;
}

/**
 * Extract data from Sale Details API response
 */
export function extractFromSaleDetails(response: any): Partial<ComprehensivePropertyData> {
  const root = response?.data ?? response;
  const property = root?.property?.[0];
  if (!property) return {};

  // Normalize possible sale shapes across endpoints (sale/detail, property/sale, etc.)
  const history: any[] = Array.isArray(property.saleHistory)
    ? property.saleHistory
    : Array.isArray((property as any).saleHistories)
      ? (property as any).saleHistories
      : Array.isArray((property as any).sale)
        ? (property as any).sale
        : [];

  // Helper to safely read a sale record
  const readSale = (s: any) => {
    if (!s) return { date: undefined, amount: undefined, type: undefined };
    return {
      date: s.saleTransDate || s.saleRecDate || s.saleDate || s.saleRecordedDate,
      amount: s.saleAmt || s.amount || s.salePrice,
      type: s.saleTransType || s.transType || s.saleType,
    };
  };

  let latest = readSale(history[0]);
  let prior = readSale(history[1]);

  // If no array-based history, try object-based property.sale
  if (!latest.date && !latest.amount && (property as any).sale && !Array.isArray((property as any).sale)) {
    latest = readSale((property as any).sale);
  }

  return {
    market: {
      lastSaleDate: latest.date,
      lastSalePrice: latest.amount,
      lastSaleTransactionType: latest.type,
      priorSaleDate: prior.date,
      priorSalePrice: prior.amount,
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