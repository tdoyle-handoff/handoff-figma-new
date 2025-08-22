import React, { Suspense } from 'react';
import { useIsMobile } from './components/ui/use-mobile';
import { TaskProvider } from './components/TaskContext';
import { PropertyProvider } from './components/PropertyContext';
import { InspectionProvider } from './components/InspectionContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthLoader } from './components/LoadingComponents';
import { PageRenderer } from './components/PageRenderer';
const AppNotifications = React.lazy(() => import('./components/AppNotifications').then(m => ({ default: m.AppNotifications })));
const DebugModeRenderer = React.lazy(() => import('./components/DebugModeRenderer').then(m => ({ default: m.DebugModeRenderer })));
import { withSafeInitialization } from './utils/appInitializer';
import { clearPersistedUserDisplayInfo } from './utils/userHelpers';

// Authentication and setup components
// Auth and setup (lazy-loaded to reduce initial bundle)
const OnboardingWizard = React.lazy(() => import('./components/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const SetupWizard = React.lazy(() => import('./components/SetupWizard').then(m => ({ default: m.SetupWizard })));
const PasswordReset = React.lazy(() => import('./components/PasswordReset').then(m => ({ default: m.PasswordReset })));
const SignIn = React.lazy(() => import('./components/SignIn').then(m => ({ default: m.SignIn })));

// Layout components (lazy-loaded)
const DashboardLayout = React.lazy(() => import('./components/DashboardLayout').then(m => ({ default: m.default })));
const MobileLayout = React.lazy(() => import('./components/MobileLayout').then(m => ({ default: m.default })));

// Hooks
import { useAuth } from './hooks/useAuth';
import { useNavigation } from './hooks/useNavigation';
import { usePasswordReset } from './hooks/usePasswordReset';
import { useAppEffects } from './hooks/useAppEffects';

// Utilities
import { getUrlModes } from './utils/urlModes';
import { isPropertySetupComplete } from './utils/setupHelpers';
import { getUserDisplayInfo, getAuthStatusMessage } from './utils/userHelpers';

// Error Recovery Component
function AppErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  const isMapError = error.message && error.message.includes('Map is not a constructor');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">
          {isMapError ? '🗺️' : '⚠️'}
        </div>
        <h2 className="text-xl font-semibold mb-2">
          {isMapError ? 'Browser Compatibility Issue' : 'Application Error'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {isMapError 
            ? 'Your browser may not support required features. Try updating your browser or clearing your cache.'
            : 'Something went wrong. This may be a temporary issue.'
          }
        </p>
        
        {isMapError && (
          <div className="text-sm text-left bg-muted p-3 rounded mb-4">
            <p><strong>Troubleshooting:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Clear your browser cache and cookies</li>
              <li>Try using Chrome, Firefox, or Safari</li>
              <li>Disable browser extensions temporarily</li>
              <li>Check if JavaScript is enabled</li>
            </ul>
          </div>
        )}
        
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/90 transition-colors"
          >
            Reload Page
          </button>
          {isMapError && (
            <button
              onClick={() => {
                // Clear all localStorage and reload
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                } catch (error) {
                  console.warn('Could not clear storage:', error);
                }
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors text-sm"
            >
              Reset All Data & Reload
            </button>
          )}
        </div>
        
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Technical Details
          </summary>
          <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
            {error.toString()}
            {error.stack && '\n\n' + error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
}

function AppCore() {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  // This ensures the same number of hooks are called on every render
  const isMobile = useIsMobile();
  const auth = useAuth();
  const navigation = useNavigation();
  const passwordReset = usePasswordReset();
  
  // FIXED: Get URL modes and other derived state AFTER core hooks but BEFORE any conditional rendering
  const modes = React.useMemo(() => {
    try {
      return getUrlModes();
    } catch (error) {
      console.warn('Error getting URL modes, using defaults:', error);
      // FIXED: Include ALL properties from UrlModes interface in fallback
      return {
        isMappingManager: false,
        isApiKeyManager: false,
        isPathReference: false,
        isDeveloperMode: false,
        isDebugMode: false,
        isPropertySetupMode: false,
        isOfflineMode: false,
        isGuestMode: false,
        isPasswordResetMode: false,
        isApiConfigEditor: false,
        isFieldMappingDebugger: false,
      };
    }
  }, []);
  
  // Get user display information before any conditional rendering with error handling
  const setupComplete = React.useMemo(() => {
    try {
      return isPropertySetupComplete();
    } catch (error) {
      console.warn('Error checking setup completion:', error);
      return false;
    }
  }, []);
  
  const userDisplayInfo = React.useMemo(() => {
    try {
      return getUserDisplayInfo(auth.isGuestMode, auth.isOfflineMode, auth.setupData, auth.userProfile);
    } catch (error) {
      console.warn('Error getting user display info, using fallback:', error);
      return {
        buyerName: 'User',
        buyerEmail: 'user@handoff.demo',
        displayBadge: auth.isGuestMode ? 'Guest Mode' : null
      };
    }
  }, [auth.isGuestMode, auth.isOfflineMode, auth.setupData, auth.userProfile]);
  
  const authStatusMessage = React.useMemo(() => {
    try {
      return getAuthStatusMessage(auth.isGuestMode, auth.userProfile);
    } catch (error) {
      console.warn('Error getting auth status message:', error);
      return null;
    }
  }, [auth.isGuestMode, auth.userProfile]);

  // FIXED: Move all useCallback hooks here, BEFORE any conditional logic
  // Handle sign out with navigation cleanup - wrapped in try/catch
  const handleSignOut = React.useCallback(() => {
    try {
      navigation.clearPersistedNavigation();
      // FIXED: Clear persisted user display info on manual sign out
      clearPersistedUserDisplayInfo();
      auth.handleSignOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force reload as fallback
      window.location.href = '/';
    }
  }, [navigation, auth]);

  const handleNavigateToDevTools = React.useCallback(() => {
    try {
      navigation.navigateTo('dev-tools');
    } catch (error) {
      console.error('Error navigating to dev tools:', error);
    }
  }, [navigation]);

  // Handle onboarding completion
  const handleOnboardingComplete = React.useCallback((onboardingData: any) => {
    try {
      console.log('Onboarding completed with data:', onboardingData);
      
      // Transform onboarding data to auth setup data format
      const setupData = {
        buyerName: onboardingData.buyerName,
        buyerEmail: onboardingData.buyerEmail,
        propertyAddress: onboardingData.propertyAddress,
        propertyType: onboardingData.propertyType,
        priceRange: onboardingData.priceRange,
        financingType: onboardingData.financingType,
        purchaseTimeline: onboardingData.purchaseTimeline,
        legalRequirements: onboardingData.legalRequirements
      };

      // Continue as guest with onboarding data
      auth.continueAsGuest(setupData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [auth]);

  const handleOnboardingSkip = React.useCallback(() => {
    try {
      // Continue as guest with minimal data
      auth.continueAsGuest({
        buyerName: 'Guest User',
        buyerEmail: 'guest@handoff.demo'
      });
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  }, [auth]);

  // FIXED: Check for debug modes first with proper error handling and component usage
  const debugModeComponent = React.useMemo(() => {
    try {
      console.log('🔧 Checking debug modes:', modes);
      
      // Check if any debug mode is active
      const hasDebugMode = modes.isFieldMappingDebugger || 
                          modes.isApiKeyManager || 
                          modes.isPathReference || 
                          modes.isMappingManager || 
                          modes.isApiConfigEditor;
      
      if (hasDebugMode) {
        return (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"/>}>
            <DebugModeRenderer modes={modes} />
          </Suspense>
        );
      }
      
      return null;
    } catch (error) {
      console.warn('Error rendering debug mode:', error);
      return null;
    }
  }, [modes]);

  // Use custom hook for all effects with error boundary
  useAppEffects({
    isMobile,
    auth,
    navigation,
    passwordReset,
    modes,
    userDisplayInfo,
    setupComplete
  });

  // NOW WE CAN SAFELY DO CONDITIONAL RENDERING - ALL HOOKS HAVE BEEN CALLED

  if (debugModeComponent) {
    console.log('🔧 Rendering debug mode component');
    return (
      <ErrorBoundary fallback={AppErrorFallback}>
        {debugModeComponent}
      </ErrorBoundary>
    );
  }

  // Show password reset page
  if (passwordReset.showPasswordReset && passwordReset.resetToken) {
      return (
        <ErrorBoundary fallback={AppErrorFallback}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"/>}>
            <div className={`setup-wizard-container ${isMobile ? 'mobile-device h-full' : 'h-full'}`}>
              <PasswordReset
                resetToken={passwordReset.resetToken}
                onSuccess={passwordReset.handlePasswordResetSuccess}
                onBackToLogin={passwordReset.handleBackToLogin}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      );
  }

  // Show loading state
  if (auth.isLoading) {
    return (
      <ErrorBoundary fallback={AppErrorFallback}>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <AuthLoader />
        </div>
      </ErrorBoundary>
    );
  }

  // Show authentication entry point for unauthenticated users
  if (!auth.isAuthenticated) {
    const params = new URLSearchParams(window.location.search)
    const path = window.location.pathname || ''
    const hash = window.location.hash || ''

    // Make SignIn the default. Only show onboarding explicitly if requested.
    const showOnboarding = params.has('onboarding') || path.endsWith('/onboarding') || hash.includes('onboarding')

    // Check if user wants traditional auth flow (login-fix mode or has auth error)
    const showTraditionalAuth = modes.isDeveloperMode || 
                               auth.authError || 
                               window.location.search.includes('login-fix') ||
                               window.location.search.includes('auth=true');

    if (showOnboarding) {
      return (
        <ErrorBoundary fallback={AppErrorFallback}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"/>}>
            <div className={`setup-wizard-container ${isMobile ? 'mobile-device h-full' : 'h-full'}`}>
              <OnboardingWizard 
                onComplete={handleOnboardingComplete}
                onSkip={handleOnboardingSkip}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      );
    }

    if (showTraditionalAuth) {
      return (
        <ErrorBoundary fallback={AppErrorFallback}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"/>}>
            <div className={`setup-wizard-container ${isMobile ? 'mobile-device h-full' : 'h-full'}`}>
              <SetupWizard 
                onComplete={auth.handleAuthComplete}
                onGoogleSignIn={auth.handleGoogleSignIn}
                authError={auth.authError}
                isLoading={auth.isLoading}
                continueAsGuest={auth.continueAsGuest}
                clearAuthError={auth.clearAuthError}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      );
    }

    // Default: Sign In page (Google, email/password when configured, or Guest)
    return (
      <ErrorBoundary fallback={AppErrorFallback}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"/>}>
          <SignIn />
        </Suspense>
      </ErrorBoundary>
    )
  }

  // Render main app with comprehensive error boundaries
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <PropertyProvider>
        <TaskProvider userProfile={auth.userProfile}>
          <InspectionProvider>
          <Suspense fallback={null}>
            <AppNotifications
              modes={modes}
              authStatusMessage={authStatusMessage}
              isGuestMode={auth.isGuestMode}
              isLoading={auth.isLoading}
              onSignOut={handleSignOut}
              onNavigateToDevTools={handleNavigateToDevTools}
            />
          </Suspense>

          {isMobile ? (
            <div className="mobile-device h-full min-h-screen bg-background relative">
              <ErrorBoundary fallback={AppErrorFallback}>
                <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
                  <MobileLayout 
                    currentPage={navigation.currentPage} 
                    onPageChange={navigation.navigateTo}
                    setupData={userDisplayInfo}
                    onSignOut={handleSignOut}
                    isPropertySetupComplete={setupComplete}
                  >
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  }>
                    <PageRenderer
                      currentPage={navigation.currentPage}
                      onNavigate={navigation.navigateTo}
                      userProfile={auth.userProfile}
                      setupData={userDisplayInfo}
                      onSignOut={handleSignOut}
                      isPropertySetupComplete={setupComplete}
                    />
                  </Suspense>
                  </MobileLayout>
                </Suspense>
              </ErrorBoundary>
            </div>
          ) : (
            <div className="size-full relative">
              <ErrorBoundary fallback={AppErrorFallback}>
                <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <DashboardLayout 
                    currentPage={navigation.currentPage} 
                    onPageChange={navigation.navigateTo}
                    setupData={userDisplayInfo}
                    onSignOut={handleSignOut}
                    isPropertySetupComplete={setupComplete}
                  >
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }>
                    <PageRenderer
                      currentPage={navigation.currentPage}
                      onNavigate={navigation.navigateTo}
                      userProfile={auth.userProfile}
                      setupData={userDisplayInfo}
                      onSignOut={handleSignOut}
                      isPropertySetupComplete={setupComplete}
                    />
                  </Suspense>
                  </DashboardLayout>
                </Suspense>
              </ErrorBoundary>
            </div>
          )}
          </InspectionProvider>
        </TaskProvider>
      </PropertyProvider>
    </ErrorBoundary>
  );
}

// Export the safely initialized app
const App = withSafeInitialization(AppCore);
export default App;