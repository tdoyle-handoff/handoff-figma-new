import { Fragment } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
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
  Building2,
  Ruler,
  Trees,
  Car,
  Zap,
  Droplets,
  Wind,
  Thermometer,
  Shield,
  Hammer,
  TrendingUp,
  FileText,
  Calculator,
  Scale,
  Landmark,
  School,
  ShoppingBag,
  Hospital,
  Plane,
  Train,
  Bus,
  AlertCircle,
  Check,
  X,
  Info,
} from "lucide-react";

interface PropertyData {
  // Basic Property Information
  address?: {
    oneLine?: string;
    line1?: string;
    line2?: string;
    locality?: string;
    countrySubd?: string;
    postal1?: string;
    postal2?: string;
    postal3?: string;
    country?: string;
  };
  identifier?: {
    attomId?: string;
    fips?: string;
    apn?: string;
    obPropId?: string;
  };
  lot?: {
    lotNum?: string;
    lotSqFt?: number;
    lotAcres?: number;
    poolType?: string;
    poolYN?: boolean;
    subdName?: string;
    subdTractNum?: string;
  };

  // Building Information
  building?: {
    size?: {
      bldgSqFt?: number;
      grossSqFt?: number;
      livingAreaSqFt?: number;
      universalBldgSqFt?: number;
    };
    construction?: {
      constructionType?: string;
      exteriorWalls?: string;
      foundationType?: string;
      foundationWalls?: string;
      roofType?: string;
      roofCover?: string;
      roofFrame?: string;
      floorCover?: string;
      wallsType?: string;
      interiorWalls?: string;
      windowType?: string;
      condition?: string;
      quality?: string;
      yearBuilt?: number;
      effectiveYearBuilt?: number;
      yearRenovated?: number;
      lastModifiedDate?: string;
    };
    rooms?: {
      bathsTotal?: number;
      bathsFull?: number;
      bathsPartial?: number;
      baths1qtr?: number;
      baths3qtr?: number;
      bathsTotalInteger?: number;
      bedsCount?: number;
      roomsTotal?: number;
    };
    interior?: {
      fplcType?: string;
      fplcCount?: number;
      storyDesc?: string;
      unitsCount?: number;
      noOfFloors?: number;
      noOfStories?: number;
      partialBathCount?: number;
      fullBathCount?: number;
    };
    summary?: {
      propType?: string;
      propSubType?: string;
      propClass?: string;
      standardUse?: string;
      yearBuilt?: number;
      storiesDesc?: string;
      noOfStories?: number;
      noOfUnits?: number;
      noOfBuildings?: number;
      unitsCount?: number;
      livingAreaSqFt?: number;
      bldgSqFt?: number;
      lotSqFt?: number;
    };
  };

  // Assessment Information
  assessment?: {
    assessed?: {
      assdTtlValue?: number;
      assdLandValue?: number;
      assdImpValue?: number;
      marketTtlValue?: number;
      marketLandValue?: number;
      marketImpValue?: number;
      apprTtlValue?: number;
      apprLandValue?: number;
      apprImpValue?: number;
      taxYear?: number;
      taxAmt?: number;
      exemptionType?: string;
      exemptionAmt?: number;
    };
    market?: {
      mktTtlValue?: number;
      mktLandValue?: number;
      mktImpValue?: number;
    };
    tax?: {
      taxAmt?: number;
      taxYear?: number;
      taxRateCodeArea?: string;
      exemptionAmt?: number;
      exemptionType?: string;
    };
  };

  // Utilities & Features
  utilities?: {
    cooling?: string;
    coolingYN?: boolean;
    heating?: string;
    heatingYN?: boolean;
    electric?: string;
    gas?: string;
    sewer?: string;
    water?: string;
    fuelType?: string;
  };

  // Location Information
  location?: {
    accuracy?: string;
    elevation?: number;
    latitude?: number;
    longitude?: number;
    distance?: number;
    geoid?: string;
  };

  // Ownership Information
  owner?: {
    names?: Array<{
      first?: string;
      last?: string;
      middle?: string;
      suffix?: string;
      fullName?: string;
    }>;
    corporateIndicator?: boolean;
    trustIndicator?: boolean;
    occupancyStatus?: string;
    ownershipType?: string;
    mailAddress?: {
      oneLine?: string;
      line1?: string;
      line2?: string;
      locality?: string;
      countrySubd?: string;
      postal1?: string;
      country?: string;
    };
  };

