import React, { useState } from 'react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { usePropertyContext } from './PropertyContext';
import { useNavigation } from '../hooks/useNavigation';
import {
  Home,
  FileText,
  CheckSquare,
  Users,
  BookOpen,
  Settings,
  LogOut,
  MessageSquare,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import type { PageType } from '../hooks/useNavigation';

interface NavigationItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
  category?: string;
}

interface DashboardLayoutProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  setupData?: any;
  onSignOut: () => void;
  isPropertySetupComplete: boolean;
  children: React.ReactNode;
}

export default function DashboardLayout({
  currentPage,
  onPageChange,
  setupData,
  onSignOut,
  isPropertySetupComplete,
  children
}: DashboardLayoutProps) {
  const propertyContext = usePropertyContext();
  const navigation = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Navigation items organized by workflow categories (unchanged logic)
  const navigationItems: NavigationItem[] = [
    { id: 'property', label: 'Property Search', icon: Home, category: 'Finding your Dream Home' },
    { id: 'overview', label: 'Analytics & Budget', icon: TrendingUp, category: 'Finding your Dream Home' },
    { id: 'tasks', label: 'Transaction Checklist', icon: CheckSquare, category: 'Purchasing Your Home' },
    { id: 'documents', label: 'Contract Builder', icon: FileText, category: 'Purchasing Your Home' },
    { id: 'resources', label: 'Education Hub', icon: BookOpen, category: 'Support' },
  ];

  const getUserDisplayName = () => {
    if (setupData?.buyerName && setupData.buyerName !== 'User') {
      return setupData.buyerName
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return 'User';
  };

  const getUserDisplayEmail = () => {
    if (setupData?.buyerEmail &&
        setupData.buyerEmail !== 'user@handoff.demo' &&
        setupData.buyerEmail !== 'guest@handoff.demo') {
      return setupData.buyerEmail;
    }
    return setupData?.buyerEmail || 'user@handoff.demo';
  };

  const getInitials = (name: string) => {
    if (!name || name === 'User') {
      return 'U';
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Group navigation items by category
  const groupedNavigation = navigationItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [] as NavigationItem[];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-foreground">
      <div className="flex w-full min-h-screen">
        {/* Sidebar */}
        <div className={cn(
          'relative z-30 flex flex-col bg-white border-r shadow-sm transition-all duration-200',
          sidebarOpen ? 'w-72' : 'w-16'
        )}>
          {/* Brand header */}
          <div className="px-4 py-3 border-b bg-white/95 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">H</div>
              {sidebarOpen && <div className="text-sm font-semibold">Handoff</div>}
            </div>
          </div>

          {/* User profile (compact) */}
          {sidebarOpen && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(getUserDisplayName())}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate">{getUserDisplayEmail()}</p>
                  {setupData?.displayBadge && (
                    <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground mt-1">{setupData.displayBadge}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation groups */}
          <div className="flex-1 overflow-auto p-2">
            {Object.entries(groupedNavigation).map(([category, items]) => (
              <div key={category} className="mb-2">
                {sidebarOpen && (
                  <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{category}</div>
                )}
                <div className="flex flex-col gap-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onPageChange(item.id)}
                        className={cn(
                          'w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                          isActive ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground',
                          !sidebarOpen && 'justify-center'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="mt-auto border-t p-2 flex items-center gap-1">
            <button
              className={cn('flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-muted', !sidebarOpen && 'justify-center w-full')}
              onClick={() => onPageChange('settings')}
            >
              <Settings className="h-3.5 w-3.5" />
              {sidebarOpen && <span>Settings</span>}
            </button>
            <button
              className={cn('flex items-center gap-2 px-2 py-1.5 rounded text-xs text-red-600 hover:bg-red-50', !sidebarOpen && 'justify-center w-full')}
              onClick={onSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              {sidebarOpen && <span>Quit</span>}
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header */}
          <div className="h-14 flex items-center gap-2 px-4 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{navigation.getPageTitle(currentPage).replace(' - Handoff', '')}</span>
              <span className="text-muted-foreground/40 hidden sm:inline">/</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{navigation.getPageDescription(currentPage)}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" size="sm">Preview</Button>
              <Button size="sm">Publish</Button>
              <Avatar className="h-8 w-8 ml-1">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(getUserDisplayName())}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Page body (unchanged children) */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
