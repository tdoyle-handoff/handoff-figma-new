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

// Home Search Landing Page with AI MLS Integration
import HomeSearchLanding from './HomeSearchLanding'

export default function PropertySearchTabs() {
  const [tabValue, setTabValue] = React.useState<string>('home-search');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="w-full bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start">
          <TabsTrigger
            value="home-search"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Home Search
          </TabsTrigger>
          <TabsTrigger
            value="get-started"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Get Started
          </TabsTrigger>
          <TabsTrigger
            value="find-home"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Track & Compare
          </TabsTrigger>
          <TabsTrigger
            value="found-home"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
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
