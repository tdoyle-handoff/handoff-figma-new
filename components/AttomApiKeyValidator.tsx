import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Key, RefreshCw, Shield } from 'lucide-react';
import { validateApiKey, getStatusMessage, getStatusBadgeProps, getAlertProps, type ApiKeyValidationResult } from './AttomApiKeyValidator/helpers';
import { ValidationDetails } from './AttomApiKeyValidator/ValidationDetails';
import { Recommendations } from './AttomApiKeyValidator/Recommendations';
import { TroubleshootingGuide } from './AttomApiKeyValidator/TroubleshootingGuide';

export function AttomApiKeyValidator() {
  const [validationResult, setValidationResult] = useState<ApiKeyValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [autoValidated, setAutoValidated] = useState(false);

  // Auto-validate on component mount
  useEffect(() => {
    if (!autoValidated) {
      handleValidateApiKey();
      setAutoValidated(true);
    }
  }, [autoValidated]);

  const handleValidateApiKey = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateApiKey();
      setValidationResult(result);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }

    if (!validationResult) {
      return <Key className="w-5 h-5 text-gray-400" />;
    }

    if (validationResult.success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }

    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const statusBadgeProps = getStatusBadgeProps(isValidating, validationResult);
  const statusMessage = getStatusMessage(isValidating, validationResult);
  const alertProps = getAlertProps(validationResult);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">ATTOM API Key Validation</h2>
          <p className="text-sm text-muted-foreground">
            Verify that your ATTOM API key is correctly configured and functional
          </p>
        </div>
      </div>

      {/* Main Status Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle>API Key Status</CardTitle>
                <CardDescription>Current validation status of your ATTOM API credentials</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusBadgeProps.variant} className={statusBadgeProps.className}>
                {statusBadgeProps.text}
              </Badge>
              <Button
                onClick={handleValidateApiKey}
                disabled={isValidating}
                variant="outline"
                size="sm"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isValidating ? 'Testing...' : 'Test Again'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={alertProps.className}>
            <AlertDescription className="text-sm">
              {statusMessage}
            </AlertDescription>
          </Alert>

          <ValidationDetails validationResult={validationResult} />

          {/* Error Details */}
          {validationResult && !validationResult.success && validationResult.details && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <div className="text-sm font-medium mb-1">Error Details:</div>
                <div className="text-xs text-muted-foreground">{validationResult.details}</div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Recommendations validationResult={validationResult} />
      <TroubleshootingGuide />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleValidateApiKey}
          disabled={isValidating}
          className="flex-1 sm:flex-none"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Shield className="w-4 h-4 mr-2" />
          )}
          {isValidating ? 'Validating...' : 'Validate API Key'}
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open('https://api.attomdata.com/docs', '_blank')}
          className="flex-1 sm:flex-none"
        >
          View API Docs
        </Button>

        <Button
          variant="outline"
          onClick={() => window.location.href = '?attom-admin=true'}
          className="flex-1 sm:flex-none"
        >
          Open Admin Panel
        </Button>
      </div>
    </div>
  );
}