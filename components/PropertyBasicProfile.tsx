import React, { useState, useCallback, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useIsMobile } from './ui/use-mobile';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  Building, 
  Ruler,
  Bed,
  Bath,
  Car,
  Zap,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Property Basic Profile types based on Attom API documentation
interface PropertyBasicProfileData {
  identifier?: {
    id: string;
    fips?: string;
    apn?: string;
  };
  address?: {
    country: string;
    countrySubd: string;
    line1: string;
    line2?: string;
    locality: string;
    matchCode?: string;
    oneLine: string;
    postal1: string;
    postal2?: string;
    postal3?: string;
  };
  location?: {
    accuracy: string;
    elevation?: number;
    latitude: string;
    longitude: string;
    distance?: number;
  };
  summary?: {
    absenteeInd?: string;
    propclass: string;
    propsubtype?: string;
    proptype: string;
    yearbuilt?: number;
    propLandUse?: string;
    propIndicator?: string;
    legal1?: string;
  };
  lot?: {
    lotNum?: string;
    lotsize1?: number;
    lotsize2?: number;
    pooltype?: string;
    situsCounty: string;
    subdname?: string;
    subdtractnum?: string;
  };
  area?: {
    absenteeInd?: string;
    areaLot?: number;
    areaSqFt?: number;
    bathrooms?: number;
    bathroomsFull?: number;
    bathroomsPartial?: number;
    bedrooms?: number;
    roomsTotal?: number;
  };
  building?: {
    construction?: {
      condition?: string;
      constructionType?: string;
      exteriorWalls?: string;
      foundationMaterial?: string;
      quality?: string;
      roofCover?: string;
      roofFrame?: string;
      style?: string;
    };
    interior?: {
      fplctype?: string;
      fuel?: string;
      heating?: string;
    };
    parking?: {
      garagetype?: string;
      prkgSize?: number;
      prkgType?: string;
    };
    size?: {
      grossSizeAdjusted?: number;
      grossSizeGeneral?: number;
      livingSize?: number;
      sizeInd?: string;
      universalSize?: number;
    };
    summary?: {
      archStyle?: string;
      levels?: number;
      noOfBaths?: number;
      noOfPartialBaths?: number;
      noOfBeds?: number;
      noOfRooms?: number;
      proptype?: string;
      story?: number;
      unitsCount?: number;
      yearBuilt?: number;
      yearBuiltEffective?: number;
    };
  };
  assessment?: {
    appraised?: {
      apprisedTtl?: number;
      apprisedVal?: number;
      assdTtl?: number;
      assdVal?: number;
      mktTtl?: number;
      mktVal?: number;
      taxYear?: number;
    };
    assessor?: {
      apn?: string;
      assdValue?: number;
      mktValue?: number;
      taxYear?: number;
    };
    market?: {
      apprCurr?: number;
      apprPrev?: number;
      apprYear?: number;
      taxYear?: number;
    };
    tax?: {
      exemptflag?: string;
      exemptions?: Array<{
        exemptType: string;
        exemptAmt: number;
      }>;
      taxAmt?: number;
      taxPerSizeUnit?: number;
      taxRate?: number;
      taxYear?: number;
    };
  };
  sale?: {
    amount?: {
      saleAmt?: number;
      saleAmtCurr?: number;
    };
    calculation?: {
      pricePerSizeUnit?: number;
      saleAmtCurr?: number;
    };
    salesHistory?: Array<{
      amount: {
        saleAmt: number;
        saleAmtRounded: number;
      };
      calculation?: {
        pricePerSizeUnit?: number;
      };
      salesSearchDate: string;
      saleTransDate: string;
    }>;
    transaction?: {
      contractDate?: string;
      saleRecDate?: string;
      saleSearchDate?: string;
      saleTransDate?: string;
    };
  };
  owner?: {
    corporateIndicator?: string;
    lastName?: string;
    firstName?: string;
    middleName?: string;
    owner1Full?: string;
    owner2Full?: string;
    owner3Full?: string;
    owner4Full?: string;
    mailingAddress?: {
      country?: string;
      countrySubd?: string;
      line1?: string;
      line2?: string;
      locality?: string;
      oneLine?: string;
      postal1?: string;
      postal2?: string;
    };
  };
  vintage?: {
    lastModified: string;
    pubDate: string;
  };
}

