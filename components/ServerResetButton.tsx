import React from 'react';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface ServerResetButtonProps {
  onReset?: () => void;
  className?: string;
}

export function ServerResetButton({ onReset, className = "" }: ServerResetButtonProps) {
  const handleReset = () => {
    // Clear offline flag to allow fresh server checks
    localStorage.removeItem('handoff_server_offline');
    console.log('🔄 Server offline flag cleared - next requests will attempt server connection');
    onReset?.();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReset}
      className={`text-xs ${className}`}
      title="Reset server connection status"
    >
      <RefreshCw className="w-3 h-3 mr-1" />
      Reset Server
    </Button>
  );
}