import React, { useState, useEffect } from 'react';
import { PropertySetupFlow } from './PropertySetupFlow';
import PropertySummary from './PropertySummary';
import { useIsMobile } from './ui/use-mobile';
import AdminShell from './layout/AdminShell';

interface PropertyDetailsProps {
  userProfile?: any;
  setupData?: any;
  onNavigate?: (page: string) => void;
}

export function PropertyDetails({ userProfile, setupData, onNavigate }: PropertyDetailsProps) {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showCompletionNotice, setShowCompletionNotice] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const isMobile = useIsMobile();

  // Check if setup is complete
  useEffect(() => {
    const checkSetupStatus = () => {
      try {
        // Check if we're in edit mode
        const editMode = localStorage.getItem('handoff-setup-edit-mode') === 'true';
        setIsEditMode(editMode);

        // If in edit mode, always show the setup flow
        if (editMode) {
          setIsSetupComplete(false);
          return;
        }

        const hasInitialSetup = localStorage.getItem('handoff-initial-setup-complete') === 'true';
        const isQuestionnaireComplete = localStorage.getItem('handoff-questionnaire-complete') === 'true';
        const hasScreeningData = localStorage.getItem('handoff-screening-data');
        
        // Consider setup complete if they have completed both screening and setup
        if (hasInitialSetup && isQuestionnaireComplete) {
          setIsSetupComplete(true);
          return;
        }
        
        // Also check if they completed the contract flow with screening data
        if (hasScreeningData) {
          try {
            const screeningData = JSON.parse(hasScreeningData);
            // If they have a property address and are under contract with signed contract, consider setup complete
            if (screeningData.buyingStage === 'under-contract' && 
                screeningData.contractSigned && 
                screeningData.propertyAddress && 
                hasInitialSetup) {
              setIsSetupComplete(true);
              return;
            }
            // If they chose to focus on a property (not search), consider setup complete
            if (screeningData.nextAction === 'focus-property' && 
                screeningData.propertyAddress && 
                hasInitialSetup) {
              setIsSetupComplete(true);
              return;
            }
          } catch (error) {
            console.warn('Error parsing screening data:', error);
          }
        }
        
        setIsSetupComplete(false);
      } catch (error) {
        console.warn('Error checking setup status:', error);
        setIsSetupComplete(false);
      }
    };

    checkSetupStatus();
  }, []);

  const handleSetupComplete = () => {
    // Clear edit mode flag when setup is completed
    localStorage.removeItem('handoff-setup-edit-mode');
    setIsEditMode(false);
    setIsSetupComplete(true);
    
    // Only show completion notice if we're not in edit mode
    if (!isEditMode) {
      setShowCompletionNotice(true);
      
      // Hide completion notice after 3 seconds
      setTimeout(() => {
        setShowCompletionNotice(false);
      }, 3000);
    }
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will clear all your setup data and you\'ll need to begin again.')) {
      // Clear all setup data to start fresh
      localStorage.removeItem('handoff-initial-setup-complete');
      localStorage.removeItem('handoff-questionnaire-complete');
      localStorage.removeItem('handoff-questionnaire-responses');
      localStorage.removeItem('handoff-screening-data');
      localStorage.removeItem('handoff-property-data');
      localStorage.removeItem('handoff-initial-setup-data');
      localStorage.removeItem('handoff-setup-edit-mode');
      
      setIsSetupComplete(false);
      setShowCompletionNotice(false);
      setIsEditMode(false);
    }
  };

  const handleEditSetup = () => {
    // Store a flag to indicate we're editing (not setting up for the first time)
    localStorage.setItem('handoff-setup-edit-mode', 'true');
    setIsEditMode(true);
    setIsSetupComplete(false);
  };

  const handleExitEditMode = () => {
    // Clear edit mode and check setup status again
    localStorage.removeItem('handoff-setup-edit-mode');
    setIsEditMode(false);
    
    // Re-check setup status
    const hasInitialSetup = localStorage.getItem('handoff-initial-setup-complete') === 'true';
    const isQuestionnaireComplete = localStorage.getItem('handoff-questionnaire-complete') === 'true';
    
    if (hasInitialSetup && isQuestionnaireComplete) {
      setIsSetupComplete(true);
    }
  };

  // Show completion notice overlay (only if not in edit mode)
  if (showCompletionNotice && !isEditMode) {
    return null;
  }

  // Show setup flow if not complete or in edit mode
  if (!isSetupComplete || isEditMode) {
    return (
      <PropertySetupFlow 
        onComplete={handleSetupComplete}
        isEditMode={isEditMode}
        onExitEditMode={handleExitEditMode}
      />
    );
  }

  // Show property summary if setup is complete
  return (
    <AdminShell>
      <PropertySummary 
        userProfile={userProfile}
        setupData={setupData}
        onNavigate={onNavigate}
        onStartOver={handleStartOver}
        onEditSetup={handleEditSetup}
      />
    </AdminShell>
  );
}