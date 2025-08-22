import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Home, MapPin, Building } from 'lucide-react';
import { PropertyBasicProfileData } from '../../types/propertyBasicProfile';
import { formatPropertyType } from '../../utils/propertyHelpers';

interface PropertyInfoSectionProps {
  propertyData: PropertyBasicProfileData;
  mappedData?: any;
}

export function PropertyInfoSection({ propertyData, mappedData }: PropertyInfoSectionProps) {
  // FIXED: Improved helper function to get mapped value or fallback to original
  const getMappedValue = (targetField: string, fallback: any) => {
    // First check if we have mapped data for this specific field
    if (mappedData && targetField) {
      const keys = targetField.split('.');
      let value = mappedData;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          // If mapped data doesn't have this field, break and use fallback
          break;
        }
      }
      // Return mapped value if it exists and is not null/undefined/empty
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    
    // Return fallback if no mapped data or mapped data is empty
    return fallback;
  };

  // FIXED: Helper to safely access expanded profile data
  const getExpandedValue = (path: string) => {
    if (!propertyData) return null;
    
    const keys = path.split('.');
    let value = propertyData;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  };

  // FIXED: Get the best available value with proper precedence
  const getBestValue = (mappedField: string, ...fallbackPaths: string[]) => {
    // Try mapped data first
    const mappedValue = getMappedValue(mappedField, null);
    if (mappedValue !== null && mappedValue !== undefined && mappedValue !== '') {
      return mappedValue;
    }
    
    // Try fallback paths in order
    for (const path of fallbackPaths) {
      const value = getExpandedValue(path);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
    
    return 'Not available';
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          Property Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address Information */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Property Address
              </h4>
              <p className="text-lg font-medium">
                {getBestValue('property.address.street', 'address.oneLine', 'address.line1')}
              </p>
              <div className="text-sm text-muted-foreground mt-1">
                <p>Street: {getBestValue('property.address.street', 'address.line1')}</p>
                <p>City: {getBestValue('property.address.city', 'address.locality')}</p>
                <p>State: {getBestValue('property.address.state', 'address.countrySubd')}</p>
                <p>ZIP: {getBestValue('property.address.zipCode', 'address.postal1')}</p>
                {getExpandedValue('address.postal2') && (
                  <p>ZIP+4: {getExpandedValue('address.postal2')}</p>
                )}
              </div>
            </div>

            {/* FIXED: Better coordinate display */}
            {(getExpandedValue('location.latitude') || getExpandedValue('location.longitude')) && (
              <div>
                <h4 className="font-medium mb-2">Coordinates</h4>
                <p className="text-sm">
                  Lat: {getBestValue('property.location.latitude', 'location.latitude')}, 
                  Lng: {getBestValue('property.location.longitude', 'location.longitude')}
                </p>
                {getExpandedValue('location.accuracy') && (
                  <p className="text-xs text-muted-foreground">
                    Accuracy: {getExpandedValue('location.accuracy')}
                  </p>
                )}
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
                  <span>{getBestValue('property.basic.propertyType', 'summary.proptype', 'building.summary.propertyType')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Class:</span>
                  <span>{getBestValue('property.basic.propertyClass', 'summary.propclass', 'building.summary.propClass')}</span>
                </div>
                {(getExpandedValue('summary.propsubtype') || getExpandedValue('building.summary.propSubType')) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtype:</span>
                    <span>{formatPropertyType(getBestValue('property.basic.propertySubType', 'summary.propsubtype', 'building.summary.propSubType'))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year Built:</span>
                  <span>{getBestValue('property.basic.yearBuilt', 'summary.yearbuilt', 'building.summary.yearBuilt')}</span>
                </div>
                {(getExpandedValue('summary.propLandUse') || getExpandedValue('building.summary.propLandUse')) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Land Use:</span>
                    <span>{getBestValue('property.basic.landUse', 'summary.propLandUse', 'building.summary.propLandUse')}</span>
                  </div>
                )}
                {/* FIXED: Add more expanded profile fields */}
                {(getExpandedValue('building.summary.levels') || getExpandedValue('summary.levels')) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stories:</span>
                    <span>{getBestValue('property.basic.stories', 'building.summary.levels', 'summary.levels')}</span>
                  </div>
                )}
                {(getExpandedValue('building.summary.units') || getExpandedValue('summary.units')) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units:</span>
                    <span>{getBestValue('property.basic.units', 'building.summary.units', 'summary.units')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* FIXED: Enhanced location info with more fields */}
            {getExpandedValue('lot') && (
              <div>
                <h4 className="font-medium mb-2">Location Info</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">County:</span>
                    <span>{getBestValue('property.location.county', 'lot.situsCounty', 'address.countrySubd')}</span>
                  </div>
                  {getExpandedValue('lot.subdname') && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subdivision:</span>
                      <span>{getBestValue('property.location.subdivision', 'lot.subdname')}</span>
                    </div>
                  )}
                  {(getExpandedValue('area.schoolDistrict') || getExpandedValue('school.districtname')) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">School District:</span>
                      <span>{getBestValue('property.location.schoolDistrict', 'area.schoolDistrict', 'school.districtname')}</span>
                    </div>
                  )}
                  {/* FIXED: Add more expanded location fields */}
                  {getExpandedValue('area.zoning') && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zoning:</span>
                      <span>{getBestValue('property.location.zoning', 'area.zoning')}</span>
                    </div>
                  )}
                  {getExpandedValue('area.munname') && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Municipality:</span>
                      <span>{getBestValue('property.location.municipality', 'area.munname')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}