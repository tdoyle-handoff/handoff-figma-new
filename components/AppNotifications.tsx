import { Fragment } from 'react';
import React from 'react';
import { UrlModes } from '../utils/urlModes';

interface AppNotificationsProps {
  modes: UrlModes;
  authStatusMessage: string | null;
  isGuestMode: boolean;
  isLoading: boolean;
  onSignOut: () => void;
  onNavigateToDevTools: () => void;
}

export function AppNotifications({ 
  modes, 
  authStatusMessage, 
  isGuestMode, 
  isLoading, 
  onSignOut, 
  onNavigateToDevTools 
}: AppNotificationsProps) {
  return (
    <Fragment>
      {/* Authentication status notification for guest mode */}
      {isGuestMode && (
        <div className="bg-blue-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{authStatusMessage}</span>
            {!isLoading && (
              <button
                onClick={onSignOut}
                className="ml-4 underline hover:no-underline text-sm"
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      )}

      {/* Developer mode notification */}
      {modes.isDevMode && (
        <div className="bg-orange-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>Developer Mode Active</span>
            <button
              onClick={onNavigateToDevTools}
              className="ml-4 underline hover:no-underline text-sm"
            >
              Open Dev Tools
            </button>
          </div>
        </div>
      )}

      {/* API Key Manager mode notification */}
      {modes.isApiKeyManagerMode && (
        <div className="bg-purple-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
            </svg>
            <span>API Key Manager - Configure and Validate API Keys</span>
          </div>
        </div>
      )}

      {/* Debug mode notification */}
      {modes.isAttomDebugMode && (
        <div className="bg-purple-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span>Debug Mode Active - Attom API Testing Tool</span>
          </div>
        </div>
      )}

      {/* Attom Test Mode notification */}
      {modes.isAttomTestMode && (
        <div className="bg-green-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Attom API Test Tool - Comprehensive Testing & Debugging</span>
          </div>
        </div>
      )}

      {/* Auth Debug mode notification */}
      {modes.isAuthDebugMode && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Authentication Debug Panel - Diagnose Auth Issues</span>
          </div>
        </div>
      )}

      {/* Attom Admin mode notification */}
      {modes.isAttomAdminMode && (
        <div className="bg-violet-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Attom API Admin Panel - Configure Endpoints & Parameters</span>
          </div>
        </div>
      )}

      {/* Attom Admin Diagnostic mode notification */}
      {modes.isAttomAdminDiagnosticMode && (
        <div className="bg-emerald-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Attom Admin Diagnostic Tool - Troubleshoot Property-Basic Endpoint</span>
          </div>
        </div>
      )}

      {/* API Key Validator mode notification */}
      {modes.isApiKeyValidatorMode && (
        <div className="bg-amber-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
            </svg>
            <span>ATTOM API Key Validator - Diagnose Authentication Issues</span>
          </div>
        </div>
      )}

      {/* ATTOM Search Diagnostic mode notification */}
      {modes.isAttomSearchDiagnosticMode && (
        <div className="bg-cyan-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>ATTOM Search Diagnostic - Troubleshoot Address Search Failures</span>
          </div>
        </div>
      )}

      {/* ATTOM API Fix Summary mode notification */}
      {modes.isAttomApiFixSummaryMode && (
        <div className="bg-green-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>ATTOM API Fix Summary - Review All Applied Fixes</span>
          </div>
        </div>
      )}

      {/* ATTOM Endpoint Access mode notification */}
      {modes.isAttomEndpointAccessMode && (
        <div className="bg-blue-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
            </svg>
            <span>ATTOM Endpoint Access Diagnostic - Test API Key Permissions & Subscription Limits</span>
          </div>
        </div>
      )}

      {/* ATTOM Official Tester mode notification */}
      {modes.isAttomOfficialTesterMode && (
        <div className="bg-green-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span>ATTOM Official API Tester - Compare Current vs Official Implementation Patterns</span>
          </div>
        </div>
      )}

      {/* ATTOM API Key Setup mode notification */}
      {modes.isAttomApiKeySetupMode && (
        <div className="bg-yellow-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
            </svg>
            <span>ATTOM API Key Setup - Get New API Key & Fix Authentication Issues</span>
          </div>
        </div>
      )}

      {/* Property Field Mapping mode notification */}
      {modes.isPropertyFieldMappingMode && (
        <div className="bg-blue-600 text-white text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Property Field Mapping Configuration - Map ATTOM API Data to Property Overview Fields</span>
          </div>
        </div>
      )}

      {/* Google Places API Notice for developers - this would need API status check */}
      {modes.isDevMode && (
        <div className="bg-amber-100 dark:bg-amber-900 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-center py-2 px-4 text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>⚠️ <strong>Dev Notice:</strong> Address autocomplete will fall back to manual entry if Google Places API is not configured.</span>
            <a 
              href="?api-key-manager=true" 
              className="ml-2 underline hover:no-underline"
            >
              Configure API Keys
            </a>
          </div>
        </div>
      )}
    </Fragment>
  );
}