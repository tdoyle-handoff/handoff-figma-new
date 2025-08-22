import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle } from 'lucide-react';
import { DeploymentStatus } from './types';

interface SuccessMessageProps {
  deploymentStatus: DeploymentStatus;
}

export function SuccessMessage({ deploymentStatus }: SuccessMessageProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          Server Successfully Deployed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 Great! Your authentication server is live and ready. You can now use all authentication features without "Server not available" errors.
          </AlertDescription>
        </Alert>

        {deploymentStatus.details?.endpoints && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-green-800">Available Services:</h4>
            <ul className="space-y-1 text-sm text-green-700">
              {deploymentStatus.details.endpoints.map((endpoint: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <code>{endpoint}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}