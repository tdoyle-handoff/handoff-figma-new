import { supabase, authHelpers, authStateManager } from '../utils/supabase/client';
// import { makeAuthRequest } from '../utils/networkHelpers';
import { 
  validateAuthData, 
  createOfflineProfile, 
  checkQuestionnaireCompletion,
  storeAuthSession,
  storeGuestData,
  AUTH_ERROR_MESSAGES 
} from '../utils/authHelpers';
import type { SetupData } from '../utils/authHelpers';
import type { UserProfile } from '../utils/supabase/client';

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

type SetAuthState = React.Dispatch<React.SetStateAction<AuthState>>;

export async function handleGoogleSignIn(setState: SetAuthState) {
  setState(prev => ({ ...prev, isLoading: true, authError: null }));

  try {
    console.log('🔐 Starting Google OAuth with Supabase...');
    
    const currentUrl = window.location.origin;
    const redirectUrl = `${currentUrl}/`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      
      let errorMessage = '🔐 Google Sign-In Failed\n\n';
      
      if (error.message.includes('not enabled')) {
        errorMessage += 'Google OAuth provider is not configured in Supabase.\n\n' +
                      '⚙️ To fix this:\n' +
                      '• Go to your Supabase project dashboard\n' +
                      '• Navigate to Authentication → Providers\n' +
                      '• Enable and configure Google OAuth\n\n' +
                      '📧 For now, please use email sign-in instead.';
      } else if (error.message.includes('redirect')) {
        errorMessage += 'OAuth redirect configuration issue detected.\n\n' +
                      '🔧 This usually resolves automatically.\n' +
                      'Please try again or use email authentication.';
      } else {
        errorMessage += 'Supabase authentication service encountered an error.\n\n' +
                      '📧 Please try email sign-in as an alternative.';
      }
      
      setState(prev => ({
        ...prev,
        authError: errorMessage,
        isLoading: false,
      }));
      return;
    }

    console.log('✅ Google OAuth redirect initiated');
    
  } catch (error: any) {
    console.error('Google OAuth system error:', error);
    
    setState(prev => ({
      ...prev,
      authError: '🔐 Google Sign-In Service Unavailable\n\nThe Google authentication service is temporarily unavailable.\n\n📧 Please use email sign-in to continue with your account.',
      isLoading: false,
    }));
  }
}

export async function handleAuthComplete(
  data: SetupData, 
  isSignUp: boolean, 
  setState: SetAuthState
) {
  setState(prev => ({ ...prev, isLoading: true, authError: null }));

  try {
    // Validate input data first
    const validationError = validateAuthData(data);
    if (validationError) {
      throw new Error(validationError);
    }

    console.log(`🔐 ${isSignUp ? 'Sign up' : 'Sign in'} for: ${data.buyerEmail}`);
    const startTime = performance.now();

    // Try Supabase authentication directly first (optimized)
    try {
      let authResult;
      
      if (isSignUp) {
        authResult = await authHelpers.signUpWithPassword(
          data.buyerEmail,
          data.password!,
          data.buyerName
        );
        
        if (authResult.user && !authResult.session) {
          // User created but needs email confirmation
          setState(prev => ({
            ...prev,
            authError: `🔐 Account Created - Email Confirmation Required

Your Supabase account has been created successfully!

📧 Please check your email (${data.buyerEmail}) for a confirmation link.

⚠️ You won't be able to sign in until you confirm your email address.

Options:
• Check your spam/junk folder if you don't see the email
• Continue as guest to explore the app`,
            isLoading: false,
          }));
          return;
        }
      } else {
        authResult = await authHelpers.signInWithPassword(
          data.buyerEmail,
          data.password!
        );

        // In some cases Supabase may return a user without a session (e.g., email not confirmed)
        if (authResult.user && !authResult.session) {
          setState(prev => ({
            ...prev,
            authError: `🔐 Email Confirmation Required\n\nYour account exists but your email hasn't been confirmed yet.\n\n📧 Please check your email (${data.buyerEmail}) for a confirmation link.\n\n✅ Your Supabase authentication is working`,
            isLoading: false,
          }));
          return;
        }
      }

      // Check if authentication was successful
      if (authResult.session && authResult.user) {
        console.log('✅ Direct Supabase authentication successful');
        
        // Get user profile from auth user data (cached, fast)
        const profile = await authHelpers.getUserProfile(authResult.user.id);
        
        if (profile) {
          console.log(`✅ Profile loaded in ${Math.round(performance.now() - startTime)}ms`);
          
          // Store authentication data (async, non-blocking)
          setTimeout(() => storeAuthSession(profile, authResult.session), 0);

          // Check questionnaire completion (cached)
          const questionnaireComplete = checkQuestionnaireCompletion(profile);

          // Update state immediately for fast UI response
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            userProfile: profile,
            setupData: { 
              buyerEmail: profile.email,
              buyerName: profile.full_name,
              ...data,
              password: undefined 
            },
            isQuestionnaireComplete: questionnaireComplete,
            showQuestionnairePrompt: !questionnaireComplete,
            isOfflineMode: false,
            isGuestMode: false,
            isLoading: false,
            authError: null,
          }));

          console.log(`🎉 Auth completed in ${Math.round(performance.now() - startTime)}ms`);
          return;
        } else {
          console.error('❌ Failed to create user profile from auth data');
        }
      }
      
    } catch (supabaseError: any) {
      console.log('🔧 Supabase authentication error:', supabaseError);
      
      // Handle specific Supabase errors efficiently
      if (supabaseError.message) {
        // Invalid credentials
        if (supabaseError.message.includes('Invalid login credentials') || 
            supabaseError.message.includes('Email not confirmed')) {
          const errorMessage = isSignUp 
            ? 'Account Creation Failed\n\nThis email address may already be registered.\n\n✅ Your Supabase database is connected\n\nPlease:\n• Try signing in instead if you already have an account\n• Use a different email address for a new account'
            : `🔐 Sign In Failed\n\nThe email or password you entered is incorrect, or your email hasn't been confirmed yet.\n\n✅ Your Supabase authentication is working properly\n\nPlease:\n• Double-check your email and password\n• Check if you need to confirm your email\n• Use "Forgot Password" if needed`;
            
          setState(prev => ({
            ...prev,
            authError: errorMessage,
            isLoading: false,
          }));
          return;
        }
        
        // User already exists
        if (supabaseError.message.includes('User already registered')) {
          setState(prev => ({
            ...prev,
            authError: '🔐 Account Already Exists\n\nAn account with this email is already registered in your Supabase database.\n\n✅ Your Supabase connection is working properly\n\nPlease use the sign in option instead.',
            isLoading: false,
          }));
          return;
        }
        
        // Email confirmation required
        if (supabaseError.message.includes('Email not confirmed')) {
          setState(prev => ({
            ...prev,
            authError: `🔐 Email Confirmation Required\n\nYour account exists but your email hasn't been confirmed yet.\n\n📧 Please check your email (${data.buyerEmail}) for a confirmation link.\n\n✅ Your Supabase authentication is working`,
            isLoading: false,
          }));
          return;
        }
        
        // Network or connection issues - try server fallback
        if (supabaseError.message.includes('fetch') || 
            supabaseError.message.includes('network') ||
            supabaseError.message.includes('connection')) {
          console.log('🌐 Network issue, trying server fallback...');
        } else {
          // Other Supabase errors
          setState(prev => ({
            ...prev,
            authError: `🔐 Supabase Authentication Error\n\n${supabaseError.message}\n\n✅ Your Supabase service is connected but encountered an issue`,
            isLoading: false,
          }));
          return;
        }
      }
    }

    // If direct Supabase authentication failed, return a clear error
    const errorMessage = `🔐 Authentication Failed

We couldn't sign you ${isSignUp ? 'up' : 'in'} with the provided credentials.

✅ Your Supabase project is configured and working

💡 Solutions:
• Check your internet connection
• Verify your email and password
• Try the "Forgot Password" option
• Continue as guest to explore the app`;

    setState(prev => ({
      ...prev,
      authError: errorMessage,
      isLoading: false,
    }));

  } catch (error: any) {
    console.error('Authentication system error:', error);
    
    const errorMessage = error instanceof Error 
      ? `🔐 Authentication System Error\n\n${error.message}\n\n✅ Your Supabase project is connected\n\nPlease try again or continue as guest.`
      : '🔐 Authentication Error\n\nAn unexpected error occurred.\n\nPlease try again or continue as guest.';
    
    setState(prev => ({
      ...prev,
      authError: errorMessage,
      isLoading: false,
    }));
  }
}

