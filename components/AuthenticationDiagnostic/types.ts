export interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'running';
  message: string;
  details?: any;
  timestamp: Date;
}

export interface UserTestData {
  email: string;
  password: string;
  fullName: string;
}