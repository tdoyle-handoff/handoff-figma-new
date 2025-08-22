import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Ruler, Bed, Bath, Home, Car, CheckCircle, Building2, Thermometer } from 'lucide-react';
import { PropertyBasicProfileData } from '../../types/propertyBasicProfile';
import { formatSquareFeet, formatLotSize } from '../../utils/propertyHelpers';

interface PropertyCharacteristicsSectionProps {
  propertyData: PropertyBasicProfileData;
  mappedData?: any;
}

export function PropertyCharacteristicsSection({ propertyData, mappedData }: PropertyCharacteristicsSectionProps) {
  // FIXED: Improved helper function to get mapped value or fallback to original
  const getMappedValue = (targetField: string, fallback: any) => {
    if (mappedData && targetField) {
      const keys = targetField.split('.');
      let value = mappedData;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          break;
        }
      }
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
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
    const mappedValue = getMappedValue(mappedField, null);
    if (mappedValue !== null && mappedValue !== undefined && mappedValue !== '') {
      return mappedValue;
    }
    
    for (const path of fallbackPaths) {
      const value = getExpandedValue(path);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
    
    return 'N/A';
  };

  // Check if we have any data to display
  if (!getExpandedValue('area') && !getExpandedValue('building')) {
    return null;
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" />
          Property Characteristics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* FIXED: Better bedroom count with expanded profile data */}
          <div className="text-center">
            <Bed className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {getBestValue('property.characteristics.bedrooms', 
                'area.bedrooms', 
                'building.summary.noOfBeds', 
                'building.rooms.beds',
                'building.rooms.roomsTotal')}
            </div>
            <div className="text-sm text-muted-foreground">Bedrooms</div>
          </div>

          {/* FIXED: Better bathroom count with expanded profile data */}
          <div className="text-center">
            <Bath className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {getBestValue('property.characteristics.bathrooms', 
                'area.bathrooms', 
                'building.summary.noOfBaths',
                'building.rooms.baths',
                'building.rooms.bathsFull')}
            </div>
            <div className="text-sm text-muted-foreground">Bathrooms</div>
            {/* FIXED: Show full/partial bath breakdown from expanded data */}
            {(getExpandedValue('area.bathroomsFull') || getExpandedValue('building.rooms.bathsFull') || 
              getExpandedValue('area.bathroomsPartial') || getExpandedValue('building.rooms.bathsPartial')) && (
              <div className="text-xs text-muted-foreground mt-1">
                {(getExpandedValue('area.bathroomsFull') || getExpandedValue('building.rooms.bathsFull')) && 
                  `${getExpandedValue('area.bathroomsFull') || getExpandedValue('building.rooms.bathsFull')} Full`}
                {((getExpandedValue('area.bathroomsFull') || getExpandedValue('building.rooms.bathsFull')) && 
                  (getExpandedValue('area.bathroomsPartial') || getExpandedValue('building.rooms.bathsPartial'))) && ', '}
                {(getExpandedValue('area.bathroomsPartial') || getExpandedValue('building.rooms.bathsPartial')) && 
                  `${getExpandedValue('area.bathroomsPartial') || getExpandedValue('building.rooms.bathsPartial')} Half`}
              </div>
            )}
          </div>

          {/* FIXED: Better square footage with expanded profile data */}
          <div className="text-center">
            <Home className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {getBestValue('property.characteristics.squareFeet',
                'area.areaSqFt',
                'building.size.universalSize',
                'building.size.grossSizeGeneral',
                'building.size.livingSize',
                'building.size.grossSize')}
            </div>
            <div className="text-sm text-muted-foreground">Sq Ft</div>
            {/* FIXED: Show living size breakdown from expanded data */}
            {(getExpandedValue('building.size.livingSize') && 
              getExpandedValue('building.size.livingSize') !== getBestValue('property.characteristics.squareFeet',
                'area.areaSqFt',
                'building.size.universalSize',
                'building.size.grossSizeGeneral')) && (
              <div className="text-xs text-muted-foreground mt-1">
                {formatSquareFeet(getExpandedValue('building.size.livingSize'))} Living
              </div>
            )}
          </div>

          {/* FIXED: Better parking with expanded profile data */}
          <div className="text-center">
            <Car className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-semibold">
              {getBestValue('property.characteristics.parkingSpaces',
                'building.parking.prkgSize',
                'building.parking.garagetotal',
                'building.parking.garagetotal')}
            </div>
            <div className="text-sm text-muted-foreground">Parking Spaces</div>
            {/* FIXED: Show garage type from expanded data */}
            {(getExpandedValue('building.parking.garagetype') || getExpandedValue('building.parking.garageType')) && (
              <div className="text-xs text-muted-foreground mt-1">
                {getExpandedValue('building.parking.garagetype') || getExpandedValue('building.parking.garageType')}
              </div>
            )}
          </div>
        </div>

        {/* FIXED: Enhanced Additional Property Features with expanded profile data */}
        {getExpandedValue('building') && (
          <>
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FIXED: Enhanced Construction Details with more expanded fields */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Construction Details
                </h4>
                <div className="space-y-2 text-sm">
                  {/* Architectural style */}
                  {(getExpandedValue('building.construction.style') || getExpandedValue('building.summary.archStyle')) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Style:</span>
                      <span>{getBestValue('property.construction.style', 
                        'building.construction.style', 
                        'building.summary.archStyle')}</span>
                    </div>
                  )}
                  
                  {/* Condition */}
                  {(getExpandedValue('building.construction.condition') || getExpandedValue('building.summary.condition')) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition:</span>
                      <span>{getBestValue('property.construction.condition', 
                        'building.construction.condition',
                        'building.summary.condition')}</span>
                    </div>
                  )}
                  
                  {/* Quality */}
                  {(getExpandedValue('building.construction.quality') || getExpandedValue('building.summary.quality')) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quality:</span>
                      <span>{getBestValue('property.construction.quality', 
                        'building.construction.quality',
                        'building.summary.quality')}</span>
                    </div>
                  )}
                  
                  {/* Exterior walls */}
                  {(getExpandedValue('building.construction.exteriorWalls') || getExpandedValue('building.construction.wallType')) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exterior:</span>
                      <span>{getBestValue('property.construction.exteriorWalls', 
                        'building.construction.exteriorWalls',
                        'building.construction.wallType')}</span>
                    </div>
                  )}
                  
                  {/* Roof */}
                  {(getExpandedValue('building.construction.roofCover') || getExpandedValue('building.construction.roofType')) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roof:</span>
                      <span>{getBestValue('property.construction.roofType', 
                        'building.construction.roofCover',
                        'building.construction.roofType')}</span>
                    </div>
                  )}

                  {/* FIXED: Add more expanded fields */}
                  {getExpandedValue('building.construction.foundationType') && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Foundation:</span>
                      <span>{getBestValue('property.construction.foundation', 'building.construction.foundationType')}</span>
                    </div>
                  )}

                  {getExpandedValue('building.construction.constructionType') && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Construction:</span>
                      <span>{getBestValue('property.construction.type', 'building.construction.constructionType')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* FIXED: Enhanced Systems & Utilities with expanded data */}
              {(getExpandedValue('building.interior') || getExpandedValue('utilities')) && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Systems & Utilities
                  </h4>
                  <div className="space-y-2 text-sm">
                    {(getExpandedValue('building.interior.heating') || getExpandedValue('utilities.heating')) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Heating:</span>
                        <span>{getBestValue('property.systems.heating', 
                          'building.interior.heating',
                          'utilities.heating')}</span>
                      </div>
                    )}
                    
                    {(getExpandedValue('building.interior.cooling') || getExpandedValue('utilities.cooling')) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cooling:</span>
                        <span>{getBestValue('property.systems.cooling', 
                          'building.interior.cooling',
                          'utilities.cooling')}</span>
                      </div>
                    )}

                    {(getExpandedValue('building.interior.fuel') || getExpandedValue('utilities.fuel')) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fuel:</span>
                        <span>{getBestValue('property.systems.fuel', 
                          'building.interior.fuel',
                          'utilities.fuel')}</span>
                      </div>
                    )}

                    {(getExpandedValue('building.interior.water') || getExpandedValue('utilities.water')) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Water:</span>
                        <span>{getBestValue('property.systems.water', 
                          'building.interior.water',
                          'utilities.water')}</span>
                      </div>
                    )}

                    {(getExpandedValue('building.interior.sewer') || getExpandedValue('utilities.sewer')) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sewer:</span>
                        <span>{getBestValue('property.systems.sewer', 
                          'building.interior.sewer',
                          'utilities.sewer')}</span>
                      </div>
                    )}

                    {getExpandedValue('utilities.electric') && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Electric:</span>
                        <span>{getBestValue('property.systems.electric', 'utilities.electric')}</span>
                      </div>
                    )}

                    {getExpandedValue('utilities.gas') && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gas:</span>
                        <span>{getBestValue('property.systems.gas', 'utilities.gas')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FIXED: Enhanced Lot Information with more expanded fields */}
              {getExpandedValue('lot') && (
                <div>
                  <h4 className="font-medium mb-3">Lot Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lot Size:</span>
                      <span>{formatLotSize(
                        getBestValue('property.lot.sizeSqFt', 'lot.lotsize1', 'lot.lotSizeSqFt'),
                        getBestValue('property.lot.sizeAcres', 'lot.lotsize2', 'lot.lotSizeAcres')
                      )}</span>
                    </div>
                    
                    {/* Pool information */}
                    {(getExpandedValue('lot.pooltype') || getExpandedValue('building.interior.pooltype')) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pool:</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {getExpandedValue('lot.pooltype') || getExpandedValue('building.interior.pooltype')}
                        </span>
                      </div>
                    )}

                    {/* FIXED: Add more lot details from expanded profile */}
                    {getExpandedValue('lot.frontfootage') && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Front Footage:</span>
                        <span>{getBestValue('property.lot.frontFootage', 'lot.frontfootage')}</span>
                      </div>
                    )}

                    {getExpandedValue('lot.depth') && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Depth:</span>
                        <span>{getBestValue('property.lot.depth', 'lot.depth')}</span>
                      </div>
                    )}

                    {getExpandedValue('lot.topography') && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Topography:</span>
                        <span>{getBestValue('property.lot.topography', 'lot.topography')}</span>
                      </div>
                    )}

                    {(getExpandedValue('lot.waterfront') || getExpandedValue('lot.waterfrontind')) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Waterfront:</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          Yes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}