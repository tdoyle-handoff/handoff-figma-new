import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Search as SearchIcon, ListChecks, Database } from 'lucide-react'

// Home Search panel (simple property search panel)
import PropertySearchPanel from './search-panel-impl'

// ATTOM API summary (read-only summary UI; does not auto-fetch)
import { ComprehensiveAttomDataSummaryTable } from './ComprehensiveAttomDataSummaryTable'

// Onboarding / Buyer Intake form
import BuyerIntakeForm from './BuyerIntakeForm'

export default function PropertySearchTabs() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Property Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Explore homes, review ATTOM data, and capture buyer preferences.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="onboarding" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="home" className="gap-2">
            <SearchIcon className="h-4 w-4" />
            Home Search
          </TabsTrigger>
          <TabsTrigger value="attom" className="gap-2">
            <Database className="h-4 w-4" />
            ATTOM Summary
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="gap-2">
            <ListChecks className="h-4 w-4" />
            Onboarding
          </TabsTrigger>
        </TabsList>

        {/* Home Search */}
        <TabsContent value="home" className="space-y-4">
          <PropertySearchPanel />
        </TabsContent>

        {/* ATTOM API Summary */}
        <TabsContent value="attom" className="space-y-4">
          <ComprehensiveAttomDataSummaryTable autoFetch={false} />
        </TabsContent>

        {/* Onboarding / Buyer Intake */}
        <TabsContent value="onboarding" className="space-y-4">
          <BuyerIntakeForm title="Buyer Intake Form" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

