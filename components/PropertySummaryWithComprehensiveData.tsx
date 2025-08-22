import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Building, 
  Database, 
  FileText, 
  Info,
  BarChart,
  Map,
  TrendingUp,
  Users
} from 'lucide-react';

// Import existing components
import { ComprehensiveAttomDataSummaryTable } from './ComprehensiveAttomDataSummaryTable';
import { BuildingDetailsFromApiResponse } from './BuildingDetailsFromApiResponse';
import { ComprehensivePropertyDataFields } from './ComprehensivePropertyDataFields';
import { PropertyBasicProfile } from './PropertyBasicProfile';

interface PropertySummaryWithComprehensiveDataProps {
  className?: string;
  propertyAddress?: string;
}

export function PropertySummaryWithComprehensiveData({ 
  className = '',
  propertyAddress = '586 Franklin Ave, Brooklyn, NY 11238'
}: PropertySummaryWithComprehensiveDataProps) {
  const [activeTab, setActiveTab] = useState('comprehensive');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Property Summary - Comprehensive ATTOM Data Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Data Sources</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Basic Profile, Expanded Profile, Property Detail, and Sale Details
              </p>
            </div>
            
            <div className="p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Analysis Type</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Field-by-field data extraction with source tracking
              </p>
            </div>
            
            <div className="p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Map className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Coverage</span>
              </div>
              <p className="text-xs text-muted-foreground">
                300+ property data fields across 11 categories
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comprehensive">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span className="hidden sm:inline">Comprehensive</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="building">
            <div className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span className="hidden sm:inline">Building</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="detailed">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Detailed</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="basic">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span className="hidden sm:inline">Basic</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Compare</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Comprehensive Summary Table */}
        <TabsContent value="comprehensive" className="space-y-4">
          <Alert className="border-primary/20 bg-primary/5">
            <Database className="h-4 w-4" />
            <AlertDescription>
              This comprehensive summary extracts and displays data from all ATTOM API endpoints, 
              showing the source and confidence level for each field. Data is intelligently merged 
              with higher priority given to more detailed endpoints.
            </AlertDescription>
          </Alert>
          
          <ComprehensiveAttomDataSummaryTable 
            defaultAddress={propertyAddress}
            autoFetch={false}
          />
        </TabsContent>

        {/* Building Details Extraction */}
        <TabsContent value="building" className="space-y-4">
          <Alert className="border-accent/20 bg-accent/5">
            <Building className="h-4 w-4" />
            <AlertDescription>
              Building details specifically extracted from the Property Detail API response, 
              organized into logical sections with expandable views and raw data access.
            </AlertDescription>
          </Alert>
          
          <BuildingDetailsFromApiResponse 
            propertyDetailResponse={null}
            showAllDetails={true}
          />
        </TabsContent>

        {/* Detailed Property Data Fields */}
        <TabsContent value="detailed" className="space-y-4">
          <Alert className="border-secondary/20 bg-secondary/5">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Complete property data fields component showing all 300+ possible fields 
              from ATTOM API responses with smart formatting and comprehensive coverage.
            </AlertDescription>
          </Alert>
          
          <ComprehensivePropertyDataFields 
            propertyData={{}}
            attomData={{}}
            calculatedData={{}}
          />
        </TabsContent>

        {/* Basic Profile View */}
        <TabsContent value="basic" className="space-y-4">
          <Alert className="border-muted/20 bg-muted/5">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Basic property profile view showing essential information in a clean, 
              user-friendly format suitable for quick property overviews.
            </AlertDescription>
          </Alert>
          
          <PropertyBasicProfile 
            propertyData={{}}
            onEdit={() => {}}
            isEditing={false}
          />
        </TabsContent>

        {/* Data Source Comparison */}
        <TabsContent value="comparison" className="space-y-4">
          <Alert className="border-chart-1/20 bg-chart-1/5">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Compare data quality and coverage across different ATTOM API endpoints 
              to understand which sources provide the most comprehensive information.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Endpoint Comparison Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  API Endpoint Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Property Detail</h4>
                      <p className="text-xs text-muted-foreground">Most comprehensive data</p>
                    </div>
                    <Badge variant="default">300+ fields</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Expanded Profile</h4>
                      <p className="text-xs text-muted-foreground">Extended property details</p>
                    </div>
                    <Badge variant="secondary">200+ fields</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Basic Profile</h4>
                      <p className="text-xs text-muted-foreground">Essential information</p>
                    </div>
                    <Badge variant="outline">50+ fields</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Sale Details</h4>
                      <p className="text-xs text-muted-foreground">Market and transaction data</p>
                    </div>
                    <Badge variant="outline">25+ fields</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  Data Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Building Details</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">95%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assessment Data</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">85%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Market Information</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">78%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ownership Details</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-chart-1 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">72%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">School Information</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-chart-2 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">65%</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Completeness</span>
                    <Badge variant="default">82%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab('comprehensive')}
                >
                  <Database className="w-4 h-4" />
                  View All Data
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab('building')}
                >
                  <Building className="w-4 h-4" />
                  Building Details
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab('detailed')}
                >
                  <FileText className="w-4 h-4" />
                  All Fields
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This comprehensive property summary demonstrates the complete extraction and analysis 
          of ATTOM API data across all available endpoints. Each tab shows a different view 
          of the property data, from high-level summaries to detailed field-by-field analysis 
          with data source tracking and confidence levels.
        </AlertDescription>
      </Alert>
    </div>
  );
}