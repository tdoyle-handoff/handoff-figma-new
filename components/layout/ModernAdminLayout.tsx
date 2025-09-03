import React from 'react'
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarSeparator, SidebarTrigger } from '../ui/sidebar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '../ui/utils'
import { CalendarIcon, ClipboardList, Cog, FileText, Home, Layers, List, LucideIcon, Plus, Users } from 'lucide-react'

export type SectionItem = {
  key: string
  label: string
  icon?: LucideIcon
}

interface ModernAdminLayoutProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  sections?: SectionItem[]
  activeSectionKey?: string
  onSectionChange?: (key: string) => void
  children: React.ReactNode
}

// A reusable app shell that mirrors the screenshot: primary dark sidebar, top header with actions,
// a secondary left column for section navigation, and a main content area.
export default function ModernAdminLayout({
  title,
  subtitle,
  actions,
  sections = [],
  activeSectionKey,
  onSectionChange,
  children,
}: ModernAdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#F8FAFC] text-foreground">
        <div className="flex w-full min-h-screen">
          {/* Primary sidebar */}
          <Sidebar className="border-r">
            <SidebarHeader className="px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">S</div>
                <div className="text-sm font-semibold">SESSIONS</div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <div className="px-2 pb-2">
                <Button className="w-full justify-center" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Create
                </Button>
              </div>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>General</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Home /> <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <ClipboardList /> <span>Memory</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Modules</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users /> <span>Book me</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <CalendarIcon /> <span>Events</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Resources</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <List /> <span>Agendas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FileText /> <span>Files</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Layers /> <span>Tools</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Main area */}
          <SidebarInset>
            {/* Top header */}
            <div className="h-14 flex items-center gap-2 px-4 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
              <SidebarTrigger className="mr-1" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">New Event</span>
                <span className="text-muted-foreground/40">/</span>
                <h1 className="text-base font-semibold">{title}</h1>
                {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
              </div>
              <div className="ml-auto flex items-center gap-2">
                {actions}
                <Button variant="secondary" size="sm">Preview event</Button>
                <Button size="sm">Publish event</Button>
              </div>
            </div>

            {/* Content grid: secondary nav + main content */}
            <div className="p-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Secondary left column navigation */}
                {sections.length > 0 && (
                  <nav className="col-span-3 hidden lg:block">
                    <ul className="space-y-1">
                      {sections.map((s) => (
                        <li key={s.key}>
                          <button
                            onClick={() => onSectionChange?.(s.key)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors',
                              activeSectionKey === s.key
                                ? 'bg-white border-border shadow-sm text-foreground'
                                : 'bg-transparent border-transparent hover:bg-muted text-muted-foreground'
                            )}
                          >
                            {s.icon && <s.icon className="h-4 w-4" />}
                            <span>{s.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}

                {/* Main content */}
                <div className={cn(sections.length > 0 ? 'col-span-12 lg:col-span-9' : 'col-span-12')}>
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}

