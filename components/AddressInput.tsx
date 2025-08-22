import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Search, X, CheckCircle2, Edit3 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAddressAutocomplete, AddressDetails, AddressSuggestion } from '../hooks/useAddressAutocomplete';
import { useIsMobile } from './ui/use-mobile';

interface AddressInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (address: AddressDetails | null) => void;
  onInputChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  country?: string;
  types?: string[];
  className?: string;
  id?: string;
  autoFocus?: boolean;
  debugMode?: boolean; // Show API errors and detailed feedback
}

export function AddressInput({
  label = "Address",
  placeholder = "Start typing an address...",
  value = "",
  onChange,
  onInputChange,
  error,
  disabled = false,
  required = false,
  country = "US",
  types = ["address"],
  className = "",
  id,
  autoFocus = false,
  debugMode = false
}: AddressInputProps) {
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSelecting, setIsSelecting] = useState(false);

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
    onAddressSelect: onChange,
    country,
    types,
    debugMode
  });

  // Sync external value with internal query
  useEffect(() => {
    if (value !== query && !isSelecting) {
      setQuery(value);
    }
  }, [value, query, setQuery, isSelecting]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onInputChange?.(newValue);
    setSelectedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setInputFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur with improved timing
  const handleInputBlur = (e: React.FocusEvent) => {
    setInputFocused(false);
    
    // Don't hide if focus is moving to suggestions
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && suggestionsRef.current?.contains(relatedTarget)) {
      return;
    }
    
    // Hide suggestions after a delay
    setTimeout(() => {
      if (!isSelecting) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Handle suggestion selection with simplified logic
  const handleSuggestionSelect = async (suggestion: AddressSuggestion, index: number) => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    setSelectedIndex(index);
    setShowSuggestions(false);
    
    try {
      await selectSuggestion(suggestion);
    } catch (error) {
      console.error('Error selecting address:', error);
    } finally {
      setIsSelecting(false);
      setSelectedIndex(-1);
    }
  };

  // Handle clear button
  const handleClear = () => {
    setQuery('');
    onInputChange?.('');
    onChange?.(null);
    clearSuggestions();
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex], selectedIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayError = error || (debugMode && apiError);
  const showClearButton = query.length > 0 && !disabled;
  const hasValidAddress = selectedAddress && query === selectedAddress.formatted_address;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <Label 
            htmlFor={id}
            className={`${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
          >
            {label}
          </Label>
          {fallbackMode && (
            <Badge variant="secondary" className="text-xs">
              <Edit3 className="w-3 h-3 mr-1" />
              Manual Entry
            </Badge>
          )}
        </div>
      )}

      <div className="relative">
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
          {hasValidAddress ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : fallbackMode ? (
            <Edit3 className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Input field */}
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={fallbackMode ? "Enter address manually" : placeholder}
          disabled={disabled}
          className={`
            pl-10 ${showClearButton ? 'pr-10' : 'pr-4'}
            ${isMobile ? 'mobile-input' : ''}
            ${displayError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${hasValidAddress ? 'border-green-500 bg-green-50' : ''}
            transition-colors duration-200
          `}
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-describedby={displayError ? `${id}-error` : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `${id}-option-${selectedIndex}` : undefined}
        />

        {/* Clear button */}
        {showClearButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 hover:bg-gray-100 z-10"
            tabIndex={-1}
          >
            <X className="w-3 h-3" />
          </Button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Error message - only show in debug mode or if it's a user-provided error */}
      {(error || (debugMode && apiError)) && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error || apiError}
        </p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50"
          role="listbox"
          aria-label="Address suggestions"
        >

          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              id={`${id}-option-${index}`}
              className={`
                w-full px-4 py-3 text-left cursor-pointer border-b border-gray-100 last:border-b-0
                transition-all duration-150
                ${index === selectedIndex ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-gray-50'}
                ${isMobile ? 'mobile-button touch-target' : ''}
              `}
              onClick={() => handleSuggestionSelect(suggestion, index)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
              tabIndex={-1}
            >
              <div className="flex items-start gap-3">
                <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${index === selectedIndex ? 'text-blue-500' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${index === selectedIndex ? 'text-blue-900' : 'text-gray-900'}`}>
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && query.length >= 3 && suggestions.length === 0 && (!apiError || debugMode) && !fallbackMode && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-6 text-center">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-1">No addresses found</div>

          </div>
        </div>
      )}




    </div>
  );
}

// Helper component for displaying formatted address
export function FormattedAddress({ address }: { address: AddressDetails }) {
  return (
    <div className="space-y-1">
      <div className="font-medium">{address.formatted_address}</div>
      {address.geometry && (
        <div className="text-xs text-muted-foreground">
          Lat: {address.geometry.location.lat.toFixed(6)}, 
          Lng: {address.geometry.location.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}