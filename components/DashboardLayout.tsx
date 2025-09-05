import React, { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { usePropertyContext } from './PropertyContext';
import { useNavigation } from '../hooks/useNavigation';
const handoffLogo = 'https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fb382513b801044b9b63fee0d35fea0d6?format=webp&width=800';
import {
  Home,
  FileText,
  CheckSquare,
  Users,
  BookOpen,
  Settings,
  LogOut,
  DollarSign,
  Scale,
  Shield,
  MessageSquare,
  TrendingUp,
  Calculator,
  Eye,
  Building,
  BarChart3,
  ShoppingCart,
  Code,
  Calendar
} from 'lucide-react';
import type { PageType } from '../hooks/useNavigation';
import { useTaskContext, TaskPhase } from './TaskContext';

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

  // Check if user is a developer (in production, this would check actual permissions)
  const isDeveloper = process.env.NODE_ENV === 'development' || setupData?.buyerEmail?.includes('dev') || setupData?.buyerEmail?.includes('admin');

  // Navigation items organized by workflow categories
  const navigationItems: NavigationItem[] = [
    // Finding your Dream Home
    { id: 'property', label: 'Property Search', icon: Home, category: 'Finding your Dream Home' },
    { id: 'overview', label: 'Analytics & Budget', icon: TrendingUp, category: 'Finding your Dream Home' },

    // Purchasing Your Home
    { id: 'tasks', label: 'Transaction Checklist', icon: CheckSquare, category: 'Purchasing Your Home' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, category: 'Purchasing Your Home' },
    { id: 'documents', label: 'Contract Builder', icon: FileText, category: 'Purchasing Your Home' },

    // Support
    { id: 'resources', label: 'Education Hub', icon: BookOpen, category: 'Support' },

    // Developer section (hidden)
    // ...(isDeveloper ? [
    //   { id: 'dev-config', label: 'Developer Config', icon: Code, category: 'Developer Tools', description: 'Configure UI elements and features' }
    // ] : [])
  ];

  const categoryColors = {
    'Finding your Dream Home': 'text-blue-600 bg-blue-50 border-blue-200',
    'Purchasing Your Home': 'text-sky-600 bg-sky-50 border-sky-200',
    'Support': 'text-indigo-600 bg-indigo-50 border-indigo-200',
    'Developer Tools': 'text-purple-600 bg-purple-50 border-purple-200'
  };

  const getUserDisplayName = () => {
    if (setupData?.buyerName && setupData.buyerName !== 'User') {
      // Format the name properly (capitalize first letter of each word)
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

  const getCompletionStatus = () => {
    return propertyContext.getCompletionStatus();
  };

  const completionStatus = getCompletionStatus();

  // Phases for header stepper (only used on Tasks page)
  const taskCtx = useTaskContext();
  const headerPhases = taskCtx?.taskPhases || [];

  const HeaderPhaseStepper = ({ phases, currentId, onSelect }: { phases: TaskPhase[]; currentId?: string; onSelect: (id: string) => void }) => {
    const computeCurrentIndex = () => {
      if (currentId) {
        const idx = phases.findIndex(p => p.id === currentId);
        if (idx >= 0) return idx;
      }
      const activeIdx = phases.findIndex(p => p.status === 'active');
      if (activeIdx >= 0) return activeIdx;
      const firstIncomplete = phases.findIndex(p => {
        const total = p.tasks.length || 0;
        const done = p.tasks.filter(t => t.status === 'completed').length;
        return done < total;
      });
      return firstIncomplete >= 0 ? firstIncomplete : Math.max(0, phases.length - 1);
    };
    const cur = computeCurrentIndex();

    const stateAt = (i: number) => (i < cur ? 'completed' : i === cur ? 'current' : 'upcoming');

    return (
      <div className="hidden xl:flex items-center isolate rounded-full bg-white px-1.5 py-1 border border-gray-200 shadow-sm">
        {phases.map((p, i) => {
          const st = stateAt(i);
          const isCurrent = st === 'current';
          const base = 'relative inline-flex items-center h-9 px-5 rounded-full text-sm font-medium transition-colors';
          const colors = isCurrent
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700';
          const ring = isCurrent ? '' : 'ring-1 ring-gray-200';
          const z = isCurrent ? 'z-20' : i < cur ? 'z-10' : 'z-0';
          return (
            <button
              key={p.id}
              className={`${base} ${colors} ${ring} ${z} ${i>0 ? 'ml-3' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onSelect(p.id)}
              title={p.title}
            >
              {p.title}
              {i < phases.length - 1 && (
                <span
                  aria-hidden
                  className={`${isCurrent ? 'bg-blue-600' : 'bg-white'} absolute right-[-10px] top-0 h-full w-3 skew-x-12 ${isCurrent ? '' : 'ring-1 ring-gray-200'} rounded-r-full`}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Group navigation items by category
  const groupedNavigation = navigationItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // Pull Transaction Checklist to the top of the list
  const tasksItem = navigationItems.find((i) => i.id === 'tasks');
  const calendarItem = navigationItems.find((i) => i.id === 'calendar');

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden">
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            {sidebarOpen ? (
              <div className="flex items-center justify-center">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fb382513b801044b9b63fee0d35fea0d6?format=webp&width=800"
                  alt="Handoff Logo"
                  className="h-8 w-auto"
                />
              </div>
            ) : (
              <img
                src="/house-logo.svg"
                alt="Handoff Icon"
                className="h-8 w-8 rounded-lg"
              />
            )}
          </div>
        </div>

        {/* User Profile */}
        {sidebarOpen && (
          <div className="p-4 border-b border-blue-700/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(getUserDisplayName())}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-white" title={getUserDisplayName()}>
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-blue-200 truncate" title={getUserDisplayEmail()}>
                  {getUserDisplayEmail()}
                </p>
                {setupData?.displayBadge && (
                  <Badge variant="secondary" className="text-xs mt-1 bg-blue-700 text-blue-100 hover:bg-blue-600">
                    {setupData.displayBadge}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {/* Transaction Checklist pinned to top */}
            {tasksItem && (() => {
              const Icon = tasksItem.icon;
              const isActive = currentPage === tasksItem.id;
              return (
                <>
                  <button
                    key={tasksItem.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left",
                      isActive ? "bg-white text-blue-900 shadow-sm" : "text-blue-100 hover:bg-blue-800/50 hover:text-white",
                      !sidebarOpen && "justify-center px-3"
                    )}
                    onClick={() => onPageChange(tasksItem.id)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{tasksItem.label}</span>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Calendar child under Transaction Checklist */}
                  {calendarItem && (() => {
                    const CalIcon = calendarItem.icon;
                    return (
                      <button
                        key={calendarItem.id}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ml-6",
                          currentPage === calendarItem.id
                            ? "bg-white text-blue-900 shadow-sm"
                            : "text-blue-100 hover:bg-blue-800/50 hover:text-white",
                          !sidebarOpen && "justify-center px-3 ml-0"
                        )}
                        onClick={() => onPageChange(calendarItem.id)}
                      >
                        <CalIcon className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && (
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{calendarItem.label}</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })()}
                </>
              );
            })()}

            {Object.entries(groupedNavigation).map(([category, items]) => (
              <React.Fragment key={category}>
                {sidebarOpen && category !== 'Finding your Dream Home' && category !== 'Purchasing Your Home' && category !== 'Support' && (
                  <div className="px-3 py-2 text-xs font-medium text-blue-300 uppercase tracking-wide">
                    {category}
                  </div>
                )}
                {items.map((item) => {
                  if (item.id === 'tasks' || item.id === 'calendar') return null; // already rendered at top
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left",
                        isActive
                          ? "bg-white text-blue-900 shadow-sm"
                          : "text-blue-100 hover:bg-blue-800/50 hover:text-white",
                        !sidebarOpen && "justify-center px-3"
                      )}
                      onClick={() => onPageChange(item.id)}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs px-1.5 py-0.5",
                                  isActive
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-blue-700 text-blue-100"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-blue-700/50 mt-auto">
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-200 text-blue-200 hover:bg-blue-800/30 hover:text-white text-xs",
                !sidebarOpen && "justify-center px-2"
              )}
              onClick={() => onPageChange('settings')}
            >
              <Settings className="h-3 w-3" />
              {sidebarOpen && <span>Settings</span>}
            </button>

            <button
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-200 text-blue-200 hover:bg-red-600/30 hover:text-white text-xs",
                !sidebarOpen && "justify-center px-2"
              )}
              onClick={onSignOut}
            >
              <LogOut className="h-3 w-3" />
              {sidebarOpen && <span>Quit</span>}
            </button>
          </div>

          {sidebarOpen && (
            <div className="mt-2 pt-2 border-t border-blue-700/30">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-xs text-blue-300 hover:text-white transition-colors"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-0 flex-1 flex flex-col min-h-0 min-w-0 bg-slate-50">
        {/* Top Navigation Bar */}
        <header className="px-6 pt-6">
          <div className="bg-[#0B1F44] text-white rounded-2xl shadow-lg px-6 py-3 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <img
                src={handoffLogo}
                alt="Handoff Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="sr-only">{navigation.getPageTitle(currentPage)}</span>
            </div>

            {/* Center: Horizontal Nav */}
            <nav className="flex items-center gap-2">
              {navigationItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={cn(
                      "px-5 py-2 rounded-xl text-sm font-medium transition-colors",
                      isActive ? "bg-white/15 text-white" : "text-white/80 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right: User */}
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-white/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(getUserDisplayName())}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-medium">{getUserDisplayName()}</div>
                <div className="text-xs text-white/70 truncate max-w-[220px]">{getUserDisplayEmail()}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
