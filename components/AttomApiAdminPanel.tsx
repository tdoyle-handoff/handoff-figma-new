import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Save,
  TestTube,
  Settings,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Wrench,
  BookOpen,
  RefreshCw,
  Activity,
  Bug,
  Copy,
  RotateCcw,
  Code,
  Lightbulb,
  Zap,
  FileText,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AttomEndpointConfig {
  id: string;
  name: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  description: string;
  category: string;
  requiredParams: AttomParameter[];
  optionalParams: AttomParameter[];
  responseFields: AttomResponseField[];
  isActive: boolean;
  showInPropertyDetails: boolean;
  displayOrder: number;
  lastTested?: string;
  testResult?: "success" | "error" | "warning";
  created: string;
  modified: string;
}

interface AttomParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array";
  description: string;
  example: string;
  validation?: string;
  defaultValue?: string;
  possibleValues?: string[];
  isRequired?: boolean;
  format?: string;
}

interface AttomResponseField {
  name: string;
  path: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  isRequired: boolean;
  mapping?: string;
  displayInPropertyDetails: boolean;
  displayName?: string;
}

interface ParameterTemplate {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "array";
  description: string;
  example: string;
  category:
    | "address"
    | "location"
    | "property"
    | "search"
    | "filter"
    | "format";
  defaultValue?: string;
  possibleValues?: string[];
  validation?: string;
  format?: string;
}

interface DebugLog {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: any;
}

// Predefined parameter templates for common Attom API parameters
const getParameterTemplates = (): ParameterTemplate[] => [
  // Address parameters
  {
    id: "address",
    name: "address",
    type: "string",
    description: "Full property address including street, city, and state",
    example: "123 Oak Street, Riverside Heights, CA 90210",
    category: "address",
    format: "street_address, city, state zip",
    validation: "Must include street address, city, and state",
  },
  {
    id: "address1",
    name: "address1",
    type: "string",
    description: "Street address line 1",
    example: "123 Oak Street",
    category: "address",
    format: "street_number street_name",
    validation: "Required street number and name",
  },
  {
    id: "address2",
    name: "address2",
    type: "string",
    description: "Street address line 2 (unit, apt, suite)",
    example: "Apt 4B",
    category: "address",
    format: "unit_type unit_number",
  },
  {
    id: "city",
    name: "city",
    type: "string",
    description: "City name",
    example: "Beverly Hills",
    category: "location",
  },
  {
    id: "state",
    name: "state",
    type: "string",
    description: "State abbreviation (2 characters)",
    example: "CA",
    category: "location",
    format: "XX",
    validation: "Must be 2-character state code",
    possibleValues: [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
      "DC",
    ],
  },
  {
    id: "zipcode",
    name: "zipcode",
    type: "string",
    description: "ZIP code (5 or 9 digits)",
    example: "90210",
    category: "location",
    format: "XXXXX or XXXXX-XXXX",
    validation: "Must be 5 digits or 5+4 format",
  },
  {
    id: "postalcode",
    name: "postalcode",
    type: "string",
    description: "Postal code",
    example: "90210",
    category: "location",
    format: "XXXXX",
  },

  // Property identification parameters
  {
    id: "apn",
    name: "apn",
    type: "string",
    description: "Assessor Parcel Number",
    example: "4356-789-01",
    category: "property",
    format: "varies by county",
  },
  {
    id: "fips",
    name: "fips",
    type: "string",
    description: "Federal Information Processing Standards code",
    example: "06037",
    category: "location",
    format: "XXXXX",
  },
  {
    id: "msa",
    name: "msa",
    type: "string",
    description: "Metropolitan Statistical Area code",
    example: "31080",
    category: "location",
  },

  // Search and filter parameters
  {
    id: "radius",
    name: "radius",
    type: "number",
    description: "Search radius in miles",
    example: "5",
    category: "search",
    validation: "Must be positive number",
    possibleValues: ["1", "2", "5", "10", "25", "50"],
  },
  {
    id: "propertytype",
    name: "propertytype",
    type: "string",
    description: "Type of property",
    example: "SFR",
    category: "property",
    possibleValues: ["SFR", "CON", "TWH", "CPR", "MFR", "CND", "OTH"],
    validation: "Must be valid property type code",
  },
  {
    id: "bedrooms",
    name: "bedrooms",
    type: "number",
    description: "Number of bedrooms",
    example: "3",
    category: "property",
    validation: "Must be positive integer",
  },
  {
    id: "bathrooms",
    name: "bathrooms",
    type: "number",
    description: "Number of bathrooms",
    example: "2",
    category: "property",
    validation: "Can include half baths (e.g., 2.5)",
  },

  // Date parameters
  {
    id: "startdate",
    name: "startdate",
    type: "string",
    description: "Start date for date range queries",
    example: "2023-01-01",
    category: "filter",
    format: "YYYY-MM-DD",
    validation: "Must be valid date in YYYY-MM-DD format",
  },
  {
    id: "enddate",
    name: "enddate",
    type: "string",
    description: "End date for date range queries",
    example: "2024-01-01",
    category: "filter",
    format: "YYYY-MM-DD",
    validation: "Must be valid date in YYYY-MM-DD format",
  },

  // Price parameters
  {
    id: "minprice",
    name: "minprice",
    type: "number",
    description: "Minimum property value",
    example: "500000",
    category: "filter",
    validation: "Must be positive number",
  },
  {
    id: "maxprice",
    name: "maxprice",
    type: "number",
    description: "Maximum property value",
    example: "1000000",
    category: "filter",
    validation: "Must be positive number",
  },

  // Format and output parameters
  {
    id: "debug",
    name: "debug",
    type: "string",
    description: "Include debug information in API response",
    example: "True",
    category: "format",
    possibleValues: ["True", "False"],
    defaultValue: "True",
  },
  {
    id: "format",
    name: "format",
    type: "string",
    description: "Response format",
    example: "json",
    category: "format",
    possibleValues: ["json", "xml"],
    defaultValue: "json",
  },
  {
    id: "page",
    name: "page",
    type: "number",
    description: "Page number for paginated results",
    example: "1",
    category: "format",
    validation: "Must be positive integer",
    defaultValue: "1",
  },
  {
    id: "pagesize",
    name: "pagesize",
    type: "number",
    description: "Number of results per page",
    example: "10",
    category: "format",
    validation: "Must be between 1 and 100",
    possibleValues: ["10", "25", "50", "100"],
  },
];

