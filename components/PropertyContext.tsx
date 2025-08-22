import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Comprehensive property data interface
export interface PropertyData {
  // Basic Property Info
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: string;
  homeType: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  lotSize: string;
  yearBuilt: string;
  
  // Timeline
  targetClosingDate: string;
  moveInDate: string;
  currentLeaseEnd?: string;
  
  // Must-Have Features
  mustHaveFeatures: string[];
  
  // Location Preferences
  locationPriorities: string[];
  maxCommuteTime: string;
  workAddress: string;
  
  // Neighborhoods
  preferredNeighborhoods: string[];
  customNeighborhoods: string[];
  
  // Financing
  downPaymentAmount: string;
  downPaymentPercent: string;
  preApprovalAmount: string;
  lenderName: string;
  mortgageType: string;
  
  // Contingencies
  needToSellCurrent: boolean;
  currentHomeAddress?: string;
  standardContingencies: string[];
  additionalNotes: string;
  
  // Team
  hasRealtor: boolean;
  realtorName?: string;
  realtorEmail?: string;
  realtorPhone?: string;
  hasLender: boolean;
  hasAttorney?: boolean;
  realtorCompany?: string;
  lenderContactName?: string;
  lenderEmail?: string;
  lenderPhone?: string;
  
  // Special Requirements
  specialRequirements: string[];
  accessibilityNeeds: string[];
  petRequirements: string[];
  
  // Current Status
  currentStep: string;
  completionPercentage: number;
  // Optional purchase details referenced by Dashboard and others
  purchasePrice?: number;
}

// Property search criteria
export interface SearchCriteria {
  priceRange: {
    min: number;
    max: number;
  };
  bedrooms: {
    min: number;
    max?: number;
  };
  bathrooms: {
    min: number;
    max?: number;
  };
  homeTypes: string[];
  locations: string[];
  mustHaveFeatures: string[];
  maxCommuteTime?: string;
  specialRequirements: string[];
}

// Market insights data
export interface MarketInsights {
  averagePrice: number;
  pricePerSquareFoot: number;
  daysOnMarket: number;
  marketTrend: 'rising' | 'falling' | 'stable';
  competitionLevel: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  lastUpdated: string;
}

// Property recommendations
export interface PropertyRecommendation {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  matchScore: number;
  matchReasons: string[];
  images: string[];
  listingUrl?: string;
}

interface PropertyContextType {
  // Core property data
  propertyData: PropertyData | null;
  updatePropertyData: (data: Partial<PropertyData>) => void;
  savePropertyData: (data: PropertyData) => Promise<void>;
  loadPropertyData: () => Promise<PropertyData | null>;
  
  // Search and recommendations
  searchCriteria: SearchCriteria | null;
  updateSearchCriteria: (criteria: Partial<SearchCriteria>) => void;
  generateSearchCriteria: (propertyData: PropertyData) => SearchCriteria;
  
  // Market insights
  marketInsights: MarketInsights | null;
  loadMarketInsights: (location: string) => Promise<void>;
  
  // Property recommendations
  recommendations: PropertyRecommendation[];
  loadRecommendations: (criteria: SearchCriteria) => Promise<void>;
  
