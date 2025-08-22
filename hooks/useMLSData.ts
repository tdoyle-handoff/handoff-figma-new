import { useState, useCallback, useRef } from 'react';
import { MLSProperty, MLSSearchParams, MLSSearchResult, MLSResponse, MLSError } from '../types/mls';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UseMLSDataProps {
  onPropertyFound?: (property: MLSProperty) => void;
  onError?: (error: MLSError) => void;
  autoSearch?: boolean;
}

interface UseMLSDataReturn {
  property: MLSProperty | null;
  properties: MLSProperty[];
  isLoading: boolean;
  error: MLSError | null;
  searchByAddress: (address: string) => Promise<MLSProperty | null>;
  searchByMLSNumber: (mlsNumber: string) => Promise<MLSProperty | null>;
  searchProperties: (params: MLSSearchParams) => Promise<MLSSearchResult | null>;
  clearData: () => void;
  refreshProperty: (propertyId: string) => Promise<MLSProperty | null>;
}

export function useMLSData({
  onPropertyFound,
  onError,
  autoSearch = true
}: UseMLSDataProps = {}): UseMLSDataReturn {
  const [property, setProperty] = useState<MLSProperty | null>(null);
  const [properties, setProperties] = useState<MLSProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MLSError | null>(null);
  
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
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/mls/${endpoint}`;
      
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
        
        const mlsError: MLSError = {
          code: 'API_ERROR',
          message: err.message,
          details: err
        };
        
        setError(mlsError);
        onError?.(mlsError);
        console.error('MLS API Error:', err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Search property by address
  const searchByAddress = useCallback(async (address: string) => {
    if (!address.trim()) {
      return null;
    }

    console.log('Searching MLS for address:', address);
    
    const response = await makeAPICall('search-by-address', { address });
    
    if (response?.success && response.data) {
      setProperty(response.data);
      onPropertyFound?.(response.data);
      
      // Store in local storage for persistence
      localStorage.setItem('handoff-mls-property', JSON.stringify(response.data));
      
      return response.data;
    } else if (response?.error) {
      console.error('MLS search error:', response.error);
    }
    
    return null;
  }, [makeAPICall, onPropertyFound]);

  // Search property by MLS number
  const searchByMLSNumber = useCallback(async (mlsNumber: string) => {
    if (!mlsNumber.trim()) {
      return null;
    }

    console.log('Searching MLS for MLS number:', mlsNumber);
    
    const response = await makeAPICall('search-by-mls', { mls_number: mlsNumber });
    
    if (response?.success && response.data) {
      setProperty(response.data);
      onPropertyFound?.(response.data);
      
      // Store in local storage for persistence
      localStorage.setItem('handoff-mls-property', JSON.stringify(response.data));
      
      return response.data;
    }
    
    return null;
  }, [makeAPICall, onPropertyFound]);

  // Search multiple properties
  const searchProperties = useCallback(async (params: MLSSearchParams) => {
    console.log('Searching MLS properties with params:', params);
    
    const response = await makeAPICall('search', params, 'POST');
    
    if (response?.success && response.data) {
      setProperties(response.data.properties);
      return response.data;
    }
    
    return null;
  }, [makeAPICall]);

  // Refresh property data
  const refreshProperty = useCallback(async (propertyId: string) => {
    console.log('Refreshing MLS property:', propertyId);
    
    const response = await makeAPICall('property', { id: propertyId });
    
    if (response?.success && response.data) {
      setProperty(response.data);
      onPropertyFound?.(response.data);
      
      // Update local storage
      localStorage.setItem('handoff-mls-property', JSON.stringify(response.data));
      
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
    localStorage.removeItem('handoff-mls-property');
  }, []);

  return {
    property,
    properties,
    isLoading,
    error,
    searchByAddress,
    searchByMLSNumber,
    searchProperties,
    clearData,
    refreshProperty
  };
}

// Utility function to load cached property from localStorage
export function loadCachedMLSProperty() {
  try {
    const cached = localStorage.getItem('handoff-mls-property');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error loading cached MLS property:', error);
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