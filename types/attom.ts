export interface AttomProperty {
  id: string;
  attom_id: string;
  // Commonly used fields (subset)
  identifier?: {
    attomId?: string;
    fips?: string;
    apn?: string;
    obPropId?: string;
  };
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
    property_type: 'Single Family' | 'Townhouse' | 'Condo' | 'Multi-Family' | 'Vacant Land' | 'Commercial';
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
    basement?: boolean;
    attic?: boolean;
    central_air?: boolean;
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
  // Optional sections paralleling AttomPropertyDetail for convenience in UI components
  lot?: {
    lotNum?: string;
    lotsize1?: number;
    lotsize2?: number;
    pooltype?: string;
    situsCounty?: string;
    subdname?: string;
    subdtractnum?: string;
  };
  area?: {
    areaLot?: number;
    areaSqFt?: number;
    bathrooms?: number;
    bathroomsFull?: number;
    bathroomsPartial?: number;
    bedrooms?: number;
    roomsTotal?: number;
  };
  building?: {
    construction?: Record<string, any>;
    interior?: Record<string, any>;
    parking?: { garagetype?: string; prkgSize?: number; prkgType?: string };
    size?: { livingSize?: number; grossSizeAdjusted?: number; grossSizeGeneral?: number };
    summary?: { yearBuilt?: number; noOfBeds?: number; noOfBaths?: number };
  };
  assessment?: any;
  sale?: any;
  location?: any;
  owner?: any;
  
  valuation: {
    estimated_value?: number;
    value_range_low?: number;
    value_range_high?: number;
    price_per_sqft?: number;
    last_sale_price?: number;
    last_sale_date?: string;
    market_value?: number;
    assessed_value?: number;
    assessed_year?: number;
    market_improvement_percent?: number;
    value_change_1yr?: number;
    value_change_5yr?: number;
    confidence_score?: number;
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
    owner_name?: string;
    owner_type?: 'Individual' | 'Corporate' | 'Government' | 'Trust' | 'LLC';
    ownership_length_years?: number;
    deed_date?: string;
    deed_type?: string;
    transfer_amount?: number;
    equity_percent?: number;
  };
  mortgage_loan: {
    loan_amount?: number;
    loan_type?: string;
    lender_name?: string;
    origination_date?: string;
    interest_rate?: number;
    term_months?: number;
    monthly_payment?: number;
    balance_remaining?: number;
    ltv_ratio?: number;
  };
  market_data: {
    days_on_market?: number;
    listing_status?: 'Active' | 'Pending' | 'Sold' | 'Off Market' | 'Coming Soon';
    list_price?: number;
    price_history?: Array<{
      date: string;
      price: number;
      event_type: 'Listed' | 'Price Change' | 'Sold' | 'Withdrawn';
    }>;
    comparable_sales?: AttomComparable[];
    neighborhood_stats?: {
      median_home_value?: number;
      median_price_per_sqft?: number;
      sales_volume_3months?: number;
      price_trend_3months?: 'Up' | 'Down' | 'Stable';
      inventory_months?: number;
    };
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
  foreclosure_info?: {
    is_in_foreclosure: boolean;
    foreclosure_date?: string;
    foreclosure_type?: string;
    auction_date?: string;
    opening_bid?: number;
  };
  rental_data?: {
    estimated_rent?: number;
    rent_range_low?: number;
    rent_range_high?: number;
    cap_rate?: number;
    gross_yield?: number;
    cash_on_cash_return?: number;
    rental_history?: Array<{
      date: string;
      rent: number;
    }>;
  };
  schools?: AttomSchool[];
  neighborhood: {
    name?: string;
    subdivision?: string;
    county?: string;
    census_tract?: string;
    school_district?: string;
    hoa_info?: {
      has_hoa: boolean;
      monthly_fee?: number;
      annual_fee?: number;
      hoa_name?: string;
    };
  };
  utilities: {
    sewer_type?: string;
    water_source?: string;
    electric_provider?: string;
    gas_provider?: string;
    internet_providers?: string[];
  };
  photos?: AttomPhoto[];
  last_updated: string;
  data_source: string;
  data_freshness_score: number;
}

export interface AttomPhoto {
  id: string;
  url: string;
  thumbnail_url?: string;
  high_res_url?: string;
  caption?: string;
  room_type?: string;
  order: number;
  width?: number;
  height?: number;
}

export interface AttomSchool {
  name: string;
  type: 'Elementary' | 'Middle' | 'High' | 'Private' | 'Charter';
  rating?: number;
  score?: number;
  distance_miles?: number;
  district?: string;
  phone?: string;
  website?: string;
}

export interface AttomComparable {
  id: string;
  address: string;
  sold_price: number;
  sold_date: string;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  distance_miles?: number;
  price_per_sqft?: number;
  property_type?: string;
  year_built?: number;
}

export interface AttomSearchParams {
  address?: string;
  attom_id?: string;
  latitude?: number;
  longitude?: number;
  radius_miles?: number;
  property_type?: string[];
  min_value?: number;
  max_value?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_sqft?: number;
  max_sqft?: number;
  year_built_min?: number;
  year_built_max?: number;
  include_foreclosures?: boolean;
  include_rental_data?: boolean;
  data_freshness_days?: number;
}

export interface AttomSearchResult {
  properties: AttomProperty[];
  total_count: number;
  search_params: AttomSearchParams;
  search_id?: string;
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
  rate_limit?: {
    remaining: number;
    reset_time: string;
  };
}

// Enhanced property data that combines Attom data with user inputs
export interface EnhancedAttomProperty extends AttomProperty {
  user_data?: {
    purchase_price?: number;
    down_payment?: number;
    loan_amount?: number;
    interest_rate?: number;
    loan_term_years?: number;
    closing_date?: string;
    inspection_date?: string;
    contingencies?: string[];
    notes?: string;
    saved_date: string;
    last_viewed: string;
  };
  calculated_data?: {
    monthly_payment?: number;
    total_monthly_cost?: number;
    cash_needed_to_close?: number;
    return_on_investment?: number;
    rental_yield?: number;
    affordability_score?: number;
    investment_score?: number;
  };
}

// Attom API specific types
export interface AttomPropertyDetail {
  identifier: {
    id: string;
    fips: string;
    apn: string;
  };
  address: {
    country: string;
    countrySubd: string;
    line1: string;
    line2?: string;
    locality: string;
    matchCode: string;
    oneLine: string;
    postal1: string;
    postal2?: string;
    postal3?: string;
  };
  location: {
    accuracy: string;
    elevation: number;
    latitude: string;
    longitude: string;
    distance?: number;
  };
  summary: {
    absenteeInd: string;
    propclass: string;
    propsubtype: string;
    proptype: string;
    yearbuilt?: number;
    propLandUse: string;
    propIndicator: string;
    legal1: string;
  };
  lot: {
    lotNum?: string;
    lotsize1?: number;
    lotsize2?: number;
    pooltype?: string;
    situsCounty: string;
    subdname?: string;
    subdtractnum?: string;
  };
  area: {
    absenteeInd: string;
    areaLot: number;
    areaSqFt?: number;
    bathrooms?: number;
    bathroomsFull?: number;
    bathroomsPartial?: number;
    bedrooms?: number;
    roomsTotal?: number;
  };
  building: {
    construction: {
      condition?: string;
      constructionType?: string;
      exteriorWalls?: string;
      foundationMaterial?: string;
      quality?: string;
      roofCover?: string;
      roofFrame?: string;
      style?: string;
    };
    interior: {
      fplctype?: string;
      fuel?: string;
      heating?: string;
      rooms?: Array<{
        roomtype: string;
        roombed?: number;
        roomarea?: number;
      }>;
    };
    parking: {
      garagetype?: string;
      prkgSize?: number;
      prkgType?: string;
    };
    size: {
      grossSizeAdjusted?: number;
      grossSizeGeneral?: number;
      livingSize?: number;
      sizeInd?: string;
      universalSize?: number;
    };
    summary: {
      archStyle?: string;
      levels?: number;
      noOfBaths?: number;
      noOfPartialBaths?: number;
      noOfBeds?: number;
      noOfRooms?: number;
      proptype?: string;
      story?: number;
      unitsCount?: number;
      yearBuilt?: number;
      yearBuiltEffective?: number;
    };
  };
  assessment: {
    appraised: {
      apprisedTtl?: number;
      apprisedVal?: number;
      assdTtl?: number;
      assdVal?: number;
      mktTtl?: number;
      mktVal?: number;
      taxYear?: number;
    };
    assessor: {
      apn?: string;
      assdValue?: number;
      mktValue?: number;
      taxYear?: number;
    };
    market: {
      apprCurr?: number;
      apprPrev?: number;
      apprYear?: number;
      taxYear?: number;
    };
    tax: {
      exemptflag?: string;
      exemptions?: Array<{
        exemptType: string;
        exemptAmt: number;
      }>;
      taxAmt?: number;
      taxPerSizeUnit?: number;
      taxRate?: number;
      taxYear?: number;
    };
  };
  sale: {
    amount: {
      saleAmt?: number;
      saleAmtCurr?: number;
    };
    calculation: {
      pricePerSizeUnit?: number;
      saleAmtCurr?: number;
    };
    salesHistory?: Array<{
      amount: {
        saleAmt: number;
        saleAmtRounded: number;
      };
      calculation: {
        pricePerSizeUnit?: number;
      };
      salesSearchDate: string;
      saleTransDate: string;
    }>;
    transaction: {
      contractDate?: string;
      saleRecDate?: string;
      saleSearchDate?: string;
      saleTransDate?: string;
    };
  };
  vintage: {
    lastModified: string;
    pubDate: string;
  };
}

export interface AttomAVMData {
  identifier: {
    id: string;
    fips: string;
  };
  address: {
    country: string;
    countrySubd: string;
    line1: string;
    locality: string;
    oneLine: string;
    postal1: string;
  };
  avm: {
    amount: {
      value: number;
      high: number;
      low: number;
    };
    eventDate: string;
    confidence: {
      score: number;
    };
    calculation: {
      pricePerSizeUnit: number;
    };
  };
  vintage: {
    lastModified: string;
    pubDate: string;
  };
}