  // Utility functions
  getCompletionStatus: () => { completed: boolean; percentage: number; missingFields: string[] };
  getTimelineStatus: () => { daysUntilClosing: number; milestones: any[] };
  exportPropertyData: () => string;
  importPropertyData: (jsonData: string) => boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

interface PropertyProviderProps {
  children: ReactNode;
}

// Default property data structure
const defaultPropertyData: PropertyData = {
  // Basic Property Info
  address: '',
  city: '',
  state: '',
  zipCode: '',
  price: '',
  homeType: '',
  bedrooms: '',
  bathrooms: '',
  squareFootage: '',
  lotSize: '',
  yearBuilt: '',
  
  // Timeline
  targetClosingDate: '',
  moveInDate: '',
  currentLeaseEnd: '',
  
  // Must-Have Features
  mustHaveFeatures: [],
  
  // Location Preferences
  locationPriorities: [],
  maxCommuteTime: '',
  workAddress: '',
  
  // Neighborhoods
  preferredNeighborhoods: [],
  customNeighborhoods: [],
  
  // Financing
  downPaymentAmount: '',
  downPaymentPercent: '',
  preApprovalAmount: '',
  lenderName: '',
  mortgageType: '',
  
  // Contingencies
  needToSellCurrent: false,
  currentHomeAddress: '',
  standardContingencies: [],
  additionalNotes: '',
  
  // Team
  hasRealtor: false,
  realtorName: '',
  realtorEmail: '',
  realtorPhone: '',
  hasLender: false,
  hasAttorney: false,
  realtorCompany: '',
  lenderContactName: '',
  lenderEmail: '',
  lenderPhone: '',
  
  // Special Requirements
  specialRequirements: [],
  accessibilityNeeds: [],
  petRequirements: [],
  
  // Current Status
  currentStep: 'basic-info',
  completionPercentage: 0
};

// Helper function to ensure array fields are arrays
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
};

// Helper function to ensure string fields are strings
const ensureString = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value != null) {
    return String(value);
  }
  return '';
};

// Helper function to ensure boolean fields are booleans
const ensureBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
};

