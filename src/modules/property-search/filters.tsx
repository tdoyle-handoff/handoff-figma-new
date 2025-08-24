import React from 'react'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

interface FiltersProps {
  value: any
  onChange: (next: any) => void
  onSearch: () => void
}

export function Filters({ value, onChange, onSearch }: FiltersProps) {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v })

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Location</label>
          <Input
            placeholder="City, State or ZIP"
            value={value.location}
            onChange={e => set('location', e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Price Range</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min Price"
              value={value.minPrice}
              onChange={e => set('minPrice', e.target.value)}
              className="bg-white"
            />
            <Input
              placeholder="Max Price"
              value={value.maxPrice}
              onChange={e => set('maxPrice', e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bedrooms</label>
          <Select value={value.beds} onValueChange={v => set('beds', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bathrooms</label>
          <Select value={value.baths} onValueChange={v => set('baths', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="1.5">1.5+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="2.5">2.5+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Property Type</label>
          <Select value={value.type} onValueChange={v => set('type', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Any Type" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="">Any Type</SelectItem>
              <SelectItem value="single-family">Single Family</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="multi-family">Multi Family</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Days on Market</label>
          <Select value={value.dom} onValueChange={v => set('dom', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="7">1 Week</SelectItem>
              <SelectItem value="30">1 Month</SelectItem>
              <SelectItem value="90">3 Months</SelectItem>
              <SelectItem value="180">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => onChange({ location: '', minPrice: '', maxPrice: '', beds: '', baths: '', type: '', dom: '' })}>
          Clear
        </Button>
        <Button onClick={onSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
          Search Properties
        </Button>
      </div>
    </div>
  )
}
