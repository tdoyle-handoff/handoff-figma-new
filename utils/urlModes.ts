/**
 * URL Mode Detection Utility
 * Safely detects and manages URL-based application modes
 */

export interface UrlModes {
  isMappingManager: boolean;
  isApiKeyManager: boolean;
  isPathReference: boolean;
  isDeveloperMode: boolean;
  isDebugMode: boolean;
  isPropertySetupMode: boolean;
  isOfflineMode: boolean;
  isGuestMode: boolean;
  isPasswordResetMode: boolean;
  isApiConfigEditor: boolean;
  isFieldMappingDebugger: boolean;
  // Additional flags used by AppNotifications and diagnostic tools
  isDevMode?: boolean;
  isApiKeyManagerMode?: boolean;
  isAttomDebugMode?: boolean;
  isAttomTestMode?: boolean;
  isAuthDebugMode?: boolean;
  isAttomAdminMode?: boolean;
  isAttomAdminDiagnosticMode?: boolean;
  isApiKeyValidatorMode?: boolean;
  isAttomSearchDiagnosticMode?: boolean;
  isAttomApiFixSummaryMode?: boolean;
  isAttomEndpointAccessMode?: boolean;
  isAttomOfficialTesterMode?: boolean;
  isAttomApiKeySetupMode?: boolean;
  isPropertyFieldMappingMode?: boolean;
}

export function getUrlModes(): UrlModes {
  // Default modes
  const defaultModes: UrlModes = {
    isMappingManager: false,
    isApiKeyManager: false,
    isPathReference: false,
    isDeveloperMode: false,
    isDebugMode: false,
    isPropertySetupMode: false,
    isOfflineMode: false,
    isGuestMode: false,
    isPasswordResetMode: false,
    isApiConfigEditor: false,
    isFieldMappingDebugger: false,
  };

  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return defaultModes;
    }

    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      isMappingManager: urlParams.get('mapping-manager') === 'true',
      isApiKeyManager: urlParams.get('api-key-manager') === 'true',
      isPathReference: urlParams.get('path-reference') === 'true',
      isDeveloperMode: urlParams.get('dev') === 'true',
      isDebugMode: urlParams.get('debug') === 'true',
      isPropertySetupMode: urlParams.get('property-setup') === 'true',
      isOfflineMode: urlParams.get('offline') === 'true',
      isGuestMode: urlParams.get('guest') === 'true',
      isPasswordResetMode: urlParams.get('reset-password') === 'true',
      isApiConfigEditor: urlParams.get('api-config-editor') === 'true',
      isFieldMappingDebugger: urlParams.get('field-mapping-debugger') === 'true',
      // Map additional flags for compatibility
      isDevMode: urlParams.get('dev') === 'true',
      isApiKeyManagerMode: urlParams.get('api-key-manager') === 'true',
      isAttomDebugMode: urlParams.get('attom-debug') === 'true' || urlParams.get('debug') === 'true',
      isAttomTestMode: urlParams.get('attom-test') === 'true',
      isAuthDebugMode: urlParams.get('auth-debug') === 'true' || urlParams.get('debug') === 'true',
      isAttomAdminMode: urlParams.get('attom-admin') === 'true',
      isAttomAdminDiagnosticMode: urlParams.get('attom-admin-diagnostic') === 'true',
      isApiKeyValidatorMode: urlParams.get('api-key-validator') === 'true',
      isAttomSearchDiagnosticMode: urlParams.get('attom-search-diagnostic') === 'true',
      isAttomApiFixSummaryMode: urlParams.get('attom-api-fix-summary') === 'true',
      isAttomEndpointAccessMode: urlParams.get('attom-endpoint-access') === 'true',
      isAttomOfficialTesterMode: urlParams.get('attom-official-tester') === 'true',
      isAttomApiKeySetupMode: urlParams.get('attom-api-key-setup') === 'true',
      isPropertyFieldMappingMode: urlParams.get('property-field-mapping') === 'true',
    };
  } catch (error) {
    console.warn('Error parsing URL modes:', error);
    return defaultModes;
  }
}

export function setUrlMode(mode: keyof UrlModes, value: boolean): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    
    // Convert camelCase to kebab-case for URL parameter
    const paramName = mode.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^is-/, '');
    
    if (value) {
      urlParams.set(paramName, 'true');
    } else {
      urlParams.delete(paramName);
    }
    
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  } catch (error) {
    console.warn('Error setting URL mode:', error);
  }
}

