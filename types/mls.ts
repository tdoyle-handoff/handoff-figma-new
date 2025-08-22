export interface MLSProperty {
  id: string;
  mls_number: string;
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
    bedrooms?: number;
    bathrooms?: number;
    full_bathrooms?: number;
    half_bathrooms?: number;
    square_feet?: number;
    lot_size_sqft?: number;
    lot_size_acres?: number;
    year_built?: number;
    stories?: number;
    garage_spaces?: number;
    parking_spaces?: number;
    pool?: boolean;
    fireplace?: boolean;
    basement?: boolean;
    attic?: boolean;
    central_air?: boolean;
    heating_type?: string;
    cooling_type?: string;
    roof_type?: string;
    exterior_material?: string;
    foundation_type?: string;
  };
  listing_details: {
    status: 'Active' | 'Pending' | 'Sold' | 'Withdrawn' | 'Expired' | 'Off Market';
    list_price?: number;
    original_list_price?: number;
    sold_price?: number;
    price_per_sqft?: number;
    list_date?: string;
    sold_date?: string;
    days_on_market?: number;
    listing_agent?: {
      name: string;
      company: string;
      phone?: string;
      email?: string;
    };
    listing_office?: {
      name: string;
      phone?: string;
    };
  };
  financial_details: {
    estimated_monthly_payment?: number;
    property_taxes?: number;
    hoa_fees?: number;
    insurance_estimate?: number;
    utilities_estimate?: number;
  };
  photos: MLSPhoto[];
  description?: string;
  features?: string[];
  schools?: MLSSchool[];
  neighborhood?: {
    name?: string;
    walk_score?: number;
    transit_score?: number;
    bike_score?: number;
  };
  market_data?: {
    median_home_value?: number;
    price_appreciation_1yr?: number;
    price_appreciation_5yr?: number;
    comparable_sales?: MLSComparable[];
  };
  disclosure_info?: {
    flood_zone?: string;
    natural_hazards?: string[];
    environmental_reports?: string[];
  };
  last_updated: string;
  data_source: string;
}

export interface MLSPhoto {
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

export interface MLSSchool {
  name: string;
  type: 'Elementary' | 'Middle' | 'High' | 'Private' | 'Charter';
  rating?: number;
  distance_miles?: number;
  district?: string;
}

export interface MLSComparable {
  id: string;
  address: string;
  sold_price: number;
  sold_date: string;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  distance_miles?: number;
  price_per_sqft?: number;
}

export interface MLSSearchParams {
  address?: string;
  mls_number?: string;
  latitude?: number;
  longitude?: number;
  radius_miles?: number;
  property_type?: string[];
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_sqft?: number;
  max_sqft?: number;
  status?: string[];
  days_on_market_max?: number;
  include_sold?: boolean;
  sold_within_days?: number;
}

export interface MLSSearchResult {
  properties: MLSProperty[];
  total_count: number;
  search_params: MLSSearchParams;
  search_id?: string;
}

export interface MLSError {
  code: string;
  message: string;
  details?: any;
}

export interface MLSResponse<T> {
  success: boolean;
  data?: T;
  error?: MLSError;
  timestamp: string;
  rate_limit?: {
    remaining: number;
    reset_time: string;
  };
}

// Enhanced property data that combines MLS data with user inputs
export interface EnhancedProperty extends MLSProperty {
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
  };
}