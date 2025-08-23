import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Search as SearchIcon, ListChecks, Database, Play, Home, CheckCircle } from 'lucide-react'

// Home Search panel (simple property search panel)
import PropertySearchPanel from './search-panel-impl'

// ATTOM API summary (read-only summary UI; does not auto-fetch)
import { ComprehensiveAttomDataSummaryTable } from './ComprehensiveAttomDataSummaryTable'

// Onboarding / Buyer Intake form
import BuyerIntakeForm from './BuyerIntakeForm'

export default function PropertySearchTabs() {
  const [tabValue, setTabValue] = React.useState<string>('get-started');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-6 w-6 text-blue-600" />
            Property Search Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Follow our three-phase approach to finding your perfect home.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-blue-600 font-medium">Phase 1: Get Started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-600 font-medium">Phase 2: Find a Home</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-purple-600 font-medium">Phase 3: I've Found a Home</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="get-started" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Play className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Phase 1</div>
              <div className="text-xs opacity-80">Let's Get Started</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="find-home" className="gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <SearchIcon className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Phase 2</div>
              <div className="text-xs opacity-80">Let's Find a Home</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="found-home" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <CheckCircle className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Phase 3</div>
              <div className="text-xs opacity-80">I've Found a Home</div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Phase 1: Let's Get Started */}
        <TabsContent value="get-started" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Play className="h-5 w-5" />
                Phase 1: Let's Get Started
                <Badge className="bg-blue-600">Onboarding</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Tell us about your home buying preferences and requirements so we can help you find the perfect property.
              </p>
            </CardContent>
          </Card>
          <BuyerIntakeForm title="Complete Your Buyer Profile" />
        </TabsContent>

        {/* Phase 2: Let's Find a Home */}
        <TabsContent value="find-home" className="space-y-6">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <SearchIcon className="h-5 w-5" />
                Phase 2: Let's Find a Home
                <Badge className="bg-emerald-600">Home Search</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-700 mb-4">
                Search for properties that match your criteria and explore available listings in your target areas.
              </p>
            </CardContent>
          </Card>
          <PropertySearchPanel />
        </TabsContent>

        {/* Phase 3: I've Found a Home */}
        <TabsContent value="found-home" className="space-y-6">
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <CheckCircle className="h-5 w-5" />
                Phase 3: I've Found a Home
                <Badge className="bg-purple-600">Property Analysis</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 mb-4">
                Review comprehensive property data, market analysis, and detailed information about your chosen home.
              </p>
            </CardContent>
          </Card>
          <ComprehensiveAttomDataSummaryTable autoFetch={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
