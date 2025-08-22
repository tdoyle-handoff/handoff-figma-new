import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  MapPin,
  Home,
  Building,
  TreePine,
  Info,
  Target,
  Globe,
  Lightbulb,
} from "lucide-react";

interface AddressExample {
  type: string;
  good: string[];
  bad: string[];
  explanation: string;
  icon: React.ReactNode;
}

interface FormatRule {
  title: string;
  description: string;
  examples: string[];
  avoid: string[];
}

export function AddressFormatGuide() {
  const [testAddress, setTestAddress] = useState("");
  const [formatAnalysis, setFormatAnalysis] = useState<any>(null);

  // Address format examples organized by property type
  const addressExamples: AddressExample[] = [
    {
      type: "Single Family Home",
      icon: <Home className="w-5 h-5" />,
      good: [
        "123 Main Street, Anytown, CA 90210",
        "456 Oak Avenue, Springfield, TX 75001",
        "789 Elm Drive, Unit A, Denver, CO 80202",
        "1000 Maple Lane, Riverside, FL 33101",
      ],
      bad: [
        "123 main st",
        "456 Oak Ave Apt 2 Springfield TX",
        "789elmdr",
        "1000 Maple Riverside Florida",
      ],
      explanation:
        "Include full street number, complete street name with suffix (Street, Avenue, etc.), city, state abbreviation, and ZIP code. Separate components with commas.",
    },
    {
      type: "Condominium/Apartment",
      icon: <Building className="w-5 h-5" />,
      good: [
        "123 Park Avenue, Unit 4B, New York, NY 10016",
        "456 Ocean Boulevard, Apt 203, Miami Beach, FL 33139",
        "789 Hill Street, Suite 12, San Francisco, CA 94102",
        "321 River Road, #5A, Portland, OR 97201",
      ],
      bad: [
        "123 Park Ave 4B NYC",
        "456 Ocean Blvd Apt203 Miami Beach",
        "789 Hill St Ste 12",
        "321 River Rd Unit 5A Portland Oregon",
      ],
      explanation:
        "Always include unit/apartment number with clear designation (Unit, Apt, Suite, #). Separate each component clearly with commas.",
    },
    {
      type: "Rural Property",
      icon: <TreePine className="w-5 h-5" />,
      good: [
        "12345 County Road 150, Ruraltown, TX 75050",
        "N8765 State Highway 21, Farmville, WI 54001",
        "45678 Ranch Road 12, Hill Country, TX 78676",
        "Rural Route 3, Box 125, Countryside, IA 50001",
      ],
      bad: [
        "12345 CR 150",
        "Hwy 21 Farmville",
        "RR3 Box 125 Iowa",
        "45678 Ranch Rd Hill Country",
      ],
      explanation:
        "Rural addresses often use specific naming conventions like County Road, State Highway, or Rural Route. Include the full designation and box numbers when applicable.",
    },
    {
      type: "Commercial Property",
      icon: <Building className="w-5 h-5" />,
      good: [
        "1500 Commerce Street, Dallas, TX 75201",
        "2000 Business Park Drive, Building A, Austin, TX 73301",
        "750 Industrial Boulevard, Suite 200, Phoenix, AZ 85001",
        "100 Corporate Center, Tower 3, Atlanta, GA 30309",
      ],
      bad: [
        "1500 Commerce Dallas",
        "2000 Bus Park Dr Bldg A",
        "750 Industrial Suite200",
        "100 Corp Center Tower3 Atlanta",
      ],
      explanation:
        "Commercial properties may have building designations, tower numbers, or suite information. Include all relevant identifiers separated by commas.",
    },
  ];

  // Formatting rules and best practices
  const formatRules: FormatRule[] = [
    {
      title: "Street Number & Name",
      description:
        "Always include the complete street number and full street name",
      examples: [
        "123 Main Street (not 123 Main St)",
        "456 Oak Avenue (not 456 Oak Ave)",
        "789 First Boulevard (not 789 1st Blvd)",
      ],
      avoid: [
        "Abbreviated street names (St, Ave, Blvd)",
        "Missing street numbers",
        "Informal street names",
      ],
    },
    {
      title: "Unit/Apartment Information",
      description: "Include unit information with clear designations",
      examples: [
        "Unit 4B (preferred)",
        "Apt 203 (acceptable)",
        "Suite 12 (for commercial)",
        "#5A (acceptable shorthand)",
      ],
      avoid: [
        "Attached unit numbers (123MainSt4B)",
        "Unclear unit designations (123 Main 4B)",
        "Missing unit numbers for multi-unit properties",
      ],
    },
    {
      title: "City & State",
      description: "Use full city names and standard state abbreviations",
      examples: [
        "Los Angeles, CA (not LA, California)",
        "New York, NY (not NYC, New York)",
        "San Francisco, CA (not SF, Calif)",
      ],
      avoid: [
        "City nicknames or abbreviations",
        "Full state names instead of abbreviations",
        "Non-standard abbreviations",
      ],
    },
    {
      title: "ZIP Codes",
      description:
        "Include 5-digit ZIP codes, plus 4-digit extensions when known",
      examples: [
        "90210 (5-digit ZIP)",
        "90210-1234 (ZIP+4 format)",
        "10016-0001 (with leading zeros)",
      ],
      avoid: [
        "Missing ZIP codes",
        "Incorrect ZIP code formats",
        "Postal codes from other countries",
      ],
    },
    {
      title: "Punctuation & Spacing",
      description: "Use consistent comma separation and proper spacing",
      examples: [
        "123 Main Street, Anytown, CA 90210",
        "456 Oak Ave, Unit 4B, City, TX 75001",
      ],
      avoid: [
        "Missing commas between components",
        "Extra spaces or inconsistent spacing",
        "Unnecessary punctuation",
      ],
    },
  ];

  // Analyze address format in real-time
  const analyzeAddressFormat = (address: string) => {
    if (!address) return null;

    const analysis = {
      originalAddress: address,
      score: 0,
      maxScore: 10,
      components: {
        streetNumber: false,
        streetName: false,
        city: false,
        state: false,
        zipCode: false,
      },
      issues: [] as string[],
      suggestions: [] as string[],
      formatted: address,
    };

    // Check for street number (starts with digits)
    if (/^\d+/.test(address.trim())) {
      analysis.components.streetNumber = true;
      analysis.score += 2;
    } else {
      analysis.issues.push("Missing street number at the beginning");
      analysis.suggestions.push(
        "Start with the street number (e.g., '123 Main Street')",
      );
    }

    // Check for street name and suffix
    const streetSuffixes =
      /\b(street|avenue|boulevard|drive|lane|road|court|place|way|circle|parkway|terrace|trail|st|ave|blvd|dr|ln|rd|ct|pl)\b/i;
    if (streetSuffixes.test(address)) {
      analysis.components.streetName = true;
      analysis.score += 2;
    } else {
      analysis.issues.push("Missing or unclear street name");
      analysis.suggestions.push(
        "Include complete street name with suffix (Street, Avenue, etc.)",
      );
    }

    // Check for comma separation
    const parts = address
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length >= 3) {
      analysis.score += 1;
    } else {
      analysis.issues.push("Insufficient comma-separated components");
      analysis.suggestions.push("Separate address components with commas");
    }

    // Check for state abbreviation (2-letter code)
    if (/\b[A-Z]{2}\b/.test(address)) {
      analysis.components.state = true;
      analysis.score += 2;
    } else {
      analysis.issues.push("Missing state abbreviation");
      analysis.suggestions.push(
        "Include 2-letter state abbreviation (CA, TX, NY, etc.)",
      );
    }

    // Check for ZIP code (5 digits, optionally +4)
    if (/\b\d{5}(-\d{4})?\b/.test(address)) {
      analysis.components.zipCode = true;
      analysis.score += 2;
    } else {
      analysis.issues.push("Missing or invalid ZIP code");
      analysis.suggestions.push("Include 5-digit ZIP code (or ZIP+4 format)");
    }

    // Check for city (assume it's present if we have enough parts)
    if (parts.length >= 2) {
      analysis.components.city = true;
      analysis.score += 1;
    } else {
      analysis.issues.push("Missing city name");
      analysis.suggestions.push("Include the city name");
    }

    // Generate formatted suggestion
    if (analysis.score < analysis.maxScore) {
      const exampleFormat = "123 Main Street, Anytown, CA 90210";
      analysis.suggestions.unshift(`Try this format: ${exampleFormat}`);
    }

    return analysis;
  };

  // Handle address input change
  const handleAddressChange = (value: string) => {
    setTestAddress(value);
    const analysis = analyzeAddressFormat(value);
    setFormatAnalysis(analysis);
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Get quality score color
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Get quality score badge
  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          Excellent
        </Badge>
      );
    }
    if (percentage >= 60) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Good
        </Badge>
      );
    }
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <MapPin className="w-8 h-8 text-primary" />
          Address Formatting Guide
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn the best practices for formatting addresses to ensure accurate
          results with property data APIs and address validation services.
        </p>
      </div>

      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyzer">Format Analyzer</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="rules">Best Practices</TabsTrigger>
          <TabsTrigger value="tips">Pro Tips</TabsTrigger>
        </TabsList>

        {/* Format Analyzer Tab */}
        <TabsContent value="analyzer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Address Format Analyzer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter an address below to get real-time formatting feedback and
                suggestions.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address-input">Test Address</Label>
                <Input
                  id="address-input"
                  value={testAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="Enter an address to analyze..."
                  className="mt-1"
                />
              </div>

              {formatAnalysis && (
                <div className="space-y-4">
                  {/* Quality Score */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Format Quality Score</h4>
                      <p className="text-sm text-muted-foreground">
                        Based on completeness and standard formatting
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${getScoreColor(formatAnalysis.score, formatAnalysis.maxScore)}`}
                      >
                        {formatAnalysis.score}/{formatAnalysis.maxScore}
                      </div>
                      {getScoreBadge(
                        formatAnalysis.score,
                        formatAnalysis.maxScore,
                      )}
                    </div>
                  </div>

                  {/* Component Analysis */}
                  <div>
                    <h4 className="font-medium mb-3">Address Components</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Object.entries(formatAnalysis.components).map(
                        ([component, present]) => (
                          <div
                            key={component}
                            className="flex items-center gap-2 p-2 bg-muted/30 rounded"
                          >
                            {present ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm capitalize">
                              {component.replace(/([A-Z])/g, " $1")}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Issues and Suggestions */}
                  {formatAnalysis.issues.length > 0 && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>Issues Found:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {formatAnalysis.issues.map(
                            (issue: string, index: number) => (
                              <li key={index} className="text-sm">
                                {issue}
                              </li>
                            ),
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {formatAnalysis.suggestions.length > 0 && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Suggestions for improvement:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {formatAnalysis.suggestions.map(
                            (suggestion: string, index: number) => (
                              <li key={index} className="text-sm">
                                {suggestion}
                              </li>
                            ),
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="grid gap-6">
            {addressExamples.map((example: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {example.icon}
                    {example.type}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {example.explanation}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Good Examples */}
                    <div>
                      <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Recommended Formats
                      </h4>
                      <div className="space-y-2">
                        {example.good.map((addr: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                          >
                            <span className="text-sm text-green-800">
                              {addr}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(addr)}
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bad Examples */}
                    <div>
                      <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Avoid These Formats
                      </h4>
                      <div className="space-y-2">
                        {example.bad.map((addr: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-2 bg-red-50 border border-red-200 rounded"
                          >
                            <span className="text-sm text-red-800">{addr}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="grid gap-6">
            {formatRules.map((rule: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{rule.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Examples
                      </h4>
                      <ul className="space-y-2">
                        {rule.examples.map((example: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm p-2 bg-green-50 border border-green-200 rounded text-green-800"
                          >
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Avoid
                      </h4>
                      <ul className="space-y-2">
                        {rule.avoid.map((avoid: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm p-2 bg-red-50 border border-red-200 rounded text-red-800"
                          >
                            {avoid}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pro Tips Tab */}
        <TabsContent value="tips" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  API Integration Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>For Attom Data API:</strong> Use complete
                      addresses with city, state, and ZIP code. The API works
                      best with standardized USPS format addresses.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>For Google Places API:</strong> Include as much
                      detail as possible. The API can handle various formats but
                      works best with complete addresses.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-purple-200 bg-purple-50">
                    <Lightbulb className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <strong>For MLS Integration:</strong> Follow local MLS
                      standards which may vary by region. Always include all
                      available address components.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Address Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      New Construction/Developments
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      New addresses may not be in all databases yet. Try these
                      approaches:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Use the subdivision or development name</li>
                      <li>Include lot numbers when available</li>
                      <li>Verify with local planning/building departments</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Rural/Unconventional Addresses
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Rural properties may have unique addressing systems:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>County roads: "12345 County Road 150"</li>
                      <li>Rural routes: "Rural Route 3, Box 125"</li>
                      <li>Highway addresses: "N8765 State Highway 21"</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Multi-Unit Properties</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Always specify the unit clearly:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Use "Unit" for condos: "123 Main St, Unit 4B"</li>
                      <li>Use "Apt" for apartments: "456 Oak Ave, Apt 203"</li>
                      <li>
                        Use "Suite" for commercial: "789 Business Dr, Suite 100"
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Complete Street Address</h4>
                      <p className="text-sm text-muted-foreground">
                        Include street number, full street name, and suffix
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">
                        Unit Information (if applicable)
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Include unit, apartment, or suite numbers with proper
                        designation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">City Name</h4>
                      <p className="text-sm text-muted-foreground">
                        Use complete city name, not abbreviations or nicknames
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">State Abbreviation</h4>
                      <p className="text-sm text-muted-foreground">
                        Use standard 2-letter state codes (CA, TX, NY, etc.)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">ZIP Code</h4>
                      <p className="text-sm text-muted-foreground">
                        Include 5-digit ZIP code, or ZIP+4 when available
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Proper Punctuation</h4>
                      <p className="text-sm text-muted-foreground">
                        Use commas to separate components, avoid unnecessary
                        punctuation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Reference Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="w-5 h-5" />
            Quick Reference: Perfect Address Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white/50 p-4 rounded-lg border border-primary/20">
            <div className="text-center">
              <div className="text-lg font-mono font-medium text-primary mb-2">
                [Street Number] [Street Name] [Street Suffix], [Unit], [City],
                [State] [ZIP Code]
              </div>
              <div className="text-sm text-muted-foreground">
                Example:{" "}
                <span className="font-medium">
                  123 Main Street, Unit 4B, Anytown, CA 90210
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
