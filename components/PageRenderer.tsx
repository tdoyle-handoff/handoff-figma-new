import React, { Suspense } from 'react';
import Dashboard from './Dashboard';

// Lazy load other components for better performance
const Tasks = React.lazy(() => import('./Tasks'));
const Documents = React.lazy(() => import('./Documents'));
const OfferBuilder = React.lazy(() => import('./OfferBuilder'));
const Resources = React.lazy(() => import('./Resources'));
const MyTeam = React.lazy(() => import('./MyTeam'));

const Legal = React.lazy(() => import('./Legal'));
const Inspections = React.lazy(() => import('./Inspections'));
const Insurance = React.lazy(() => import('./Insurance'));
const Communications = React.lazy(() => import('./Communications'));
const Settings = React.lazy(() => import('./Settings'));
const VendorMarketplace = React.lazy(() => import('./VendorMarketplace'));

// Property Search panel (SearchPanel) shim
const PropertySearchPanel = React.lazy(() => import('./search-panel-impl'));

// MLS Demo components - these are named exports, so we need to import them correctly
const AddressValidationDemo = React.lazy(async () => {
  const module = await import('./AddressValidationDemo');
  return { default: module.AddressValidationDemo };
});
const MLSIntegrationDemo = React.lazy(async () => {
  const module = await import('./MLSIntegrationDemo');
  return { default: module.MLSIntegrationDemo };
});
const DevTools = React.lazy(async () => {
  const module = await import('./DevTools');
  return { default: module.DevTools };
});
const PropertyAnalysisReport = React.lazy(async () => {
  const module = await import('./PropertyAnalysisReport');
  return { default: module.PropertyAnalysisReport };
});
const ComprehensivePropertyAnalysis = React.lazy(async () => {
  const module = await import('./ComprehensivePropertyAnalysis');
  return { default: module.ComprehensivePropertyAnalysis };
});
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
      case 'overview':
        return <Dashboard setupData={setupData} />;
      
      case 'property':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PropertySearchPanel />
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
      
      // Temporary route to access Offer Builder until it has its own nav item
      case 'offer-builder':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <OfferBuilder />
          </Suspense>
        );
      
      case 'resources':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Resources />
          </Suspense>
        );
      
      case 'team':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MyTeam />
          </Suspense>
        );
      

      
      case 'legal':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorMarketplace defaultTab="attorneys" />
          </Suspense>
        );
      
      case 'inspections':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorMarketplace defaultTab="inspectors" />
          </Suspense>
        );
      
      case 'insurance':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorMarketplace defaultTab="insurance-providers" />
          </Suspense>
        );
      
      case 'vendor-marketplace':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorMarketplace />
          </Suspense>
        );
      
      case 'communications':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Communications />
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
      
      // Demo pages for development and testing
      case 'address-demo':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AddressValidationDemo />
          </Suspense>
        );
      
      case 'mls-demo':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MLSIntegrationDemo />
          </Suspense>
        );
      
      case 'dev-tools':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <DevTools onNavigate={navigateString} />
          </Suspense>
        );
      
      case 'property-report':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PropertyAnalysisReport onClose={() => onNavigate('property')} />
          </Suspense>
        );
      
      case 'comprehensive-analysis':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ComprehensivePropertyAnalysis onNavigate={navigateString} />
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
