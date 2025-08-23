import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Search as SearchIcon, ListChecks, Database, Play, Home, CheckCircle } from 'lucide-react'

// Home Tracker for tracking and ranking interested homes
import HomeTracker from './HomeTracker'

// ATTOM API summary (read-only summary UI; does not auto-fetch)
import { ComprehensiveAttomDataSummaryTable } from './ComprehensiveAttomDataSummaryTable'

// Onboarding / Buyer Intake form
import BuyerIntakeForm from './BuyerIntakeForm'
import SimpleOnboardingForm from './SimpleOnboardingForm'

export default function PropertySearchTabs() {
  const [tabValue, setTabValue] = React.useState<string>('get-started');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="get-started" className="gap-2">
            <Play className="h-4 w-4" />
            Get Started
          </TabsTrigger>
          <TabsTrigger value="find-home" className="gap-2">
            <ListChecks className="h-4 w-4" />
            Track & Compare
          </TabsTrigger>
          <TabsTrigger value="found-home" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Property Analysis
          </TabsTrigger>
        </TabsList>

        {/* Get Started */}
        <TabsContent value="get-started" className="space-y-6 mt-8">
          <SimpleOnboardingForm
            onComplete={(data) => {
              // Handle onboarding completion
              alert(`Welcome! Your onboarding is complete. Budget: ${data.budget}, Location: ${data.location}`);
              // In a real app, this would save the data and navigate to next step
              localStorage.setItem('onboarding-complete', JSON.stringify(data));
            }}
            onSkip={() => {
              // Handle onboarding skip
              if (confirm('Are you sure you want to skip the onboarding? You can complete it later in Settings.')) {
                localStorage.setItem('onboarding-skipped', 'true');
                alert('Onboarding skipped. You can complete it anytime in Settings.');
              }
            }}
          />
        </TabsContent>

        {/* Track & Compare */}
        <TabsContent value="find-home" className="space-y-6 mt-8">
          <HomeTracker />
        </TabsContent>

        {/* Property Analysis */}
        <TabsContent value="found-home" className="space-y-6 mt-8">
          <ComprehensiveAttomDataSummaryTable autoFetch={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
