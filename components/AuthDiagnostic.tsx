import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, Wrench } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserStatus {
  auth_user: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
    updated_at: string;
    last_sign_in_at: string | null;
    user_metadata: any;
    app_metadata: any;
  } | null;
  profile: any;
  status: {
    exists_in_auth: boolean;
    exists_in_profile: boolean;
    email_confirmed: boolean;
    has_password: boolean;
    last_sign_in: string;
  };
}

export function AuthDiagnostic() {
  const [userId, setUserId] = useState('98b31368-c08f-473a-8f4e-d24993990362');
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixPassword, setFixPassword] = useState('handoff123');
  const [fixResult, setFixResult] = useState<string | null>(null);

  const checkUserStatus = async () => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUserStatus(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/user/auth/user-status/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check user status');
      }

      const data = await response.json();
      setUserStatus(data);
    } catch (err) {
      console.error('Error checking user status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check user status');
    } finally {
      setIsLoading(false);
    }
  };

  const fixUserAccount = async () => {
    if (!userId.trim() || !fixPassword.trim()) {
      setError('Please enter both user ID and password');
      return;
    }

    if (fixPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFixResult(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/user/auth/fix-user-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId: userId,
          newPassword: fixPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fix account');
      }

      const data = await response.json();
      setFixResult(data.message);
      
      // Refresh user status after fix
      await checkUserStatus();
    } catch (err) {
      console.error('Error fixing account:', err);
      setError(err instanceof Error ? err.message : 'Failed to fix account');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const needsFix = userStatus && (
    !userStatus.status.email_confirmed || 
    !userStatus.status.has_password
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            Authentication Diagnostic & Fix Tool
          </CardTitle>
          <CardDescription>
            Diagnose and fix authentication issues for existing users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="userId" className="text-sm font-medium">
                User ID (UID from Supabase)
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button onClick={checkUserStatus} disabled={isLoading} className="w-full">
              {isLoading ? 'Checking...' : 'Check User Status'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {fixResult && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>{fixResult}</AlertDescription>
            </Alert>
          )}

          {userStatus && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Status Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Exists in Auth</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(userStatus.status.exists_in_auth)}
                        <Badge variant={userStatus.status.exists_in_auth ? "default" : "destructive"}>
                          {userStatus.status.exists_in_auth ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Email Confirmed</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(userStatus.status.email_confirmed)}
                        <Badge variant={userStatus.status.email_confirmed ? "default" : "destructive"}>
                          {userStatus.status.email_confirmed ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Has Password</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(userStatus.status.has_password)}
                        <Badge variant={userStatus.status.has_password ? "default" : "destructive"}>
                          {userStatus.status.has_password ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Profile Exists</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(userStatus.status.exists_in_profile)}
                        <Badge variant={userStatus.status.exists_in_profile ? "default" : "destructive"}>
                          {userStatus.status.exists_in_profile ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {userStatus.auth_user && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">User Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Email:</strong> {userStatus.auth_user.email}</div>
                        <div><strong>Created:</strong> {new Date(userStatus.auth_user.created_at).toLocaleString()}</div>
                        <div><strong>Last Updated:</strong> {new Date(userStatus.auth_user.updated_at).toLocaleString()}</div>
                        <div><strong>Last Sign In:</strong> {userStatus.status.last_sign_in}</div>
                        {userStatus.auth_user.email_confirmed_at && (
                          <div><strong>Email Confirmed:</strong> {new Date(userStatus.auth_user.email_confirmed_at).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {needsFix && (
                <Card className="border-yellow-300 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Account Needs Fixing
                    </CardTitle>
                    <CardDescription className="text-yellow-700">
                      This account has authentication issues that prevent sign-in. Use the fix tool below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="fixPassword" className="text-sm font-medium text-yellow-800">
                        New Password (minimum 6 characters)
                      </label>
                      <input
                        id="fixPassword"
                        type="password"
                        value={fixPassword}
                        onChange={(e) => setFixPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                      />
                      <p className="text-xs text-yellow-700">
                        This will set a new password and confirm the user's email address.
                      </p>
                    </div>

                    <Button onClick={fixUserAccount} disabled={isLoading} className="w-full bg-yellow-600 hover:bg-yellow-700">
                      {isLoading ? 'Fixing Account...' : 'Fix Account Now'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!needsFix && userStatus.status.exists_in_auth && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    ✅ Account looks healthy! The user should be able to sign in normally.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use This Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="font-medium text-blue-600">1.</span>
            <span>Enter the User ID (UID) from Supabase - you can find this in your Supabase dashboard</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-blue-600">2.</span>
            <span>Click "Check User Status" to see what's wrong with the account</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-blue-600">3.</span>
            <span>If issues are found, set a new password and click "Fix Account Now"</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-blue-600">4.</span>
            <span>The user can then sign in with their email and the new password</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}