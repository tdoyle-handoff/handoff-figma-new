import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  ArrowRight,
  ArrowLeft,
  Home,
  DollarSign,
  Calendar as CalendarIcon,
  CheckCircle,
  User,
  MapPin,
  Briefcase,
  Clock,
  Search,
  Building,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { useIsMobile } from "./ui/use-mobile";
import { cn } from "./ui/utils";
import {
  useAttomData,
  formatCurrency,
  formatSquareFeet,
} from "../hooks/useAttomData";
import { AttomProperty } from "../types/attom";
import { format } from "date-fns";
import {
  AddressInputEnhanced,
  AttomAddressComponents,
} from "./AddressInputEnhanced";
import { PropertyAnalysisReport } from "./PropertyAnalysisReport";
import { ErrorBoundary } from "./ErrorBoundary";

// Date formatting functions
function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateTimeForInput(date: Date): string {
  return date.toISOString().slice(0, 16);
}

function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ScreeningData {
  buyingStage:
    | "searching"
    | "under-contract"
    | "pre-approved"
    | "just-starting";
  experienceLevel: "first-time" | "experienced" | "investor";
  hasSpecificProperty: boolean;
  propertyAddress?: string;
  primaryGoal:
    | "primary-residence"
    | "investment"
    | "vacation-home"
    | "relocation";
  timeframe: "immediate" | "3-months" | "6-months" | "exploring";
  hasPreApproval: boolean;
  contractSigned: boolean;
  needsRealtor: boolean;
  nextAction:
    | "search-properties"
    | "focus-property"
    | "get-preapproved"
    | "sign-contract";
}

interface PropertyData {
  // Basic Property Info (always shown)
  propertyAddress?: string; // One-line formatted address
  propertyPrice?: string;
  // Split address fields for downstream ATTOM and summary usage
  address?: string; // address1 (street number + name)
  city?: string;
  state?: string;
  zipCode?: string;

  // Contract Details (shown if under contract)
  closingDate?: string;
  inspectionDate?: string;
  earnestMoney?: string;
  contingencies?: string[];

  // Financial Info (customized based on experience/goal)
  downPayment?: string;
  loanAmount?: string;
  monthlyPayment?: string;
  propertyTaxes?: string;
  hoaFees?: string;

  // Personal Details (customized based on goal)
  occupancyDate?: string;
  renovationPlans?: string;

  // Team & Services (customized based on experience)
  realtor?: string;
  lender?: string;
  attorney?: string;
  inspector?: string;

  // Investment-specific (only for investors)
  rentalIncome?: string;
  capRate?: string;

  // First-time buyer specific
  firstTimeBuyerPrograms?: string[];

  // Attom Data fields (enriched automatically)
  attomProperty?: AttomProperty;
  attomSearchCompleted?: boolean;
}

interface InitialPropertySetupProps {
  onComplete: (data: PropertyData) => void;
  onBack?: () => void;
  isEditMode?: boolean;
  screeningData?: ScreeningData | null;
  forceAllSections?: boolean;
}

