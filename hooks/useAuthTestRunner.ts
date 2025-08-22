import { useState } from 'react';
import type { TestResult } from '../components/auth-test/TestResultsList';

interface AuthTestData {
  email: string;
  password: string;
  fullName: string;
}

export function useAuthTestRunner() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUserSession, setCurrentUserSession] = useState<any>(null);

  const addTestResult = (test: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev.filter(r => r.test !== test), { test, status, message, data }]);
  };

  const runFullTest = async (_authData: AuthTestData) => {
    setIsRunning(true);
    try {
      addTestResult('general', 'error', 'Legacy auth diagnostics removed');
    } finally {
      setIsRunning(false);
    }
  };

  const clearTests = () => {
    setTestResults([]);
    setCurrentUserSession(null);
  };

  return {
    testResults,
    isRunning,
    currentUserSession,
    runFullTest,
    clearTests,
  };
}
