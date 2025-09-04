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

  // Group navigation items by category
  const groupedNavigation = navigationItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={cn(
        "relative z-30 flex flex-col bg-[#001F3F] shadow-xl transition-all duration-300 shrink-0",
        sidebarOpen ? "w-80" : "w-16"
      )}>
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
                src="https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fb382513b801044b9b63fee0d35fea0d6?format=webp&width=800"
                alt="Handoff Logo"
                className="h-8 w-auto"
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
            {Object.entries(groupedNavigation).map(([category, items]) => (
              <React.Fragment key={category}>
                {sidebarOpen && category !== 'Finding your Dream Home' && category !== 'Purchasing Your Home' && category !== 'Support' && (
                  <div className="px-3 py-2 text-xs font-medium text-blue-300 uppercase tracking-wide">
                    {category}
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  // Show calendar as a child only when Transaction Checklist is active (or on calendar page)
                  if (item.id === 'calendar' && !(currentPage === 'tasks' || currentPage === 'calendar')) {
                    return null;
                  }

                  return (
                    <button
                      key={item.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left",
                        isActive
                          ? "bg-white text-blue-900 shadow-sm"
                          : "text-blue-100 hover:bg-blue-800/50 hover:text-white",
                        !sidebarOpen && "justify-center px-3",
                        item.id === 'calendar' && sidebarOpen && 'ml-6'
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
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{navigation.getPageTitle(currentPage).replace(' - Handoff', '')}</h1>
                <p className="text-sm text-gray-600 mt-1">{navigation.getPageDescription(currentPage)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(getUserDisplayName())}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
