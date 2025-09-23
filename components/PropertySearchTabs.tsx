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
  const [tabValue, setTabValue] = React.useState<string>(() => {
    try {
      return localStorage.getItem('handoff-propertysearch-selected-tab') || 'get-started'
    } catch {
      return 'get-started'
    }
  });
  const [showPSHelp, setShowPSHelp] = React.useState<boolean>(() => {
    try { return localStorage.getItem('handoff-dismiss-alert-propertysearch-v1') !== 'true'; } catch { return true; }
  });

  React.useEffect(() => {
    try { localStorage.setItem('handoff-propertysearch-selected-tab', tabValue); } catch {}
  }, [tabValue]);

  return (
    <div className="w-full p-0 md:-ml-8 md:pr-8">
      <div className="grid grid-cols-12 gap-0 md:gap-6">
        <section className="col-span-12 p-4 md:p-6">
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
            <TabsList className="bg-transparent h-auto p-0 rounded-none border-0 mb-4">
              <TabsTrigger value="get-started" className="rounded-none border-0 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 text-gray-600 px-4 py-2">Get Started</TabsTrigger>
              <TabsTrigger value="find-home" className="rounded-none border-0 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 text-gray-600 px-4 py-2">Track & Compare</TabsTrigger>
              <TabsTrigger value="found-home" className="rounded-none border-0 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 text-gray-600 px-4 py-2">Property Analysis</TabsTrigger>
            </TabsList>
            {/* Get Started */}
            <TabsContent value="get-started" className="mt-0">
              <div className="bg-white border rounded-xl shadow-sm p-4 md:p-6 min-h-[75vh] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Work through the questionnaire then mark the checklist task complete.</div>
                  <Button size="sm" variant="outline" onClick={() => {
                    try { window.dispatchEvent(new CustomEvent('openTaskDetails', { detail: { taskId: 'task-buy-box-template' } })); } catch {}
                  }}>
                    <ListChecks className="w-4 h-4 mr-2" /> View Questionnaire Task
                  </Button>
                </div>
                <SimpleOnboardingForm
                onComplete={(data) => {
                  // Handle onboarding completion
                  alert(`Welcome! Your onboarding is complete. Budget: ${data.budget}, Location: ${data.location}`);
                  // In a real app, this would save the data and navigate to next step
                  localStorage.setItem('onboarding-complete', JSON.stringify(data));
                  try { window.dispatchEvent(new CustomEvent('openTaskDetails', { detail: { taskId: 'task-buy-box-template' } })); } catch {}
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
