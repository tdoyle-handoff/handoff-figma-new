import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useIsMobile } from './ui/use-mobile';
import { 
  MapPin,
  AlertCircle,
  RefreshCw,
  Info,
  Database
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { PropertyBasicProfileData, PropertyBasicProfileResponse } from '../types/propertyBasicProfile';
import { parseAddressForAPI } from '../utils/propertyHelpers';
import { PROPERTY_API_CONSTANTS, API_ERROR_MESSAGES } from '../utils/propertyConstants';

// Import sub-components
import { PropertyInfoSection } from './PropertyOverview/PropertyInfoSection';
import { PropertyCharacteristicsSection } from './PropertyOverview/PropertyCharacteristicsSection';
import { PropertyValuationSection } from './PropertyOverview/PropertyValuationSection';
import { PropertyOwnerSection } from './PropertyOverview/PropertyOwnerSection';

interface PropertyOverviewWithAttomDataProps {
  propertyAddress?: string;
  onPropertyFound?: (property: PropertyBasicProfileData) => void;
  className?: string;
  customMappings?: Array<{
    id: string;
    sourceEndpoint: string;
    sourcePath: string;
    targetField: string;
    displayName: string;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
    isEnabled: boolean;
    transformFunction?: string;
  }>;
}

export function PropertyOverviewWithAttomData({ 
  propertyAddress, 
  onPropertyFound, 
  className = '',
  customMappings 
}: PropertyOverviewWithAttomDataProps) {
  const isMobile = useIsMobile();
  const [propertyData, setPropertyData] = useState<PropertyBasicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchAddress, setLastSearchAddress] = useState<string>('');
  const [mappedData, setMappedData] = useState<any>(null);

  // Search for property by address
  const searchPropertyByAddress = useCallback(async (address: string) => {
    if (!address.trim()) {
      setError(API_ERROR_MESSAGES.NO_ADDRESS);
      return;
    }

    const addressComponents = parseAddressForAPI(address);
    if (!addressComponents) {
      setError(API_ERROR_MESSAGES.INVALID_FORMAT);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPropertyData(null);
    setLastSearchAddress(address);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/property-basic-profile`;
      
      console.log('Fetching property basic profile for address:', address);

      // Build query parameters
      const params = new URLSearchParams({
        address1: addressComponents.address1,
        debug: PROPERTY_API_CONSTANTS.API_DEBUG_PARAM
      });
      
      if (addressComponents.address2) {
        params.append('address2', addressComponents.address2);
      }

      const response = await fetch(`${url}?${params.toString()}`, {
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
        localStorage.setItem(PROPERTY_API_CONSTANTS.CACHE_KEY, JSON.stringify({
          address,
          property,
          timestamp: new Date().toISOString()
        }));

        // Apply custom mappings if provided
        if (customMappings && customMappings.length > 0) {
          applyCustomMappings(address, customMappings);
        }
      } else if (data.status?.msg === 'SuccessWithoutResult' || (data.property && data.property.length === 0)) {
        setError(API_ERROR_MESSAGES.NO_PROPERTY_FOUND);
      } else {
        throw new Error(data.status?.msg || 'Unknown API error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error fetching property basic profile:', err);
      setError(`${API_ERROR_MESSAGES.FETCH_FAILED}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [onPropertyFound]);

  // Auto-fetch data when address changes
  useEffect(() => {
    if (propertyAddress && propertyAddress.trim() && propertyAddress !== lastSearchAddress) {
      // Check cache first
      try {
        const cached = localStorage.getItem(PROPERTY_API_CONSTANTS.CACHE_KEY);
        if (cached) {
          const { address: cachedAddress, property, timestamp } = JSON.parse(cached);
          
          // Use cached data if it's for the current address and less than cache duration old
          const cacheAge = Date.now() - new Date(timestamp).getTime();
          
          if (cachedAddress === propertyAddress && cacheAge < PROPERTY_API_CONSTANTS.CACHE_DURATION) {
            setPropertyData(property);
            setLastSearchAddress(propertyAddress);
            console.log('Loaded cached property basic profile data for address');
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load cached property data:', error);
      }

      // Fetch fresh data
      searchPropertyByAddress(propertyAddress);
    }
  }, [propertyAddress, lastSearchAddress, searchPropertyByAddress]);

  // Apply custom mappings when they change
  useEffect(() => {
    if (propertyAddress && customMappings && customMappings.length > 0) {
      applyCustomMappings(propertyAddress, customMappings);
    }
  }, [propertyAddress, customMappings, applyCustomMappings]);

  // Apply custom field mappings
  const applyCustomMappings = useCallback(async (address: string, mappings: any[]) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/property-field-mappings/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          address,
          mappings
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.mappedData) {
          setMappedData(data.mappedData);
          console.log('Applied custom field mappings:', data.mappedData);
        }
      }
    } catch (error) {
      console.warn('Failed to apply custom mappings:', error);
    }
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    if (propertyAddress) {
      searchPropertyByAddress(propertyAddress);
    }
  }, [propertyAddress, searchPropertyByAddress]);

  if (!propertyAddress) {
    return (
      <Card className={`modern-card ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Property Overview
            <Badge variant="secondary" className="text-xs">
              ATTOM Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {API_ERROR_MESSAGES.API_UNAVAILABLE}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>



      {/* Loading State */}
      {isLoading && (
        <Card className="modern-card">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              Fetching property data from ATTOM API...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Property Data Display */}
      {propertyData && !isLoading && (
        <div className="space-y-6">
          <PropertyInfoSection propertyData={propertyData} mappedData={mappedData} />
          <PropertyCharacteristicsSection propertyData={propertyData} mappedData={mappedData} />
          <PropertyValuationSection propertyData={propertyData} mappedData={mappedData} />
          <PropertyOwnerSection propertyData={propertyData} mappedData={mappedData} />
          
          {/* Show mapped data preview if available */}
          {mappedData && (
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Custom Field Mappings
                  <Badge variant="secondary" className="text-xs">
                    Applied
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(mappedData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}