// Default configuration template
const getDefaultEndpoints = (): AttomEndpointConfig[] => [
  {
    id: "property_basic_profile",
    name: "Property Basic Profile",
    endpoint: "/propertyapi/v1.0.0/property/basicprofile",
    method: "GET",
    description:
      "Get basic property information including address, lot size, building area, and ownership details",
    category: "property-basic",
    displayOrder: 1,
    isActive: true,
    showInPropertyDetails: true,
    requiredParams: [
      {
        name: "address",
        type: "string",
        description: "Full property address including street, city, and state",
        example: "123 Oak Street, Riverside Heights, CA 90210",
        format: "street_address, city, state zip",
        validation: "Must include street address, city, and state",
      },
    ],
    optionalParams: [
      {
        name: "debug",
        type: "string",
        description: "Include debug information in API response",
        example: "True",
        defaultValue: "True",
        possibleValues: ["True", "False"],
      },
    ],
    responseFields: [
      {
        name: "property_address",
        path: "property[0].address",
        type: "object",
        description: "Complete property address information",
        isRequired: true,
        displayInPropertyDetails: true,
        displayName: "Property Address",
      },
      {
        name: "lot_info",
        path: "property[0].lot",
        type: "object",
        description: "Lot size and dimensions",
        isRequired: true,
        displayInPropertyDetails: true,
        displayName: "Lot Information",
      },
      {
        name: "building_info",
        path: "property[0].building",
        type: "object",
        description: "Building details and characteristics",
        isRequired: true,
        displayInPropertyDetails: true,
        displayName: "Building Information",
      },
      {
        name: "owner_info",
        path: "property[0].owner",
        type: "object",
        description: "Current property owner information",
        isRequired: false,
        displayInPropertyDetails: true,
        displayName: "Owner Information",
      },
    ],
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  },
  {
    id: "property_expanded_profile",
    name: "Property Expanded Profile",
    endpoint: "/propertyapi/v1.0.0/property/expandedprofile",
    method: "GET",
    description:
      "Get comprehensive property information including detailed building characteristics, room counts, and features",
    category: "property-expanded",
    displayOrder: 2,
    isActive: true,
    showInPropertyDetails: true,
    requiredParams: [
      {
        name: "address",
        type: "string",
        description: "Full property address including street, city, and state",
        example: "123 Oak Street, Riverside Heights, CA 90210",
        format: "street_address, city, state zip",
      },
    ],
    optionalParams: [
      {
        name: "debug",
        type: "string",
        description: "Include debug information in API response",
        example: "True",
        defaultValue: "True",
        possibleValues: ["True", "False"],
      },
    ],
    responseFields: [
      {
        name: "building_details",
        path: "property[0].building",
        type: "object",
        description: "Detailed building information",
        isRequired: true,
        displayInPropertyDetails: true,
        displayName: "Building Details",
      },
      {
        name: "room_information",
        path: "property[0].building.rooms",
        type: "object",
        description: "Room counts and details",
        isRequired: true,
        displayInPropertyDetails: true,
        displayName: "Room Information",
      },
      {
        name: "property_features",
        path: "property[0].building.construction",
        type: "object",
        description: "Construction and feature details",
        isRequired: true,
        displayInPropertyDetails: true,
        displayName: "Property Features",
      },
    ],
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  },
  {
    id: "school_data",
    name: "School Information",
    endpoint: "/schoolapi/v1.0.0/school/detail",
    method: "GET",
    description:
      "Get school district and individual school information for a property address",
    category: "school",
    displayOrder: 3,
    isActive: true,
    showInPropertyDetails: true,
    requiredParams: [
      {
        name: "address",
        type: "string",
        description: "Full property address including street, city, and state",
        example: "123 Oak Street, Riverside Heights, CA 90210",
      },
    ],
    optionalParams: [
      {
        name: "debug",
        type: "string",
        description: "Include debug information in API response",
        example: "True",
        defaultValue: "True",
        possibleValues: ["True", "False"],
      },
    ],
    responseFields: [
      {
        name: "school_district",
        path: "school[0].district",
        type: "object",
        description: "School district information",
        isRequired: true,
        displayInPropertyDetails: true,
        displayName: "School District",
      },
      {
        name: "schools",
        path: "school[0].institution",
        type: "array",
        description: "List of schools serving this address",
        isRequired: true,
        displayInPropertyDetails: true,
        displayName: "Schools",
      },
    ],
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  },
];

