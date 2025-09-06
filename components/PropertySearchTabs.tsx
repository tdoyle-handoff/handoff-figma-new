import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Search as SearchIcon, ListChecks, Database, Play, Home, CheckCircle } from 'lucide-react'

// Home Tracker for tracking and ranking interested homes
import HomeTracker from './HomeTracker'

// ATTOM API summary (read-only summary UI; does not auto-fetch)
import { ComprehensiveAttomDataSummaryTable } from './ComprehensiveAttomDataSummaryTable'

// Onboarding / Buyer Intake form
import BuyerIntakeForm from './BuyerIntakeForm'
import SimpleOnboardingForm from './SimpleOnboardingForm'

// Home Search Landing Page with AI MLS Integration

export default function PropertySearchTabs() {
  const [tabValue, setTabValue] = React.useState<string>('get-started');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="bg-white border rounded-lg p-2 space-y-1">
            <button
              className={`w-full text-left px-3 py-2 rounded-md ${tabValue==='get-started' ? 'bg-blue-50 text-[#0B1F44] font-semibold' : 'text-[#0B1F44] hover:bg-gray-50'}`}
              onClick={() => setTabValue('get-started')}
            >
              Get Started
            </button>
            <button
              className={`w-full text-left px-3 py-2 rounded-md ${tabValue==='find-home' ? 'bg-blue-50 text-[#0B1F44] font-semibold' : 'text-[#0B1F44] hover:bg-gray-50'}`}
              onClick={() => setTabValue('find-home')}
            >
              Track & Compare
            </button>
            <button
              className={`w-full text-left px-3 py-2 rounded-md ${tabValue==='found-home' ? 'bg-blue-50 text-[#0B1F44] font-semibold' : 'text-[#0B1F44] hover:bg-gray-50'}`}
              onClick={() => setTabValue('found-home')}
            >
              Property Analysis
            </button>
          </div>
        </aside>
        <section className="col-span-12 md:col-span-9">
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            {/* Get Started */}
            <TabsContent value="get-started" className="space-y-6 mt-0">
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
            <TabsContent value="find-home" className="space-y-6 mt-0">
              <HomeTracker />
            </TabsContent>

            {/* Property Analysis */}
            <TabsContent value="found-home" className="space-y-6 mt-0">
              <ComprehensiveAttomDataSummaryTable autoFetch={false} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  )
}