export function InitialPropertySetup({
  onComplete,
  onBack,
  isEditMode = false,
  screeningData: propScreeningData,
  forceAllSections = false,
}: InitialPropertySetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const SINGLE_PAGE = true;
  const [propertyData, setPropertyData] = useState<PropertyData>({});
  const [screeningData, setScreeningData] = useState<ScreeningData | null>(
    propScreeningData ?? null,
  );
  const isMobile = useIsMobile();

  // Load screening data and existing property data on mount
  useEffect(() => {
    if (!screeningData) {
      const savedScreeningData = localStorage.getItem("handoff-screening-data");
      if (savedScreeningData) {
        try {
          setScreeningData(JSON.parse(savedScreeningData));
        } catch (error) {
          console.warn("Error parsing screening data:", error);
        }
      }
    }

    // Load existing property data if in edit mode
    if (isEditMode) {
      const savedPropertyData = localStorage.getItem("handoff-property-data");
      if (savedPropertyData) {
        try {
          const parsed = JSON.parse(savedPropertyData);
          setPropertyData(parsed);
        } catch (error) {
          console.warn("Error parsing property data:", error);
        }
      }
    }
  }, [isEditMode, screeningData]);

  const updatePropertyData = useCallback(
    (updates: Partial<PropertyData>) => {
      const newData = { ...propertyData, ...updates };
      setPropertyData(newData);

      // In edit mode, save immediately to localStorage
      if (isEditMode) {
        try {
          localStorage.setItem(
            "handoff-property-data",
            JSON.stringify(newData),
          );
        } catch (error) {
          console.warn("Error saving property data:", error);
        }
      }
    },
    [propertyData, isEditMode],
  );

  // Generate steps based on screening data
  const generateSteps = useCallback(() => {
    const steps = [] as Array<{
      id: string;
      title: string;
      description: string;
      icon: JSX.Element;
      required: boolean;
      component: any;
    }>;

    // Basic Property Information (always shown)
    steps.push({
      id: "property-basic",
      title:
        screeningData?.hasSpecificProperty || forceAllSections
          ? "Property Details"
          : "Property Information",
      description:
        screeningData?.hasSpecificProperty || forceAllSections
          ? "Tell us about your property and view comprehensive analysis"
          : "We'll help you track property information when you find one",
      icon: <Home className="w-6 h-6" />,
      required:
        screeningData?.hasSpecificProperty ||
        screeningData?.buyingStage === "under-contract" ||
        forceAllSections
          ? true
          : false,
      component: PropertyBasicStep,
    });

    // Contract Details (forced visible when forceAllSections)
    if (screeningData?.buyingStage === "under-contract" || forceAllSections) {
      steps.push({
        id: "contract-details",
        title: "Contract Information",
        description: "Important dates and contract terms",
        icon: <CalendarIcon className="w-6 h-6" />,
        required: forceAllSections || true,
        component: ContractDetailsStep,
      });
    }

    // Financial Information (forced visible when forceAllSections)
    if (
      screeningData?.buyingStage !== "just-starting" ||
      screeningData?.hasPreApproval ||
      forceAllSections
    ) {
      steps.push({
        id: "financial-info",
        title: "Financial Details",
        description:
          screeningData?.experienceLevel === "investor" || forceAllSections
            ? "Investment numbers and financing"
            : "Your financing and budget information",
        icon: <DollarSign className="w-6 h-6" />,
        required: !!forceAllSections,
        component: FinancialInfoStep,
      });
    }

    // Team & Services (forced visible when forceAllSections)
    if (
      screeningData?.experienceLevel === "first-time" ||
      screeningData?.timeframe === "immediate" ||
      forceAllSections
    ) {
      steps.push({
        id: "team-services",
        title: "Your Team",
        description: "Real estate professionals helping with your purchase",
        icon: <User className="w-6 h-6" />,
        required: !!forceAllSections,
        component: TeamServicesStep,
      });
    }

    // Investment Details (forced visible when forceAllSections)
    if (
      screeningData?.experienceLevel === "investor" ||
      screeningData?.primaryGoal === "investment" ||
      forceAllSections
    ) {
      steps.push({
        id: "investment-details",
        title: "Investment Analysis",
        description: "Rental income and return calculations",
        icon: <Briefcase className="w-6 h-6" />,
        required: !!forceAllSections,
        component: InvestmentDetailsStep,
      });
    }

    return steps;
  }, [screeningData, forceAllSections]);

  const steps = generateSteps();
  const handleSubmitAll = useCallback(() => {
    // Mark setup complete and persist data
    // Ensure address fields exist in ATTOM-required split format
    const toSave = { ...propertyData };
    try {
      localStorage.setItem("handoff-initial-setup-complete", "true");
      localStorage.setItem("handoff-property-data", JSON.stringify(toSave));
      if (toSave.attomProperty) {
        localStorage.setItem(
          "handoff-attom-property",
          JSON.stringify(toSave.attomProperty),
        );
      }
      // Also mirror to screening data for summary fallback
      if (toSave.propertyAddress) {
        const existingScreening = localStorage.getItem(
          "handoff-screening-data",
        );
        let sd: any = {};
        if (existingScreening) {
          try {
            sd = JSON.parse(existingScreening);
          } catch {}
        }
        sd.propertyAddress = toSave.propertyAddress;
        localStorage.setItem("handoff-screening-data", JSON.stringify(sd));
      }
    } catch {}
    onComplete(toSave);
  }, [propertyData, onComplete]);

  const handleNext = useCallback(() => {
    if (SINGLE_PAGE) {
      handleSubmitAll();
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      localStorage.setItem("handoff-initial-setup-complete", "true");
      localStorage.setItem(
        "handoff-property-data",
        JSON.stringify(propertyData),
      );
      if (propertyData.attomProperty) {
        localStorage.setItem(
          "handoff-attom-property",
          JSON.stringify(propertyData.attomProperty),
        );
      }
      onComplete(propertyData);
    }
  }, [
    SINGLE_PAGE,
    currentStep,
    steps.length,
    propertyData,
    onComplete,
    handleSubmitAll,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (onBack) {
      onBack();
    }
  }, [currentStep, onBack]);

  const canProceed = useCallback(() => {
    const currentStepData = steps[currentStep];
    if (!currentStepData?.required) return true;

    switch (currentStepData.id) {
      case "property-basic":
        return screeningData?.hasSpecificProperty
          ? !!propertyData.propertyAddress
          : true;
      case "contract-details":
        return !!propertyData.closingDate;
      default:
        return true;
    }
  }, [currentStep, steps, propertyData, screeningData]);

  if (!screeningData) {
    // Proceed with defaults if screening data is not yet available
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (SINGLE_PAGE) {
    return (
      <div
        className={`min-h-screen bg-background ${isMobile ? "page-content-mobile" : "page-content"}`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {isEditMode ? "Update Property Setup" : "Property Setup"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update your property details and information"
                : screeningData?.hasSpecificProperty
                  ? "Let's set up your property details and view comprehensive analysis"
                  : "We'll customize this based on your needs"}
            </p>
          </div>

          {/* Welcome */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Welcome to Property Details
              </CardTitle>
              <CardDescription>
                We’ll first have you fill out a short form to set up your
                property details. You can update this any time later.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* All Sections */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                Basic Property Information
              </CardTitle>
              <CardDescription>Address and purchase price</CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyBasicStep
                propertyData={propertyData}
                updatePropertyData={updatePropertyData}
                screeningData={screeningData}
                isMobile={isMobile}
                isEditMode={isEditMode}
              />
            </CardContent>
          </Card>

          {steps.find((s) => s.id === "contract-details") && (
            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Contract Information</CardTitle>
                <CardDescription>Important dates and terms</CardDescription>
              </CardHeader>
              <CardContent>
                <ContractDetailsStep
                  propertyData={propertyData}
                  updatePropertyData={updatePropertyData}
                  isMobile={isMobile}
                />
              </CardContent>
            </Card>
          )}

          {steps.find((s) => s.id === "financial-info") && (
            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Financial Details</CardTitle>
                <CardDescription>
                  Your financing and budget information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialInfoStep
                  propertyData={propertyData}
                  updatePropertyData={updatePropertyData}
                  isMobile={isMobile}
                />
              </CardContent>
            </Card>
          )}

          {steps.find((s) => s.id === "team-services") && (
            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Your Team</CardTitle>
                <CardDescription>
                  Professionals helping with your purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamServicesStep
                  propertyData={propertyData}
                  updatePropertyData={updatePropertyData}
                  isMobile={isMobile}
                />
              </CardContent>
            </Card>
          )}

          {steps.find((s) => s.id === "investment-details") && (
            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Investment Analysis</CardTitle>
                <CardDescription>
                  Rental income and return calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvestmentDetailsStep
                  propertyData={propertyData}
                  updatePropertyData={updatePropertyData}
                  isMobile={isMobile}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitAll}
              className={isMobile ? "mobile-button" : ""}
            >
              {isEditMode ? "Save Changes" : "Complete Setup"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Legacy step-based fallback
  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component as React.ComponentType<{
    propertyData: PropertyData;
    updatePropertyData: (updates: Partial<PropertyData>) => void;
    screeningData: ScreeningData | null;
    isMobile: boolean;
    isEditMode: boolean | undefined;
  }>;

  return (
    <div
      className={`min-h-screen bg-background ${isMobile ? "page-content-mobile" : "page-content"}`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {isEditMode ? "Update Property Setup" : "Property Setup"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update your property details and information"
              : screeningData?.hasSpecificProperty
                ? "Let's set up your property details and view comprehensive analysis"
                : "We'll customize this based on your needs"}
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
            <div className="flex items-center justify-center gap-2 mb-2">
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              {currentStepData.required && (
                <Badge variant="secondary" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary
              fallback={
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Step Unavailable
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      This step encountered an error and cannot be displayed.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className={isMobile ? "mobile-button" : ""}
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              }
            >
              <StepComponent
                propertyData={propertyData}
                updatePropertyData={updatePropertyData}
                screeningData={screeningData}
                isMobile={isMobile}
                isEditMode={isEditMode}
              />
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className={isMobile ? "mobile-button" : ""}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className={isMobile ? "mobile-button" : ""}
          >
            {currentStep === steps.length - 1
              ? isEditMode
                ? "Save Changes"
                : "Complete Setup"
              : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Date Picker Component
function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  disabled = false,
  className,
  isMobile = false,
}: {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isMobile?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            isMobile && "mobile-input h-12",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate);
            setOpen(false);
          }}
          disabled={(date) => date < new Date("1900-01-01")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// DateTime Picker Component
function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Select date and time",
  disabled = false,
  className,
  isMobile = false,
}: {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isMobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [timeValue, setTimeValue] = useState(
    date ? formatTimeForInput(date) : "09:00",
  );

  function formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      onDateChange(newDate);
    } else {
      onDateChange(undefined);
    }
    setOpen(false);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (date) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      onDateChange(newDate);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              isMobile && "mobile-input h-12",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDateForDisplay(date) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date("1900-01-01")}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Time Input */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <input
          type="time"
          value={timeValue}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            isMobile && "mobile-input",
            "text-sm",
          )}
        />
      </div>
    </div>
  );
}

// Individual Step Components
function PropertyBasicStep({
  propertyData,
  updatePropertyData,
  screeningData,
  isMobile,
  isEditMode,
}: any) {
  const [attomProperty, setAttomProperty] = useState<AttomProperty | null>(
    propertyData.attomProperty || null,
  );
  const [isSearchingAttom, setIsSearchingAttom] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { searchByAddress, isLoading: attomLoading } = useAttomData({
    onPropertyFound: (property) => {
      console.log("Attom property found:", property);
      setAttomProperty(property);
      updatePropertyData({
        attomProperty: property,
        attomSearchCompleted: true,
      });
      setIsSearchingAttom(false);
      setShowAnalysis(true); // Automatically show analysis when property is found
    },
    onError: (error) => {
      console.error("Error loading Attom data:", error);
      updatePropertyData({ attomSearchCompleted: true });
      setIsSearchingAttom(false);
    },
  });

  // Do not auto-populate any values; user should enter everything manually
  useEffect(() => {
    // intentionally left blank to avoid pre-filling
  }, []);

  // Auto-show analysis if we already have property data
  useEffect(() => {
    if (attomProperty && propertyData.propertyAddress) {
      setShowAnalysis(true);
    }
  }, [attomProperty, propertyData.propertyAddress]);

  // Handle address selection from AddressInputEnhanced component
  const handleAddressSelect = (
    addressComponents: AttomAddressComponents | null,
  ) => {
    if (addressComponents) {
      const fullAddress = addressComponents.formatted_address;
      updatePropertyData({
        propertyAddress: fullAddress,
        address: addressComponents.address1,
        city: addressComponents.city,
        state: addressComponents.state,
        zipCode: addressComponents.zip_code,
      });

      // Persist immediately so summary page can read ATTOM-ready fields
      try {
        const next = {
          ...propertyData,
          propertyAddress: fullAddress,
          address: addressComponents.address1,
          city: addressComponents.city,
          state: addressComponents.state,
          zipCode: addressComponents.zip_code,
        };
        localStorage.setItem("handoff-property-data", JSON.stringify(next));
      } catch {}

      // Search Attom data using the ATTOM-formatted address components
      setIsSearchingAttom(true);
      // Use address1 and address2 which are ATTOM-compatible format
      const attomAddress = `${addressComponents.address1}, ${addressComponents.address2}`;
      searchByAddress(attomAddress);
    } else {
      updatePropertyData({
        propertyAddress: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      });
      setAttomProperty(null);
      setShowAnalysis(false);
    }
  };

  // Handle manual address input changes (when Google Places API is unavailable)
  const handleAddressInputChange = (value: string) => {
    updatePropertyData({ propertyAddress: value });

    // If user typed a substantial address manually, try to search Attom data
    if (value && value.length > 15 && value.includes(",")) {
      setIsSearchingAttom(true);
      searchByAddress(value);
    } else if (!value) {
      setAttomProperty(null);
      setShowAnalysis(false);
    }
  };

  // Do not auto-fill purchase price from ATTOM; user must enter manually
  useEffect(() => {
    // intentionally no-op: avoid auto-filling price
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <AddressInputEnhanced
          id="propertyAddress"
          label={`Property Address${screeningData?.hasSpecificProperty ? " *" : ""}`}
          placeholder="Start typing a property address..."
          value={propertyData.propertyAddress || ""}
          onChange={handleAddressSelect}
          onInputChange={handleAddressInputChange}
          required={!!screeningData?.hasSpecificProperty}
          country="US"
          types={["address"]}
          className={isMobile ? "mobile-input" : ""}
          showBreakdown={true}
          validateForAttom={true}
          debugMode={false}
        />
        {(isSearchingAttom || attomLoading) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Searching property database...</span>
          </div>
        )}
        {attomProperty && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Property verified with Attom Data</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="propertyPrice"
          className="text-sm font-medium text-foreground"
        >
          Purchase Price
        </label>
        <input
          id="propertyPrice"
          type="text"
          placeholder="$750,000"
          value={propertyData.propertyPrice || ""}
          onChange={(e) =>
            updatePropertyData({ propertyPrice: e.target.value })
          }
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
            isMobile ? "mobile-input" : ""
          }`}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Enter the agreed-upon purchase price
          </p>
          {attomProperty && attomProperty.valuation.estimated_value && (
            <p className="text-xs text-muted-foreground">
              Est. Value:{" "}
              {formatCurrency(attomProperty.valuation.estimated_value)}
            </p>
          )}
        </div>
      </div>

      {/* Attom Property Summary */}
      {attomProperty && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              <h4 className="font-medium text-primary">Property Information</h4>
              <Badge variant="secondary" className="text-xs">
                Verified by Attom
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              {showAnalysis ? "Hide" : "View"} Full Analysis
              {showAnalysis ? (
                <ChevronUp className="w-3 h-3 ml-1" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-1" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">
                {attomProperty.property_details.property_type}
              </p>
            </div>
            {attomProperty.property_details.bedrooms && (
              <div>
                <p className="text-muted-foreground">Bedrooms</p>
                <p className="font-medium">
                  {attomProperty.property_details.bedrooms}
                </p>
              </div>
            )}
            {attomProperty.property_details.bathrooms && (
              <div>
                <p className="text-muted-foreground">Bathrooms</p>
                <p className="font-medium">
                  {attomProperty.property_details.bathrooms}
                </p>
              </div>
            )}
            {attomProperty.property_details.square_feet && (
              <div>
                <p className="text-muted-foreground">Square Feet</p>
                <p className="font-medium">
                  {formatSquareFeet(attomProperty.property_details.square_feet)}
                </p>
              </div>
            )}
            {attomProperty.property_details.year_built && (
              <div>
                <p className="text-muted-foreground">Year Built</p>
                <p className="font-medium">
                  {attomProperty.property_details.year_built}
                </p>
              </div>
            )}
            {attomProperty.tax_assessment.annual_tax_amount && (
              <div>
                <p className="text-muted-foreground">Annual Taxes</p>
                <p className="font-medium">
                  {formatCurrency(
                    attomProperty.tax_assessment.annual_tax_amount,
                  )}
                </p>
              </div>
            )}
          </div>

          {attomProperty.valuation.price_per_sqft && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  {`${Math.round(attomProperty.valuation.price_per_sqft)} per sq ft`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Property Analysis */}
      {showAnalysis && attomProperty && propertyData.propertyAddress && (
        <div className="mt-6">
          <PropertyAnalysisReport
            address={propertyData.propertyAddress}
            attomProperty={attomProperty}
            onPropertyUpdate={(updatedProperty) => {
              setAttomProperty(updatedProperty);
              updatePropertyData({ attomProperty: updatedProperty });
            }}
          />
        </div>
      )}
    </div>
  );
}

function ContractDetailsStep({
  propertyData,
  updatePropertyData,
  isMobile,
}: any) {
  const handleClosingDateChange = (date: Date | undefined) => {
    updatePropertyData({
      closingDate: date ? formatDateForInput(date) : "",
    });
  };

  const handleInspectionDateChange = (date: Date | undefined) => {
    updatePropertyData({
      inspectionDate: date ? date.toISOString() : "",
    });
  };

  const closingDate = propertyData.closingDate
    ? new Date(propertyData.closingDate)
    : undefined;
  const inspectionDate = propertyData.inspectionDate
    ? new Date(propertyData.inspectionDate)
    : undefined;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="closingDate"
          className="text-sm font-medium text-foreground"
        >
          Closing Date <span className="text-red-500">*</span>
        </label>
        <DatePicker
          date={closingDate}
          onDateChange={handleClosingDateChange}
          placeholder="Select closing date"
          isMobile={isMobile}
        />
        <p className="text-xs text-muted-foreground">
          The date when the property ownership will transfer
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="inspectionDate"
          className="text-sm font-medium text-foreground"
        >
          Inspection Date & Time
        </label>
        <DateTimePicker
          date={inspectionDate}
          onDateChange={handleInspectionDateChange}
          placeholder="Select inspection date and time"
          isMobile={isMobile}
        />
        <p className="text-xs text-muted-foreground">
          When the home inspection is scheduled
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="earnestMoney"
          className="text-sm font-medium text-foreground"
        >
          Earnest Money Deposit
        </label>
        <input
          id="earnestMoney"
          type="text"
          placeholder="$15,000"
          value={propertyData.earnestMoney || ""}
          onChange={(e) => updatePropertyData({ earnestMoney: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
            isMobile ? "mobile-input" : ""
          }`}
        />
        <p className="text-xs text-muted-foreground">
          Amount paid to show serious intent to purchase
        </p>
      </div>
    </div>
  );
}

function FinancialInfoStep({
  propertyData,
  updatePropertyData,
  screeningData,
  isMobile,
}: any) {
  // Helper function to parse monetary values
  const parseMoneyValue = (value: string): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^0-9.]/g, ""));
  };

  // Helper function to determine if down payment is a percentage
  const isPercentage = (value: string): boolean => {
    return (
      value.includes("%") ||
      (parseFloat(value.replace(/[^0-9.]/g, "")) <= 100 &&
        !value.includes("$") &&
        !value.includes(","))
    );
  };

  // Calculate loan amount automatically
  const calculateLoanAmount = (
    propertyPrice: string,
    downPayment: string,
  ): string => {
    const price = parseMoneyValue(propertyPrice);
    if (!price || price <= 0) return "";

    const downPaymentValue = parseMoneyValue(downPayment);
    if (!downPaymentValue || downPaymentValue <= 0) return "";

    let downPaymentAmount: number;

    if (isPercentage(downPayment)) {
      // Down payment is a percentage
      downPaymentAmount = (price * downPaymentValue) / 100;
    } else {
      // Down payment is a dollar amount
      downPaymentAmount = downPaymentValue;
    }

    const loanAmount = price - downPaymentAmount;
    return loanAmount > 0 ? `$${Math.round(loanAmount).toLocaleString()}` : "";
  };

  // Handle down payment changes
  const handleDownPaymentChange = (value: string) => {
    updatePropertyData({ downPayment: value });

    // Auto-calculate loan amount if we have a property price
    if (propertyData.propertyPrice) {
      const calculatedLoanAmount = calculateLoanAmount(
        propertyData.propertyPrice,
        value,
      );
      updatePropertyData({
        downPayment: value,
        loanAmount: calculatedLoanAmount,
      });
    }
  };

  // Auto-calculate when property price changes
  React.useEffect(() => {
    if (propertyData.propertyPrice && propertyData.downPayment) {
      const calculatedLoanAmount = calculateLoanAmount(
        propertyData.propertyPrice,
        propertyData.downPayment,
      );
      if (calculatedLoanAmount !== propertyData.loanAmount) {
        updatePropertyData({ loanAmount: calculatedLoanAmount });
      }
    }
  }, [propertyData.propertyPrice, propertyData.downPayment]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="downPayment"
            className="text-sm font-medium text-foreground"
          >
            Down Payment
          </label>
          <input
            id="downPayment"
            type="text"
            placeholder="20% or $150,000"
            value={propertyData.downPayment || ""}
            onChange={(e) => handleDownPaymentChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              isMobile ? "mobile-input" : ""
            }`}
          />
          <p className="text-xs text-muted-foreground">
            Enter as percentage (20%) or dollar amount ($150,000)
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="loanAmount"
            className="text-sm font-medium text-foreground"
          >
            Loan Amount
          </label>
          <input
            id="loanAmount"
            type="text"
            placeholder="Auto-calculated"
            value={propertyData.loanAmount || ""}
            disabled={true}
            className={`w-full px-3 py-2 border rounded-lg bg-muted text-muted-foreground cursor-not-allowed ${
              isMobile ? "mobile-input" : ""
            }`}
          />
          <p className="text-xs text-muted-foreground">
            Automatically calculated based on purchase price and down payment
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="hoaFees"
          className="text-sm font-medium text-foreground"
        >
          HOA Fees (Monthly)
        </label>
        <input
          id="hoaFees"
          type="text"
          placeholder="$250"
          value={propertyData.hoaFees || ""}
          onChange={(e) => updatePropertyData({ hoaFees: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
            isMobile ? "mobile-input" : ""
          }`}
        />
      </div>
    </div>
  );
}

