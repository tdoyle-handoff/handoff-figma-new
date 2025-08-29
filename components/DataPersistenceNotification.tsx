import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { CloudOff, Cloud, CloudCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DataPersistenceNotificationProps {
  className?: string;
  showCreateAccount?: boolean;
}

export function DataPersistenceNotification({ 
  className = "", 
  showCreateAccount = true 
}: DataPersistenceNotificationProps) {
  const { isAuthenticated, isGuestMode, userProfile } = useAuth();

  if (isAuthenticated && !isGuestMode) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CloudCheck className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Your data is automatically saved</strong> to your account and synced across all your devices.
          Welcome back, {userProfile?.full_name}!
        </AlertDescription>
      </Alert>
    );
  }

  if (isGuestMode) {
    return (
      <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
        <CloudOff className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between text-blue-800">
          <span>
            <strong>Guest Mode:</strong> Your data is saved locally but will be lost if you clear browser data or switch devices.
          </span>
          {showCreateAccount && (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => {
                // This would typically trigger the auth modal/signup flow
                window.location.href = '/?signup=true';
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Not authenticated
  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <Cloud className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between text-amber-800">
        <span>
          <strong>Sign in to save your data</strong> across devices and never lose your property calculations and offers.
        </span>
        {showCreateAccount && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() => {
              // This would typically trigger the auth modal/signup flow
              window.location.href = '/?signup=true';
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