  // Sale Information
  sale?: {
    amount?: {
      saleAmt?: number;
      saleAmtStnd?: number;
      saleDisclosureType?: string;
    };
    calculation?: {
      pricePerSqFt?: number;
    };
    salesHistory?: Array<{
      amount?: number;
      date?: string;
      transactionType?: string;
      documentType?: string;
    }>;
    transactionDetail?: {
      saleTransDate?: string;
      deedType?: string;
      documentType?: string;
      recordingDate?: string;
      grantorName?: string;
      granteeName?: string;
      multipleApnFlag?: boolean;
      partialInterestFlag?: boolean;
    };
  };

  // Neighborhood & Area Information
  area?: {
    blockId?: string;
    phaseId?: string;
    subdivisionName?: string;
    munCode?: string;
    munName?: string;
    countyName?: string;
    schoolDistrict?: string;
    schoolDistrictId?: string;
    elementarySchool?: string;
    middleSchool?: string;
    highSchool?: string;
    censusBlock?: string;
    censusTract?: string;
  };

  // Additional Features
  features?: {
    accessType?: string;
    architecturalStyle?: string;
    basement?: string;
    basementSqFt?: number;
    garage?: string;
    garageSpaces?: number;
    garageSqFt?: number;
    parkingSpaces?: number;
    parkingType?: string;
    patio?: string;
    deck?: string;
    fence?: string;
    sprinklerSystem?: boolean;
    securitySystem?: boolean;
    fireplace?: boolean;
    centralAir?: boolean;
    centralHeat?: boolean;
    spaHotTub?: boolean;
    tennis?: boolean;
    recreation?: string;
  };

  // Environmental Information
  environmental?: {
    floodZone?: string;
    floodRisk?: string;
    earthquake?: string;
    wildfire?: string;
    climate?: {
      avgTemperature?: number;
      avgRainfall?: number;
      humidity?: number;
    };
  };

  // Legal Information
  legal?: {
    legalDescription?: string;
    propertyUse?: string;
    zoning?: string;
    restrictions?: string;
    easements?: string;
    covenants?: string;
    propertyRights?: string;
  };

  // Financial Information
  financial?: {
    listPrice?: number;
    estimatedValue?: number;
    rentEstimate?: number;
    priceHistory?: Array<{
      date?: string;
      price?: number;
      priceType?: string;
    }>;
    marketTrends?: {
      appreciation?: number;
      averageDays?: number;
      medianPrice?: number;
    };
  };
}

interface ComprehensivePropertyDataFieldsProps {
  data?: PropertyData;
  isEditable?: boolean;
  onDataChange?: (data: PropertyData) => void;
  className?: string;
}

