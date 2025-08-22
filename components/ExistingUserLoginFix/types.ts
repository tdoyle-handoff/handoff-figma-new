export interface LoginTestResult {
  step: string;
  status: 'success' | 'error' | 'pending' | 'running';
  message: string;
  action?: string;
  details?: any;
}

export interface UserCredentials {
  email: string;
  password: string;
  fullName: string;
}