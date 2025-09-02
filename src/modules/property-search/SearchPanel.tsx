import React, { useCallback, useMemo, useState } from 'react'
import { Filters } from './filters'
import { ResultsList } from './ResultsList'
import { ListingInformation } from './ListingInformation'

export function SearchPanel() {
  const [query, setQuery] = useState({ location: '', minPrice: '', maxPrice: '', beds: '', baths: '', type: '', dom: '' })
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'attom' | 'mls'>('attom')

  // AI/NL search states (existing)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])

  // Direct MLS search states (new)
  const [loadingMLS, setLoadingMLS] = useState(false)
  const [errorMLS, setErrorMLS] = useState<string | null>(null)
  const [resultsMLS, setResultsMLS] = useState<any[]>([])

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

  // Existing path: AI parser + Trestle
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

  // New path: direct Trestle (no OpenAI)
  const onSearchMLS = useCallback(async () => {
    try {
      setLoadingMLS(true)
      setErrorMLS(null)
      setResultsMLS([])
      setSelectedProperty(null)

      const payload: any = {}
      if (query.location) payload.location = query.location
      const toNum = (s: string) => (s && !Number.isNaN(Number(s)) ? Number(s) : undefined)
      const mp = toNum(query.minPrice)
      const xp = toNum(query.maxPrice)
      const bd = toNum(query.beds)
      const ba = toNum(query.baths)
      const dm = toNum(query.dom)
      if (typeof mp === 'number') payload.minPrice = mp
      if (typeof xp === 'number') payload.maxPrice = xp
      if (typeof bd === 'number') payload.bedsMin = bd
      if (typeof ba === 'number') payload.bathsMin = ba
      if (typeof dm === 'number') payload.daysOnMarketMax = dm
      if (query.type) payload.propertyType = query.type
      payload.top = 50
      payload.skip = 0

      const r = await fetch('/api/mls-search-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Request failed with status ${r.status}`)
      }
      const data = await r.json()
      setResultsMLS(Array.isArray(data?.results) ? data.results : [])
    } catch (e: any) {
      setErrorMLS(e?.message || 'MLS search failed')
    } finally {
      setLoadingMLS(false)
    }
  }, [query])

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
        <>
          <Filters value={query} onChange={setQuery} onSearch={onSearchMLS} />
          <ResultsList
            items={resultsMLS}
            loading={loadingMLS}
            error={errorMLS || undefined}
            onSelect={(listing) => {
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
      )}
    </div>
  )
}

