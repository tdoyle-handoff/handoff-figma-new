import React, { useState } from 'react'

export function TopNav() {
  const [logoSrc, setLogoSrc] = useState('/handoff-logo.png')

  return (
    <div className="h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={logoSrc}
          alt="Handoff"
          className="h-8 w-auto"
          onError={() => setLogoSrc('/handoff-logo.svg')}
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm">Notifications</button>
        <button className="text-sm">Profile</button>
      </div>
    </div>
  )
}

