import { createClient } from '@supabase/supabase-js';
import { SafeProfileCache } from '../mapPolyfill';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './info';

// Define the user profile types based on Supabase auth.users only
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at?: string;
  // Additional profile fields stored in user_metadata
  phone?: string;
  avatar_url?: string;
  // Property and transaction fields
  buyer_name?: string;
  property_address?: string;
  transaction_type?: string;
  // Questionnaire and setup fields
  questionnaire_complete?: boolean;
  initial_setup_complete?: boolean;
  property_setup_complete?: boolean;
  // Role and permissions
  role?: string;
  is_guest?: boolean;
  is_offline?: boolean;
  // Metadata
  last_login?: string;
  login_count?: number;
  preferences?: Record<string, any>;
  // MLS and property data
  mls_data?: Record<string, any>;
  property_data?: Record<string, any>;
  // Team and collaboration
  team_id?: string;
  team_role?: string;
}

// Auth session type
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
    email_confirmed_at?: string;
    phone_confirmed_at?: string;
    last_sign_in_at?: string;
    role?: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
  };
}

// Database types for KV store only (NO PROFILES TABLE)
export interface Database {
  public: {
    Tables: {
      kv_store_a24396d5: {
        Row: {
          id: string;
          key: string;
          value: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: any;
        };
        Update: {
          value?: any;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Use env-only configuration (Option C)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration:');
  console.error('- URL:', SUPABASE_URL ? '✓' : '❌');
  console.error('- publicAnonKey:', SUPABASE_ANON_KEY ? '✓' : '❌');
  throw new Error('Supabase configuration incomplete. Ensure base URL and publicAnonKey are available.');
}

export const supabase = createClient<Database>(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: { 'x-application-name': 'handoff-real-estate' },
  },
  db: { schema: 'public' },
});

// FIXED: Use SafeProfileCache instead of Map to prevent constructor errors
const profileCache = new SafeProfileCache(10);

function createUserProfileFromAuth(user: any): UserProfile {
  try {
    // Check cache first for performance
    const cacheKey = `${user.id}-${user.updated_at || user.created_at}`;
    if (profileCache.has(cacheKey)) {
      console.log('✅ Profile cache hit:', cacheKey);
      return profileCache.get(cacheKey);
    }

    const profile: UserProfile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || 
                user.user_metadata?.name || 
                user.email?.split('@')[0] || 'User',
      created_at: user.created_at,
      updated_at: user.updated_at || new Date().toISOString(),
      // Copy user metadata fields
      phone: user.user_metadata?.phone,
      avatar_url: user.user_metadata?.avatar_url,
      buyer_name: user.user_metadata?.buyer_name || 
                 user.user_metadata?.full_name || 
                 user.user_metadata?.name,
      property_address: user.user_metadata?.property_address,
      transaction_type: user.user_metadata?.transaction_type,
      // Setup completion flags
      questionnaire_complete: user.user_metadata?.questionnaire_complete || false,
      initial_setup_complete: user.user_metadata?.initial_setup_complete || false,
      property_setup_complete: user.user_metadata?.property_setup_complete || false,
      // Role and permissions
      role: user.app_metadata?.role || 'user',
      is_guest: false,
      is_offline: false,
      // Metadata
      last_login: user.user_metadata?.last_login || new Date().toISOString(),
      login_count: user.user_metadata?.login_count || 1,
      preferences: user.user_metadata?.preferences || {},
      // MLS and property data
      mls_data: user.user_metadata?.mls_data || {},
      property_data: user.user_metadata?.property_data || {},
      // Team and collaboration
      team_id: user.user_metadata?.team_id,
      team_role: user.user_metadata?.team_role,
    };

    // Cache the profile for performance
    profileCache.set(cacheKey, profile);
    console.log('✅ Profile cached:', cacheKey);

    return profile;
  } catch (error) {
    console.error('Error creating user profile from auth data:', error);
    // Return a safe fallback profile
    return {
      id: user?.id || 'unknown',
      email: user?.email || 'user@example.com',
      full_name: 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_guest: false,
      is_offline: false,
      questionnaire_complete: false,
      initial_setup_complete: false,
      property_setup_complete: false,
      role: 'user',
      login_count: 1,
      preferences: {},
      mls_data: {},
      property_data: {},
    };
  }
}

// Optimized auth state management with safer initialization
export class AuthStateManager {
  private static instance: AuthStateManager;
  private authListeners: ((session: AuthSession | null) => void)[] = [];
  private currentSession: AuthSession | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private disposers: (() => void)[] = [];

