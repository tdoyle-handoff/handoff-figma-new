import { useEffect } from 'react';
import { FAVICON_SVG, VIEWPORT_META_CONTENT, APP_TITLES } from '../utils/constants';
import { isPropertySetupComplete, canAccessPage, getSavedPageFromStorage } from '../utils/setupHelpers';
import { persistUserDisplayInfo, clearPersistedUserDisplayInfo } from '../utils/userHelpers';
import { logUrlModes } from '../utils/urlModes';
import type { UrlModes } from '../utils/urlModes';

interface UseAppEffectsProps {
  isMobile: boolean;
  auth: any;
  navigation: any;
  passwordReset: any;
  modes: UrlModes;
  userDisplayInfo: any;
  setupComplete: boolean;
}

export function useAppEffects({
  isMobile,
  auth,
  navigation,
  passwordReset,
  modes,
  userDisplayInfo,
  setupComplete
}: UseAppEffectsProps) {
  // FIXED: Debug logging for URL parameters with proper import and error handling
  useEffect(() => {
    try {
      logUrlModes(modes);
    } catch (error) {
      console.warn('Error logging URL modes:', error);
    }
  }, [modes]);

  // Clean up localStorage for guest mode on first load
  useEffect(() => {
    if (auth.isGuestMode && auth.isAuthenticated) {
      const hasInitialSetup = localStorage.getItem('handoff-initial-setup-complete');
      if (!hasInitialSetup) {
        localStorage.removeItem('handoff-questionnaire-complete');
        localStorage.removeItem('handoff-questionnaire-responses');
        localStorage.removeItem('handoff-screening-data');
        localStorage.removeItem('handoff-property-data');
        navigation.clearPersistedNavigation();
      }
    }
  }, [auth.isGuestMode, auth.isAuthenticated, navigation.clearPersistedNavigation]);

  // Debug logging with enhanced info
  useEffect(() => {
    console.log('App render state:', {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      isGuestMode: auth.isGuestMode,
      isOfflineMode: auth.isOfflineMode,
      hasUserProfile: !!auth.userProfile,
      hasSetupData: !!auth.setupData,
      authError: !!auth.authError,
      currentPage: navigation.currentPage,
      previousPage: navigation.previousPage,
      isMobile,
      showPasswordReset: passwordReset.showPasswordReset,
      isPropertySetupComplete: setupComplete,
      hasInitialSetup: localStorage.getItem('handoff-initial-setup-complete') === 'true',
      hasScreeningData: !!localStorage.getItem('handoff-screening-data'),
      hasQuestionnaireComplete: localStorage.getItem('handoff-questionnaire-complete') === 'true',
      canAccessCurrentPage: canAccessPage(navigation.currentPage),
      userDisplayInfo: {
        buyerName: userDisplayInfo?.buyerName,
        buyerEmail: userDisplayInfo?.buyerEmail,
        displayBadge: userDisplayInfo?.displayBadge
      }
    });
  }, [
    auth.isAuthenticated, auth.isLoading, auth.isGuestMode, auth.isOfflineMode, 
    auth.userProfile, auth.setupData, auth.authError, navigation.currentPage, 
    navigation.previousPage, isMobile, passwordReset.showPasswordReset, 
    setupComplete, userDisplayInfo
  ]);

  // Update document title and meta tags
  useEffect(() => {
    document.title = auth.isAuthenticated 
      ? APP_TITLES.authenticated
      : APP_TITLES.unauthenticated;

    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', VIEWPORT_META_CONTENT);

    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      faviconLink.setAttribute('type', 'image/svg+xml');
      document.head.appendChild(faviconLink);
    }
    
    faviconLink.setAttribute('href', FAVICON_SVG);

    if (isMobile) {
      document.body.classList.add('mobile-device');
      document.documentElement.classList.add('mobile-device');
      
      if (!auth.isAuthenticated || passwordReset.showPasswordReset) {
        document.body.classList.add('setup-wizard');
        document.documentElement.classList.add('setup-wizard');
      } else {
        document.body.classList.remove('setup-wizard');
        document.documentElement.classList.remove('setup-wizard');
      }
    } else {
      document.body.classList.remove('mobile-device', 'setup-wizard');
      document.documentElement.classList.remove('mobile-device', 'setup-wizard');
    }

    if (isMobile) {
      let lastTouchEnd = 0;
      const preventZoom = (e: TouchEvent) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };
      
      document.addEventListener('touchend', preventZoom, { passive: false });
      return () => document.removeEventListener('touchend', preventZoom);
    }
  }, [isMobile, auth.isAuthenticated, passwordReset.showPasswordReset]);

  // Smart navigation restoration and property setup flow management
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      const setupComplete = isPropertySetupComplete();
      const hasInitialSetup = localStorage.getItem('handoff-initial-setup-complete') === 'true';
      const currentPageAccessible = canAccessPage(navigation.currentPage);
      
      console.log('Navigation effect - evaluating flow:', {
        setupComplete,
        hasInitialSetup,
        currentPage: navigation.currentPage,
        currentPageAccessible,
        isGuestMode: auth.isGuestMode
      });
      
      if (auth.isGuestMode && !hasInitialSetup) {
        console.log('Guest mode: Initial setup not complete, redirecting to property details');
        navigation.navigateTo('property');
        return;
      }
      
      if (!setupComplete) {
        console.log('Property setup not complete, redirecting to property details');
        navigation.navigateTo('property');
        return;
      }
      
      if (setupComplete && !currentPageAccessible) {
        console.log('Current page not accessible, redirecting to overview');
        navigation.navigateTo('overview');
        return;
      }
      
      // Default behavior: respect saved page; otherwise leave currentPage as is
      const saved = getSavedPageFromStorage();
      if (saved) {
        console.log('Restoring saved page after login:', saved);
        navigation.navigateTo(saved);
        return;
      }
      console.log('No saved page; keeping current page:', navigation.currentPage);
      // fall through without redirect
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.isGuestMode, navigation.currentPage, navigation.navigateTo]);

  // FIXED: Clear persisted navigation and user data on sign out with proper error handling
  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading) {
      navigation.clearPersistedNavigation();
      // Clear persisted user display info on sign out
      try {
        clearPersistedUserDisplayInfo();
      } catch (error) {
        console.warn('Error clearing persisted user display info:', error);
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, navigation.clearPersistedNavigation]);

  // Persist user display info when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && userDisplayInfo && !auth.isLoading) {
      try {
        const mode = auth.isGuestMode ? 'guest' : auth.isOfflineMode ? 'offline' : 'authenticated';
        persistUserDisplayInfo(userDisplayInfo, mode);
      } catch (error) {
        console.warn('Error persisting user display info:', error);
      }
    }
  }, [auth.isAuthenticated, auth.isGuestMode, auth.isOfflineMode, userDisplayInfo, auth.isLoading]);
}