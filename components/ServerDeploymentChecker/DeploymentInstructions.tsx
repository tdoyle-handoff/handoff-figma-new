import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DEPLOYMENT_STEPS } from './constants';

interface DeploymentInstructionsProps {
  projectId: string;
}

export function DeploymentInstructions({ projectId }: DeploymentInstructionsProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          Deployment Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your Supabase Edge Functions need to be deployed to make authentication work.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium">Quick Deployment Steps:</h4>
          <ol className="space-y-2 text-sm">
            {DEPLOYMENT_STEPS.map(({ step, command, description }) => (
              <li key={step} className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {step}
                </span>
                <span>
                  {description}: <code className="bg-muted px-1 rounded">
                    {command}{step === 3 ? ` ${projectId}` : ''}
                  </code>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Check out <code>QuickStart.md</code> and <code>SupabaseDeploymentGuide.md</code> for detailed instructions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}