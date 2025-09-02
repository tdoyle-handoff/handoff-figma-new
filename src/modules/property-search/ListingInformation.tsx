import React from 'react'

interface ListingInformationProps {
  property: any
}

export function ListingInformation({ property }: ListingInformationProps) {
  if (!property) {
    return (
      <div className="border rounded p-4">
        <div className="font-medium mb-2">Listing Information</div>
        <p className="text-sm text-muted-foreground">Select a property to view listing details.</p>
      </div>
    )
  }

  const raw = property?.raw || {}
  const address = raw?.UnparsedAddress || [raw?.StreetNumber, raw?.StreetName, raw?.City, raw?.StateOrProvince, raw?.PostalCode].filter(Boolean).join(' ')
  const status = raw?.StandardStatus || '—'

  return (
    <div className="border rounded p-4 grid gap-4">
      <div className="font-medium">Listing Information</div>

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold">Address</h3>
        <div className="text-sm text-muted-foreground">
          {address || '—'}
        </div>
      </section>

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold">MLS Listing Data</h3>
        <div className="text-sm text-muted-foreground">
          Status: {status}
        </div>
      </section>
    </div>
  )
}
