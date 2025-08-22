import React from 'react';
import { ApiKeyManager } from './ApiKeyManager';
import { AttomApiPathReference } from './AttomApiPathReference';
import { PropertyFieldMappingManager } from './PropertyFieldMappingManager';
import { AttomApiConfigurationTool } from './AttomApiConfigurationTool';
import { AttomEndpointFieldMappingDebugger } from './AttomEndpointFieldMappingDebugger';

interface DebugModeProps {
  modes: {
    isMappingManager: boolean;
    isApiKeyManager: boolean;
    isPathReference: boolean;
    isDeveloperMode: boolean;
    isDebugMode: boolean;
    isPropertySetupMode: boolean;
    isOfflineMode: boolean;
    isGuestMode: boolean;
    isPasswordResetMode: boolean;
    isApiConfigEditor?: boolean;
    isFieldMappingDebugger?: boolean;
  };
}

export function DebugModeRenderer({ modes }: DebugModeProps): React.ReactElement | null {
  // Field Mapping Debugger - new debugging tool
  if (modes.isFieldMappingDebugger) {
    return <AttomEndpointFieldMappingDebugger />;
  }

  // API Key Manager
  if (modes.isApiKeyManager) {
    return <ApiKeyManager />;
  }

  // Path Reference Guide
  if (modes.isPathReference) {
    return <AttomApiPathReference />;
  }

  // Property Field Mapping Manager
  if (modes.isMappingManager) {
    return <PropertyFieldMappingManager />;
  }

  // API Configuration Editor
  if (modes.isApiConfigEditor) {
    return <AttomApiConfigurationTool />;
  }

  return null;
}