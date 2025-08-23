import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';

interface FormData {
  // Contact & Decision Makers (Step 1)
  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
  madeOffersBefore: string;
  tourTimeWindow: string;
  cobuyers: string[];

  // Goals & Timeline + Budget & Financing (Step 2)
  whyBuyNow: string;
  targetMoveIn: string;
  hardDeadlines: string;
  madePreviousOffers: boolean;
  financingType: string;
  maxPrice: number;
  preApproved: boolean;
  lenderName: string;
  preApprovalAmount: string;
  comfortMonthlyPiti: number;
  downPaymentType: string;
  downPaymentPercent: number;
  downPaymentDollars: number;
  hoaCondoFeeCeiling: number;
  propertyTaxTolerance: number;
  closingCashAvailable: number;

  // Location & Lifestyle + Property Criteria (Step 3)
  targetNeighborhoods: string[];
  backupNeighborhoods: string[];
  maxCommute: number;
  transitNeeds: string;
  schoolNeeds: string;
  pets: boolean;
  minBeds: string;
  minBaths: string;
  minSqft: string;
  parking: string;
  propertyTypes: string[];
  needsOutdoorSpace: boolean;
  lotSizeMin: number;
  layoutMustHaves: string;

  // Condition & Renovation + Dealbreakers + Touring (Step 4)
  willingToRenovate: boolean;
  renoBudget: number;
  ageTolerance: string;
  hazardConcerns: string[];
  topMustHaves: string[];
  dealbreakers: string;
  compromisePreference: string;
  tourDays: string[];
  tourTimeWindow: string;
  virtualToursOk: boolean;
  accessibilityNeeds: string;

  // Offer Strategy + Due Diligence + Ownership (Step 5)
  willingToBidOverList: boolean;
  overListCap: number;
  earnestMoney: number;
  contingencyPreferences: string[];
  useEscalationClause: boolean;
  willCoverAppraisalGap: boolean;
  needSellerCredits: boolean;
  inspections: string[];
  insuranceConcerns: string;
  useType: string;
  planToRent: boolean;
  holdPeriod: string;
  additionalNotes: string;
}

interface SimpleOnboardingFormProps {
  onComplete: (data: FormData) => void;
  onSkip?: () => void;
}

const TOTAL_STEPS = 5;

