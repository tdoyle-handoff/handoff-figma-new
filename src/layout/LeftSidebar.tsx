import React from 'react'

export function LeftSidebar() {
  return (
    <div className="p-3 space-y-2">
      <div className="text-xs uppercase text-muted-foreground">Navigation</div>
      <nav className="space-y-1">
        <button className="block w-full text-left px-2 py-1 rounded hover:bg-muted" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Top</button>
        <button className="block w-full text-left px-2 py-1 rounded hover:bg-muted" onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}>Search</button>
        <button className="block w-full text-left px-2 py-1 rounded hover:bg-muted" onClick={() => document.getElementById('vendors')?.scrollIntoView({ behavior: 'smooth' })}>Vendors</button>
        <button className="block w-full text-left px-2 py-1 rounded hover:bg-muted" onClick={() => document.getElementById('documents')?.scrollIntoView({ behavior: 'smooth' })}>Documents</button>
        <button className="block w-full text-left px-2 py-1 rounded hover:bg-muted" onClick={() => document.getElementById('messages')?.scrollIntoView({ behavior: 'smooth' })}>Messages</button>
        <button className="block w-full text-left px-2 py-1 rounded hover:bg-muted" onClick={() => document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' })}>Guides</button>
      </nav>
    </div>
  )
}

