import React from 'react'

interface FiltersProps {
  value: any
  onChange: (next: any) => void
  onSearch: () => void
}

export function Filters({ value, onChange, onSearch }: FiltersProps) {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v })
  return (
    <div className="border rounded p-4 grid gap-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <input className="border rounded px-2 py-1" placeholder="Location" value={value.location} onChange={e => set('location', e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Min Price" value={value.minPrice} onChange={e => set('minPrice', e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Max Price" value={value.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Beds" value={value.beds} onChange={e => set('beds', e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Baths" value={value.baths} onChange={e => set('baths', e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Type" value={value.type} onChange={e => set('type', e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <button className="px-3 py-2 border rounded" onClick={onSearch}>Search</button>
      </div>
    </div>
  )
}

