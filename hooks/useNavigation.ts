import { useState, useCallback, useMemo, useEffect } from 'react';

export type PageType = 
  | 'overview' 
  | 'tasks' 
  | 'property' 
  | 'legal' 
  | 'financing' 
  | 'inspections' 
  | 'insurance' 
  | 'vendor-marketplace'
  | 'documents' 
  | 'offer-builder'
  | 'resources' 
  | 'team' 
  | 'communications' 
  | 'mortgage-calculator' 
  | 'closing-calculator' 
  | 'settings'
  | 'dev-tools';

interface NavigationState {
  currentPage: PageType;
  previousPage: PageType | null;
}

interface NavigationActions {
  navigateTo: (page: PageType) => void;
  goBack: () => void;
  getPageTitle: (page: PageType) => string;
  clearPersistedNavigation: () => void;
}

const STORAGE_KEY = 'handoff-current-page';
const PREVIOUS_PAGE_KEY = 'handoff-previous-page';

// Helper function to get saved page from localStorage
const getSavedPage = (): PageType | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidPageType(saved)) {
      return saved as PageType;
    }
  } catch (error) {
    console.warn('Error reading saved page from localStorage:', error);
  }
  return null;
};

// Helper function to get saved previous page from localStorage
const getSavedPreviousPage = (): PageType | null => {
  try {
    const saved = localStorage.getItem(PREVIOUS_PAGE_KEY);
    if (saved && isValidPageType(saved)) {
      return saved as PageType;
    }
  } catch (error) {
    console.warn('Error reading saved previous page from localStorage:', error);
  }
  return null;
};

// Helper function to validate if a string is a valid PageType
const isValidPageType = (page: string): page is PageType => {
  const validPages: PageType[] = [
    'overview', 'tasks', 'property', 'legal', 'financing', 
    'inspections', 'insurance', 'vendor-marketplace', 'documents', 'offer-builder', 'resources', 
    'team', 'communications', 'mortgage-calculator', 
    'closing-calculator', 'settings', 'dev-tools'
  ];
  return validPages.includes(page as PageType);
};

// Helper function to save page to localStorage
const savePage = (page: PageType) => {
  try {
    localStorage.setItem(STORAGE_KEY, page);
  } catch (error) {
    console.warn('Error saving page to localStorage:', error);
  }
};

// Helper function to save previous page to localStorage
const savePreviousPage = (page: PageType | null) => {
  try {
    if (page) {
      localStorage.setItem(PREVIOUS_PAGE_KEY, page);
    } else {
      localStorage.removeItem(PREVIOUS_PAGE_KEY);
    }
  } catch (error) {
    console.warn('Error saving previous page to localStorage:', error);
  }
};

export function useNavigation(): NavigationState & NavigationActions {
  // Initialize state with saved page or default to 'property'
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    return getSavedPage() || 'property';
  });
  
  const [previousPage, setPreviousPage] = useState<PageType | null>(() => {
    return getSavedPreviousPage();
  });
  const pageTitles = useMemo(() => ({
    'overview': 'Dashboard - Handoff',
    'tasks': 'Tasks - Handoff',
    'property': 'Property Search - Handoff',
    'legal': 'Legal - Handoff',
    'financing': 'Financing - Handoff',
    'inspections': 'Inspections - Handoff',
    'insurance': 'Insurance - Handoff',
    'vendor-marketplace': 'Vendor Marketplace - Handoff',
'documents': 'Offer & Document Hub - Handoff',
    'offer-builder': 'Offer Builder - Handoff',
    'resources': 'Education Hub - Handoff',
    'team': 'My Team - Handoff',
    'communications': 'Communication Suite - Handoff',
    'mortgage-calculator': 'Mortgage Calculator - Handoff',
    'closing-calculator': 'Closing Calculator - Handoff',
    'settings': 'Settings - Handoff',
    'dev-tools': 'Developer Tools - Handoff',
  } as const), []);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    savePage(currentPage);
    
    // Update document title
    document.title = pageTitles[currentPage] || 'Handoff - Real Estate Transaction Management';
  }, [currentPage, pageTitles]);

  // Save previous page to localStorage whenever it changes
  useEffect(() => {
    savePreviousPage(previousPage);
  }, [previousPage]);

  const navigateTo = useCallback((page: PageType) => {
    if (currentPage !== page) {
      setPreviousPage(currentPage);
      setCurrentPage(page);
      
      console.log(`Navigation: ${currentPage} -> ${page}`);
    }
  }, [currentPage]);

  const goBack = useCallback(() => {
    if (previousPage) {
      const targetPage = previousPage;
      setCurrentPage(targetPage);
      setPreviousPage(null);
      
      console.log(`Navigation: Back to ${targetPage}`);
    }
  }, [previousPage]);

  const getPageTitle = useCallback((page: PageType) => {
    return pageTitles[page] || 'Handoff - Real Estate Transaction Management';
  }, [pageTitles]);

  const clearPersistedNavigation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PREVIOUS_PAGE_KEY);
      console.log('Cleared persisted navigation state');
    } catch (error) {
      console.warn('Error clearing persisted navigation:', error);
    }
  }, []);

  return {
    currentPage,
    previousPage,
    navigateTo,
    goBack,
    getPageTitle,
    clearPersistedNavigation,
  };
}