import { LoginTestResult, UserCredentials } from './types';

export const createTestResult = (
  step: string,
  status: LoginTestResult['status'],
  message: string,
  action?: string,
  details?: any
): LoginTestResult => ({
  step,
  status,
  message,
  action,
  details
});

export const testServerConnection = async (): Promise<LoginTestResult> => {
  return createTestResult(
    'Server Connection',
    'error',
    'Server-side auth fallback was removed',
    'Use direct Supabase authentication instead'
  );
};

export const testSignIn = async (_credentials: UserCredentials): Promise<LoginTestResult> => {
  return createTestResult(
    'Sign In Attempt',
    'error',
    'Legacy sign-in diagnostic removed',
    'Use the normal sign-in flow'
  );
};

export const createAccount = async (_credentials: UserCredentials): Promise<LoginTestResult> => {
  return createTestResult(
    'Account Creation Check',
    'error',
    'Legacy account creation diagnostic removed',
    'Use the normal sign-up flow'
  );
};