// Helper function to ensure number fields are numbers
const ensureNumber = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export function PropertyProvider({ children }: PropertyProviderProps) {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [recommendations, setRecommendations] = useState<PropertyRecommendation[]>([]);

  // Load property data on initialization
  useEffect(() => {
    loadPropertyData();
  }, []);

  // Auto-generate search criteria when property data changes
  useEffect(() => {
    if (propertyData) {
      try {
        const criteria = generateSearchCriteria(propertyData);
        setSearchCriteria(criteria);
      } catch (error) {
        console.error('Error generating search criteria:', error);
        // Set a safe default search criteria instead of null
        setSearchCriteria({
          priceRange: { min: 0, max: 1000000 },
          bedrooms: { min: 1 },
          bathrooms: { min: 1 },
          homeTypes: [],
          locations: [],
          mustHaveFeatures: [],
          maxCommuteTime: '',
          specialRequirements: []
        });
      }
    }
  }, [propertyData]);

  const updatePropertyData = (data: Partial<PropertyData>) => {
    setPropertyData(prev => {
      try {
        const sanitizedData = sanitizePropertyData(data);
        const updated = prev ? { ...prev, ...sanitizedData } : { ...defaultPropertyData, ...sanitizedData };
        
        // Calculate completion percentage
        const completion = calculateCompletionPercentage(updated);
        updated.completionPercentage = completion;
        
        // Save to localStorage as backup
        try {
          localStorage.setItem('handoff-property-data', JSON.stringify(updated));
        } catch (error) {
          console.warn('Failed to save property data to localStorage:', error);
        }
        
        return updated;
      } catch (error) {
        console.error('Failed to update property data:', error);
        return prev;
      }
    });
  };

  const savePropertyData = async (data: PropertyData): Promise<void> => {
    try {
      // Sanitize the data before saving
      const sanitizedData = sanitizePropertyData(data) as PropertyData;
      
      // Update state
      setPropertyData(sanitizedData);
      
      // Save to localStorage
      localStorage.setItem('handoff-property-data', JSON.stringify(sanitizedData));
      localStorage.setItem('handoff-questionnaire-complete', 'true');
      localStorage.setItem('handoff-questionnaire-responses', JSON.stringify(sanitizedData));
      
      // TODO: Save to backend when available
      console.log('Property data saved successfully:', sanitizedData);
      
      // Trigger task regeneration by dispatching custom event
      window.dispatchEvent(new CustomEvent('propertyDataUpdated', { detail: sanitizedData }));
      
    } catch (error) {
      console.error('Failed to save property data:', error);
      throw error;
    }
  };

  const loadPropertyData = async (): Promise<PropertyData | null> => {
    try {
      // Try to load from localStorage first
      const saved = localStorage.getItem('handoff-property-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizePropertyData(parsed) as PropertyData;
        setPropertyData(sanitized);
        return sanitized;
      }
      
      // Try to load from old questionnaire format for compatibility
      const oldResponses = localStorage.getItem('handoff-questionnaire-responses');
      if (oldResponses) {
        const oldData = JSON.parse(oldResponses);
        
        // Convert old format to new format if needed
        const converted = convertLegacyData(oldData);
        const sanitized = sanitizePropertyData(converted) as PropertyData;
        setPropertyData(sanitized);
        
        // Save in new format
        localStorage.setItem('handoff-property-data', JSON.stringify(sanitized));
        
        return sanitized;
      }
      
      // TODO: Load from backend when available
      
      return null;
    } catch (error) {
      console.error('Failed to load property data:', error);
      return null;
    }
  };

  const generateSearchCriteria = (data: PropertyData): SearchCriteria => {
    try {
      // Ensure data is valid
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid property data provided');
      }

      // Parse price range - safely handle undefined/null price
      const priceString = ensureString(data.price);
      const cleanedPriceString = priceString.replace(/[^0-9.]/g, '');
      const priceNum = parseFloat(cleanedPriceString) || 0;
      const priceRange = {
        min: Math.max(0, priceNum * 0.9), // 10% below target
        max: priceNum > 0 ? priceNum * 1.1 : 1000000 // 10% above target or default max
      };

      // Parse bedrooms/bathrooms - safely handle undefined/null values
      const bedroomsString = ensureString(data.bedrooms);
      const bathroomsString = ensureString(data.bathrooms);
      
      const bedroomsNum = parseInt(bedroomsString) || 1;
      const bathroomsNum = parseFloat(bathroomsString) || 1;
      
      const bedrooms = {
        min: bedroomsNum,
        max: bedroomsNum > 0 ? bedroomsNum + 1 : undefined
      };

      const bathrooms = {
        min: bathroomsNum,
        max: bathroomsNum > 0 ? bathroomsNum + 0.5 : undefined
      };

      // Safely combine location data - ensure all are arrays
      const preferredNeighborhoods = ensureArray(data.preferredNeighborhoods);
      const customNeighborhoods = ensureArray(data.customNeighborhoods);
      
      const locations = [
        ...preferredNeighborhoods,
        ...customNeighborhoods,
        ensureString(data.city),
        ensureString(data.state)
      ].filter(Boolean);

      const mustHaveFeatures = ensureArray(data.mustHaveFeatures);
      const specialRequirements = ensureArray(data.specialRequirements);
      const accessibilityNeeds = ensureArray(data.accessibilityNeeds);
      const petRequirements = ensureArray(data.petRequirements);

      return {
        priceRange,
        bedrooms,
        bathrooms,
        homeTypes: data.homeType ? [ensureString(data.homeType)] : [],
        locations,
        mustHaveFeatures,
        maxCommuteTime: ensureString(data.maxCommuteTime),
        specialRequirements: [
          ...specialRequirements,
          ...accessibilityNeeds,
          ...petRequirements
        ]
      };
    } catch (error) {
      console.error('Error generating search criteria:', error);
      // Return a safe default
      return {
        priceRange: { min: 0, max: 1000000 },
        bedrooms: { min: 1 },
        bathrooms: { min: 1 },
        homeTypes: [],
        locations: [],
        mustHaveFeatures: [],
        maxCommuteTime: '',
        specialRequirements: []
      };
    }
  };

  const updateSearchCriteria = (criteria: Partial<SearchCriteria>) => {
    setSearchCriteria(prev => prev ? { ...prev, ...criteria } : null);
  };

  const loadMarketInsights = async (location: string): Promise<void> => {
    try {
      // TODO: Implement real market data API integration
      
      // Mock data for now
      const mockInsights: MarketInsights = {
        averagePrice: 425000,
        pricePerSquareFoot: 180,
        daysOnMarket: 28,
        marketTrend: 'rising',
        competitionLevel: 'high',
        recommendedActions: [
          'Consider increasing your budget by 5-10%',
          'Get pre-approved quickly to compete',
          'Be prepared to make offers above asking price',
          'Waive minor contingencies if comfortable'
        ],
        lastUpdated: new Date().toISOString()
      };
      
      setMarketInsights(mockInsights);
    } catch (error) {
      console.error('Failed to load market insights:', error);
    }
  };

  const loadRecommendations = async (criteria: SearchCriteria): Promise<void> => {
    try {
      // TODO: Implement real property recommendation API
      
      // Mock recommendations for now
      const mockRecommendations: PropertyRecommendation[] = [
        {
          id: '1',
          address: '123 Maple Street, Sacramento, CA',
          price: 485000,
          bedrooms: 3,
          bathrooms: 2,
          squareFootage: 1850,
          matchScore: 95,
          matchReasons: ['Matches budget range', 'In preferred neighborhood', 'Has 2 of your must-have features'],
          images: []
        },
        {
          id: '2',
          address: '456 Oak Avenue, Sacramento, CA',
          price: 510000,
          bedrooms: 4,
          bathrooms: 2.5,
          squareFootage: 2100,
          matchScore: 88,
          matchReasons: ['Slightly above budget but great value', 'Excellent school district', 'Recently updated'],
          images: []
        }
      ];
      
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const getCompletionStatus = () => {
    if (!propertyData) {
      return { completed: false, percentage: 0, missingFields: ['All fields'] };
    }

    try {
      const requiredFields = [
        { field: 'address', label: 'Property Address' },
        { field: 'city', label: 'City' },
        { field: 'state', label: 'State' },
        { field: 'homeType', label: 'Property Type' },
        { field: 'bedrooms', label: 'Bedrooms' },
        { field: 'bathrooms', label: 'Bathrooms' },
        { field: 'targetClosingDate', label: 'Target Closing Date' },
        { field: 'mortgageType', label: 'Mortgage Type' },
        { field: 'downPaymentPercent', label: 'Down Payment Percentage' }
      ];

      const missingFields = requiredFields
        .filter(({ field }) => !propertyData[field as keyof PropertyData])
        .map(({ label }) => label);

      const completedRequired = requiredFields.length - missingFields.length;
      const basePercentage = (completedRequired / requiredFields.length) * 70;

      // Bonus points for optional sections
      const mustHaveFeatures = ensureArray(propertyData.mustHaveFeatures);
      const locationPriorities = ensureArray(propertyData.locationPriorities);
      const preferredNeighborhoods = ensureArray(propertyData.preferredNeighborhoods);
      const customNeighborhoods = ensureArray(propertyData.customNeighborhoods);

      const hasFeatures = mustHaveFeatures.length > 0 ? 10 : 0;
      const hasLocation = locationPriorities.length > 0 ? 10 : 0;
      const hasNeighborhoods = (preferredNeighborhoods.length > 0 || customNeighborhoods.length > 0) ? 10 : 0;

      const percentage = Math.min(100, basePercentage + hasFeatures + hasLocation + hasNeighborhoods);
      const completed = percentage >= 80; // Consider 80%+ as completed

      return { completed, percentage, missingFields };
    } catch (error) {
      console.error('Error calculating completion status:', error);
      return { completed: false, percentage: 0, missingFields: ['Error calculating completion'] };
    }
  };

  const getTimelineStatus = () => {
    if (!propertyData?.targetClosingDate) {
      return { daysUntilClosing: 0, milestones: [] };
    }

    try {
      const closingDate = new Date(propertyData.targetClosingDate);
      const today = new Date();
      const daysUntilClosing = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Generate milestone timeline
      const milestones = generateTimeline(closingDate, propertyData);

      return { daysUntilClosing, milestones };
    } catch (error) {
      console.error('Error calculating timeline status:', error);
      return { daysUntilClosing: 0, milestones: [] };
    }
  };

  const exportPropertyData = (): string => {
    if (!propertyData) return '';
    
    try {
      return JSON.stringify({
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: propertyData
      }, null, 2);
    } catch (error) {
      console.error('Error exporting property data:', error);
      return '';
    }
  };

  const importPropertyData = (jsonData: string): boolean => {
    try {
      const imported = JSON.parse(jsonData);
      
      if (imported.data && typeof imported.data === 'object') {
        const validatedData = sanitizePropertyData(imported.data);
        updatePropertyData(validatedData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import property data:', error);
      return false;
    }
  };

  // Helper functions
  const sanitizePropertyData = (data: any): Partial<PropertyData> => {
    if (!data || typeof data !== 'object') {
      return {};
    }

    try {
      const sanitized: Partial<PropertyData> = {};
      
      // String fields
      const stringFields = [
        'address', 'city', 'state', 'zipCode', 'price', 'homeType', 'bedrooms', 'bathrooms',
        'squareFootage', 'lotSize', 'yearBuilt', 'targetClosingDate', 'moveInDate', 'currentLeaseEnd',
        'maxCommuteTime', 'workAddress', 'downPaymentAmount', 'downPaymentPercent', 'preApprovalAmount',
        'lenderName', 'mortgageType', 'currentHomeAddress', 'additionalNotes', 'realtorName',
        'realtorEmail', 'realtorPhone', 'lenderContactName', 'lenderEmail', 'lenderPhone', 'currentStep'
      ];
      
      stringFields.forEach(field => {
        if (data[field] !== undefined) {
          (sanitized as any)[field] = ensureString(data[field]);
        }
      });
      
      // Array fields
      const arrayFields = [
        'mustHaveFeatures', 'locationPriorities', 'preferredNeighborhoods', 'customNeighborhoods',
        'standardContingencies', 'specialRequirements', 'accessibilityNeeds', 'petRequirements'
      ];
      
      arrayFields.forEach(field => {
        if (data[field] !== undefined) {
          (sanitized as any)[field] = ensureArray(data[field]);
        }
      });
      
      // Boolean fields
      const booleanFields = ['needToSellCurrent', 'hasRealtor', 'hasLender'];
      booleanFields.forEach(field => {
        if (data[field] !== undefined) {
          (sanitized as any)[field] = ensureBoolean(data[field]);
        }
      });
      
      // Number fields
      if (data.completionPercentage !== undefined) {
        (sanitized as any).completionPercentage = ensureNumber(data.completionPercentage);
      }
      
      return sanitized;
    } catch (error) {
      console.error('Error sanitizing property data:', error);
      return {};
    }
  };

  const calculateCompletionPercentage = (data: PropertyData): number => {
    try {
      const requiredFields = ['address', 'city', 'state', 'homeType', 'bedrooms', 'bathrooms', 'targetClosingDate', 'mortgageType', 'downPaymentPercent'];
      const completedRequired = requiredFields.filter(field => data[field as keyof PropertyData]).length;
      
      const mustHaveFeatures = ensureArray(data.mustHaveFeatures);
      const locationPriorities = ensureArray(data.locationPriorities);
      const preferredNeighborhoods = ensureArray(data.preferredNeighborhoods);
      const customNeighborhoods = ensureArray(data.customNeighborhoods);
      
      const hasFeatures = mustHaveFeatures.length > 0;
      const hasLocation = locationPriorities.length > 0;
      const hasNeighborhoods = preferredNeighborhoods.length > 0 || customNeighborhoods.length > 0;
      
      const baseCompletion = (completedRequired / requiredFields.length) * 70;
      const featureBonus = hasFeatures ? 10 : 0;
      const locationBonus = hasLocation ? 10 : 0;
      const neighborhoodBonus = hasNeighborhoods ? 10 : 0;
      
      return Math.min(100, baseCompletion + featureBonus + locationBonus + neighborhoodBonus);
    } catch (error) {
      console.error('Error calculating completion percentage:', error);
      return 0;
    }
  };

  const convertLegacyData = (oldData: any): Partial<PropertyData> => {
    try {
      // Convert old questionnaire format to new PropertyData format
      const converted: Partial<PropertyData> = {
        address: ensureString(oldData.propertyAddress || oldData.address),
        city: ensureString(oldData.city),
        state: ensureString(oldData.state),
        homeType: ensureString(oldData.homeType),
        bedrooms: ensureString(oldData.bedrooms),
        bathrooms: ensureString(oldData.bathrooms),
        mustHaveFeatures: ensureArray(oldData.mustHaves || oldData.mustHaveFeatures),
        locationPriorities: ensureArray(oldData.locationPriorities),
        preferredNeighborhoods: ensureArray(oldData.neighborhoods || oldData.preferredNeighborhoods),
        customNeighborhoods: ensureArray(oldData.customNeighborhoods),
        realtorName: ensureString(oldData.agentName || oldData.realtorName),
        realtorEmail: ensureString(oldData.agentEmail || oldData.realtorEmail),
        realtorPhone: ensureString(oldData.agentPhone || oldData.realtorPhone),
        hasRealtor: ensureBoolean(oldData.agentName || oldData.realtorName || oldData.hasRealtor),
        specialRequirements: ensureArray(oldData.specialRequirements),
        accessibilityNeeds: ensureArray(oldData.accessibilityNeeds),
        petRequirements: ensureArray(oldData.petRequirements),
        standardContingencies: ensureArray(oldData.standardContingencies)
      };

      // Copy other compatible fields
      Object.keys(oldData).forEach(key => {
        if (key in defaultPropertyData && !(key in converted)) {
          const value = (oldData as any)[key];
          if (value !== undefined && value !== null) {
            const defaultVal = (defaultPropertyData as any)[key];
            if (Array.isArray(defaultVal)) {
              (converted as any)[key] = ensureArray(value);
            } else if (typeof defaultVal === 'boolean') {
              (converted as any)[key] = ensureBoolean(value);
            } else if (typeof defaultVal === 'string') {
              (converted as any)[key] = ensureString(value);
            } else if (typeof defaultVal === 'number') {
              (converted as any)[key] = ensureNumber(value);
            }
          }
        }
      });

      return converted;
    } catch (error) {
      console.error('Error converting legacy data:', error);
      return {};
    }
  };

  const generateTimeline = (closingDate: Date, data: PropertyData) => {
    try {
      type Milestone = {
        date: string;
        title: string;
        description: string;
        category: string;
        completed: boolean;
        daysFromNow: number;
      };
      const milestones: Milestone[] = [];
      const today = new Date();
      
      // Work backwards from closing date
      const addMilestone = (daysFromClosing: number, title: string, description: string, category: string) => {
        const date = new Date(closingDate);
        date.setDate(date.getDate() - daysFromClosing);
        
        milestones.push({
          date: date.toISOString(),
          title,
          description,
          category,
          completed: date <= today,
          daysFromNow: Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        });
      };

      // Generate realistic timeline
      addMilestone(30, 'Pre-approval Complete', 'Secure mortgage pre-approval', 'financing');
      addMilestone(25, 'Home Search Active', 'Begin actively searching for properties', 'search');
      addMilestone(20, 'Offer Submitted', 'Submit offer on chosen property', 'offer');
      addMilestone(18, 'Contract Accepted', 'Purchase agreement signed', 'contract');
      addMilestone(15, 'Home Inspection', 'Professional home inspection completed', 'inspection');
      addMilestone(12, 'Appraisal Ordered', 'Property appraisal scheduled', 'financing');
      addMilestone(10, 'Inspection Negotiations', 'Address any inspection issues', 'inspection');
      addMilestone(7, 'Final Loan Approval', 'Mortgage underwriting complete', 'financing');
      addMilestone(3, 'Final Walkthrough', 'Final property inspection', 'closing');
      addMilestone(1, 'Closing Preparation', 'Review closing documents', 'closing');
      addMilestone(0, 'Closing Day', 'Close on your new home!', 'closing');

      return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error generating timeline:', error);
      return [];
    }
  };

  const contextValue: PropertyContextType = {
    propertyData,
    updatePropertyData,
    savePropertyData,
    loadPropertyData,
    searchCriteria,
    updateSearchCriteria,
    generateSearchCriteria,
    marketInsights,
    loadMarketInsights,
    recommendations,
    loadRecommendations,
    getCompletionStatus,
    getTimelineStatus,
    exportPropertyData,
    importPropertyData
  };

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  );
}

export function usePropertyContext(): PropertyContextType {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
}