export function SimpleOnboardingForm({ onComplete, onSkip }: SimpleOnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Contact & Decision Makers
    fullName: '',
    email: '',
    phone: '',
    preferredContact: 'email',
    madeOffersBefore: 'no',
    tourTimeWindow: '',
    cobuyers: [],

    // Goals & Timeline + Budget & Financing
    whyBuyNow: '',
    targetMoveIn: '',
    hardDeadlines: '',
    madePreviousOffers: false,
    financingType: 'conventional',
    maxPrice: 900000,
    preApproved: false,
    lenderName: '',
    preApprovalAmount: '',
    comfortMonthlyPiti: 4000,
    downPaymentType: 'percent',
    downPaymentPercent: 20,
    downPaymentDollars: 180000,
    hoaCondoFeeCeiling: 800,
    propertyTaxTolerance: 12000,
    closingCashAvailable: 60000,

    // Location & Lifestyle + Property Criteria
    targetNeighborhoods: [],
    backupNeighborhoods: [],
    maxCommute: 45,
    transitNeeds: '',
    schoolNeeds: '',
    pets: false,
    minBeds: 'studio',
    minBaths: '1',
    minSqft: '1100',
    parking: 'garage',
    propertyTypes: ['single-family'],
    needsOutdoorSpace: false,
    lotSizeMin: 3000,
    layoutMustHaves: '',

    // Condition & Renovation + Dealbreakers + Touring
    willingToRenovate: false,
    renoBudget: 50000,
    ageTolerance: 'no-preference',
    hazardConcerns: [],
    topMustHaves: [],
    dealbreakers: '',
    compromisePreference: '',
    tourDays: [],
    tourTimeWindow: 'weeknights-after-6pm',
    virtualToursOk: true,
    accessibilityNeeds: 'none',

    // Offer Strategy + Due Diligence + Ownership
    willingToBidOverList: false,
    overListCap: 5,
    earnestMoney: 20000,
    contingencyPreferences: ['inspection', 'financing', 'appraisal'],
    useEscalationClause: false,
    willCoverAppraisalGap: false,
    needSellerCredits: false,
    inspections: ['general'],
    insuranceConcerns: 'none',
    useType: 'primary-residence',
    planToRent: false,
    holdPeriod: '5',
    additionalNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderProgressIndicator = () => (
    <div className="mb-12 pb-8 border-b border-gray-200">
      <div className="flex items-center justify-center space-x-4">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-blue-600 text-white' :
                    isCompleted ? 'bg-blue-600 text-white' :
                    'bg-gray-300 text-gray-600'}
                `}
              >
                {stepNumber}
              </div>
              {stepNumber < TOTAL_STEPS && (
                <div
                  className={`w-16 h-0.5 ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Contact & Decision Makers</h2>
        <p className="text-slate-600">Tell us about yourself and who's involved in the purchase</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 mb-2 block">
              Full name *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              className={`h-10 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 block">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@acme.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className={`h-10 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700 mb-2 block">
              Phone *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 555-5555"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className={`h-10 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Preferred contact
            </Label>
            <Select
              value={formData.preferredContact}
              onValueChange={(value) => updateFormData({ preferredContact: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Have you made offers before?
            </Label>
            <Select
              value={formData.madeOffersBefore}
              onValueChange={(value) => updateFormData({ madeOffersBefore: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Tour time window
            </Label>
            <Select
              value={formData.tourTimeWindow}
              onValueChange={(value) => updateFormData({ tourTimeWindow: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="evenings">Evenings</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-slate-700">Co-buyers</Label>
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Add co-buyer
            </Button>
          </div>
          <p className="text-sm text-gray-500">No co-buyers added yet</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Goals & Timeline + Budget & Financing</h2>
        <p className="text-slate-600">Tell us about your timeline and financial readiness</p>
      </div>

      {/* Goals & Timeline */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Goals & Timeline</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Why buy now? *
            </Label>
            <Input
              type="text"
              placeholder="e.g., larger space, new school zone"
              value={formData.whyBuyNow}
              onChange={(e) => updateFormData({ whyBuyNow: e.target.value })}
              className="h-10 border-gray-300"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Target move-in
            </Label>
            <Input
              type="date"
              value={formData.targetMoveIn}
              onChange={(e) => updateFormData({ targetMoveIn: e.target.value })}
              className="h-10 border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Hard deadlines
            </Label>
            <Input
              type="text"
              placeholder="Lease end, school start, baby, etc."
              value={formData.hardDeadlines}
              onChange={(e) => updateFormData({ hardDeadlines: e.target.value })}
              className="h-10 border-gray-300"
            />
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              checked={formData.madePreviousOffers}
              onCheckedChange={(checked) => updateFormData({ madePreviousOffers: !!checked })}
            />
            <Label className="text-sm text-slate-700">Made offers before</Label>
          </div>
        </div>
      </div>

      {/* Budget & Financing */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Budget & Financing</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Financing type
            </Label>
            <Select
              value={formData.financingType}
              onValueChange={(value) => updateFormData({ financingType: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conventional">Conventional</SelectItem>
                <SelectItem value="fha">FHA</SelectItem>
                <SelectItem value="va">VA</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Max price ($)
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formData.maxPrice]}
                onValueChange={(value) => updateFormData({ maxPrice: value[0] })}
                max={2000000}
                min={100000}
                step={10000}
                className="w-full"
              />
              <div className="text-right text-sm text-slate-600">${formData.maxPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formData.preApproved}
            onCheckedChange={(checked) => updateFormData({ preApproved: !!checked })}
          />
          <Label className="text-sm text-slate-700">Pre-approved</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Lender name
            </Label>
            <Input
              type="text"
              placeholder="Acme Mortgage"
              value={formData.lenderName}
              onChange={(e) => updateFormData({ lenderName: e.target.value })}
              className="h-10 border-gray-300"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Pre-approval amount
            </Label>
            <Input
              type="text"
              placeholder="650000"
              value={formData.preApprovalAmount}
              onChange={(e) => updateFormData({ preApprovalAmount: e.target.value })}
              className="h-10 border-gray-300"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Comfort monthly PITI ($)
          </Label>
          <div className="space-y-2">
            <Slider
              value={[formData.comfortMonthlyPiti]}
              onValueChange={(value) => updateFormData({ comfortMonthlyPiti: value[0] })}
              max={10000}
              min={1000}
              step={100}
              className="w-full"
            />
            <div className="text-right text-sm text-slate-600">${formData.comfortMonthlyPiti.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Down payment input
            </Label>
            <Select
              value={formData.downPaymentType}
              onValueChange={(value) => updateFormData({ downPaymentType: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent</SelectItem>
                <SelectItem value="dollars">Dollars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Down payment %
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formData.downPaymentPercent]}
                onValueChange={(value) => updateFormData({ downPaymentPercent: value[0] })}
                max={50}
                min={3}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-slate-600">≤ ${(formData.maxPrice * formData.downPaymentPercent / 100).toLocaleString()} - {formData.downPaymentPercent}%</div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Down payment ($)
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formData.downPaymentDollars]}
                onValueChange={(value) => updateFormData({ downPaymentDollars: value[0] })}
                max={500000}
                min={10000}
                step={5000}
                className="w-full"
              />
              <div className="text-right text-sm text-slate-600">${formData.downPaymentDollars.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Location & Lifestyle + Property Criteria</h2>
        <p className="text-slate-600">Tell us about your location preferences and property requirements</p>
      </div>

      {/* Location & Lifestyle */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Location & Lifestyle</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-slate-700">Target neighborhoods</Label>
              <Button type="button" variant="outline" size="sm" className="text-xs">Add</Button>
            </div>
            <p className="text-sm text-gray-500">No neighborhoods added yet</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-slate-700">Backup neighborhoods</Label>
              <Button type="button" variant="outline" size="sm" className="text-xs">Add</Button>
            </div>
            <p className="text-sm text-gray-500">No neighborhoods added yet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Max commute (min)
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formData.maxCommute]}
                onValueChange={(value) => updateFormData({ maxCommute: value[0] })}
                max={120}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="text-right text-sm text-slate-600">{formData.maxCommute}</div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Transit needs
            </Label>
            <Select
              value={formData.transitNeeds}
              onValueChange={(value) => updateFormData({ transitNeeds: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="subway">Subway</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              School needs
            </Label>
            <Select
              value={formData.schoolNeeds}
              onValueChange={(value) => updateFormData({ schoolNeeds: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="elementary">Elementary</SelectItem>
                <SelectItem value="middle">Middle School</SelectItem>
                <SelectItem value="high">High School</SelectItem>
                <SelectItem value="all">All levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              checked={formData.pets}
              onCheckedChange={(checked) => updateFormData({ pets: !!checked })}
            />
            <Label className="text-sm text-slate-700">Pets</Label>
          </div>
        </div>
      </div>

      {/* Property Criteria */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Property Criteria</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Min beds
            </Label>
            <Select
              value={formData.minBeds}
              onValueChange={(value) => updateFormData({ minBeds: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5+">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Min baths
            </Label>
            <Select
              value={formData.minBaths}
              onValueChange={(value) => updateFormData({ minBaths: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="1.5">1.5</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="2.5">2.5</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="3.5+">3.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Min sqft
            </Label>
            <Input
              type="text"
              value={formData.minSqft}
              onChange={(e) => updateFormData({ minSqft: e.target.value })}
              className="h-10 border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Parking
            </Label>
            <Select
              value={formData.parking}
              onValueChange={(value) => updateFormData({ parking: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="garage">Garage</SelectItem>
                <SelectItem value="driveway">Driveway</SelectItem>
                <SelectItem value="street">Street</SelectItem>
                <SelectItem value="none">None required</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              checked={formData.needsOutdoorSpace}
              onCheckedChange={(checked) => updateFormData({ needsOutdoorSpace: !!checked })}
            />
            <Label className="text-sm text-slate-700">Needs outdoor space</Label>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Property types
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['single-family', 'townhouse', 'condo', 'co-op', 'new-build'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.propertyTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData({ propertyTypes: [...formData.propertyTypes, type] });
                    } else {
                      updateFormData({ propertyTypes: formData.propertyTypes.filter(t => t !== type) });
                    }
                  }}
                />
                <Label className="text-sm text-slate-700 capitalize">{type.replace('-', ' ')}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Lot size min (sqft)
          </Label>
          <div className="space-y-2">
            <Slider
              value={[formData.lotSizeMin]}
              onValueChange={(value) => updateFormData({ lotSizeMin: value[0] })}
              max={20000}
              min={1000}
              step={500}
              className="w-full"
            />
            <div className="text-right text-sm text-slate-600">{formData.lotSizeMin.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Layout must-haves
          </Label>
          <Textarea
            placeholder="Office, open kitchen, first-floor bed, etc."
            value={formData.layoutMustHaves}
            onChange={(e) => updateFormData({ layoutMustHaves: e.target.value })}
            className="min-h-20 border-gray-300"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Condition & Renovation + Dealbreakers + Touring</h2>
        <p className="text-slate-600">Tell us about property condition preferences and touring logistics</p>
      </div>

      {/* Condition & Renovation */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Condition & Renovation</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.willingToRenovate}
              onCheckedChange={(checked) => updateFormData({ willingToRenovate: !!checked })}
            />
            <Label className="text-sm text-slate-700">Willing to renovate</Label>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Reno budget ($)
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formData.renoBudget]}
                onValueChange={(value) => updateFormData({ renoBudget: value[0] })}
                max={200000}
                min={10000}
                step={5000}
                className="w-full"
              />
              <div className="text-sm text-slate-600">${formData.renoBudget.toLocaleString()}</div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Age tolerance
            </Label>
            <Select
              value={formData.ageTolerance}
              onValueChange={(value) => updateFormData({ ageTolerance: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-preference">No preference</SelectItem>
                <SelectItem value="new-only">New construction only</SelectItem>
                <SelectItem value="under-10">Under 10 years</SelectItem>
                <SelectItem value="under-25">Under 25 years</SelectItem>
                <SelectItem value="any">Any age</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Hazard concerns
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['septic', 'oil-tank', 'lead-paint', 'asbestos', 'flood-zone'].map((hazard) => (
              <div key={hazard} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.hazardConcerns.includes(hazard)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData({ hazardConcerns: [...formData.hazardConcerns, hazard] });
                    } else {
                      updateFormData({ hazardConcerns: formData.hazardConcerns.filter(h => h !== hazard) });
                    }
                  }}
                />
                <Label className="text-sm text-slate-700 capitalize">{hazard.replace('-', ' ')}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dealbreakers & Trade-offs */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Dealbreakers & Trade-offs</h3>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-slate-700">Top must-haves (ranked)</Label>
            <Button type="button" variant="outline" size="sm" className="text-xs">Add</Button>
          </div>
          <p className="text-sm text-gray-500">No must-haves added yet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Dealbreakers
            </Label>
            <Textarea
              placeholder="What are absolute deal breakers?"
              value={formData.dealbreakers}
              onChange={(e) => updateFormData({ dealbreakers: e.target.value })}
              className="min-h-20 border-gray-300"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              If you must compromise, what gives first?
            </Label>
            <Textarea
              placeholder="What would you be willing to compromise on?"
              value={formData.compromisePreference}
              onChange={(e) => updateFormData({ compromisePreference: e.target.value })}
              className="min-h-20 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Touring Logistics */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Touring Logistics</h3>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Available days
          </Label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.tourDays.includes(day)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData({ tourDays: [...formData.tourDays, day] });
                    } else {
                      updateFormData({ tourDays: formData.tourDays.filter(d => d !== day) });
                    }
                  }}
                />
                <Label className="text-sm text-slate-700">{day}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Time window
            </Label>
            <Select
              value={formData.tourTimeWindow}
              onValueChange={(value) => updateFormData({ tourTimeWindow: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weeknights-after-6pm">Weeknights after 6pm</SelectItem>
                <SelectItem value="mornings">Mornings</SelectItem>
                <SelectItem value="afternoons">Afternoons</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              checked={formData.virtualToursOk}
              onCheckedChange={(checked) => updateFormData({ virtualToursOk: !!checked })}
            />
            <Label className="text-sm text-slate-700">Virtual tours ok</Label>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Accessibility needs
            </Label>
            <Select
              value={formData.accessibilityNeeds}
              onValueChange={(value) => updateFormData({ accessibilityNeeds: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="wheelchair">Wheelchair accessible</SelectItem>
                <SelectItem value="ground-floor">Ground floor preferred</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Offer Strategy + Due Diligence + Ownership</h2>
        <p className="text-slate-600">Tell us about your offer strategy and ownership plans</p>
      </div>

      {/* Offer Strategy */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Offer Strategy</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.willingToBidOverList}
              onCheckedChange={(checked) => updateFormData({ willingToBidOverList: !!checked })}
            />
            <Label className="text-sm text-slate-700">Willing to bid over list</Label>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Over-list cap (%)
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formData.overListCap]}
                onValueChange={(value) => updateFormData({ overListCap: value[0] })}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-right text-sm text-slate-600">{formData.overListCap}%</div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Earnest money ($)
            </Label>
            <div className="space-y-2">
              <Slider
                value={[formData.earnestMoney]}
                onValueChange={(value) => updateFormData({ earnestMoney: value[0] })}
                max={100000}
                min={5000}
                step={1000}
                className="w-full"
              />
              <div className="text-sm text-slate-600">${formData.earnestMoney.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Contingency preferences
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {['inspection', 'financing', 'appraisal', 'home-sale', 'title', 'other'].map((contingency) => (
              <div key={contingency} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.contingencyPreferences.includes(contingency)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData({ contingencyPreferences: [...formData.contingencyPreferences, contingency] });
                    } else {
                      updateFormData({ contingencyPreferences: formData.contingencyPreferences.filter(c => c !== contingency) });
                    }
                  }}
                />
                <Label className="text-sm text-slate-700 capitalize">{contingency.replace('-', ' ')}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.useEscalationClause}
              onCheckedChange={(checked) => updateFormData({ useEscalationClause: !!checked })}
            />
            <Label className="text-sm text-slate-700">Use escalation clause</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.willCoverAppraisalGap}
              onCheckedChange={(checked) => updateFormData({ willCoverAppraisalGap: !!checked })}
            />
            <Label className="text-sm text-slate-700">Will cover appraisal gap</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.needSellerCredits}
              onCheckedChange={(checked) => updateFormData({ needSellerCredits: !!checked })}
            />
            <Label className="text-sm text-slate-700">Need seller credits</Label>
          </div>
        </div>
      </div>

      {/* Due Diligence */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Due Diligence</h3>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Inspections
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {['general', 'radon', 'sewer-scope', 'termite', 'mold', 'roof'].map((inspection) => (
              <div key={inspection} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.inspections.includes(inspection)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData({ inspections: [...formData.inspections, inspection] });
                    } else {
                      updateFormData({ inspections: formData.inspections.filter(i => i !== inspection) });
                    }
                  }}
                />
                <Label className="text-sm text-slate-700 capitalize">{inspection.replace('-', ' ')}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Insurance concerns
          </Label>
          <Select
            value={formData.insuranceConcerns}
            onValueChange={(value) => updateFormData({ insuranceConcerns: value })}
          >
            <SelectTrigger className="h-10 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="flood">Flood risk</SelectItem>
              <SelectItem value="earthquake">Earthquake risk</SelectItem>
              <SelectItem value="hurricane">Hurricane risk</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ownership & Use */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Ownership & Use</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Use type
            </Label>
            <Select
              value={formData.useType}
              onValueChange={(value) => updateFormData({ useType: value })}
            >
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary-residence">Primary residence</SelectItem>
                <SelectItem value="secondary-home">Secondary home</SelectItem>
                <SelectItem value="investment">Investment property</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              checked={formData.planToRent}
              onCheckedChange={(checked) => updateFormData({ planToRent: !!checked })}
            />
            <Label className="text-sm text-slate-700">Plan to rent it at any point</Label>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Hold period (years)
            </Label>
            <Input
              type="text"
              value={formData.holdPeriod}
              onChange={(e) => updateFormData({ holdPeriod: e.target.value })}
              className="h-10 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-700">Additional Notes</h3>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Anything else we should know?
          </Label>
          <Textarea
            placeholder="Any other preferences, concerns, or requirements..."
            value={formData.additionalNotes}
            onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
            className="min-h-24 border-gray-300"
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Step {currentStep}</h2>
            <p className="text-slate-600">This step is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white shadow-sm border">
        <CardContent className="p-8">
          {renderProgressIndicator()}
          
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            {renderCurrentStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-2 text-slate-600 border-slate-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStep === TOTAL_STEPS ? 'Complete' : 'Continue'}
                {currentStep < TOTAL_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimpleOnboardingForm;
