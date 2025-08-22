import React from 'react'
import { AppLayout } from '../layout/AppLayout'
import { TopNav } from '../layout/TopNav'
import { LeftSidebar } from '../layout/LeftSidebar'
import { RightSidebar } from '../layout/RightSidebar'
import { SearchPanel } from '../modules/property-search/SearchPanel'

export default function Dashboard() {
  const Progress = () => (
    <div className="w-full h-2 bg-muted rounded">
      <div className="h-2 bg-primary rounded" style={{ width: '30%' }} />
    </div>
  )

  const Actions = () => (
    <div className="flex gap-2">
      <button className="px-3 py-2 border rounded">Make Offer</button>
      <button className="px-3 py-2 border rounded">Add Vendor</button>
      <button className="px-3 py-2 border rounded">Upload Document</button>
    </div>
  )

  return (
    <AppLayout
      topNav={<TopNav />}
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
      progressTracker={<Progress />}
      actions={<Actions />}
    >
      <div className="grid gap-4">
        <section id="search" className="border rounded p-4">
          <h2 className="font-semibold mb-2">Property Search & Selection</h2>
          <p className="text-sm text-muted-foreground">MLS integration, filters, save favorites, alerts.</p>
          <div className="mt-4">
            <SearchPanel />
          </div>
        </section>

        <section id="vendors" className="border rounded p-4">
          <h2 className="font-semibold mb-2">Vendor Marketplace</h2>
          <p className="text-sm text-muted-foreground">Find and book inspectors, appraisers, attorneys, lenders, title, insurance.</p>
        </section>

        <section id="documents" className="border rounded p-4">
          <h2 className="font-semibold mb-2">Offer & Document Automation</h2>
          <p className="text-sm text-muted-foreground">Smart Offer Builder, templates, contingencies, e-sign.</p>
        </section>

        <section id="messages" className="border rounded p-4">
          <h2 className="font-semibold mb-2">Communication Suite</h2>
          <p className="text-sm text-muted-foreground">Secure chat, file sharing, group chats, summaries.</p>
        </section>

        <section id="guides" className="border rounded p-4">
          <h2 className="font-semibold mb-2">Education Hub</h2>
          <p className="text-sm text-muted-foreground">Stage-based guides, videos, glossary, calculators.</p>
        </section>
      </div>
    </AppLayout>
  )
}

