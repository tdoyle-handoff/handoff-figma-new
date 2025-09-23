import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Home,
  MapPin,
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Building,
  Database,
  RefreshCw,
  ExternalLink,
  Info,
  Settings,
  BarChart3,
  TestTube,
  Zap,
  Search,
  Copy,
  Receipt,
  Shield,
  Key,
  CheckCircle2,
  Loader2,
  Bed,
  Bath,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { ComprehensiveAttomDisplay } from "./ComprehensiveAttomDisplay";
import BuyerIntakeForm from "./BuyerIntakeForm";
import { PropertyBasicProfile } from "./PropertyBasicProfile";
import { ComprehensivePropertyDetails } from "./ComprehensivePropertyDetails";
import { PropertyOverviewWithAttomData } from "./PropertyOverviewWithAttomData";
import { AttomResponseDisplay } from "./AttomResponseDisplay";
import { ComprehensivePropertyDataFields } from "./ComprehensivePropertyDataFields";
import { useAttomData } from "../hooks/useAttomData";
import {
  calculateMonthlyPayment,
  getDefaultLoanParameters,
  formatCurrency as formatCurrencyUtil,
} from "../utils/constants";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface PropertyData {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: string;
  downPayment?: string;
  bedrooms?: string;
  bathrooms?: string;
  squareFootage?: string;
  propertyType?: string;
  yearBuilt?: string;
  lotSize?: string;
  closingDate?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  buyerName?: string;
  buyerEmail?: string;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  lenderName?: string;
  lenderPhone?: string;
  titleCompany?: string;
  escrowCompany?: string;
}

interface ScreeningData {
  propertyAddress?: string;
  buyingStage?: string;
  experienceLevel?: string;
  timeframe?: string;
  primaryConcern?: string;
  nextAction?: string;
  contractSigned?: boolean;
  hasRealtor?: boolean;
  hasLender?: boolean;
  hasInspector?: boolean;
}

interface PropertySummaryProps {
  userProfile?: any;
  setupData?: any;
  onNavigate?: (page: string) => void;
  onStartOver?: () => void;
  onEditSetup?: () => void;
}

interface HomeSearchData {
  buyerStage?: string;
  homeUse?: string;
  bedrooms?: string;
  bathrooms?: string;
  features?: string[];
  mustHaves?: string;
  niceToHaves?: string;
}

const BUYING_STAGES = [
  { value: "just-looking", label: "Just looking" },
  { value: "researching", label: "Researching & planning" },
  { value: "touring", label: "Touring homes" },
  { value: "making-offers", label: "Making offers" },
  { value: "under-contract", label: "Under contract" },
];

const HOME_USES = [
  { value: "primary", label: "Primary residence" },
  { value: "investment", label: "Investment property" },
  { value: "vacation", label: "Vacation/second home" },
];

const FEATURE_OPTIONS = [
  "Garage",
  "Yard",
  "Pool",
  "Updated kitchen",
  "Air conditioning",
  "In-unit laundry",
  "Walkability",
  "Good schools",
];

interface AttomEndpoint {
  id: string;
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
  sampleAddress?: string;
}

interface EndpointResult {
  id: string;
  name: string;
  response: any;
  isLoading: boolean;
  error?: string;
}