export function clearAllUrlModes(): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    // Clear all query parameters
    const newUrl = window.location.pathname;
    window.history.pushState({}, '', newUrl);
  } catch (error) {
    console.warn('Error clearing URL modes:', error);
  }
}

export function getResetTokenFromUrl(): string | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  } catch (error) {
    console.warn('Error getting reset token from URL:', error);
    return null;
  }
}

// FIXED: Add the missing logUrlModes function
export function logUrlModes(modes: UrlModes): void {
  try {
    const activeModes = Object.entries(modes)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
    
    if (activeModes.length > 0) {
      console.log('🔧 URL Debug Modes Active:', {
        modes: activeModes,
        descriptions: activeModes.map(mode => URL_MODE_DESCRIPTIONS[mode as keyof UrlModes]),
        currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
      });
    } else if (modes.isDeveloperMode || modes.isDebugMode) {
      console.log('🔧 URL Modes: Normal mode (no special modes active)');
    }
  } catch (error) {
    console.warn('Error logging URL modes:', error);
  }
}

// Helper function to get current mode for debugging
export function getCurrentModeString(): string {
  try {
    const modes = getUrlModes();
    const activeModes = Object.entries(modes)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
    
    if (activeModes.length === 0) {
      return 'Normal Mode';
    }
    
    return `Debug Modes: ${activeModes.join(', ')}`;
  } catch (error) {
    console.warn('Error getting current mode string:', error);
    return 'Unknown Mode';
  }
}

// URL mode validation
export function validateUrlModes(modes: UrlModes): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  try {
    // Check for conflicting modes
    const debugModes = [
      modes.isMappingManager,
      modes.isApiKeyManager,
      modes.isPathReference,
      modes.isApiConfigEditor,
      modes.isFieldMappingDebugger
    ];
    
    const activeDebugModes = debugModes.filter(Boolean).length;
    
    if (activeDebugModes > 1) {
      issues.push('Multiple debug modes are active simultaneously');
    }
    
    // Check for invalid combinations
    if (modes.isOfflineMode && modes.isApiKeyManager) {
      issues.push('Offline mode and API Key Manager cannot be used together');
    }
    
    if (modes.isGuestMode && modes.isDeveloperMode) {
      issues.push('Guest mode and Developer mode should not be used together');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  } catch (error) {
    console.warn('Error validating URL modes:', error);
    return {
      isValid: false,
      issues: ['Error validating URL modes']
    };
  }
}

// URL mode descriptions for help/documentation
export const URL_MODE_DESCRIPTIONS: Record<keyof UrlModes, string> = {
  isMappingManager: 'Property field mapping configuration interface',
  isApiKeyManager: 'ATTOM and Google Places API key management interface',
  isPathReference: 'ATTOM API endpoint and data path reference guide',
  isDeveloperMode: 'Enhanced developer tools and debugging features',
  isDebugMode: 'General application debugging mode',
  isPropertySetupMode: 'Property setup wizard override mode',
  isOfflineMode: 'Offline application mode with limited functionality',
  isGuestMode: 'Guest user mode without authentication',
  isPasswordResetMode: 'Password reset flow activation',
  isApiConfigEditor: 'Interactive ATTOM API configuration and testing tool',
  isFieldMappingDebugger: 'Comprehensive field mapping analysis and debugging tool',
};

// Helper to get human-readable mode name
export function getModeDisplayName(mode: keyof UrlModes): string {
  const descriptions = {
    isMappingManager: 'Mapping Manager',
    isApiKeyManager: 'API Key Manager',
    isPathReference: 'Path Reference',
    isDeveloperMode: 'Developer Mode',
    isDebugMode: 'Debug Mode',
    isPropertySetupMode: 'Property Setup',
    isOfflineMode: 'Offline Mode',
    isGuestMode: 'Guest Mode',
    isPasswordResetMode: 'Password Reset',
    isApiConfigEditor: 'API Config Editor',
    isFieldMappingDebugger: 'Field Mapping Debugger',
  };
  
  return descriptions[mode] || mode;
}

// Helper to get URL parameter name from mode key
export function getModeUrlParam(mode: keyof UrlModes): string {
  return mode.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^is-/, '');
}

// Helper to generate URL with specific mode
export function generateModeUrl(mode: keyof UrlModes, baseUrl?: string): string {
  try {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const paramName = getModeUrlParam(mode);
    return `${base}?${paramName}=true`;
  } catch (error) {
    console.warn('Error generating mode URL:', error);
    return '/';
  }
}