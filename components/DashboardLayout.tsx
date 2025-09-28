import React, { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { usePropertyContext } from './PropertyContext';
import { useNavigation } from '../hooks/useNavigation';
import { HANDOFF_LOGO_URL } from '../utils/branding';
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
  Calendar,
  Bell,
  CreditCard,
  ExternalLink,
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';
import type { PageType } from '../hooks/useNavigation';
import { useTaskContext, TaskPhase } from './TaskContext';
import { useAuth } from '../hooks/useAuth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

function daysUntil(dateStr?: string) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const today = new Date();
  d.setHours(0,0,0,0); today.setHours(0,0,0,0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000*60*60*24));
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
  const { userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const taskCtx = useTaskContext();

  // Notifications
  const tasks = taskCtx.tasks;
  const prefs = ((userProfile as any)?.preferences?.notifications || {}) as Partial<{ overdueTasks:boolean; financingDeadlines:boolean; contractMilestones:boolean }>;
  const showOverdue = prefs.overdueTasks !== false;
  const showFinancing = prefs.financingDeadlines !== false;
  const showContract = prefs.contractMilestones !== false;
  const today = new Date();
  const overdue = showOverdue ? tasks.filter(t => (t.status === 'overdue') || (t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed')).slice(0,5) : [];
  const financing = showFinancing ? tasks.filter(t => ((t.subcategory||'').toLowerCase()==='financing' || (t.tags||[]).includes('financing')) && t.dueDate && daysUntil(t.dueDate) <= 7 && t.status !== 'completed').slice(0,5) : [];
  const contractTasks = tasks.filter(t => (t.category==='contract' || t.category==='diligence'));
  const contractDue = showContract ? contractTasks.filter(t => t.dueDate && daysUntil(t.dueDate) <= 7 && t.status !== 'completed').slice(0,5) : [];
  const closingSoon = showContract && taskCtx.scheduleAnchors.closingDate && daysUntil(taskCtx.scheduleAnchors.closingDate) <= 14 ? [{ id: 'closing-anchor', title: 'Closing approaching', dueDate: taskCtx.scheduleAnchors.closingDate }] : [];
  const totalNotifications = overdue.length + financing.length + contractDue.length + closingSoon.length;

  const openTask = (id?: string) => {
    if (!id) return;
    try { window.dispatchEvent(new CustomEvent('openTaskDetails', { detail: { taskId: id } })); } catch {}
    onPageChange('tasks');
  };

  // Quick Add state
  const [quickOpen, setQuickOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<'search'|'offer'|'contract'|'diligence'|'pre-closing'|'closing'|'post-closing'>('search');
  const [taskPriority, setTaskPriority] = useState<'high'|'medium'|'low'>('medium');
  const [taskDue, setTaskDue] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propCity, setPropCity] = useState('');
  const [propState, setPropState] = useState('');
  const [propZip, setPropZip] = useState('');

  // Check if user is a developer (in production, this would check actual permissions)
  const isDeveloper = process.env.NODE_ENV === 'development' || setupData?.buyerEmail?.includes('dev') || setupData?.buyerEmail?.includes('admin');

  // Navigation items organized by workflow categories
  const navigationItems: NavigationItem[] = [
    // Primary
    { id: 'dashboard', label: 'Dashboard', icon: Home, category: 'Primary' },

    // Purchasing Your Home (prioritized)
    { id: 'tasks', label: 'Transaction Checklist', icon: CheckSquare, category: 'Purchasing Your Home' },

    // Finding your Dream Home
    { id: 'property', label: 'Property Search', icon: Building, category: 'Finding your Dream Home' },
    { id: 'overview', label: 'Analytics & Budget', icon: TrendingUp, category: 'Finding your Dream Home' },

    // Purchasing Your Home
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
          const base = 'relative inline-flex items-center h-11 px-5 rounded-full text-sm font-medium transition-colors';
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
      <div className={cn("bg-[#0B1F44] text-white flex flex-col rounded-3xl shadow-xl ring-1 ring-white/10 my-4 ml-4 overflow-hidden transition-all duration-300", sidebarOpen ? "w-64 min-w-[16rem]" : "w-20 min-w-[5rem]")}>
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            {sidebarOpen ? (
              <div className="flex items-center justify-center">
                <img
                  src={HANDOFF_LOGO_URL}
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
          <div className="space-y-2">
            {/* Transaction Checklist pinned to top */}
            {tasksItem && (() => {
              const Icon = tasksItem.icon;
              const isActive = currentPage === tasksItem.id;
              return (
                <>
                  <button
                    key={tasksItem.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 text-left",
                      isActive ? "bg-white/15 text-white shadow-inner" : "text-white/70 hover:bg-white/10 hover:text-white",
                      !sidebarOpen && "justify-center px-3"
                    )}
                    onClick={() => onPageChange(tasksItem.id)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium tracking-tight">{tasksItem.label}</span>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Calendar child under Transaction Checklist */}
                  {calendarItem && currentPage === 'tasks' && (() => {
                    const CalIcon = calendarItem.icon;
                    return (
<button
                    key={calendarItem.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 text-left ml-6",
                      currentPage === calendarItem.id
                        ? "bg-white/15 text-white shadow-inner"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                      !sidebarOpen && "justify-center px-3 ml-0"
                    )}
                    aria-current={currentPage === calendarItem.id ? 'page' : undefined}
                    onClick={() => onPageChange(calendarItem.id)}
                  >
                        <CalIcon className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && (
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-medium tracking-tight">{calendarItem.label}</span>
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
                {sidebarOpen && category !== 'Finding your Dream Home' && category !== 'Purchasing Your Home' && category !== 'Support' && category !== 'Primary' && (
                  <div className="mx-1 mb-2 inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-[10px] font-semibold uppercase tracking-wide">
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
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 text-left",
                        isActive
                          ? "bg-white/15 text-white ring-1 ring-white/10"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                        !sidebarOpen && "justify-center px-3"
                      )}
                      onClick={() => onPageChange(item.id)}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-medium tracking-tight">{item.label}</span>
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

          <div className="mt-2 pt-2 border-t border-blue-700/30">
            {sidebarOpen ? (
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-xs text-blue-300 hover:text-white transition-colors"
              >
                Collapse
              </button>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-xs text-blue-300 hover:text-white transition-colors w-full text-center"
              >
                Expand
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-0 flex-1 flex flex-col min-h-0 min-w-0 bg-slate-50">
        {/* Floating Notifications Icon (top-right) */}
        <div className="fixed top-4 right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-full h-9 w-9 hover:bg-muted">
              <Bell className="h-5 w-5" />
              {totalNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 py-0 text-[11px] leading-5 rounded-full">{totalNotifications}</Badge>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {totalNotifications === 0 && (
                <DropdownMenuItem className="text-sm text-muted-foreground">No new notifications</DropdownMenuItem>
              )}
              {overdue.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-red-600">Overdue Tasks</DropdownMenuLabel>
                  {overdue.map(t => (
                    <DropdownMenuItem key={`ov-${t.id}`} onSelect={() => openTask(t.id)} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{t.title}</div>
                        {t.dueDate && <div className="text-xs text-muted-foreground">Due {new Date(t.dueDate).toLocaleDateString()}</div>}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              {financing.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-blue-600">Financing Deadlines</DropdownMenuLabel>
                  {financing.map(t => (
                    <DropdownMenuItem key={`fin-${t.id}`} onSelect={() => openTask(t.id)} className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{t.title}</div>
                        {t.dueDate && <div className="text-xs text-muted-foreground">Due {new Date(t.dueDate).toLocaleDateString()}</div>}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              {(contractDue.length > 0 || closingSoon.length > 0) && (
                <>
                  <DropdownMenuLabel className="text-xs text-emerald-700">Contract Milestones</DropdownMenuLabel>
                  {closingSoon.map((c, i) => (
                    <DropdownMenuItem key={`close-${i}`} className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-emerald-700" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{c.title}</div>
                        <div className="text-xs text-muted-foreground">{new Date(c.dueDate!).toLocaleDateString()}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {contractDue.map(t => (
                    <DropdownMenuItem key={`con-${t.id}`} onSelect={() => openTask(t.id)} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-700" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{t.title}</div>
                        {t.dueDate && <div className="text-xs text-muted-foreground">Due {new Date(t.dueDate).toLocaleDateString()}</div>}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onSelect={() => onPageChange('settings')} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Notification settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <main className="flex-1 overflow-auto p-8">
          {children}

          {/* Floating Quick Add Button */}
          <Button
            onClick={() => setQuickOpen(true)}
            className="fixed bottom-6 right-6 h-12 px-5 rounded-full shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {currentPage === 'property' ? 'Add Property' : currentPage === 'tasks' || currentPage === 'calendar' ? 'Add Task' : 'Quick Add'}
          </Button>

          {/* Quick Add Sheet */}
          <Sheet open={quickOpen} onOpenChange={setQuickOpen}>
            <SheetContent side="right" className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>{currentPage === 'property' ? 'Add Property' : 'Add Task'}</SheetTitle>
              </SheetHeader>
              {currentPage === 'property' ? (
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Label>Address</Label>
                    <Input value={propAddress} onChange={e=>setPropAddress(e.target.value)} placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>City</Label>
                      <Input value={propCity} onChange={e=>setPropCity(e.target.value)} placeholder="City" />
                    </div>
                    <div className="space-y-1">
                      <Label>State</Label>
                      <Input value={propState} onChange={e=>setPropState(e.target.value)} placeholder="NY" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>ZIP</Label>
                    <Input value={propZip} onChange={e=>setPropZip(e.target.value)} placeholder="10001" />
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Label>Title</Label>
                    <Input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Task title" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <Select value={taskCategory} onValueChange={(v:any)=>setTaskCategory(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="search">Search</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="diligence">Diligence</SelectItem>
                          <SelectItem value="pre-closing">Pre-closing</SelectItem>
                          <SelectItem value="closing">Closing</SelectItem>
                          <SelectItem value="post-closing">Post-closing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Priority</Label>
                      <Select value={taskPriority} onValueChange={(v:any)=>setTaskPriority(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Due date</Label>
                    <Input type="date" value={taskDue} onChange={e=>setTaskDue(e.target.value)} />
                  </div>
                </div>
              )}
              <SheetFooter>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={()=>setQuickOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    if (currentPage === 'property') {
                      propertyContext.updatePropertyData({ address: propAddress, city: propCity, state: propState, zipCode: propZip });
                      onPageChange('property');
                      setQuickOpen(false);
                    } else {
                      if (!taskTitle.trim()) return;
                      taskCtx.addTask({
                        title: taskTitle.trim(),
                        description: '',
                        category: taskCategory,
                        priority: taskPriority,
                        status: 'active',
                        dueDate: taskDue || undefined,
                      });
                      onPageChange('tasks');
                      setQuickOpen(false);
                      setTaskTitle(''); setTaskDue('');
                    }
                  }}>Save</Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </main>
      </div>
    </div>
  );
}
