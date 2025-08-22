import React from 'react';
import { Badge } from '../ui/badge';
import { DeploymentStatus } from './types';

interface StatusBadgeProps {
  status: DeploymentStatus['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'success': 
      return <Badge variant="default" className="bg-green-100 text-green-800">Deployed</Badge>;
    case 'error': 
      return <Badge variant="destructive">Error</Badge>;
    case 'not-deployed': 
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Not Deployed</Badge>;
    case 'checking': 
      return <Badge variant="secondary">Checking...</Badge>;
  }
}