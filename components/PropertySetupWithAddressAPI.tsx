import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle, MapPin, Home, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import AddressAutocompleteInput from './AddressAutocompleteInput';
import { PropertyAddressForm, type PropertyAddressData } from './PropertyAddressForm';
import { useAuth } from '../hooks/useAuth';
import type { AddressDetails } from '../hooks/useAddressAutocomplete';

interface PropertySetupWithAddressAPIProps {
  onComplete: (data: PropertySetupData) => void;
  onSkip?: () => void;
  initialData?: Partial<PropertySetupData>;
  className?: string;
}

export interface PropertySetupData {
  // Address information
  address: PropertyAddressData;
  
  // Property details
  purchasePrice?: number;
  estimatedClosingDate?: string;
  loanAmount?: number;
  downPayment?: number;
  
  // Setup status
  isComplete: boolean;
  completedSteps: string[];
}

type SetupStep = 'address' | 'details' | 'financing' | 'review';

export function PropertySetupWithAddressAPI({
  onComplete,
  onSkip,
  initialData,
  className = ''
}: PropertySetupWithAddressAPIProps) {
  const { userProfile, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<SetupStep>('address');
  const [setupData, setSetupData] = useState<Partial<PropertySetupData>>(initialData || {});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 'address', label: 'Property Address', icon: MapPin },
    { id: 'details', label: 'Property Details', icon: Home },
    { id: 'financing', label: 'Purchase Details', icon: CheckCircle },
    { id: 'review', label: 'Review & Complete', icon: ArrowRight }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Handle address step completion
  const handleAddressComplete = useCallback(async (addressData: PropertyAddressData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Update setup data
      const updatedData = {
        ...setupData,
        address: addressData,
        completedSteps: ['address']
      };
      setSetupData(updatedData);

      // Save address to user profile
      if (userProfile) {
        await updateUserProfile({
          property_address: addressData.selectedAddress?.formatted_address,
          property_setup_complete: false,
          property_data: {
            address: addressData,
            setup_progress: {
              current_step: 'details',
              completed_steps: ['address']
            }
          }
        });
      }

      // Move to next step
      setCurrentStep('details');
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setupData, userProfile, updateUserProfile]);

  // Handle property details step
  const handleDetailsComplete = useCallback((detailsData: any) => {
    const updatedData = {
      ...setupData,
      ...detailsData,
      completedSteps: [...(setupData.completedSteps || []), 'details']
    };
    setSetupData(updatedData);
    setCurrentStep('financing');
  }, [setupData]);

  // Handle financing step
  const handleFinancingComplete = useCallback((financingData: any) => {
    const updatedData = {
      ...setupData,
      ...financingData,
      completedSteps: [...(setupData.completedSteps || []), 'financing']
    };
    setSetupData(updatedData);
    setCurrentStep('review');
  }, [setupData]);

  // Handle final completion
  const handleFinalComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const finalData: PropertySetupData = {
        address: setupData.address!,
        purchasePrice: setupData.purchasePrice,
        estimatedClosingDate: setupData.estimatedClosingDate,
        loanAmount: setupData.loanAmount,
        downPayment: setupData.downPayment,
        isComplete: true,
        completedSteps: ['address', 'details', 'financing', 'review']
      };

      // Update user profile with completion
      if (userProfile) {
        await updateUserProfile({
          property_setup_complete: true,
          property_data: finalData
        });
      }

      onComplete(finalData);
    } catch (err) {
      console.error('Error completing setup:', err);
      setError('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setupData, userProfile, updateUserProfile, onComplete]);

  // Navigate to specific step
  const navigateToStep = (stepId: SetupStep) => {
    // Only allow navigation to completed steps or the next step
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    if (stepIndex <= currentIndex || setupData.completedSteps?.includes(stepId)) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle className="text-xl">Property Setup</CardTitle>
              <p className="text-sm text-muted-foreground">
                Let's get your property information set up with address validation.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Navigation */}
            <div className="flex flex-wrap gap-2">
              {steps.map((step, index) => {
                const isCompleted = setupData.completedSteps?.includes(step.id as SetupStep);
                const isCurrent = step.id === currentStep;
                const isAccessible = index <= currentStepIndex || isCompleted;
                const Icon = step.icon;

                return (
                  <button
                    key={step.id}
                    onClick={() => navigateToStep(step.id as SetupStep)}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : isAccessible
                        ? 'bg-muted hover:bg-muted-foreground/10'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{step.label}</span>
                    {isCompleted && <CheckCircle className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 'address' && (
          <PropertyAddressForm
            onSubmit={handleAddressComplete}
            onSkip={onSkip}
            initialData={setupData.address}
            isLoading={isLoading}
            showSkipOption={!!onSkip}
            title="Property Address"
            description="Enter the address of the property you're purchasing. We'll use Google Places API to validate and format the address."
          />
        )}

        {currentStep === 'details' && (
          <PropertyDetailsStep
            onSubmit={handleDetailsComplete}
            initialData={setupData}
            addressData={setupData.address!}
          />
        )}

        {currentStep === 'financing' && (
          <FinancingDetailsStep
            onSubmit={handleFinancingComplete}
            initialData={setupData}
            addressData={setupData.address!}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            setupData={setupData as PropertySetupData}
            onComplete={handleFinalComplete}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

// Property Details Step Component
function PropertyDetailsStep({
  onSubmit,
  initialData,
  addressData
}: {
  onSubmit: (data: any) => void;
  initialData: any;
  addressData: PropertyAddressData;
}) {
  const [purchasePrice, setPurchasePrice] = useState(initialData.purchasePrice || '');
  const [estimatedClosingDate, setEstimatedClosingDate] = useState(initialData.estimatedClosingDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      estimatedClosingDate: estimatedClosingDate || undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Property Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add details about your property purchase.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Property Address</span>
            </div>
            <p className="text-sm">{addressData.selectedAddress?.formatted_address}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{addressData.propertyType?.toUpperCase()}</Badge>
              {addressData.apartmentUnit && (
                <Badge variant="outline">Unit {addressData.apartmentUnit}</Badge>
              )}
            </div>
          </div>

          {/* Purchase Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Purchase Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  placeholder="500,000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="pl-8 w-full px-3 py-2 border border-input-border rounded-md bg-input-background text-input-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Estimated Closing Date</label>
              <input
                type="date"
                value={estimatedClosingDate}
                onChange={(e) => setEstimatedClosingDate(e.target.value)}
                className="w-full px-3 py-2 border border-input-border rounded-md bg-input-background text-input-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Continue to Financing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Financing Details Step Component
function FinancingDetailsStep({
  onSubmit,
  initialData,
  addressData
}: {
  onSubmit: (data: any) => void;
  initialData: any;
  addressData: PropertyAddressData;
}) {
  const [loanAmount, setLoanAmount] = useState(initialData.loanAmount || '');
  const [downPayment, setDownPayment] = useState(initialData.downPayment || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      loanAmount: loanAmount ? parseFloat(loanAmount) : undefined,
      downPayment: downPayment ? parseFloat(downPayment) : undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Financing Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Optional: Add financing information for better planning.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Loan Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  placeholder="400,000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="pl-8 w-full px-3 py-2 border border-input-border rounded-md bg-input-background text-input-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Down Payment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  placeholder="100,000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="pl-8 w-full px-3 py-2 border border-input-border rounded-md bg-input-background text-input-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Continue to Review
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Review Step Component
function ReviewStep({
  setupData,
  onComplete,
  isLoading
}: {
  setupData: PropertySetupData;
  onComplete: () => void;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Review & Complete
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review your property information and complete the setup.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Address Summary */}
          <div className="space-y-3">
            <h3 className="font-medium">Property Address</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{setupData.address.selectedAddress?.formatted_address}</p>
              {setupData.address.apartmentUnit && (
                <p className="text-sm text-muted-foreground">Unit: {setupData.address.apartmentUnit}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{setupData.address.propertyType?.toUpperCase()}</Badge>
                <Badge variant={setupData.address.isValidated ? 'default' : 'secondary'}>
                  {setupData.address.isValidated ? 'Validated' : 'Manual Entry'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Purchase Details */}
          {(setupData.purchasePrice || setupData.estimatedClosingDate) && (
            <div className="space-y-3">
              <h3 className="font-medium">Purchase Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {setupData.purchasePrice && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground">Purchase Price</div>
                    <div className="font-medium">${setupData.purchasePrice.toLocaleString()}</div>
                  </div>
                )}
                {setupData.estimatedClosingDate && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground">Estimated Closing</div>
                    <div className="font-medium">{new Date(setupData.estimatedClosingDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Financing Details */}
          {(setupData.loanAmount || setupData.downPayment) && (
            <div className="space-y-3">
              <h3 className="font-medium">Financing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {setupData.loanAmount && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground">Loan Amount</div>
                    <div className="font-medium">${setupData.loanAmount.toLocaleString()}</div>
                  </div>
                )}
                {setupData.downPayment && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground">Down Payment</div>
                    <div className="font-medium">${setupData.downPayment.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complete Button */}
          <div className="pt-4 border-t">
            <Button 
              onClick={onComplete} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing Setup...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Property Setup
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PropertySetupWithAddressAPI;