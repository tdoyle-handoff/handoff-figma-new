import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Home, AlertCircle, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PasswordResetProps {
  resetToken: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function PasswordReset({ resetToken, onSuccess, onBackToLogin }: PasswordResetProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Validate token when component mounts
    validateToken();
  }, [resetToken]);

  const validateToken = async () => {
    try {
      // For now, we'll just check if the token exists
      // In a real implementation, you might want to validate it against the server
      if (!resetToken || resetToken.length < 10) {
        setTokenError('Invalid reset token');
      } else {
        setTokenError(null);
      }
    } catch (error) {
      setTokenError('Invalid reset token');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);

    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const LogoSection = () => (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg">
        <Home className="w-8 h-8 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-primary">Handoff</h1>
        <p className="text-muted-foreground">Real Estate Platform</p>
      </div>
    </div>
  );

  if (isValidatingToken) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${isMobile ? 'px-4 py-8' : 'p-8'}`}>
        <div className="w-full max-w-md space-y-8">
          <LogoSection />
          
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Validating reset token...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${isMobile ? 'px-4 py-8' : 'p-8'}`}>
        <div className="w-full max-w-md space-y-8">
          <LogoSection />
          
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {tokenError}
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Password reset links expire after 1 hour for security reasons.
                </p>
                
                <Button
                  onClick={onBackToLogin}
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${isMobile ? 'px-4 py-8' : 'p-8'}`}>
        <div className="w-full max-w-md space-y-8">
          <LogoSection />
          
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been successfully updated.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You can now sign in with your new password.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  You will be redirected to the login page in a few seconds...
                </p>
                
                <Button
                  onClick={onSuccess}
                  className="w-full"
                >
                  Continue to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${isMobile ? 'px-4 py-8' : 'p-8'}`}>
      <div className="w-full max-w-md space-y-8">
        <LogoSection />
        
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Set New Password</CardTitle>
            <CardDescription>
              Enter your new password below to complete the reset process.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button
              onClick={onBackToLogin}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>

            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.submit}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={errors.newPassword ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            For security, this link will expire in 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
}
