import React from 'react';
import { ApiKeyValidationResult } from './helpers';

interface ValidationDetailsProps {
  validationResult: ApiKeyValidationResult | null;
}

export function ValidationDetails({ validationResult }: ValidationDetailsProps) {
  if (!validationResult?.validation) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="space-y-2">
        <div className="text-sm font-medium">Configuration</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>API Key Set: {validationResult.validation.apiKeySet ? '✓ Yes' : '✗ No'}</div>
          <div>Key Length: {validationResult.validation.apiKeyLength} characters</div>
          <div>Base URL: {validationResult.validation.baseUrl}</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Test Results</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>HTTP Status: {validationResult.validation.httpStatus}</div>
          <div>Authentication: {validationResult.validation.authenticationSuccessful ? '✓ Success' : '✗ Failed'}</div>
          <div>API Status: {validationResult.validation.apiStatus}</div>
        </div>
      </div>
    </div>
  );
}