function TeamServicesStep({ propertyData, updatePropertyData, isMobile }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="realtor"
            className="text-sm font-medium text-foreground"
          >
            Real Estate Agent
          </label>
          <input
            id="realtor"
            type="text"
            placeholder="Agent name"
            value={propertyData.realtor || ""}
            onChange={(e) => updatePropertyData({ realtor: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              isMobile ? "mobile-input" : ""
            }`}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="lender"
            className="text-sm font-medium text-foreground"
          >
            Lender
          </label>
          <input
            id="lender"
            type="text"
            placeholder="Lender name"
            value={propertyData.lender || ""}
            onChange={(e) => updatePropertyData({ lender: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              isMobile ? "mobile-input" : ""
            }`}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="attorney"
            className="text-sm font-medium text-foreground"
          >
            Real Estate Attorney
          </label>
          <input
            id="attorney"
            type="text"
            placeholder="Attorney name"
            value={propertyData.attorney || ""}
            onChange={(e) => updatePropertyData({ attorney: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              isMobile ? "mobile-input" : ""
            }`}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="inspector"
            className="text-sm font-medium text-foreground"
          >
            Home Inspector
          </label>
          <input
            id="inspector"
            type="text"
            placeholder="Inspector name"
            value={propertyData.inspector || ""}
            onChange={(e) => updatePropertyData({ inspector: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              isMobile ? "mobile-input" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function InvestmentDetailsStep({
  propertyData,
  updatePropertyData,
  isMobile,
}: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="rentalIncome"
            className="text-sm font-medium text-foreground"
          >
            Monthly Rental Income
          </label>
          <input
            id="rentalIncome"
            type="text"
            placeholder="$4,000"
            value={propertyData.rentalIncome || ""}
            onChange={(e) =>
              updatePropertyData({ rentalIncome: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              isMobile ? "mobile-input" : ""
            }`}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="capRate"
            className="text-sm font-medium text-foreground"
          >
            Cap Rate
          </label>
          <input
            id="capRate"
            type="text"
            placeholder="6.5%"
            value={propertyData.capRate || ""}
            onChange={(e) => updatePropertyData({ capRate: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              isMobile ? "mobile-input" : ""
            }`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="renovationPlans"
          className="text-sm font-medium text-foreground"
        >
          Renovation Plans
        </label>
        <textarea
          id="renovationPlans"
          placeholder="Describe any planned renovations or improvements..."
          value={propertyData.renovationPlans || ""}
          onChange={(e) =>
            updatePropertyData({ renovationPlans: e.target.value })
          }
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
            isMobile ? "mobile-input" : ""
          }`}
        />
      </div>
    </div>
  );
}
