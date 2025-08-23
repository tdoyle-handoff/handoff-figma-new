import React from 'react'

export function TopNav() {
  return (
    <div className="h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fdf51dc32668b459882a7a106ef4658d1?format=webp&width=800" alt="Handoff" className="h-8 w-auto" />
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm">Notifications</button>
        <button className="text-sm">Profile</button>
      </div>
    </div>
  )
}
