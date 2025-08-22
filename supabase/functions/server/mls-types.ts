// MLS API Type Definitions

export interface MLSAddress {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  formatted: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface MLSPhoto {
  id: string;
  url: string;
  thumbnail_url: string;
  high_res_url: string;
  caption: string;
  order: number;
}

export interface MLSAgent {
  name: string;
  company: string;
  phone?: string;
  email?: string;
}

export interface MLSOffice {
  name: string;
  phone?: string;
}

export interface MLSProperty {
  id: string;
  mls_number: string;
  address: MLSAddress;
  property_details: {
    property_type?: 'Single Family' | 'Townhouse' | 'Condo' | 'Multi-Family' | 'Vacant Land' | 'Commercial';
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
    central_air?: boolean;
    heating_type?: string;
    cooling_type?: string;
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
    listing_agent?: MLSAgent;
    listing_office?: MLSOffice;
  };
  financial_details: {
    estimated_monthly_payment?: number;
    property_taxes?: number;
    hoa_fees?: number;
  };
  photos: MLSPhoto[];
  description: string;
  features: string[];
  last_updated: string;
  data_source: string;
}

export interface MLSSearchParams {
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
  city?: string;
  state?: string;
  zip_codes?: string[];
  property_features?: string[];
}

export interface MLSSearchResult {
  properties: MLSProperty[];
  total_count: number;
  search_params: MLSSearchParams;
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
}