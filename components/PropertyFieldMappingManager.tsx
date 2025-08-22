import { Fragment } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeftRight,
  Save,
  RefreshCw,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  User,
  Check,
  X,
  Plus,
  Trash2,
  Target,
  Info,
  Building,
  Ruler,
  Bed,
  Bath,
  Car,
  FileText,
  MapIcon,
  Archive,
  Hash
} from 'lucide-react';

interface FieldMapping {
  id: string;
  sourceEndpoint: string;
  sourcePath: string;
  targetField: string;
  displayName: string;
  dataType: string;
  isEnabled: boolean;
}

const ATTOM_ENDPOINTS = [
  { id: 'basicprofile', name: 'Basic Profile' },
  { id: 'detail', name: 'Property Detail' },
  { id: 'saledetail', name: 'Sale Detail' },
  { id: 'expandedprofile', name: 'Expanded Profile' }
];

// Comprehensive list of all property fields organized by category
const TARGET_FIELDS = [
  // Identifier Fields
  { id: 'identifier.id', name: 'Property ID', category: 'Identifier', icon: Hash },
  { id: 'identifier.fips', name: 'FIPS Code', category: 'Identifier', icon: Hash },
  { id: 'identifier.apn', name: 'APN (Assessor Parcel Number)', category: 'Identifier', icon: Hash },

  // Address Fields
  { id: 'address.country', name: 'Country', category: 'Address', icon: MapPin },
  { id: 'address.countrySubd', name: 'State/Province', category: 'Address', icon: MapPin },
  { id: 'address.line1', name: 'Street Address Line 1', category: 'Address', icon: MapPin },
  { id: 'address.line2', name: 'Street Address Line 2', category: 'Address', icon: MapPin },
  { id: 'address.locality', name: 'City', category: 'Address', icon: MapPin },
  { id: 'address.matchCode', name: 'Address Match Code', category: 'Address', icon: MapPin },
  { id: 'address.oneLine', name: 'Full Address (One Line)', category: 'Address', icon: MapPin },
  { id: 'address.postal1', name: 'ZIP Code', category: 'Address', icon: MapPin },
  { id: 'address.postal2', name: 'ZIP+4 Extension', category: 'Address', icon: MapPin },
  { id: 'address.postal3', name: 'ZIP Additional Extension', category: 'Address', icon: MapPin },

  // Location Fields
  { id: 'location.latitude', name: 'Latitude', category: 'Location', icon: MapIcon },
  { id: 'location.longitude', name: 'Longitude', category: 'Location', icon: MapIcon },
  { id: 'location.accuracy', name: 'Location Accuracy', category: 'Location', icon: MapIcon },
  { id: 'location.elevation', name: 'Elevation', category: 'Location', icon: MapIcon },
  { id: 'location.distance', name: 'Distance', category: 'Location', icon: MapIcon },

  // Property Summary Fields
  { id: 'summary.absenteeInd', name: 'Absentee Indicator', category: 'Property Summary', icon: Home },
  { id: 'summary.propclass', name: 'Property Class', category: 'Property Summary', icon: Home },
  { id: 'summary.propsubtype', name: 'Property Subtype', category: 'Property Summary', icon: Home },
  { id: 'summary.proptype', name: 'Property Type', category: 'Property Summary', icon: Home },
  { id: 'summary.yearbuilt', name: 'Year Built', category: 'Property Summary', icon: Home },
  { id: 'summary.propLandUse', name: 'Property Land Use', category: 'Property Summary', icon: Home },
  { id: 'summary.propIndicator', name: 'Property Indicator', category: 'Property Summary', icon: Home },
  { id: 'summary.legal1', name: 'Legal Description', category: 'Property Summary', icon: FileText },

  // Lot Information Fields
  { id: 'lot.lotNum', name: 'Lot Number', category: 'Lot Information', icon: MapIcon },
  { id: 'lot.lotsize1', name: 'Lot Size 1', category: 'Lot Information', icon: Ruler },
  { id: 'lot.lotsize2', name: 'Lot Size 2', category: 'Lot Information', icon: Ruler },
  { id: 'lot.pooltype', name: 'Pool Type', category: 'Lot Information', icon: Home },
  { id: 'lot.situsCounty', name: 'County', category: 'Lot Information', icon: MapPin },
  { id: 'lot.subdname', name: 'Subdivision Name', category: 'Lot Information', icon: Home },
  { id: 'lot.subdtractnum', name: 'Subdivision Tract Number', category: 'Lot Information', icon: Hash },

  // Area & Room Information
  { id: 'area.absenteeInd', name: 'Area Absentee Indicator', category: 'Area & Rooms', icon: Home },
  { id: 'area.areaLot', name: 'Area Lot', category: 'Area & Rooms', icon: Ruler },
  { id: 'area.areaSqFt', name: 'Total Square Footage', category: 'Area & Rooms', icon: Ruler },
  { id: 'area.bathrooms', name: 'Total Bathrooms', category: 'Area & Rooms', icon: Bath },
  { id: 'area.bathroomsFull', name: 'Full Bathrooms', category: 'Area & Rooms', icon: Bath },
  { id: 'area.bathroomsPartial', name: 'Partial Bathrooms', category: 'Area & Rooms', icon: Bath },
  { id: 'area.bedrooms', name: 'Bedrooms', category: 'Area & Rooms', icon: Bed },
  { id: 'area.roomsTotal', name: 'Total Rooms', category: 'Area & Rooms', icon: Home },

  // Building Construction
  { id: 'building.construction.condition', name: 'Building Condition', category: 'Building Construction', icon: Building },
  { id: 'building.construction.constructionType', name: 'Construction Type', category: 'Building Construction', icon: Building },
  { id: 'building.construction.exteriorWalls', name: 'Exterior Wall Material', category: 'Building Construction', icon: Building },
  { id: 'building.construction.foundationMaterial', name: 'Foundation Material', category: 'Building Construction', icon: Building },
  { id: 'building.construction.quality', name: 'Construction Quality', category: 'Building Construction', icon: Building },
  { id: 'building.construction.roofCover', name: 'Roof Cover Material', category: 'Building Construction', icon: Building },
  { id: 'building.construction.roofFrame', name: 'Roof Frame Material', category: 'Building Construction', icon: Building },
  { id: 'building.construction.style', name: 'Architectural Style', category: 'Building Construction', icon: Building },

  // Building Interior
  { id: 'building.interior.fplctype', name: 'Fireplace Type', category: 'Building Interior', icon: Home },
  { id: 'building.interior.fuel', name: 'Fuel Type', category: 'Building Interior', icon: Home },
  { id: 'building.interior.heating', name: 'Heating Type', category: 'Building Interior', icon: Home },

  // Building Parking
  { id: 'building.parking.garagetype', name: 'Garage Type', category: 'Building Parking', icon: Car },
  { id: 'building.parking.prkgSize', name: 'Parking Spaces', category: 'Building Parking', icon: Car },
  { id: 'building.parking.prkgType', name: 'Parking Type', category: 'Building Parking', icon: Car },

  // Building Size
  { id: 'building.size.grossSizeAdjusted', name: 'Gross Size Adjusted', category: 'Building Size', icon: Ruler },
  { id: 'building.size.grossSizeGeneral', name: 'Gross Size General', category: 'Building Size', icon: Ruler },
  { id: 'building.size.livingSize', name: 'Living Area Size', category: 'Building Size', icon: Ruler },
  { id: 'building.size.sizeInd', name: 'Size Indicator', category: 'Building Size', icon: Ruler },
  { id: 'building.size.universalSize', name: 'Universal Size', category: 'Building Size', icon: Ruler },

  // Building Summary
  { id: 'building.summary.archStyle', name: 'Architectural Style (Summary)', category: 'Building Summary', icon: Building },
  { id: 'building.summary.levels', name: 'Number of Levels', category: 'Building Summary', icon: Building },
  { id: 'building.summary.noOfBaths', name: 'Number of Bathrooms (Summary)', category: 'Building Summary', icon: Bath },
  { id: 'building.summary.noOfPartialBaths', name: 'Number of Partial Bathrooms', category: 'Building Summary', icon: Bath },
  { id: 'building.summary.noOfBeds', name: 'Number of Bedrooms (Summary)', category: 'Building Summary', icon: Bed },
  { id: 'building.summary.noOfRooms', name: 'Number of Rooms (Summary)', category: 'Building Summary', icon: Home },
  { id: 'building.summary.proptype', name: 'Property Type (Summary)', category: 'Building Summary', icon: Home },
  { id: 'building.summary.story', name: 'Number of Stories', category: 'Building Summary', icon: Building },
  { id: 'building.summary.unitsCount', name: 'Units Count', category: 'Building Summary', icon: Building },
  { id: 'building.summary.yearBuilt', name: 'Year Built (Summary)', category: 'Building Summary', icon: Calendar },
  { id: 'building.summary.yearBuiltEffective', name: 'Effective Year Built', category: 'Building Summary', icon: Calendar },

  // Assessment - Appraised Values
  { id: 'assessment.appraised.apprisedTtl', name: 'Appraised Total', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.appraised.apprisedVal', name: 'Appraised Value', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.appraised.assdTtl', name: 'Assessed Total', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.appraised.assdVal', name: 'Assessed Value (Appraised)', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.appraised.mktTtl', name: 'Market Total', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.appraised.mktVal', name: 'Market Value', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.appraised.taxYear', name: 'Tax Year (Appraised)', category: 'Assessment Values', icon: Calendar },

  // Assessment - Assessor Values
  { id: 'assessment.assessor.apn', name: 'APN (Assessor)', category: 'Assessment Values', icon: Hash },
  { id: 'assessment.assessor.assdValue', name: 'Assessed Value', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.assessor.mktValue', name: 'Market Value (Assessor)', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.assessor.taxYear', name: 'Tax Year (Assessor)', category: 'Assessment Values', icon: Calendar },

  // Assessment - Market Values
  { id: 'assessment.market.apprCurr', name: 'Current Market Value', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.market.apprPrev', name: 'Previous Market Value', category: 'Assessment Values', icon: DollarSign },
  { id: 'assessment.market.apprYear', name: 'Appraisal Year', category: 'Assessment Values', icon: Calendar },
  { id: 'assessment.market.taxYear', name: 'Tax Year (Market)', category: 'Assessment Values', icon: Calendar },

  // Assessment - Tax Information
  { id: 'assessment.tax.exemptflag', name: 'Tax Exempt Flag', category: 'Tax Information', icon: FileText },
  { id: 'assessment.tax.taxAmt', name: 'Annual Tax Amount', category: 'Tax Information', icon: DollarSign },
  { id: 'assessment.tax.taxPerSizeUnit', name: 'Tax per Size Unit', category: 'Tax Information', icon: DollarSign },
  { id: 'assessment.tax.taxRate', name: 'Tax Rate', category: 'Tax Information', icon: DollarSign },
  { id: 'assessment.tax.taxYear', name: 'Tax Year', category: 'Tax Information', icon: Calendar },

  // Sale Amount Information
  { id: 'sale.amount.saleAmt', name: 'Last Sale Price', category: 'Sale Information', icon: DollarSign },
  { id: 'sale.amount.saleAmtCurr', name: 'Current Sale Amount', category: 'Sale Information', icon: DollarSign },

  // Sale Calculations
  { id: 'sale.calculation.pricePerSizeUnit', name: 'Price Per Square Foot', category: 'Sale Information', icon: DollarSign },
  { id: 'sale.calculation.saleAmtCurr', name: 'Current Sale Amount (Calc)', category: 'Sale Information', icon: DollarSign },

  // Sale Transaction Details
  { id: 'sale.transaction.contractDate', name: 'Contract Date', category: 'Sale Information', icon: Calendar },
  { id: 'sale.transaction.saleRecDate', name: 'Sale Record Date', category: 'Sale Information', icon: Calendar },
  { id: 'sale.transaction.saleSearchDate', name: 'Sale Search Date', category: 'Sale Information', icon: Calendar },
  { id: 'sale.transaction.saleTransDate', name: 'Sale Transaction Date', category: 'Sale Information', icon: Calendar },

  // Owner Information
  { id: 'owner.corporateIndicator', name: 'Corporate Indicator', category: 'Owner Information', icon: User },
  { id: 'owner.lastName', name: 'Owner Last Name', category: 'Owner Information', icon: User },
  { id: 'owner.firstName', name: 'Owner First Name', category: 'Owner Information', icon: User },
  { id: 'owner.middleName', name: 'Owner Middle Name', category: 'Owner Information', icon: User },
  { id: 'owner.owner1Full', name: 'Primary Owner Name', category: 'Owner Information', icon: User },
  { id: 'owner.owner2Full', name: 'Second Owner Name', category: 'Owner Information', icon: User },
  { id: 'owner.owner3Full', name: 'Third Owner Name', category: 'Owner Information', icon: User },
  { id: 'owner.owner4Full', name: 'Fourth Owner Name', category: 'Owner Information', icon: User },

  // Owner Mailing Address
  { id: 'owner.mailingAddress.country', name: 'Mailing Address Country', category: 'Owner Information', icon: MapPin },
  { id: 'owner.mailingAddress.countrySubd', name: 'Mailing Address State', category: 'Owner Information', icon: MapPin },
  { id: 'owner.mailingAddress.line1', name: 'Mailing Address Line 1', category: 'Owner Information', icon: MapPin },
  { id: 'owner.mailingAddress.line2', name: 'Mailing Address Line 2', category: 'Owner Information', icon: MapPin },
  { id: 'owner.mailingAddress.locality', name: 'Mailing Address City', category: 'Owner Information', icon: MapPin },
  { id: 'owner.mailingAddress.oneLine', name: 'Full Mailing Address', category: 'Owner Information', icon: MapPin },
  { id: 'owner.mailingAddress.postal1', name: 'Mailing Address ZIP', category: 'Owner Information', icon: MapPin },
  { id: 'owner.mailingAddress.postal2', name: 'Mailing Address ZIP+4', category: 'Owner Information', icon: MapPin },

  // Data Information
  { id: 'vintage.lastModified', name: 'Data Last Modified', category: 'Data Information', icon: Calendar },
  { id: 'vintage.pubDate', name: 'Data Publication Date', category: 'Data Information', icon: Calendar },
];

// Common path suggestions for different endpoints
const getPathSuggestions = (endpointId: string) => {
  const basePaths = [
    'property[0].identifier.id',
    'property[0].identifier.fips',
    'property[0].identifier.apn',
    'property[0].address.country',
    'property[0].address.countrySubd',
    'property[0].address.line1',
    'property[0].address.line2',
    'property[0].address.locality',
    'property[0].address.oneLine',
    'property[0].address.postal1',
    'property[0].address.postal2',
    'property[0].location.latitude',
    'property[0].location.longitude',
    'property[0].location.accuracy',
    'property[0].summary.propclass',
    'property[0].summary.proptype',
    'property[0].summary.yearbuilt',
    'property[0].summary.propLandUse',
    'property[0].area.areaSqFt',
    'property[0].area.bedrooms',
    'property[0].area.bathrooms',
    'property[0].area.bathroomsFull',
    'property[0].area.bathroomsPartial',
    'property[0].area.roomsTotal',
    'property[0].lot.situsCounty',
    'property[0].lot.subdname',
    'property[0].lot.lotsize1',
    'property[0].lot.lotsize2',
    'property[0].lot.pooltype',
    'property[0].vintage.lastModified',
    'property[0].vintage.pubDate'
  ];

  const detailPaths = [
    ...basePaths,
    'property[0].building.construction.style',
    'property[0].building.construction.condition',
    'property[0].building.construction.exteriorWalls',
    'property[0].building.construction.roofCover',
    'property[0].building.construction.quality',
    'property[0].building.interior.heating',
    'property[0].building.interior.fuel',
    'property[0].building.parking.garagetype',
    'property[0].building.parking.prkgSize',
    'property[0].building.size.livingSize',
    'property[0].building.size.universalSize',
    'property[0].building.size.grossSizeGeneral',
    'property[0].building.summary.levels',
    'property[0].building.summary.story',
    'property[0].building.summary.yearBuilt',
    'property[0].building.summary.archStyle'
  ];

  const salePaths = [
    ...basePaths,
    'property[0].sale.amount.saleAmt',
    'property[0].sale.calculation.pricePerSizeUnit',
    'property[0].sale.transaction.saleTransDate',
    'property[0].sale.transaction.contractDate',
    'property[0].sale.transaction.saleRecDate'
  ];

  const expandedPaths = [
    ...detailPaths,
    ...salePaths,
    'property[0].assessment.assessor.assdValue',
    'property[0].assessment.market.apprCurr',
    'property[0].assessment.tax.taxAmt',
    'property[0].assessment.tax.taxRate',
    'property[0].assessment.assessor.taxYear',
    'property[0].owner.owner1Full',
    'property[0].owner.owner2Full',
    'property[0].owner.corporateIndicator',
    'property[0].owner.mailingAddress.oneLine',
    'property[0].owner.mailingAddress.line1',
    'property[0].owner.mailingAddress.locality',
    'property[0].owner.mailingAddress.countrySubd',
    'property[0].owner.mailingAddress.postal1'
  ];

  switch (endpointId) {
    case 'basicprofile':
      return basePaths;
    case 'detail':
      return detailPaths;
    case 'saledetail':
      return salePaths;
    case 'expandedprofile':
      return expandedPaths;
    default:
      return basePaths;
  }
};

export function PropertyFieldMappingManager() {
  console.log('PropertyFieldMappingManager: Component starting to render');

  // Initialize with empty array to prevent undefined issues
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Address', 'Property Summary']);
  const [isSaving, setIsSaving] = useState(false);

  console.log('PropertyFieldMappingManager: State initialized, fieldMappings length:', fieldMappings.length);

  // Get unique categories for filtering
  const categories = Array.from(new Set(TARGET_FIELDS.map(field => field.category))).sort();

  // Filter fields based on search and category
  const filteredFields = TARGET_FIELDS.filter(field => {
    const matchesSearch = !searchFilter || 
      field.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      field.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      field.category.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesCategory = !selectedCategory || field.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group filtered fields by category
  const fieldsByCategory = filteredFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof TARGET_FIELDS>);

  const loadMappings = async () => {
    console.log('PropertyFieldMappingManager: Starting to load mappings');
    try {
      setIsLoading(true);
      setError(null);
      
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      console.log('PropertyFieldMappingManager: Supabase info loaded successfully');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/property-field-mappings`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('PropertyFieldMappingManager: Fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        const mappings = Array.isArray(data.mappings) ? data.mappings : [];
        console.log('PropertyFieldMappingManager: Loaded mappings:', mappings.length);
        setFieldMappings(mappings);
        setSuccess(`Loaded ${mappings.length} mappings successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.warn('PropertyFieldMappingManager: Failed to load mappings, status:', response.status);
        setFieldMappings([]);  // Ensure we have an empty array
        setSuccess('No existing mappings found - you can create new ones below.');
        setTimeout(() => setSuccess(null), 3000);
      }
      
    } catch (error) {
      console.error('PropertyFieldMappingManager: Error loading mappings:', error);
      setError('Failed to load mappings: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setFieldMappings([]);  // Ensure we have an empty array even on error
    } finally {
      setIsLoading(false);
    }
  };

  const saveMappings = async () => {
    console.log('PropertyFieldMappingManager: Starting to save mappings');
    try {
      setIsSaving(true);
      setError(null);
      
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/property-field-mappings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mappings: fieldMappings })
      });

      if (response.ok) {
        setSuccess('Mappings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(`Failed to save: ${response.status}`);
      }
      
    } catch (error) {
      console.error('PropertyFieldMappingManager: Error saving mappings:', error);
      setError('Failed to save mappings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const createMapping = (targetField: string) => {
    console.log('PropertyFieldMappingManager: Creating mapping for field:', targetField);
    
    try {
      // Find the target field info
      const targetFieldInfo = TARGET_FIELDS.find(f => f.id === targetField);
      if (!targetFieldInfo) {
        console.error('PropertyFieldMappingManager: Target field not found:', targetField);
        setError('Target field not found: ' + targetField);
        return;
      }

      console.log('PropertyFieldMappingManager: Found target field info:', targetFieldInfo);

      // Create new mapping object
      const newMapping: FieldMapping = {
        id: `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sourceEndpoint: 'basicprofile', // Default to basic profile
        sourcePath: '',
        targetField: targetField,
        displayName: targetFieldInfo.name,
        dataType: 'string',
        isEnabled: true
      };

      console.log('PropertyFieldMappingManager: Created new mapping object:', newMapping);

      // Update state by removing any existing mapping for this field and adding the new one
      setFieldMappings(prevMappings => {
        console.log('PropertyFieldMappingManager: Updating fieldMappings, previous length:', prevMappings.length);
        
        // Filter out any existing mapping for this target field
        const filteredMappings = prevMappings.filter(m => m.targetField !== targetField);
        console.log('PropertyFieldMappingManager: After filtering, length:', filteredMappings.length);
        
        // Add the new mapping
        const newMappings = [...filteredMappings, newMapping];
        console.log('PropertyFieldMappingManager: New mappings length:', newMappings.length);
        
        return newMappings;
      });

      // Set success message
      setSuccess(`Created mapping for ${targetFieldInfo.name}!`);
      setTimeout(() => setSuccess(null), 3000);

      console.log('PropertyFieldMappingManager: Successfully created mapping');
      
    } catch (error) {
      console.error('PropertyFieldMappingManager: Error in createMapping:', error);
      setError('Failed to create mapping: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const updateMappingField = (mappingId: string, field: string, value: string) => {
    console.log('PropertyFieldMappingManager: Updating mapping field:', { mappingId, field, value });
    
    try {
      setFieldMappings(prevMappings => {
        return prevMappings.map(mapping => {
          if (mapping.id === mappingId) {
            const updatedMapping = { ...mapping, [field]: value };
            // Clear source path if endpoint changes
            if (field === 'sourceEndpoint' && value !== mapping.sourceEndpoint) {
              updatedMapping.sourcePath = '';
            }
            console.log('PropertyFieldMappingManager: Updated mapping:', updatedMapping);
            return updatedMapping;
          }
          return mapping;
        });
      });
    } catch (error) {
      console.error('PropertyFieldMappingManager: Error updating mapping field:', error);
      setError('Failed to update mapping: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const removeMapping = (mappingId: string) => {
    console.log('PropertyFieldMappingManager: Removing mapping:', mappingId);
    
    try {
      setFieldMappings(prevMappings => {
        const newMappings = prevMappings.filter(m => m.id !== mappingId);
        console.log('PropertyFieldMappingManager: After removal, mappings length:', newMappings.length);
        return newMappings;
      });
      
      setSuccess('Mapping removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('PropertyFieldMappingManager: Error removing mapping:', error);
      setError('Failed to remove mapping: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const toggleMappingEnabled = (mappingId: string) => {
    console.log('PropertyFieldMappingManager: Toggling mapping enabled:', mappingId);
    
    try {
      setFieldMappings(prevMappings => {
        return prevMappings.map(mapping => {
          if (mapping.id === mappingId) {
            const updatedMapping = { ...mapping, isEnabled: !mapping.isEnabled };
            console.log('PropertyFieldMappingManager: Toggled mapping:', updatedMapping);
            return updatedMapping;
          }
          return mapping;
        });
      });
    } catch (error) {
      console.error('PropertyFieldMappingManager: Error toggling mapping:', error);
      setError('Failed to toggle mapping: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Load mappings on component mount
  useEffect(() => {
    console.log('PropertyFieldMappingManager: useEffect triggered, loading mappings');
    loadMappings();
  }, []);

  console.log('PropertyFieldMappingManager: About to render, current state:', {
    fieldMappingsLength: fieldMappings.length,
    isLoading,
    error,
    success,
    totalFields: TARGET_FIELDS.length,
    filteredFields: filteredFields.length,
    categories: categories.length
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2">
              <ArrowLeftRight className="w-6 h-6 text-primary" />
              Property Field Mapping Manager
            </h1>
            <p className="text-muted-foreground">
              Map property fields to ATTOM API endpoint responses ({TARGET_FIELDS.length} total fields across {categories.length} categories)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadMappings} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Reload'}
            </Button>
            <Button onClick={saveMappings} disabled={isSaving || fieldMappings.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save All'}
            </Button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2" 
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Fields</p>
                  <p className="text-2xl font-semibold">{TARGET_FIELDS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Mapped</p>
                  <p className="text-2xl font-semibold">{fieldMappings.filter(m => m.isEnabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Disabled</p>
                  <p className="text-2xl font-semibold">{fieldMappings.filter(m => !m.isEnabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-semibold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-teal-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Endpoints</p>
                  <p className="text-2xl font-semibold">{ATTOM_ENDPOINTS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Search & Filter Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Search Fields</Label>
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by field name, ID, or category..."
                />
              </div>
              <div>
                <Label>Filter by Category</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 text-sm border rounded-md"
                >
                  <option value="">All categories ({TARGET_FIELDS.length} fields)</option>
                  {categories.map(category => {
                    const count = TARGET_FIELDS.filter(f => f.category === category).length;
                    return (
                      <option key={category} value={category}>
                        {category} ({count} fields)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            {(searchFilter || selectedCategory) && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {filteredFields.length} of {TARGET_FIELDS.length} fields
              </p>
            )}
          </CardContent>
        </Card>

        {/* Property Fields by Category */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {Object.entries(fieldsByCategory).map(([category, fields]) => {
            const isExpanded = expandedCategories.includes(category);
            const CategoryIcon = fields[0]?.icon || FileText;
            
            return (
              <Card key={category}>
                <CardHeader 
                  className="cursor-pointer" 
                  onClick={() => toggleCategoryExpansion(category)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                      {category}
                      <Badge variant="outline">
                        {fields.length} fields
                      </Badge>
                      <Badge variant="outline">
                        {fields.filter(f => fieldMappings.some(m => m.targetField === f.id && m.isEnabled)).length} mapped
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {isExpanded ? 'Click to collapse' : 'Click to expand'}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-3">
                      {fields.map(field => {
                        const mapping = fieldMappings.find(m => m.targetField === field.id);
                        const IconComponent = field.icon;
                        const pathSuggestions = mapping?.sourceEndpoint ? getPathSuggestions(mapping.sourceEndpoint) : [];
                        
                        return (
                          <div key={field.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                                  <h4 className="font-medium">{field.name}</h4>
                                  {mapping && (
                                    <Badge variant={mapping.isEnabled ? "default" : "secondary"} className="text-xs">
                                      {mapping.isEnabled ? 'Active' : 'Disabled'}
                                    </Badge>
                                  )}
                                </div>
                                
                                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {field.id}
                                </code>

                                {mapping && (
                                  <div className="mt-3 space-y-3 border-t pt-3">
                                    <div className="grid grid-cols-1 gap-3">
                                      <div>
                                        <Label className="text-xs">ATTOM API Endpoint</Label>
                                        <select
                                          value={mapping.sourceEndpoint}
                                          onChange={(e) => updateMappingField(mapping.id, 'sourceEndpoint', e.target.value)}
                                          className="w-full h-8 px-2 text-xs border rounded"
                                        >
                                          {ATTOM_ENDPOINTS.map(endpoint => (
                                            <option key={endpoint.id} value={endpoint.id}>
                                              {endpoint.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-xs">Source Path (JSON path to data)</Label>
                                        <Input
                                          value={mapping.sourcePath}
                                          onChange={(e) => updateMappingField(mapping.id, 'sourcePath', e.target.value)}
                                          placeholder="e.g., property[0].address.oneLine"
                                          className="h-8 text-xs font-mono"
                                        />
                                      </div>

                                      <div>
                                        <Label className="text-xs">Data Type</Label>
                                        <select
                                          value={mapping.dataType}
                                          onChange={(e) => updateMappingField(mapping.id, 'dataType', e.target.value)}
                                          className="w-full h-8 px-2 text-xs border rounded"
                                        >
                                          <option value="string">String</option>
                                          <option value="number">Number</option>
                                          <option value="boolean">Boolean</option>
                                          <option value="date">Date</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* Suggested Paths */}
                                    {mapping.sourceEndpoint && pathSuggestions.length > 0 && (
                                      <div>
                                        <Label className="text-xs">Suggested Paths for {ATTOM_ENDPOINTS.find(e => e.id === mapping.sourceEndpoint)?.name} (click to use)</Label>
                                        <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                                          {pathSuggestions.slice(0, 12).map((path, index) => (
                                            <button
                                              key={index}
                                              onClick={() => updateMappingField(mapping.id, 'sourcePath', path)}
                                              className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded font-mono"
                                              title={path}
                                            >
                                              {path.split('.').slice(-2).join('.')}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                {mapping ? (
                                  <Fragment>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => toggleMappingEnabled(mapping.id)}
                                      className={mapping.isEnabled ? "text-orange-600" : "text-green-600"}
                                    >
                                      {mapping.isEnabled ? 'Disable' : 'Enable'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeMapping(mapping.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </Fragment>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => createMapping(field.id)}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Create Mapping
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Current Mappings Summary */}
        {fieldMappings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Mappings ({fieldMappings.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {fieldMappings.map(mapping => (
                  <div key={mapping.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <span className="font-medium">{mapping.displayName}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        → {ATTOM_ENDPOINTS.find(e => e.id === mapping.sourceEndpoint)?.name || mapping.sourceEndpoint} 
                        → {mapping.sourcePath || '(no path set)'}
                      </span>
                    </div>
                    <Badge variant={mapping.isEnabled ? "default" : "secondary"} className="text-xs">
                      {mapping.isEnabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              How to Use This Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1. Browse Fields:</strong> Use search and category filters to find specific property fields ({TARGET_FIELDS.length} total across {categories.length} categories).</p>
              <p><strong>2. Create Mappings:</strong> Click "Create Mapping" next to any field to map it to ATTOM API data.</p>
              <p><strong>3. Select Endpoint:</strong> Choose which ATTOM API endpoint contains your data (Basic Profile, Detail, Sale Detail, or Expanded Profile).</p>
              <p><strong>4. Set Source Path:</strong> Enter the JSON path to the data or use suggested paths for your selected endpoint.</p>
              <p><strong>5. Choose Data Type:</strong> Select the appropriate data type for proper data handling (string, number, boolean, date).</p>
              <p><strong>6. Enable/Disable:</strong> Use the Enable/Disable button to control which mappings are active.</p>
              <p><strong>7. Save Changes:</strong> Click "Save All" to persist your mappings to the server.</p>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Field Coverage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-blue-600">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-green-600">{fieldMappings.filter(m => m.isEnabled).length}</p>
                <p className="text-sm text-muted-foreground">Active Mappings</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-orange-600">{fieldMappings.filter(m => !m.isEnabled).length}</p>
                <p className="text-sm text-muted-foreground">Disabled Mappings</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-purple-600">{TARGET_FIELDS.length - fieldMappings.length}</p>
                <p className="text-sm text-muted-foreground">Unmapped Fields</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-teal-600">{Math.round((fieldMappings.filter(m => m.isEnabled).length / TARGET_FIELDS.length) * 100)}%</p>
                <p className="text-sm text-muted-foreground">Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}