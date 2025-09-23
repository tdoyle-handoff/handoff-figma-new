import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Home, DollarSign, MapPin, Calendar, TrendingUp, Users, 
  Building, Ruler, Car, Zap, Shield, AlertTriangle, 
  CheckCircle, Info, RefreshCw, Eye, ChevronDown, ChevronRight,
  FileText, Calculator, Gavel, Droplets, TreePine
} from 'lucide-react';
import { useAttomData, formatCurrency, formatSquareFeet, formatLotSize, formatConfidenceScore } from '../hooks/useAttomData';
import { AttomProperty } from '../types/attom';
import { useIsMobile } from './ui/use-mobile';
import { cn } from './ui/utils';

interface PropertyAnalysisReportProps {
  address?: string;
  attomProperty?: AttomProperty;
  onPropertyUpdate?: (property: AttomProperty) => void;
  className?: string;
}

interface FieldSection {
  title: string;
  icon: React.ReactNode;
  fields: Array<{
    label: string;
    value: any;
    format?: (value: any) => string;
    important?: boolean;
    description?: string;
  }>;
}

export function PropertyAnalysisReport({ 
  address, 
  attomProperty: initialProperty, 
  onPropertyUpdate,
  className 
}: PropertyAnalysisReportProps) {
  const [property, setProperty] = useState<AttomProperty | null>(initialProperty || null);
  const [editMode, setEditMode] = useState<boolean>(false);
  type FieldOverride = { value?: string; note?: string };
  const [overrides, setOverrides] = useState<Record<string, FieldOverride>>({});
  const saveTimerRef = useRef<number | null>(null);
  const SAVE_KEY = 'handoff-property-analysis-userdata';
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [rawApiData, setRawApiData] = useState<any>(null);
  const isMobile = useIsMobile();
  const { userProfile, isGuestMode, updateUserProfile } = require('../hooks/useAuth').useAuth();

  const { searchByAddress, isLoading, error } = useAttomData({
    onPropertyFound: (foundProperty) => {
      setProperty(foundProperty);
      onPropertyUpdate?.(foundProperty);
    },
    onError: (err) => {
      console.error('Error loading property data:', err);
    }
  });

  // Compute stable property key for saving user edits
  const propertyKey = (property as any)?.attom_id || address || 'unknown-property';
  const slug = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const fieldKey = (sectionTitle: string, fieldLabel: string) => `${slug(sectionTitle)}__${slug(fieldLabel)}`;

  // Load property data on address change
  useEffect(() => {
    if (address && !initialProperty) {
      handleRefreshData();
    }
  }, [address, initialProperty]);

  // Load saved user overrides for this property
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const all = raw ? JSON.parse(raw) : {};
      const entry = all[propertyKey];
      if (entry && entry.overrides) setOverrides(entry.overrides as Record<string, FieldOverride>);
    } catch (e) {
      // non-fatal
    }
  }, [propertyKey]);

  // Persist overrides (debounced) and sync to profile
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const all = raw ? JSON.parse(raw) : {};
      all[propertyKey] = { overrides, lastUpdated: new Date().toISOString(), propertyId: propertyKey };
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(async () => {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(all)); } catch {}
        try {
          if (userProfile && !isGuestMode && typeof updateUserProfile === 'function') {
            const currentPrefs = (userProfile as any)?.preferences || {};
            const prev = (currentPrefs.propertyAnalysisOverrides || {}) as Record<string, any>;
            const next = { ...prev, [propertyKey]: overrides };
            await updateUserProfile({ preferences: { ...currentPrefs, propertyAnalysisOverrides: next } as any });
          }
        } catch (e) {
          console.warn('Failed to sync property analysis overrides to profile:', e);
        }
      }, 800) as unknown as number;
    } catch {}
    return () => { if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current); };
  }, [overrides, propertyKey, userProfile, isGuestMode, updateUserProfile]);

  // Load raw API data from localStorage if available
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem('handoff-attom-property');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setRawApiData(parsed);
      }
    } catch (error) {
      console.error('Error loading cached Attom data:', error);
    }
  }, [property]);

  const handleRefreshData = async () => {
    if (address) {
      const result = await searchByAddress(address);
      if (result && result.property && result.property.length > 0) {
        setRawApiData(result);
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatValue = (value: any, formatter?: (value: any) => string): string => {
    if (value === null || value === undefined) return 'Not Available';
    if (formatter) return formatter(value);
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None';
    return String(value);
  };

  const generatePropertySections = (prop: AttomProperty): FieldSection[] => {
    return [
      {
        title: 'Property Overview',
        icon: <Home className="w-5 h-5" />,
        fields: [
          { label: 'Property Type', value: prop.property_details?.property_type, important: true },
          { label: 'Property Use Code', value: prop.property_details?.property_use_code },
          { label: 'Bedrooms', value: prop.property_details?.bedrooms, important: true },
          { label: 'Bathrooms', value: prop.property_details?.bathrooms, important: true },
          { label: 'Full Bathrooms', value: prop.property_details?.full_bathrooms },
          { label: 'Half Bathrooms', value: prop.property_details?.half_bathrooms },
          { label: 'Total Rooms', value: prop.property_details?.total_rooms },
          { label: 'Square Feet', value: prop.property_details?.square_feet, format: formatSquareFeet, important: true },
          { label: 'Living Square Feet', value: prop.property_details?.square_feet_living, format: formatSquareFeet },
          { label: 'Year Built', value: prop.property_details?.year_built, important: true },
          { label: 'Effective Year Built', value: prop.property_details?.effective_year_built },
          { label: 'Stories', value: prop.property_details?.stories },
          { label: 'Units Count', value: prop.property_details?.units_count },
        ]
      },
      {
        title: 'Property Valuation',
        icon: <DollarSign className="w-5 h-5" />,
        fields: [
          { label: 'Estimated Value (AVM)', value: prop.valuation?.estimated_value, format: formatCurrency, important: true },
          { label: 'Value Range Low', value: prop.valuation?.value_range_low, format: formatCurrency },
          { label: 'Value Range High', value: prop.valuation?.value_range_high, format: formatCurrency },
          { label: 'Price Per Sq Ft', value: prop.valuation?.price_per_sqft, format: (v) => v ? `$${v.toFixed(2)}` : 'N/A', important: true },
          { label: 'Confidence Score', value: prop.valuation?.confidence_score, format: formatConfidenceScore },
          { label: 'Last Sale Price', value: prop.valuation?.last_sale_price, format: formatCurrency, important: true },
          { label: 'Last Sale Date', value: prop.valuation?.last_sale_date },
          { label: 'Market Value', value: prop.valuation?.market_value, format: formatCurrency },
          { label: 'Assessed Value', value: prop.valuation?.assessed_value, format: formatCurrency },
          { label: 'Assessed Year', value: prop.valuation?.assessed_year },
          { label: 'Market Improvement %', value: prop.valuation?.market_improvement_percent, format: (v) => v ? `${v.toFixed(2)}%` : 'N/A' },
        ]
      },
      {
        title: 'Tax Assessment',
        icon: <Calculator className="w-5 h-5" />,
        fields: [
          { label: 'Annual Tax Amount', value: prop.tax_assessment?.annual_tax_amount, format: formatCurrency, important: true },
          { label: 'Total Assessed Value', value: prop.tax_assessment?.total_assessed_value, format: formatCurrency, important: true },
          { label: 'Land Assessed Value', value: prop.tax_assessment?.land_assessed_value, format: formatCurrency },
          { label: 'Improvement Assessed Value', value: prop.tax_assessment?.improvement_assessed_value, format: formatCurrency },
          { label: 'Assessment Year', value: prop.tax_assessment?.assessment_year, important: true },
          { label: 'Tax Year', value: prop.tax_assessment?.tax_year },
          { label: 'Tax Rate per $1000', value: prop.tax_assessment?.tax_rate_per_1000, format: (v) => v ? `$${v.toFixed(2)}` : 'N/A' },
          { label: 'Tax Exemptions', value: prop.tax_assessment?.exemptions?.map(e => `${e.type}: ${formatCurrency(e.amount)}`), format: (v) => Array.isArray(v) ? v.join('; ') : 'None' },
        ]
      },
      {
        title: 'Lot & Land Information',
        icon: <TreePine className="w-5 h-5" />,
        fields: [
          { label: 'Lot Size (Sq Ft)', value: prop.property_details?.lot_size_sqft, format: formatSquareFeet, important: true },
          { label: 'Lot Size (Acres)', value: prop.property_details?.lot_size_acres, format: (v) => v ? `${v.toFixed(2)} acres` : 'N/A' },
          { label: 'Zoning', value: prop.property_details?.zoning, important: true },
          { label: 'Pool', value: prop.property_details?.pool },
          { label: 'Subdivision', value: prop.neighborhood?.subdivision },
        ]
      },
      {
        title: 'Building Features',
        icon: <Building className="w-5 h-5" />,
        fields: [
          { label: 'Architectural Style', value: prop.property_details?.architectural_style },
          { label: 'Construction Type', value: prop.property_details?.construction_type },
          { label: 'Condition', value: prop.property_details?.condition },
          { label: 'Quality', value: prop.property_details?.quality },
          { label: 'Roof Type', value: prop.property_details?.roof_type },
          { label: 'Roof Material', value: prop.property_details?.roof_material },
          { label: 'Exterior Material', value: prop.property_details?.exterior_material },
          { label: 'Foundation Type', value: prop.property_details?.foundation_type },
          { label: 'Fireplace', value: prop.property_details?.fireplace },
          { label: 'Fireplace Count', value: prop.property_details?.fireplace_count },
          { label: 'Central Air', value: prop.property_details?.central_air },
          { label: 'Basement', value: prop.property_details?.basement },
          { label: 'Attic', value: prop.property_details?.attic },
          { label: 'Heating Type', value: prop.property_details?.heating_type },
          { label: 'Cooling Type', value: prop.property_details?.cooling_type },
        ]
      },
      {
        title: 'Parking & Transportation',
        icon: <Car className="w-5 h-5" />,
        fields: [
          { label: 'Garage Spaces', value: prop.property_details?.garage_spaces },
          { label: 'Parking Spaces', value: prop.property_details?.parking_spaces },
        ]
      },
      {
        title: 'Neighborhood & Location',
        icon: <MapPin className="w-5 h-5" />,
        fields: [
          { label: 'Neighborhood Name', value: prop.neighborhood?.name },
          { label: 'County', value: prop.neighborhood?.county },
          { label: 'Census Tract', value: prop.neighborhood?.census_tract },
          { label: 'School District', value: prop.neighborhood?.school_district },
          { label: 'Coordinates', value: prop.address?.coordinates ? `${prop.address.coordinates.latitude}, ${prop.address.coordinates.longitude}` : null },
        ]
      },
      {
        title: 'Homeowners Association (HOA) & Community',
        icon: <Users className="w-5 h-5" />,
        fields: [
          { label: 'Has Homeowners Association (HOA)', value: prop.neighborhood?.hoa_info?.has_hoa },
          { label: 'Monthly Homeowners Association (HOA) Fee', value: prop.neighborhood?.hoa_info?.monthly_fee, format: formatCurrency },
          { label: 'Annual Homeowners Association (HOA) Fee', value: prop.neighborhood?.hoa_info?.annual_fee, format: formatCurrency },
        ]
      },
      {
        title: 'Utilities & Services',
        icon: <Zap className="w-5 h-5" />,
        fields: [
          { label: 'Sewer Type', value: prop.utilities?.sewer_type },
          { label: 'Water Source', value: prop.utilities?.water_source },
          { label: 'Electric Provider', value: prop.utilities?.electric_provider },
          { label: 'Gas Provider', value: prop.utilities?.gas_provider },
          { label: 'Internet Providers', value: prop.utilities?.internet_providers },
        ]
      },
      {
        title: 'Risk Factors',
        icon: <Shield className="w-5 h-5" />,
        fields: [
          { label: 'Flood Zone', value: prop.risk_factors?.flood_zone },
          { label: 'Flood Risk Score', value: prop.risk_factors?.flood_risk_score },
          { label: 'Earthquake Risk', value: prop.risk_factors?.earthquake_risk },
          { label: 'Fire Risk', value: prop.risk_factors?.fire_risk },
          { label: 'Environmental Hazards', value: prop.risk_factors?.environmental_hazards },
          { label: 'Crime Score', value: prop.risk_factors?.crime_score },
          { label: 'Walkability Score', value: prop.risk_factors?.walkability_score },
          { label: 'School Score', value: prop.risk_factors?.school_score },
        ]
      },
      {
        title: 'Ownership & Transfer',
        icon: <Gavel className="w-5 h-5" />,
        fields: [
          { label: 'Deed Date', value: prop.ownership?.deed_date },
          { label: 'Transfer Amount', value: prop.ownership?.transfer_amount, format: formatCurrency },
          { label: 'Deed Type', value: prop.ownership?.deed_type },
        ]
      },
      {
        title: 'Market Data',
        icon: <TrendingUp className="w-5 h-5" />,
        fields: [
          { label: 'List Price', value: prop.market_data?.list_price, format: formatCurrency },
          { label: 'Price History Count', value: prop.market_data?.price_history?.length },
          { label: 'Comparable Sales Count', value: prop.market_data?.comparable_sales?.length },
        ]
      },
      {
        title: 'Data Quality & Sources',
        icon: <Info className="w-5 h-5" />,
        fields: [
          { label: 'Attom ID', value: prop.attom_id },
          { label: 'Data Source', value: prop.data_source },
          { label: 'Last Updated', value: prop.last_updated },
          { label: 'Data Freshness Score', value: prop.data_freshness_score, format: (v) => v ? `${v}%` : 'N/A' },
        ]
      },
    ];
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading comprehensive property analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full border-destructive", className)}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-medium">Error Loading Property Data</h3>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
          {address && (
            <Button 
              variant="outline" 
              onClick={handleRefreshData} 
              className="mt-4"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!property && !address) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <Home className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="font-medium">No Property Data Available</h3>
            <p className="text-sm text-muted-foreground">
              Enter a property address to view comprehensive analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!property) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-medium">Property Not Found</h3>
              <p className="text-sm text-muted-foreground">
                No property data available for {address}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefreshData} 
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Search Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sections = generatePropertySections(property);
  const completedSections = sections.filter(section => 
    section.fields.some(field => field.value !== null && field.value !== undefined)
  ).length;

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Comprehensive Property Analysis</CardTitle>
              <CardDescription className="mt-1">
                Complete data from Attom API • {completedSections} of {sections.length} sections with data
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={editMode ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setEditMode(v => !v)}
              >
                {editMode ? 'Done' : 'Edit'}
              </Button>
              <Badge variant="secondary">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshData}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                {!isMobile && <span className="ml-2">Refresh</span>}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Property Address */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-medium">{property.address?.formatted || address}</h3>
              <p className="text-sm text-muted-foreground">
                {property.address?.city}, {property.address?.state} {property.address?.zip_code}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {formatValue(property.valuation?.estimated_value, formatCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Estimated Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Home className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">
              {formatValue(property.property_details?.bedrooms)} / {formatValue(property.property_details?.bathrooms)}
            </div>
            <p className="text-xs text-muted-foreground">Bed / Bath</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Ruler className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {formatValue(property.property_details?.square_feet, (v) => v ? v.toLocaleString() : 'N/A')}
            </div>
            <p className="text-xs text-muted-foreground">Square Feet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calculator className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">
              {formatValue(property.tax_assessment?.annual_tax_amount, formatCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Annual Taxes</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Fields</TabsTrigger>
          <TabsTrigger value="raw">Raw API Data</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {sections.map((section) => {
            const hasData = section.fields.some(field => 
              field.value !== null && field.value !== undefined && field.value !== ''
            );
            const isExpanded = expandedSections.has(section.title.toLowerCase().replace(/\s+/g, '-'));

            return (
              <Card key={section.title} className={!hasData ? 'opacity-50' : ''}>
                <CardHeader 
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => toggleSection(section.title.toLowerCase().replace(/\s+/g, '-'))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {section.icon}
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>
                          {section.fields.filter(f => f.value !== null && f.value !== undefined && f.value !== '').length} of {section.fields.length} fields populated
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasData && <Badge variant="secondary">Data Available</Badge>}
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field) => (
                        <div 
                          key={field.label} 
                          className={cn(
                            "space-y-1 p-3 rounded-lg border",
                            field.important && field.value !== null && field.value !== undefined 
                              ? "bg-primary/5 border-primary/20" 
                              : "bg-muted/30"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">
                              {field.label}
                              {field.important && (
                                <Badge variant="outline" className="ml-2 text-xs">Key</Badge>
                              )}
                            </label>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const k = fieldKey(section.title, field.label);
                              const ov = overrides[k];
                              const hasOverride = !!(ov && ov.value && ov.value.trim() !== '');
                              const val = hasOverride ? ov!.value! : formatValue(field.value, field.format);
                              return (
                                <span>
                                  {val}
                                  {hasOverride && (
                                    <Badge variant="outline" className="ml-2 text-[10px]">Overridden</Badge>
                                  )}
                                </span>
                              );
                            })()}
                          </div>
                          {editMode && (
                            <div className="mt-2 space-y-2">
                              <Input
                                placeholder="Override value (optional)"
                                value={(() => { const ov = overrides[fieldKey(section.title, field.label)]; return ov?.value ?? ''; })()}
                                onChange={(e) => {
                                  const k = fieldKey(section.title, field.label);
                                  const next = { ...(overrides[k] || {}), value: e.target.value } as FieldOverride;
                                  setOverrides(prev => ({ ...prev, [k]: next }));
                                }}
                              />
                              <Textarea
                                rows={2}
                                placeholder="Notes (optional)"
                                value={(() => { const ov = overrides[fieldKey(section.title, field.label)]; return ov?.note ?? ''; })()}
                                onChange={(e) => {
                                  const k = fieldKey(section.title, field.label);
                                  const next = { ...(overrides[k] || {}), note: e.target.value } as FieldOverride;
                                  setOverrides(prev => ({ ...prev, [k]: next }));
                                }}
                              />
                              {(() => { const ov = overrides[fieldKey(section.title, field.label)]; return (ov && (ov.value || ov.note)) ? (
                                <Button size="sm" variant="outline" onClick={() => {
                                  const k = fieldKey(section.title, field.label);
                                  setOverrides(prev => { const n = { ...prev }; delete n[k]; return n; });
                                }}>Reset</Button>
                              ) : null; })()}
                            </div>
                          )}
                          {field.description && (
                            <p className="text-xs text-muted-foreground italic">
                              {field.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="raw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Raw Attom API Response</span>
              </CardTitle>
              <CardDescription>
                Complete unprocessed data from the Attom API with debug=True parameter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-xs whitespace-pre-wrap">
                  {rawApiData ? JSON.stringify(rawApiData, null, 2) : 'No raw API data available'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}