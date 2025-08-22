import React from 'react'

export function RightSidebar() {
  return (
    <div className="p-3 space-y-3">
      <div className="text-xs uppercase text-muted-foreground">Quick Tips & FAQs</div>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>Deadlines update in real-time</li>
        <li>Use Smart Offer to auto-fill forms</li>
        <li>Invite your lender in Messages</li>
      </ul>

      <div className="text-xs uppercase text-muted-foreground pt-2">Important Deadlines</div>
      <div className="text-sm">No upcoming deadlines</div>

      <div className="text-xs uppercase text-muted-foreground pt-2">Recommended Next Actions</div>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>Get pre-approval</li>
        <li>Set property alerts</li>
      </ul>
    </div>
  )
}

