import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

// Types for user profiles and authentication (based on auth.users)
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at?: string;
  phone?: string;
  avatar_url?: string;
  buyer_name?: string;
  property_address?: string;
  transaction_type?: string;
  questionnaire_complete?: boolean;
  initial_setup_complete?: boolean;
  property_setup_complete?: boolean;
  role?: string;
  is_guest?: boolean;
  is_offline?: boolean;
  last_login?: string;
  login_count?: number;
  preferences?: Record<string, any>;
  mls_data?: Record<string, any>;
  property_data?: Record<string, any>;
  team_id?: string;
  team_role?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  profile?: UserProfile;
  session?: any;
  error?: string;
}

// Initialize Supabase clients
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
  throw new Error('Supabase configuration incomplete');
}

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client for regular operations
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to create UserProfile from Supabase auth user
function createUserProfileFromAuth(user: any): UserProfile {
  return {
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
}

const userApp = new Hono();

// Rate limiting store (in-memory for simplicity)
const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number }>();

// Rate limiting middleware
const rateLimit = (maxAttempts: number, windowMs: number) => {
  return async (c: any, next: any) => {
    const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = `${clientIP}:${c.req.path}`;
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (record) {
      // Reset if window has passed
      if (now - record.lastAttempt > windowMs) {
        rateLimitStore.set(key, { attempts: 1, lastAttempt: now });
      } else if (record.attempts >= maxAttempts) {
        return c.json({
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((windowMs - (now - record.lastAttempt)) / 1000)
        }, 429);
      } else {
        record.attempts++;
        record.lastAttempt = now;
      }
    } else {
      rateLimitStore.set(key, { attempts: 1, lastAttempt: now });
    }
    
    await next();
  };
};

// Apply CORS
userApp.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Cleanup old rate limit entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.lastAttempt > thirtyMinutes) {
      rateLimitStore.delete(key);
    }
  }
  
  console.log(`🧹 Cleaned up rate limit store. Current entries: ${rateLimitStore.size}`);
}, 30 * 60 * 1000);

// Health check endpoint
userApp.get('/health', async (c) => {
  try {
    // Test Supabase connection by checking auth
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Health check Supabase error:', error);
      return c.json({
        status: 'unhealthy',
        error: 'Supabase connection failed',
        details: error.message,
      }, 503);
    }

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supabase: 'connected',
      auth: 'available',
      users: data?.users?.length || 0,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return c.json({
      status: 'unhealthy',
      error: 'Service unavailable',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 503);
  }
});

