import { DeploymentStatus } from './types';
import { DEPLOYMENT_MESSAGES, DEPLOYMENT_CONFIG } from './constants';

export const buildServerUrl = (projectId: string): string => {
  return `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5`;
};

export const buildHealthUrl = (projectId: string): string => {
  return `${buildServerUrl(projectId)}${DEPLOYMENT_CONFIG.HEALTH_ENDPOINT_SUFFIX}`;
};

export const createDeploymentStatus = (
  status: DeploymentStatus['status'],
  message: string,
  details?: any
): DeploymentStatus => ({
  status,
  message,
  details,
  timestamp: new Date()
});

export const handleFetchError = (error: Error): DeploymentStatus => {
  if (error.name === 'AbortError') {
    return createDeploymentStatus(
      'not-deployed',
      DEPLOYMENT_MESSAGES.TIMEOUT,
      { error: 'Request timeout after 10 seconds' }
    );
  }
  
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return createDeploymentStatus(
      'not-deployed',
      DEPLOYMENT_MESSAGES.NOT_AVAILABLE,
      { 
        error: error.message,
        suggestion: 'Run the deployment script to make server available'
      }
    );
  }
  
  return createDeploymentStatus(
    'error',
    `${DEPLOYMENT_MESSAGES.ERROR_PREFIX}${error.message}`,
    { error: error.message }
  );
};

export const processHealthResponse = async (response: Response): Promise<DeploymentStatus> => {
  if (!response.ok) {
    return createDeploymentStatus(
      'error',
      `❌ Server responded with error: ${response.status} ${response.statusText}`,
      {
        status: response.status,
        statusText: response.statusText
      }
    );
  }

  const data = await response.json();
  
  if (data.success && data.status === 'healthy') {
    return createDeploymentStatus(
      'success',
      DEPLOYMENT_MESSAGES.SUCCESS,
      {
        server: data.server,
        version: data.version,
        timestamp: data.timestamp,
        endpoints: data.endpoints,
        environment: data.environment
      }
    );
  }
  
  return createDeploymentStatus(
    'error',
    '⚠️ Server responded but may have configuration issues',
    data
  );
};