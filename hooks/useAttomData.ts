import { useState, useCallback, useRef } from 'react';
import { AttomProperty, AttomSearchParams, AttomSearchResult, AttomResponse, AttomError } from '../types/attom';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UseAttomDataProps {
  onPropertyFound?: (property: AttomProperty) => void;
  onError?: (error: AttomError) => void;
  autoSearch?: boolean;
}

interface UseAttomDataReturn {
  property: AttomProperty | null;
  properties: AttomProperty[];
  isLoading: boolean;
  error: AttomError | null;
  searchByAddress: (address: string) => Promise<any>;
  searchByAttomId: (attomId: string) => Promise<AttomProperty | null>;
  searchProperties: (params: AttomSearchParams) => Promise<AttomSearchResult | null>;
  getValuation: (addressOrId: string, isAttomId?: boolean) => Promise<any>;
  getComparables: (addressOrCoordinates: string | { latitude: number; longitude: number }, radius?: number) => Promise<any[]>;
  clearData: () => void;
  refreshProperty: (propertyId: string) => Promise<AttomProperty | null>;
}

export function useAttomData({
  onPropertyFound,
  onError,
  autoSearch = true
}: UseAttomDataProps = {}): UseAttomDataReturn {
  const [property, setProperty] = useState<AttomProperty | null>(null);
  const [properties, setProperties] = useState<AttomProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AttomError | null>(null);
  
  const abortControllerRef = useRef<AbortController>();

  // Base API call function
  const makeAPICall = useCallback(async (
    endpoint: string,
    params?: Record<string, any>,
    method?: 'GET' | 'POST'
  ) => {
    const actualParams = params || {};
    const actualMethod = method || 'GET';
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/${endpoint}`;
      
      const options: RequestInit = {
        method: actualMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: abortControllerRef.current.signal,
      };

      if (actualMethod === 'GET' && Object.keys(actualParams).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(actualParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        const urlWithParams = `${url}?${searchParams.toString()}`;
        const response = await fetch(urlWithParams, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } else if (actualMethod === 'POST') {
        options.body = JSON.stringify(actualParams);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return null; // Request was cancelled
        }
        
        const attomError: AttomError = {
          code: 'API_ERROR',
          message: err.message,
          details: err
        };
        
        setError(attomError);
        onError?.(attomError);
        console.error('Attom API Error:', err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Search property by address - returns raw API response
  const searchByAddress = useCallback(async (address: string) => {
    if (!address.trim()) {
      return null;
    }

    console.log('Searching Attom for address (raw response):', address);
    
    const response = await makeAPICall('search-by-address', { address, debug: 'true' });
    
    if (response && response.property && response.property.length > 0) {
      // Store the raw API response in local storage
      localStorage.setItem('handoff-attom-property', JSON.stringify(response));
      
      // Call the callback with the first property
      onPropertyFound?.(response.property[0]);
      
      return response;
    } else if (response?.error) {
      console.error('Attom search error:', response.error);
    }
    
    return null;
  }, [makeAPICall, onPropertyFound]);

  // Search property by Attom ID
  const searchByAttomId = useCallback(async (attomId: string) => {
    if (!attomId.trim()) {
      return null;
    }

    console.log('Searching Attom for ID:', attomId);
    
    const response = await makeAPICall('search-by-id', { attom_id: attomId });
    
    if (response?.success && response.data) {
      setProperty(response.data);
      onPropertyFound?.(response.data);
      
      // Store in local storage for persistence
      localStorage.setItem('handoff-attom-property', JSON.stringify(response.data));
      
      return response.data;
    }
    
    return null;
  }, [makeAPICall, onPropertyFound]);

  // Search multiple properties
  const searchProperties = useCallback(async (params: AttomSearchParams) => {
    console.log('Searching Attom properties with params:', params);
    
    const response = await makeAPICall('search', params, 'POST');
    
    if (response?.success && response.data) {
      setProperties(response.data.properties);
      return response.data;
    }
    
    return null;
  }, [makeAPICall]);

  // Get property valuation
  const getValuation = useCallback(async (addressOrId: string, isAttomId = false) => {
    console.log('Getting Attom valuation for:', addressOrId);
    
    const params = isAttomId ? { attom_id: addressOrId } : { address: addressOrId };
    const response = await makeAPICall('valuation', params);
    
    if (response?.success && response.data) {
      return response.data;
    }
    
    return null;
  }, [makeAPICall]);

  // Get comparable sales
  const getComparables = useCallback(async (
    addressOrCoordinates: string | { latitude: number; longitude: number }, 
    radius = 0.5
  ) => {
    console.log('Getting Attom comparables for:', addressOrCoordinates);
    
    const params: Record<string, any> = { radius };
    
    if (typeof addressOrCoordinates === 'string') {
      params.address = addressOrCoordinates;
    } else {
      params.latitude = addressOrCoordinates.latitude;
      params.longitude = addressOrCoordinates.longitude;
    }
    
    const response = await makeAPICall('comparables', params);
    
    if (response?.success && response.data) {
      return response.data;
    }
    
    return [];
  }, [makeAPICall]);

  // Refresh property data
  const refreshProperty = useCallback(async (propertyId: string) => {
    console.log('Refreshing Attom property:', propertyId);
    
    const response = await makeAPICall('search-by-id', { attom_id: propertyId });
    
    if (response?.success && response.data) {
      setProperty(response.data);
      onPropertyFound?.(response.data);
      
      // Update local storage
      localStorage.setItem('handoff-attom-property', JSON.stringify(response.data));
      
      return response.data;
    }
    
    return null;
  }, [makeAPICall, onPropertyFound]);

  // Clear all data
  const clearData = useCallback(() => {
    setProperty(null);
    setProperties([]);
    setError(null);
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear from local storage
    localStorage.removeItem('handoff-attom-property');
  }, []);

  return {
    property,
    properties,
    isLoading,
    error,
    searchByAddress,
    searchByAttomId,
    searchProperties,
    getValuation,
    getComparables,
    clearData,
    refreshProperty
  };
}

// Utility function to load cached property from localStorage
export function loadCachedAttomProperty() {
  try {
    const cached = localStorage.getItem('handoff-attom-property');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error loading cached Attom property:', error);
  }
  return null;
}

// Utility function to format currency
export function formatCurrency(amount: number | undefined) {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Utility function to format square footage
export function formatSquareFeet(sqft: number | undefined): string {
  if (sqft === undefined || sqft === null) return 'N/A';
  return new Intl.NumberFormat('en-US').format(sqft) + ' sq ft';
}

// Utility function to format lot size
export function formatLotSize(sqft?: number, acres?: number): string {
  if (acres && acres >= 1) {
    return `${acres.toFixed(2)} acres`;
  } else if (sqft) {
    return formatSquareFeet(sqft);
  }
  return 'N/A';
}

// Utility function to format property type
export function formatPropertyType(type: string): string {
  return type.replace(/([A-Z])/g, ' $1').trim();
}

// Utility function to format confidence score
export function formatConfidenceScore(score: number | undefined): string {
  if (score === undefined || score === null) return 'N/A';
  return `${Math.round(score)}%`;
}

// Utility function to calculate property score based on various factors
export function calculatePropertyScore(property: AttomProperty): number {
  let score = 0;
  let factors = 0;

  // Data freshness (0-25 points)
  if (property.data_freshness_score !== undefined) {
    score += (property.data_freshness_score / 100) * 25;
    factors++;
  }

  // Valuation confidence (0-25 points)
  if (property.valuation.confidence_score !== undefined) {
    score += (property.valuation.confidence_score / 100) * 25;
    factors++;
  }

  // Property completeness (0-25 points)
  const completenessFields = [
    property.property_details.bedrooms,
    property.property_details.bathrooms,
    property.property_details.square_feet,
    property.property_details.year_built,
    property.valuation.estimated_value,
    property.tax_assessment.annual_tax_amount
  ];
  const completeness = completenessFields.filter(field => field !== undefined).length / completenessFields.length;
  score += completeness * 25;
  factors++;

  // Market data availability (0-25 points)
  const hasMarketData = property.market_data.price_history && property.market_data.price_history.length > 0;
  const hasComparables = property.market_data.comparable_sales && property.market_data.comparable_sales.length > 0;
  const marketScore = (hasMarketData ? 12.5 : 0) + (hasComparables ? 12.5 : 0);
  score += marketScore;
  factors++;

  return factors > 0 ? Math.round(score / factors * 4) : 0; // Scale to 0-100
}