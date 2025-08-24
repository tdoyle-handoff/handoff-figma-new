import { Fragment } from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, User, ArrowLeft, AlertCircle, UserPlus, Wifi, WifiOff, Users, Play, Server, CheckCircle, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useIsMobile } from './ui/use-mobile';
// import { ServerStatusBanner } from './ServerStatusBanner';
import { authHelpers } from '../utils/supabase/client';
const handoffLogo = 'https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fb382513b801044b9b63fee0d35fea0d6?format=webp&width=800';

interface SetupData {
  buyerEmail: string;
  buyerName: string;
  password?: string;
}

interface SetupWizardProps {
  onComplete: (data: SetupData, isSignUp: boolean) => void;
  onGoogleSignIn: () => void;
  authError?: string | null;
  isLoading?: boolean;
  continueAsGuest?: (data?: SetupData) => void;
  clearAuthError?: () => void;
}

// Handoff Logo Component using the actual image
const HandoffLogo = ({ className = "", size = "h-20" }: { className?: string; size?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <img 
      src={handoffLogo} 
      alt="Handoff Logo" 
      className={`${size} w-auto max-w-full mx-auto block`}
    />
  </div>
);

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Enhanced Error Component with Server-Connected Messaging
const AuthErrorAlert = ({ 
  error, 
  onCreateAccount, 
  onContinueAsGuest, 
  onClearError,
  onResendConfirmation,
  formData,
  serverAvailable 
}: { 
  error: string;
  onCreateAccount: () => void;
  onContinueAsGuest: () => void;
  onClearError: () => void;
  onResendConfirmation: (email: string) => Promise<void>;
  formData: any;
  serverAvailable?: boolean;
}) => {
  const isInvalidCredentials = error.includes('Invalid email or password') || error.includes('Sign In Failed');
  const isAccountExists = error.includes('already exists') || error.includes('already registered');
  const isServerUnavailable = error.includes('Server Authentication Unavailable') || error.includes('server is not currently accessible');
  
  const isEmailConfirmationRequired = error.includes('Email Confirmation Required');
  const showRecoveryOptions = isInvalidCredentials || isAccountExists || isServerUnavailable || isEmailConfirmationRequired || 
                              error.includes('You can:') || error.includes('Choose how to continue');
  
  return (
    <Alert variant="destructive" className="space-y-4">
      <AlertCircle className="h-4 w-4" />
      <div className="space-y-4">
        <AlertDescription className="whitespace-pre-line text-sm">
          {error}
        </AlertDescription>
        
        {showRecoveryOptions && (
          <div className="space-y-3 pt-2">
            {/* Server Connected Status for Credential Errors */}
            {isInvalidCredentials && serverAvailable !== false && (
              <div className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <strong>✅ Supabase Authentication Active</strong>
                </div>
                <p className="text-xs text-green-600">
                  Your account system is working properly. The credentials you entered don't match our records.
                </p>
              </div>
            )}

            {/* Account Already Exists Notice */}
            {isAccountExists && (
              <div className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <strong>Account Found in Supabase</strong>
                </div>
                <p className="text-xs text-blue-600">
                  This email is already registered. Please sign in instead.
                </p>
              </div>
            )}

            {/* Server Status for Unavailable */}
            {isServerUnavailable && (
              <div className="text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-orange-600" />
                  <strong>Server Authentication Offline</strong>
                </div>
                <p className="text-xs text-orange-600">
                  Supabase server features are not available. You can still use the full app in offline mode.
                </p>
              </div>
            )}

            <div className="text-sm font-medium text-destructive-foreground">
              How would you like to continue?
            </div>
            
            <div className="grid gap-2">
              {/* Primary Solutions Based on Error Type */}
              {isInvalidCredentials && (
                <Fragment>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '?login-fix=true'}
                    className="flex items-center gap-2 text-sm h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-md font-medium rounded-lg"
                  >
                    <Shield className="w-4 h-4" />
                    Login Troubleshooter
                    <span className="text-xs opacity-90 ml-auto">Fix account issues</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={onCreateAccount}
                    className="flex items-center gap-2 text-sm h-10 bg-green-600 hover:bg-green-700 text-white shadow-md font-medium rounded-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create New Account
                    <span className="text-xs opacity-90 ml-auto">If you're new</span>
                  </Button>
                </Fragment>
              )}

              {isAccountExists && (
                <Button
                  size="sm"
                  onClick={onClearError}
                  className="flex items-center gap-2 text-sm h-10 bg-green-600 hover:bg-green-700 text-white shadow-md font-medium rounded-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  Switch to Sign In
                  <span className="text-xs opacity-90 ml-auto">Use existing account</span>
                </Button>
              )}

              {isServerUnavailable && (
                <Fragment>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '?server-deployment=true'}
                    className="flex items-center gap-2 text-sm h-10 bg-purple-600 hover:bg-purple-700 text-white shadow-md font-medium rounded-lg"
                  >
                    <Server className="w-4 h-4" />
                    Deploy Supabase Server
                    <span className="text-xs opacity-90 ml-auto">Enable full auth</span>
                  </Button>
                </Fragment>
              )}

              {/* Alternative Options */}
              <div className="grid grid-cols-1 gap-2 pt-2">
                {isEmailConfirmationRequired && formData?.buyerEmail && (
                  <Button
                    size="sm"
                    onClick={() => onResendConfirmation(formData.buyerEmail)}
                    className="flex items-center gap-2 text-sm h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-md font-medium rounded-lg"
                  >
                    <Mail className="w-4 h-4" />
                    Resend Confirmation Email
                    <span className="text-xs opacity-90 ml-auto">{formData.buyerEmail}</span>
                  </Button>
                )}

                {/* Continue as Guest option removed */}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearError}
                  className="text-xs h-8 text-gray-600 hover:text-gray-900 mt-2"
                >
                  Try Different Credentials
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Alert>
  );
};

