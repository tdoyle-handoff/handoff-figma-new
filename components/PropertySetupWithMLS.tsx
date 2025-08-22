import { Fragment } from 'react';
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AddressForm, FormattedAddress } from './AddressForm';
import { MLSPropertyDetails } from './MLSPropertyDetails';
import { useIsMobile } from './ui/use-mobile';
import { MLSProperty } from '../types/mls';
import { formatCurrency } from '../hooks/useMLSData';
import { 
  Home, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  MapPin, 
  DollarSign,
  Calendar,
  FileText,
  Users,
  Settings
} from 'lucide-react';

interface PropertySetupWithMLSProps {
  onComplete: (propertyData: PropertySetupData) => void;
  onBack?: () => void;
  initialData?: Partial<PropertySetupData>;
  className?: string;
}

export interface PropertySetupData {
  address: FormattedAddress;
  mlsProperty?: MLSProperty;
  customDetails?: {
    purchase_price?: number;
    closing_date?: string;
    inspection_date?: string;
    notes?: string;
  };
  setup_complete: boolean;
  created_at: string;
}

export function PropertySetupWithMLS({
  onComplete,
  onBack,
  initialData,
  className = ""
}: PropertySetupWithMLSProps) {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<FormattedAddress | null>(
    initialData?.address || null
  );
  const [selectedMLSProperty, setSelectedMLSProperty] = useState<MLSProperty | null>(
    initialData?.mlsProperty || null
  );
  const [customDetails, setCustomDetails] = useState(initialData?.customDetails || {});
  const [showMLSDetails, setShowMLSDetails] = useState(false);

  const steps = [
    {
      id: 'address',
      title: 'Property Address',
      description: 'Enter the property address to search MLS database',
      icon: <MapPin className="w-5 h-5" />,
      required: true
    },
    {
      id: 'details',
      title: 'Property Details',
      description: 'Review MLS data and add custom information',
      icon: <Home className="w-5 h-5" />,
      required: false
    },
    {
      id: 'financial',
      title: 'Transaction Details',
      description: 'Add purchase price and key dates',
      icon: <DollarSign className="w-5 h-5" />,
      required: false
    },
    {
      id: 'review',
      title: 'Review & Complete',
      description: 'Confirm all information is correct',
      icon: <Check className="w-5 h-5" />,
      required: false
    }
  ];

  const currentStepData = steps[currentStep];

  // Handle address selection
  const handleAddressSelect = useCallback((address: FormattedAddress | null) => {
    setSelectedAddress(address);
    if (!address) {
      setSelectedMLSProperty(null);
    }
  }, []);

  // Handle MLS property found
  const handleMLSPropertyFound = useCallback((property: MLSProperty) => {
    setSelectedMLSProperty(property);
    console.log('MLS Property found:', property);
  }, []);

  // Handle MLS property selection
  const handleMLSPropertySelect = useCallback((property: MLSProperty) => {
    setSelectedMLSProperty(property);
    setShowMLSDetails(false);
    
    // Auto-fill custom details from MLS data
    if (property.listing_details.list_price) {
      setCustomDetails(prev => ({
        ...prev,
        purchase_price: prev.purchase_price || property.listing_details.list_price
      }));
    }
  }, []);

  // Handle next step
  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack?.();
    }
  }, [currentStep, onBack]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (!selectedAddress) return;

    const propertyData: PropertySetupData = {
      address: selectedAddress,
      mlsProperty: selectedMLSProperty || undefined,
      customDetails,
      setup_complete: true,
      created_at: new Date().toISOString()
    };

    // Store in localStorage for persistence
    localStorage.setItem('handoff-property-setup', JSON.stringify(propertyData));
    
    onComplete(propertyData);
  }, [selectedAddress, selectedMLSProperty, customDetails, onComplete]);

  // Check if current step can proceed
  const canProceedFromStep = useCallback(() => {
    switch (currentStep) {
      case 0: // Address step
        return !!selectedAddress;
      case 1: // Details step
        return true; // Optional step
      case 2: // Financial step
        return true; // Optional step
      case 3: // Review step
        return !!selectedAddress;
      default:
        return true;
    }
  }, [currentStep, selectedAddress]);

  // Show MLS details modal
  if (showMLSDetails && selectedMLSProperty) {
    return (
      <div className={`w-full ${className}`}>
        <MLSPropertyDetails
          property={selectedMLSProperty}
          onBack={() => setShowMLSDetails(false)}
          onSelect={handleMLSPropertySelect}
          className="max-w-6xl mx-auto"
        />
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Progress Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Property Setup</h1>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {currentStepData.title}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                  index === currentStep
                    ? 'bg-primary/10 text-primary'
                    : index < currentStep
                    ? 'bg-green-50 text-green-700'
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`flex-shrink-0 ${index <= currentStep ? 'text-current' : 'text-muted-foreground'}`}>
                  {step.icon}
                </div>
                <span className={`font-medium ${isMobile ? 'text-xs' : ''}`}>{step.title}</span>
                {index < currentStep && <Check className="w-4 h-4 text-green-600 ml-auto" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData.icon}
            {currentStepData.title}
          </CardTitle>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Address */}
          {currentStep === 0 && (
            <AddressForm
              title="Property Address"
              description="Enter the complete address to search the MLS database for property details"
              value={selectedAddress}
              onChange={handleAddressSelect}
              required={true}
              enableMLSLookup={true}
              onMLSPropertyFound={handleMLSPropertyFound}
              showMLSResults={true}
              autoFocus={true}
            />
          )}

          {/* Step 1: Property Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {selectedAddress && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Selected Property</h3>
                  <p className="text-green-800">{selectedAddress.formatted}</p>
                </div>
              )}

              {selectedMLSProperty ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">MLS Property Data</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMLSDetails(true)}
                    >
                      View Full Details
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">List Price</div>
                      <div className="font-medium">
                        {formatCurrency(selectedMLSProperty.listing_details.list_price)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Property Type</div>
                      <div className="font-medium">{selectedMLSProperty.property_details.property_type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">MLS Number</div>
                      <div className="font-medium">{selectedMLSProperty.mls_number}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">MLS Data Found</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Property details have been automatically populated from the MLS database. 
                        You can proceed to the next step or add custom information.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-900">No MLS Data Available</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This property was not found in the MLS database. You can still continue 
                        with the setup and add property details manually in the next steps.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Financial Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Purchase Price</label>
                  <input
                    type="number"
                    placeholder="750000"
                    value={customDetails.purchase_price || ''}
                    onChange={(e) => setCustomDetails(prev => ({
                      ...prev,
                      purchase_price: e.target.value ? Number(e.target.value) : undefined
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  {selectedMLSProperty?.listing_details.list_price && (
                    <p className="text-xs text-muted-foreground mt-1">
                      MLS List Price: {formatCurrency(selectedMLSProperty.listing_details.list_price)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Closing Date</label>
                  <input
                    type="date"
                    value={customDetails.closing_date || ''}
                    onChange={(e) => setCustomDetails(prev => ({
                      ...prev,
                      closing_date: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Inspection Date</label>
                  <input
                    type="datetime-local"
                    value={customDetails.inspection_date || ''}
                    onChange={(e) => setCustomDetails(prev => ({
                      ...prev,
                      inspection_date: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  placeholder="Any additional notes about this property..."
                  value={customDetails.notes || ''}
                  onChange={(e) => setCustomDetails(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-3">Property Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-right">{selectedAddress?.formatted}</span>
                  </div>
                  
                  {selectedMLSProperty && (
                    <Fragment>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MLS Number</span>
                        <span>{selectedMLSProperty.mls_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type</span>
                        <span>{selectedMLSProperty.property_details.property_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MLS List Price</span>
                        <span>{formatCurrency(selectedMLSProperty.listing_details.list_price)}</span>
                      </div>
                    </Fragment>
                  )}
                  
                  {customDetails.purchase_price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Price</span>
                      <span className="font-medium">{formatCurrency(customDetails.purchase_price)}</span>
                    </div>
                  )}
                  
                  {customDetails.closing_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closing Date</span>
                      <span>{new Date(customDetails.closing_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {customDetails.inspection_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inspection Date</span>
                      <span>{new Date(customDetails.inspection_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900">Ready to Complete Setup</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your property information is ready. Click "Complete Setup" to save 
                    and begin managing your real estate transaction.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className={isMobile ? 'mobile-button' : ''}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Back' : 'Previous'}
        </Button>

        <div className="flex items-center gap-3">
          {currentStep < steps.length - 1 && (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(steps.length - 1)}
              className="text-muted-foreground"
            >
              Skip to Review
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceedFromStep()}
            className={isMobile ? 'mobile-button' : ''}
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            {currentStep < steps.length - 1 && <Check className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}