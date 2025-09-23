import React from 'react'

export function TopNav() {
  return (
    <div className="h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fb382513b801044b9b63fee0d35fea0d6?format=webp&width=800" alt="Handoff" className="h-8 w-auto invert brightness-0" />
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm">Notifications</button>
        <button className="text-sm">Profile</button>
      </div>
    </div>
  )
}