interface PropertyBasicProfileResponse {
  status: {
    version: string;
    code: number;
    msg: string;
    total: number;
    page: number;
    pagesize: number;
  };
  property?: PropertyBasicProfileData[];
}

interface PropertyBasicProfileProps {
  defaultAttomId?: string;
  onPropertyFound?: (property: PropertyBasicProfileData) => void;
  className?: string;
}

export function PropertyBasicProfile({ 
  defaultAttomId, 
  onPropertyFound, 
  className = '' 
}: PropertyBasicProfileProps) {
  const isMobile = useIsMobile();
  const [attomId, setAttomId] = useState(defaultAttomId || '184713191');
  const [propertyData, setPropertyData] = useState<PropertyBasicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchId, setLastSearchId] = useState<string>('');

  // Format currency values
  const formatCurrency = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  // Format square footage
  const formatSquareFeet = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value) + ' sq ft';
  }, []);

  // Format lot size
  const formatLotSize = useCallback((sqft?: number, acres?: number): string => {
    if (acres && acres >= 1) {
      return `${acres.toFixed(2)} acres`;
    } else if (sqft) {
      return formatSquareFeet(sqft);
    }
    return 'N/A';
  }, [formatSquareFeet]);

  // Format date
  const formatDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  // Format property type
  const formatPropertyType = useCallback((type: string | undefined): string => {
    if (!type) return 'N/A';
    return type.replace(/([A-Z])/g, ' $1').trim();
  }, []);

  // Get primary owner name
  const getPrimaryOwnerName = useCallback((owner?: PropertyBasicProfileData['owner']): string => {
    if (!owner) return 'N/A';
    
    if (owner.owner1Full) return owner.owner1Full;
    
    const firstName = owner.firstName || '';
    const lastName = owner.lastName || '';
    const middleName = owner.middleName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${middleName} ${lastName}`.trim();
    }
    
    return 'N/A';
  }, []);

  // Get mailing address
  const getMailingAddress = useCallback((mailingAddress?: PropertyBasicProfileData['owner']['mailingAddress']): string => {
    if (!mailingAddress) return 'N/A';
    return mailingAddress.oneLine || 
           `${mailingAddress.line1 || ''} ${mailingAddress.line2 || ''}, ${mailingAddress.locality || ''}, ${mailingAddress.countrySubd || ''} ${mailingAddress.postal1 || ''}`.trim();
  }, []);

  // Search for property by Attom ID
  const searchProperty = useCallback(async (searchAttomId: string) => {
    if (!searchAttomId.trim()) {
      setError('Please enter an Attom ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPropertyData(null);
    setLastSearchId(searchAttomId);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/property-basic-profile`;
      
      console.log('Fetching property basic profile for Attom ID:', searchAttomId);

      const response = await fetch(`${url}?attomid=${encodeURIComponent(searchAttomId)}&debug=True`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        // Handle specific error cases with user-friendly messages
        if (response.status === 401) {
          throw new Error('ATTOM API authentication failed. Please check your API key configuration.');
        } else if (response.status === 403) {
          throw new Error('ATTOM API access forbidden. Please verify your API key has the required permissions.');
        } else if (response.status === 429) {
          throw new Error('ATTOM API rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 500 && errorData.error?.includes('ATTOM API key not configured')) {
          throw new Error('ATTOM API key is not configured. Please set up your API key in the settings.');
        } else {
          throw new Error(`API request failed: ${response.status} - ${errorData.error || errorText}`);
        }
      }

      const data: PropertyBasicProfileResponse = await response.json();

      console.log('Property basic profile response:', data);

      if (data.status?.code === 0 && data.property && data.property.length > 0) {
        const property = data.property[0];
        setPropertyData(property);
        onPropertyFound?.(property);

        // Cache the result
        localStorage.setItem('handoff-property-basic-profile', JSON.stringify({
          attomId: searchAttomId,
          property,
          timestamp: new Date().toISOString()
        }));
      } else if (data.status?.msg === 'SuccessWithoutResult' || (data.property && data.property.length === 0)) {
        setError('No property found with the specified Attom ID. Please verify the ID and try again.');
      } else {
        throw new Error(data.status?.msg || 'Unknown API error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error fetching property basic profile:', err);
      setError(`Failed to fetch property data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [onPropertyFound]);

  // Load cached data on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('handoff-property-basic-profile');
      if (cached) {
        const { attomId: cachedId, property, timestamp } = JSON.parse(cached);
        
        // Use cached data if it's for the current Attom ID and less than 1 hour old
        const cacheAge = Date.now() - new Date(timestamp).getTime();
        const oneHour = 60 * 60 * 1000;
        
        if (cachedId === attomId && cacheAge < oneHour) {
          setPropertyData(property);
          setLastSearchId(cachedId);
          console.log('Loaded cached property basic profile data');
        }
      }
    } catch (error) {
      console.warn('Failed to load cached property data:', error);
    }
  }, [attomId]);

  // Handle search button click
  const handleSearch = useCallback(() => {
    searchProperty(attomId);
  }, [attomId, searchProperty]);

  // Handle enter key in input
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Error Display */}
      {error && (
        <Alert className="border-destructive bg-destructive/5">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="modern-card">
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              Fetching property data from Attom API...
            </p>
          </div>
        </Card>
      )}

      {/* Property Data Display */}
      {propertyData && !isLoading && (
        <div className="space-y-6">
          {/* Property Overview */}
          <Card className="modern-card">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Property Overview</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  ID: {lastSearchId}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Property Address
                    </h4>
                    <p className="text-lg font-medium">
                      {propertyData.address?.oneLine || 'Address not available'}
                    </p>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Street: {propertyData.address?.line1 || 'N/A'}</p>
                      <p>City: {propertyData.address?.locality || 'N/A'}</p>
                      <p>State: {propertyData.address?.countrySubd || 'N/A'}</p>
                      <p>ZIP: {propertyData.address?.postal1 || 'N/A'}</p>
                      {propertyData.address?.postal2 && (
                        <p>ZIP+4: {propertyData.address.postal2}</p>
                      )}
                    </div>
                  </div>

                  {propertyData.location && (
                    <div>
                      <h4 className="font-medium mb-2">Coordinates</h4>
                      <p className="text-sm">
                        Lat: {propertyData.location.latitude}, Lng: {propertyData.location.longitude}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Accuracy: {propertyData.location.accuracy}
                      </p>
                    </div>
                  )}
                </div>

                {/* Basic Property Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Property Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type:</span>
                        <span>{formatPropertyType(propertyData.summary?.proptype)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Class:</span>
                        <span>{propertyData.summary?.propclass || 'N/A'}</span>
                      </div>
                      {propertyData.summary?.propsubtype && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtype:</span>
                          <span>{formatPropertyType(propertyData.summary.propsubtype)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year Built:</span>
                        <span>{propertyData.summary?.yearbuilt || propertyData.building?.summary?.yearBuilt || 'N/A'}</span>
                      </div>
                      {propertyData.summary?.propLandUse && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Land Use:</span>
                          <span>{propertyData.summary.propLandUse}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {propertyData.lot && (
                    <div>
                      <h4 className="font-medium mb-2">Location Info</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">County:</span>
                          <span>{propertyData.lot.situsCounty || 'N/A'}</span>
                        </div>
                        {propertyData.lot.subdname && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subdivision:</span>
                            <span>{propertyData.lot.subdname}</span>
                          </div>
                        )}
                        {propertyData.lot.lotNum && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lot Number:</span>
                            <span>{propertyData.lot.lotNum}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Property Characteristics */}
          {(propertyData.area || propertyData.building) && (
            <Card className="modern-card">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ruler className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Property Characteristics</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Bedrooms */}
                  <div className="text-center">
                    <Bed className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-2xl font-semibold">
                      {propertyData.area?.bedrooms || propertyData.building?.summary?.noOfBeds || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </div>

                  {/* Bathrooms */}
                  <div className="text-center">
                    <Bath className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-2xl font-semibold">
                      {propertyData.area?.bathrooms || propertyData.building?.summary?.noOfBaths || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                    {(propertyData.area?.bathroomsFull || propertyData.area?.bathroomsPartial) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {propertyData.area.bathroomsFull && `${propertyData.area.bathroomsFull} Full`}
                        {propertyData.area.bathroomsFull && propertyData.area.bathroomsPartial && ', '}
                        {propertyData.area.bathroomsPartial && `${propertyData.area.bathroomsPartial} Half`}
                      </div>
                    )}
                  </div>

                  {/* Square Feet */}
                  <div className="text-center">
                    <Home className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-2xl font-semibold">
                      {propertyData.area?.areaSqFt || 
                       propertyData.building?.size?.universalSize || 
                       propertyData.building?.size?.grossSizeGeneral || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Sq Ft</div>
                    {propertyData.building?.size?.livingSize && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatSquareFeet(propertyData.building.size.livingSize)} Living
                      </div>
                    )}
                  </div>

                  {/* Parking */}
                  <div className="text-center">
                    <Car className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-2xl font-semibold">
                      {propertyData.building?.parking?.prkgSize || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Parking Spaces</div>
                    {propertyData.building?.parking?.garagetype && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {propertyData.building.parking.garagetype}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Property Features */}
                {propertyData.building && (
                  <Separator className="my-6" />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Construction Details */}
                  {propertyData.building?.construction && (
                    <div>
                      <h4 className="font-medium mb-3">Construction Details</h4>
                      <div className="space-y-2 text-sm">
                        {propertyData.building.construction.style && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Style:</span>
                            <span>{propertyData.building.construction.style}</span>
                          </div>
                        )}
                        {propertyData.building.construction.condition && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Condition:</span>
                            <span>{propertyData.building.construction.condition}</span>
                          </div>
                        )}
                        {propertyData.building.construction.quality && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quality:</span>
                            <span>{propertyData.building.construction.quality}</span>
                          </div>
                        )}
                        {propertyData.building.construction.exteriorWalls && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exterior:</span>
                            <span>{propertyData.building.construction.exteriorWalls}</span>
                          </div>
                        )}
                        {propertyData.building.construction.roofCover && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Roof:</span>
                            <span>{propertyData.building.construction.roofCover}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lot Information */}
                  {propertyData.lot && (
                    <div>
                      <h4 className="font-medium mb-3">Lot Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lot Size:</span>
                          <span>{formatLotSize(propertyData.lot.lotsize1, propertyData.lot.lotsize2)}</span>
                        </div>
                        {propertyData.lot.pooltype && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pool:</span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              {propertyData.lot.pooltype}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Current Owner Information */}
          {propertyData.owner && (
            <Card className="modern-card">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Current Owner Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Owner */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Owner Name</h4>
                      <p className="text-lg">{getPrimaryOwnerName(propertyData.owner)}</p>
                      
                      {/* Additional owners */}
                      {propertyData.owner.owner2Full && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Co-Owner: {propertyData.owner.owner2Full}
                        </p>
                      )}
                      {propertyData.owner.owner3Full && (
                        <p className="text-sm text-muted-foreground">
                          Co-Owner: {propertyData.owner.owner3Full}
                        </p>
                      )}
                      {propertyData.owner.owner4Full && (
                        <p className="text-sm text-muted-foreground">
                          Co-Owner: {propertyData.owner.owner4Full}
                        </p>
                      )}
                    </div>

                    {propertyData.owner.corporateIndicator && (
                      <div>
                        <h4 className="font-medium mb-2">Ownership Type</h4>
                        <Badge variant="outline">
                          {propertyData.owner.corporateIndicator === 'Y' ? 'Corporate' : 'Individual'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Mailing Address */}
                  {propertyData.owner.mailingAddress && (
                    <div>
                      <h4 className="font-medium mb-2">Mailing Address</h4>
                      <p className="text-sm">{getMailingAddress(propertyData.owner.mailingAddress)}</p>
                      
                      {/* Check if mailing address is different from property address */}
                      {propertyData.owner.mailingAddress.oneLine !== propertyData.address?.oneLine && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <Info className="w-3 h-3 inline mr-1" />
                          Mailing address differs from property address (Absentee Owner)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Assessment and Sale Information */}
          {(propertyData.assessment || propertyData.sale) && (
            <Card className="modern-card">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Assessment & Sale Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assessment Information */}
                  {propertyData.assessment && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Tax Assessment</h4>
                      <div className="space-y-2 text-sm">
                        {propertyData.assessment.assessor?.assdValue && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assessed Value:</span>
                            <span className="font-medium">{formatCurrency(propertyData.assessment.assessor.assdValue)}</span>
                          </div>
                        )}
                        {propertyData.assessment.market?.apprCurr && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Market Value:</span>
                            <span className="font-medium">{formatCurrency(propertyData.assessment.market.apprCurr)}</span>
                          </div>
                        )}
                        {propertyData.assessment.tax?.taxAmt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annual Tax:</span>
                            <span className="font-medium">{formatCurrency(propertyData.assessment.tax.taxAmt)}</span>
                          </div>
                        )}
                        {propertyData.assessment.tax?.taxYear && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax Year:</span>
                            <span>{propertyData.assessment.tax.taxYear}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sale Information */}
                  {propertyData.sale && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Last Sale</h4>
                      <div className="space-y-2 text-sm">
                        {propertyData.sale.amount?.saleAmt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sale Price:</span>
                            <span className="font-medium">{formatCurrency(propertyData.sale.amount.saleAmt)}</span>
                          </div>
                        )}
                        {propertyData.sale.transaction?.saleTransDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sale Date:</span>
                            <span>{formatDate(propertyData.sale.transaction.saleTransDate)}</span>
                          </div>
                        )}
                        {propertyData.sale.calculation?.pricePerSizeUnit && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price/Sq Ft:</span>
                            <span>{formatCurrency(propertyData.sale.calculation.pricePerSizeUnit)}</span>
                          </div>
                        )}
                      </div>

                      {/* Sales History */}
                      {propertyData.sale.salesHistory && propertyData.sale.salesHistory.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2 text-sm">Sales History</h5>
                          <div className="space-y-2">
                            {propertyData.sale.salesHistory.slice(0, 3).map((sale, index) => (
                              <div key={index} className="text-xs border border-border rounded p-2">
                                <div className="flex justify-between">
                                  <span>{formatDate(sale.saleTransDate)}</span>
                                  <span className="font-medium">{formatCurrency(sale.amount.saleAmt)}</span>
                                </div>
                                {sale.calculation?.pricePerSizeUnit && (
                                  <div className="text-muted-foreground">
                                    {formatCurrency(sale.calculation.pricePerSizeUnit)}/sq ft
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Data Info */}
          <Card className="modern-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Data Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Attom ID:</span>
                  <p className="font-medium">{propertyData.identifier?.id || 'N/A'}</p>
                </div>
                {propertyData.identifier?.fips && (
                  <div>
                    <span className="text-muted-foreground">FIPS Code:</span>
                    <p className="font-medium">{propertyData.identifier.fips}</p>
                  </div>
                )}
                {propertyData.identifier?.apn && (
                  <div>
                    <span className="text-muted-foreground">APN:</span>
                    <p className="font-medium">{propertyData.identifier.apn}</p>
                  </div>
                )}
                {propertyData.vintage?.lastModified && (
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <p className="font-medium">{formatDate(propertyData.vintage.lastModified)}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Data Source:</span>
                  <p className="font-medium">Attom Data</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}


    </div>
  );
}