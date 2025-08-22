import React from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { DeploymentStatus } from './types';

interface StatusIconProps {
  status: DeploymentStatus['status'];
}

export function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case 'success': 
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error': 
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'not-deployed': 
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'checking': 
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
  }
}