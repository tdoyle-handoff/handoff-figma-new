import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Mail, MapPin, Calendar, Shield, FileText } from 'lucide-react';
import { PropertyBasicProfileData } from '../../types/propertyBasicProfile';

interface PropertyOwnerSectionProps {
  propertyData: PropertyBasicProfileData;
  mappedData?: any;
}

export function PropertyOwnerSection({ propertyData, mappedData }: PropertyOwnerSectionProps) {
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
    
    return null;
  };

  // Format date values
  const formatDate = (dateString: any) => {
    if (!dateString) return 'Not available';
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
  };

  // Check if we have any owner data to display
  const hasOwnerData = getExpandedValue('owner') || getExpandedValue('deed');

  if (!hasOwnerData) {
    return null;
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Property Owner Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FIXED: Owner Details with expanded profile data */}
          {getExpandedValue('owner') && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Current Owner
              </h4>
              <div className="space-y-3">
                {/* Owner names */}
                {(getExpandedValue('owner.owner1.owner1FullName') || getExpandedValue('owner.owner1.owner1Name')) && (
                  <div>
                    <span className="text-sm text-muted-foreground">Primary Owner:</span>
                    <p className="font-medium">
                      {getBestValue('property.owner.primaryName', 
                        'owner.owner1.owner1FullName',
                        'owner.owner1.owner1Name')}
                    </p>
                  </div>
                )}

                {(getExpandedValue('owner.owner2.owner2FullName') || getExpandedValue('owner.owner2.owner2Name')) && (
                  <div>
                    <span className="text-sm text-muted-foreground">Secondary Owner:</span>
                    <p className="font-medium">
                      {getBestValue('property.owner.secondaryName', 
                        'owner.owner2.owner2FullName',
                        'owner.owner2.owner2Name')}
                    </p>
                  </div>
                )}

                {/* Ownership type */}
                {getExpandedValue('owner.ownershipType') && (
                  <div>
                    <span className="text-sm text-muted-foreground">Ownership Type:</span>
                    <p className="font-medium">
                      {getBestValue('property.owner.ownershipType', 'owner.ownershipType')}
                    </p>
                  </div>
                )}

                {/* FIXED: Add ownership transfer date from expanded data */}
                {(getExpandedValue('owner.transferDate') || getExpandedValue('deed.deedDate')) && (
                  <div>
                    <span className="text-sm text-muted-foreground">Ownership Since:</span>
                    <p className="font-medium">
                      {formatDate(getBestValue('property.owner.ownershipDate', 
                        'owner.transferDate',
                        'deed.deedDate'))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FIXED: Mailing Address with expanded profile data */}
          {(getExpandedValue('owner.mailingAddress') || getExpandedValue('owner.owner1.owner1Address')) && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Mailing Address
              </h4>
              <div className="space-y-2">
                {/* Try multiple possible address formats */}
                {(getExpandedValue('owner.mailingAddress.oneLine') || 
                  getExpandedValue('owner.owner1.owner1Address.oneLine') ||
                  getExpandedValue('owner.mailingAddress.line1') ||
                  getExpandedValue('owner.owner1.owner1Address.line1')) && (
                  <>
                    <p className="text-sm">
                      {getBestValue('property.owner.mailingAddress.street', 
                        'owner.mailingAddress.oneLine',
                        'owner.owner1.owner1Address.oneLine',
                        'owner.mailingAddress.line1',
                        'owner.owner1.owner1Address.line1')}
                    </p>
                    
                    {/* City, State, ZIP */}
                    <p className="text-sm text-muted-foreground">
                      {[
                        getBestValue('property.owner.mailingAddress.city', 
                          'owner.mailingAddress.locality',
                          'owner.owner1.owner1Address.locality'),
                        getBestValue('property.owner.mailingAddress.state', 
                          'owner.mailingAddress.countrySubd',
                          'owner.owner1.owner1Address.countrySubd'),
                        getBestValue('property.owner.mailingAddress.zipCode', 
                          'owner.mailingAddress.postal1',
                          'owner.owner1.owner1Address.postal1')
                      ].filter(Boolean).join(', ')}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* FIXED: Deed Information with expanded profile data */}
          {getExpandedValue('deed') && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Deed Information
              </h4>
              <div className="space-y-2 text-sm">
                {getExpandedValue('deed.deedType') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deed Type:</span>
                    <span className="font-medium">
                      {getBestValue('property.deed.type', 'deed.deedType')}
                    </span>
                  </div>
                )}

                {getExpandedValue('deed.deedDate') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deed Date:</span>
                    <span className="font-medium">
                      {formatDate(getBestValue('property.deed.date', 'deed.deedDate'))}
                    </span>
                  </div>
                )}

                {getExpandedValue('deed.bookPage') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Book/Page:</span>
                    <span className="font-medium">
                      {getBestValue('property.deed.bookPage', 'deed.bookPage')}
                    </span>
                  </div>
                )}

                {getExpandedValue('deed.documentNumber') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Document #:</span>
                    <span className="font-medium">
                      {getBestValue('property.deed.documentNumber', 'deed.documentNumber')}
                    </span>
                  </div>
                )}

                {/* FIXED: Add more deed details from expanded data */}
                {getExpandedValue('deed.grantor') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grantor:</span>
                    <span className="font-medium">
                      {getBestValue('property.deed.grantor', 'deed.grantor')}
                    </span>
                  </div>
                )}

                {getExpandedValue('deed.grantee') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grantee:</span>
                    <span className="font-medium">
                      {getBestValue('property.deed.grantee', 'deed.grantee')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FIXED: Legal Description with expanded profile data */}
          {(getExpandedValue('legal') || getExpandedValue('lot.legal')) && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Legal Information
              </h4>
              <div className="space-y-2 text-sm">
                {(getExpandedValue('legal.legalDescription') || getExpandedValue('lot.legal.legalDescription')) && (
                  <div>
                    <span className="text-muted-foreground">Legal Description:</span>
                    <p className="font-medium mt-1 text-xs">
                      {getBestValue('property.legal.description', 
                        'legal.legalDescription',
                        'lot.legal.legalDescription')}
                    </p>
                  </div>
                )}

                {(getExpandedValue('legal.subdivision') || getExpandedValue('lot.subdname')) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subdivision:</span>
                    <span className="font-medium">
                      {getBestValue('property.legal.subdivision', 
                        'legal.subdivision',
                        'lot.subdname')}
                    </span>
                  </div>
                )}

                {(getExpandedValue('legal.block') || getExpandedValue('lot.block')) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block:</span>
                    <span className="font-medium">
                      {getBestValue('property.legal.block', 
                        'legal.block',
                        'lot.block')}
                    </span>
                  </div>
                )}

                {(getExpandedValue('legal.lot') || getExpandedValue('lot.lot')) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lot:</span>
                    <span className="font-medium">
                      {getBestValue('property.legal.lot', 
                        'legal.lot',
                        'lot.lot')}
                    </span>
                  </div>
                )}

                {/* FIXED: Add more legal details from expanded data */}
                {getExpandedValue('legal.section') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Section:</span>
                    <span className="font-medium">
                      {getBestValue('property.legal.section', 'legal.section')}
                    </span>
                  </div>
                )}

                {getExpandedValue('legal.township') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Township:</span>
                    <span className="font-medium">
                      {getBestValue('property.legal.township', 'legal.township')}
                    </span>
                  </div>
                )}

                {getExpandedValue('legal.range') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Range:</span>
                    <span className="font-medium">
                      {getBestValue('property.legal.range', 'legal.range')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}