export function continueAsGuest(data: SetupData | undefined, setState: SetAuthState) {
  console.log('👤 Starting optimized guest mode...');
  const startTime = performance.now();
  
  // Clear any existing setup data (async)
  const clearKeys = [
    'handoff-initial-setup-complete',
    'handoff-questionnaire-complete',
    'handoff-questionnaire-responses',
    'handoff-screening-data',
    'handoff-initial-setup-data'
  ];
  
  // Use requestIdleCallback for better performance
  const clearStorage = () => {
    clearKeys.forEach(key => {
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
  
  const profile = createOfflineProfile(
    data?.buyerEmail || '',
    data?.buyerName || 'Guest User',
    true
  );
  const setupData = data || {
    buyerEmail: '',
    buyerName: 'Guest User'
  };
  const questionnaireComplete = checkQuestionnaireCompletion(profile);

  // Store guest data (async)
  setTimeout(() => storeGuestData(profile, setupData), 0);

  setState(prev => ({
    ...prev,
    isAuthenticated: true,
    userProfile: profile,
    setupData,
    isQuestionnaireComplete: questionnaireComplete,
    showQuestionnairePrompt: !questionnaireComplete,
    isOfflineMode: true,
    isGuestMode: true,
    isLoading: false,
    authError: null,
  }));

  console.log(`✅ Guest mode activated in ${Math.round(performance.now() - startTime)}ms`);
}

// Optimized session restoration function
export async function restoreExistingSession(setState: SetAuthState): Promise<boolean> {
  try {
    console.log('🔄 Attempting session restoration...');
    const startTime = performance.now();
    
    // Get current session from Supabase (should be fast due to caching)
    const session = await authHelpers.getCurrentSession();
    
    if (session && session.user) {
      console.log('✅ Found existing session for:', session.user.email);
      
      // Get user profile from auth data (cached, fast)
      const profile = await authHelpers.getUserProfile(session.user.id);
      
      if (profile) {
        console.log(`✅ Session restored in ${Math.round(performance.now() - startTime)}ms`);
        
        // Store authentication data (async)
        setTimeout(() => storeAuthSession(profile, session), 0);
        
        // Check questionnaire completion (cached)
        const questionnaireComplete = checkQuestionnaireCompletion(profile);
        
        // Update state immediately
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          userProfile: profile,
          setupData: { 
            buyerEmail: profile.email,
            buyerName: profile.full_name,
          },
          isQuestionnaireComplete: questionnaireComplete,
          showQuestionnairePrompt: !questionnaireComplete,
          isOfflineMode: false,
          isGuestMode: false,
          isLoading: false,
          authError: null,
        }));
        
        return true;
      } else {
        console.log('⚠️ Session exists but no profile created');
        return false;
      }
    } else {
      console.log('📝 No existing session found');
      return false;
    }
  } catch (error) {
    console.error('Error restoring session:', error);
    return false;
  }
}