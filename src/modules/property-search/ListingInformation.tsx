import React from 'react'

interface ListingInformationProps {
  property: any
}

export function ListingInformation({ property }: ListingInformationProps) {
  if (!property) {
    return (
      <div className="border rounded p-4">
        <div className="font-medium mb-2">Listing Information</div>
        <p className="text-sm text-muted-foreground">Select a property to view ATTOM and MLS listing data.</p>
      </div>
    )
  }

  return (
    <div className="border rounded p-4 grid gap-4">
      <div className="font-medium">Listing Information</div>

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold">ATTOM Property Data</h3>
        <div className="text-sm text-muted-foreground">
          {/* Render a few ATTOM fields safely */}
          Address: {property?.attom?.address || '—'}
        </div>
      </section>

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold">MLS RETS/RESO Listing Data</h3>
        <div className="text-sm text-muted-foreground">
          Status: {property?.mls?.status || '—'}
        </div>
      </section>
    </div>
  )
}
