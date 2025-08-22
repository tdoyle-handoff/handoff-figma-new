export interface DeploymentStatus {
  status: 'checking' | 'success' | 'error' | 'not-deployed';
  message: string;
  details?: any;
  timestamp: Date;
}

export interface DeploymentCheckerProps {
  projectId: string;
  publicAnonKey: string;
}