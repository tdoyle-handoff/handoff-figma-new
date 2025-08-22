import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { AttomTestComponent } from './AttomTestComponent';
import { DirectApiTestTool } from './DirectApiTestTool';
import { PropertyAnalysisReport } from './PropertyAnalysisReport';
import { 
  RefreshCw, 
  TestTube, 
  Globe, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

export function AttomFullDebugPage() {
  const [testAddress] = useState('5 WHITNEY DR, GREENWICH, CT 06831');
  const [showReport, setShowReport] = useState(false);

  const handleShowReport = () => {
    setShowReport(true);
  };

  const handleCloseReport = () => {
    setShowReport(false);
  };

  if (showReport) {
    return (
      <PropertyAnalysisReport 
        address={testAddress}
        onClose={handleCloseReport}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Attom API Debug Center</h1>
              <p className="text-muted-foreground">
                Comprehensive debugging tools for Attom API integration
              </p>
            </div>
          </div>

          {/* Problem Statement */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Issue:</strong> Address "5 WHITNEY DR, GREENWICH, CT 06831" is not returning API results. 
              Use the tools below to debug the issue step by step.
            </AlertDescription>
          </Alert>
        </div>

        {/* Debug Tabs */}
        <Tabs defaultValue="hook-test" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hook-test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Hook Test
            </TabsTrigger>
            <TabsTrigger value="direct-api" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Direct API
            </TabsTrigger>
            <TabsTrigger value="property-report" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Property Report
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Troubleshooting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hook-test">
            <AttomTestComponent />
          </TabsContent>

          <TabsContent value="direct-api">
            <DirectApiTestTool />
          </TabsContent>

          <TabsContent value="property-report">
            <Card>
              <CardHeader>
                <CardTitle>Property Analysis Report Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test the full property analysis report generation for the problematic address
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input 
                      value={testAddress} 
                      readOnly 
                      className="bg-gray-50"
                    />
                  </div>
                  <Button onClick={handleShowReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This will open the full PropertyAnalysisReport component and attempt to generate
                    a comprehensive property report for the address. Check the browser console for
                    detailed debug logs.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshooting">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Common Issues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Server Not Responding</p>
                        <p className="text-sm text-muted-foreground">
                          The server might not be running or routes not properly mounted
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Address Parsing Issues</p>
                        <p className="text-sm text-muted-foreground">
                          The address might not be parsed correctly for the Attom API format
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">API Key Issues</p>
                        <p className="text-sm text-muted-foreground">
                          The Attom API key might be missing or invalid
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Debug Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">1</div>
                      <div>
                        <p className="font-medium">Test Server Health</p>
                        <p className="text-sm text-muted-foreground">
                          Use the "Direct API" tab to test server connectivity
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">2</div>
                      <div>
                        <p className="font-medium">Test Address Parsing</p>
                        <p className="text-sm text-muted-foreground">
                          Check how the address is being split into address1/address2
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">3</div>
                      <div>
                        <p className="font-medium">Check API Response</p>
                        <p className="text-sm text-muted-foreground">
                          Look for error messages in the API response
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">4</div>
                      <div>
                        <p className="font-medium">Test Hook Integration</p>
                        <p className="text-sm text-muted-foreground">
                          Use the "Hook Test" tab to test the React hook
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Expected Address Parsing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">For address: "5 WHITNEY DR, GREENWICH, CT 06831"</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">address1:</span>
                        <code className="ml-2 bg-white px-2 py-1 rounded">"5 Whitney Drive"</code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">address2:</span>
                        <code className="ml-2 bg-white px-2 py-1 rounded">"Greenwich, CT 06831"</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}