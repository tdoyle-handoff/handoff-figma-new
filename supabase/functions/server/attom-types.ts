// ATTOM Data API Type Definitions

export interface AttomAddress {
  line1: string;
  locality: string;
  countrySubd: string;
  postal1: string;
  oneLine: string;
}

export interface AttomLocation {
  latitude: string;
  longitude: string;
}

export interface AttomAssessment {
  appraised?: {
    assdTtl?: number;
    assdVal?: number;
    apprisedVal?: number;
    taxYear?: number;
  };
  assessor?: {
    assdValue?: number;
    taxYear?: number;
  };
  market?: {
    apprCurr?: number;
    apprPrev?: number;
    taxYear?: number;
    apprYear?: number;
  };
  tax?: {
    taxAmt?: number;
    taxYear?: number;
    taxRate?: number;
    exemptions?: Array<{
      exemptType?: string;
      exemptAmt?: number;
    }>;
  };
}

export interface AttomBuilding {
  summary?: {
    noOfBeds?: number;
    noOfBaths?: number;
    noOfPartialBaths?: number;
    noOfRooms?: number;
    yearBuilt?: number;
    yearBuiltEffective?: number;
    levels?: number;
    story?: number;
    unitsCount?: number;
  };
  size?: {
    universalSize?: number;
    grossSizeGeneral?: number;
    livingSize?: number;
    grossSizeAdjusted?: number;
  };
  parking?: {
    prkgSize?: number;
  };
  interior?: {
    fplctype?: string;
    fuel?: string;
    basement?: string;
    attic?: string;
    heating?: string;
  };
  construction?: {
    roofFrame?: string;
    roofCover?: string;
    exteriorWalls?: string;
    foundationMaterial?: string;
    constructionType?: string;
    style?: string;
    condition?: string;
    quality?: string;
  };
}

export interface AttomArea {
  areaSqFt?: number;
  areaLot?: number;
  bedrooms?: number;
  bathrooms?: number;
  bathroomsFull?: number;
  bathroomsPartial?: number;
  roomsTotal?: number;
  schoolDistrict?: string;
}

export interface AttomLot {
  lotsize1?: number;
  lotsize2?: number;
  pooltype?: string;
  subdname?: string;
  situsCounty?: string;
  censusTrack?: string;
  zoning?: string;
}

export interface AttomSale {
  amount?: {
    saleAmt?: number;
    saleAmtCurr?: number;
    saleAmtRounded?: number;
  };
  transaction?: {
    saleTransDate?: string;
    saleRecDate?: string;
    contractDate?: string;
  };
  salesHistory?: Array<{
    saleTransDate?: string;
    salesSearchDate?: string;
    amount?: {
      saleAmt?: number;
      saleAmtRounded?: number;
    };
    calculation?: {
      pricePerSizeUnit?: number;
    };
  }>;
  calculation?: {
    pricePerSizeUnit?: number;
  };
}

export interface AttomSummary {
  proptype?: string;
  propLandUse?: string;
  yearbuilt?: number;
}

export interface AttomOwner {
  owner1Full?: string;
  firstName?: string;
  lastName?: string;
}

export interface AttomUtilities {
  hoaFee?: number;
  sewerType?: string;
  waterSource?: string;
  electricProvider?: string;
  gasProvider?: string;
  internetProviders?: string;
}

export interface AttomRisk {
  floodZone?: string;
  floodRiskScore?: number;
  earthquakeRisk?: string;
  fireRisk?: string;
  environmentalHazards?: string[];
  crimeScore?: number;
  walkabilityScore?: number;
  schoolScore?: number;
}

export interface AttomVintage {
  lastModified?: string;
}

export interface AttomIdentifier {
  id: string;
}

export interface AttomPropertyDetail {
  identifier?: AttomIdentifier;
  address?: AttomAddress;
  location?: AttomLocation;
  assessment?: AttomAssessment;
  building?: AttomBuilding;
  area?: AttomArea;
  lot?: AttomLot;
  sale?: AttomSale;
  summary?: AttomSummary;
  owner?: AttomOwner;
  utilities?: AttomUtilities;
  risk?: AttomRisk;
  vintage?: AttomVintage;
}