export default function PropertySummary({
  userProfile,
  setupData,
  onNavigate,
  onStartOver,
  onEditSetup,
}: PropertySummaryProps) {
  const [propertyData, setPropertyData] = useState<PropertyData>({});
  const [screeningData, setScreeningData] = useState<ScreeningData>({});
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [homeSearch, setHomeSearch] = useState<HomeSearchData>({});

  // ATTOM API Testing States
  const [apiKey, setApiKey] = useState("");
  const [endpointResults, setEndpointResults] = useState<
    Record<string, EndpointResult>
  >({});
  const [showRawJson, setShowRawJson] = useState<Record<string, boolean>>({});
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const [testingProgress, setTestingProgress] = useState(0);

  // Rate limiting
  const lastApiCallRef = useRef<number>(0);
  const apiCallCountRef = useRef<number>(0);
  const rateLimitResetRef = useRef<number>(0);
  const hasTestedAddressRef = useRef<string>("");

  // ATTOM API endpoints configuration
  const endpoints: AttomEndpoint[] = [
    {
      id: "expandedprofile",
      name: "Expanded Profile",
      path: "/propertyapi/v1.0.0/property/expandedprofile",
      description:
        "Get comprehensive property data including all available information",
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  // Use the Attom data hook to fetch property information
  const propertyAddress =
    screeningData.propertyAddress ||
    (propertyData.address && propertyData.city
      ? `${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`
      : "");

  const {
    property: attomProperty,
    isLoading: isAttomLoading,
    error: attomError,
    searchByAddress: refetchAttom,
  } = useAttomData();

  // Rate limiting check
  const checkRateLimit = useCallback(() => {
    const now = Date.now();

    // Reset counter every minute
    if (now - rateLimitResetRef.current > 60000) {
      apiCallCountRef.current = 0;
      rateLimitResetRef.current = now;
    }

    // Check if we've exceeded rate limits (allow more for batch testing)
    if (apiCallCountRef.current >= 8) {
      throw new Error(
        "Rate limit exceeded. Please wait before making more API calls.",
      );
    }

    // Check minimum time between calls (reduced for batch testing)
    if (now - lastApiCallRef.current < 1000) {
      throw new Error("Please wait 1 second between API calls.");
    }

    return true;
  }, []);

  useEffect(() => {
    const loadPropertyData = () => {
      try {
        // Load property data
        const savedPropertyData = localStorage.getItem("handoff-property-data");
        if (savedPropertyData) {
          try {
            setPropertyData(JSON.parse(savedPropertyData));
          } catch (error) {
            console.warn("Error parsing property data:", error);
          }
        }

        // Load screening data
        const savedScreeningData = localStorage.getItem(
          "handoff-screening-data",
        );
        if (savedScreeningData) {
          try {
            setScreeningData(JSON.parse(savedScreeningData));
          } catch (error) {
            console.warn("Error parsing screening data:", error);
          }
        }

        // Load home search preferences: prefer merged fields in property-data, else migrate from legacy key
        const merged: HomeSearchData = {};
        const pd = (() => {
          try {
            return JSON.parse(
              localStorage.getItem("handoff-property-data") || "{}",
            );
          } catch {
            return {};
          }
        })();
        if (pd) {
          if (pd.buyerStage) merged.buyerStage = pd.buyerStage;
          if (pd.homeUse) merged.homeUse = pd.homeUse;
          if (pd.bedrooms) merged.bedrooms = pd.bedrooms;
          if (pd.bathrooms) merged.bathrooms = pd.bathrooms;
          if (Array.isArray(pd.features)) merged.features = pd.features;
          if (pd.mustHaves) merged.mustHaves = pd.mustHaves;
          if (pd.niceToHaves) merged.niceToHaves = pd.niceToHaves;
        }

        // Legacy key support + migration
        const savedHomeSearch = localStorage.getItem(
          "handoff-home-search-preferences",
        );
        if ((!merged || Object.keys(merged).length === 0) && savedHomeSearch) {
          try {
            const parsed = JSON.parse(savedHomeSearch);
            setHomeSearch(parsed);
            // Migrate into property-data
            const newPd = { ...pd, ...parsed };
            localStorage.setItem(
              "handoff-property-data",
              JSON.stringify(newPd),
            );
          } catch (e) {
            console.warn("Error parsing home search preferences:", e);
          }
        } else {
          setHomeSearch(merged);
        }

        // Check if setup is complete
        const initialSetupComplete =
          localStorage.getItem("handoff-initial-setup-complete") === "true";
        const questionnaireComplete =
          localStorage.getItem("handoff-questionnaire-complete") === "true";
        setIsSetupComplete(initialSetupComplete && questionnaireComplete);
      } catch (error) {
        console.warn("Error loading data:", error);
      }
    };

    loadPropertyData();

    // In production, refresh periodically; in dev, avoid polling by default
    const shouldPoll = import.meta.env.PROD;
    let interval: number | undefined;

    // Refresh only when the tab is visible to reduce background work
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadPropertyData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    if (shouldPoll) {
      interval = window.setInterval(loadPropertyData, 30000); // 30s in prod
    }

    return () => {
      if (interval) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Load API key on component mount
  useEffect(() => {
    setApiKey("cca24467d5861c7e58a2bc7c9cc926af"); // Use provided key as default
  }, []);

  // Auto-search for Attom data when address is available (with rate limiting)
  useEffect(() => {
    if (propertyAddress && propertyAddress.trim() && !hasAuthError) {
      try {
        // Longer cooldown in dev to speed up refresh; shorter in prod
        const cooldownMs = import.meta.env.PROD ? 60000 : 300000; // 1 min prod, 5 min dev
        const now = Date.now();
        if (now - lastApiCallRef.current > cooldownMs) {
          refetchAttom(propertyAddress);
          lastApiCallRef.current = now;
        }
      } catch (error) {
        console.warn("Skipping auto-fetch due to rate limiting");
      }
    }
  }, [propertyAddress, refetchAttom, hasAuthError]);

  // Auto-test all endpoints when property address is available
  useEffect(() => {
    const devAutoTestEnabled =
      localStorage.getItem("handoff-attom-autotest") === "true";
    const allowAutoTest = import.meta.env.PROD || devAutoTestEnabled;

    if (
      allowAutoTest &&
      propertyAddress &&
      propertyAddress.trim() &&
      apiKey &&
      !hasAuthError &&
      !isTestingInProgress &&
      hasTestedAddressRef.current !== propertyAddress
    ) {
      // Mark this address as tested to prevent duplicate calls
      hasTestedAddressRef.current = propertyAddress;
      // Start testing all endpoints
      testAllEndpoints();
    }
  }, [propertyAddress, apiKey, hasAuthError]);

  // Test all endpoints automatically
  const testAllEndpoints = async () => {
    if (!apiKey.trim() || !propertyAddress) {
      return;
    }

    setIsTestingInProgress(true);
    setTestingProgress(0);
    setHasAuthError(false);

    // Initialize endpoint results
    const initialResults: Record<string, EndpointResult> = {};
    endpoints.forEach((endpoint) => {
      initialResults[endpoint.id] = {
        id: endpoint.id,
        name: endpoint.name,
        response: null,
        isLoading: true,
        error: undefined,
      };
    });
    setEndpointResults(initialResults);

    // Parse property address for parameters
    let address1 = "";
    let address2 = "";

    if (propertyData.address) {
      address1 = propertyData.address;
      address2 = `${propertyData.city || ""}, ${propertyData.state || ""}`
        .trim()
        .replace(/^,\s*/, "");
    } else if (screeningData.propertyAddress) {
      const parts = screeningData.propertyAddress.split(", ");
      if (parts.length >= 2) {
        address1 = parts[0];
        address2 = parts.slice(1).join(", ");
      }
    }

    if (!address1 || !address2) {
      console.warn("Unable to parse property address for API testing");
      setIsTestingInProgress(false);
      return;
    }

    // Test each endpoint with a delay to respect rate limits
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];

      try {
        // Update progress
        setTestingProgress(((i + 1) / endpoints.length) * 100);

        // Wait between calls to respect rate limits
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay between calls
        }

        const result = await testSingleEndpoint(endpoint, address1, address2);

        // Update the specific endpoint result
        setEndpointResults((prev) => ({
          ...prev,
          [endpoint.id]: {
            ...prev[endpoint.id],
            response: result,
            isLoading: false,
            error: result.success ? undefined : result.error,
          },
        }));

        // Check for auth errors
        if (result.status === 401) {
          setHasAuthError(true);
          console.warn("Authentication error detected, stopping further tests");
          break;
        }
      } catch (error) {
        console.error(`Error testing ${endpoint.name}:`, error);

        setEndpointResults((prev) => ({
          ...prev,
          [endpoint.id]: {
            ...prev[endpoint.id],
            response: null,
            isLoading: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        }));
      }
    }

    setIsTestingInProgress(false);
    setTestingProgress(100);
  };

  // Test a single endpoint
  const testSingleEndpoint = async (
    endpoint: AttomEndpoint,
    address1: string,
    address2: string,
  ) => {
    try {
      // Update rate limiting tracking
      apiCallCountRef.current += 1;
      lastApiCallRef.current = Date.now();

      // Build URL with parameters
      const baseUrl = `https://api.gateway.attomdata.com${endpoint.path}`;
      const url = new URL(baseUrl);

      // Add required parameters
      url.searchParams.append("address1", address1);
      url.searchParams.append("address2", address2);

      console.log(`Testing ${endpoint.name}:`, url.toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          accept: "application/json",
          apikey: apiKey,
          "User-Agent": "Handoff-RealEstate/1.0",
        },
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = {
          rawResponse: responseText,
          parseError: "Failed to parse as JSON",
        };
      }

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        url: url.toString(),
        timestamp: new Date().toISOString(),
        propertyAddress: propertyAddress,
        parsedAddress: { address1, address2 },
        error: response.ok
          ? undefined
          : `${response.status} ${response.statusText}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        propertyAddress: propertyAddress,
      };
    }
  };

  // Manual refresh all endpoints
  const refreshAllEndpoints = () => {
    hasTestedAddressRef.current = ""; // Reset to allow retesting
    testAllEndpoints();
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  // Toggle raw JSON view for specific endpoint
  const toggleRawJson = (endpointId: string) => {
    setShowRawJson((prev) => ({
      ...prev,
      [endpointId]: !prev[endpointId],
    }));
  };

  const getSetupProgress = () => {
    const steps = [
      {
        label: "Screening Complete",
        completed: !!screeningData.propertyAddress,
      },
      { label: "Property Details", completed: !!propertyData.address },
      { label: "Contact Information", completed: !!propertyData.buyerName },
      { label: "Professional Team", completed: !!propertyData.agentName },
      { label: "Transaction Details", completed: !!propertyData.closingDate },
    ];

    const completedSteps = steps.filter((step) => step.completed).length;
    const progress = (completedSteps / steps.length) * 100;

    return { steps, progress, completedSteps };
  };

  const formatCurrency = (value: string | undefined) => {
    if (!value) return "Not specified";
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    return isNaN(numValue) ? value : `$${numValue.toLocaleString()}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not scheduled";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const { steps, progress, completedSteps } = getSetupProgress();

  const displayAddress =
    screeningData.propertyAddress ||
    (propertyData.address
      ? `${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`
      : "Not provided");

  // Helper function to parse down payment
  const parseDownPayment = (downPaymentStr: string, propertyPrice: number) => {
    if (!downPaymentStr) return null;

    const value = parseFloat(downPaymentStr.replace(/[^0-9.]/g, ""));
    if (isNaN(value) || value <= 0) return null;

    // Check if it's a percentage or dollar amount
    const isPercentage =
      downPaymentStr.includes("%") ||
      (value <= 100 &&
        !downPaymentStr.includes("$") &&
        !downPaymentStr.includes(","));

    if (isPercentage) {
      return {
        percentage: value,
        amount: (propertyPrice * value) / 100,
      };
    } else {
      return {
        percentage: (value / propertyPrice) * 100,
        amount: value,
      };
    }
  };

  // Calculate monthly payment if property price is available
  const getCalculatedMonthlyPayment = () => {
    if (!propertyData.price) return null;

    const priceValue = parseFloat(propertyData.price.replace(/[^0-9.]/g, ""));
    if (isNaN(priceValue) || priceValue <= 0) return null;

    // Use custom down payment if available, otherwise use default
    let downPaymentPercent = 20; // default
    if (propertyData.downPayment) {
      const parsedDownPayment = parseDownPayment(
        propertyData.downPayment,
        priceValue,
      );
      if (parsedDownPayment) {
        downPaymentPercent = parsedDownPayment.percentage;
      }
    }

    const loanParams = getDefaultLoanParameters();
    return calculateMonthlyPayment(
      priceValue,
      downPaymentPercent,
      loanParams.interestRate,
      loanParams.loanTermYears,
    );
  };

  const calculatedMonthlyPayment = getCalculatedMonthlyPayment();
  const loanParams = getDefaultLoanParameters();

  // Get completed results count
  const completedResults = Object.values(endpointResults).filter(
    (result) => !result.isLoading,
  ).length;
  const totalEndpoints = endpoints.length;

  // Helper function to combine all property data sources
  const getComprehensivePropertyData = () => {
    // Start with user input data
    const baseData: any = {
      // Address information from user input
      address: {
        oneLine: displayAddress,
        line1: propertyData.address,
        locality: propertyData.city,
        countrySubd: propertyData.state,
        postal1: propertyData.zipCode,
        country: "USA",
      },

      // Building information from user input
      building: {
        summary: {
          propType: propertyData.propertyType,
          yearBuilt: propertyData.yearBuilt
            ? parseInt(propertyData.yearBuilt)
            : undefined,
        },
        size: {
          livingAreaSqFt: propertyData.squareFootage
            ? parseInt(propertyData.squareFootage)
            : undefined,
        },
        rooms: {
          bedsCount: propertyData.bedrooms
            ? parseInt(propertyData.bedrooms)
            : undefined,
          bathsTotal: propertyData.bathrooms
            ? parseFloat(propertyData.bathrooms)
            : undefined,
        },
      },

      // Financial information from user input
      financial: {
        listPrice: propertyData.price
          ? parseFloat(propertyData.price.replace(/[^0-9.]/g, ""))
          : undefined,
      },

      // Owner information from user input
      owner: {
        names: propertyData.buyerName
          ? [
              {
                fullName: propertyData.buyerName,
              },
            ]
          : undefined,
        mailAddress: propertyData.buyerEmail
          ? {
              oneLine: propertyData.buyerEmail,
            }
          : undefined,
      },
    };

    // Merge ATTOM data if available
    if (attomProperty) {
      // Basic profile data from useAttomData hook
      if (attomProperty.identifier) {
        baseData.identifier = {
          attomId: attomProperty.identifier.attomId,
          fips: attomProperty.identifier.fips,
          apn: attomProperty.identifier.apn,
          obPropId: attomProperty.identifier.obPropId,
        };
      }

      if (attomProperty.address) {
        baseData.address = {
          ...baseData.address,
          ...attomProperty.address,
        };
      }

      if (attomProperty.lot) {
        baseData.lot = attomProperty.lot;
      }

      if (attomProperty.building) {
        baseData.building = {
          ...baseData.building,
          ...attomProperty.building,
        };
      }

      if (attomProperty.assessment) {
        baseData.assessment = attomProperty.assessment;
      }

      if (attomProperty.utilities) {
        baseData.utilities = attomProperty.utilities;
      }

      if (attomProperty.location) {
        baseData.location = attomProperty.location;
      }

      if (attomProperty.owner) {
        baseData.owner = {
          ...baseData.owner,
          ...attomProperty.owner,
        };
      }

      if (attomProperty.sale) {
        baseData.sale = attomProperty.sale;
      }

      if (attomProperty.area) {
        baseData.area = attomProperty.area;
      }
    }

    // Merge additional data from endpoint results
    Object.values(endpointResults).forEach((result) => {
      if (result.response?.success && result.response?.data) {
        const responseData = result.response.data;

        // Handle different endpoint response structures
        if (responseData.property && responseData.property.length > 0) {
          const propertyData = responseData.property[0];

          // Merge identifier data
          if (propertyData.identifier && !baseData.identifier) {
            baseData.identifier = propertyData.identifier;
          }

          // Merge address data
          if (propertyData.address) {
            baseData.address = {
              ...baseData.address,
              ...propertyData.address,
            };
          }

          // Merge building data
          if (propertyData.building) {
            baseData.building = {
              ...baseData.building,
              size: {
                ...baseData.building?.size,
                ...propertyData.building.size,
              },
              construction: propertyData.building.construction,
              rooms: {
                ...baseData.building?.rooms,
                ...propertyData.building.rooms,
              },
              interior: propertyData.building.interior,
              summary: {
                ...baseData.building?.summary,
                ...propertyData.building.summary,
              },
            };
          }

          // Merge lot data
          if (propertyData.lot) {
            baseData.lot = { ...baseData.lot, ...propertyData.lot };
          }

          // Merge assessment data
          if (propertyData.assessment) {
            baseData.assessment = {
              ...baseData.assessment,
              ...propertyData.assessment,
            };
          }

          // Merge utilities data
          if (propertyData.utilities) {
            baseData.utilities = {
              ...baseData.utilities,
              ...propertyData.utilities,
            };
          }

          // Merge location data
          if (propertyData.location) {
            baseData.location = {
              ...baseData.location,
              ...propertyData.location,
            };
          }

          // Merge owner data
          if (propertyData.owner) {
            baseData.owner = {
              ...baseData.owner,
              ...propertyData.owner,
              names: propertyData.owner.names || baseData.owner?.names,
            };
          }

          // Merge sale data
          if (propertyData.sale) {
            baseData.sale = { ...baseData.sale, ...propertyData.sale };
          }

          // Merge area data
          if (propertyData.area) {
            baseData.area = { ...baseData.area, ...propertyData.area };
          }
        }
      }
    });

    // Add calculated monthly payment if available
    if (calculatedMonthlyPayment) {
      baseData.financial = {
        ...baseData.financial,
        estimatedMonthlyPayment: calculatedMonthlyPayment,
      };
    }

    // Add professional team information
    if (propertyData.agentName || propertyData.lenderName) {
      baseData.area = {
        ...baseData.area,
        // Could add professional team data to a custom section
      };
    }

    return baseData;
  };

  // Merge-and-save helper for editable Home Search preferences
  const saveHomeSearch = (updates: Partial<HomeSearchData>) => {
    const next = { ...(homeSearch || {}), ...updates } as HomeSearchData;
    setHomeSearch(next);
    try {
      const pdRaw = localStorage.getItem("handoff-property-data");
      const pd = pdRaw ? JSON.parse(pdRaw) : {};
      const merged = { ...pd, ...next };
      localStorage.setItem("handoff-property-data", JSON.stringify(merged));
      // keep legacy key in sync for now (optional)
      localStorage.setItem(
        "handoff-home-search-preferences",
        JSON.stringify(next),
      );
    } catch (e) {
      console.warn("Failed to merge/save home search preferences:", e);
    }
  };

  const toggleFeature = (feature: string) => {
    const set = new Set(homeSearch.features || []);
    if (set.has(feature)) set.delete(feature);
    else set.add(feature);
    saveHomeSearch({ features: Array.from(set) });
  };

  return (
    <div className="space-y-6">
      {/* Page Header styled like the reference admin UI (style only; no new data) */}
      <div className="rounded-lg border bg-white p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">
              {displayAddress}
            </h1>
            <p className="text-sm text-muted-foreground">Property Overview</p>
          </div>
          <div className="flex items-center gap-2">
            {isSetupComplete ? (
              <Badge variant="softSuccess">Ready</Badge>
            ) : (
              <Badge variant="softWarning">Setup Incomplete</Badge>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <button className="h-8 px-3 text-sm rounded-md border bg-white hover:bg-muted">
            Info
          </button>
          <button className="h-8 px-3 text-sm rounded-md border bg-white hover:bg-muted">
            Workflow
          </button>
        </div>
      </div>
      {/* Property Summary Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Property Summary & Data Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          	<Tabs defaultValue="onboarding" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="onboarding" className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                Onboarding
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analysis
              </TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardContent className="space-y-6">
              {/* Top overview grid formatted like the reference, using existing fields */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Property card */}
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-muted-foreground">Property</div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-foreground truncate" title={displayAddress}>{displayAddress}</div>
                    <div className="text-muted-foreground">Type: {propertyData.homeType || 'N/A'}</div>
                    <div className="text-muted-foreground">Price: {propertyData.price || 'N/A'}</div>
                  </div>
                </div>
                {/* Buyer/Contact card */}
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-muted-foreground">Contact</div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{propertyData.buyerName || 'N/A'}</div>
                    <div className="text-muted-foreground">{propertyData.buyerEmail || 'N/A'}</div>
                  </div>
                </div>
                {/* Payment/Estimate card */}
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-muted-foreground">Payment</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-semibold text-emerald-600">{typeof calculatedMonthlyPayment === 'number' ? `$${Math.round(calculatedMonthlyPayment).toLocaleString()}` : '—'}</div>
                    <div className="text-xs text-muted-foreground">Est. monthly payment</div>
                  </div>
                </div>
              </div>

              {/* Setup Progress (kept, formatted to be subtle) */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{completedSteps} of {steps.length}</span>
                </div>
                <div className="mt-3">
                  <Progress value={progress} className="w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-xs">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Testing Progress Overview */}
              {false &&
                (isTestingInProgress ||
                  Object.keys(endpointResults).length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube className="w-5 h-5 text-primary" />
                        ATTOM API Data Collection
                        {isTestingInProgress && (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {isTestingInProgress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Testing endpoints...</span>
                              <span>{Math.round(testingProgress)}%</span>
                            </div>
                            <Progress
                              value={testingProgress}
                              className="w-full"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {endpoints.map((endpoint) => {
                            const result = endpointResults[endpoint.id];
                            return (
                              <div
                                key={endpoint.id}
                                className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                              >
                                {result?.isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                ) : result?.response?.success ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : result?.error || result?.response ? (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-xs">{endpoint.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Comprehensive Property Information with ATTOM Data */}
              <ComprehensivePropertyDataFields
                data={getComprehensivePropertyData()}
                isEditable={false}
                className="mb-6"
              />



              {/* Transaction Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Transaction Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyData.inspectionDate && (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">
                            Property Inspection
                          </h4>
                          <p className="text-sm text-blue-700">
                            {formatDate(propertyData.inspectionDate)}
                            {propertyData.inspectionTime &&
                              ` at ${propertyData.inspectionTime}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {propertyData.closingDate && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">
                            Closing Date
                          </h4>
                          <p className="text-sm text-green-700">
                            {formatDate(propertyData.closingDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    {!propertyData.inspectionDate &&
                      !propertyData.closingDate && (
                        <Alert>
                          <Clock className="h-4 w-4" />
                          <AlertDescription>
                            No timeline dates have been set. Complete the
                            property details form to add inspection and closing
                            dates.
                          </AlertDescription>
                        </Alert>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Buyer Information */}
                    <div>
                      <h4 className="font-medium mb-3">Buyer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">
                            {propertyData.buyerName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium">
                            {propertyData.buyerEmail || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Professional Team */}
                    <div>
                      <h4 className="font-medium mb-3">Professional Team</h4>
                      <div className="space-y-3 text-sm">
                        {propertyData.agentName && (
                          <div>
                            <span className="text-muted-foreground">
                              Real Estate Agent:
                            </span>
                            <p className="font-medium">
                              {propertyData.agentName}
                            </p>
                            {propertyData.agentPhone && (
                              <p className="text-muted-foreground">
                                {propertyData.agentPhone}
                              </p>
                            )}
                          </div>
                        )}

                        {propertyData.lenderName && (
                          <div>
                            <span className="text-muted-foreground">
                              Lender:
                            </span>
                            <p className="font-medium">
                              {propertyData.lenderName}
                            </p>
                            {propertyData.lenderPhone && (
                              <p className="text-muted-foreground">
                                {propertyData.lenderPhone}
                              </p>
                            )}
                          </div>
                        )}

                        {!propertyData.agentName &&
                          !propertyData.lenderName && (
                            <p className="text-muted-foreground italic">
                              No professional team members added yet
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
              </CardContent>
              </Card>
              </CardContent>
              </Card>
            </TabsContent>

            {/* Onboarding Tab (Editable) */}
            <TabsContent value="onboarding" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-primary" />
                    Onboarding Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BuyerIntakeForm title="Onboarding" />
                </CardContent>
              </Card>
            </TabsContent>


            {/* Property Data & API Results Tab */}
            <TabsContent value="property-data" className="space-y-6 mt-6">
              {/* Status Alert */}
              {propertyAddress ? (
                <Alert>
                  <Zap className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>
                        <strong>Loading Property Data:</strong> {displayAddress}{" "}
                        - fetching ATTOM Expanded Profile.
                      </span>
                      <Button
                        onClick={refreshAllEndpoints}
                        variant="outline"
                        size="sm"
                        disabled={isTestingInProgress}
                      >
                        {isTestingInProgress ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Refresh
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    <strong>No Property Address Found:</strong> Please complete
                    your property setup to load property data.
                  </AlertDescription>
                </Alert>
              )}

              {/* API Key Error Alert */}
              {hasAuthError && (
                <Alert className="border-red-200 bg-red-50">
                  <Key className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <strong>API Authentication Issue:</strong> The ATTOM API key
                    appears to be invalid or expired. Please check your API
                    configuration.
                  </AlertDescription>
                </Alert>
              )}

              {/* Minimal ATTOM load status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-primary" />
                    ATTOM Data Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isTestingInProgress ? (
                    <div className="flex items-center gap-3 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fetching Expanded Profile...</span>
                    </div>
                  ) : endpointResults["expandedprofile"]?.response?.success ? (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Expanded Profile loaded successfully.</span>
                    </div>
                  ) : endpointResults["expandedprofile"]?.error ? (
                    <div className="flex items-center gap-3 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>
                        Error: {endpointResults["expandedprofile"].error}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Ready.</div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Existing Property Data Components */}
              {/* ATTOM API Property Overview - Automatically loads data */}
              <PropertyOverviewWithAttomData
                propertyAddress={propertyAddress}
                onPropertyFound={(data) => {
                  console.log(
                    "ATTOM property data received in overview:",
                    data,
                  );
                }}
              />

              {/* Comprehensive Property Details - Multiple Attom APIs */}
              <ComprehensivePropertyDetails
                defaultAttomId="184713191"
                defaultAddress={propertyAddress}
                className="mb-6"
                onPropertyFound={(data) => {
                  console.log("Comprehensive property data received:", data);
                }}
              />

              {/* Property Basic Profile - Single API Search */}
              <PropertyBasicProfile
                defaultAttomId="184713191"
                className="mb-6"
              />

              {/* Legacy Comprehensive Attom Data Display */}
              {propertyAddress && attomProperty && (
                <ComprehensiveAttomDisplay
                  property={attomProperty}
                  isLoading={isAttomLoading}
                  onRefresh={() => refetchAttom(propertyAddress)}
                  onNavigate={onNavigate}
                />
              )}

              {/* Attom Data Loading/Error States */}
              {propertyAddress && !attomProperty && !isAttomLoading && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No ATTOM property data available for this address. The
                    property may not be in the ATTOM database.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6 mt-6">
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      Generate comprehensive property analysis reports using
                      ATTOM data.
                    </span>
                    <div className="flex gap-2">
                      {onNavigate && attomProperty && (
                        <Button
                          onClick={() => onNavigate("property-report")}
                          size="sm"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Generate Report
                        </Button>
                      )}
                      {onNavigate && (
                        <Button
                          onClick={() => onNavigate("comprehensive-analysis")}
                          variant="outline"
                          size="sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Comprehensive Analysis
                        </Button>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Quick Analysis Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                    >
                      <Search className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Market Analysis</div>
                        <div className="text-xs text-muted-foreground">
                          Compare local market trends
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                    >
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Value Assessment</div>
                        <div className="text-xs text-muted-foreground">
                          Get property valuation insights
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                    >
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Property Report</div>
                        <div className="text-xs text-muted-foreground">
                          Detailed property information
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Setup Status (hidden) */}
      {false && !isSetupComplete && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Complete your property setup to access all features and get the
                most accurate property data.
              </span>
              <Button size="sm" variant="outline" onClick={onEditSetup}>
                <FileText className="w-4 h-4 mr-2" />
                Continue Setup
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons (hidden) */}
      {false && (onEditSetup || onStartOver) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Property Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {onEditSetup && (
                <Button onClick={onEditSetup} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Edit Property Details
                </Button>
              )}
              {onStartOver && (
                <Button onClick={onStartOver} variant="destructive">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              )}
              {onNavigate && (
                <Button
                  onClick={() => onNavigate && onNavigate("overview")}
                  variant="default"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
