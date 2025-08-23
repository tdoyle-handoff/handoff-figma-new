import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, authHelpers, authStateManager, hasPlaceholderCredentials } from '../utils/supabase/client';
import { handleGoogleSignIn, handleAuthComplete, continueAsGuest, restoreExistingSession } from './authHandlers';
import { validateAuthData } from '../utils/authHelpers';
import type { SetupData } from '../utils/authHelpers';
import type { UserProfile, AuthSession } from '../utils/supabase/client';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  setupData: SetupData | null;
  authError: string | null;
  isOfflineMode: boolean;
  isGuestMode: boolean;
  isQuestionnaireComplete: boolean;
  showQuestionnairePrompt: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userProfile: null,
    setupData: null,
    authError: null,
    isOfflineMode: false,
    isGuestMode: false,
    isQuestionnaireComplete: false,
    showQuestionnairePrompt: false,
  });

  const mountedRef = useRef(true);
  const initializationRef = useRef(false);

  // Initialize authentication state and session restoration with optimized performance
  useEffect(() => {
    // Prevent double initialization
    if (initializationRef.current) return;
    initializationRef.current = true;

    let authUnsubscribe: (() => void) | null = null;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing optimized auth system...');
        const startTime = performance.now();

        // Quick check for existing guest/stored data first (synchronous)
        const storedProfile = localStorage.getItem('handoff-user-profile');
        const storedSetupData = localStorage.getItem('handoff-setup-data');
        
        if (storedProfile && storedSetupData) {
          try {
            const profile = JSON.parse(storedProfile);
            const setupData = JSON.parse(storedSetupData);
            
            if (profile.is_guest) {
              console.log('🎭 Quick restore: Guest mode detected');
              setAuthState(prev => ({
                ...prev,
                isAuthenticated: true,
                userProfile: profile,
                setupData,
                isQuestionnaireComplete: profile.questionnaire_complete || false,
                showQuestionnairePrompt: !(profile.questionnaire_complete || false),
                isOfflineMode: true,
                isGuestMode: true,
                isLoading: false,
                authError: null,
              }));
              console.log(`⚡ Auth initialized in ${Math.round(performance.now() - startTime)}ms (guest mode)`);
              return;
            }
          } catch (error) {
            console.warn('Error parsing stored data, continuing with auth check...');
            // Clear corrupted data
            localStorage.removeItem('handoff-user-profile');
            localStorage.removeItem('handoff-setup-data');
          }
        }

        // Check for placeholder credentials and automatically enable guest mode
        if (hasPlaceholderCredentials) {
          console.log('🎭 Placeholder credentials detected - automatically enabling guest mode');
          const guestProfile: UserProfile = {
            id: 'guest-user',
            email: 'guest@handoff.demo',
            full_name: 'Guest User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_guest: true,
            is_offline: true,
            questionnaire_complete: false,
            initial_setup_complete: false,
            property_setup_complete: false,
            role: 'guest',
            login_count: 1,
            preferences: {},
            mls_data: {},
            property_data: {},
          };

          const guestSetupData = {
            buyerName: 'Guest User',
            buyerEmail: 'guest@handoff.demo'
          };

          // Store guest data
          localStorage.setItem('handoff-user-profile', JSON.stringify(guestProfile));
          localStorage.setItem('handoff-setup-data', JSON.stringify(guestSetupData));

          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            userProfile: guestProfile,
            setupData: guestSetupData,
            authError: null,
            isOfflineMode: true,
            isGuestMode: true,
            isQuestionnaireComplete: false,
            showQuestionnairePrompt: false,
          });

          console.log('✅ Guest mode enabled automatically');
          return;
        }

        // Set up optimized auth state listener
        authUnsubscribe = await authStateManager.addAuthListener(async (session: AuthSession | null) => {
          if (!mountedRef.current) return;

          if (session && session.user) {
            console.log('🔄 Processing session for:', session.user.email);
            
            try {
              // Get user profile from auth data (cached, fast)
              const profile = await authHelpers.getUserProfile(session.user.id);
              
              if (profile && mountedRef.current) {
                console.log('✅ Profile loaded:', profile.email);
                
                setAuthState(prev => ({
                  ...prev,
                  isAuthenticated: true,
                  userProfile: profile,
                  setupData: { 
                    buyerEmail: profile.email,
                    buyerName: profile.full_name,
                  },
                  isQuestionnaireComplete: profile.questionnaire_complete || false,
                  showQuestionnairePrompt: !(profile.questionnaire_complete || false),
                  isOfflineMode: false,
                  isGuestMode: false,
                  isLoading: false,
                  authError: null,
                }));
              } else if (mountedRef.current) {
                console.log('⚠️ Session but no profile, creating basic profile');
                // Create basic profile from session data
                const basicProfile: UserProfile = {
                  id: session.user.id,
                  email: session.user.email || 'user@example.com',
                  full_name: session.user.user_metadata?.full_name || 
                            session.user.user_metadata?.name || 
                            session.user.email?.split('@')[0] || 
                            'User',
                  created_at: session.user.created_at,
                  questionnaire_complete: session.user.user_metadata?.questionnaire_complete || false,
                  initial_setup_complete: session.user.user_metadata?.initial_setup_complete || false,
                  property_setup_complete: session.user.user_metadata?.property_setup_complete || false,
                };
                
                setAuthState(prev => ({
                  ...prev,
                  isAuthenticated: true,
                  userProfile: basicProfile,
                  setupData: { 
                    buyerEmail: basicProfile.email,
                    buyerName: basicProfile.full_name,
                  },
                  isQuestionnaireComplete: false,
                  showQuestionnairePrompt: true,
                  isOfflineMode: false,
                  isGuestMode: false,
                  isLoading: false,
                  authError: null,
                }));
              }
            } catch (error) {
              console.error('Error processing auth session:', error);
              if (mountedRef.current) {
                setAuthState(prev => ({
                  ...prev,
                  isLoading: false,
                  authError: 'Error loading user profile. Please try signing in again.',
                }));
              }
            }
          } else if (mountedRef.current) {
            console.log('📝 No active session');
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: false,
              userProfile: null,
              setupData: null,
              isOfflineMode: false,
              isGuestMode: false,
              isLoading: false,
              authError: null,
            }));
          }
        });

        const endTime = performance.now();
        console.log(`⚡ Auth system initialized in ${Math.round(endTime - startTime)}ms`);

      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mountedRef.current) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            authError: 'Authentication system failed to initialize. Please refresh the page.',
          }));
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, []);

  // Handle authentication completion (optimized)
  const handleAuthCompleteWrapper = useCallback(async (data: SetupData, isSignUp: boolean) => {
    if (!mountedRef.current) return;
    
    try {
      await handleAuthComplete(data, isSignUp, setAuthState);
    } catch (error) {
      console.error('Auth complete error:', error);
      if (mountedRef.current) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          authError: 'Authentication failed. Please try again.',
        }));
      }
    }
  }, []);

  // Handle Google sign-in (optimized)
  const handleGoogleSignInWrapper = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      await handleGoogleSignIn(setAuthState);
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (mountedRef.current) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          authError: 'Google sign-in failed. Please try again.',
        }));
      }
    }
  }, []);

  // Continue as guest (optimized for speed)
  const continueAsGuestWrapper = useCallback((data?: SetupData) => {
    if (!mountedRef.current) return;
    
    try {
      continueAsGuest(data, setAuthState);
    } catch (error) {
      console.error('Guest mode error:', error);
      if (mountedRef.current) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          authError: 'Failed to start guest mode. Please refresh the page.',
        }));
      }
    }
  }, []);

  // Handle sign out (optimized)
  const handleSignOut = useCallback(async () => {
    try {
      console.log('🔐 Starting optimized sign out...');
      
      // Clear local state immediately for fast UI response
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        userProfile: null,
        setupData: null,
        authError: null,
        isOfflineMode: false,
        isGuestMode: false,
        isQuestionnaireComplete: false,
        showQuestionnairePrompt: false,
      });

      // Clear localStorage asynchronously
      const keysToRemove = [
        'handoff-auth-session',
        'handoff-user-profile',
        'handoff-setup-data',
        'handoff-initial-setup-complete',
        'handoff-questionnaire-complete',
        'handoff-questionnaire-responses',
        'handoff-screening-data',
        'handoff-initial-setup-data',
      ];
      
      // Use requestIdleCallback for better performance
      const clearStorage = () => {
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            // Fail silently
          }
        });
      };

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(clearStorage);
      } else {
        setTimeout(clearStorage, 0);
      }

      // Sign out from Supabase
      await authHelpers.signOut();
      
      console.log('✅ Sign out completed');
      
      // Force page reload for clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload even if sign out failed
      window.location.href = '/';
    }
  }, []);

  // Clear auth error (optimized)
  const clearAuthError = useCallback(() => {
    if (!mountedRef.current) return;
    
    setAuthState(prev => ({
      ...prev,
      authError: null,
    }));
  }, []);

  // Update user profile (optimized with caching)
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!authState.userProfile || !mountedRef.current) {
      throw new Error('No user profile to update');
    }

    try {
      console.log('📝 Updating user profile...');
      
      // Update using auth helpers if not in guest mode
      if (!authState.isGuestMode) {
        const updatedProfile = await authHelpers.updateUserProfile(updates);
        
        if (updatedProfile && mountedRef.current) {
          // Update local state
          setAuthState(prev => ({
            ...prev,
            userProfile: updatedProfile,
            setupData: prev.setupData ? {
              ...prev.setupData,
              buyerEmail: updatedProfile.email,
              buyerName: updatedProfile.full_name,
            } : prev.setupData,
          }));

          console.log('✅ Profile updated via auth');
          return updatedProfile;
        } else {
          throw new Error('Failed to update user profile');
        }
      } else {
        // Update local storage for guest mode
        const updatedProfile = { 
          ...authState.userProfile, 
          ...updates, 
          updated_at: new Date().toISOString() 
        };
        
        localStorage.setItem('handoff-user-profile', JSON.stringify(updatedProfile));
        console.log('✅ Profile updated in guest mode');

        // Update local state
        if (mountedRef.current) {
          setAuthState(prev => ({
            ...prev,
            userProfile: updatedProfile,
            setupData: prev.setupData ? {
              ...prev.setupData,
              buyerEmail: updatedProfile.email,
              buyerName: updatedProfile.full_name,
            } : prev.setupData,
          }));
        }

        return updatedProfile;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }, [authState.userProfile, authState.isGuestMode]);

  // Get authentication status message (memoized)
  const getAuthStatusMessage = useCallback(() => {
    if (authState.isGuestMode) {
      return 'Guest Mode - Data stored locally';
    } else if (authState.isOfflineMode) {
      return 'Offline Mode - Limited functionality';
    } else if (authState.userProfile) {
      return `Signed in as ${authState.userProfile.full_name}`;
    } else {
      return 'Not authenticated';
    }
  }, [authState.isGuestMode, authState.isOfflineMode, authState.userProfile]);

  // Export all auth state and methods
  return {
    // State
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    userProfile: authState.userProfile,
    setupData: authState.setupData,
    authError: authState.authError,
    isOfflineMode: authState.isOfflineMode,
    isGuestMode: authState.isGuestMode,
    isQuestionnaireComplete: authState.isQuestionnaireComplete,
    showQuestionnairePrompt: authState.showQuestionnairePrompt,
    
    // Methods
    handleAuthComplete: handleAuthCompleteWrapper,
    handleGoogleSignIn: handleGoogleSignInWrapper,
    continueAsGuest: continueAsGuestWrapper,
    handleSignOut,
    clearAuthError,
    updateUserProfile,
    getAuthStatusMessage,
    
    // Utilities
    validateAuthData,
    authHelpers: {
      getCurrentSession: authHelpers.getCurrentSession,
      getCurrentUser: authHelpers.getCurrentUser,
      getUserProfile: authHelpers.getUserProfile,
      resetPassword: authHelpers.resetPassword,
      updatePassword: authHelpers.updatePassword,
    },
  };
}
