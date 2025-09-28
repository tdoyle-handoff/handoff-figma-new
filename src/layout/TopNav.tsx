import React from 'react'

import React from 'react';
import { Bell, Calendar as CalendarIcon, CreditCard, FileText, User as UserIcon, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useTaskContext } from '../../components/TaskContext';
import { useAuth } from '../../hooks/useAuth';
import { HANDOFF_LOGO_URL } from '../../utils/branding';

function daysUntil(dateStr?: string) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const today = new Date();
  d.setHours(0,0,0,0); today.setHours(0,0,0,0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000*60*60*24));
}

export function TopNav() {
  const taskCtx = useTaskContext();
  const { userProfile } = useAuth();
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
  const closingSoon = showContract && taskCtx.scheduleAnchors.closingDate && daysUntil(taskCtx.scheduleAnchors.closingDate) <= 14 ? [{
    id: 'closing-anchor',
    title: 'Closing approaching',
    dueDate: taskCtx.scheduleAnchors.closingDate,
  }] : [];

  const totalCount = overdue.length + financing.length + contractDue.length + closingSoon.length;

  const openTask = (id?: string) => {
    if (!id) return;
    try { window.dispatchEvent(new CustomEvent('openTaskDetails', { detail: { taskId: id } })); } catch {}
  };

  const goSettings = () => {
    try { window.postMessage({ type: 'navigate', page: 'settings' }, '*'); } catch {}
  };

  return (
    <div className="h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={HANDOFF_LOGO_URL} alt="Handoff" className="h-8 w-auto invert brightness-0" />
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-full h-9 w-9 hover:bg-muted">
            <Bell className="h-5 w-5" />
            {totalCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 py-0 text-[11px] leading-5 rounded-full">{totalCount}</Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {totalCount === 0 && (
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
            <DropdownMenuItem onSelect={goSettings} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Notification settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Avatar className="h-8 w-8">
          <AvatarImage src={''} />
          <AvatarFallback>
            <UserIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