export interface AttomAVMData {
  avm?: {
    amount?: {
      value?: number;
      low?: number;
      high?: number;
    };
    calculation?: {
      pricePerSizeUnit?: number;
    };
    confidence?: {
      score?: number;
    };
  };
}

export interface AttomAPIResponse {
  status?: {
    code: number;
    msg: string;
  };
  property?: AttomPropertyDetail[];
}

// Our standardized property interface
export interface AttomProperty {
  id: string;
  attom_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    formatted: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  property_details: {
    property_type?: string;
    property_use_code?: string;
    bedrooms?: number;
    bathrooms?: number;
    full_bathrooms?: number;
    half_bathrooms?: number;
    total_rooms?: number;
    square_feet?: number;
    square_feet_living?: number;
    lot_size_sqft?: number;
    lot_size_acres?: number;
    year_built?: number;
    effective_year_built?: number;
    stories?: number;
    units_count?: number;
    garage_spaces?: number;
    parking_spaces?: number;
    pool?: boolean;
    fireplace?: boolean;
    fireplace_count?: number;
    central_air?: boolean;
    basement?: boolean;
    attic?: boolean;
    heating_type?: string;
    cooling_type?: string;
    roof_type?: string;
    roof_material?: string;
    exterior_material?: string;
    foundation_type?: string;
    construction_type?: string;
    architectural_style?: string;
    condition?: string;
    quality?: string;
    zoning?: string;
  };
  valuation: {
    estimated_value?: number;
    value_range_low?: number;
    value_range_high?: number;
    price_per_sqft?: number;
    confidence_score?: number;
    last_sale_price?: number;
    last_sale_date?: string;
    market_value?: number;
    assessed_value?: number;
    assessed_year?: number;
    market_improvement_percent?: number;
  };
  tax_assessment: {
    total_assessed_value?: number;
    land_assessed_value?: number;
    improvement_assessed_value?: number;
    assessment_year?: number;
    tax_year?: number;
    annual_tax_amount?: number;
    tax_rate_per_1000?: number;
    exemptions?: Array<{
      type: string;
      amount: number;
    }>;
  };
  ownership: {
    deed_date?: string;
    transfer_amount?: number;
    deed_type?: string;
  };
  market_data: {
    list_price?: number;
    price_history?: Array<{
      date: string;
      price: number;
      event_type: 'Sold' | 'Listed' | 'Price Change';
      price_per_sqft?: number;
    }>;
    comparable_sales?: any[];
  };
  neighborhood: {
    name?: string;
    subdivision?: string;
    county?: string;
    census_tract?: string;
    school_district?: string;
    hoa_info?: {
      has_hoa?: boolean;
      monthly_fee?: number;
      annual_fee?: number;
    };
  };
  utilities: {
    sewer_type?: string;
    water_source?: string;
    electric_provider?: string;
    gas_provider?: string;
    internet_providers?: string[];
  };
  risk_factors: {
    flood_zone?: string;
    flood_risk_score?: number;
    earthquake_risk?: string;
    fire_risk?: string;
    environmental_hazards?: string[];
    crime_score?: number;
    walkability_score?: number;
    school_score?: number;
  };
  last_updated: string;
  data_source: string;
  data_freshness_score: number;
}

export interface AttomSearchParams {
  address?: string;
  address1?: string;
  address2?: string;
  attomid?: string;
  oneline?: string;
  geoid?: string;
}

export interface AttomSearchResult {
  properties: AttomProperty[];
  total_count: number;
  search_params: AttomSearchParams;
}

export interface AttomError {
  code: string;
  message: string;
  details?: any;
}

export interface AttomResponse<T> {
  success: boolean;
  data?: T;
  error?: AttomError;
  timestamp: string;
}