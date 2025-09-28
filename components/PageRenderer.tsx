import React, { Suspense } from 'react';
import Dashboard from './Dashboard';
import DashboardHome from './DashboardHome';

// Lazy load other components for better performance
const Tasks = React.lazy(() => import('./Tasks'));
const Documents = React.lazy(() => import('./Documents'));
const Resources = React.lazy(() => import('./Resources'));
const Settings = React.lazy(() => import('./Settings'));
const ChecklistCalendarPage = React.lazy(() => import('./checklist/ChecklistCalendarPage').then(m => ({ default: m.default })));

// Property Search page with tabs (Home Search, ATTOM Summary, Onboarding)
const PropertySearchTabs = React.lazy(() => import('./PropertySearchTabs'));

// Keep ATTOM API Config tool
const AttomApiConfigurationTool = React.lazy(async () => {
  const module = await import('./AttomApiConfigurationTool');
  return { default: module.AttomApiConfigurationTool };
});

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

import type { PageType } from '../hooks/useNavigation';

interface PageRendererProps {
  currentPage: string;
  onNavigate: (page: PageType) => void;
  userProfile?: any;
  setupData?: any;
  onSignOut: () => void;
  isPropertySetupComplete: boolean;
}

export function PageRenderer({ 
  currentPage, 
  onNavigate, 
  userProfile, 
  setupData, 
  onSignOut,
  isPropertySetupComplete 
}: PageRendererProps) {
  // Adapter to support components still expecting string navigation params
  const navigateString = React.useCallback((page: string) => onNavigate(page as PageType), [onNavigate]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'overview':
        return <Dashboard setupData={setupData} />;
      
      case 'property':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PropertySearchTabs />
          </Suspense>
        );
      
      case 'tasks':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Tasks onNavigate={navigateString} />
          </Suspense>
        );
      
      case 'documents':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Documents />
          </Suspense>
        );
      
      case 'calendar':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ChecklistCalendarPage />
          </Suspense>
        );
      
      case 'resources':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Resources />
          </Suspense>
        );
      
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Settings
              userProfile={userProfile}
              setupData={setupData}
              onSignOut={onSignOut}
            />
          </Suspense>
        );

      case 'attom-api-config':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AttomApiConfigurationTool />
          </Suspense>
        );

      default:
        return <Dashboard setupData={setupData} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderPage()}
    </div>
  );
}
