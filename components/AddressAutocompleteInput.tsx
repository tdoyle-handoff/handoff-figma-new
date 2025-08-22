import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Check, AlertCircle, Loader2, Navigation } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';
import type { AddressDetails, AddressSuggestion } from '../hooks/useAddressAutocomplete';

interface AddressAutocompleteInputProps {
  value?: string;
  onChange: (address: AddressDetails | null) => void;
  onAddressSelect?: (address: string, components: any) => void;
  onRawInputChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  country?: string;
  types?: string[];
  className?: string;
  showValidationStatus?: boolean;
  autoFocus?: boolean;
  clearOnSelect?: boolean;
  debugMode?: boolean;
}

export function AddressAutocompleteInput({
  value = '',
  onChange,
  onAddressSelect,
  onRawInputChange,
  placeholder = 'Start typing an address...',
  required = false,
  disabled = false,
  error,
  label = 'Property Address',
  helperText,
  country = 'US',
  types = ['address'],
  className = '',
  showValidationStatus = true,
  autoFocus = false,
  clearOnSelect = false,
  debugMode = false
}: AddressAutocompleteInputProps) {
  const [selectedKeyboardIndex, setSelectedKeyboardIndex] = useState(-1);
  const [hasUserInput, setHasUserInput] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    error: apiError,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion,
    clearSuggestions,
    selectedAddress,
    fallbackMode,
    apiKeyValid
  } = useAddressAutocomplete({
    onAddressSelect: (address) => {
      onChange(address);
      // Notify consumer with a simplified signature if provided
      onAddressSelect?.(address.formatted_address, { state: address.administrative_area_level_1 });
      if (clearOnSelect) {
        setQuery('');
        setHasUserInput(false);
      }
    },
    country,
    types,
    debugMode
  });

  // Sync external value with internal query
  useEffect(() => {
    if (value !== query && !hasUserInput) {
      setQuery(value);
    }
  }, [value, query, hasUserInput, setQuery]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setHasUserInput(true);
    setSelectedKeyboardIndex(-1);
    onRawInputChange?.(newValue);
    
    // Clear selected address if user modifies input
    if (selectedAddress && newValue !== selectedAddress.formatted_address) {
      onChange(null);
    }
  }, [setQuery, onRawInputChange, selectedAddress, onChange]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
    if (query.length >= 3) {
      setShowSuggestions(true);
    }
  }, [query.length, setShowSuggestions]);

  // Handle input blur with delay for suggestion selection
  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      setIsInputFocused(false);
      setShowSuggestions(false);
      setSelectedKeyboardIndex(-1);
    }, 150);
  }, [setShowSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedKeyboardIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedKeyboardIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedKeyboardIndex >= 0 && selectedKeyboardIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedKeyboardIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedKeyboardIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedKeyboardIndex]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback(async (suggestion: AddressSuggestion) => {
    await selectSuggestion(suggestion);
    setShowSuggestions(false);
    setSelectedKeyboardIndex(-1);
    setHasUserInput(false);
    inputRef.current?.blur();
  }, [selectSuggestion, setShowSuggestions]);

  // Handle manual address entry (fallback mode)
  const handleManualSubmit = useCallback(() => {
    if (!query.trim()) return;
    
    // Create manual address entry
    const manualAddress: AddressDetails = {
      formatted_address: query.trim(),
      place_id: `manual_${Date.now()}`,
      // Try to parse basic components
      street_number: query.match(/^\d+/)?.[0],
      route: query.replace(/^\d+\s*/, '').split(',')[0]?.trim(),
      locality: query.split(',')[1]?.trim(),
      administrative_area_level_1: query.match(/\b[A-Z]{2}\b/)?.[0],
      postal_code: query.match(/\b\d{5}(-\d{4})?\b/)?.[0],
      country: country.toUpperCase(),
    };
    
    onChange(manualAddress);
    setHasUserInput(false);
  }, [query, onChange, country]);

  // Scroll keyboard selected item into view
  useEffect(() => {
    if (selectedKeyboardIndex >= 0 && suggestionRefs.current[selectedKeyboardIndex]) {
      suggestionRefs.current[selectedKeyboardIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedKeyboardIndex]);

  // Get validation status
  const getValidationStatus = () => {
    if (apiError) return { type: 'error', message: apiError };
    if (error) return { type: 'error', message: error };
    if (selectedAddress) return { type: 'success', message: 'Valid address' };
    if (fallbackMode && query.length > 0) return { type: 'warning', message: 'Manual entry (API unavailable)' };
    return null;
  };

  const validationStatus = showValidationStatus ? getValidationStatus() : null;

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={`pl-10 pr-10 ${
              validationStatus?.type === 'error' ? 'border-destructive' : 
              validationStatus?.type === 'success' ? 'border-green-500' :
              validationStatus?.type === 'warning' ? 'border-yellow-500' : ''
            }`}
            autoComplete="street-address"
          />

          {/* Loading/Status Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            )}
            
            {!isLoading && validationStatus && (
              <>
                {validationStatus.type === 'success' && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {validationStatus.type === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {validationStatus.type === 'warning' && (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && isInputFocused && (suggestions.length > 0 || isLoading) && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg border">
            <CardContent className="p-0">
              {isLoading && suggestions.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  <div className="text-sm">Searching addresses...</div>
                </div>
              )}

              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.place_id}
                  ref={el => suggestionRefs.current[index] = el}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full text-left p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                    index === selectedKeyboardIndex ? 'bg-accent text-accent-foreground' : ''
                  }`}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {suggestions.length === 0 && !isLoading && query.length >= 3 && (
                <div className="p-4 text-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mx-auto mb-2" />
                  <div className="text-sm">No addresses found</div>
                  {fallbackMode && (
                    <div className="text-xs mt-1">Manual entry available</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Messages */}
      <div className="space-y-2">
        {/* API Status */}
        {debugMode && (
          <div className="flex flex-wrap gap-2">
            <Badge variant={apiKeyValid ? 'default' : 'secondary'}>
              {apiKeyValid ? 'Google Places Connected' : fallbackMode ? 'Manual Entry Mode' : 'Checking API...'}
            </Badge>
            {fallbackMode && (
              <Badge variant="outline">Manual Entry Available</Badge>
            )}
          </div>
        )}

        {/* API Status Info for Users */}
        {!debugMode && apiKeyValid === false && fallbackMode && (
          <div className="text-xs text-muted-foreground">
            💡 Address suggestions are currently unavailable. You can still enter addresses manually.
          </div>
        )}

        {/* Helper Text */}
        {helperText && !validationStatus && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}

        {/* Validation Status */}
        {validationStatus && (
          <Alert className={`${
            validationStatus.type === 'error' ? 'border-destructive' :
            validationStatus.type === 'success' ? 'border-green-500' :
            validationStatus.type === 'warning' ? 'border-yellow-500' : ''
          }`}>
            <AlertDescription className="text-sm">
              {validationStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Fallback Manual Entry */}
        {fallbackMode && query.length > 3 && !selectedAddress && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 text-sm text-muted-foreground">
              Google Places API is unavailable. You can enter the address manually.
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleManualSubmit}
              className="text-xs"
            >
              Use Address
            </Button>
          </div>
        )}

        {/* Selected Address Display */}
        {selectedAddress && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm text-green-800 dark:text-green-200">
                  Address Selected
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {selectedAddress.formatted_address}
                </div>
                {debugMode && selectedAddress.place_id.startsWith('manual_') && (
                  <Badge variant="outline" className="text-xs mt-2">
                    Manual Entry
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format address components
export function formatAddressComponents(address: AddressDetails): {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
} {
  const streetAddress = [address.street_number, address.route]
    .filter(Boolean)
    .join(' ');
  
  return {
    streetAddress,
    city: address.locality || '',
    state: address.administrative_area_level_1 || '',
    zipCode: address.postal_code || '',
    fullAddress: address.formatted_address
  };
}

// Helper function to validate address completeness
export function validateAddressCompleteness(address: AddressDetails | null): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  if (!address) {
    return {
      isValid: false,
      missingFields: ['address'],
      warnings: []
    };
  }

  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!address.formatted_address) {
    missingFields.push('formatted address');
  }

  // Check recommended fields
  if (!address.street_number && !address.route) {
    warnings.push('Street address appears incomplete');
  }
  
  if (!address.locality) {
    warnings.push('City is missing');
  }
  
  if (!address.administrative_area_level_1) {
    warnings.push('State is missing');
  }
  
  if (!address.postal_code) {
    warnings.push('ZIP code is missing');
  }

  // Manual entries might be less detailed
  if (address.place_id.startsWith('manual_')) {
    warnings.push('Manual entry - verify accuracy');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
}

export default AddressAutocompleteInput;