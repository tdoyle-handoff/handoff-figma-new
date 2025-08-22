import { useState, useCallback, useRef, useEffect } from 'react';
import { projectId, SUPABASE_ANON_KEY } from '../utils/supabase/info';

export interface AddressSuggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export interface AddressDetails {
  formatted_address: string;
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  administrative_area_level_2?: string;
  postal_code?: string;
  country?: string;
  place_id: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface UseAddressAutocompleteProps {
  onAddressSelect?: (address: AddressDetails) => void;
  debounceMs?: number;
  country?: string;
  types?: string[];
  debugMode?: boolean; // Show API errors and detailed feedback
}

interface UseAddressAutocompleteReturn {
  query: string;
  setQuery: (query: string) => void;
  suggestions: AddressSuggestion[];
  isLoading: boolean;
  error: string | null;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  selectSuggestion: (suggestion: AddressSuggestion) => Promise<void>;
  clearSuggestions: () => void;
  selectedAddress: AddressDetails | null;
  fallbackMode: boolean;
  apiKeyValid: boolean | null;
}

export function useAddressAutocomplete({
  onAddressSelect,
  debounceMs = 300,
  country = 'US',
  types = ['address'],
  debugMode = false
}: UseAddressAutocompleteProps = {}): UseAddressAutocompleteReturn {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(false);
  const [fallbackMode, setFallbackMode] = useState(true);
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Get server API endpoints
  const getServerUrl = useCallback(() => {
    try {
      return {
        baseUrl: `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5`,
        headers: {
'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      };
    } catch (error) {
      console.error('Failed to get Supabase info:', error);
      return null;
    }
  }, []);

  // Helper function to safely extract error message
  const getErrorMessage = useCallback((errorData: unknown): string => {
    if (typeof errorData === 'string') {
      return errorData;
    }
    if (errorData && typeof errorData === 'object') {
      const obj = errorData as { error?: unknown; message?: unknown };
      if (typeof obj.error === 'string') {
        return obj.error;
      }
      if (typeof obj.message === 'string') {
        return obj.message;
      }
      if (obj && typeof (obj as any).error?.message === 'string') {
        return (obj as any).error.message as string;
      }
    }
    return 'Unknown error occurred';
  }, []);

  // Helper function to check if error is API key related
  const isApiKeyError = useCallback((errorMessage: string): boolean => {
    const apiKeyErrorIndicators = [
      'invalid',
      'denied',
      'api key',
      'key is not',
      'key appears to be',
      'REQUEST_DENIED',
      'INVALID_REQUEST'
    ];
    
    const lowerMessage = errorMessage.toLowerCase();
    return apiKeyErrorIndicators.some(indicator => lowerMessage.includes(indicator));
  }, []);

  // Check if API key is valid
  const checkApiKeyValidity = useCallback(async () => {
    // Google Places disabled globally: force manual entry mode
    setApiKeyValid(false);
    setFallbackMode(true);
    if (debugMode) {
      setError('Address suggestions disabled. Manual entry is available.');
    }
  }, [debugMode]);

  // Fetch address suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    // Suggestions disabled: always clear list and remain in manual mode
    setSuggestions([]);
    setIsLoading(false);
    setFallbackMode(true);
    setApiKeyValid(false);
    if (debugMode && searchQuery.length >= 3) {
      setError('Address suggestions are disabled. Please enter the address manually.');
    }
  }, [debugMode]);

  // Fetch detailed address information
  const fetchAddressDetails = useCallback(async (placeId: string): Promise<AddressDetails | null> => {
    // Suggestions/details disabled: return null and stay in manual mode
    setIsLoading(false);
    setFallbackMode(true);
    setApiKeyValid(false);
    if (debugMode) {
      setError('Address details lookup disabled.');
    }
    return null;
  }, [getServerUrl, debugMode, getErrorMessage]);

  // Select a suggestion and fetch details
  const selectSuggestion = useCallback(async (suggestion: AddressSuggestion) => {
    setQuery(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);

    const addressDetails = await fetchAddressDetails(suggestion.place_id);
    if (addressDetails) {
      setSelectedAddress(addressDetails);
      onAddressSelect?.(addressDetails);
    }
  }, [fetchAddressDetails, onAddressSelect]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  }, []);

  // Handle query changes with debouncing
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSelectedAddress(null);

    setShowSuggestions(true);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newQuery);
    }, debounceMs);
  }, [fetchSuggestions, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    suggestions,
    isLoading,
    error,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion,
    clearSuggestions,
    selectedAddress,
    fallbackMode,
    apiKeyValid
  };
}
