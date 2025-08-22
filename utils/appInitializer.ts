import React from 'react';
import { ensureMapConstructor } from './mapPolyfill';

// Critical app initialization to prevent Map constructor errors
export function initializeApp(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log('🚀 Initializing Handoff application...');
      
      // Step 1: Ensure Map constructor is available
      ensureMapConstructor();
      
      // Step 2: Check for critical browser features
      const requiredFeatures = {
        'localStorage': typeof Storage !== 'undefined',
        'JSON': typeof JSON !== 'undefined',
        'Promise': typeof Promise !== 'undefined',
        'fetch': typeof fetch !== 'undefined',
        'URLSearchParams': typeof URLSearchParams !== 'undefined',
      };
      
      const missingFeatures = Object.entries(requiredFeatures)
        .filter(([feature, available]) => !available)
        .map(([feature]) => feature);
      
      if (missingFeatures.length > 0) {
        throw new Error(`Missing required browser features: ${missingFeatures.join(', ')}`);
      }
      
      // Step 3: Initialize error handling
      window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.error);
        
        // Check for Map constructor errors specifically
        if (event.error && event.error.message && 
            event.error.message.includes('Map is not a constructor')) {
          console.error('🚨 Map constructor error detected, attempting recovery...');
          
          // Clear problematic localStorage entries
          try {
            const keysToCheck = [
              'handoff-user-profile',
              'handoff-auth-session',
              'handoff-property-data'
            ];
            
            keysToCheck.forEach(key => {
              const stored = localStorage.getItem(key);
              if (stored) {
                try {
                  JSON.parse(stored); // Test if parseable
                } catch {
                  console.warn(`Clearing corrupted localStorage key: ${key}`);
                  localStorage.removeItem(key);
                }
              }
            });
          } catch (error) {
            console.error('Error clearing localStorage:', error);
          }
          
          // Force page reload as last resort
          setTimeout(() => {
            if (confirm('A critical error occurred. Would you like to reload the page to recover?')) {
              window.location.reload();
            }
          }, 1000);
        }
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Handle specific cases that might cause Map errors
        if (event.reason && typeof event.reason === 'object') {
          const reason = event.reason.toString();
          if (reason.includes('Map') || reason.includes('constructor')) {
            console.error('🚨 Map-related promise rejection detected');
          }
        }
      });
      
      // Step 4: Set up localStorage monitoring for corruption detection
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key: string, value: string) {
        try {
          return originalSetItem.call(this, key, value);
        } catch (error) {
          console.warn(`localStorage.setItem failed for key ${key}:`, error);
          // Try to clear space and retry
          if ((error as any).name === 'QuotaExceededError') {
            console.log('Storage quota exceeded, clearing old data...');
            const oldKeys = ['handoff-debug-logs', 'handoff-temp-data'];
            oldKeys.forEach(oldKey => {
              try {
                localStorage.removeItem(oldKey);
              } catch {}
            });
            // Retry
            try {
              return originalSetItem.call(this, key, value);
            } catch {
              throw error; // Give up if still failing
            }
          }
          throw error;
        }
      };
      
      // Step 5: Initialize performance monitoring
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('app-init-start');
      }
      
      console.log('✅ App initialization completed successfully');
      resolve();
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      reject(error);
    }
  });
}

// Safe component wrapper to handle initialization errors
export function withSafeInitialization<T extends Record<string, any>>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function SafeComponent(props: T) {
    const [initError, setInitError] = React.useState<Error | null>(null);
    const [initialized, setInitialized] = React.useState(false);
    
    React.useEffect(() => {
      initializeApp()
        .then(() => {
          setInitialized(true);
        })
        .catch((error) => {
          setInitError(error);
        });
    }, []);
    
    if (initError) {
      return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center bg-background p-8'
      }, React.createElement('div', {
        className: 'max-w-md w-full bg-card border border-border rounded-lg p-6 text-center'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'text-red-500 text-4xl mb-4'
        }, '⚠️'),
        React.createElement('h2', {
          key: 'title',
          className: 'text-xl font-semibold mb-2'
        }, 'Initialization Error'),
        React.createElement('p', {
          key: 'description',
          className: 'text-muted-foreground mb-4'
        }, 'The application failed to initialize properly. This may be due to browser compatibility issues.'),
        React.createElement('div', {
          key: 'error-details',
          className: 'space-y-2 text-sm text-left bg-muted p-3 rounded'
        }, [
          React.createElement('p', { key: 'error' }, React.createElement('strong', null, 'Error: '), initError.message),
          React.createElement('p', { key: 'suggestion' }, React.createElement('strong', null, 'Suggestion: '), 'Try refreshing the page or using a different browser.')
        ]),
        React.createElement('button', {
          key: 'reload-button',
          onClick: () => window.location.reload(),
          className: 'mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors'
        }, 'Reload Page')
      ]));
    }
    
    if (!initialized) {
      return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center bg-background'
      }, React.createElement('div', {
        className: 'text-center'
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'
        }),
        React.createElement('p', {
          key: 'text',
          className: 'text-muted-foreground'
        }, 'Initializing application...')
      ]));
    }
    
    return React.createElement(Component, props);
  };
}

// Recovery utilities
export const AppRecovery = {
  // Clear all localStorage data and reload
  fullReset: () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Error during full reset:', error);
      window.location.href = window.location.pathname; // Force navigation
    }
  },
  
  // Clear only Handoff-specific data
  clearAppData: () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('handoff-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`Cleared ${keysToRemove.length} Handoff localStorage keys`);
    } catch (error) {
      console.error('Error clearing app data:', error);
    }
  },
  
  // Test browser compatibility
  testCompatibility: () => {
    const tests = {
      map: () => new Map(),
      set: () => new Set(),
      promise: () => Promise.resolve(),
      fetch: () => typeof fetch !== 'undefined',
      localStorage: () => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      },
      json: () => {
        try {
          JSON.stringify({});
          JSON.parse('{}');
          return true;
        } catch {
          return false;
        }
      },
    };
    
    const results: Record<string, boolean> = {};
    
    Object.entries(tests).forEach(([name, test]) => {
      try {
        test();
        results[name] = true;
      } catch {
        results[name] = false;
      }
    });
    
    return results;
  },
  
  // Get diagnostic info
  getDiagnosticInfo: () => ({
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    localStorage: (() => {
      try {
        return Object.keys(localStorage).filter(k => k.startsWith('handoff-'));
      } catch {
        return ['localStorage not accessible'];
      }
    })(),
    compatibility: AppRecovery.testCompatibility(),
  }),
};