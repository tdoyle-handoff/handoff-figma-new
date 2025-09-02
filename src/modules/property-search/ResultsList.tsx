import React from 'react'

interface ResultsListProps {
  items?: any[]
  loading?: boolean
  error?: string
  onSelect: (item: any) => void
}

export const ResultsList = React.memo(function ResultsList({ items = [], loading, error, onSelect }: ResultsListProps) {
  return (
    <div className="border rounded p-4">
      <div className="font-medium mb-2">Results</div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Searching…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No results. Try searching.</div>
      ) : (
        <ul className="divide-y">
          {items.map((it: any, idx: number) => {
            const address = it?.UnparsedAddress || [it?.StreetNumber, it?.StreetName, it?.City, it?.StateOrProvince, it?.PostalCode].filter(Boolean).join(' ')
            const price = typeof it?.ListPrice === 'number' ? `$${it.ListPrice.toLocaleString()}` : ''
            const beds = it?.BedroomsTotal ? `${it.BedroomsTotal} bd` : ''
            const baths = it?.BathroomsTotalInteger ? `${it.BathroomsTotalInteger} ba` : ''
            const meta = [beds, baths].filter(Boolean).join(' · ')
            return (
              <li key={it?.ListingId || idx} className="py-2 cursor-pointer hover:bg-muted/40 px-2" onClick={() => onSelect(it)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{address || 'Property'}</div>
                    <div className="text-xs text-muted-foreground">{meta}</div>
                  </div>
                  <div className="text-sm font-semibold">{price}</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
})