export function ComprehensivePropertyDataFields({
  data = {},
  isEditable = false,
  onDataChange,
  className = "",
}: ComprehensivePropertyDataFieldsProps) {
  const SHOW_TECH_SECTIONS = false;

  const renderField = (
    label: string,
    value: any,
    key: string,
    type: "text" | "number" | "select" | "textarea" = "text",
    options?: string[],
  ) => {
    if (!isEditable) {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <p className="text-sm">{value || "Not available"}</p>
        </div>
      );
    }

    if (type === "select" && options) {
      return (
        <div className="space-y-1">
          <Label className="text-xs">{label}</Label>
          <Select
            value={value || ""}
            onValueChange={(newValue) =>
              onDataChange?.({ ...data, [key]: newValue })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div className="space-y-1">
          <Label className="text-xs">{label}</Label>
          <Textarea
            value={value || ""}
            onChange={(e) => onDataChange?.({ ...data, [key]: e.target.value })}
            className="min-h-16 text-xs"
          />
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <Label className="text-xs">{label}</Label>
        <Input
          type={type}
          value={value || ""}
          onChange={(e) =>
            onDataChange?.({
              ...data,
              [key]:
                type === "number" ? Number(e.target.value) : e.target.value,
            })
          }
          className="h-8 text-xs"
        />
      </div>
    );
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "Not available";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | undefined) => {
    if (!value) return "Not available";
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Property Identification */}
      {SHOW_TECH_SECTIONS && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="w-5 h-5 text-primary" />
              Property Identification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField(
                "ATTOM ID",
                data.identifier?.attomId,
                "identifier.attomId",
              )}
              {renderField("APN", data.identifier?.apn, "identifier.apn")}
              {renderField(
                "FIPS Code",
                data.identifier?.fips,
                "identifier.fips",
              )}
              {renderField(
                "Property ID",
                data.identifier?.obPropId,
                "identifier.obPropId",
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              {renderField(
                "Full Address",
                data.address?.oneLine,
                "address.oneLine",
                "textarea",
              )}
            </div>
            {renderField(
              "Street Address",
              data.address?.line1,
              "address.line1",
            )}
            {renderField(
              "Address Line 2",
              data.address?.line2,
              "address.line2",
            )}
            {renderField("City", data.address?.locality, "address.locality")}
            {renderField(
              "State",
              data.address?.countrySubd,
              "address.countrySubd",
            )}
            {renderField("ZIP Code", data.address?.postal1, "address.postal1")}
            {renderField("ZIP+4", data.address?.postal2, "address.postal2")}
            {renderField("Country", data.address?.country, "address.country")}
          </div>
        </CardContent>
      </Card>

      {/* Building Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            Building Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Building Info */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(
                  "Property Type",
                  data.building?.summary?.propType,
                  "building.summary.propType",
                )}
                {renderField(
                  "Property Subtype",
                  data.building?.summary?.propSubType,
                  "building.summary.propSubType",
                )}
                {renderField(
                  "Property Class",
                  data.building?.summary?.propClass,
                  "building.summary.propClass",
                )}
                {renderField(
                  "Standard Use",
                  data.building?.summary?.standardUse,
                  "building.summary.standardUse",
                )}
                {renderField(
                  "Year Built",
                  data.building?.construction?.yearBuilt,
                  "building.construction.yearBuilt",
                  "number",
                )}
                {renderField(
                  "Effective Year Built",
                  data.building?.construction?.effectiveYearBuilt,
                  "building.construction.effectiveYearBuilt",
                  "number",
                )}
                {renderField(
                  "Year Renovated",
                  data.building?.construction?.yearRenovated,
                  "building.construction.yearRenovated",
                  "number",
                )}
                {renderField(
                  "Number of Stories",
                  data.building?.summary?.noOfStories,
                  "building.summary.noOfStories",
                  "number",
                )}
                {renderField(
                  "Number of Units",
                  data.building?.summary?.noOfUnits,
                  "building.summary.noOfUnits",
                  "number",
                )}
              </div>
            </div>

            <Separator />

            {/* Size Information */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Size Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Building Sq Ft
                  </Label>
                  <p className="text-sm">
                    {formatNumber(data.building?.size?.bldgSqFt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Living Area Sq Ft
                  </Label>
                  <p className="text-sm">
                    {formatNumber(data.building?.size?.livingAreaSqFt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Gross Sq Ft
                  </Label>
                  <p className="text-sm">
                    {formatNumber(data.building?.size?.grossSqFt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Universal Building Sq Ft
                  </Label>
                  <p className="text-sm">
                    {formatNumber(data.building?.size?.universalBldgSqFt)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rooms Information */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Rooms & Layout
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Bedrooms
                  </Label>
                  <p className="text-sm">
                    {data.building?.rooms?.bedsCount || "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Total Bathrooms
                  </Label>
                  <p className="text-sm">
                    {data.building?.rooms?.bathsTotal || "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Full Bathrooms
                  </Label>
                  <p className="text-sm">
                    {data.building?.rooms?.bathsFull || "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Partial Bathrooms
                  </Label>
                  <p className="text-sm">
                    {data.building?.rooms?.bathsPartial || "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Total Rooms
                  </Label>
                  <p className="text-sm">
                    {data.building?.rooms?.roomsTotal || "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Stories Description
                  </Label>
                  <p className="text-sm">
                    {data.building?.interior?.storyDesc || "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Fireplace Count
                  </Label>
                  <p className="text-sm">
                    {data.building?.interior?.fplcCount || "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Fireplace Type
                  </Label>
                  <p className="text-sm">
                    {data.building?.interior?.fplcType || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Construction Details */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Hammer className="w-4 h-4" />
                Construction Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(
                  "Construction Type",
                  data.building?.construction?.constructionType,
                  "building.construction.constructionType",
                )}
                {renderField(
                  "Exterior Walls",
                  data.building?.construction?.exteriorWalls,
                  "building.construction.exteriorWalls",
                )}
                {renderField(
                  "Foundation Type",
                  data.building?.construction?.foundationType,
                  "building.construction.foundationType",
                )}
                {renderField(
                  "Foundation Walls",
                  data.building?.construction?.foundationWalls,
                  "building.construction.foundationWalls",
                )}
                {renderField(
                  "Roof Type",
                  data.building?.construction?.roofType,
                  "building.construction.roofType",
                )}
                {renderField(
                  "Roof Cover",
                  data.building?.construction?.roofCover,
                  "building.construction.roofCover",
                )}
                {renderField(
                  "Roof Frame",
                  data.building?.construction?.roofFrame,
                  "building.construction.roofFrame",
                )}
                {renderField(
                  "Floor Cover",
                  data.building?.construction?.floorCover,
                  "building.construction.floorCover",
                )}
                {renderField(
                  "Interior Walls",
                  data.building?.construction?.interiorWalls,
                  "building.construction.interiorWalls",
                )}
                {renderField(
                  "Window Type",
                  data.building?.construction?.windowType,
                  "building.construction.windowType",
                )}
                {renderField(
                  "Condition",
                  data.building?.construction?.condition,
                  "building.construction.condition",
                )}
                {renderField(
                  "Quality",
                  data.building?.construction?.quality,
                  "building.construction.quality",
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lot Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trees className="w-5 h-5 text-primary" />
            Lot Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Lot Number
              </Label>
              <p className="text-sm">{data.lot?.lotNum || "Not available"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Lot Size (Sq Ft)
              </Label>
              <p className="text-sm">{formatNumber(data.lot?.lotSqFt)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Lot Size (Acres)
              </Label>
              <p className="text-sm">{data.lot?.lotAcres || "Not available"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Pool</Label>
              <p className="text-sm">{data.lot?.poolYN ? "Yes" : "No"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Pool Type</Label>
              <p className="text-sm">{data.lot?.poolType || "Not available"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Subdivision
              </Label>
              <p className="text-sm">{data.lot?.subdName || "Not available"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Tract Number
              </Label>
              <p className="text-sm">
                {data.lot?.subdTractNum || "Not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment & Tax Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="w-5 h-5 text-primary" />
            Assessment & Tax Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Assessed Values</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Total Assessed Value
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(data.assessment?.assessed?.assdTtlValue)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Land Assessed Value
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(data.assessment?.assessed?.assdLandValue)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Improvement Assessed Value
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(data.assessment?.assessed?.assdImpValue)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Market Values</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Total Market Value
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(data.assessment?.assessed?.marketTtlValue)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Land Market Value
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(data.assessment?.assessed?.marketLandValue)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Improvement Market Value
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(data.assessment?.assessed?.marketImpValue)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Tax Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Tax Amount
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(data.assessment?.assessed?.taxAmt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Tax Year
                  </Label>
                  <p className="text-sm">
                    {data.assessment?.assessed?.taxYear || "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Exemption Amount
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(data.assessment?.assessed?.exemptionAmt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Exemption Type
                  </Label>
                  <p className="text-sm">
                    {data.assessment?.assessed?.exemptionType ||
                      "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utilities & Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Utilities & Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                Heating
              </Label>
              <p className="text-sm">
                {data.utilities?.heating || "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Wind className="w-3 h-3" />
                Cooling
              </Label>
              <p className="text-sm">
                {data.utilities?.cooling || "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Electric
              </Label>
              <p className="text-sm">
                {data.utilities?.electric || "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Gas</Label>
              <p className="text-sm">
                {data.utilities?.gas || "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                Water
              </Label>
              <p className="text-sm">
                {data.utilities?.water || "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Sewer</Label>
              <p className="text-sm">
                {data.utilities?.sewer || "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fuel Type</Label>
              <p className="text-sm">
                {data.utilities?.fuelType || "Not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ownership Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Ownership Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.owner?.names && data.owner.names.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Owner Names</h4>
                <div className="space-y-2">
                  {data.owner.names.map((owner, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">
                        {owner.fullName || `${owner.first} ${owner.last}`}
                      </Badge>
                      {data.owner?.corporateIndicator && (
                        <Badge variant="secondary">Corporate</Badge>
                      )}
                      {data.owner?.trustIndicator && (
                        <Badge variant="secondary">Trust</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Occupancy Status
                </Label>
                <p className="text-sm">
                  {data.owner?.occupancyStatus || "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Ownership Type
                </Label>
                <p className="text-sm">
                  {data.owner?.ownershipType || "Not available"}
                </p>
              </div>
            </div>

            {data.owner?.mailAddress && (
              <div>
                <h4 className="font-medium mb-2">Mailing Address</h4>
                <p className="text-sm text-muted-foreground">
                  {data.owner.mailAddress.oneLine ||
                    `${data.owner.mailAddress.line1}, ${data.owner.mailAddress.locality}, ${data.owner.mailAddress.countrySubd} ${data.owner.mailAddress.postal1}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sale Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-primary" />
            Sale Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Sale Amount
                </Label>
                <p className="text-sm font-medium">
                  {formatCurrency(data.sale?.amount?.saleAmt)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Standard Sale Amount
                </Label>
                <p className="text-sm">
                  {formatCurrency(data.sale?.amount?.saleAmtStnd)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Price Per Sq Ft
                </Label>
                <p className="text-sm">
                  {data.sale?.calculation?.pricePerSqFt
                    ? `$${data.sale.calculation.pricePerSqFt.toFixed(2)}`
                    : "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Sale Date
                </Label>
                <p className="text-sm">
                  {formatDate(data.sale?.transactionDetail?.saleTransDate)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Deed Type
                </Label>
                <p className="text-sm">
                  {data.sale?.transactionDetail?.deedType || "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Document Type
                </Label>
                <p className="text-sm">
                  {data.sale?.transactionDetail?.documentType ||
                    "Not available"}
                </p>
              </div>
            </div>

            {data.sale?.salesHistory && data.sale.salesHistory.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Sales History</h4>
                <div className="space-y-2">
                  {data.sale.salesHistory.map((sale, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {formatCurrency(sale.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sale.transactionType} - {sale.documentType}
                        </p>
                      </div>
                      <p className="text-sm">{formatDate(sale.date)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      {SHOW_TECH_SECTIONS && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-primary" />
              Location & Coordinates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Latitude
                </Label>
                <p className="text-sm font-mono">
                  {data.location?.latitude || "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Longitude
                </Label>
                <p className="text-sm font-mono">
                  {data.location?.longitude || "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Elevation
                </Label>
                <p className="text-sm">
                  {data.location?.elevation
                    ? `${data.location.elevation} ft`
                    : "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Accuracy
                </Label>
                <p className="text-sm">
                  {data.location?.accuracy || "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">GeoID</Label>
                <p className="text-sm font-mono">
                  {data.location?.geoid || "Not available"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Area & Neighborhood */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Landmark className="w-5 h-5 text-primary" />
            Area & Neighborhood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Administrative Areas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(
                  "County",
                  data.area?.countyName,
                  "area.countyName",
                )}
                {renderField(
                  "Municipality",
                  data.area?.munName,
                  "area.munName",
                )}
                {renderField(
                  "Municipality Code",
                  data.area?.munCode,
                  "area.munCode",
                )}
                {renderField("Block ID", data.area?.blockId, "area.blockId")}
                {renderField("Phase ID", data.area?.phaseId, "area.phaseId")}
                {renderField(
                  "Subdivision",
                  data.area?.subdivisionName,
                  "area.subdivisionName",
                )}
                {renderField(
                  "Census Block",
                  data.area?.censusBlock,
                  "area.censusBlock",
                )}
                {renderField(
                  "Census Tract",
                  data.area?.censusTract,
                  "area.censusTract",
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <School className="w-4 h-4" />
                School Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(
                  "School District",
                  data.area?.schoolDistrict,
                  "area.schoolDistrict",
                )}
                {renderField(
                  "District ID",
                  data.area?.schoolDistrictId,
                  "area.schoolDistrictId",
                )}
                {renderField(
                  "Elementary School",
                  data.area?.elementarySchool,
                  "area.elementarySchool",
                )}
                {renderField(
                  "Middle School",
                  data.area?.middleSchool,
                  "area.middleSchool",
                )}
                {renderField(
                  "High School",
                  data.area?.highSchool,
                  "area.highSchool",
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="w-5 h-5 text-primary" />
            Additional Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField(
              "Architectural Style",
              data.features?.architecturalStyle,
              "features.architecturalStyle",
            )}
            {renderField(
              "Basement",
              data.features?.basement,
              "features.basement",
            )}
            {renderField(
              "Basement Sq Ft",
              data.features?.basementSqFt,
              "features.basementSqFt",
              "number",
            )}
            {renderField(
              "Garage Type",
              data.features?.garage,
              "features.garage",
            )}
            {renderField(
              "Garage Spaces",
              data.features?.garageSpaces,
              "features.garageSpaces",
              "number",
            )}
            {renderField(
              "Garage Sq Ft",
              data.features?.garageSqFt,
              "features.garageSqFt",
              "number",
            )}
            {renderField(
              "Parking Spaces",
              data.features?.parkingSpaces,
              "features.parkingSpaces",
              "number",
            )}
            {renderField(
              "Parking Type",
              data.features?.parkingType,
              "features.parkingType",
            )}
            {renderField("Patio", data.features?.patio, "features.patio")}
            {renderField("Deck", data.features?.deck, "features.deck")}
            {renderField("Fence", data.features?.fence, "features.fence")}
            {renderField(
              "Recreation",
              data.features?.recreation,
              "features.recreation",
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Special Features</h4>
              <div className="flex flex-wrap gap-2">
                {data.features?.sprinklerSystem && (
                  <Badge variant="secondary">Sprinkler System</Badge>
                )}
                {data.features?.securitySystem && (
                  <Badge variant="secondary">Security System</Badge>
                )}
                {data.features?.fireplace && (
                  <Badge variant="secondary">Fireplace</Badge>
                )}
                {data.features?.centralAir && (
                  <Badge variant="secondary">Central Air</Badge>
                )}
                {data.features?.centralHeat && (
                  <Badge variant="secondary">Central Heat</Badge>
                )}
                {data.features?.spaHotTub && (
                  <Badge variant="secondary">Spa/Hot Tub</Badge>
                )}
                {data.features?.tennis && (
                  <Badge variant="secondary">Tennis</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Environmental Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField(
              "Flood Zone",
              data.environmental?.floodZone,
              "environmental.floodZone",
            )}
            {renderField(
              "Flood Risk",
              data.environmental?.floodRisk,
              "environmental.floodRisk",
            )}
            {renderField(
              "Earthquake Risk",
              data.environmental?.earthquake,
              "environmental.earthquake",
            )}
            {renderField(
              "Wildfire Risk",
              data.environmental?.wildfire,
              "environmental.wildfire",
            )}
            {data.environmental?.climate && (
              <Fragment>
                {renderField(
                  "Avg Temperature",
                  data.environmental.climate.avgTemperature,
                  "environmental.climate.avgTemperature",
                  "number",
                )}
                {renderField(
                  "Avg Rainfall",
                  data.environmental.climate.avgRainfall,
                  "environmental.climate.avgRainfall",
                  "number",
                )}
                {renderField(
                  "Humidity",
                  data.environmental.climate.humidity,
                  "environmental.climate.humidity",
                  "number",
                )}
              </Fragment>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="w-5 h-5 text-primary" />
            Legal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                "Property Use",
                data.legal?.propertyUse,
                "legal.propertyUse",
              )}
              {renderField("Zoning", data.legal?.zoning, "legal.zoning")}
              {renderField(
                "Property Rights",
                data.legal?.propertyRights,
                "legal.propertyRights",
              )}
            </div>
            {renderField(
              "Legal Description",
              data.legal?.legalDescription,
              "legal.legalDescription",
              "textarea",
            )}
            {renderField(
              "Restrictions",
              data.legal?.restrictions,
              "legal.restrictions",
              "textarea",
            )}
            {renderField(
              "Easements",
              data.legal?.easements,
              "legal.easements",
              "textarea",
            )}
            {renderField(
              "Covenants",
              data.legal?.covenants,
              "legal.covenants",
              "textarea",
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  List Price
                </Label>
                <p className="text-sm font-medium">
                  {formatCurrency(data.financial?.listPrice)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Estimated Value
                </Label>
                <p className="text-sm font-medium">
                  {formatCurrency(data.financial?.estimatedValue)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Rent Estimate
                </Label>
                <p className="text-sm">
                  {formatCurrency(data.financial?.rentEstimate)}
                </p>
              </div>
            </div>

            {data.financial?.marketTrends && (
              <div>
                <h4 className="font-medium mb-3">Market Trends</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Appreciation
                    </Label>
                    <p className="text-sm">
                      {data.financial.marketTrends.appreciation
                        ? `${data.financial.marketTrends.appreciation}%`
                        : "Not available"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Average Days on Market
                    </Label>
                    <p className="text-sm">
                      {data.financial.marketTrends.averageDays ||
                        "Not available"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Median Price
                    </Label>
                    <p className="text-sm">
                      {formatCurrency(data.financial.marketTrends.medianPrice)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.financial?.priceHistory &&
              data.financial.priceHistory.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Price History</h4>
                  <div className="space-y-2">
                    {data.financial.priceHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {formatCurrency(entry.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.priceType}
                          </p>
                        </div>
                        <p className="text-sm">{formatDate(entry.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
