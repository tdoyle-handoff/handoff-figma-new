import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { AuthTestForm } from './auth-test/AuthTestForm';
import { TestResultsList } from './auth-test/TestResultsList';
import { CurrentSession } from './auth-test/CurrentSession';
import { useAuthTestRunner } from '../hooks/useAuthTestRunner';

interface AuthTestData {
  email: string;
  password: string;
  fullName: string;
}

export function SupabaseAuthTest() {
  const [authData, setAuthData] = useState<AuthTestData>({
    email: 'test@handoff.demo',
    password: 'testpassword123',
    fullName: 'Test User'
  });

  const { testResults, isRunning, currentUserSession, runFullTest, clearTests } = useAuthTestRunner();

  const handleRunTests = () => {
    runFullTest(authData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <AuthTestForm
        authData={authData}
        setAuthData={setAuthData}
        onRunTests={handleRunTests}
        onClearTests={clearTests}
        isRunning={isRunning}
      />

      <TestResultsList testResults={testResults} />

      <CurrentSession sessionData={currentUserSession} />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This test suite validates that Supabase authentication is working correctly. 
          It tests sign up, sign in, profile management, and session verification.
          The same test email can be used multiple times - sign up will fail but sign in should work.
        </AlertDescription>
      </Alert>
    </div>
  );
}