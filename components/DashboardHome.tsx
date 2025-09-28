import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '../hooks/useAuth';
import { useTaskContext, Task } from './TaskContext';
import { addDays, format, isSameDay, isSameWeek, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { FileText, ExternalLink, CalendarDays, DollarSign, Clock, CheckSquare, TrendingUp, BookOpen, Settings as SettingsIcon, Building, Upload, Plus, StickyNote } from 'lucide-react';

function parseDate(d?: string): Date | null {
  if (!d) return null;
  try {
    // Accept YYYY-MM-DD or ISO strings
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d + 'T00:00:00');
    return parseISO(d);
  } catch {
    return null;
  }
}

export default function DashboardHome() {
  const taskCtx = useTaskContext();
  const tasks: Task[] = taskCtx?.tasks || [] as Task[];
  const today = new Date();

  const withDue = tasks.filter(t => !!t.dueDate);
  const dueToday = withDue.filter(t => {
    const dt = parseDate(t.dueDate);
    return dt ? isSameDay(dt, today) : false;
  });

  const upcoming = withDue
    .filter(t => {
      const dt = parseDate(t.dueDate);
      if (!dt) return false;
      // upcoming = later in this week (after today)
      return isSameWeek(dt, today, { weekStartsOn: 1 }) && dt > today;
    })
    .sort((a,b) => (parseDate(a.dueDate)!.getTime() - parseDate(b.dueDate)!.getTime()))
    .slice(0, 5);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Contract & quick insight data
  const contractTask = tasks.find(t => t.id === 'task-submit-offer');
  const contractUrl: string | undefined = (contractTask as any)?.customFields?.contractPdfUrl || (contractTask as any)?.customFields?.attachments?.find?.((a: any) => a?.url)?.url;
  const cd: any = (contractTask as any)?.customFields?.contractDetails || {};
  const acceptance = parseDate(cd?.acceptanceDate || (taskCtx?.scheduleAnchors?.offerAcceptedDate as any));
  const closing = parseDate(cd?.closingDate || (taskCtx?.scheduleAnchors?.closingDate as any));
  const inspectionDeadline = acceptance && cd?.inspectionDays ? addDays(acceptance, parseInt(cd.inspectionDays, 10) || 0) : null;
  const financingDeadline = acceptance && cd?.financingDays ? addDays(acceptance, parseInt(cd.financingDays, 10) || 0) : null;

  // Property search quick widget
  const [qLocation, setQLocation] = React.useState('');
  const [qPriceMax, setQPriceMax] = React.useState('');

  // Inline editor for contract dates
  const [editing, setEditing] = React.useState(false);
  const toISO = (d: Date | null) => (d ? d.toISOString().slice(0,10) : '');
  const [editAcceptance, setEditAcceptance] = React.useState<string>(toISO(acceptance));
  const [editClosing, setEditClosing] = React.useState<string>(toISO(closing));
  const [editInspectionDays, setEditInspectionDays] = React.useState<string>(String(cd?.inspectionDays || ''));
  const [editFinancingDays, setEditFinancingDays] = React.useState<string>(String(cd?.financingDays || ''));
  const saveDates = () => {
    try {
      taskCtx.setScheduleAnchors({
        offerAcceptedDate: editAcceptance || undefined,
        closingDate: editClosing || undefined,
      });
      if (contractTask) {
        const updated = {
          ...(contractTask as any).customFields,
          contractDetails: {
            ...(cd || {}),
            acceptanceDate: editAcceptance || undefined,
            closingDate: editClosing || undefined,
            inspectionDays: editInspectionDays || undefined,
            financingDays: editFinancingDays || undefined,
          },
        } as any;
        taskCtx.updateTask((contractTask as any).id, { customFields: updated } as any);
      }
      setEditing(false);
    } catch {}
  };

  return (
    <div className="grid grid-cols-12 gap-6 items-stretch">
      {/* Current Tasks - prominent top-left */}
      <Card className="modern-card h-full col-span-12 lg:col-span-8 order-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Current Tasks</CardTitle>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" strokeWidth="8" fill="transparent" className="text-slate-200" stroke="currentColor" />
                <circle cx="50" cy="50" r="40" strokeWidth="8" fill="transparent" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - (dueToday.length>0 ? (dueToday.filter(t=>t.status==='completed').length/dueToday.length) : 0))}`} className="text-blue-600" stroke="currentColor" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{dueToday.length>0 ? Math.round((dueToday.filter(t=>t.status==='completed').length/dueToday.length)*100) : 0}%</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Accordion type="multiple" defaultValue={['today','week']} className="w-full">
              <AccordionItem value="today">
                <AccordionTrigger className="text-sm font-semibold">Today ({dueToday.length})</AccordionTrigger>
                <AccordionContent>
                  {dueToday.length === 0 ? (
                    <div className="text-sm text-muted-foreground bg-[#F9FAFB] border border-gray-200 rounded-md p-4 flex items-center justify-between">
                      <span>No tasks today 🎉. Add your next step.</span>
                      <Button size="sm" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'tasks' } }))}>Add Task</Button>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {dueToday.map(t => (
                        <li key={t.id} className="flex items-center gap-3">
                          <input type="checkbox" checked={t.status === 'completed'} onChange={(e) => taskCtx.updateTaskStatus && taskCtx.updateTaskStatus(t.id, e.target.checked ? 'completed' : 'active')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" aria-label="Mark complete" />
                          <button className="text-sm text-left text-gray-900 hover:underline truncate" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: t.linkedPage || 'tasks' } }))}>{t.title}</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="week">
                <AccordionTrigger className="text-sm font-semibold">This Week ({upcoming.length})</AccordionTrigger>
                <AccordionContent>
                  {upcoming.length === 0 ? (
                    <div className="text-sm text-muted-foreground bg-[#F9FAFB] border border-gray-200 rounded-md p-4">No upcoming tasks this week.</div>
                  ) : (
                    <ul className="space-y-2">
                      {upcoming.map(t => (
                        <li key={t.id} className="flex items-center gap-3">
                          <input type="checkbox" checked={t.status === 'completed'} onChange={(e) => taskCtx.updateTaskStatus && taskCtx.updateTaskStatus(t.id, e.target.checked ? 'completed' : 'active')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" aria-label="Mark complete" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 truncate">{t.title}</div>
                            <div className="text-xs text-muted-foreground">Due {format(parseDate(t.dueDate)!, 'EEE, MMM d')}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="upcoming">
                <AccordionTrigger className="text-sm font-semibold">Upcoming</AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground">View more in the checklist for later dates.</div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* Calendar - compact when empty */}
      <Card className={`modern-card col-span-12 lg:col-span-4 order-2 ${dueToday.length === 0 ? '' : 'h-full'}`}>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Calendar</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <button className={`h-8 px-3 rounded-full border bg-[#007EA7] text-white border-[#007EA7]`}>Month</button>
            <button className={`h-8 px-3 rounded-full border text-[#007EA7] border-[#007EA7] hover:bg-[#007EA7]/10`}>Week</button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week strip */}
          <div className="flex items-center justify-between text-sm mb-4">
            {weekDays.map((d, i) => {
              const dayStr = format(d, 'yyyy-MM-dd');
              const dueForDay = withDue.filter(t => format(parseDate(t.dueDate)!, 'yyyy-MM-dd') === dayStr);
              const has = (cat: string) => dueForDay.some(t => ((t.subcategory||'').toLowerCase()===cat) || (t.tags||[]).map(String).map(s=>s.toLowerCase()).includes(cat));
              const dots = [
                { c:'financing', cls:'bg-green-500' },
                { c:'legal', cls:'bg-purple-500' },
                { c:'inspections', cls:'bg-orange-500' },
              ].filter(x => has(x.c));
              return (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSameDay(d, today) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{format(d, 'd')}</div>
                        <div className="mt-1 h-1.5 flex items-center gap-0.5">
                          {dots.map((x, idx2) => <span key={idx2} className={`w-1.5 h-1.5 rounded-full ${x.cls}`}></span>)}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {dueForDay.length === 0 ? 'No tasks' : (
                        <div className="text-xs">
                          {dueForDay.slice(0,4).map(t => (<div key={t.id} className="truncate max-w-[200px]">• {t.title}</div>))}
                          {dueForDay.length > 4 && (<div className="text-muted-foreground">+{dueForDay.length-4} more</div>)}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Day list for today */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground">{format(today, 'd LLLL')}</div>
            {dueToday.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-[#F9FAFB] border border-gray-200 rounded-md p-4">No events for today.</div>
            ) : (
              <div className="space-y-3">
                {dueToday.map((t, idx) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-12 text-right text-sm text-muted-foreground">All day</div>
                    <div className={`flex-1 rounded-lg ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'} px-3 py-2`}>
                      <div className="text-sm font-medium truncate">{t.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Next 3 deadlines (compact list) */}
          <div className="mt-4">
            {(() => {
              const upcomingAll = withDue
                .filter(t => { const dt = parseDate(t.dueDate); return dt ? dt > today : false; })
                .sort((a,b) => (parseDate(a.dueDate)!.getTime() - parseDate(b.dueDate)!.getTime()))
                .slice(0, 3);
              if (upcomingAll.length === 0) return null;
              return (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Next 3 deadlines</div>
                  <ul className="space-y-2">
                    {upcomingAll.map(t => (
                      <li key={t.id} className="flex items-center justify-between text-sm">
                        <span className="truncate pr-3">{t.title}</span>
                        <span className="text-muted-foreground">{format(parseDate(t.dueDate)!, 'EEE, MMM d')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Contract Timeline */}
      <Card className="modern-card col-span-12 order-3 h-full">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Contract Timeline</CardTitle>
          <div className="flex items-center gap-2">
            {contractUrl ? (
              <Button size="sm" className="h-8 px-3" onClick={() => window.open(contractUrl, '_blank')}>
                <FileText className="w-4 h-4 mr-1" /> View contract <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button size="sm" className="h-8 px-3 bg-primary text-primary-foreground" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'tasks' } }))}>
                <Upload className="w-4 h-4 mr-1" /> Upload Document
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!editing ? (
            <div className="relative pl-6">
              {(() => {
                const items = [
                  { id: 'offer', label: 'Offer', date: acceptance },
                  { id: 'financing', label: 'Financing', date: financingDeadline },
                  { id: 'inspection', label: 'Inspection', date: inspectionDeadline },
                  { id: 'closing', label: 'Closing', date: closing },
                ].map(it => ({
                  ...it,
                  status: !it.date ? 'Not Set' : (it.date < today ? 'Completed' : 'Due')
                }));
                const currentIdx = Math.max(0, items.findIndex(it => it.status !== 'Completed'));
                return (
                  <>
                    <div className="absolute left-2 top-6 bottom-6 w-1 bg-gray-200 rounded"></div>
                    <div className="absolute left-2 top-6 w-1 bg-blue-500 rounded" style={{ height: `${(Math.max(currentIdx,0) / (items.length-1)) * 100}%` }}></div>
                    <div className="space-y-4">
                      {items.map((it, idx) => (
                        <div key={it.id} className="relative flex items-start gap-3">
                          <div className={`mt-1 w-3 h-3 rounded-full ${it.status==='Completed' ? 'bg-green-600' : it.status==='Due' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                          <div>
                            <div className="text-sm font-medium">{it.label}</div>
                            <div className="text-xs text-muted-foreground">{it.date ? format(it.date, 'EEE, MMM d') : 'Not Set'}</div>
                            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border ${it.status==='Completed' ? 'bg-green-50 text-green-700 border-green-200' : it.status==='Due' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{it.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm">Offer accepted
                  <input type="date" className="mt-1 w-full h-9 px-3 rounded-md border border-gray-300 text-sm" value={editAcceptance} onChange={(e)=>setEditAcceptance(e.target.value)} />
                </label>
                <label className="text-sm">Closing date
                  <input type="date" className="mt-1 w-full h-9 px-3 rounded-md border border-gray-300 text-sm" value={editClosing} onChange={(e)=>setEditClosing(e.target.value)} />
                </label>
                <label className="text-sm">Inspection days
                  <input type="number" className="mt-1 w-full h-9 px-3 rounded-md border border-gray-300 text-sm" value={editInspectionDays} onChange={(e)=>setEditInspectionDays(e.target.value)} />
                </label>
                <label className="text-sm">Financing days
                  <input type="number" className="mt-1 w-full h-9 px-3 rounded-md border border-gray-300 text-sm" value={editFinancingDays} onChange={(e)=>setEditFinancingDays(e.target.value)} />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={saveDates}>Save</Button>
                <Button size="sm" variant="ghost" onClick={()=>{setEditing(false); setEditAcceptance(toISO(acceptance)); setEditClosing(toISO(closing)); setEditInspectionDays(String(cd?.inspectionDays||'')); setEditFinancingDays(String(cd?.financingDays||''));}}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
        <div className="px-6 pb-4">
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={()=>setEditing((e)=>!e)}>{editing ? 'Hide editor' : 'Edit dates'}</Button>
        </div>
      </Card>

      {/* Quick Links - personalized shortcuts */}
      <Card className="modern-card col-span-12 order-4 h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const lastTask = tasks.find(t => ['active','in-progress','overdue'].includes((t.status as any))) || tasks[0];
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="flex items-center justify-between h-11 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                  window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'tasks' } }));
                  setTimeout(() => {
                    if (lastTask) {
                      try {
                        const el = document.getElementById(`task-row-${lastTask.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } catch {}
                    }
                  }, 300);
                }}>
                  <span className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Resume last task</span>
                  <span className="text-xs text-blue-700">Go</span>
                </button>
                <button className="flex items-center justify-between h-11 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'overview' } }))}>
                  <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Recalculate Budget</span>
                  <span className="text-xs text-white/90">Open</span>
                </button>
                <button className="flex items-center justify-between h-11 px-4 rounded-full bg-violet-600 hover:bg-violet-700 text-white" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'property' } }))}>
                  <span className="flex items-center gap-2"><Building className="w-4 h-4" /> Saved Properties</span>
                  <span className="text-xs text-white/90">Open</span>
                </button>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
