import { STATUS_MESSAGES, API_STATUS_TYPES, VALIDATION_MESSAGES } from './constants';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export interface ApiKeyValidationResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  validation?: {
    apiKeySet: boolean;
    apiKeyLength: number;
    authenticationSuccessful: boolean;
    apiStatus: string;
    baseUrl: string;
    testEndpoint: string;
    httpStatus: number;
    responseStatus: any;
  };
  recommendations: string[];
  httpStatus?: number;
  apiResponse?: any;
}

export const validateApiKey = async (): Promise<ApiKeyValidationResult> => {
  try {
    console.log('Validating ATTOM API key...');

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom-admin/validate-api-key`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('API key validation response:', data);

    return data;
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      success: false,
      error: 'Failed to validate API key',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      recommendations: [
        'Check your internet connection',
        'Verify the server is running',
        'Try again in a few moments'
      ]
    };
  }
};

export const getStatusMessage = (isValidating: boolean, validationResult: ApiKeyValidationResult | null): string => {
  if (isValidating) {
    return STATUS_MESSAGES.VALIDATING;
  }

  if (!validationResult) {
    return STATUS_MESSAGES.NOT_TESTED;
  }

  return validationResult.message || validationResult.error || STATUS_MESSAGES.DEFAULT;
};

export const getStatusBadgeProps = (isValidating: boolean, validationResult: ApiKeyValidationResult | null) => {
  if (isValidating) {
    return { variant: 'secondary' as const, text: 'Validating...' };
  }

  if (!validationResult) {
    return { variant: 'outline' as const, text: 'Not Tested' };
  }

  if (validationResult.success) {
    const apiStatus = validationResult.validation?.apiStatus || 'active';
    if (apiStatus === API_STATUS_TYPES.ACTIVE_WITH_DATA) {
      return { variant: 'default' as const, text: 'Active (With Data)', className: 'bg-green-600 hover:bg-green-700' };
    } else if (apiStatus === API_STATUS_TYPES.ACTIVE_NO_DATA) {
      return { variant: 'default' as const, text: 'Active (No Sample Data)', className: 'bg-blue-600 hover:bg-blue-700' };
    }
    return { variant: 'default' as const, text: 'Valid', className: 'bg-green-600 hover:bg-green-700' };
  }

  if (validationResult.httpStatus === 401 || validationResult.httpStatus === 403) {
    return { variant: 'destructive' as const, text: 'Authentication Failed' };
  }

  return { variant: 'destructive' as const, text: 'Invalid' };
};

export const getAlertProps = (validationResult: ApiKeyValidationResult | null) => {
  if (!validationResult) {
    return { className: 'border-blue-200 bg-blue-50' };
  }
  
  return validationResult.success 
    ? { className: 'border-green-200 bg-green-50' }
    : { className: 'border-red-200 bg-red-50' };
};