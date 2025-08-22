import { PropertyBasicProfileData } from '../types/propertyBasicProfile';

// Format currency values
export const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format square footage
export const formatSquareFeet = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('en-US').format(value) + ' sq ft';
};

// Format lot size
export const formatLotSize = (sqft?: number, acres?: number): string => {
  if (acres && acres >= 1) {
    return `${acres.toFixed(2)} acres`;
  } else if (sqft) {
    return formatSquareFeet(sqft);
  }
  return 'N/A';
};

// Format date
export const formatDate = (dateString: string | undefined): string => {
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
};

// Format property type
export const formatPropertyType = (type: string | undefined): string => {
  if (!type) return 'N/A';
  return type.replace(/([A-Z])/g, ' $1').trim();
};

// Get primary owner name
export const getPrimaryOwnerName = (owner?: PropertyBasicProfileData['owner']): string => {
  if (!owner) return 'N/A';
  
  if (owner.owner1Full) return owner.owner1Full;
  
  const firstName = owner.firstName || '';
  const lastName = owner.lastName || '';
  const middleName = owner.middleName || '';
  
  if (firstName || lastName) {
    return `${firstName} ${middleName} ${lastName}`.trim();
  }
  
  return 'N/A';
};

// Parse address into components for API call
export const parseAddressForAPI = (address: string) => {
  if (!address) return null;
  
  // Simple address parsing - split by comma
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const address1 = parts[0]; // Street address
    const address2 = parts.slice(1).join(', '); // City, State ZIP
    
    return {
      address1: encodeURIComponent(address1),
      address2: encodeURIComponent(address2)
    };
  } else {
    // If no comma, treat as single address line
    return {
      address1: encodeURIComponent(address)
    };
  }
};

// Get mailing address string
export const getMailingAddress = (mailingAddress?: PropertyBasicProfileData['owner']['mailingAddress']): string => {
  if (!mailingAddress) return 'N/A';
  return mailingAddress.oneLine || 
         `${mailingAddress.line1 || ''} ${mailingAddress.line2 || ''}, ${mailingAddress.locality || ''}, ${mailingAddress.countrySubd || ''} ${mailingAddress.postal1 || ''}`.trim();
};