import { Fragment } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { MapPin, Home, CheckCircle, AlertCircle } from 'lucide-react';
import AddressAutocompleteInput, { formatAddressComponents, validateAddressCompleteness } from './AddressAutocompleteInput';
import type { AddressDetails } from '../hooks/useAddressAutocomplete';

interface PropertyAddressFormProps {
  onSubmit: (addressData: PropertyAddressData) => void;
  onSkip?: () => void;
  initialData?: Partial<PropertyAddressData>;
  isLoading?: boolean;
  showSkipOption?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export interface PropertyAddressData {
  // Primary address from Google Places API
  selectedAddress: AddressDetails | null;
  
  // Formatted address components
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Optional manual overrides
  apartmentUnit?: string;
  buildingName?: string;
  
  // Property details
  propertyType?: 'house' | 'condo' | 'townhouse' | 'apartment' | 'other';
  notes?: string;
  
  // Validation status
  isValidated: boolean;
  validationWarnings: string[];
}

export function PropertyAddressForm({
  onSubmit,
  onSkip,
  initialData,
  isLoading = false,
  showSkipOption = false,
  title = 'Property Address',
  description = 'Enter the complete address of the property you\'re buying.',
  className = ''
}: PropertyAddressFormProps) {
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(
    initialData?.selectedAddress || null
  );
  const [apartmentUnit, setApartmentUnit] = useState(initialData?.apartmentUnit || '');
  const [buildingName, setBuildingName] = useState(initialData?.buildingName || '');
  const [propertyType, setPropertyType] = useState<PropertyAddressData['propertyType']>(
    initialData?.propertyType || 'house'
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Calculate address components when address changes
  const addressComponents = selectedAddress ? formatAddressComponents(selectedAddress) : null;
  
  // Validate address completeness
  const validation = validateAddressCompleteness(selectedAddress);

  // Handle address selection
  const handleAddressSelect = (address: AddressDetails | null) => {
    setSelectedAddress(address);
    setFormErrors([]);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: string[] = [];
    
    // Validate required fields
    if (!selectedAddress) {
      errors.push('Please select or enter a property address');
    }
    
    if (!validation.isValid) {
      errors.push('Please complete the address information');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare form data
    const formData: PropertyAddressData = {
      selectedAddress,
      streetAddress: addressComponents?.streetAddress || '',
      city: addressComponents?.city || '',
      state: addressComponents?.state || '',
      zipCode: addressComponents?.zipCode || '',
      country: selectedAddress?.country || 'US',
      apartmentUnit: apartmentUnit.trim() || undefined,
      buildingName: buildingName.trim() || undefined,
      propertyType,
      notes: notes.trim() || undefined,
      isValidated: validation.isValid,
      validationWarnings: validation.warnings
    };

    onSubmit(formData);
  };

  const propertyTypeOptions = [
    { value: 'house', label: 'Single Family House' },
    { value: 'condo', label: 'Condominium' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Address Input */}
          <div className="space-y-4">
            <AddressAutocompleteInput
              label="Property Address"
              placeholder="Start typing the property address..."
              onChange={handleAddressSelect}
              required
              country="US"
              types={['address']}
              showValidationStatus
              helperText="Start typing to see address suggestions from Google Places"
              debugMode={false}
            />

            {/* Address Components Display */}
            {addressComponents && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Street Address</Label>
                  <div className="font-medium">{addressComponents.streetAddress || 'Not specified'}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <div className="font-medium">{addressComponents.city || 'Not specified'}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <div className="font-medium">{addressComponents.state || 'Not specified'}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">ZIP Code</Label>
                  <div className="font-medium">{addressComponents.zipCode || 'Not specified'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Address Details */}
          {selectedAddress && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium text-base">Additional Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apartment-unit">Apartment/Unit Number</Label>
                  <Input
                    id="apartment-unit"
                    type="text"
                    placeholder="Unit 2B, Apt 123, etc."
                    value={apartmentUnit}
                    onChange={(e) => setApartmentUnit(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="building-name">Building Name</Label>
                  <Input
                    id="building-name"
                    type="text"
                    placeholder="Building or complex name"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="property-type">Property Type</Label>
                <select
                  id="property-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyAddressData['propertyType'])}
                  className="mt-1 w-full px-3 py-2 border border-input-border rounded-md bg-input-background text-input-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  {propertyTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  placeholder="Any additional information about the property location..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-input-border rounded-md bg-input-background text-input-foreground focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                />
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {validation.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Address Validation Warnings:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Form Errors */}
          {formErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {formErrors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Status */}
          {selectedAddress && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              {validation.isValid ? (
                <Fragment>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Address is valid and complete
                  </span>
                </Fragment>
              ) : (
                <Fragment>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Address needs additional information
                  </span>
                </Fragment>
              )}
              
              <div className="ml-auto">
                <Badge variant={validation.isValid ? 'default' : 'secondary'}>
                  {selectedAddress.place_id.startsWith('manual_') ? 'Manual Entry' : 'Google Places'}
                </Badge>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
            {showSkipOption && onSkip && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                Skip for Now
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!selectedAddress || isLoading}
              className="flex-1 sm:flex-none sm:min-w-[120px]"
            >
              {isLoading ? (
                <Fragment>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </Fragment>
              ) : (
                <Fragment>
                  <MapPin className="h-4 w-4 mr-2" />
                  Continue
                </Fragment>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Example usage component
export function PropertyAddressFormExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<PropertyAddressData | null>(null);

  const handleSubmit = async (data: PropertyAddressData) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Property address data:', data);
    setSubmittedData(data);
    setIsLoading(false);
  };

  const handleSkip = () => {
    console.log('Address entry skipped');
  };

  if (submittedData) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Address Saved Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h3 className="font-medium mb-2">Property Address:</h3>
              <p className="text-sm">{submittedData.selectedAddress?.formatted_address}</p>
              
              {submittedData.apartmentUnit && (
                <p className="text-sm mt-1">Unit: {submittedData.apartmentUnit}</p>
              )}
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline">
                  {submittedData.propertyType?.toUpperCase()}
                </Badge>
                <Badge variant={submittedData.isValidated ? 'default' : 'secondary'}>
                  {submittedData.isValidated ? 'Validated' : 'Needs Review'}
                </Badge>
              </div>
            </div>
            
            <Button 
              onClick={() => setSubmittedData(null)} 
              variant="outline"
              className="w-full"
            >
              Edit Address
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PropertyAddressForm
      onSubmit={handleSubmit}
      onSkip={handleSkip}
      isLoading={isLoading}
      showSkipOption={true}
      title="Property Address Setup"
      description="Let's start by setting up your property address. We'll use Google Places to help validate and format the address correctly."
    />
  );
}

export default PropertyAddressForm;