  private constructor() {
    // Don't initialize immediately - wait for first listener
  }

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  private async initializeAuthListener() {
    if (this.initialized || this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      console.log('🔐 Initializing Supabase auth listener...');
      
      // Get current session first (synchronous check)
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Warning getting initial session:', error);
      }
      this.currentSession = session as AuthSession | null;
      
      // Set up auth state listener with error handling
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          console.log('🔐 Auth state change:', event);
          
          this.currentSession = session as AuthSession | null;
          
          // Notify all listeners efficiently with error handling
          const listeners = [...this.authListeners]; // Copy to avoid mutation issues
          await Promise.allSettled(
            listeners.map(async (listener) => {
              try {
                await listener(this.currentSession);
              } catch (error) {
                console.error('Auth listener error:', error);
              }
            })
          );
          
          // Handle auth events efficiently
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ User signed in:', session.user.email);
            // Defer metadata update to avoid blocking UI
            setTimeout(() => this.updateUserMetadata(session.user), 100);
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
            this.clearLocalAuthData();
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        }
      });

      // Store cleanup function
      this.disposers.push(() => subscription.unsubscribe());

      this.initialized = true;
      console.log('✅ Auth listener initialized');
    } catch (error) {
      console.error('Failed to initialize auth listener:', error);
      this.initialized = true; // Mark as initialized even on error to avoid retries
    }
  }

  async addAuthListener(listener: (session: AuthSession | null) => void) {
    try {
      this.authListeners.push(listener);
      
      // Initialize on first listener for better performance
      await this.initializeAuthListener();
      
      // Immediately call with current session
      listener(this.currentSession);
      
      return () => {
        const index = this.authListeners.indexOf(listener);
        if (index > -1) {
          this.authListeners.splice(index, 1);
        }
      };
    } catch (error) {
      console.error('Error adding auth listener:', error);
      return () => {}; // Return no-op cleanup function
    }
  }

  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  // Clean up all listeners and subscriptions
  dispose(): void {
    this.disposers.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Error during auth cleanup:', error);
      }
    });
    this.disposers = [];
    this.authListeners = [];
    this.initialized = false;
    this.initPromise = null;
  }

  private async updateUserMetadata(user: any) {
    try {
      // Store user profile data in localStorage for persistence
      const profile = createUserProfileFromAuth(user);
      localStorage.setItem('handoff-user-profile', JSON.stringify(profile));
      
      // Update login tracking in user metadata (non-blocking)
      const loginCount = (user.user_metadata?.login_count || 0) + 1;
      const updatedMetadata = {
        ...user.user_metadata,
        last_login: new Date().toISOString(),
        login_count: loginCount,
      };

      // Update user metadata in Supabase (non-blocking with better error handling)
      supabase.auth.updateUser({
        data: updatedMetadata
      }).then(({ error }) => {
        if (error) {
          console.warn('Failed to update user metadata (non-critical):', error);
        } else {
          console.log('✅ User metadata updated');
        }
      }).catch(error => {
        console.warn('Error updating user metadata (non-critical):', error);
      });
    } catch (error) {
      console.error('Error updating user metadata:', error);
    }
  }

  private clearLocalAuthData() {
    // Clear any local auth-related data (non-blocking)
    const keysToRemove = [
      'handoff-auth-session',
      'handoff-user-profile',
      'handoff-initial-setup-complete',
      'handoff-questionnaire-complete',
      'handoff-setup-data',
    ];
    
    // Use requestIdleCallback if available for better performance
    const clearKeys = () => {
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          // Fail silently
        }
      });
      
      // Clear profile cache
      profileCache.clear();
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(clearKeys);
    } else {
      setTimeout(clearKeys, 0);
    }
  }
}