// User registration endpoint with rate limiting
userApp.post('/auth/signup', rateLimit(5, 15 * 60 * 1000), async (c) => { // 5 attempts per 15 minutes
  try {
    const { email, password, fullName } = await c.req.json();

    console.log('📝 Processing signup request for:', email);

    if (!email || !password || !fullName) {
      return c.json({
        success: false,
        error: 'Missing required fields: email, password, and fullName are required',
      }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({
        success: false,
        error: 'Invalid email format',
      }, 400);
    }

    // Validate password strength
    if (password.length < 6) {
      return c.json({
        success: false,
        error: 'Password must be at least 6 characters long',
      }, 400);
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return c.json({
        success: false,
        error: 'Failed to verify user existence',
        details: checkError.message,
      }, 500);
    }

    const userExists = existingUser?.users?.find(user => user.email === email.toLowerCase());
    if (userExists) {
      return c.json({
        success: false,
        error: 'User with this email already exists. Please sign in instead.',
      }, 409);
    }

    // Create user account with metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      user_metadata: {
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
      email_confirm: true, // Auto-confirm email for development
    });

    if (authError) {
      console.error('Supabase auth creation error:', authError);
      
      if (authError.message.includes('already registered')) {
        return c.json({
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
        }, 409);
      }
      
      return c.json({
        success: false,
        error: 'Failed to create user account',
        details: authError.message,
      }, 500);
    }

    if (!authData.user) {
      return c.json({
        success: false,
        error: 'User creation failed - no user data returned',
      }, 500);
    }

    console.log('✅ User created successfully:', authData.user.email);

    // Create user profile from auth data
    const profile = createUserProfileFromAuth(authData.user);

    // Create session for the new user
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return c.json({
        success: false,
        error: 'User created but failed to create session. Please sign in manually.',
      }, 500);
    }

    const response: AuthResponse = {
      success: true,
      message: 'User account created successfully',
      profile: profile,
      session: sessionData.session,
    };

    console.log('🎉 Signup completed successfully for:', email);
    return c.json(response);

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({
      success: false,
      error: 'Internal server error during signup',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// User sign-in endpoint with rate limiting
userApp.post('/auth/signin', rateLimit(10, 15 * 60 * 1000), async (c) => { // 10 attempts per 15 minutes
  try {
    const { email, password } = await c.req.json();

    console.log('🔐 Processing signin request for:', email);

    if (!email || !password) {
      return c.json({
        success: false,
        error: 'Missing required fields: email and password are required',
      }, 400);
    }

    // Attempt to sign in with Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (authError) {
      console.error('Supabase signin error:', authError);
      
      if (authError.message.includes('Invalid login credentials')) {
        return c.json({
          success: false,
          error: 'Invalid email or password',
        }, 401);
      }
      
      if (authError.message.includes('Email not confirmed')) {
        return c.json({
          success: false,
          error: 'Email not confirmed. Please check your email for a confirmation link.',
        }, 401);
      }
      
      return c.json({
        success: false,
        error: 'Authentication failed',
        details: authError.message,
      }, 401);
    }

    if (!authData.user || !authData.session) {
      return c.json({
        success: false,
        error: 'Authentication failed - no user session created',
      }, 401);
    }

    console.log('✅ Authentication successful for:', authData.user.email);

    // Create user profile from auth data
    const profile = createUserProfileFromAuth(authData.user);

    // Update login tracking in user metadata
    const updatedMetadata = {
      ...authData.user.user_metadata,
      last_login: new Date().toISOString(),
      login_count: (authData.user.user_metadata?.login_count || 0) + 1,
    };

    try {
      await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
        user_metadata: updatedMetadata
      });
      console.log('✅ Login tracking updated');
    } catch (updateError: any) {
      console.warn('Failed to update login tracking:', updateError);
      
      // Check if it's a rate limit error
      if (updateError?.message?.includes('rate limit') || updateError?.status === 429) {
        console.warn('⚠️ Rate limit hit while updating login tracking - this is non-critical');
      }
      // Don't fail the signin for this
    }

    const response: AuthResponse = {
      success: true,
      message: 'Authentication successful',
      profile: profile,
      session: authData.session,
    };

    console.log('🎉 Signin completed successfully for:', email);
    return c.json(response);

  } catch (error) {
    console.error('Signin error:', error);
    return c.json({
      success: false,
      error: 'Internal server error during signin',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Password reset endpoint with rate limiting
userApp.post('/auth/reset-password', rateLimit(3, 60 * 60 * 1000), async (c) => { // 3 attempts per hour
  try {
    const { email } = await c.req.json();

    console.log('🔑 Processing password reset request for:', email);

    if (!email) {
      return c.json({
        success: false,
        error: 'Email is required',
      }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({
        success: false,
        error: 'Invalid email format',
      }, 400);
    }

    // Send password reset email
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
      email.toLowerCase(),
      {
        redirectTo: `${c.req.header('origin') || 'http://localhost:3000'}/reset-password`,
      }
    );

    if (error) {
      console.error('Password reset error:', error);
      return c.json({
        success: false,
        error: 'Failed to send password reset email',
        details: error.message,
      }, 500);
    }

    console.log('✅ Password reset email sent for:', email);
    return c.json({
      success: true,
      message: 'Password reset email sent successfully',
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return c.json({
      success: false,
      error: 'Internal server error during password reset',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Get user profile endpoint
userApp.get('/profile', async (c) => {
  try {
    const authorization = c.req.header('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Missing or invalid authorization header',
      }, 401);
    }

    const token = authorization.split(' ')[1];
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Token verification error:', authError);
      return c.json({
        success: false,
        error: 'Invalid or expired token',
      }, 401);
    }

    // Create user profile from auth data
    const profile = createUserProfileFromAuth(user);

    return c.json({
      success: true,
      profile: profile,
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

// Update user profile endpoint with rate limiting
userApp.put('/profile', rateLimit(20, 60 * 1000), async (c) => { // 20 attempts per minute
  try {
    const authorization = c.req.header('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Missing or invalid authorization header',
      }, 401);
    }

    const token = authorization.split(' ')[1];
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Token verification error:', authError);
      return c.json({
        success: false,
        error: 'Invalid or expired token',
      }, 401);
    }

    const updates = await c.req.json();
    
    // Prepare user metadata updates
    const allowedFields = [
      'full_name', 'buyer_name', 'phone', 'avatar_url', 'property_address',
      'transaction_type', 'questionnaire_complete', 'initial_setup_complete',
      'property_setup_complete', 'preferences', 'mls_data', 'property_data',
      'team_id', 'team_role'
    ];
    
    const metadataUpdates: any = { ...user.user_metadata };
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        metadataUpdates[key] = value;
      }
    }

    // Add update timestamp
    metadataUpdates.updated_at = new Date().toISOString();

    // Update user metadata
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: metadataUpdates
    });

    if (updateError) {
      console.error('Profile update error:', updateError);
      
      // Handle rate limiting specifically
      if (updateError.message?.includes('rate limit') || updateError.status === 429) {
        return c.json({
          success: false,
          error: 'Too many profile updates. Please try again in a few minutes.',
          code: 'RATE_LIMIT_EXCEEDED',
          details: updateError.message,
        }, 429);
      }
      
      return c.json({
        success: false,
        error: 'Failed to update profile',
        details: updateError.message,
      }, 500);
    }

    // Create updated profile from auth data
    const profile = createUserProfileFromAuth(updateData.user);

    console.log('✅ Profile updated successfully for:', user.email);
    return c.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profile,
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

// List all users endpoint (admin only)
userApp.get('/admin/users', async (c) => {
  try {
    const authorization = c.req.header('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Missing or invalid authorization header',
      }, 401);
    }

    // Get all users via admin API
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return c.json({
        success: false,
        error: 'Failed to retrieve users',
      }, 500);
    }

    // Convert auth users to profiles
    const profiles = usersData.users.map(user => createUserProfileFromAuth(user));

    return c.json({
      success: true,
      users: profiles,
      count: profiles.length,
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

export default userApp;