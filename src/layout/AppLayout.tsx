import React from 'react'

interface AppLayoutProps {
  topNav?: React.ReactNode
  leftSidebar?: React.ReactNode
  rightSidebar?: React.ReactNode
  progressTracker?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
}

export function AppLayout({ topNav, leftSidebar, rightSidebar, progressTracker, actions, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="border-b bg-background">{topNav}</header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 border-r hidden md:block">{leftSidebar}</aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 space-y-4">
          {/* Progress Tracker + Actions */}
          {(progressTracker || actions) && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">{progressTracker}</div>
              <div className="flex gap-2">{actions}</div>
            </div>
          )}
          {children}
        </main>

        {/* Right Sidebar (optional) */}
        {rightSidebar && <aside className="w-80 border-l hidden lg:block">{rightSidebar}</aside>}
      </div>
    </div>
  )
}

