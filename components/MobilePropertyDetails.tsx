import { Fragment } from "react";
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  Edit3,
  Home,
  TrendingUp,
  Building,
  Zap,
  Star,
  School,
  Car,
  AlertCircle,
  History,
  FileText,
  GraduationCap,
  Shield,
  Users,
  Wrench,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  useAttomData,
  formatCurrency,
  formatSquareFeet,
  formatLotSize,
  formatPropertyType,
  loadCachedAttomProperty,
} from "../hooks/useAttomData";
import { AttomProperty } from "../types/attom";

interface MobilePropertyDetailsProps {
  userProfile?: any;
  setupData?: any;
  onNavigate?: (page: string) => void;
  onStartOver?: () => void;
  onEditSetup?: () => void;
}

export function MobilePropertyDetails({
  userProfile,
  setupData,
  onNavigate,
  onStartOver,
  onEditSetup,
}: MobilePropertyDetailsProps) {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "details"
    | "financials"
    | "history"
    | "schools"
    | "area"
    | "risks"
    | "settings"
  >("overview");
  const [attomProperty, setAttomProperty] = useState<AttomProperty | null>(
    null,
  );
  const [isLoadingAttomData, setIsLoadingAttomData] = useState(false);
  const [attomError, setAttomError] = useState<string | null>(null);

  const { searchByAddress, isLoading: attomLoading } = useAttomData({
    onPropertyFound: (property) => {
      console.log("Mobile - Attom property found:", property);
      setAttomProperty(property);
      setIsLoadingAttomData(false);
      setAttomError(null);
    },
    onError: (error) => {
      console.error("Mobile - Error loading Attom data:", error);
      setIsLoadingAttomData(false);
      setAttomError(error.message || "Failed to load property data");
    },
  });

  // Enhanced property data retrieval function (matching desktop)
  const getPropertyData = () => {
    try {
      const screeningData = localStorage.getItem("handoff-screening-data");
      const propertyData = localStorage.getItem("handoff-property-data");
      const initialSetupData = localStorage.getItem(
        "handoff-initial-setup-data",
      );

      console.log(
        "Mobile - PropertySummary - Retrieving data from localStorage:",
        {
          screeningData: screeningData ? "exists" : "none",
          propertyData: propertyData ? "exists" : "none",
          initialSetupData: initialSetupData ? "exists" : "none",
        },
      );

      // Start with empty data structure - no defaults
      let data: any = {
        // Address information
        address: "",
        city: "",
        state: "",
        zipCode: "",
        propertyAddress: null, // Full address from screening

        // Property details
        price: "",
        propertyPrice: null,
        propertyType: "",
        bedrooms: null,
        bathrooms: null,
        sqft: null,
        squareFootage: null,
        lotSize: "",
        yearBuilt: null,
        features: [],

        // Dates
        closingDate: "",
        inspectionDate: "",

        // Other details
        buyerName: "",
        buyerEmail: "",
      };

      // Parse initial setup data first (buyer info, basic details)
      if (initialSetupData) {
        try {
          const parsed = JSON.parse(initialSetupData);
          console.log(
            "Mobile - PropertySummary - Parsed initial setup data:",
            parsed,
          );

          // Merge initial setup data
          data = { ...data, ...parsed };

          // Map common field variations
          if (parsed.fullName) data.buyerName = parsed.fullName;
          if (parsed.email) data.buyerEmail = parsed.email;
          if (parsed.propertyAddress)
            data.propertyAddress = parsed.propertyAddress;
        } catch (error) {
          console.warn(
            "Mobile - PropertySummary - Error parsing initial setup data:",
            error,
          );
        }
      }

      // Parse screening data second (property address, preferences)
      if (screeningData) {
        try {
          const parsed = JSON.parse(screeningData);
          console.log(
            "Mobile - PropertySummary - Parsed screening data:",
            parsed,
          );

          // Merge screening data, keeping existing values
          Object.keys(parsed).forEach((key) => {
            if (
              parsed[key] !== null &&
              parsed[key] !== undefined &&
              parsed[key] !== ""
            ) {
              data[key] = parsed[key];
            }
          });

          // Handle property address specifically
          if (
            parsed.propertyAddress &&
            parsed.propertyAddress.trim().length > 0
          ) {
            data.propertyAddress = parsed.propertyAddress;
            console.log(
              "Mobile - PropertySummary - Found property address in screening data:",
              parsed.propertyAddress,
            );

            // Try to parse components from the full address if individual components are missing
            if (!data.address || !data.city) {
              const addressParts = parsed.propertyAddress
                .split(",")
                .map((part) => part.trim());
              if (addressParts.length > 0 && !data.address) {
                data.address = addressParts[0];
              }
              if (addressParts.length > 1 && !data.city) {
                data.city = addressParts[1];
              }
              if (addressParts.length > 2) {
                const stateZipPart = addressParts[2];
                const stateZipMatch = stateZipPart.match(
                  /^([A-Z]{2})\s*(\d{5})?/,
                );
                if (stateZipMatch) {
                  if (!data.state) data.state = stateZipMatch[1];
                  if (stateZipMatch[2] && !data.zipCode)
                    data.zipCode = stateZipMatch[2];
                }
              }
            }
          }
        } catch (error) {
          console.warn(
            "Mobile - PropertySummary - Error parsing screening data:",
            error,
          );
        }
      }

      // Parse property data third (detailed property info - this has highest priority)
      if (propertyData) {
        try {
          const parsed = JSON.parse(propertyData);
          console.log(
            "Mobile - PropertySummary - Parsed property data:",
            parsed,
          );

          // Merge property data with highest priority
          Object.keys(parsed).forEach((key) => {
            if (
              parsed[key] !== null &&
              parsed[key] !== undefined &&
              parsed[key] !== ""
            ) {
              data[key] = parsed[key];
            }
          });

          // Handle specific field mappings and date extraction
          if (parsed.closingDate) {
            data.closingDate = parsed.closingDate;
          }
          if (parsed.inspectionDate) {
            data.inspectionDate = parsed.inspectionDate;
          }

          // Map any alternative field names
          if (parsed.purchasePrice && !data.price && !data.propertyPrice) {
            data.price = parsed.purchasePrice;
          }
          if (parsed.contractPrice && !data.price && !data.propertyPrice) {
            data.price = parsed.contractPrice;
          }
        } catch (error) {
          console.warn(
            "Mobile - PropertySummary - Error parsing property data:",
            error,
          );
        }
      }

      // Clean up and format the data
      const cleanedData = {
        // Address info
        address: data.address || data.propertyAddress || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
        propertyAddress: data.propertyAddress || "",

        // Property details
        price: data.propertyPrice || data.price || "",
        propertyType: data.propertyType || "",
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        sqft: data.squareFootage || data.sqft || null,
        lotSize: data.lotSize || "",
        yearBuilt: data.yearBuilt || null,
        features: Array.isArray(data.features) ? data.features : [],

        // Dates
        closingDate: data.closingDate || "",
        inspectionDate: data.inspectionDate || "",

        // Buyer info
        buyerName: data.buyerName || data.fullName || "",
        buyerEmail: data.buyerEmail || data.email || "",
      };

      console.log(
        "Mobile - PropertySummary - Final cleaned property data:",
        cleanedData,
      );
      return cleanedData;
    } catch (error) {
      console.warn(
        "Mobile - PropertySummary - Error getting property data:",
        error,
      );

      // Return empty structure instead of defaults
      return {
        address: "",
        city: "",
        state: "",
        zipCode: "",
        propertyAddress: "",
        price: "",
        propertyType: "",
        bedrooms: null,
        bathrooms: null,
        sqft: null,
        lotSize: "",
        yearBuilt: null,
        features: [],
        closingDate: "",
        inspectionDate: "",
        buyerName: "",
        buyerEmail: "",
      };
    }
  };

  const propertyData = getPropertyData();

  // Enhanced Attom data loading with better address detection (matching desktop)
  useEffect(() => {
    // First, try to load cached Attom data
    const cachedProperty = loadCachedAttomProperty();
    if (cachedProperty) {
      console.log("Mobile - Using cached Attom property:", cachedProperty);
      setAttomProperty(cachedProperty);
      return;
    }

    // Determine the best address to search for
    let addressToSearch = null;

    // Priority 1: Full propertyAddress from screening data
    if (
      propertyData.propertyAddress &&
      propertyData.propertyAddress.trim().length > 10
    ) {
      addressToSearch = propertyData.propertyAddress.trim();
      console.log("Mobile - Using propertyAddress from data:", addressToSearch);
    }
    // Priority 2: Constructed address from components (but only if we have real data)
    else if (
      propertyData.address &&
      propertyData.address.trim().length > 0 &&
      propertyData.city &&
      propertyData.city.trim().length > 0
    ) {
      addressToSearch =
        `${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`.trim();
      console.log("Mobile - Using constructed address:", addressToSearch);
    }

    // Only search if we have a meaningful address
    if (
      addressToSearch &&
      addressToSearch.length > 10 &&
      !addressToSearch.includes("123 Oak Street") &&
      !addressToSearch.includes("Riverside Heights")
    ) {
      console.log(
        "Mobile - Starting Attom search for address:",
        addressToSearch,
      );
      setIsLoadingAttomData(true);
      setAttomError(null);
      searchByAddress(addressToSearch);
    } else {
      console.log(
        "Mobile - Skipping Attom search - no valid address found. Address data:",
        {
          propertyAddress: propertyData.propertyAddress,
          address: propertyData.address,
          city: propertyData.city,
          constructed:
            propertyData.address && propertyData.city
              ? `${propertyData.address}, ${propertyData.city}, ${propertyData.state}`
              : null,
        },
      );
    }
  }, [
    propertyData.propertyAddress,
    propertyData.address,
    propertyData.city,
    searchByAddress,
  ]);

  // Get enriched property data by combining user inputs with Attom data
  const getEnrichedPropertyData = () => {
    const baseData = {
      // Use user-entered data as primary source
      address: propertyData.propertyAddress || propertyData.address || "",
      city: propertyData.city || "",
      state: propertyData.state || "",
      zipCode: propertyData.zipCode || "",
      price: propertyData.price || "",
      propertyType: propertyData.propertyType || "",
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      sqft: propertyData.sqft,
      lotSize: propertyData.lotSize || "",
      yearBuilt: propertyData.yearBuilt,
      features: propertyData.features || [],
      closingDate: propertyData.closingDate || "",
      inspectionDate: propertyData.inspectionDate || "",
      buyerName: propertyData.buyerName || "",
      buyerEmail: propertyData.buyerEmail || "",
    };

    // Enhance with Attom data if available (but user data takes priority)
    if (attomProperty) {
      return {
        ...baseData,
        // Only use Attom data where user data is truly missing
        address: baseData.address || attomProperty.address.formatted,
        city: baseData.city || attomProperty.address.city,
        state: baseData.state || attomProperty.address.state,
        zipCode: baseData.zipCode || attomProperty.address.zip_code,
        propertyType:
          baseData.propertyType ||
          formatPropertyType(attomProperty.property_details.property_type),
        bedrooms: baseData.bedrooms || attomProperty.property_details.bedrooms,
        bathrooms:
          baseData.bathrooms || attomProperty.property_details.bathrooms,
        sqft: baseData.sqft || attomProperty.property_details.square_feet,
        lotSize:
          baseData.lotSize ||
          formatLotSize(
            attomProperty.property_details.lot_size_sqft,
            attomProperty.property_details.lot_size_acres,
          ),
        yearBuilt:
          baseData.yearBuilt || attomProperty.property_details.year_built,

        // Additional Attom data (supplementary information)
        estimatedValue: attomProperty.valuation.estimated_value,
        assessedValue: attomProperty.tax_assessment.total_assessed_value,
        lastSalePrice: attomProperty.valuation.last_sale_price,
        lastSaleDate: attomProperty.valuation.last_sale_date,
        pricePerSqft: attomProperty.valuation.price_per_sqft,
        annualTaxes: attomProperty.tax_assessment.annual_tax_amount,
        hoaFee: attomProperty.neighborhood?.hoa_info?.monthly_fee,
        schoolDistrict: attomProperty.neighborhood?.school_district,
        zoning: attomProperty.property_details.zoning,
        garage: attomProperty.property_details.garage_spaces,
        parking: attomProperty.property_details.parking_spaces,
        pool: attomProperty.property_details.pool,
        fireplace: attomProperty.property_details.fireplace,
        centralAir: attomProperty.property_details.central_air,
        basement: attomProperty.property_details.basement,
        stories: attomProperty.property_details.stories,
        neighborhood: attomProperty.neighborhood?.name,
        walkabilityScore: attomProperty.risk_factors?.walkability_score,
        schoolScore: attomProperty.risk_factors?.school_score,
      };
    }

    return baseData;
  };

  type EnrichedData = ReturnType<typeof getEnrichedPropertyData> & {
    estimatedValue?: number;
    pricePerSqft?: number;
    garage?: number;
    parking?: number;
  };
  const enrichedData = getEnrichedPropertyData() as EnrichedData;

  const handleEditSetup = () => {
    localStorage.setItem("handoff-setup-edit-mode", "true");

    if (onEditSetup) {
      onEditSetup();
    } else if (onNavigate) {
      onNavigate("property");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const retryAttomSearch = () => {
    const addressToSearch =
      propertyData.propertyAddress ||
      `${propertyData.address}, ${propertyData.city}, ${propertyData.state}`;
    if (
      addressToSearch &&
      addressToSearch.length > 10 &&
      !addressToSearch.includes("123 Oak Street") &&
      !addressToSearch.includes("Riverside Heights")
    ) {
      console.log("Mobile - Retrying Attom search for:", addressToSearch);
      setIsLoadingAttomData(true);
      setAttomError(null);
      searchByAddress(addressToSearch);
    }
  };

  const formatRiskScore = (score?: number) => {
    if (score === undefined || score === null) return "N/A";
    if (score >= 80)
      return {
        score: Math.round(score),
        level: "High",
        color: "text-green-600",
      };
    if (score >= 60)
      return {
        score: Math.round(score),
        level: "Good",
        color: "text-blue-600",
      };
    if (score >= 40)
      return {
        score: Math.round(score),
        level: "Fair",
        color: "text-yellow-600",
      };
    return { score: Math.round(score), level: "Poor", color: "text-red-600" };
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <Home className="w-4 h-4" /> },
    { id: "details", label: "Details", icon: <Building className="w-4 h-4" /> },
    {
      id: "financials",
      label: "Financial",
      icon: <DollarSign className="w-4 h-4" />,
    },
    { id: "history", label: "History", icon: <History className="w-4 h-4" /> },
    {
      id: "schools",
      label: "Schools",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    { id: "area", label: "Area", icon: <MapPin className="w-4 h-4" /> },
    { id: "risks", label: "Risks", icon: <Shield className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Edit3 className="w-4 h-4" /> },
  ];

  // Show message if no property data is available
  const hasBasicPropertyInfo =
    enrichedData.address ||
    enrichedData.city ||
    enrichedData.price ||
    enrichedData.propertyType;

  if (!hasBasicPropertyInfo) {
    return (
      <div className="tab-content-mobile space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Property Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Property Information Not Available
              </h3>
              <p className="text-muted-foreground mb-4">
                Complete your property setup to see detailed information and
                enhanced features.
              </p>
              <Button
                onClick={handleEditSetup}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Setup Property Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="tab-content-mobile space-y-4">
      {/* Header Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-primary">
                  {enrichedData.address || "Property Address"}
                </h2>
                {attomProperty && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              {(enrichedData.city || enrichedData.state) && (
                <p className="text-sm text-muted-foreground">
                  {[enrichedData.city, enrichedData.state, enrichedData.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Purchase Price</p>
              <p className="font-semibold">
                {enrichedData.price || "Not specified"}
              </p>
              {attomProperty && enrichedData.estimatedValue && (
                <p className="text-xs text-muted-foreground">
                  Est: {formatCurrency(enrichedData.estimatedValue)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-semibold">
                {enrichedData.propertyType || "Not specified"}
              </p>
              {attomProperty && enrichedData.pricePerSqft && (
                <p className="text-xs text-muted-foreground">
                  {`${Math.round(enrichedData.pricePerSqft)}/sq ft`}
                </p>
              )}
            </div>
          </div>

          {(isLoadingAttomData || attomLoading) && (
            <div className="mt-2 text-xs text-muted-foreground">
              Loading comprehensive property details...
            </div>
          )}

          {attomError && (
            <div className="mt-2">
              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Data unavailable</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={retryAttomSearch}
                      className="ml-2 h-6 text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Dates */}
      {(enrichedData.closingDate || enrichedData.inspectionDate) && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Important Dates
            </h3>
            <div className="space-y-2">
              {enrichedData.closingDate && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Closing</span>
                  <span className="font-medium">
                    {formatDate(enrichedData.closingDate)}
                  </span>
                </div>
              )}
              {enrichedData.inspectionDate && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Inspection</span>
                  <span className="font-medium">
                    {formatDateTime(enrichedData.inspectionDate)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="bg-muted rounded-lg p-1">
        <div className="grid grid-cols-4 gap-1">
          {tabs.slice(0, 4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`mobile-tab-multiline text-center transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                {tab.icon}
                <span className="mobile-tab-text-multiline">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1 mt-1">
          {tabs.slice(4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`mobile-tab-multiline text-center transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                {tab.icon}
                <span className="mobile-tab-text-multiline">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Property Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">
                    {enrichedData.bedrooms ||
                      attomProperty?.property_details.bedrooms ||
                      "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">
                    {enrichedData.bathrooms ||
                      attomProperty?.property_details.bathrooms ||
                      "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Square Feet</p>
                  <p className="font-semibold">
                    {enrichedData.sqft ||
                    attomProperty?.property_details.square_feet
                      ? formatSquareFeet(
                          enrichedData.sqft ||
                            attomProperty?.property_details.square_feet,
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lot Size</p>
                  <p className="font-semibold">
                    {enrichedData.lotSize ||
                      (attomProperty
                        ? formatLotSize(
                            attomProperty.property_details.lot_size_sqft,
                            attomProperty.property_details.lot_size_acres,
                          )
                        : "N/A")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-semibold">
                    {enrichedData.yearBuilt ||
                      attomProperty?.property_details.year_built ||
                      "N/A"}
                  </p>
                </div>
                {attomProperty?.property_details.stories && (
                  <div>
                    <p className="text-sm text-muted-foreground">Stories</p>
                    <p className="font-semibold">
                      {attomProperty.property_details.stories}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quality Scores */}
          {attomProperty &&
            (attomProperty.risk_factors?.walkability_score ||
              attomProperty.risk_factors?.school_score) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Quality Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {attomProperty.risk_factors?.walkability_score && (
                      <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xl font-bold text-blue-700">
                          {
                            formatRiskScore(
                              attomProperty.risk_factors.walkability_score,
                            ).score
                          }
                        </div>
                        <div className="text-sm text-blue-600">Walk Score</div>
                        <div className="text-xs text-blue-500">
                          {
                            formatRiskScore(
                              attomProperty.risk_factors.walkability_score,
                            ).level
                          }
                        </div>
                      </div>
                    )}
                    {attomProperty.risk_factors?.school_score && (
                      <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-xl font-bold text-green-700">
                          {
                            formatRiskScore(
                              attomProperty.risk_factors.school_score,
                            ).score
                          }
                        </div>
                        <div className="text-sm text-green-600">
                          School Score
                        </div>
                        <div className="text-xs text-green-500">
                          {
                            formatRiskScore(
                              attomProperty.risk_factors.school_score,
                            ).level
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Features */}
          {(enrichedData.features && enrichedData.features.length > 0) ||
            (attomProperty && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Features & Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* User-defined features */}
                  {enrichedData.features &&
                    enrichedData.features.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-2">
                          Highlighted Features
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {enrichedData.features.map(
                            (feature: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {feature}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Attom-derived features */}
                  {attomProperty && (
                    <div className="flex flex-wrap gap-2">
                      {attomProperty.property_details.pool && (
                        <Badge variant="outline">🏊‍♂️ Pool</Badge>
                      )}
                      {attomProperty.property_details.fireplace && (
                        <Badge variant="outline">🔥 Fireplace</Badge>
                      )}
                      {attomProperty.property_details.central_air && (
                        <Badge variant="outline">❄️ Central Air</Badge>
                      )}
                      {attomProperty.property_details.basement && (
                        <Badge variant="outline">🏠 Basement</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Other tab content follows the same pattern as before but with better data handling */}
      {activeTab === "details" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-medium">
                    {enrichedData.propertyType || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Year Built</span>
                  <span className="font-medium">
                    {enrichedData.yearBuilt ||
                      attomProperty?.property_details.year_built ||
                      "N/A"}
                  </span>
                </div>
                {(attomProperty?.property_details.garage_spaces ||
                  enrichedData.garage) && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Garage Spaces</span>
                    <span className="font-medium">
                      {attomProperty?.property_details.garage_spaces ||
                        enrichedData.garage}
                    </span>
                  </div>
                )}
                {(attomProperty?.property_details.parking_spaces ||
                  enrichedData.parking) && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Parking</span>
                    <span className="font-medium">
                      {attomProperty?.property_details.parking_spaces ||
                        enrichedData.parking}
                    </span>
                  </div>
                )}
                {attomProperty?.property_details.zoning && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Zoning</span>
                    <span className="font-medium">
                      {attomProperty.property_details.zoning}
                    </span>
                  </div>
                )}
                {attomProperty?.property_details.heating_type && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Heating</span>
                    <span className="font-medium">
                      {attomProperty.property_details.heating_type}
                    </span>
                  </div>
                )}
                {attomProperty?.property_details.cooling_type && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Cooling</span>
                    <span className="font-medium">
                      {attomProperty.property_details.cooling_type}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Continue with other tabs - financials, history, schools, area, risks, settings */}
      {/* These will follow the same pattern with proper data handling */}
      {activeTab === "financials" && (
        <div className="space-y-4">
          {attomProperty ? (
            <Fragment>
              {/* Valuation */}
              {attomProperty.valuation.estimated_value && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Property Valuation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        Estimated Market Value
                      </p>
                      <p className="text-xl font-bold text-green-800">
                        {formatCurrency(
                          attomProperty.valuation.estimated_value,
                        )}
                      </p>
                      {attomProperty.valuation.confidence_score && (
                        <p className="text-xs text-green-600">
                          Confidence:{" "}
                          {Math.round(attomProperty.valuation.confidence_score)}
                          %
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {attomProperty.valuation.market_value && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Market Value
                          </span>
                          <span className="font-medium">
                            {formatCurrency(
                              attomProperty.valuation.market_value,
                            )}
                          </span>
                        </div>
                      )}
                      {attomProperty.valuation.price_per_sqft && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Price per Sq Ft
                          </span>
                          <span className="font-medium">
                            $
                            {Math.round(attomProperty.valuation.price_per_sqft)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tax Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Tax Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {attomProperty.tax_assessment.total_assessed_value && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">
                        Assessed Value
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          attomProperty.tax_assessment.total_assessed_value,
                        )}
                      </span>
                    </div>
                  )}
                  {attomProperty.tax_assessment.annual_tax_amount && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">
                        Annual Taxes
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          attomProperty.tax_assessment.annual_tax_amount,
                        )}
                      </span>
                    </div>
                  )}
                  {attomProperty.neighborhood?.hoa_info?.monthly_fee && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">HOA Fee</span>
                      <span className="font-medium">
                        {formatCurrency(
                          attomProperty.neighborhood.hoa_info.monthly_fee,
                        )}
                        /month
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Fragment>
          ) : (
            <Card>
              <CardContent className="p-4 text-center">
                <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">
                  {attomError
                    ? "Property valuation data is currently unavailable."
                    : "Enhanced financial data requires a valid address"}
                </p>
                {attomError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryAttomSearch}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                )}
                {!attomError && (
                  <p className="text-sm mt-1 text-muted-foreground">
                    Edit your setup to add a property address
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Property Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleEditSetup} className="w-full">
                Edit Property Setup
              </Button>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  Data Sources
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Property Details</span>
                    <Badge variant={attomProperty ? "default" : "secondary"}>
                      {attomProperty ? "Attom Data" : "Manual Entry"}
                    </Badge>
                  </div>
                  {attomProperty && (
                    <div className="text-xs text-muted-foreground">
                      Last updated:{" "}
                      {new Date(
                        attomProperty.last_updated,
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add placeholders for other tabs */}
      {["history", "schools", "area", "risks"].includes(activeTab) && (
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">
              {activeTab === "history" && <History className="w-full h-full" />}
              {activeTab === "schools" && (
                <GraduationCap className="w-full h-full" />
              )}
              {activeTab === "area" && <MapPin className="w-full h-full" />}
              {activeTab === "risks" && <Shield className="w-full h-full" />}
            </div>
            <p className="text-muted-foreground">
              {attomError
                ? `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} information is currently unavailable.`
                : `Enhanced ${activeTab} data requires a valid address`}
            </p>
            {attomError && (
              <Button
                variant="outline"
                size="sm"
                onClick={retryAttomSearch}
                className="mt-2"
              >
                Retry
              </Button>
            )}
            {!attomError && (
              <p className="text-sm mt-1 text-muted-foreground">
                Edit your setup to add a property address
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
