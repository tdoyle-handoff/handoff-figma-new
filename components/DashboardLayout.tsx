import React, { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { usePropertyContext } from './PropertyContext';
const handoffLogo = '/handoff-logo.png';
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
  ShoppingCart
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Navigation without AI features
  const navigationItems: NavigationItem[] = [
    // Prioritize Property Search as main entry
    {
      id: 'property',
      label: 'Property Search',
      icon: Home,
      category: 'Property'
    },
    {
      id: 'tasks',
      label: 'Transaction Checklist',
      icon: CheckSquare,
      category: 'Property'
    },


    // Keep Analytics but not as the default landing page
    {
      id: 'overview',
      label: 'Analytics & Budget',
      icon: BarChart3,
      category: 'Core'
    },
    
    // Transaction Details
    {
      id: 'vendor-marketplace',
      label: 'Vendor Marketplace',
      icon: ShoppingCart,
      category: 'Transaction Details'
    },
    
    // Communication & Support
    {
      id: 'communications',
      label: 'Communication Suite',
      icon: MessageSquare,
      category: 'Support'
    },
    {
      id: 'team',
      label: 'My Team',
      icon: Users,
      category: 'Support'
    },
    {
      id: 'documents',
      label: 'Offer & Document Hub',
      icon: FileText,
      category: 'Support'
    },
    {
      id: 'offer-builder',
      label: 'Offer Builder',
      icon: FileText,
      category: 'Support'
    },
    {
      id: 'resources',
      label: 'Education Hub',
      icon: BookOpen,
      category: 'Support'
    }
  ];

  const categoryColors = {
    'Core': 'text-blue-600 bg-blue-50 border-blue-200',
    'Property': 'text-blue-600 bg-blue-50 border-blue-200',
    'Transaction Details': 'text-green-600 bg-green-50 border-green-200',
    'Support': 'text-gray-600 bg-gray-50 border-gray-200'
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "relative z-30 flex flex-col bg-card border-r border-border transition-all duration-300 shrink-0",
        sidebarOpen ? "w-80" : "w-16"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {sidebarOpen ? (
              <img 
                src={handoffLogo} 
                alt="Handoff" 
                className="h-8 w-auto"
              />
            ) : (
              <img
                src={handoffLogo}
                alt="Handoff"
                className="h-8 w-8 object-contain"
              />
            )}
            {sidebarOpen && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Real Estate Transaction Management
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        {sidebarOpen && (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(getUserDisplayName())}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" title={getUserDisplayName()}>
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground truncate" title={getUserDisplayEmail()}>
                  {getUserDisplayEmail()}
                </p>
                {setupData?.displayBadge && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {setupData.displayBadge}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Quick Stats - hidden per request */}
            {false && (
              <div className="mt-3 p-3 bg-card rounded-lg border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Setup Progress</span>
                  <span className="font-medium">{Math.round(completionStatus.percentage)}%</span>
                </div>
                <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${completionStatus.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(groupedNavigation).map(([category, items]) => (
            <div key={category}>
              {/* Category headers removed per request */}
              
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-auto p-3 transition-all duration-200",
                        isActive && "bg-primary text-primary-foreground shadow-sm",
                        !isActive && "hover:bg-muted",
                        !sidebarOpen && "justify-center px-3"
                      )}
                      onClick={() => onPageChange(item.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {sidebarOpen && (
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{item.label}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-center h-auto p-1.5 text-xs text-muted-foreground hover:text-foreground",
                !sidebarOpen && "justify-center px-1.5"
              )}
              onClick={() => onPageChange('settings')}
            >
              <Settings className="h-3.5 w-3.5" />
              {sidebarOpen && <span className="ml-2 text-xs">Settings</span>}
            </Button>
            
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-center h-auto p-1.5 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50/50",
                !sidebarOpen && "justify-center px-1.5"
              )}
              onClick={onSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              {sidebarOpen && <span className="ml-2 text-xs">Sign Out</span>}
            </Button>
          </div>
          
          {sidebarOpen && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Collapse Sidebar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Toggle Button (when collapsed) */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-6 left-20 z-50"
          onClick={() => setSidebarOpen(true)}
        >
          <div className="text-xs">Expand</div>
        </Button>
      )}

      {/* Main Content */}
      <div className="relative z-0 flex-1 flex flex-col min-h-0 min-w-0">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}