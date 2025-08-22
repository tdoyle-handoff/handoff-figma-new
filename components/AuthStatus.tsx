import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { User, LogOut, UserPlus, AlertCircle, Shield } from 'lucide-react';

interface AuthStatusProps {
  isAuthenticated: boolean;
  isGuestMode: boolean;
  isOfflineMode: boolean;
  userProfile: any;
  setupData: any;
  onSignOut: () => void;
  className?: string;
}

export function AuthStatus({
  isAuthenticated,
  isGuestMode,
  isOfflineMode,
  userProfile,
  setupData,
  onSignOut,
  className = ""
}: AuthStatusProps) {
  if (!isAuthenticated) {
    return null;
  }

  const getAuthTypeInfo = () => {
    if (isGuestMode) {
      return {
        type: 'Guest',
        icon: User,
        color: 'bg-blue-100 text-blue-800',
        message: 'Your data will be lost when you close the browser.',
        actionText: 'Create Account',
        actionIcon: UserPlus
      };
    } else if (isOfflineMode && !isGuestMode) {
      return {
        type: 'Demo',
        icon: AlertCircle,
        color: 'bg-amber-100 text-amber-800',
        message: 'You\'re using demo mode. Create a real account to sync across devices.',
        actionText: 'Create Account',
        actionIcon: UserPlus
      };
    } else {
      return {
        type: 'Authenticated',
        icon: Shield,
        color: 'bg-green-100 text-green-800',
        message: `Signed in as ${userProfile?.full_name || setupData?.buyerName || 'User'}`,
        actionText: 'Sign Out',
        actionIcon: LogOut
      };
    }
  };

  const authInfo = getAuthTypeInfo();
  const Icon = authInfo.icon;
  const ActionIcon = authInfo.actionIcon;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Auth Type Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={`${authInfo.color} flex items-center gap-1`}>
          <Icon className="w-3 h-3" />
          {authInfo.type} Mode
        </Badge>
        {userProfile?.email && (
          <span className="text-sm text-muted-foreground">{userProfile.email}</span>
        )}
      </div>

      {/* Auth Message and Actions */}
      {(isGuestMode || (isOfflineMode && !isGuestMode)) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">{authInfo.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="ml-3 h-8 px-3 text-xs"
            >
              <ActionIcon className="w-3 h-3 mr-1" />
              {authInfo.actionText}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Regular authenticated user info */}
      {!isGuestMode && !isOfflineMode && userProfile && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{userProfile.full_name}</p>
              <p className="text-xs text-muted-foreground">{userProfile.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="h-8 px-3 text-xs"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}

// Compact version for headers or tight spaces
export function CompactAuthStatus({
  isAuthenticated,
  isGuestMode,
  isOfflineMode,
  userProfile,
  setupData,
  onSignOut,
  className = ""
}: AuthStatusProps) {
  if (!isAuthenticated) {
    return null;
  }

  const getDisplayName = () => {
    if (isGuestMode) return 'Guest';
    if (isOfflineMode && !isGuestMode) return 'Demo User';
    return userProfile?.full_name || setupData?.buyerName || 'User';
  };

  const getStatusColor = () => {
    if (isGuestMode) return 'text-blue-600';
    if (isOfflineMode && !isGuestMode) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isGuestMode ? 'bg-blue-500' : 
          isOfflineMode && !isGuestMode ? 'bg-amber-500' : 
          'bg-green-500'
        }`}></div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getDisplayName()}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onSignOut}
        className="h-6 px-2 text-xs hover:bg-muted"
      >
        <LogOut className="w-3 h-3" />
      </Button>
    </div>
  );
}