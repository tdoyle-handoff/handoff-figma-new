import { Fragment } from "react";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Database,
  Settings,
  TestTube,
  Code,
  Server,
  Key,
  FileText,
  Bug,
  ExternalLink,
  Copy,
  Eye,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { QuickPropertyBasicFix } from "./QuickPropertyBasicFix";

interface DiagnosticResult {
  test: string;
  status: "success" | "error" | "warning" | "pending";
  message: string;
  details?: any;
  timestamp: string;
}

interface EndpointConfig {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  isActive: boolean;
  showInPropertyDetails: boolean;
}

export function AttomAdminDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [adminConfig, setAdminConfig] = useState<any>(null);
  const [propertyBasicConfig, setPropertyBasicConfig] =
    useState<EndpointConfig | null>(null);

  const addDiagnostic = (
    test: string,
    status: "success" | "error" | "warning",
    message: string,
    details?: any,
  ) => {
    const result: DiagnosticResult = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    setDiagnostics((prev) => [...prev, result]);
    return result;
  };

  const getServerUrl = (path: string) => {
    return `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5${path}`;
  };

  // Test 1: Check server health
  const testServerHealth = async () => {
    try {
      const url = getServerUrl("/health");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServerHealth(data);
        addDiagnostic(
          "Server Health Check",
          "success",
          "Server is healthy and responding",
          { url, status: response.status, data },
        );
        return true;
      } else {
        const errorText = await response.text();
        addDiagnostic(
          "Server Health Check",
          "error",
          `Server health check failed: ${response.status}`,
          { url, status: response.status, error: errorText },
        );
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      addDiagnostic(
        "Server Health Check",
        "error",
        `Failed to connect to server: ${msg}`,
        { error: msg },
      );
      return false;
    }
  };

  // Test 2: Check Attom Admin endpoint availability
  const testAttomAdminEndpoint = async () => {
    try {
      const url = getServerUrl("/attom-admin/configurations");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminConfig(data);
        addDiagnostic(
          "Attom Admin Endpoint",
          "success",
          `Successfully loaded ${data.endpoints?.length || 0} endpoint configurations`,
          { url, status: response.status, data },
        );
        return data;
      } else {
        const errorText = await response.text();
        addDiagnostic(
          "Attom Admin Endpoint",
          "error",
          `Failed to load admin configurations: ${response.status}`,
          { url, status: response.status, error: errorText },
        );
        return null;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      addDiagnostic(
        "Attom Admin Endpoint",
        "error",
        `Error accessing admin endpoint: ${msg}`,
        { error: msg },
      );
      return null;
    }
  };

  // Test 3: Check property-basic configuration
  const testPropertyBasicConfig = async (configData: any) => {
    if (!configData?.endpoints) {
      addDiagnostic(
        "Property Basic Config",
        "error",
        "No endpoints found in configuration",
        { configData },
      );
      return false;
    }

    const propertyBasic = configData.endpoints.find(
      (ep: any) =>
        ep.id === "property_basic_profile" || ep.category === "property-basic",
    );

    if (propertyBasic) {
      setPropertyBasicConfig(propertyBasic);

      // Check for common endpoint URL issues
      let configIssues = [];
      let needsFix = false;

      if (propertyBasic.endpoint === "/property/basicprofile") {
        configIssues.push(
          "Endpoint URL missing API version - should be /propertyapi/v1.0.0/property/basicprofile",
        );
        needsFix = true;
      }

      if (
        !propertyBasic.endpoint.startsWith("/propertyapi/v1.0.0/") &&
        propertyBasic.endpoint.includes("property")
      ) {
        configIssues.push(
          "Endpoint URL may be missing proper API version prefix",
        );
        needsFix = true;
      }

      if (!propertyBasic.isActive) {
        configIssues.push("Endpoint is not active");
      }

      if (!propertyBasic.showInPropertyDetails) {
        configIssues.push(
          "Endpoint is not configured to show in property details",
        );
      }

      const status = needsFix
        ? "warning"
        : configIssues.length > 0
          ? "warning"
          : "success";
      const message = needsFix
        ? `Property basic profile endpoint has configuration issues that need fixing`
        : configIssues.length > 0
          ? `Property basic profile endpoint configured with minor issues`
          : `Property basic profile endpoint configured correctly: ${propertyBasic.name}`;

      addDiagnostic("Property Basic Config", status, message, {
        endpoint: propertyBasic,
        isActive: propertyBasic.isActive,
        showInPropertyDetails: propertyBasic.showInPropertyDetails,
        displayOrder: propertyBasic.displayOrder,
        configIssues: configIssues,
        needsFix: needsFix,
        recommendedEndpoint: needsFix
          ? "/propertyapi/v1.0.0/property/basicprofile"
          : null,
      });
      return true;
    } else {
      addDiagnostic(
        "Property Basic Config",
        "error",
        "Property basic profile endpoint not found in configuration",
        {
          availableEndpoints: configData.endpoints.map((ep: any) => ({
            id: ep.id,
            name: ep.name,
            endpoint: ep.endpoint,
          })),
        },
      );
      return false;
    }
  };

  // Test 4: Test property basic endpoint functionality
  const testPropertyBasicEndpoint = async () => {
    if (!propertyBasicConfig) {
      addDiagnostic(
        "Property Basic Test",
        "error",
        "Cannot test endpoint - configuration not found",
        {},
      );
      return false;
    }

    try {
      const url = getServerUrl("/attom-admin/test-endpoint");
      const testParams = {
        address: "11 village st, deep river, ct",
      };

      addDiagnostic(
        "Property Basic Test",
        "warning",
        "Testing property basic endpoint with sample address...",
        { testParams, endpointId: propertyBasicConfig.id },
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpointId: propertyBasicConfig.id,
          testParams,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Enhanced diagnostic information
        const diagnosticDetails = {
          testParams,
          result,
          apiUrl: result.url,
          responseStatus: result.status,
          responseSize: result.responseSize,
          contentType: result.contentType,
          responseHeaders: result.responseHeaders,
          endpointConfig: propertyBasicConfig,
        };

        if (result.success) {
          addDiagnostic(
            "Property Basic Test",
            "success",
            `Property basic endpoint test successful - API returned ${result.status} ${result.statusText}`,
            diagnosticDetails,
          );
          return true;
        } else {
          // More detailed error analysis
          let errorAnalysis = "Test failed";
          let recommendation = "";

          if (result.status === 401) {
            errorAnalysis = "Authentication failed - check ATTOM_API_KEY";
            recommendation =
              "Verify that ATTOM_API_KEY environment variable is set correctly";
          } else if (result.status === 403) {
            errorAnalysis = "Access forbidden - API key may lack permissions";
            recommendation =
              "Verify API key has access to Property Basic Profile endpoint";
          } else if (result.status === 404) {
            if (
              result.data?.responseText?.includes("path could not be found")
            ) {
              errorAnalysis =
                "Endpoint path is incorrect - likely missing API version";
              recommendation =
                'Run "Fix Endpoint URLs" to automatically correct the endpoint path';
            } else {
              errorAnalysis = "Endpoint not found - check endpoint URL";
              recommendation =
                "Verify the endpoint URL is correct for Attom API";
            }
          } else if (result.status === 429) {
            errorAnalysis = "Rate limit exceeded - too many requests";
            recommendation = "Wait a moment before testing again";
          } else if (result.status >= 500) {
            errorAnalysis = "Server error on Attom API side";
            recommendation =
              "This is a temporary issue with the Attom API servers";
          } else if (
            result.contentType &&
            !result.contentType.includes("json")
          ) {
            errorAnalysis = `API returned ${result.contentType} instead of JSON`;
            recommendation =
              "Check that the API base URL and endpoint path are correct";
          }

          (diagnosticDetails as any).recommendation = recommendation;

          addDiagnostic(
            "Property Basic Test",
            "error",
            `${errorAnalysis}: ${result.error || "Unknown error"}`,
            diagnosticDetails,
          );
          return false;
        }
      } else {
        let errorText;
        try {
          const errorResponse = await response.json();
          errorText =
            errorResponse.error ||
            errorResponse.details ||
            "Unknown server error";
        } catch {
          errorText = await response.text();
        }

        addDiagnostic(
          "Property Basic Test",
          "error",
          `Server error testing endpoint: ${response.status} ${response.statusText}`,
          {
            url,
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            testParams,
            serverHeaders: Object.fromEntries(response.headers.entries()),
          },
        );
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const stack = err instanceof Error ? err.stack : undefined;
      addDiagnostic(
        "Property Basic Test",
        "error",
        `Network error testing property basic endpoint: ${msg}`,
        {
          error: msg,
          stack,
          endpointConfig: propertyBasicConfig,
        },
      );
      return false;
    }
  };

  // Test 5: Check Attom API configuration specifically
  const testAttomApiConfiguration = async () => {
    try {
      // Test if we can make a simple request to verify API key and base URL
      const url = getServerUrl("/attom-admin/test-endpoint");
      const testParams = {
        address: "11 village st, deep river, ct", // Use the test address for API config test
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpointId: "property_basic_profile",
          testParams,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.status === 401) {
          addDiagnostic(
            "Attom API Configuration",
            "error",
            "ATTOM_API_KEY is missing or invalid",
            {
              apiResponse: result,
              recommendation:
                "Check that ATTOM_API_KEY environment variable is set correctly",
            },
          );
          return false;
        } else if (result.status === 403) {
          addDiagnostic(
            "Attom API Configuration",
            "warning",
            "ATTOM_API_KEY may lack required permissions",
            {
              apiResponse: result,
              recommendation:
                "Verify API key has access to Property Basic Profile endpoint",
            },
          );
          return false;
        } else if (
          result.contentType &&
          result.contentType.includes("text/html")
        ) {
          addDiagnostic(
            "Attom API Configuration",
            "error",
            "ATTOM_API_BASE_URL may be incorrect - receiving HTML instead of JSON",
            {
              apiResponse: result,
              recommendation:
                "Check that ATTOM_API_BASE_URL is set to https://search.onboard-apis.com",
            },
          );
          return false;
        } else if (
          result.success ||
          (result.status >= 200 && result.status < 300)
        ) {
          addDiagnostic(
            "Attom API Configuration",
            "success",
            "Attom API key and base URL are correctly configured",
            {
              apiResponse: result,
              baseUrl: "Configuration appears valid",
            },
          );
          return true;
        } else {
          addDiagnostic(
            "Attom API Configuration",
            "warning",
            `Attom API returned status ${result.status} - API may be configured but endpoint has issues`,
            {
              apiResponse: result,
              recommendation:
                "API credentials appear valid but endpoint may need attention",
            },
          );
          return true; // API config is likely OK, just endpoint issue
        }
      } else {
        addDiagnostic(
          "Attom API Configuration",
          "error",
          `Server error testing API configuration: ${response.status}`,
          {
            serverResponse: response.status,
            recommendation: "Check server logs for environment variable issues",
          },
        );
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      addDiagnostic(
        "Attom API Configuration",
        "error",
        `Error testing Attom API configuration: ${msg}`,
        {
          error: msg,
        },
      );
      return false;
    }
  };

  // Test 6: Check environment variables
  const testEnvironmentVariables = async () => {
    const varStatus: Record<string, boolean | string> = {};

    // We know these are available if we can make requests
    varStatus.SUPABASE_URL = projectId ? "Available" : "Missing";
    varStatus.SUPABASE_ANON_KEY = publicAnonKey ? "Available" : "Missing";
    varStatus.SUPABASE_SERVICE_ROLE_KEY = "Assumed Available"; // Can't check from client

    // Attom API vars will be checked in the specific API test
    varStatus.ATTOM_API_KEY = "Check API Configuration Test";
    varStatus.ATTOM_API_BASE_URL = "Check API Configuration Test";

    const hasBasicVars = !!projectId && !!publicAnonKey;

    addDiagnostic(
      "Environment Variables",
      hasBasicVars ? "success" : "error",
      hasBasicVars
        ? "Basic environment variables are configured. Check API Configuration test for Attom API variables."
        : "Missing required Supabase environment variables",
      {
        variables: varStatus,
        projectId,
        hasAnonKey: !!publicAnonKey,
        note: "Server-side variables cannot be directly checked from client",
      },
    );

    return hasBasicVars;
  };

  // Test 7: Check default configuration initialization
  const testDefaultConfigInitialization = async () => {
    try {
      const url = getServerUrl("/attom-admin/reset-default");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        addDiagnostic(
          "Default Config Init",
          "success",
          `Default configuration reset successful - ${result.endpoints} endpoints`,
          { result },
        );
        return true;
      } else {
        const errorText = await response.text();
        addDiagnostic(
          "Default Config Init",
          "error",
          `Failed to reset default configuration: ${response.status}`,
          { url, status: response.status, error: errorText },
        );
        return false;
      }
    } catch (error) {
      const err = error as Error;
      addDiagnostic(
        "Default Config Init",
        "error",
        `Error resetting default configuration: ${err.message}`,
        { error: err.message },
      );
      return false;
    }
  };

  // Test 8: Validate and fix endpoint URLs
  const testAndFixEndpointUrls = async () => {
    try {
      const url = getServerUrl("/attom-admin/fix-endpoints");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();

        if (result.fixedEndpoints > 0) {
          addDiagnostic(
            "Endpoint URL Validation",
            "warning",
            `Fixed ${result.fixedEndpoints} endpoint URL issues - configuration updated`,
            {
              result,
              recommendation:
                "Endpoint URLs have been automatically corrected to include proper API versions",
            },
          );
          return "fixed";
        } else {
          addDiagnostic(
            "Endpoint URL Validation",
            "success",
            "All endpoint URLs are correctly formatted",
            { result },
          );
          return true;
        }
      } else {
        const errorText = await response.text();
        addDiagnostic(
          "Endpoint URL Validation",
          "error",
          `Failed to validate endpoint URLs: ${response.status}`,
          { url, status: response.status, error: errorText },
        );
        return false;
      }
    } catch (error) {
      const err = error as Error;
      addDiagnostic(
        "Endpoint URL Validation",
        "error",
        `Error validating endpoint URLs: ${err.message}`,
        { error: err.message },
      );
      return false;
    }
  };

  // Test 9: Check property display configuration
  const testPropertyDisplayConfig = async () => {
    try {
      const url = getServerUrl("/attom-admin/property-display-config");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const displayEndpoints = result.displayConfig || [];
        const propertyBasicInDisplay = displayEndpoints.find(
          (ep: any) =>
            ep.id === "property_basic_profile" ||
            ep.category === "property-basic",
        );

        addDiagnostic(
          "Property Display Config",
          propertyBasicInDisplay ? "success" : "warning",
          propertyBasicInDisplay
            ? "Property basic profile is configured for display"
            : "Property basic profile not found in display configuration",
          {
            displayEndpoints: displayEndpoints.length,
            propertyBasicInDisplay: !!propertyBasicInDisplay,
            result,
          },
        );
        return !!propertyBasicInDisplay;
      } else {
        const errorText = await response.text();
        addDiagnostic(
          "Property Display Config",
          "error",
          `Failed to load property display configuration: ${response.status}`,
          { url, status: response.status, error: errorText },
        );
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      addDiagnostic(
        "Property Display Config",
        "error",
        `Error checking property display configuration: ${msg}`,
        { error: msg },
      );
      return false;
    }
  };

  // Run all diagnostics
  const runFullDiagnostic = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    try {
      addDiagnostic(
        "Diagnostic Started",
        "warning",
        "Starting comprehensive diagnostic of Attom Admin Panel and property-basic endpoint...",
        { timestamp: new Date().toISOString() },
      );

      // Step 1: Server Health
      const serverHealthy = await testServerHealth();

      // Step 2: Admin Endpoint
      const configData = await testAttomAdminEndpoint();

      // Step 3: Property Basic Config
      let propertyBasicFound = false;
      if (configData) {
        propertyBasicFound = await testPropertyBasicConfig(configData);
      }

      // Step 4: Environment Variables
      await testEnvironmentVariables();

      // Step 5: Attom API Configuration (API key and base URL)
      await testAttomApiConfiguration();

      // Step 6: Validate and fix endpoint URLs
      const urlFixResult = await testAndFixEndpointUrls();

      // Step 7: Property Basic Endpoint Test (only if config found)
      if (propertyBasicFound) {
        await testPropertyBasicEndpoint();
      }

      // Step 8: Property Display Config
      await testPropertyDisplayConfig();

      // Step 9: Default Config Init (only if needed)
      if (!configData?.endpoints?.length) {
        await testDefaultConfigInitialization();
        // Re-test after reset
        const newConfigData = await testAttomAdminEndpoint();
        if (newConfigData) {
          await testPropertyBasicConfig(newConfigData);
        }
      } else if (urlFixResult === "fixed") {
        // Re-test configuration after URL fixes
        const updatedConfigData = await testAttomAdminEndpoint();
        if (updatedConfigData) {
          await testPropertyBasicConfig(updatedConfigData);
        }
      }

      const finalSuccessCount = diagnostics.filter(
        (d) => d.status === "success",
      ).length;
      const finalErrorCount = diagnostics.filter(
        (d) => d.status === "error",
      ).length;

      addDiagnostic(
        "Diagnostic Complete",
        finalErrorCount === 0 ? "success" : "warning",
        `Diagnostic completed: ${finalSuccessCount} passed, ${finalErrorCount} failed`,
        {
          totalTests: diagnostics.length,
          successCount: finalSuccessCount,
          errorCount: finalErrorCount,
          timestamp: new Date().toISOString(),
        },
      );

      toast.success(
        `Diagnostic complete - ${finalSuccessCount} tests passed, ${finalErrorCount} failed`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const stack = err instanceof Error ? err.stack : undefined;
      addDiagnostic(
        "Diagnostic Runner",
        "error",
        `Diagnostic run failed: ${msg}`,
        { error: msg, stack },
      );
      toast.error("Diagnostic run failed");
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const successCount = diagnostics.filter((d) => d.status === "success").length;
  const errorCount = diagnostics.filter((d) => d.status === "error").length;
  const warningCount = diagnostics.filter((d) => d.status === "warning").length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quick Fix Component */}
        <QuickPropertyBasicFix />

        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bug className="w-6 h-6 text-primary" />
              Attom API Admin Panel Diagnostic
            </CardTitle>
            <CardDescription>
              Comprehensive diagnostic tool for troubleshooting property-basic
              endpoint configuration and admin panel functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={runFullDiagnostic}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <Fragment>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running Diagnostics...
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Zap className="w-4 h-4" />
                      Run Full Diagnostic
                    </Fragment>
                  )}
                </Button>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{successCount} Passed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>{errorCount} Failed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>{warningCount} Warnings</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("?attom-admin=true", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Admin Panel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status Overview */}
        {(serverHealth || adminConfig) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {serverHealth && (
                  <Fragment>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {serverHealth.status === "healthy"
                          ? "Healthy"
                          : "Issues"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Server Status
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {Object.keys(serverHealth.services || {}).length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Services
                      </div>
                    </div>
                  </Fragment>
                )}

                {adminConfig && (
                  <Fragment>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-purple-600">
                        {adminConfig.endpoints?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Endpoints
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-orange-600">
                        {adminConfig.endpoints?.filter((ep: any) => ep.isActive)
                          .length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active
                      </div>
                    </div>
                  </Fragment>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property Basic Configuration Details */}
        {propertyBasicConfig && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Property Basic Profile Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <Badge variant="outline">{propertyBasicConfig.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Method:
                    </span>
                    <Badge variant="secondary">
                      {propertyBasicConfig.method}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Active:
                    </span>
                    <Badge
                      variant={
                        propertyBasicConfig.isActive ? "default" : "destructive"
                      }
                    >
                      {propertyBasicConfig.isActive ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Display:
                    </span>
                    <Badge
                      variant={
                        propertyBasicConfig.showInPropertyDetails
                          ? "default"
                          : "secondary"
                      }
                    >
                      {propertyBasicConfig.showInPropertyDetails ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Endpoint URL:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        {propertyBasicConfig.endpoint}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(propertyBasicConfig.endpoint)
                        }
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnostic Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Diagnostic Results
            </CardTitle>
            <CardDescription>
              Detailed results from all diagnostic tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {diagnostics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  No diagnostics run yet. Click "Run Full Diagnostic" to begin.
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {diagnostics.map((diagnostic, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        {getStatusIcon(diagnostic.status)}
                        <div className="flex-1 text-left">
                          <div className="font-medium">{diagnostic.test}</div>
                          <div
                            className={`text-sm ${getStatusColor(diagnostic.status)}`}
                          >
                            {diagnostic.message}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(diagnostic.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Test Details:
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                diagnostic.status === "success"
                                  ? "default"
                                  : diagnostic.status === "error"
                                    ? "destructive"
                                    : diagnostic.status === "warning"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {diagnostic.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        {diagnostic.details && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">
                              Additional Information:
                            </span>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(diagnostic.details, null, 2)}
                              </pre>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  copyToClipboard(
                                    JSON.stringify(diagnostic.details, null, 2),
                                  )
                                }
                              >
                                <Copy className="w-3 h-3 mr-2" />
                                Copy Details
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common troubleshooting actions for property-basic endpoint issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={testDefaultConfigInitialization}
                className="justify-start"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Default Configuration
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  const result = await testAndFixEndpointUrls();
                  if (result === "fixed") {
                    // Re-test configuration after fix
                    const updatedConfigData = await testAttomAdminEndpoint();
                    if (updatedConfigData) {
                      await testPropertyBasicConfig(updatedConfigData);
                      // Re-test the endpoint with fixed configuration
                      await testPropertyBasicEndpoint();
                    }
                  }
                }}
                className="justify-start"
              >
                <Zap className="w-4 h-4 mr-2" />
                Fix Endpoint URLs & Re-test
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open("?attom-admin=true", "_blank")}
                className="justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Admin Panel
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      {
                        projectId,
                        adminEndpoint: getServerUrl(
                          "/attom-admin/configurations",
                        ),
                      },
                      null,
                      2,
                    ),
                  )
                }
                className="justify-start"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Configuration Info
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open("?attom-test=true", "_blank")}
                className="justify-start"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Open API Test Tool
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Environment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Environment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Project ID:
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {projectId}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(projectId)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Server Base URL:
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {getServerUrl("")}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(getServerUrl(""))}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Admin Panel URL:
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {window.location.origin}?attom-admin=true
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}?attom-admin=true`,
                      )
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
