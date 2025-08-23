import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';

interface FormData {
  // Personal Information (Step 1)
  fullName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  gender: string;
  nationality: string;
  cpf: string;
  rg: string;
  zipCode: string;
  address: string;
  neighborhood: string;
  complement: string;
  email: string;
  
  // Additional steps would be added here
  phone: string;
  occupation: string;
  income: string;
  // ... other fields
}

interface SimpleOnboardingFormProps {
  onComplete: (data: FormData) => void;
  onSkip?: () => void;
}

const TOTAL_STEPS = 5;

export function SimpleOnboardingForm({ onComplete, onSkip }: SimpleOnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    nationality: '',
    cpf: '',
    rg: '',
    zipCode: '',
    address: '',
    neighborhood: '',
    complement: '',
    email: '',
    phone: '',
    occupation: '',
    income: ''
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
        newErrors.fullName = 'Nome completo é obrigatório';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'E-mail é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'E-mail inválido';
      }
      if (!formData.gender) {
        newErrors.gender = 'Gênero é obrigatório';
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
    <div className="flex items-center justify-center space-x-4 mb-8">
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
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Personal Information</h2>
        <p className="text-slate-600">Enter your personal information below</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 mb-2 block">
            FULL NAME
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            className={`h-12 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              DATE OF BIRTH
            </Label>
            <Select 
              value={formData.birthDay} 
              onValueChange={(value) => updateFormData({ birthDay: value })}
            >
              <SelectTrigger className="h-12 border-gray-300">
                <SelectValue placeholder="DD" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              &nbsp;
            </Label>
            <Select 
              value={formData.birthMonth} 
              onValueChange={(value) => updateFormData({ birthMonth: value })}
            >
              <SelectTrigger className="h-12 border-gray-300">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              GENDER
            </Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => updateFormData({ gender: value })}
            >
              <SelectTrigger className={`h-12 ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {errors.gender && (
          <p className="text-red-500 text-sm">{errors.gender}</p>
        )}

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            NATIONALITY
          </Label>
          <Select 
            value={formData.nationality} 
            onValueChange={(value) => updateFormData({ nationality: value })}
          >
            <SelectTrigger className="h-12 border-gray-300">
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="mx">Mexico</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              SSN (Last 4 digits)
            </Label>
            <Input
              type="text"
              placeholder="1234"
              value={formData.cpf}
              onChange={(e) => updateFormData({ cpf: e.target.value })}
              className="h-12 border-gray-300"
              maxLength={4}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              ID NUMBER
            </Label>
            <Input
              type="text"
              placeholder="Enter ID"
              value={formData.rg}
              onChange={(e) => updateFormData({ rg: e.target.value })}
              className="h-12 border-gray-300"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            ZIP CODE
          </Label>
          <Input
            type="text"
            placeholder="Enter zip code"
            value={formData.zipCode}
            onChange={(e) => updateFormData({ zipCode: e.target.value })}
            className="h-12 border-gray-300"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            ADDRESS
          </Label>
          <Input
            type="text"
            placeholder="Enter your address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            className="h-12 border-gray-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              NEIGHBORHOOD
            </Label>
            <Input
              type="text"
              placeholder="Enter neighborhood"
              value={formData.neighborhood}
              onChange={(e) => updateFormData({ neighborhood: e.target.value })}
              className="h-12 border-gray-300"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              APARTMENT/SUITE
            </Label>
            <Input
              type="text"
              placeholder="Enter apartment"
              value={formData.complement}
              onChange={(e) => updateFormData({ complement: e.target.value })}
              className="h-12 border-gray-300"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            E-MAIL
          </Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className={`h-12 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Property Preferences</h2>
        <p className="text-slate-600">Tell us about your ideal home</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            PHONE NUMBER
          </Label>
          <Input
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="h-12 border-gray-300"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            OCCUPATION
          </Label>
          <Input
            type="text"
            placeholder="Enter your occupation"
            value={formData.occupation}
            onChange={(e) => updateFormData({ occupation: e.target.value })}
            className="h-12 border-gray-300"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            ANNUAL INCOME
          </Label>
          <Select 
            value={formData.income} 
            onValueChange={(value) => updateFormData({ income: value })}
          >
            <SelectTrigger className="h-12 border-gray-300">
              <SelectValue placeholder="Select income range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-50k">Under $50,000</SelectItem>
              <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
              <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
              <SelectItem value="150k-plus">$150,000+</SelectItem>
            </SelectContent>
          </Select>
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