export function AttomApiAdminPanel() {
  const [endpoints, setEndpoints] = useState<AttomEndpointConfig[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<AttomEndpointConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isInitializing, setIsInitializing] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedEndpoints, setSelectedEndpoints] = useState<Set<string>>(
    new Set(),
  );
  const [parameterTemplates] = useState<ParameterTemplate[]>(
    getParameterTemplates(),
  );
  const [showParameterLibrary, setShowParameterLibrary] = useState(false);

  const categories = [
    "all",
    "property-basic",
    "property-expanded",
    "neighborhood",
    "school",
    "risk-assessment",
    "market-trends",
    "environmental",
    "demographics",
    "ownership",
    "valuation",
  ];

  const parameterCategories = [
    "all",
    "address",
    "location",
    "property",
    "search",
    "filter",
    "format",
  ];

  // Enhanced debug logging
  const addDebugLog = (
    level: "info" | "warn" | "error",
    message: string,
    data?: any,
  ) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
    setDebugLogs((prev) => [log, ...prev.slice(0, 49)]); // Keep only last 50 logs
    console.log(`[Attom Admin ${level.toUpperCase()}]`, message, data);
  };

  // Load configurations from server
  useEffect(() => {
    loadConfigurations();
  }, []);

  const getServerUrl = (path: string) => {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5${path}`;
    addDebugLog("info", `Building server URL: ${url}`, { path, projectId });
    return url;
  };

  const loadConfigurations = async () => {
    setIsLoading(true);
    addDebugLog("info", "Starting configuration load");

    try {
      const url = getServerUrl("/attom-admin/configurations");
      addDebugLog("info", "Making request to load configurations", { url });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
      });

      addDebugLog("info", "Response received", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.ok) {
        const data = await response.json();
        addDebugLog("info", "Configuration data loaded successfully", {
          endpointsCount: data.endpoints?.length || 0,
          data,
        });

        setEndpoints(data.endpoints || []);

        if (!data.endpoints || data.endpoints.length === 0) {
          addDebugLog("warn", "No endpoints found in loaded configuration");
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: "Failed to parse error response" };
        }

        addDebugLog("error", "Failed to load configurations from server", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const stack = err instanceof Error ? err.stack : undefined;
      addDebugLog("error", "Configuration load failed", {
        error: msg,
        stack,
      });

      console.error("Failed to load configurations:", err);
      toast.error(`Failed to load API configurations: ${msg}`);

      // Load default configuration if server fails
      const defaultEndpoints = getDefaultEndpoints();
      setEndpoints(defaultEndpoints);

      addDebugLog("info", "Loaded default configuration as fallback", {
        endpointsCount: defaultEndpoints.length,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async (endpoint: AttomEndpointConfig) => {
    setIsLoading(true);
    addDebugLog("info", "Starting configuration save", {
      endpointId: endpoint.id,
      endpointName: endpoint.name,
    });

    try {
      // Validate the endpoint data before sending
      if (!endpoint.name || endpoint.name.trim() === "") {
        throw new Error("Endpoint name is required");
      }

      if (!endpoint.endpoint || endpoint.endpoint.trim() === "") {
        throw new Error("Endpoint URL is required");
      }

      addDebugLog("info", "Endpoint validation passed", { endpoint });

      const url = getServerUrl("/attom-admin/endpoints");
      const requestBody = JSON.stringify(endpoint, null, 2);

      addDebugLog("info", "Making save request", {
        url,
        method: "POST",
        bodySize: requestBody.length,
        endpoint: endpoint,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      addDebugLog("info", "Save response received", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.ok) {
        const responseData = await response.json();
        addDebugLog("info", "Configuration saved successfully", {
          responseData,
        });

        // Reload configurations to ensure we have the latest data
        await loadConfigurations();

        toast.success("Configuration saved successfully");
        setIsEditMode(false);
        setSelectedEndpoint(null);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: "Failed to parse error response" };
        }

        addDebugLog("error", "Save request failed", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const stack = err instanceof Error ? err.stack : undefined;
      addDebugLog("error", "Configuration save failed", {
        error: msg,
        stack,
        endpoint: endpoint,
      });

      console.error("Save error:", err);
      toast.error(`Failed to save configuration: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfiguration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;

    setIsLoading(true);
    addDebugLog("info", "Starting configuration delete", { endpointId: id });

    try {
      const url = getServerUrl(`/attom-admin/endpoints/${id}`);
      addDebugLog("info", "Making delete request", { url });

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
      });

      addDebugLog("info", "Delete response received", {
        status: response.status,
        statusText: response.statusText,
      });

      if (response.ok) {
        const responseData = await response.json();
        addDebugLog("info", "Configuration deleted successfully", {
          responseData,
        });

        await loadConfigurations();
        toast.success("Configuration deleted successfully");

        if (selectedEndpoint?.id === id) {
          setSelectedEndpoint(null);
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: "Failed to parse error response" };
        }

        addDebugLog("error", "Delete request failed", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const stack = err instanceof Error ? err.stack : undefined;
      addDebugLog("error", "Configuration delete failed", {
        error: msg,
        stack,
      });

      console.error("Delete error:", err);
      toast.error(`Failed to delete configuration: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEndpoint = async (endpoint: AttomEndpointConfig) => {
    setIsLoading(true);
    addDebugLog("info", "Starting endpoint test", {
      endpointId: endpoint.id,
      endpointName: endpoint.name,
    });

    try {
      const testParams = generateTestParams(endpoint);
      const url = getServerUrl("/attom-admin/test-endpoint");
      const requestBody = JSON.stringify({
        endpointId: endpoint.id,
        testParams: testParams,
      });

      addDebugLog("info", "Making test request", {
        url,
        testParams,
        requestBody,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      const result = await response.json();

      addDebugLog("info", "Test response received", {
        status: response.status,
        result,
      });

      setTestResults((prev) => ({
        ...prev,
        [endpoint.id]: result,
      }));

      if (response.ok && result.success) {
        toast.success(`Endpoint "${endpoint.name}" tested successfully`);
        addDebugLog("info", "Endpoint test successful", {
          endpointName: endpoint.name,
        });
      } else {
        toast.error(`Endpoint "${endpoint.name}" test failed: ${result.error}`);
        addDebugLog("error", "Endpoint test failed", {
          endpointName: endpoint.name,
          error: result.error,
        });
      }
    } catch (error) {
      addDebugLog("error", "Endpoint test error", {
        error: error.message,
        stack: error.stack,
      });

      console.error("Test error:", error);
      toast.error("Failed to test endpoint");
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestParams = (
    endpoint: AttomEndpointConfig,
  ): Record<string, any> => {
    const params: Record<string, any> = {};

    endpoint.requiredParams.forEach((param) => {
      switch (param.name.toLowerCase()) {
        case "address":
          params[param.name] = "123 Oak Street, Riverside Heights, CA";
          break;
        case "zipcode":
        case "postalcode":
          params[param.name] = "90210";
          break;
        case "city":
          params[param.name] = "Beverly Hills";
          break;
        case "state":
          params[param.name] = "CA";
          break;
        default:
          params[param.name] = param.example || param.defaultValue || "";
      }
    });

    return params;
  };

  const initializeDefaultConfiguration = async () => {
    setIsInitializing(true);
    addDebugLog("info", "Starting default configuration initialization");

    try {
      const defaultEndpoints = getDefaultEndpoints();

      addDebugLog("info", "Default configuration created", {
        endpointsCount: defaultEndpoints.length,
      });

      // Save each endpoint individually
      for (const endpoint of defaultEndpoints) {
        await saveConfiguration(endpoint);
      }

      await loadConfigurations();
      toast.success("Default configuration initialized successfully");
      addDebugLog("info", "Default configuration initialized successfully");
    } catch (error) {
      addDebugLog("error", "Default configuration initialization failed", {
        error: error.message,
        stack: error.stack,
      });

      console.error("Initialize error:", error);
      toast.error(
        `Failed to initialize default configuration: ${error.message}`,
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
    addDebugLog("info", "Debug logs cleared");
  };

  const duplicateEndpoint = (endpoint: AttomEndpointConfig) => {
    const newEndpoint: AttomEndpointConfig = {
      ...endpoint,
      id: `endpoint_${Date.now()}`,
      name: `${endpoint.name} (Copy)`,
      displayOrder: endpoints.length + 1,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };

    setSelectedEndpoint(newEndpoint);
    setIsEditMode(true);
    setActiveTab("configuration");
  };

  const handleBulkActivation = (activate: boolean) => {
    if (selectedEndpoints.size === 0) {
      toast.error("No endpoints selected");
      return;
    }

    const updatedEndpoints = endpoints.map((endpoint) => {
      if (selectedEndpoints.has(endpoint.id)) {
        return {
          ...endpoint,
          isActive: activate,
          modified: new Date().toISOString(),
        };
      }
      return endpoint;
    });

    Promise.all(
      updatedEndpoints
        .filter((endpoint) => selectedEndpoints.has(endpoint.id))
        .map((endpoint) => saveConfiguration(endpoint)),
    )
      .then(() => {
        toast.success(
          `${activate ? "Activated" : "Deactivated"} ${selectedEndpoints.size} endpoints`,
        );
        setSelectedEndpoints(new Set());
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast.error(
          `Failed to ${activate ? "activate" : "deactivate"} endpoints: ${msg}`,
        );
      });
  };

  const handleBulkPropertyDisplay = (show: boolean) => {
    if (selectedEndpoints.size === 0) {
      toast.error("No endpoints selected");
      return;
    }

    const updatedEndpoints = endpoints.map((endpoint) => {
      if (selectedEndpoints.has(endpoint.id)) {
        return {
          ...endpoint,
          showInPropertyDetails: show,
          modified: new Date().toISOString(),
        };
      }
      return endpoint;
    });

    Promise.all(
      updatedEndpoints
        .filter((endpoint) => selectedEndpoints.has(endpoint.id))
        .map((endpoint) => saveConfiguration(endpoint)),
    )
      .then(() => {
        toast.success(
          `${show ? "Enabled" : "Disabled"} property display for ${selectedEndpoints.size} endpoints`,
        );
        setSelectedEndpoints(new Set());
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast.error(`Failed to update property display: ${msg}`);
      });
  };

  const addParameterFromTemplate = (
    template: ParameterTemplate,
    type: "required" | "optional",
  ) => {
    const newParam: AttomParameter = {
      name: template.name,
      type: template.type,
      description: template.description,
      example: template.example,
      defaultValue: template.defaultValue,
      possibleValues: template.possibleValues,
      validation: template.validation,
      format: template.format,
    };

    if (selectedEndpoint) {
      if (type === "required") {
        setSelectedEndpoint({
          ...selectedEndpoint,
          requiredParams: [...selectedEndpoint.requiredParams, newParam],
        });
      } else {
        setSelectedEndpoint({
          ...selectedEndpoint,
          optionalParams: [...selectedEndpoint.optionalParams, newParam],
        });
      }
      toast.success(`Added ${template.name} parameter from template`);
    }
  };

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const createNewEndpoint = (): AttomEndpointConfig => ({
    id: `endpoint_${Date.now()}`,
    name: "",
    endpoint: "",
    method: "GET",
    description: "",
    category: "property-basic",
    displayOrder: endpoints.length + 1,
    requiredParams: [],
    optionalParams: [],
    responseFields: [],
    isActive: true,
    showInPropertyDetails: true,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Wrench className="w-8 h-8 text-primary" />
              Attom API Configuration
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure and manage Attom Data API endpoints, parameters, and
              field mappings with enhanced parameter templates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              title="Toggle debug panel"
            >
              <Bug className="w-4 h-4 mr-2" />
              Debug
            </Button>

            <Button
              variant="outline"
              onClick={() => initializeDefaultConfiguration()}
              disabled={isInitializing}
              title="Reset to default configuration"
            >
              {isInitializing && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>

            <Button
              onClick={() => {
                setSelectedEndpoint(createNewEndpoint());
                setIsEditMode(true);
                setActiveTab("configuration");
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Endpoint
            </Button>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Debug Information
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={clearDebugLogs}>
                    Clear Logs
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDebugPanel(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
              <CardDescription>
                Real-time debugging information for configuration operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Project ID:</strong> {projectId}
                  </div>
                  <div>
                    <strong>Server Base URL:</strong> https://{projectId}
                    .supabase.co/functions/v1/make-server-a24396d5
                  </div>
                  <div>
                    <strong>Current Endpoints:</strong> {endpoints.length}
                  </div>
                  <div>
                    <strong>Parameter Templates:</strong>{" "}
                    {parameterTemplates.length}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Recent Debug Logs</h4>
                  <div className="max-h-60 overflow-y-auto border rounded p-2 bg-white">
                    {debugLogs.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No debug logs yet
                      </p>
                    ) : (
                      debugLogs.slice(0, 10).map((log, index) => (
                        <div
                          key={index}
                          className={`text-xs mb-1 p-1 rounded ${
                            log.level === "error"
                              ? "bg-red-100 text-red-800"
                              : log.level === "warn"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <span className="font-mono">
                            {log.timestamp.split("T")[1].split(".")[0]}
                          </span>
                          <span className="ml-2 font-semibold">
                            [{log.level.toUpperCase()}]
                          </span>
                          <span className="ml-2">{log.message}</span>
                          {log.data && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-xs">
                                Show details
                              </summary>
                              <pre className="text-xs mt-1 overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {endpoints.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  No endpoints configured. Initialize with default configuration
                  to get started.
                </span>
                <Button
                  size="sm"
                  onClick={initializeDefaultConfiguration}
                  disabled={isInitializing}
                >
                  {isInitializing && (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  )}
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Initialize Defaults
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="parameters">Parameter Library</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Endpoints
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{endpoints.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {endpoints.filter((e) => e.isActive).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Property Display
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {endpoints.filter((e) => e.showInPropertyDetails).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shown in property details
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Test Results
                  </CardTitle>
                  <TestTube className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {endpoints.filter((e) => e.testResult === "success").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {endpoints.filter((e) => e.testResult === "error").length}{" "}
                    failed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Parameter Templates
                  </CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {parameterTemplates.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ready-to-use templates
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Enhanced Parameter Configuration Guide
                </CardTitle>
                <CardDescription>
                  How to use parameter templates and enhanced configuration
                  features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Parameter Templates</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>
                        • <strong>Pre-built templates:</strong>{" "}
                        {parameterTemplates.length} ready-to-use parameter
                        configurations
                      </li>
                      <li>
                        • <strong>Smart examples:</strong> Realistic values and
                        validation rules
                      </li>
                      <li>
                        • <strong>Category organization:</strong> Address,
                        location, property, search filters
                      </li>
                      <li>
                        • <strong>One-click adding:</strong> Add parameters
                        directly from template library
                      </li>
                      <li>
                        • <strong>Format guidance:</strong> Built-in formatting
                        and validation rules
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Enhanced Features</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>
                        • <strong>Bulk operations:</strong> Select and modify
                        multiple endpoints
                      </li>
                      <li>
                        • <strong>Parameter validation:</strong> Built-in
                        validation rules and examples
                      </li>
                      <li>
                        • <strong>Possible values:</strong> Dropdown lists for
                        constrained parameters
                      </li>
                      <li>
                        • <strong>Default values:</strong> Pre-filled values for
                        optional parameters
                      </li>
                      <li>
                        • <strong>Format specifications:</strong> Clear
                        formatting requirements
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Start Tips
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      • Use the Parameter Library tab to browse all available
                      templates
                    </p>
                    <p>
                      • When configuring endpoints, click "Add from Template" to
                      use pre-built parameters
                    </p>
                    <p>
                      • Templates include validation rules, examples, and
                      possible values automatically
                    </p>
                    <p>
                      • Common parameters like "address", "state", and "debug"
                      are ready to use
                    </p>
                  </div>
                </div>

                {debugLogs.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">
                      System Status
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>
                          Debug logging active - {debugLogs.length} events
                          captured
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <RefreshCw className="w-4 h-4" />
                        <span>
                          Last activity:{" "}
                          {debugLogs[0]?.timestamp
                            .split("T")[1]
                            .split(".")[0] || "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6">
            <ParameterLibraryPanel
              templates={parameterTemplates}
              onAddToEndpoint={addParameterFromTemplate}
              selectedEndpoint={selectedEndpoint}
              setSelectedEndpoint={setSelectedEndpoint}
              setIsEditMode={setIsEditMode}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            {/* Filters and Bulk Controls */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search endpoints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all"
                          ? "All Categories"
                          : category
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setBulkEditMode(!bulkEditMode)}
                  className={bulkEditMode ? "bg-blue-100" : ""}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {bulkEditMode ? "Exit Bulk Mode" : "Bulk Edit"}
                </Button>
              </div>

              {/* Bulk Operations */}
              {bulkEditMode && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {selectedEndpoints.size} endpoint
                        {selectedEndpoints.size !== 1 ? "s" : ""} selected
                      </span>
                      {selectedEndpoints.size > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEndpoints(new Set())}
                        >
                          Clear Selection
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkActivation(true)}
                        disabled={selectedEndpoints.size === 0}
                      >
                        Activate Selected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkActivation(false)}
                        disabled={selectedEndpoints.size === 0}
                      >
                        Deactivate Selected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkPropertyDisplay(true)}
                        disabled={selectedEndpoints.size === 0}
                      >
                        Show in Property
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkPropertyDisplay(false)}
                        disabled={selectedEndpoints.size === 0}
                      >
                        Hide from Property
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Endpoints List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEndpoints
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((endpoint) => (
                  <Card
                    key={endpoint.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {bulkEditMode && (
                            <Checkbox
                              checked={selectedEndpoints.has(endpoint.id)}
                              onCheckedChange={(checked) => {
                                const newSelection = new Set(selectedEndpoints);
                                if (checked) {
                                  newSelection.add(endpoint.id);
                                } else {
                                  newSelection.delete(endpoint.id);
                                }
                                setSelectedEndpoints(newSelection);
                              }}
                            />
                          )}
                          <CardTitle className="text-lg">
                            {endpoint.name}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {endpoint.testResult === "success" && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {endpoint.testResult === "error" && (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          {endpoint.testResult === "warning" && (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <Badge
                            variant={
                              endpoint.isActive ? "default" : "secondary"
                            }
                          >
                            {endpoint.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {endpoint.showInPropertyDetails && (
                            <Badge variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              Display
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{endpoint.method}</Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {endpoint.endpoint}
                          </code>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Category: {endpoint.category}</span>
                          <span>Order: {endpoint.displayOrder}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {endpoint.requiredParams.length} required params
                          </span>
                          <span>
                            {
                              endpoint.responseFields.filter(
                                (f) => f.displayInPropertyDetails,
                              ).length
                            }{" "}
                            display fields
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEndpoint(endpoint);
                              setIsEditMode(true);
                              setActiveTab("configuration");
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateEndpoint(endpoint)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Duplicate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testEndpoint(endpoint)}
                            disabled={isLoading}
                          >
                            <TestTube className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteConfiguration(endpoint.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {filteredEndpoints.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No endpoints found matching your criteria.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedEndpoint(createNewEndpoint());
                    setIsEditMode(true);
                    setActiveTab("configuration");
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Endpoint
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="configuration">
            <EndpointConfigurationForm
              endpoint={selectedEndpoint}
              isEditMode={isEditMode}
              onSave={saveConfiguration}
              onCancel={() => {
                setSelectedEndpoint(null);
                setIsEditMode(false);
              }}
              isLoading={isLoading}
              parameterTemplates={parameterTemplates}
              onAddParameterFromTemplate={addParameterFromTemplate}
            />
          </TabsContent>

          <TabsContent value="testing">
            <EndpointTestingPanel
              endpoints={endpoints}
              testResults={testResults}
              onTestEndpoint={testEndpoint}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Parameter Library Panel Component
function ParameterLibraryPanel({
  templates,
  onAddToEndpoint,
  selectedEndpoint,
  setSelectedEndpoint,
  setIsEditMode,
  setActiveTab,
}: {
  templates: ParameterTemplate[];
  onAddToEndpoint: (
    template: ParameterTemplate,
    type: "required" | "optional",
  ) => void;
  selectedEndpoint: AttomEndpointConfig | null;
  setSelectedEndpoint: (endpoint: AttomEndpointConfig | null) => void;
  setIsEditMode: (mode: boolean) => void;
  setActiveTab: (tab: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const parameterCategories = [
    "all",
    "address",
    "location",
    "property",
    "search",
    "filter",
    "format",
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const templatesByCategory = parameterCategories.slice(1).map((category) => ({
    category,
    templates: templates.filter((t) => t.category === category),
    count: templates.filter((t) => t.category === category).length,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Parameter Template Library
          </CardTitle>
          <CardDescription>
            Browse and add pre-configured parameters to your endpoints.
            Templates include validation, examples, and possible values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedEndpoint && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select an endpoint to edit first, then come back here to add
                parameters from templates.
              </AlertDescription>
            </Alert>
          )}

          {selectedEndpoint && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Adding parameters to: <strong>{selectedEndpoint.name}</strong>.
                Click "Add as Required" or "Add as Optional" to add parameters.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search parameter templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {parameterCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all"
                  ? "All Categories"
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templatesByCategory.map(({ category, count }) => (
          <Card
            key={category}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold capitalize">{category}</h3>
                  <p className="text-sm text-muted-foreground">
                    {count} templates
                  </p>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {template.name}
                </CardTitle>
                <Badge variant="outline" className="capitalize">
                  {template.category}
                </Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Type:</span>
                    <Badge variant="secondary">{template.type}</Badge>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="font-medium">Example:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded max-w-48 overflow-hidden">
                      {template.example}
                    </code>
                  </div>
                  {template.format && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Format:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {template.format}
                      </code>
                    </div>
                  )}
                  {template.defaultValue && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Default:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {template.defaultValue}
                      </code>
                    </div>
                  )}
                  {template.possibleValues &&
                    template.possibleValues.length > 0 && (
                      <div className="flex items-start justify-between">
                        <span className="font-medium">Values:</span>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {template.possibleValues.slice(0, 3).map((value) => (
                            <Badge
                              key={value}
                              variant="outline"
                              className="text-xs"
                            >
                              {value}
                            </Badge>
                          ))}
                          {template.possibleValues.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.possibleValues.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  {template.validation && (
                    <div className="flex items-start justify-between">
                      <span className="font-medium">Validation:</span>
                      <span className="text-xs text-muted-foreground max-w-48 text-right">
                        {template.validation}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onAddToEndpoint(template, "required")}
                    disabled={!selectedEndpoint}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add as Required
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddToEndpoint(template, "optional")}
                    disabled={!selectedEndpoint}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add as Optional
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No parameter templates found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}

// Enhanced Configuration Form Component
function EndpointConfigurationForm({
  endpoint,
  isEditMode,
  onSave,
  onCancel,
  isLoading,
  parameterTemplates,
  onAddParameterFromTemplate,
}: {
  endpoint: AttomEndpointConfig | null;
  isEditMode: boolean;
  onSave: (endpoint: AttomEndpointConfig) => void;
  onCancel: () => void;
  isLoading: boolean;
  parameterTemplates: ParameterTemplate[];
  onAddParameterFromTemplate: (
    template: ParameterTemplate,
    type: "required" | "optional",
  ) => void;
}) {
  const [formData, setFormData] = useState<AttomEndpointConfig | null>(
    endpoint,
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showParameterTemplates, setShowParameterTemplates] = useState<
    "required" | "optional" | null
  >(null);

  useEffect(() => {
    setFormData(endpoint);
    setValidationErrors({});
  }, [endpoint]);

  if (!isEditMode || !formData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Configure an Endpoint</h3>
              <p className="text-muted-foreground">
                Select an endpoint to configure or create a new one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Endpoint name is required";
    }

    if (!formData.endpoint || formData.endpoint.trim() === "") {
      errors.endpoint = "Endpoint URL is required";
    }

    if (!formData.description || formData.description.trim() === "") {
      errors.description = "Description is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addParameter = (type: "required" | "optional") => {
    const newParam: AttomParameter = {
      name: "",
      type: "string",
      description: "",
      example: "",
    };

    if (type === "required") {
      setFormData({
        ...formData,
        requiredParams: [...formData.requiredParams, newParam],
      });
    } else {
      setFormData({
        ...formData,
        optionalParams: [...formData.optionalParams, newParam],
      });
    }
  };

  const addResponseField = () => {
    const newField: AttomResponseField = {
      name: "",
      path: "",
      type: "string",
      description: "",
      isRequired: false,
      displayInPropertyDetails: true,
      displayName: "",
    };

    setFormData({
      ...formData,
      responseFields: [...formData.responseFields, newField],
    });
  };

  const updateParameter = (
    index: number,
    type: "required" | "optional",
    updates: Partial<AttomParameter>,
  ) => {
    if (type === "required") {
      const updated = [...formData.requiredParams];
      updated[index] = { ...updated[index], ...updates };
      setFormData({ ...formData, requiredParams: updated });
    } else {
      const updated = [...formData.optionalParams];
      updated[index] = { ...updated[index], ...updates };
      setFormData({ ...formData, optionalParams: updated });
    }
  };

  const updateResponseField = (
    index: number,
    updates: Partial<AttomResponseField>,
  ) => {
    const updated = [...formData.responseFields];
    updated[index] = { ...updated[index], ...updates };
    setFormData({ ...formData, responseFields: updated });
  };

  const removeParameter = (index: number, type: "required" | "optional") => {
    if (type === "required") {
      setFormData({
        ...formData,
        requiredParams: formData.requiredParams.filter((_, i) => i !== index),
      });
    } else {
      setFormData({
        ...formData,
        optionalParams: formData.optionalParams.filter((_, i) => i !== index),
      });
    }
  };

  const removeResponseField = (index: number) => {
    setFormData({
      ...formData,
      responseFields: formData.responseFields.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    if (formData && validateForm()) {
      onSave({
        ...formData,
        modified: new Date().toISOString(),
      });
    }
  };

  const handleAddParameterFromTemplate = (
    template: ParameterTemplate,
    type: "required" | "optional",
  ) => {
    const newParam: AttomParameter = {
      name: template.name,
      type: template.type,
      description: template.description,
      example: template.example,
      defaultValue: template.defaultValue,
      possibleValues: template.possibleValues,
      validation: template.validation,
      format: template.format,
    };

    if (type === "required") {
      setFormData({
        ...formData,
        requiredParams: [...formData.requiredParams, newParam],
      });
    } else {
      setFormData({
        ...formData,
        optionalParams: [...formData.optionalParams, newParam],
      });
    }

    setShowParameterTemplates(null);
    toast.success(`Added ${template.name} parameter from template`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {formData.id.startsWith("endpoint_")
            ? "Create New Endpoint"
            : "Edit Endpoint Configuration"}
        </CardTitle>
        <CardDescription>
          Configure the endpoint details, parameters with templates, response
          fields, and display settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Endpoint Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Property Basic Profile"
              className={validationErrors.name ? "border-red-500" : ""}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "property-basic",
                  "property-expanded",
                  "neighborhood",
                  "school",
                  "risk-assessment",
                  "market-trends",
                  "environmental",
                  "demographics",
                  "ownership",
                  "valuation",
                ].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endpoint">API Endpoint *</Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) =>
                setFormData({ ...formData, endpoint: e.target.value })
              }
              placeholder="e.g., /propertyapi/v1.0.0/property/basicprofile"
              className={validationErrors.endpoint ? "border-red-500" : ""}
            />
            {validationErrors.endpoint && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.endpoint}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value) || 1,
                })
              }
              placeholder="1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe what this endpoint does and what data it returns..."
            className={validationErrors.description ? "border-red-500" : ""}
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.description}
            </p>
          )}
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Display Settings</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: !!checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showInPropertyDetails"
                checked={formData.showInPropertyDetails}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showInPropertyDetails: !!checked })
                }
              />
              <Label htmlFor="showInPropertyDetails">
                Show in Property Details
              </Label>
            </div>
          </div>
        </div>

        {/* Enhanced Parameters Section */}
        <Tabs defaultValue="required-params" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="required-params">
              Required Parameters
            </TabsTrigger>
            <TabsTrigger value="optional-params">
              Optional Parameters
            </TabsTrigger>
            <TabsTrigger value="response-fields">Response Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="required-params" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Required Parameters</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParameterTemplates("required")}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Add from Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addParameter("required")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </Button>
              </div>
            </div>

            <ParameterSection
              parameters={formData.requiredParams}
              onUpdateParameter={(index, updates) =>
                updateParameter(index, "required", updates)
              }
              onRemoveParameter={(index) => removeParameter(index, "required")}
              type="required"
            />

            {showParameterTemplates === "required" && (
              <ParameterTemplateSelector
                templates={parameterTemplates}
                onSelect={(template) =>
                  handleAddParameterFromTemplate(template, "required")
                }
                onClose={() => setShowParameterTemplates(null)}
              />
            )}
          </TabsContent>

          <TabsContent value="optional-params" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Optional Parameters</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParameterTemplates("optional")}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Add from Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addParameter("optional")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </Button>
              </div>
            </div>

            <ParameterSection
              parameters={formData.optionalParams}
              onUpdateParameter={(index, updates) =>
                updateParameter(index, "optional", updates)
              }
              onRemoveParameter={(index) => removeParameter(index, "optional")}
              type="optional"
            />

            {showParameterTemplates === "optional" && (
              <ParameterTemplateSelector
                templates={parameterTemplates}
                onSelect={(template) =>
                  handleAddParameterFromTemplate(template, "optional")
                }
                onClose={() => setShowParameterTemplates(null)}
              />
            )}
          </TabsContent>

          <TabsContent value="response-fields" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Response Fields</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResponseField}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {formData.responseFields.map((field, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateResponseField(index, { name: e.target.value })
                        }
                        placeholder="field_name"
                      />
                    </div>
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={field.displayName || ""}
                        onChange={(e) =>
                          updateResponseField(index, {
                            displayName: e.target.value,
                          })
                        }
                        placeholder="Field Display Name"
                      />
                    </div>
                    <div>
                      <Label>JSON Path</Label>
                      <Input
                        value={field.path}
                        onChange={(e) =>
                          updateResponseField(index, { path: e.target.value })
                        }
                        placeholder="property[0].building.rooms"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: any) =>
                          updateResponseField(index, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "string",
                            "number",
                            "boolean",
                            "object",
                            "array",
                          ].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={field.description}
                        onChange={(e) =>
                          updateResponseField(index, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Description of this field"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.isRequired}
                            onCheckedChange={(checked) =>
                              updateResponseField(index, {
                                isRequired: !!checked,
                              })
                            }
                          />
                          <Label>Required</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.displayInPropertyDetails}
                            onCheckedChange={(checked) =>
                              updateResponseField(index, {
                                displayInPropertyDetails: !!checked,
                              })
                            }
                          />
                          <Label>Display in Property Details</Label>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResponseField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.name || !formData.endpoint}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Parameter Section Component
function ParameterSection({
  parameters,
  onUpdateParameter,
  onRemoveParameter,
  type,
}: {
  parameters: AttomParameter[];
  onUpdateParameter: (index: number, updates: Partial<AttomParameter>) => void;
  onRemoveParameter: (index: number) => void;
  type: "required" | "optional";
}) {
  if (parameters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No {type} parameters configured.</p>
        <p className="text-sm">
          Use "Add from Template" to add common parameters or "Add Custom" for
          custom ones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parameters.map((param, index) => (
        <Card key={index} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Parameter Name</Label>
              <Input
                value={param.name}
                onChange={(e) =>
                  onUpdateParameter(index, { name: e.target.value })
                }
                placeholder="parameter_name"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={param.type}
                onValueChange={(value: any) =>
                  onUpdateParameter(index, { type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["string", "number", "boolean", "array"].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={param.description}
                onChange={(e) =>
                  onUpdateParameter(index, { description: e.target.value })
                }
                placeholder="Description of this parameter"
              />
            </div>
            <div>
              <Label>Example</Label>
              <Input
                value={param.example}
                onChange={(e) =>
                  onUpdateParameter(index, { example: e.target.value })
                }
                placeholder="Example value"
              />
            </div>
            <div>
              <Label>Default Value {type === "optional" && "(Optional)"}</Label>
              <Input
                value={param.defaultValue || ""}
                onChange={(e) =>
                  onUpdateParameter(index, { defaultValue: e.target.value })
                }
                placeholder="Default value"
              />
            </div>
            {param.format && (
              <div>
                <Label>Format</Label>
                <Input
                  value={param.format}
                  onChange={(e) =>
                    onUpdateParameter(index, { format: e.target.value })
                  }
                  placeholder="Format specification"
                />
              </div>
            )}
            {param.validation && (
              <div>
                <Label>Validation</Label>
                <Input
                  value={param.validation}
                  onChange={(e) =>
                    onUpdateParameter(index, { validation: e.target.value })
                  }
                  placeholder="Validation rules"
                />
              </div>
            )}
            {param.possibleValues && param.possibleValues.length > 0 && (
              <div className="md:col-span-2">
                <Label>Possible Values</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {param.possibleValues.map((value) => (
                    <Badge key={value} variant="outline">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="md:col-span-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveParameter(index)}
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Parameter Template Selector Component
function ParameterTemplateSelector({
  templates,
  onSelect,
  onClose,
}: {
  templates: ParameterTemplate[];
  onSelect: (template: ParameterTemplate) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const parameterCategories = [
    "all",
    "address",
    "location",
    "property",
    "search",
    "filter",
    "format",
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Select Parameter Template</CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <CardDescription>
          Choose a pre-configured parameter template with validation and
          examples.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {parameterCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-white transition-colors"
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{template.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span>
                        Type: <Badge variant="secondary">{template.type}</Badge>
                      </span>
                      <code className="bg-muted px-2 py-1 rounded">
                        {template.example}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => onSelect(template)}
                    >
                      Use This Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates found matching your search criteria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Testing Panel Component
function EndpointTestingPanel({
  endpoints,
  testResults,
  onTestEndpoint,
  isLoading,
}: {
  endpoints: AttomEndpointConfig[];
  testResults: Record<string, any>;
  onTestEndpoint: (endpoint: AttomEndpointConfig) => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Testing</CardTitle>
          <CardDescription>
            Test your configured endpoints with sample data to ensure they're
            working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{endpoint.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {endpoint.endpoint}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {endpoint.testResult === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {endpoint.testResult === "error" && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    {endpoint.testResult === "warning" && (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <Button
                      size="sm"
                      onClick={() => onTestEndpoint(endpoint)}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      <TestTube className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>

                {testResults[endpoint.id] && (
                  <div className="mt-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="result">
                        <AccordionTrigger className="text-sm">
                          Test Result
                          {testResults[endpoint.id].success ? (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 ml-2" />
                          )}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Status:</span>
                              <Badge
                                variant={
                                  testResults[endpoint.id].success
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {testResults[endpoint.id].status}
                              </Badge>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">URL:</span>
                              <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                                {testResults[endpoint.id].url}
                              </code>
                            </div>
                            {testResults[endpoint.id].error && (
                              <div className="text-sm text-red-600">
                                <span className="font-medium">Error:</span>{" "}
                                {testResults[endpoint.id].error}
                              </div>
                            )}
                            <details className="text-sm">
                              <summary className="cursor-pointer font-medium">
                                Response Data
                              </summary>
                              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(
                                  testResults[endpoint.id].data,
                                  null,
                                  2,
                                )}
                              </pre>
                            </details>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
