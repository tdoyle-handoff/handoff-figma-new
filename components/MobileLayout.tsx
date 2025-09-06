import React, { useState } from 'react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { usePropertyContext } from './PropertyContext';
import { useNavigation } from '../hooks/useNavigation';
const handoffLogo = 'https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fb382513b801044b9b63fee0d35fea0d6?format=webp&width=800';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  Settings, 
  LogOut,
  DollarSign,
  Scale,
  Shield,
  Menu,
  Calculator,
  Eye,
  Building,
  TrendingUp,
  BarChart3,
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

interface MobileLayoutProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  setupData?: any;
  onSignOut: () => void;
  isPropertySetupComplete: boolean;
  children: React.ReactNode;
}

export default function MobileLayout({
  currentPage,
  onPageChange,
  setupData,
  onSignOut,
  isPropertySetupComplete,
  children
}: MobileLayoutProps) {
  const propertyContext = usePropertyContext();
  const navigation = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation without AI features
  const navigationItems: NavigationItem[] = [
    // Make Property Search primary
    {
      id: 'property',
      label: 'Property Search',
      icon: Home,
      category: 'Core'
    },
    {
      id: 'tasks',
      label: 'Transaction Checklist',
      icon: CheckSquare,
      category: 'Core'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      category: 'Core'
    },

    // Keep Analytics but not default
    {
      id: 'overview',
      label: 'Analytics & Budget',
      icon: BarChart3,
      category: 'Core'
    },

    
    // Additional Services
    {
      id: 'documents',
      label: 'Contract Builder',
      icon: FileText,
      category: 'Services'
    },
    {
      id: 'resources',
      label: 'Education Hub',
      icon: BookOpen,
      category: 'Services'
    }
  ];

  // Bottom navigation items (most important)
  const bottomNavItems: { id: PageType; label: string; icon: React.ElementType }[] = [
    {
      id: 'tasks',
      label: 'Transaction Checklist',
      icon: CheckSquare
    },
    {
      id: 'property',
      label: 'Property Search',
      icon: Home
    },
    {
      id: 'overview',
      label: 'Analytics & Budget',
      icon: BarChart3
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar
    }
  ];

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

  const getCurrentPageInfo = () => {
    const item = navigationItems.find(item => item.id === currentPage);
    return item || { label: 'Dashboard', icon: BarChart3 };
  };

  const currentPageInfo = getCurrentPageInfo();
  const CurrentPageIcon = currentPageInfo.icon;

  // Group navigation items by category for mobile menu
  const groupedNavigation = navigationItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  const categoryColors = {
    'Core': 'text-blue-600 bg-blue-50 border-blue-200',
    'Transaction Details': 'text-green-600 bg-green-50 border-green-200',
    'Services': 'text-gray-600 bg-gray-50 border-gray-200'
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border px-4 py-3 safe-area-inset-top shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="mobile-button">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <img src={handoffLogo} alt="Handoff" className="ml-2 h-6 w-auto" />
              <SheetContent side="left" className="w-80 p-0 bg-white/98 backdrop-blur-md">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 border-b border-border text-left bg-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={handoffLogo}
                        alt="Handoff"
                        className="h-10 w-auto"
                      />
                      <div>
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="flex items-center gap-1 text-xs">
                          <TrendingUp className="w-3 h-3" />
                          {navigation.getPageDescription(currentPage)}
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>

                  {/* User Profile in Mobile Menu */}
                  <div className="p-4 border-b border-border bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(getUserDisplayName())}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm" title={getUserDisplayName()}>{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground" title={getUserDisplayEmail()}>{getUserDisplayEmail()}</p>
                        {setupData?.displayBadge && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {setupData.displayBadge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick Stats - hidden per request */}
                    {false && (
                      <div className="p-3 bg-card rounded-lg border">
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

                  {/* Mobile Navigation */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {Object.entries(groupedNavigation).map(([category, items]) => (
                      <div key={category}>
                        {/* Category headers removed per request */}
                        
                        <div className="space-y-1">
                          {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;

                            // Calendar shown as child item under Transaction Checklist
                            return (
                              <Button
                                key={item.id}
                                variant={isActive ? "default" : "ghost"}
                                className={cn(
                                  "w-full justify-start h-auto p-3 mobile-button",
                                  isActive && "bg-primary text-primary-foreground",
                                  !isActive && "hover:bg-muted",
                                  item.id === 'calendar' && 'pl-8'
                                )}
                                onClick={() => {
                                  onPageChange(item.id);
                                  setMobileMenuOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <Icon className="h-4 w-4 flex-shrink-0" />
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
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="p-4 border-t border-border space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start mobile-button"
                      onClick={() => {
                        onPageChange('settings');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start mobile-button text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={onSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <CurrentPageIcon className="w-5 h-5 text-primary" />
              <h1 className="font-medium text-lg">{currentPageInfo.label}</h1>
            </div>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto mobile-scroll">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-border px-2 py-2 safe-area-inset-bottom shadow-lg">
        <div className="flex items-center justify-around">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 h-auto py-2 px-1 mobile-tab-multiline",
                  isActive && "text-primary bg-primary/10"
                )}
                onClick={() => onPageChange(item.id)}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="mobile-tab-text-multiline text-xs">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
