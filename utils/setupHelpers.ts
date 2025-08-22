export const isPropertySetupComplete = (): boolean => {
  try {
    // Check if both screening and initial setup are complete
    const hasInitialSetup = localStorage.getItem('handoff-initial-setup-complete') === 'true';
    const isQuestionnaireComplete = localStorage.getItem('handoff-questionnaire-complete') === 'true';
    const hasScreeningData = localStorage.getItem('handoff-screening-data');
    
    // Primary completion check: both setup phases completed
    if (hasInitialSetup && isQuestionnaireComplete) {
      return true;
    }
    
    // Legacy compatibility: old questionnaire completion
    const hasLegacyResponses = localStorage.getItem('handoff-questionnaire-responses');
    if (isQuestionnaireComplete && hasLegacyResponses) {
      return true;
    }
    
    // Advanced completion check: contract flow with screening data
    if (hasScreeningData) {
      try {
        const screeningData = JSON.parse(hasScreeningData);
        
        // If they have a property address and are under contract with signed contract
        if (screeningData.buyingStage === 'under-contract' && 
            screeningData.contractSigned && 
            screeningData.propertyAddress && 
            hasInitialSetup) {
          return true;
        }
        
        // If they chose to focus on a property (not search)
        if (screeningData.nextAction === 'focus-property' && 
            screeningData.propertyAddress && 
            hasInitialSetup) {
          return true;
        }
        
        // If they completed both screening and setup but questionnaire flag is missing
        if (hasInitialSetup && screeningData.buyingStage && screeningData.experienceLevel) {
          // Auto-fix: mark questionnaire as complete
          localStorage.setItem('handoff-questionnaire-complete', 'true');
          return true;
        }
      } catch (error) {
        console.warn('Error parsing screening data:', error);
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Error checking property setup completion:', error);
    return false;
  }
};

export const canAccessPage = (page: string): boolean => {
  const setupComplete = isPropertySetupComplete();
  
  // Always allow access to property setup page
  if (page === 'property') {
    return true;
  }
  
  // For other pages, user must have completed property setup
  return setupComplete;
};

export const getSavedPageFromStorage = (): string | null => {
  try {
    return localStorage.getItem('handoff-current-page');
  } catch {
    return null;
  }
};