export function SetupWizard({ 
  onComplete, 
  onGoogleSignIn, 
  authError, 
  isLoading,
  continueAsGuest,
  clearAuthError
}: SetupWizardProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const isMobile = useIsMobile();
  const formRef = useRef<HTMLFormElement>(null);
  const errorContainerRef = useRef<HTMLDivElement>(null);

  // Ensure body has proper classes for mobile
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-device', 'setup-wizard');
      document.documentElement.classList.add('mobile-device', 'setup-wizard');
    }
    
    return () => {
      document.body.classList.remove('setup-wizard');
      document.documentElement.classList.remove('setup-wizard');
    };
  }, [isMobile]);

  // Focus and scroll to error alert when authError appears
  useEffect(() => {
    if (authError && errorContainerRef.current) {
      errorContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => errorContainerRef.current?.focus?.(), 50);
    }
  }, [authError]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.buyerEmail.trim()) {
      newErrors.buyerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Please enter a valid email address';
    }
    
    if (isSignUp && !formData.buyerName.trim()) {
      newErrors.buyerName = 'Name is required';
    } else if (isSignUp && formData.buyerName.trim().length < 2) {
      newErrors.buyerName = 'Name must be at least 2 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isSignUp]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const setupData: SetupData = {
      buyerEmail: formData.buyerEmail.trim(),
      buyerName: formData.buyerName.trim() || 'User',
      password: formData.password
    };

    await onComplete(setupData, isSignUp);
  }, [formData, isSignUp, validateForm, onComplete]);

  const handleGoogleClick = useCallback(async () => {
    try {
      await onGoogleSignIn();
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  }, [onGoogleSignIn]);

  // Resend confirmation handler
  const handleResendConfirmation = useCallback(async (email: string) => {
    try {
      await authHelpers.resendConfirmation(email);
      alert('Confirmation email sent. Please check your inbox.');
    } catch (e) {
      console.error('Resend confirmation error:', e);
      alert('Failed to resend confirmation. Please try again later.');
    }
  }, []);

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }

    try {
      setResetError(null);
      await authHelpers.resetPassword(resetEmail.trim());
      setResetEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setResetError(error instanceof Error ? error.message : 'Failed to send reset email');
    }
  };

  const toggleMode = useCallback(() => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({
      buyerName: '',
      buyerEmail: '',
      password: ''
    });
    if (clearAuthError) {
      clearAuthError();
    }
  }, [isSignUp, clearAuthError]);

  const goBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetEmailSent(false);
    setResetError(null);
  };

  // Handle error recovery options
  const handleCreateAccount = useCallback(() => {
    setIsSignUp(true);
    setErrors({});
    if (clearAuthError) {
      clearAuthError();
    }
    console.log('✨ Switching to account creation mode');
  }, [clearAuthError]);

  const handleContinueAsGuest = useCallback(() => {
    if (continueAsGuest) {
      const setupData: SetupData = {
        buyerEmail: formData.buyerEmail.trim() || '',
        buyerName: formData.buyerName.trim() || 'Guest User',
        password: formData.password || ''
      };
      continueAsGuest(setupData);
    }
  }, [formData, continueAsGuest]);

  const handleClearError = useCallback(() => {
    setErrors({});
    if (clearAuthError) {
      clearAuthError();
    }
    // If account exists, switch to sign in mode
    if (authError?.includes('already exists') || authError?.includes('already registered')) {
      setIsSignUp(false);
    }
  }, [clearAuthError, authError]);


  // Handle server status changes
  const handleServerAvailable = useCallback(() => {
    setServerAvailable(true);
    console.log('✅ Supabase server authentication detected as available');
  }, []);

  // Server Connected Banner Component
  const ServerConnectedBanner = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-green-900">✅ Supabase Connected & Active</span>
            <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Server Online</span>
          </div>
          <p className="text-sm text-green-700">
            Secure authentication, data sync, and all server features are working properly.
          </p>
        </div>
      </div>
    </div>
  );

  // Quick start options for when server is connected
  const ServerConnectedOptions = () => null;

  // Mobile layout for forgot password (unchanged)
  if (showForgotPassword && isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-4 text-center">
            <HandoffLogo className="mb-6" size="h-14" />
            <div className="space-y-2">
              <CardTitle className="text-xl">
                {resetEmailSent ? 'Check Your Email' : 'Reset Password'}
              </CardTitle>
              <CardDescription>
                {resetEmailSent 
                  ? 'We\'ve sent a password reset link to your email address.'
                  : 'Enter your email address and we\'ll send you a link to reset your password.'
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!resetEmailSent ? (
              <Fragment>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setResetError(null);
                    }}
                    className="mobile-input"
                    disabled={isLoading}
                  />
                </div>

                {resetError && (
                  <Alert variant="destructive">
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="w-full mobile-button"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={goBackToLogin}
                    className="w-full mobile-button"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </Fragment>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  If you don't see the email in your inbox, check your spam folder.
                </p>
                <Button 
                  variant="outline" 
                  onClick={goBackToLogin}
                  className="w-full mobile-button"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop layout for forgot password (unchanged)
  if (showForgotPassword && !isMobile) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-gray-900 min-h-full">
            <div className="flex flex-col items-center justify-center flex-1">
              <HandoffLogo className="mb-8" size="h-56" />
            </div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
              © 2025 Handoff. All rights reserved.
            </div>
          </div>
          <div className="absolute bottom-20 right-32 w-24 h-24 border border-gray-50 rounded-full"></div>
        </div>

        {/* Right Side - Form Section */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600">
                {resetEmailSent 
                  ? 'We\'ve sent a password reset link to your email address.'
                  : 'Enter your email address and we\'ll send you a link to reset your password.'
                }
              </p>
            </div>

            {!resetEmailSent ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setResetError(null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                {resetError && (
                  <Alert variant="destructive">
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Button 
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={goBackToLogin}
                    className="w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600">
                  If you don't see the email in your inbox, check your spam folder.
                </p>
                <Button 
                  variant="outline" 
                  onClick={goBackToLogin}
                  className="w-full py-3 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout for main auth
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white p-4 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <HandoffLogo className="mb-8" size="h-16" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isSignUp ? 'Create Account' : 'Welcome Back!'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSignUp 
                  ? 'Create your secure Handoff account'
                  : 'Sign in to your Handoff account'
                }
              </p>
            </div>
          </div>

          {/* <ServerStatusBanner showDetails={false} onServerAvailable={handleServerAvailable} /> */}
          
          {/* Show server connected status when available and no errors */}
          {serverAvailable && !authError && <ServerConnectedBanner />}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="buyerName" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="buyerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.buyerName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, buyerName: e.target.value }));
                    setErrors(prev => ({ ...prev, buyerName: '' }));
                  }}
                  className={`mobile-input ${errors.buyerName ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isLoading}
                  autoComplete="name"
                />
                {errors.buyerName && (
                  <p className="text-sm text-red-600">{errors.buyerName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="buyerEmail" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="buyerEmail"
                type="email"
                placeholder="Enter your email"
                value={formData.buyerEmail}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, buyerEmail: e.target.value }));
                  setErrors(prev => ({ ...prev, buyerEmail: '' }));
                }}
                className={`mobile-input ${errors.buyerEmail ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.buyerEmail && (
                <p className="text-sm text-red-600">{errors.buyerEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`pr-10 mobile-input ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isLoading}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {authError && (
              <div ref={errorContainerRef} tabIndex={-1}>
                <AuthErrorAlert 
                  error={authError}
                  onCreateAccount={handleCreateAccount}
                  onContinueAsGuest={handleContinueAsGuest}
                  onClearError={handleClearError}
                  onResendConfirmation={handleResendConfirmation}
                  formData={formData}
                  serverAvailable={serverAvailable}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors mobile-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                <Fragment>
                  <span className="flex items-center gap-2">
                    {serverAvailable && <Shield className="w-4 h-4" />}
                    {isSignUp ? 'Create Secure Account' : 'Sign In Securely'}
                  </span>
                </Fragment>
              )}
            </Button>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleClick}
              className="w-full py-3 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mobile-button"
              disabled={isLoading}
            >
              <GoogleIcon />
              Sign in with Google
              {serverAvailable && <span className="ml-auto text-xs text-green-600">✓ Secure</span>}
            </Button>
          </form>

          <div className="space-y-4">
            {!isSignUp && (
              <div className="flex items-center justify-center">
                <Button 
                  variant="link" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm h-auto p-0 text-gray-600 hover:text-gray-900"
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
              </p>
              <Button 
                variant="link" 
                onClick={toggleMode}
                className="text-sm h-auto p-0 text-blue-600 hover:text-blue-700 font-medium"
                disabled={isLoading}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </Button>
            </div>

            {!authError && !isSignUp && serverAvailable && <ServerConnectedOptions />}
          </div>

        </div>
      </div>
    );
  }

  // Desktop split-screen layout
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-gray-900 min-h-full">
          <div className="flex flex-col items-center justify-center flex-1">
            <HandoffLogo className="mb-8" size="h-56" />
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
            © 2025 Handoff. All rights reserved.
          </div>
        </div>
        <div className="absolute bottom-20 right-32 w-24 h-24 border border-gray-50 rounded-full"></div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Create your secure Handoff account to get started'
                : 'Sign in to access your real estate transaction dashboard'
              }
            </p>
          </div>

          {/* <ServerStatusBanner showDetails={false} onServerAvailable={handleServerAvailable} /> */}
          
          {/* Show server connected status when available and no errors */}
          {serverAvailable && !authError && <ServerConnectedBanner />}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="buyerName" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="buyerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.buyerName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, buyerName: e.target.value }));
                    setErrors(prev => ({ ...prev, buyerName: '' }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.buyerName ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isLoading}
                  autoComplete="name"
                />
                {errors.buyerName && (
                  <p className="text-sm text-red-600">{errors.buyerName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="buyerEmail" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="buyerEmail"
                type="email"
                placeholder="Enter your email"
                value={formData.buyerEmail}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, buyerEmail: e.target.value }));
                  setErrors(prev => ({ ...prev, buyerEmail: '' }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.buyerEmail ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.buyerEmail && (
                <p className="text-sm text-red-600">{errors.buyerEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isLoading}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {authError && (
              <div ref={errorContainerRef} tabIndex={-1}>
                <AuthErrorAlert
                  error={authError}
                  onCreateAccount={handleCreateAccount}
                  onContinueAsGuest={handleContinueAsGuest}
                  onClearError={handleClearError}
                  onResendConfirmation={handleResendConfirmation}
                  formData={formData}
                  serverAvailable={serverAvailable}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {serverAvailable && <Shield className="w-4 h-4" />}
                  {isSignUp ? 'Create Secure Account' : 'Sign In Securely'}
                </span>
              )}
            </Button>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleClick}
              className="w-full py-3 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <GoogleIcon />
              Sign in with Google
              {serverAvailable && <span className="ml-auto text-xs text-green-600">✓ Secure</span>}
            </Button>
          </form>

          <div className="space-y-4">
            {!isSignUp && (
              <div className="flex items-center justify-center">
                <Button 
                  variant="link" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm h-auto p-0 text-gray-600 hover:text-gray-900"
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
              </p>
              <Button 
                variant="link" 
                onClick={toggleMode}
                className="text-sm h-auto p-0 text-blue-600 hover:text-blue-700 font-medium"
                disabled={isLoading}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </Button>
            </div>

            {!authError && !isSignUp && serverAvailable && <ServerConnectedOptions />}
          </div>

          {/* Dream Home pre-onboarding prompt */}
          {!isSignUp && (
            <div className="mt-10">
              <DreamHomeAddressCapture onStartOnboarding={handleStartOnboarding} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
