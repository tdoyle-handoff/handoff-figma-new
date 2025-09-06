import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Search as SearchIcon, ListChecks, Database, Play, Home, CheckCircle, X } from 'lucide-react'

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
  const [showPSHelp, setShowPSHelp] = React.useState<boolean>(() => {
    try { return localStorage.getItem('handoff-dismiss-alert-propertysearch-v1') !== 'true'; } catch { return true; }
  });

  return (
    <div className="w-full p-0 md:-ml-8 md:pr-8">
      <div className="grid grid-cols-12 gap-0 md:gap-6">
        <aside className="col-span-12 md:col-span-3 md:border-r bg-white">
          <div className="p-2 space-y-1">
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
        <section className="col-span-12 md:col-span-9 p-4 md:p-6">
          {showPSHelp && (
            <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-900 p-3 mb-4 flex items-start justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">Using Property Search</div>
                <p className="mt-1">
                  Use Get Started to capture your preferences, Track & Compare to save and rank homes, and Property Analysis to review data. Use the left menu to switch views.
                </p>
              </div>
              <button
                aria-label="Dismiss"
                className="p-1 text-amber-900/70 hover:text-amber-900"
                onClick={() => { setShowPSHelp(false); try { localStorage.setItem('handoff-dismiss-alert-propertysearch-v1','true'); } catch {} }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            {/* Get Started */}
            <TabsContent value="get-started" className="mt-0">
              <div className="bg-white border rounded-xl shadow-sm p-4 md:p-6 min-h-[75vh]">
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
              </div>
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