// Initialize the auth state manager (lazy)
export const authStateManager = AuthStateManager.getInstance();

// FIXED: Add cleanup on page unload to prevent memory leaks
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    authStateManager.dispose();
  });
}

// Helper functions for common auth operations - NO DATABASE QUERIES
export const authHelpers = {
  // Get current user session (cached)
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting current session:', error);
        return null;
      }
      return session as AuthSession | null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  // Get current user (cached)
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error && error.message !== 'Auth session missing!') {
        console.error('Error getting current user:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get user profile from auth user data - NO DATABASE REQUIRED (optimized)
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return null;
      }

      // If userId is provided and doesn't match current user, return null
      if (userId && userId !== user.id) {
        return null;
      }

      // Create profile from auth user data - NO DATABASE QUERIES
      const profile = createUserProfileFromAuth(user);
      return profile;
    } catch (error) {
      console.error('Error getting user profile from auth data:', error);
      return null;
    }
  },

  // Update user profile by updating user metadata - NO DATABASE REQUIRED
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Prepare user metadata updates
      const metadataUpdates: Record<string, any> = {};
      
      // Map profile fields to user metadata
      const metadataFields = [
        'full_name', 'phone', 'avatar_url', 'buyer_name', 'property_address',
        'transaction_type', 'questionnaire_complete', 'initial_setup_complete',
        'property_setup_complete', 'preferences', 'mls_data', 'property_data',
        'team_id', 'team_role', 'last_login', 'login_count'
      ];

      metadataFields.forEach(field => {
        if (field in updates) {
          metadataUpdates[field] = updates[field as keyof UserProfile];
        }
      });

      // Add update timestamp
      metadataUpdates.updated_at = new Date().toISOString();

      // Update user in Supabase auth (NOT DATABASE)
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
        data: metadataUpdates
      });

      if (error) {
        console.error('Error updating user profile via auth:', error);
        throw error;
      }

      if (!updatedUser) {
        throw new Error('No user data returned from update');
      }

      // Clear profile cache to force refresh
      profileCache.clear();

      // Return updated profile created from auth data
      const updatedProfile = createUserProfileFromAuth(updatedUser);
      
      // Update localStorage cache
      localStorage.setItem('handoff-user-profile', JSON.stringify(updatedProfile));

      console.log('✅ User profile updated successfully');
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Sign in with email and password
  async signInWithPassword(email: string, password: string) {
    console.log('🔐 Attempting Supabase sign in for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        throw error;
      }

      console.log('✅ Supabase sign in successful:', data.user?.email);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign up with email and password
  async signUpWithPassword(email: string, password: string, fullName: string) {
    console.log('🔐 Attempting Supabase sign up for:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
            buyer_name: fullName,
            questionnaire_complete: false,
            initial_setup_complete: false,
            property_setup_complete: false,
            login_count: 1,
            last_login: new Date().toISOString(),
            preferences: {},
            mls_data: {},
            property_data: {},
          },
        },
      });

      if (error) {
        console.error('Supabase sign up error:', error);
        throw error;
      }

      console.log('✅ Supabase sign up successful:', data.user?.email);
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    console.log('🔐 Attempting Supabase sign out');
    
    try {
      // Clear profile cache before sign out
      profileCache.clear();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }

      console.log('✅ Supabase sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email: string) {
    console.log('🔐 Attempting password reset for:', email);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      console.log('✅ Password reset email sent');
      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  // Resend confirmation email
  async resendConfirmation(email: string) {
    console.log('🔐 Attempting to resend confirmation for:', email);
    try {
      // @ts-ignore - supabase-js v2 supports resend with { type, email }
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (error) {
        console.error('Resend confirmation error:', error);
        throw error;
      }
      console.log('✅ Confirmation email resent');
      return data;
    } catch (error) {
      console.error('Resend confirmation error:', error);
      throw error;
    }
  },

  // Update password
  async updatePassword(newPassword: string) {
    console.log('🔐 Attempting password update');
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      return data;
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  },
};

// Export the configured client and types
export default supabase;
export type { Database, AuthSession };