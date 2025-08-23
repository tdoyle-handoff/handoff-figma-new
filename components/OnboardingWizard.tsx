import { Fragment } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Calendar, 
  Scale, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  User,
  Clock,
  Building,
  Target,
  CreditCard,
  FileText,
  Shield,
  Bed,
  Bath,
  ListChecks,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { useIsMobile } from './ui/use-mobile';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import type { AttomAddressComponents } from './AddressInputEnhanced';
const handoffLogo = 'https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fdf51dc32668b459882a7a106ef4658d1?format=webp&width=800';

// Property types with icons
const PROPERTY_TYPES = [
  { value: 'single-family', label: 'Single Family Home', icon: '🏠' },
  { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
  { value: 'condo', label: 'Condominium', icon: '🏢' },
  { value: 'multi-family', label: 'Multi-Family', icon: '🏘️' },
  { value: 'land', label: 'Land/Lot', icon: '🌳' },
  { value: 'commercial', label: 'Commercial', icon: '🏪' },
  { value: 'other', label: 'Other', icon: '🏗️' }
];

// Financing options
const FINANCING_OPTIONS = [
  { value: 'conventional', label: 'Conventional Loan', description: 'Traditional mortgage with 3-20% down' },
  { value: 'fha', label: 'FHA Loan', description: 'Government-backed, as low as 3.5% down' },
  { value: 'va', label: 'VA Loan', description: 'For veterans, often 0% down' },
  { value: 'usda', label: 'USDA Loan', description: 'Rural properties, 0% down' },
  { value: 'cash', label: 'Cash Purchase', description: 'No financing needed' },
  { value: 'other', label: 'Other/Unsure', description: 'Will determine later' }
];

// Timeline options
const TIMELINE_OPTIONS = [
  { value: 'immediately', label: 'Ready to buy now', description: 'Actively looking, ready to purchase' },
  { value: '3-months', label: 'Within 3 months', description: 'Serious buyer, preparing to purchase' },
  { value: '6-months', label: 'Within 6 months', description: 'Planning ahead, getting prepared' },
  { value: '1-year', label: 'Within a year', description: 'Early planning stage' },
  { value: 'exploring', label: 'Just exploring', description: 'Learning about the process' }
];

// Buying stage options
const BUYING_STAGES = [
  { value: 'just-looking', label: 'Just looking' },
  { value: 'researching', label: 'Researching & planning' },
  { value: 'touring', label: 'Touring homes' },
  { value: 'making-offers', label: 'Making offers' },
  { value: 'under-contract', label: 'Under contract' }
];

// Intended use options
const HOME_USES = [
  { value: 'primary', label: 'Primary residence' },
  { value: 'investment', label: 'Investment property' },
  { value: 'vacation', label: 'Vacation/second home' }
];

const BEDROOM_OPTIONS = ['Studio', '1+', '2+', '3+', '4+', '5+'];
const BATHROOM_OPTIONS = ['1+', '1.5+', '2+', '2.5+', '3+', '3.5+'];

const FEATURE_OPTIONS = [
  'Garage',
  'Yard',
  'Pool',
  'Updated kitchen',
  'Air conditioning',
  'In-unit laundry',
  'Walkability',
  'Good schools'
];

// State-specific legal requirements (simplified)
const STATE_LEGAL_INFO = {
  'CA': {
    name: 'California',
    attorney: 'Optional',
    disclosure: 'Extensive seller disclosures required',
    inspection: '17-day default inspection period',
    templates: ['Purchase Agreement', 'Seller Disclosures', 'Lead Paint Disclosure']
  },
  'NY': {
    name: 'New York',
    attorney: 'Required for closing',
    disclosure: 'Property condition disclosure required',
    inspection: 'Negotiable inspection period',
    templates: ['Purchase Contract', 'Attorney Review Clause', 'Property Disclosure']
  },
  'TX': {
    name: 'Texas',
    attorney: 'Optional',
    disclosure: 'Seller disclosure required',
    inspection: '7-10 day option period typical',
    templates: ['Purchase Agreement', 'Seller Disclosure', 'Option Period Agreement']
  },
  'FL': {
    name: 'Florida',
    attorney: 'Optional',
    disclosure: 'Limited disclosure requirements',
    inspection: 'Negotiable inspection period',
    templates: ['Purchase Contract', 'Property Disclosures', 'As-Is Agreement']
  },
  // Add more states as needed
  'DEFAULT': {
    name: 'United States',
    attorney: 'Varies by state',
    disclosure: 'State-specific requirements',
    inspection: 'Varies by local practice',
    templates: ['Standard Purchase Agreement', 'Property Disclosures', 'Inspection Clauses']
  }
};

interface OnboardingData {
  // Step 1: Location & Property Type
  propertyAddress: string | import('../hooks/useAddressAutocomplete').AddressDetails;
  propertyType: string;
  propertyState: string;

  // Home search preferences
  buyerStage: string; // stage in the process
  homeUse: string; // primary, investment, vacation
  bedrooms: string; // desired bedrooms
  bathrooms: string; // desired bathrooms
  features: string[]; // desired features
  mustHaves: string; // free-text must-haves
  niceToHaves: string; // free-text nice-to-haves
  
  // Step 2: Budget & Financing
  priceRange: string;
  downPayment: string;
  financingType: string;
  preApproved: boolean;
  
  // Step 3: Timeline
  purchaseTimeline: string;
  moveInDate: string;
  
  // Step 4: Legal/Jurisdiction (auto-detected)
  legalRequirements: any;
  requiredDocuments: string[];
  
  // User info
  buyerName: string;
  buyerEmail: string;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

const HandoffLogo = ({ className = "", size = "h-20" }: { className?: string; size?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <img 
      src={handoffLogo} 
      alt="Handoff Logo" 
      className={`${size} w-auto max-w-full mx-auto block`}
    />
  </div>
);

const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
              ${isCompleted ? 'bg-green-600 text-white' : ''}
              ${isCurrent ? 'bg-primary text-white' : ''}
              ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
            `}>
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div className="progress-arrow">
                <div className={`progress-arrow-line ${isCompleted ? 'progress-arrow-completed' : 'progress-arrow-pending'}`}></div>
                <div className={`progress-arrow-head ${isCompleted ? 'progress-arrow-completed' : 'progress-arrow-pending'}`}></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<Partial<OnboardingData>>({
    propertyAddress: '',
    propertyType: '',
    propertyState: '',

    buyerStage: '',
    homeUse: '',
    bedrooms: '',
    bathrooms: '',
    features: [],
    mustHaves: '',
    niceToHaves: '',

    priceRange: '',
    downPayment: '',
    financingType: '',
    preApproved: false,
    purchaseTimeline: '',
    moveInDate: '',
    legalRequirements: null,
    requiredDocuments: [],
    buyerName: '',
    buyerEmail: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();

  // Prefill from pre-onboarding address if available
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('preOnboardingAddress');
      if (!raw) return;
      const a = JSON.parse(raw) as AttomAddressComponents;
      const formatted = a.formatted_address || [a.address1, a.address2].filter(Boolean).join(', ');
      setFormData(prev => ({
        ...prev,
        propertyAddress: formatted,
        propertyState: a.state || prev.propertyState || ''
      }));
    } catch (e) {
      console.warn('Failed to hydrate onboarding address:', e);
    }
  }, []);

  // Ensure body has proper classes for mobile
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-device', 'setup-wizard');
      document.documentElement.classList.add('mobile-device', 'setup-wizard');
    }
    
    return () => {
      document.body.classList.remove('setup-wizard');
      document.documentElement.classList.remove('setup-wizard');
    };
  }, [isMobile]);

  // Auto-detect state from address and set legal requirements
  useEffect(() => {
    if (formData.propertyAddress && formData.propertyState) {
      const stateCode = formData.propertyState.toUpperCase();
      const legalInfo = STATE_LEGAL_INFO[stateCode as keyof typeof STATE_LEGAL_INFO] || STATE_LEGAL_INFO.DEFAULT;
      
      setFormData(prev => ({
        ...prev,
        legalRequirements: legalInfo,
        requiredDocuments: legalInfo.templates
      }));
    }
  }, [formData.propertyAddress, formData.propertyState]);

  const updateFormData = useCallback((updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        {
          const addrValid = typeof formData.propertyAddress === 'string'
            ? formData.propertyAddress.trim()
            : formData.propertyAddress?.formatted_address?.trim();
          if (!addrValid) {
            newErrors.propertyAddress = 'Property location is required';
          }
        }
        if (!formData.propertyType) {
          newErrors.propertyType = 'Property type is required';
        }
        break;
      case 2:
        if (!formData.priceRange) {
          newErrors.priceRange = 'Price range is required';
        }
        if (!formData.financingType) {
          newErrors.financingType = 'Financing type is required';
        }
        break;
      case 3:
        if (!formData.purchaseTimeline) {
          newErrors.purchaseTimeline = 'Purchase timeline is required';
        }
        break;
      case 4:
        if (!formData.buyerName?.trim()) {
          newErrors.buyerName = 'Your name is required';
        }
        if (!formData.buyerEmail?.trim()) {
          newErrors.buyerEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
          newErrors.buyerEmail = 'Please enter a valid email address';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((s) => s + 1);
      } else {
        onComplete?.(formData as OnboardingData);
      }
    }
  }, [currentStep, formData, onComplete, validateStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleAddressSelect = useCallback((address: string, components: any) => {
    const state = components?.state || components?.administrative_area_level_1 || '';
    updateFormData({
      propertyAddress: address,
      propertyState: state
    });
  }, [updateFormData]);

// Step 1: Location & Property Type
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold">Where are you looking?</h2>
        <p className="text-muted-foreground">Tell us about the property location and type you're interested in.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="propertyAddress">Property Location</Label>
            <AddressAutocompleteInput
              value={(typeof formData.propertyAddress === 'string' ? formData.propertyAddress : formData.propertyAddress?.formatted_address) || ''}
              onChange={(addr) => updateFormData({ propertyAddress: addr || '' })}
              onRawInputChange={(val) => updateFormData({ propertyAddress: val })}
              onAddressSelect={handleAddressSelect}
              placeholder="Enter city, state, or specific address..."
            className={errors.propertyAddress ? 'border-red-500' : ''}
          />
          {errors.propertyAddress && (
            <p className="text-sm text-red-600">{errors.propertyAddress}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Property Type</Label>
          <RadioGroup 
            value={formData.propertyType || ''} 
            onValueChange={(value) => updateFormData({ propertyType: value })}
            className="grid grid-cols-1 gap-3"
          >
            {PROPERTY_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={type.value} id={type.value} />
                <label htmlFor={type.value} className="flex items-center space-x-3 cursor-pointer flex-1">
                  <span className="font-medium">{type.label}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
          {errors.propertyType && (
            <p className="text-sm text-red-600">{errors.propertyType}</p>
          )}
        </div>

        {/* New: Home search preferences */}
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Where are you in the process?</Label>
              <Select value={formData.buyerStage || ''} onValueChange={(value) => updateFormData({ buyerStage: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your stage" />
                </SelectTrigger>
                <SelectContent>
                  {BUYING_STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Intended use</Label>
              <Select value={formData.homeUse || ''} onValueChange={(value) => updateFormData({ homeUse: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intended use" />
                </SelectTrigger>
                <SelectContent>
                  {HOME_USES.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bedrooms</Label>
              <Select value={formData.bedrooms || ''} onValueChange={(value) => updateFormData({ bedrooms: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {BEDROOM_OPTIONS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bathrooms</Label>
              <Select value={formData.bathrooms || ''} onValueChange={(value) => updateFormData({ bathrooms: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {BATHROOM_OPTIONS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Desired features</Label>
            <div className="flex flex-wrap gap-2">
              {FEATURE_OPTIONS.map((f) => {
                const active = (formData.features || []).includes(f);
                return (
                  <button
                    type="button"
                    key={f}
                    onClick={() => {
                      const set = new Set(formData.features || []);
                      if (set.has(f)) set.delete(f); else set.add(f);
                      updateFormData({ features: Array.from(set) });
                    }}
                    className={`px-3 py-1 rounded-full border text-sm transition ${active ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-muted/50'}`}
                  >
                    <ListChecks className="w-3 h-3 inline mr-1" /> {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Must-haves (optional)</Label>
              <Input
                type="text"
                placeholder="e.g., garage, fenced yard, office"
                value={formData.mustHaves || ''}
                onChange={(e) => updateFormData({ mustHaves: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nice-to-haves (optional)</Label>
              <Input
                type="text"
                placeholder="e.g., pool, finished basement"
                value={formData.niceToHaves || ''}
                onChange={(e) => updateFormData({ niceToHaves: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Budget & Financing
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold">What's your budget?</h2>
        <p className="text-muted-foreground">Help us understand your budget and financing preferences.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="priceRange">Price Range</Label>
          <Select value={formData.priceRange || ''} onValueChange={(value) => updateFormData({ priceRange: value })}>
            <SelectTrigger className={errors.priceRange ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-200k">Under $200,000</SelectItem>
              <SelectItem value="200k-300k">$200,000 - $300,000</SelectItem>
              <SelectItem value="300k-500k">$300,000 - $500,000</SelectItem>
              <SelectItem value="500k-750k">$500,000 - $750,000</SelectItem>
              <SelectItem value="750k-1m">$750,000 - $1,000,000</SelectItem>
              <SelectItem value="1m-1.5m">$1,000,000 - $1,500,000</SelectItem>
              <SelectItem value="over-1.5m">Over $1,500,000</SelectItem>
            </SelectContent>
          </Select>
          {errors.priceRange && (
            <p className="text-sm text-red-600">{errors.priceRange}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="downPayment">Down Payment</Label>
          <Select value={formData.downPayment || ''} onValueChange={(value) => updateFormData({ downPayment: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select down payment amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-5">3% - 5%</SelectItem>
              <SelectItem value="5-10">5% - 10%</SelectItem>
              <SelectItem value="10-15">10% - 15%</SelectItem>
              <SelectItem value="15-20">15% - 20%</SelectItem>
              <SelectItem value="20-plus">20% or more</SelectItem>
              <SelectItem value="cash">Cash purchase</SelectItem>
              <SelectItem value="unsure">Not sure yet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Financing Type</Label>
          <RadioGroup 
            value={formData.financingType || ''} 
            onValueChange={(value) => updateFormData({ financingType: value })}
            className="grid grid-cols-1 gap-3"
          >
            {FINANCING_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <label htmlFor={option.value} className="cursor-pointer flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </label>
              </div>
            ))}
          </RadioGroup>
          {errors.financingType && (
            <p className="text-sm text-red-600">{errors.financingType}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 p-3 border rounded-lg">
          <input
            type="checkbox"
            id="preApproved"
            checked={formData.preApproved || false}
            onChange={(e) => updateFormData({ preApproved: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="preApproved" className="text-sm cursor-pointer">
            I am pre-approved for a mortgage
          </label>
        </div>
      </div>
    </div>
  );

  // Step 3: Purchase Timeline
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-semibold">When do you want to buy?</h2>
        <p className="text-muted-foreground">Tell us about your timeline so we can prioritize the right tasks.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Purchase Timeline</Label>
          <RadioGroup 
            value={formData.purchaseTimeline || ''} 
            onValueChange={(value) => updateFormData({ purchaseTimeline: value })}
            className="grid grid-cols-1 gap-3"
          >
            {TIMELINE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <label htmlFor={option.value} className="cursor-pointer flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {option.label}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                </label>
              </div>
            ))}
          </RadioGroup>
          {errors.purchaseTimeline && (
            <p className="text-sm text-red-600">{errors.purchaseTimeline}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="moveInDate">Preferred Move-in Date (Optional)</Label>
          <Input
            id="moveInDate"
            type="date"
            value={formData.moveInDate || ''}
            onChange={(e) => updateFormData({ moveInDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );

  // Step 4: Legal Requirements & Contact Info
  const renderStep4 = () => {
    const legalInfo = formData.legalRequirements || STATE_LEGAL_INFO.DEFAULT;
    
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4">
            <Scale className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-semibold">Legal Requirements</h2>
          <p className="text-muted-foreground">Based on your location, here are the legal requirements for your state.</p>
        </div>

        {/* Legal Requirements Card */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Shield className="w-5 h-5" />
              {legalInfo.name} Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-orange-800">Attorney Required</h4>
                <p className="text-sm">{legalInfo.attorney}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-orange-800">Disclosure Requirements</h4>
                <p className="text-sm">{legalInfo.disclosure}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-orange-800">Inspection Period</h4>
                <p className="text-sm">{legalInfo.inspection}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-orange-800 mb-2">Required Documents</h4>
              <div className="flex flex-wrap gap-2">
                {legalInfo.templates.map((template: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    {template}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="buyerName">Full Name</Label>
            <Input
              id="buyerName"
              type="text"
              placeholder="Enter your full name"
              value={formData.buyerName || ''}
              onChange={(e) => updateFormData({ buyerName: e.target.value })}
              className={errors.buyerName ? 'border-red-500' : ''}
            />
            {errors.buyerName && (
              <p className="text-sm text-red-600">{errors.buyerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerEmail">Email Address</Label>
            <Input
              id="buyerEmail"
              type="email"
              placeholder="Enter your email"
              value={formData.buyerEmail || ''}
              onChange={(e) => updateFormData({ buyerEmail: e.target.value })}
              className={errors.buyerEmail ? 'border-red-500' : ''}
            />
            {errors.buyerEmail && (
              <p className="text-sm text-red-600">{errors.buyerEmail}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const validateAll = useCallback((): boolean => {
    const ok1 = validateStep(1);
    const ok2 = validateStep(2);
    const ok3 = validateStep(3);
    const ok4 = validateStep(4);
    return ok1 && ok2 && ok3 && ok4;
  }, [validateStep]);

  const handleSubmitAll = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateAll()) {
      try {
        const prefs = {
          buyerStage: formData.buyerStage || '',
          homeUse: formData.homeUse || '',
          bedrooms: formData.bedrooms || '',
          bathrooms: formData.bathrooms || '',
          features: Array.isArray(formData.features) ? formData.features : [],
          mustHaves: formData.mustHaves || '',
          niceToHaves: formData.niceToHaves || ''
        };
        localStorage.setItem('handoff-home-search-preferences', JSON.stringify(prefs));
      } catch (e) {
        console.warn('Failed to save home search preferences:', e);
      }
      onComplete(formData as OnboardingData);
    }
  }, [validateAll, formData, onComplete]);

  const renderSinglePage = () => {
    const legalInfo = formData.legalRequirements || STATE_LEGAL_INFO.DEFAULT;

    return (
      <form onSubmit={handleSubmitAll} className="space-y-8">
        {/* Section 1: Location & Property Type */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold">Where are you looking?</h2>
            <p className="text-muted-foreground">Tell us about the property location and type you're interested in.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Location</Label>
              <AddressAutocompleteInput
                value={(typeof formData.propertyAddress === 'string' ? formData.propertyAddress : formData.propertyAddress?.formatted_address) || ''}
                onChange={(addr) => updateFormData({ propertyAddress: addr || '' })}
                onRawInputChange={(val) => updateFormData({ propertyAddress: val })}
                onAddressSelect={handleAddressSelect}
                placeholder="Enter city, state, or specific address..."
                className={errors.propertyAddress ? 'border-red-500' : ''}
              />
              {errors.propertyAddress && (
                <p className="text-sm text-red-600">{errors.propertyAddress}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Property Type</Label>
              <RadioGroup 
                value={formData.propertyType || ''} 
                onValueChange={(value) => updateFormData({ propertyType: value })}
                className="grid grid-cols-1 gap-3"
              >
                {PROPERTY_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <label htmlFor={type.value} className="flex items-center space-x-3 cursor-pointer flex-1">
                      <span className="font-medium">{type.label}</span>
                    </label>
                  </div>
                ))}
              </RadioGroup>
              {errors.propertyType && (
                <p className="text-sm text-red-600">{errors.propertyType}</p>
              )}
            </div>

            {/* New: Home search preferences */}
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Where are you in the process?</Label>
                  <Select value={formData.buyerStage || ''} onValueChange={(value) => updateFormData({ buyerStage: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUYING_STAGES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Intended use</Label>
                  <Select value={formData.homeUse || ''} onValueChange={(value) => updateFormData({ homeUse: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intended use" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOME_USES.map((u) => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Select value={formData.bedrooms || ''} onValueChange={(value) => updateFormData({ bedrooms: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {BEDROOM_OPTIONS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Select value={formData.bathrooms || ''} onValueChange={(value) => updateFormData({ bathrooms: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {BATHROOM_OPTIONS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Desired features</Label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_OPTIONS.map((f) => {
                    const active = (formData.features || []).includes(f);
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => {
                          const set = new Set(formData.features || []);
                          if (set.has(f)) set.delete(f); else set.add(f);
                          updateFormData({ features: Array.from(set) });
                        }}
                        className={`px-3 py-1 rounded-full border text-sm transition ${active ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-muted/50'}`}
                      >
                        <ListChecks className="w-3 h-3 inline mr-1" /> {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Must-haves (optional)</Label>
                  <Input
                    type="text"
                    placeholder="e.g., garage, fenced yard, office"
                    value={formData.mustHaves || ''}
                    onChange={(e) => updateFormData({ mustHaves: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nice-to-haves (optional)</Label>
                  <Input
                    type="text"
                    placeholder="e.g., pool, finished basement"
                    value={formData.niceToHaves || ''}
                    onChange={(e) => updateFormData({ niceToHaves: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Budget & Financing */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold">What's your budget?</h2>
            <p className="text-muted-foreground">Help us understand your budget and financing preferences.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priceRange">Price Range</Label>
              <Select value={formData.priceRange || ''} onValueChange={(value) => updateFormData({ priceRange: value })}>
                <SelectTrigger className={errors.priceRange ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-200k">Under $200,000</SelectItem>
                  <SelectItem value="200k-300k">$200,000 - $300,000</SelectItem>
                  <SelectItem value="300k-500k">$300,000 - $500,000</SelectItem>
                  <SelectItem value="500k-750k">$500,000 - $750,000</SelectItem>
                  <SelectItem value="750k-1m">$750,000 - $1,000,000</SelectItem>
                  <SelectItem value="1m-1.5m">$1,000,000 - $1,500,000</SelectItem>
                  <SelectItem value="over-1.5m">Over $1,500,000</SelectItem>
                </SelectContent>
              </Select>
              {errors.priceRange && (
                <p className="text-sm text-red-600">{errors.priceRange}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment</Label>
              <Select value={formData.downPayment || ''} onValueChange={(value) => updateFormData({ downPayment: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select down payment amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-5">3% - 5%</SelectItem>
                  <SelectItem value="5-10">5% - 10%</SelectItem>
                  <SelectItem value="10-15">10% - 15%</SelectItem>
                  <SelectItem value="15-20">15% - 20%</SelectItem>
                  <SelectItem value="20-plus">20% or more</SelectItem>
                  <SelectItem value="cash">Cash purchase</SelectItem>
                  <SelectItem value="unsure">Not sure yet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Financing Type</Label>
              <RadioGroup 
                value={formData.financingType || ''} 
                onValueChange={(value) => updateFormData({ financingType: value })}
                className="grid grid-cols-1 gap-3"
              >
                {FINANCING_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <label htmlFor={option.value} className="cursor-pointer flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
              {errors.financingType && (
                <p className="text-sm text-red-600">{errors.financingType}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <input
                type="checkbox"
                id="preApproved"
                checked={formData.preApproved || false}
                onChange={(e) => updateFormData({ preApproved: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="preApproved" className="text-sm cursor-pointer">
                I am pre-approved for a mortgage
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Timeline */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold">When do you want to buy?</h2>
            <p className="text-muted-foreground">Tell us about your timeline so we can prioritize the right tasks.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Purchase Timeline</Label>
              <RadioGroup 
                value={formData.purchaseTimeline || ''} 
                onValueChange={(value) => updateFormData({ purchaseTimeline: value })}
                className="grid grid-cols-1 gap-3"
              >
                {TIMELINE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <label htmlFor={option.value} className="cursor-pointer flex-1">
                      <div className="font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {option.label}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
              {errors.purchaseTimeline && (
                <p className="text-sm text-red-600">{errors.purchaseTimeline}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="moveInDate">Preferred Move-in Date (Optional)</Label>
              <Input
                id="moveInDate"
                type="date"
                value={formData.moveInDate || ''}
                onChange={(e) => updateFormData({ moveInDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Legal Requirements & Contact Info */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4">
              <Scale className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold">Legal Requirements</h2>
            <p className="text-muted-foreground">Based on your location, here are the legal requirements for your state.</p>
          </div>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Shield className="w-5 h-5" />
                {legalInfo.name} Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-orange-800">Attorney Required</h4>
                  <p className="text-sm">{legalInfo.attorney}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-orange-800">Disclosure Requirements</h4>
                  <p className="text-sm">{legalInfo.disclosure}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-orange-800">Inspection Period</h4>
                  <p className="text-sm">{legalInfo.inspection}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-orange-800 mb-2">Required Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {legalInfo.templates.map((template: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {template}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Information</h3>
            <div className="space-y-2">
              <Label htmlFor="buyerName">Full Name</Label>
              <Input
                id="buyerName"
                type="text"
                placeholder="Enter your full name"
                value={formData.buyerName || ''}
                onChange={(e) => updateFormData({ buyerName: e.target.value })}
                className={errors.buyerName ? 'border-red-500' : ''}
              />
              {errors.buyerName && (
                <p className="text-sm text-red-600">{errors.buyerName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Email Address</Label>
              <Input
                id="buyerEmail"
                type="email"
                placeholder="Enter your email"
                value={formData.buyerEmail || ''}
                onChange={(e) => updateFormData({ buyerEmail: e.target.value })}
                className={errors.buyerEmail ? 'border-red-500' : ''}
              />
              {errors.buyerEmail && (
                <p className="text-sm text-red-600">{errors.buyerEmail}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Setup
          </Button>
        </div>
      </form>
    );
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white p-4 flex flex-col">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center space-y-8">
          <div className="text-center">
            <HandoffLogo className="mb-6" size="h-12" />
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              {renderSinglePage()}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white min-h-full">
          <div className="flex flex-col items-center justify-center flex-1 space-y-8">
            <HandoffLogo className="mb-8" size="h-56" />
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Welcome to Handoff</h1>
              <p className="text-xl text-white/90">
                Your comprehensive real estate transaction platform
              </p>
              <div className="flex items-center space-x-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6" />
                  </div>
                  <p className="text-sm">Personalized Experience</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6" />
                  </div>
                  <p className="text-sm">Legal Compliance</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm">Step-by-Step Guidance</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white/70">
            © 2025 Handoff. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-lg space-y-8">
          <Card>
            <CardContent className="p-8">
              {renderSinglePage()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
