import React from 'react'

interface ResultsListProps {
  onSelect: (item: any) => void
}

type ResultItem = { id: string; title: string }

export const ResultsList = React.memo(function ResultsList({ onSelect }: ResultsListProps) {
  const items: ResultItem[] = [] // wire with real results later
  return (
    <div className="border rounded p-4">
      <div className="font-medium mb-2">Results</div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No results. Try searching.</div>
      ) : (
        <ul className="divide-y">
          {items.map((it, idx) => (
            <li key={idx} className="py-2 cursor-pointer hover:bg-muted/40 px-2" onClick={() => onSelect(it)}>
              {it.title || 'Property'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
