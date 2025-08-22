import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { usePropertyContext } from './PropertyContext';
import { useAI } from './AIContext';
import { SmartHelpButton } from './AIGuide';
import { useIsMobile } from './ui/use-mobile';
import {
  Home,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Bed,
  Bath,
  Square,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Brain,
  TrendingUp,
  Clock
} from 'lucide-react';

export function AIEnhancedPropertyDetails() {
  const propertyContext = usePropertyContext();
  const ai = useAI();
  const isMobile = useIsMobile();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<import('./PropertyContext').PropertyData>>(propertyContext.propertyData || {});
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAiInsights, setShowAiInsights] = useState(true);

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: Home },
    { id: 'details', title: 'Property Details', icon: Square },
    { id: 'preferences', title: 'Preferences', icon: Users },
    { id: 'timeline', title: 'Timeline', icon: Calendar },
    { id: 'financing', title: 'Financing', icon: DollarSign }
  ];

  useEffect(() => {
    generateAiSuggestions();
  }, [currentStep, formData]);

  const generateAiSuggestions = async () => {
    const suggestions = [];
    
    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.address) {
          suggestions.push("💡 Start by entering the property address if you have one, or your target neighborhood");
        }
        if (!formData.price) {
          suggestions.push("💰 Consider your budget range - I can help you understand what's realistic in your area");
        }
        break;
        
      case 1: // Property Details
        suggestions.push("🏠 These details help me understand your space needs and preferences");
        if (formData.bedrooms && parseInt(formData.bedrooms) >= 4) {
          suggestions.push("🔍 Larger homes often need more thorough inspections - keep this in mind");
        }
        break;
        
      case 2: // Preferences
        suggestions.push("⭐ Your must-have features help prioritize your search and make competitive offers");
        break;
        
      case 3: // Timeline
        if (formData.targetClosingDate) {
          const daysUntil = Math.ceil((new Date(formData.targetClosingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntil < 60) {
            suggestions.push("⏰ Your timeline is tight - we'll need to move quickly on pre-approval and search");
          }
        }
        break;
        
      case 4: // Financing
        if (!formData.hasLender) {
          suggestions.push("🏦 Getting pre-approved should be your next priority after this setup");
        }
        break;
    }
    
    setAiSuggestions(suggestions);
  };

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    propertyContext.updatePropertyData(updatedData);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (stepIndex) {
      case 0: // Basic Info
        if (!formData.homeType) errors.homeType = 'Property type is required';
        if (!formData.city) errors.city = 'City is required';
        if (!formData.state) errors.state = 'State is required';
        break;
        
      case 1: // Property Details
        if (!formData.bedrooms) errors.bedrooms = 'Number of bedrooms is required';
        if (!formData.bathrooms) errors.bathrooms = 'Number of bathrooms is required';
        break;
        
      case 3: // Timeline
        if (!formData.targetClosingDate) errors.targetClosingDate = 'Target closing date is required';
        break;
        
      case 4: // Financing
        if (!formData.mortgageType) errors.mortgageType = 'Mortgage type is required';
        if (!formData.downPaymentPercent) errors.downPaymentPercent = 'Down payment percentage is required';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (validateStep(currentStep)) {
      // Merge partial form data with any existing property data before saving
      const merged = { ...(propertyContext.propertyData || {}), ...(formData || {}) } as import('./PropertyContext').PropertyData;
      await propertyContext.savePropertyData(merged);
      ai.sendMessage("I've completed my property details setup! What should I focus on next?", {
        action: 'completed_setup',
        data: merged
      });
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const completion = propertyContext.getCompletionStatus();

  const StepHeader = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Smart Property Setup
        </h2>
        <Badge variant="secondary">
          Step {currentStep + 1} of {steps.length}
        </Badge>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Setup Progress</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Step navigation */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <Button
              key={step.id}
              variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCurrentStep(index)}
              className="flex items-center gap-2 whitespace-nowrap"
              disabled={index > currentStep}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {step.title}
            </Button>
          );
        })}
      </div>
    </div>
  );

  const AIInsightsPanel = () => (
    showAiInsights && aiSuggestions.length > 0 && (
      <Alert className="mb-6 border-blue-200 bg-blue-50/50">
        <Lightbulb className="w-4 h-4 text-blue-600" />
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-medium text-blue-900 mb-2">AI Insights</div>
            <div className="space-y-1">
              {aiSuggestions.map((suggestion, index) => (
                <AlertDescription key={index} className="text-blue-800 text-sm">
                  {suggestion}
                </AlertDescription>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAiInsights(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            Dismiss
          </Button>
        </div>
      </Alert>
    )
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Property Location
                </CardTitle>
                <CardDescription>
                  Tell me about the property location and basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="address">Property Address</Label>
                      <SmartHelpButton field="address" />
                    </div>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="city">City</Label>
                      <SmartHelpButton field="city" />
                    </div>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Sacramento"
                      className={validationErrors.city ? 'border-red-500' : ''}
                    />
                    {validationErrors.city && (
                      <p className="text-sm text-red-500">{validationErrors.city}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state || ''}
                      onValueChange={(value) => handleInputChange('state', value)}
                    >
                      <SelectTrigger className={validationErrors.state ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>  
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        {/* Add more states as needed */}
                      </SelectContent>
                    </Select>
                    {validationErrors.state && (
                      <p className="text-sm text-red-500">{validationErrors.state}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode || ''}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="95814"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="price">Target Price</Label>
                      <SmartHelpButton field="price" />
                    </div>
                    <Input
                      id="price"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="$500,000"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="homeType">Property Type</Label>
                    <SmartHelpButton field="homeType" />
                  </div>
                  <Select
                    value={formData.homeType || ''}
                    onValueChange={(value) => handleInputChange('homeType', value)}
                  >
                    <SelectTrigger className={validationErrors.homeType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-family">Single Family Home</SelectItem>
                      <SelectItem value="condo">Condominium</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="manufactured">Manufactured Home</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.homeType && (
                    <p className="text-sm text-red-500">{validationErrors.homeType}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1: // Property Details
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Square className="w-5 h-5" />
                  Property Specifications
                </CardTitle>
                <CardDescription>
                  Details about the size and layout of the property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <SmartHelpButton field="bedrooms" />
                    </div>
                    <Select
                      value={formData.bedrooms || ''}
                      onValueChange={(value) => handleInputChange('bedrooms', value)}
                    >
                      <SelectTrigger className={validationErrors.bedrooms ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4">4 Bedrooms</SelectItem>
                        <SelectItem value="5">5+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.bedrooms && (
                      <p className="text-sm text-red-500">{validationErrors.bedrooms}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Bath className="w-4 h-4" />
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <SmartHelpButton field="bathrooms" />
                    </div>
                    <Select
                      value={formData.bathrooms || ''}
                      onValueChange={(value) => handleInputChange('bathrooms', value)}
                    >
                      <SelectTrigger className={validationErrors.bathrooms ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                        <SelectItem value="2">2 Bathrooms</SelectItem>
                        <SelectItem value="2.5">2.5 Bathrooms</SelectItem>
                        <SelectItem value="3">3 Bathrooms</SelectItem>
                        <SelectItem value="3.5">3.5+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.bathrooms && (
                      <p className="text-sm text-red-500">{validationErrors.bathrooms}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="squareFootage">Square Footage</Label>
                    <Input
                      id="squareFootage"
                      value={formData.squareFootage || ''}
                      onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                      placeholder="1,800 sq ft"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lotSize">Lot Size</Label>
                    <Input
                      id="lotSize"
                      value={formData.lotSize || ''}
                      onChange={(e) => handleInputChange('lotSize', e.target.value)}
                      placeholder="0.25 acres"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearBuilt">Year Built</Label>
                    <Input
                      id="yearBuilt"
                      value={formData.yearBuilt || ''}
                      onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3: // Timeline
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline & Important Dates
                </CardTitle>
                <CardDescription>
                  Your target dates help me create a personalized timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="targetClosingDate">Target Closing Date</Label>
                    <SmartHelpButton field="targetClosingDate" />
                  </div>
                  <Input
                    id="targetClosingDate"
                    type="date"
                    value={formData.targetClosingDate || ''}
                    onChange={(e) => handleInputChange('targetClosingDate', e.target.value)}
                    className={validationErrors.targetClosingDate ? 'border-red-500' : ''}
                  />
                  {validationErrors.targetClosingDate && (
                    <p className="text-sm text-red-500">{validationErrors.targetClosingDate}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="moveInDate">Preferred Move-in Date</Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    value={formData.moveInDate || ''}
                    onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentLeaseEnd">Current Lease End Date (if applicable)</Label>
                  <Input
                    id="currentLeaseEnd"
                    type="date"
                    value={formData.currentLeaseEnd || ''}
                    onChange={(e) => handleInputChange('currentLeaseEnd', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4: // Financing
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financing Information
                </CardTitle>
                <CardDescription>
                  Your financing details help me provide relevant guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mortgageType">Mortgage Type</Label>
                    <Select
                      value={formData.mortgageType || ''}
                      onValueChange={(value) => handleInputChange('mortgageType', value)}
                    >
                      <SelectTrigger className={validationErrors.mortgageType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select mortgage type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conventional">Conventional</SelectItem>
                        <SelectItem value="fha">FHA</SelectItem>
                        <SelectItem value="va">VA</SelectItem>
                        <SelectItem value="usda">USDA</SelectItem>
                        <SelectItem value="jumbo">Jumbo</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.mortgageType && (
                      <p className="text-sm text-red-500">{validationErrors.mortgageType}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="downPaymentPercent">Down Payment %</Label>
                    <Select
                      value={formData.downPaymentPercent || ''}
                      onValueChange={(value) => handleInputChange('downPaymentPercent', value)}
                    >
                      <SelectTrigger className={validationErrors.downPaymentPercent ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select percentage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="10">10%</SelectItem>
                        <SelectItem value="15">15%</SelectItem>
                        <SelectItem value="20">20%</SelectItem>
                        <SelectItem value="25">25%+</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.downPaymentPercent && (
                      <p className="text-sm text-red-500">{validationErrors.downPaymentPercent}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preApprovalAmount">Pre-approval Amount (if obtained)</Label>
                  <Input
                    id="preApprovalAmount"
                    value={formData.preApprovalAmount || ''}
                    onChange={(e) => handleInputChange('preApprovalAmount', e.target.value)}
                    placeholder="$500,000"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasLender"
                      checked={formData.hasLender || false}
                      onCheckedChange={(checked) => handleInputChange('hasLender', checked)}
                    />
                    <Label htmlFor="hasLender">I have a mortgage lender</Label>
                  </div>
                  
                  {formData.hasLender && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label htmlFor="lenderName">Lender Name</Label>
                        <Input
                          id="lenderName"
                          value={formData.lenderName || ''}
                          onChange={(e) => handleInputChange('lenderName', e.target.value)}
                          placeholder="ABC Mortgage Co."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lenderContactName">Contact Name</Label>
                        <Input
                          id="lenderContactName"
                          value={formData.lenderContactName || ''}
                          onChange={(e) => handleInputChange('lenderContactName', e.target.value)}
                          placeholder="John Smith"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lenderPhone">Phone Number</Label>
                        <Input
                          id="lenderPhone"
                          value={formData.lenderPhone || ''}
                          onChange={(e) => handleInputChange('lenderPhone', e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // Skip step 2 (preferences) for brevity in this example
      default:
        return <div>Step content not implemented</div>;
    }
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : 'max-w-4xl mx-auto p-6'}`}>
      <StepHeader />
      <AIInsightsPanel />
      
      {renderStepContent()}
      
      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => ai.sendMessage("I need help with this form", { 
              step: steps[currentStep].title,
              data: formData 
            })}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get AI Help
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete} className="min-w-24">
              Complete Setup
            </Button>
          ) : (
            <Button onClick={nextStep} className="min-w-20">
              Next
            </Button>
          )}
        </div>
      </div>
      
      {/* Completion status */}
      {completion.percentage > 0 && (
        <Alert className="border-green-200 bg-green-50/50">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Overall completion: {completion.percentage}% 
            {completion.completed && " - You're all set! 🎉"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}