import React, { useState } from 'react'
import { Filters, ResultsList, ListingInformation } from './components'

export function SearchPanel() {
  const [query, setQuery] = useState({ location: '', minPrice: '', maxPrice: '', beds: '', baths: '', type: '', dom: '' })
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'attom' | 'mls'>('attom')

  return (
    <div className="grid gap-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={`px-3 py-2 border rounded ${activeTab === 'attom' ? 'bg-muted' : ''}`}
          onClick={() => setActiveTab('attom')}
        >
          ATTOM
        </button>
        <button
          className={`px-3 py-2 border rounded ${activeTab === 'mls' ? 'bg-muted' : ''}`}
          onClick={() => setActiveTab('mls')}
        >
          MLS (RETS/RESO)
        </button>
      </div>

      {activeTab === 'attom' ? (
        <>
          <Filters value={query} onChange={setQuery} onSearch={() => { /* wire to server */ }} />
          <ResultsList onSelect={setSelectedProperty} />
          <ListingInformation property={selectedProperty} />
        </>
      ) : (
        <div className="border rounded p-4">
          <div className="font-medium mb-2">MLS Listing Information</div>
          <p className="text-sm text-muted-foreground">
            MLS RETS/RESO integration will appear here. This tab is intentionally separate and not wired yet.
          </p>
        </div>
      )}
    </div>
  )
}

