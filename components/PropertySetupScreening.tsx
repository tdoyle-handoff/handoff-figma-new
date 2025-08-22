import React, { useState, useCallback, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Home, Search, FileText, DollarSign, Users, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useIsMobile } from './ui/use-mobile';
import { AddressInput } from './AddressInput';
import { AddressDetails } from '../hooks/useAddressAutocomplete';

interface ScreeningData {
  buyingStage: 'searching' | 'under-contract' | 'pre-approved' | 'just-starting';
  experienceLevel: 'first-time' | 'experienced' | 'investor';
  hasSpecificProperty: boolean;
  propertyAddress?: string;
  primaryGoal: 'primary-residence' | 'investment' | 'vacation-home' | 'relocation';
  timeframe: 'immediate' | '3-months' | '6-months' | 'exploring';
  hasPreApproval: boolean;
  contractSigned: boolean;
  needsRealtor: boolean;
  nextAction: 'search-properties' | 'focus-property' | 'get-preapproved' | 'sign-contract';
}

interface PropertySetupScreeningProps {
  onComplete: (screeningData: ScreeningData) => void;
  onSkip: () => void;
  isEditMode?: boolean;
  existingData?: ScreeningData | null;
}

export function PropertySetupScreening({ onComplete, onSkip, isEditMode = false, existingData }: PropertySetupScreeningProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [screeningData, setScreeningData] = useState<Partial<ScreeningData>>({});
  const isMobile = useIsMobile();
  const SINGLE_PAGE = true;

  // Load existing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingData) {
      setScreeningData(existingData);
    } else if (isEditMode) {
      // Try to load from localStorage if existingData is not provided
      try {
        const saved = localStorage.getItem('handoff-screening-data');
        if (saved) {
          const parsed = JSON.parse(saved);
          setScreeningData(parsed);
        }
      } catch (error) {
        console.warn('Error loading existing screening data:', error);
      }
    }

    // Auto-populate property address from various sources
    const populatePropertyAddress = () => {
      if (!screeningData.propertyAddress) {
        // Check for Attom data
        const attomData = localStorage.getItem('handoff-attom-property-data');
        if (attomData) {
          try {
            const parsedAttom = JSON.parse(attomData);
            if (parsedAttom.address?.formatted) {
              setScreeningData(prev => ({ ...prev, propertyAddress: parsedAttom.address.formatted }));
              return;
            }
          } catch (error) {
            console.warn('Error parsing Attom data:', error);
          }
        }

        // Check for existing property data
        const propertyData = localStorage.getItem('handoff-property-data');
        if (propertyData) {
          try {
            const parsedProperty = JSON.parse(propertyData);
            if (parsedProperty.propertyAddress) {
              setScreeningData(prev => ({ ...prev, propertyAddress: parsedProperty.propertyAddress }));
              return;
            }
          } catch (error) {
            console.warn('Error parsing property data:', error);
          }
        }
      }
    };

    populatePropertyAddress();
  }, [isEditMode, existingData]);

  const updateScreeningData = useCallback((updates: Partial<ScreeningData>) => {
    setScreeningData(prev => {
      const newData = { ...prev, ...updates };
      
      // In edit mode, save immediately to localStorage
      if (isEditMode) {
        try {
          localStorage.setItem('handoff-screening-data', JSON.stringify(newData));
        } catch (error) {
          console.warn('Error saving screening data:', error);
        }
      }
      
      return newData;
    });
  }, [isEditMode]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete the screening
      const finalData: ScreeningData = {
        buyingStage: screeningData.buyingStage || 'just-starting',
        experienceLevel: screeningData.experienceLevel || 'first-time',
        hasSpecificProperty: screeningData.hasSpecificProperty || false,
        propertyAddress: screeningData.propertyAddress,
        primaryGoal: screeningData.primaryGoal || 'primary-residence',
        timeframe: screeningData.timeframe || 'exploring',
        hasPreApproval: screeningData.hasPreApproval || false,
        contractSigned: screeningData.contractSigned || false,
        needsRealtor: screeningData.needsRealtor || false,
        nextAction: determineNextAction(),
      };
      
      // Store screening data
      localStorage.setItem('handoff-screening-data', JSON.stringify(finalData));
      onComplete(finalData);
    }
  }, [currentStep, screeningData, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const determineNextAction = (): ScreeningData['nextAction'] => {
    if (screeningData.buyingStage === 'under-contract') {
      return 'focus-property';
    }
    if (screeningData.hasSpecificProperty) {
      return 'focus-property';
    }
    if (!screeningData.hasPreApproval && screeningData.buyingStage !== 'just-starting') {
      return 'get-preapproved';
    }
    if (screeningData.buyingStage === 'searching' || screeningData.timeframe === 'immediate') {
      return 'search-properties';
    }
    return 'search-properties';
  };

  // Enhanced validation with auto-enable for pre-populated addresses
  const canProceed = useCallback(() => {
    let canContinue = false;
    let missingField = '';
    
    switch (currentStep) {
      case 0: 
        canContinue = !!screeningData.buyingStage;
        missingField = canContinue ? '' : 'buying stage';
        break;
      case 1: 
        canContinue = !!screeningData.experienceLevel;
        missingField = canContinue ? '' : 'experience level';
        break;
      case 2: 
        // Auto-enable if property address is already populated OR user makes a selection
        const hasPropertySelection = screeningData.hasSpecificProperty !== undefined;
        const hasPopulatedAddress = !!screeningData.propertyAddress;
        canContinue = hasPropertySelection || hasPopulatedAddress;
        
        // If address is pre-populated and user hasn't made a selection, auto-select "yes"
        if (hasPopulatedAddress && !hasPropertySelection) {
          updateScreeningData({ hasSpecificProperty: true });
          canContinue = true;
        }
        
        missingField = canContinue ? '' : 'specific property choice';
        break;
      case 3: 
        canContinue = !!screeningData.primaryGoal;
        missingField = canContinue ? '' : 'primary goal';
        break;
      case 4: 
        canContinue = !!screeningData.timeframe;
        missingField = canContinue ? '' : 'timeframe';
        break;
      case 5: 
        canContinue = screeningData.hasPreApproval !== undefined;
        missingField = canContinue ? '' : 'pre-approval status';
        break;
      default: 
        canContinue = true;
    }
    
    // Debug logging to help identify the issue
    console.log('PropertySetupScreening - Step validation:', {
      currentStep,
      canContinue,
      missingField,
      screeningData,
      stepTitle: steps[currentStep]?.title,
      hasPopulatedAddress: !!screeningData.propertyAddress
    });
    
    return canContinue;
  }, [currentStep, screeningData, updateScreeningData]);

  const steps = [
    {
      title: "What's your current buying stage?",
      description: "This helps us understand where you are in the process",
      icon: <Search className="w-6 h-6" />,
      component: (
        <div className="space-y-3">
          {[
            { id: 'just-starting', label: 'Just starting to think about buying', desc: 'Exploring options and learning' },
            { id: 'searching', label: 'Actively searching for properties', desc: 'Looking at listings and touring homes' },
            { id: 'under-contract', label: 'Under contract on a property', desc: 'Already have a signed purchase agreement' },
            { id: 'pre-approved', label: 'Pre-approved but still searching', desc: 'Have financing ready, looking for the right home' },
          ].map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                screeningData.buyingStage === option.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md hover:bg-muted/50'
              }`}
              onClick={() => updateScreeningData({ buyingStage: option.id as ScreeningData['buyingStage'] })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </div>
                  {screeningData.buyingStage === option.id && (
                    <Badge variant="default" className="ml-2">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      title: "How would you describe your experience?",
      description: "This helps us tailor our guidance to your needs",
      icon: <Users className="w-6 h-6" />,
      component: (
        <div className="space-y-3">
          {[
            { id: 'first-time', label: 'First-time home buyer', desc: 'This will be my first home purchase' },
            { id: 'experienced', label: 'Experienced buyer', desc: 'I\'ve bought homes before' },
            { id: 'investor', label: 'Real estate investor', desc: 'Buying for investment purposes' },
          ].map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                screeningData.experienceLevel === option.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md hover:bg-muted/50'
              }`}
              onClick={() => updateScreeningData({ experienceLevel: option.id as ScreeningData['experienceLevel'] })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </div>
                  {screeningData.experienceLevel === option.id && (
                    <Badge variant="default" className="ml-2">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      title: "Do you have a specific property in mind?",
      description: "This determines what information we'll need to collect",
      icon: <Home className="w-6 h-6" />,
      component: (
        <div className="space-y-4">
          {/* Pre-populated address notification */}
          {screeningData.propertyAddress && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Property Address Found
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {screeningData.propertyAddress}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    We've automatically detected your property address. You can proceed or update it below.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {[
              { id: true, label: 'Yes, I have a specific property', desc: 'I know the exact property I want to buy' },
              { id: false, label: 'No, I\'m still searching', desc: 'I\'m looking at multiple options' },
            ].map((option) => (
              <Card 
                key={option.id.toString()}
                className={`cursor-pointer transition-all duration-200 ${
                  screeningData.hasSpecificProperty === option.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md hover:bg-muted/50'
                }`}
                onClick={() => updateScreeningData({ hasSpecificProperty: option.id })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{option.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                    </div>
                    {screeningData.hasSpecificProperty === option.id && (
                      <Badge variant="default" className="ml-2">Selected</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(screeningData.hasSpecificProperty || screeningData.propertyAddress) && (
            <div className="space-y-2 pt-4 border-t">
              <AddressInput
                label="Property Address"
                placeholder="Start typing the property address..."
                value={screeningData.propertyAddress || ''}
                onInputChange={(value) => updateScreeningData({ propertyAddress: value })}
                onChange={(addressDetails: AddressDetails | null) => {
                  if (addressDetails) {
                    updateScreeningData({ propertyAddress: addressDetails.formatted_address });
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                We'll search the Attom database for property details when you enter an address
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: "What's your primary goal?",
      description: "This helps us understand your priorities",
      icon: <Target className="w-6 h-6" />,
      component: (
        <div className="space-y-3">
          {[
            { id: 'primary-residence', label: 'Primary residence', desc: 'This will be my main home' },
            { id: 'investment', label: 'Investment property', desc: 'For rental income or appreciation' },
            { id: 'vacation-home', label: 'Vacation home', desc: 'Second home for personal use' },
            { id: 'relocation', label: 'Relocation', desc: 'Moving for work or family reasons' },
          ].map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                screeningData.primaryGoal === option.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md hover:bg-muted/50'
              }`}
              onClick={() => updateScreeningData({ primaryGoal: option.id as ScreeningData['primaryGoal'] })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </div>
                  {screeningData.primaryGoal === option.id && (
                    <Badge variant="default" className="ml-2">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      title: "What's your timeframe?",
      description: "This helps us prioritize your action items",
      icon: <FileText className="w-6 h-6" />,
      component: (
        <div className="space-y-3">
          {[
            { id: 'immediate', label: 'Ready to buy immediately', desc: 'Want to make an offer within 30 days' },
            { id: '3-months', label: 'Within 3 months', desc: 'Actively looking, planning to buy soon' },
            { id: '6-months', label: 'Within 6 months', desc: 'Preparing to buy in the near future' },
            { id: 'exploring', label: 'Just exploring', desc: 'Learning about the process, no rush' },
          ].map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                screeningData.timeframe === option.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md hover:bg-muted/50'
              }`}
              onClick={() => updateScreeningData({ timeframe: option.id as ScreeningData['timeframe'] })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </div>
                  {screeningData.timeframe === option.id && (
                    <Badge variant="default" className="ml-2">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      title: "Do you have financing pre-approval?",
      description: "This affects your buying power and strategy",
      icon: <DollarSign className="w-6 h-6" />,
      component: (
        <div className="space-y-3">
          {[
            { id: true, label: 'Yes, I have pre-approval', desc: 'I have a pre-approval letter from a lender' },
            { id: false, label: 'No, not yet', desc: 'I still need to get pre-approved for financing' },
          ].map((option) => (
            <Card 
              key={option.id.toString()}
              className={`cursor-pointer transition-all duration-200 ${
                screeningData.hasPreApproval === option.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md hover:bg-muted/50'
              }`}
              onClick={() => updateScreeningData({ hasPreApproval: option.id })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </div>
                  {screeningData.hasPreApproval === option.id && (
                    <Badge variant="default" className="ml-2">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (SINGLE_PAGE) {
    return (
      <div className={`min-h-screen bg-background ${isMobile ? 'page-content-mobile' : 'page-content'}`}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {isEditMode ? 'Update your experience' : "Let's personalize your experience"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Update your responses to customize your property setup' : 'A few quick questions to customize your property setup'}
            </p>
          </div>

          {/* All screening questions rendered together */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Onboarding Questions</CardTitle>
              <CardDescription>Answer the questions below. All fields are visible on this page.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Step 0: Buying stage */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-foreground">What's your current buying stage?</h3>
                  </div>
                  {[
                    { id: 'just-starting', label: 'Just starting to think about buying', desc: 'Exploring options and learning' },
                    { id: 'searching', label: 'Actively searching for properties', desc: 'Looking at listings and touring homes' },
                    { id: 'under-contract', label: 'Under contract on a property', desc: 'Already have a signed purchase agreement' },
                    { id: 'pre-approved', label: 'Pre-approved but still searching', desc: 'Have financing ready, looking for the right home' },
                  ].map((option) => (
                    <Card 
                      key={option.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        screeningData.buyingStage === option.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md hover:bg-muted/50'
                      }`}
                      onClick={() => updateScreeningData({ buyingStage: option.id as ScreeningData['buyingStage'] })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{option.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                          </div>
                          {screeningData.buyingStage === option.id && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Step 1: Experience */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-foreground">How would you describe your experience?</h3>
                  </div>
                  {[
                    { id: 'first-time', label: 'First-time home buyer', desc: "This will be my first home purchase" },
                    { id: 'experienced', label: 'Experienced buyer', desc: "I've bought homes before" },
                    { id: 'investor', label: 'Real estate investor', desc: 'Buying for investment purposes' },
                  ].map((option) => (
                    <Card 
                      key={option.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        screeningData.experienceLevel === option.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md hover:bg-muted/50'
                      }`}
                      onClick={() => updateScreeningData({ experienceLevel: option.id as ScreeningData['experienceLevel'] })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{option.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                          </div>
                          {screeningData.experienceLevel === option.id && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Step 2: Specific property + address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-foreground">Do you have a specific property in mind?</h3>
                  </div>

                  {screeningData.propertyAddress && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">Property Address Found</p>
                          <p className="text-sm text-green-700 mt-1">{screeningData.propertyAddress}</p>
                          <p className="text-xs text-green-600 mt-1">We've automatically detected your property address. You can proceed or update it below.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      { id: true, label: 'Yes, I have a specific property', desc: 'I know the exact property I want to buy' },
                      { id: false, label: "No, I'm still searching", desc: "I'm looking at multiple options" },
                    ].map((option) => (
                      <Card 
                        key={option.id.toString()}
                        className={`cursor-pointer transition-all duration-200 ${
                          screeningData.hasSpecificProperty === option.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:shadow-md hover:bg-muted/50'
                        }`}
                        onClick={() => updateScreeningData({ hasSpecificProperty: option.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{option.label}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                            </div>
                            {screeningData.hasSpecificProperty === option.id && (
                              <Badge variant="default" className="ml-2">Selected</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {(screeningData.hasSpecificProperty || screeningData.propertyAddress) && (
                    <div className="space-y-2 pt-4 border-t">
                      {/* Simple address input to avoid dependency loop */}
                      <label className="text-sm font-medium text-foreground">Property Address</label>
                      <input
                        type="text"
                        placeholder="Start typing the property address..."
                        value={screeningData.propertyAddress || ''}
                        onChange={(e) => updateScreeningData({ propertyAddress: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isMobile ? 'mobile-input' : ''}`}
                      />
                      <p className="text-xs text-muted-foreground">We'll search the Attom database for property details when you enter an address</p>
                    </div>
                  )}
                </div>

                {/* Step 3: Primary goal */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-foreground">What's your primary goal?</h3>
                  </div>
                  {[
                    { id: 'primary-residence', label: 'Primary residence', desc: 'This will be my main home' },
                    { id: 'investment', label: 'Investment property', desc: 'For rental income or appreciation' },
                    { id: 'vacation-home', label: 'Vacation home', desc: 'Second home for personal use' },
                    { id: 'relocation', label: 'Relocation', desc: 'Moving for work or family reasons' },
                  ].map((option) => (
                    <Card 
                      key={option.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        screeningData.primaryGoal === option.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md hover:bg-muted/50'
                      }`}
                      onClick={() => updateScreeningData({ primaryGoal: option.id as ScreeningData['primaryGoal'] })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{option.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                          </div>
                          {screeningData.primaryGoal === option.id && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Step 4: Timeframe */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-foreground">What's your timeframe?</h3>
                  </div>
                  {[
                    { id: 'immediate', label: 'Ready to buy immediately', desc: 'Want to make an offer within 30 days' },
                    { id: '3-months', label: 'Within 3 months', desc: 'Actively looking, planning to buy soon' },
                    { id: '6-months', label: 'Within 6 months', desc: 'Preparing to buy in the near future' },
                    { id: 'exploring', label: 'Just exploring', desc: 'Learning about the process, no rush' },
                  ].map((option) => (
                    <Card 
                      key={option.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        screeningData.timeframe === option.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md hover:bg-muted/50'
                      }`}
                      onClick={() => updateScreeningData({ timeframe: option.id as ScreeningData['timeframe'] })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{option.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                          </div>
                          {screeningData.timeframe === option.id && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Step 5: Pre-approval */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-foreground">Do you have financing pre-approval?</h3>
                  </div>
                  {[
                    { id: true, label: 'Yes, I have pre-approval', desc: 'I have a pre-approval letter from a lender' },
                    { id: false, label: 'No, not yet', desc: 'I still need to get pre-approved for financing' },
                  ].map((option) => (
                    <Card 
                      key={option.id.toString()}
                      className={`cursor-pointer transition-all duration-200 ${
                        screeningData.hasPreApproval === option.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md hover:bg-muted/50'
                      }`}
                      onClick={() => updateScreeningData({ hasPreApproval: option.id })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{option.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                          </div>
                          {screeningData.hasPreApproval === option.id && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            {!isEditMode && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className={`text-muted-foreground hover:text-foreground ${isMobile ? 'mobile-button' : ''}`}
              >
                Skip for now
              </Button>
            )}
            <Button
              onClick={() => {
                const finalData: ScreeningData = {
                  buyingStage: screeningData.buyingStage || 'just-starting',
                  experienceLevel: screeningData.experienceLevel || 'first-time',
                  hasSpecificProperty: screeningData.hasSpecificProperty || false,
                  propertyAddress: screeningData.propertyAddress,
                  primaryGoal: screeningData.primaryGoal || 'primary-residence',
                  timeframe: screeningData.timeframe || 'exploring',
                  hasPreApproval: screeningData.hasPreApproval || false,
                  contractSigned: screeningData.contractSigned || false,
                  needsRealtor: screeningData.needsRealtor || false,
                  nextAction: determineNextAction(),
                };
                localStorage.setItem('handoff-screening-data', JSON.stringify(finalData));
                onComplete(finalData);
              }}
              className={isMobile ? 'mobile-button' : ''}
            >
              {isEditMode ? 'Save Changes' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'page-content-mobile' : 'page-content'}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {isEditMode ? 'Update your experience' : 'Let\'s personalize your experience'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update your responses to customize your property setup' : 'A few quick questions to customize your property setup'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                {currentStepData.icon}
              </div>
            </div>
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStepData.component}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={isMobile ? 'mobile-button' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {!isEditMode && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className={`text-muted-foreground hover:text-foreground ${isMobile ? 'mobile-button' : ''}`}
              >
                Skip for now
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`${isMobile ? 'mobile-button' : ''} ${
                !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={!canProceed() ? 'Please make a selection to continue' : ''}
            >
              {currentStep === steps.length - 1 ? (isEditMode ? 'Save Changes' : 'Complete') : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}