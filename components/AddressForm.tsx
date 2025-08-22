import React, { useState, useCallback, useEffect } from 'react';
import { AddressInput } from './AddressInput';
import { AddressDetails } from '../hooks/useAddressAutocomplete';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useIsMobile } from './ui/use-mobile';
import { useMLSData } from '../hooks/useMLSData';
import { MLSPropertyCard } from './MLSPropertyCard';
import { MapPin, Edit2, Save, X, Search, AlertCircle, Home } from 'lucide-react';

export interface FormattedAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  formatted: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressFormProps {
  title?: string;
  description?: string;
  value?: FormattedAddress | null;
  onChange?: (address: FormattedAddress | null) => void;
  onValidate?: (address: FormattedAddress) => boolean;
  allowManualEdit?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  country?: string;
  autoFocus?: boolean;
  enableMLSLookup?: boolean;
  onMLSPropertyFound?: (property: any) => void;
  showMLSResults?: boolean;
  debugMode?: boolean; // Show API errors and detailed feedback
}

export function AddressForm({
  title = "Property Address",
  description = "Enter the complete address of the property",
  value,
  onChange,
  onValidate,
  allowManualEdit = true,
  required = false,
  disabled = false,
  className = "",
  country = "US",
  autoFocus = false,
  enableMLSLookup = false,
  onMLSPropertyFound,
  showMLSResults = true,
  debugMode = false
}: AddressFormProps) {
  const isMobile = useIsMobile();
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState<Partial<FormattedAddress>>({
    street: value?.street || '',
    city: value?.city || '',
    state: value?.state || '',
    zipCode: value?.zipCode || '',
    country: value?.country || 'US'
  });

  // MLS integration
  const {
    property: mlsProperty,
    isLoading: mlsLoading,
    error: mlsError,
    searchByAddress,
    clearData: clearMLSData
  } = useMLSData({
    onPropertyFound: onMLSPropertyFound,
    autoSearch: enableMLSLookup
  });

  // Convert AddressDetails to FormattedAddress
  const convertToFormattedAddress = useCallback((details: AddressDetails): FormattedAddress => {
    const street = [details.street_number, details.route].filter(Boolean).join(' ');
    
    return {
      street: street || '',
      city: details.locality || '',
      state: details.administrative_area_level_1 || '',
      zipCode: details.postal_code || '',
      country: details.country || 'US',
      formatted: details.formatted_address,
      placeId: details.place_id,
      coordinates: details.geometry ? {
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng
      } : undefined
    };
  }, []);

  // Handle autocomplete address selection
  const handleAddressSelect = useCallback((addressDetails: AddressDetails | null) => {
    if (addressDetails) {
      const formattedAddress = convertToFormattedAddress(addressDetails);
      
      // Validate if validation function provided
      if (onValidate && !onValidate(formattedAddress)) {
        return;
      }
      
      onChange?.(formattedAddress);
      
      // Trigger MLS lookup if enabled
      if (enableMLSLookup && addressDetails.formatted_address) {
        console.log('Triggering MLS lookup for:', addressDetails.formatted_address);
        searchByAddress(addressDetails.formatted_address);
      }
    } else {
      onChange?.(null);
      clearMLSData();
    }
  }, [convertToFormattedAddress, onChange, onValidate, enableMLSLookup, searchByAddress, clearMLSData]);

  // Handle manual address input
  const handleManualChange = useCallback((field: keyof FormattedAddress, newValue: string) => {
    setManualAddress(prev => ({ ...prev, [field]: newValue }));
  }, []);

  // Save manual address
  const handleSaveManual = useCallback(() => {
    const { street, city, state, zipCode, country } = manualAddress;
    
    if (!street || !city || !state || !zipCode) {
      return; // Basic validation
    }

    const formattedAddress: FormattedAddress = {
      street: street || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      country: country || 'US',
      formatted: `${street}, ${city}, ${state} ${zipCode}${country && country !== 'US' ? `, ${country}` : ''}`
    };

    // Validate if validation function provided
    if (onValidate && !onValidate(formattedAddress)) {
      return;
    }

    onChange?.(formattedAddress);
    setIsManualMode(false);
  }, [manualAddress, onChange, onValidate]);

  // Cancel manual editing
  const handleCancelManual = useCallback(() => {
    setManualAddress({
      street: value?.street || '',
      city: value?.city || '',
      state: value?.state || '',
      zipCode: value?.zipCode || '',
      country: value?.country || 'US'
    });
    setIsManualMode(false);
  }, [value]);

  // Switch to manual mode
  const handleEditManual = useCallback(() => {
    setManualAddress({
      street: value?.street || '',
      city: value?.city || '',
      state: value?.state || '',
      zipCode: value?.zipCode || '',
      country: value?.country || 'US'
    });
    setIsManualMode(true);
  }, [value]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!isManualMode ? (
          <>
            {/* Autocomplete Mode */}
            <AddressInput
              label={required ? "Search Address *" : "Search Address"}
              placeholder="Start typing an address..."
              value={value?.formatted || ''}
              onChange={handleAddressSelect}
              disabled={disabled}
              required={required}
              country={country}
              types={['address']}
              autoFocus={autoFocus}
              debugMode={debugMode}
            />

            {/* Selected address display */}
            {value && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Selected Address</h4>
                    <div className="space-y-1 text-sm text-green-800">
                      <div>{value.street}</div>
                      <div>{value.city}, {value.state} {value.zipCode}</div>
                      {value.country !== 'US' && <div>{value.country}</div>}
                    </div>
                    {value.coordinates && (
                      <div className="text-xs text-green-600 mt-2">
                        📍 {value.coordinates.lat.toFixed(6)}, {value.coordinates.lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                  
                  {allowManualEdit && !disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleEditManual}
                      className="text-green-700 hover:text-green-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* MLS Results */}
            {enableMLSLookup && value && (
              <div className="mt-4 space-y-4">
                {mlsLoading && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Searching MLS Database</h4>
                        <p className="text-xs text-blue-700">Looking up property details...</p>
                      </div>
                    </div>
                  </div>
                )}

                {mlsError && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-900">MLS Lookup Failed</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                          {mlsError.message.includes('not configured') 
                            ? 'MLS integration is not configured. Property details are not available.'
                            : 'Unable to find this property in the MLS database. It may be unlisted or the address may need to be more specific.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {mlsProperty && showMLSResults && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-medium">Property Found in MLS</h4>
                    </div>
                    <MLSPropertyCard 
                      property={mlsProperty}
                      compact={true}
                      showPhotos={true}
                      onSelect={onMLSPropertyFound}
                    />
                  </div>
                )}

                {enableMLSLookup && value && !mlsLoading && !mlsProperty && !mlsError && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Search className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Property Not Found in MLS</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          This property was not found in the MLS database. It may be unlisted, off-market, or require manual property details entry.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual edit option */}
            {allowManualEdit && !disabled && !value && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Can't find your address?
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEditManual}
                  className={isMobile ? 'mobile-button-sm' : ''}
                >
                  Enter Manually
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Manual Entry Mode */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Manual Address Entry</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelManual}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="manual-street" className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
                    Street Address
                  </Label>
                  <Input
                    id="manual-street"
                    type="text"
                    placeholder="123 Main Street"
                    value={manualAddress.street || ''}
                    onChange={(e) => handleManualChange('street', e.target.value)}
                    className={isMobile ? 'mobile-input' : ''}
                    disabled={disabled}
                  />
                </div>

                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  <div>
                    <Label htmlFor="manual-city" className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
                      City
                    </Label>
                    <Input
                      id="manual-city"
                      type="text"
                      placeholder="City"
                      value={manualAddress.city || ''}
                      onChange={(e) => handleManualChange('city', e.target.value)}
                      className={isMobile ? 'mobile-input' : ''}
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="manual-state" className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
                      State
                    </Label>
                    <Input
                      id="manual-state"
                      type="text"
                      placeholder="CA"
                      value={manualAddress.state || ''}
                      onChange={(e) => handleManualChange('state', e.target.value)}
                      className={isMobile ? 'mobile-input' : ''}
                      disabled={disabled}
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="manual-zip" className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
                      ZIP Code
                    </Label>
                    <Input
                      id="manual-zip"
                      type="text"
                      placeholder="12345"
                      value={manualAddress.zipCode || ''}
                      onChange={(e) => handleManualChange('zipCode', e.target.value)}
                      className={isMobile ? 'mobile-input' : ''}
                      disabled={disabled}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={handleSaveManual}
                    disabled={!manualAddress.street || !manualAddress.city || !manualAddress.state || !manualAddress.zipCode}
                    className={`flex-1 ${isMobile ? 'mobile-button' : ''}`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Address
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelManual}
                    className={isMobile ? 'mobile-button' : ''}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}