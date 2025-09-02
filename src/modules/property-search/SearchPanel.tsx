import React, { useCallback, useMemo, useState } from 'react'
import { Filters } from './filters'
import { ResultsList } from './ResultsList'
import { ListingInformation } from './ListingInformation'

export function SearchPanel() {
  const [query, setQuery] = useState({ location: '', minPrice: '', maxPrice: '', beds: '', baths: '', type: '', dom: '' })
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'attom' | 'mls'>('attom')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])

  const composedQuery = useMemo(() => {
    const parts: string[] = []
    if (query.location) parts.push(`location: ${query.location}`)
    if (query.minPrice) parts.push(`minPrice: ${query.minPrice}`)
    if (query.maxPrice) parts.push(`maxPrice: ${query.maxPrice}`)
    if (query.beds) parts.push(`beds: ${query.beds}`)
    if (query.baths) parts.push(`baths: ${query.baths}`)
    if (query.type) parts.push(`propertyType: ${query.type}`)
    if (query.dom) parts.push(`daysOnMarketMax: ${query.dom}`)
    return parts.join(', ')
  }, [query])

  const onSearch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setResults([])
      setSelectedProperty(null)

      const r = await fetch('/api/mls-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: composedQuery || query.location || '' })
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Request failed with status ${r.status}`)
      }
      const data = await r.json()
      setResults(Array.isArray(data?.results) ? data.results : [])
    } catch (e: any) {
      setError(e?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [composedQuery, query])

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
          <Filters value={query} onChange={setQuery} onSearch={onSearch} />
          <ResultsList
            items={results}
            loading={loading}
            error={error || undefined}
            onSelect={(listing) => {
              // Create a lightweight wrapper to satisfy the ListingInformation UI
              const wrapped = {
                attom: { address: listing?.UnparsedAddress || [listing?.StreetNumber, listing?.StreetName, listing?.City, listing?.StateOrProvince, listing?.PostalCode].filter(Boolean).join(' ') },
                mls: { status: listing?.StandardStatus || '—' },
                raw: listing,
              }
              setSelectedProperty(wrapped)
            }}
          />
          {selectedProperty && (
            <ListingInformation property={selectedProperty} />
          )}
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

