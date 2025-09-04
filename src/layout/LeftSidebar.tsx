import React from 'react'

export function LeftSidebar() {
  return (
    <div className="p-3 space-y-2 text-white">
      <div className="text-xs uppercase text-white/70">Navigation</div>
      <nav className="space-y-1">
        <button className="block w-full text-left px-2 py-1 rounded text-white/90 hover:bg-white/10" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Top</button>
        <button className="block w-full text-left px-2 py-1 rounded text-white/90 hover:bg-white/10" onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}>Search</button>
        <button className="block w-full text-left px-2 py-1 rounded text-white/90 hover:bg-white/10" onClick={() => document.getElementById('vendors')?.scrollIntoView({ behavior: 'smooth' })}>Vendors</button>
        <button className="block w-full text-left px-2 py-1 rounded text-white/90 hover:bg-white/10" onClick={() => document.getElementById('documents')?.scrollIntoView({ behavior: 'smooth' })}>Documents</button>
        <button className="block w-full text-left px-2 py-1 rounded text-white/90 hover:bg-white/10" onClick={() => document.getElementById('messages')?.scrollIntoView({ behavior: 'smooth' })}>Messages</button>
        <button className="block w-full text-left px-2 py-1 rounded text-white/90 hover:bg-white/10" onClick={() => document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' })}>Guides</button>
      </nav>
    </div>
  )
}

