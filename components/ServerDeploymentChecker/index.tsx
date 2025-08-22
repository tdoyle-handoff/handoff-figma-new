import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { RefreshCw, Server, ExternalLink, Copy, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { DeploymentStatus } from './types';
import { StatusIcon } from './StatusIcon';
import { StatusBadge } from './StatusBadge';
import { DeploymentInstructions } from './DeploymentInstructions';
import { SuccessMessage } from './SuccessMessage';
import { ProjectInfo } from './ProjectInfo';
import { 
  buildHealthUrl, 
  createDeploymentStatus, 
  handleFetchError, 
  processHealthResponse 
} from './helpers';
import { DEPLOYMENT_MESSAGES, DEPLOYMENT_CONFIG } from './constants';

export function ServerDeploymentChecker() {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'checking',
    message: DEPLOYMENT_MESSAGES.CHECKING,
    timestamp: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const healthUrl = buildHealthUrl(projectId);

  const checkDeployment = async () => {
    setIsChecking(true);
    setDeploymentStatus(createDeploymentStatus('checking', DEPLOYMENT_MESSAGES.CHECKING));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEPLOYMENT_CONFIG.TIMEOUT_MS);

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await processHealthResponse(response);
      setDeploymentStatus(result);
    } catch (error) {
      const result = handleFetchError(error as Error);
      setDeploymentStatus(result);
    }

    setIsChecking(false);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(healthUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const openUrl = () => {
    window.open(healthUrl, '_blank');
  };

  useEffect(() => {
    checkDeployment();
  }, []);

  const needsDeployment = deploymentStatus.status === 'not-deployed' || deploymentStatus.status === 'error';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Server Deployment Status
          </CardTitle>
          <CardDescription>
            Check if your Supabase Edge Functions are deployed and accessible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <StatusIcon status={deploymentStatus.status} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">Deployment Status</h3>
                <StatusBadge status={deploymentStatus.status} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {deploymentStatus.message}
              </p>
              
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="text-sm flex-1 break-all">{healthUrl}</code>
                <Button size="sm" variant="outline" onClick={copyUrl} className="flex items-center gap-1">
                  {copiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedUrl ? 'Copied' : 'Copy'}
                </Button>
                <Button size="sm" variant="outline" onClick={openUrl} className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Button onClick={checkDeployment} disabled={isChecking} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Checking...' : 'Recheck Status'}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Last checked: {deploymentStatus.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {deploymentStatus.details && (
                <details className="mt-3">
                  <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(deploymentStatus.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectInfo projectId={projectId} publicAnonKey={publicAnonKey} />

      {needsDeployment && <DeploymentInstructions projectId={projectId} />}

      {deploymentStatus.status === 'success' && <SuccessMessage deploymentStatus={deploymentStatus} />}
    </div>
  );
}