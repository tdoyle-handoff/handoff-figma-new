import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Circle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Task } from '../TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface ChecklistCalendarProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  d.setDate(d.getDate() - day); // start on Sunday
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatISODate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const statusIcon = (status: Task['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
    case 'overdue':
      return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
    case 'active':
    case 'in-progress':
      return <Circle className="w-3.5 h-3.5 text-blue-600" />;
    default:
      return <Circle className="w-3.5 h-3.5 text-gray-400" />;
  }
};


// Tag/subcategory color mapping for visual categorization
function getTaskCategoryKey(t: Task): 'financing' | 'legal' | 'inspections' | 'insurance' | 'scenario' | 'general' {
  const tags = (t.tags || []).map(x => (x || '').toLowerCase());
  // Treat VA/FHA as financing with explicit labels; other scenarios remain scenario
  if (tags.includes('scenario-va') || tags.includes('scenario-fha')) return 'financing';
  if (tags.some(x => x.startsWith('scenario-'))) return 'scenario';
  const sub = (t.subcategory || '').toLowerCase();
  if (sub === 'financing') return 'financing';
  if (sub === 'legal') return 'legal';
  if (sub === 'inspections') return 'inspections';
  if (sub === 'insurance') return 'insurance';
  return 'general';
}

const catStyles: Record<ReturnType<typeof getTaskCategoryKey>, { dot: string; badgeBg: string; badgeBorder: string; badgeText: string; label: string }> = {
  financing: { dot: 'bg-blue-500', badgeBg: 'bg-blue-50', badgeBorder: 'border-blue-200', badgeText: 'text-blue-700', label: 'Financing' },
  legal: { dot: 'bg-purple-500', badgeBg: 'bg-purple-50', badgeBorder: 'border-purple-200', badgeText: 'text-purple-700', label: 'Legal' },
  inspections: { dot: 'bg-amber-500', badgeBg: 'bg-amber-50', badgeBorder: 'border-amber-200', badgeText: 'text-amber-700', label: 'Inspections' },
  insurance: { dot: 'bg-cyan-500', badgeBg: 'bg-cyan-50', badgeBorder: 'border-cyan-200', badgeText: 'text-cyan-700', label: 'Insurance' },
  scenario: { dot: 'bg-rose-500', badgeBg: 'bg-rose-50', badgeBorder: 'border-rose-200', badgeText: 'text-rose-700', label: 'Scenario' },
  general: { dot: 'bg-gray-400', badgeBg: 'bg-gray-50', badgeBorder: 'border-gray-200', badgeText: 'text-gray-700', label: 'General' },
};

export default function ChecklistCalendar({ tasks, onUpdateTask }: ChecklistCalendarProps) {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editAssignedTo, setEditAssignedTo] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const monthStart = useMemo(() => startOfMonth(cursor), [cursor]);
  const monthEnd = useMemo(() => endOfMonth(cursor), [cursor]);
  const gridStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const totalDays = useMemo(() => {
    // 6 weeks grid (7 cols * 6 rows) to cover all months
    return 42;
  }, []);

  const today = new Date();

  const days = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i));
  }, [gridStart, totalDays]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = t.dueDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  // Also surface scheduled inspections (from tasks.customFields.inspections.scheduled)
  type CalendarInspectionEvent = {
    id: string;
    taskId: string;
    type?: string;
    title: string;
    time?: string;
    provider?: string;
  };
  const inspectionEventsByDate = useMemo(() => {
    const map = new Map<string, CalendarInspectionEvent[]>();
    for (const t of tasks) {
      const sub = (t.subcategory || '').toLowerCase();
      const cf: any = (t as any).customFields || {};
      const scheduled: any[] = cf?.inspections?.scheduled || [];
      if (sub === 'inspections' && Array.isArray(scheduled)) {
        for (const it of scheduled) {
          const d = it?.date;
          if (!d) continue;
          const key = String(d);
          if (!map.has(key)) map.set(key, []);
          const ev: CalendarInspectionEvent = {
            id: `${t.id}::${it.id || it.type || it.date}`,
            taskId: t.id,
            type: it.type,
            title: it.title || it.type || 'Inspection',
            time: it.time,
            provider: it.provider || it.company,
          };
          map.get(key)!.push(ev);
        }
      }
    }
    return map;
  }, [tasks]);

  const unscheduled = useMemo(() => tasks.filter(t => !t.dueDate), [tasks]);

  const handlePrevMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const handleNextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const handleToday = () => setCursor(new Date());

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/task-id', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, date: Date) => {
    e.preventDefault();

    // First, handle scheduled inspection event drag
    const insp = e.dataTransfer.getData('text/inspection-event');
    if (insp) {
      try {
        const [taskId, eventKey] = insp.split('::');
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const cf: any = { ...(task.customFields || {}) };
          const ins: any = { ...(cf.inspections || {}) };
          const scheduled: any[] = Array.isArray(ins.scheduled) ? [...ins.scheduled] : [];
          const matchKey = (x: any) => String(x?.id || x?.type || x?.date || '');
          const idx = scheduled.findIndex((x) => matchKey(x) === eventKey);
          if (idx >= 0) {
            scheduled[idx] = { ...scheduled[idx], date: formatISODate(date) };
            onUpdateTask(taskId, {
              customFields: {
                ...cf,
                inspections: { ...ins, scheduled },
              } as any,
            });
            return;
          }
        }
      } catch {}
    }

    // Fallback: dragging a task card to set its due date
    const taskId = e.dataTransfer.getData('text/task-id');
    if (taskId) {
      onUpdateTask(taskId, { dueDate: formatISODate(date) });
    }
  };

  const onDropUnscheduled = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/task-id');
    if (!taskId) return;
    onUpdateTask(taskId, { dueDate: undefined });
  };

  const monthLabel = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
    <Card className="shadow-sm">
          <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {monthLabel}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded hover:bg-gray-100" aria-label="Previous month">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50">
              Today
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded hover:bg-gray-100" aria-label="Next month">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend (moved to top) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-600" /> Completed</div>
            <div className="flex items-center gap-1"><Circle className="w-3.5 h-3.5 text-blue-600" /> Active/In-progress</div>
            <div className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Overdue</div>
            <div className="flex items-center gap-1"><Circle className="w-3.5 h-3.5 text-gray-400" /> Other</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${catStyles.financing.dot}`} /> Financing</div>
            <div className="flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${catStyles.legal.dot}`} /> Legal</div>
            <div className="flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${catStyles.inspections.dot}`} /> Inspections</div>
            <div className="flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${catStyles.insurance.dot}`} /> Insurance</div>
            <div className="flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${catStyles.scenario.dot}`} /> Scenario</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Unscheduled panel */}
          <div className="lg:col-span-3">
            <div
              className="border rounded-md p-3 bg-white min-h-[120px]"
              onDragOver={onDragOver}
              onDrop={onDropUnscheduled}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Unscheduled</div>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{unscheduled.length}</Badge>
              </div>
              {unscheduled.length === 0 ? (
                <div className="text-xs text-gray-500">No tasks without a date. Drag here to clear a task’s date.</div>
              ) : (
                <div className="space-y-1 max-h-[280px] overflow-auto">
                  {unscheduled.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id)}
                      className="cursor-move text-xs border rounded px-2 py-1 flex items-center gap-2 hover:bg-gray-50"
title={`${t.title}${t.description ? ' — ' + t.description : ''}`}
                    >
                      {statusIcon(t.status)}
                      <span className={`inline-block w-2 h-2 rounded-full ${catStyles[getTaskCategoryKey(t)].dot}`} aria-hidden="true" />
                      <span className="sr-only">Category: {(t.tags || []).map(x => x.toLowerCase()).includes('scenario-va') ? 'VA Loan' : (t.tags || []).map(x => x.toLowerCase()).includes('scenario-fha') ? 'FHA Loan' : catStyles[getTaskCategoryKey(t)].label}</span>
                      <span className="truncate">{t.shortTitle || t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar area */}
          <div className="lg:col-span-9">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-xs text-gray-500 mb-2">
              {weekdayLabels.map((lbl) => (
                <div key={lbl} className="px-2 py-1 text-center">{lbl}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden">
              {days.map((day) => {
            const inMonth = day.getMonth() === monthStart.getMonth();
            const isToday = isSameDay(day, today);
            const key = formatISODate(day);
            const dayTasks = tasksByDate.get(key) || [];

            return (
              <div
                key={key}
                className={
                  `min-h-[110px] bg-white p-2 flex flex-col gap-1 ${inMonth ? '' : 'bg-gray-50 text-gray-400'} ` +
                  `${isToday ? 'outline outline-2 outline-blue-500' : ''}`
                }
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className={`text-xs font-medium ${inMonth ? 'text-gray-700' : 'text-gray-400'}`}>{day.getDate()}</div>
                  {/* Count badge */}
                  {dayTasks.length > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{dayTasks.length}</Badge>
                  )}
                </div>
                <div className="flex-1 space-y-1 overflow-auto">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id)}
                      onClick={() => {
                        setEditTask(t);
                        setEditDate(t.dueDate || formatISODate(day));
                        setEditTitle(t.title);
                        setEditAssignedTo(t.assignedTo || '');
                        setEditNotes(t.notes || '');
                        setEditOpen(true);
                      }}
                      className="group cursor-move text-xs border rounded px-2 py-1 flex items-center gap-2 hover:bg-gray-50"
title={`${t.title}${t.description ? ' — ' + t.description : ''}`}
                    >
                      {statusIcon(t.status)}
                      <span className={`inline-block w-2 h-2 rounded-full ${catStyles[getTaskCategoryKey(t)].dot}`} aria-hidden="true" />
                      <span className="sr-only">Category: {(t.tags || []).map(x => x.toLowerCase()).includes('scenario-va') ? 'VA Loan' : (t.tags || []).map(x => x.toLowerCase()).includes('scenario-fha') ? 'FHA Loan' : catStyles[getTaskCategoryKey(t)].label}</span>
                      <span className="truncate">{t.shortTitle || t.title}</span>
                    </div>
                  ))}

                  {/* Scheduled inspections */}
                  {(() => {
                    const key = formatISODate(day);
                    const events = inspectionEventsByDate.get(key) || [];
                    if (events.length === 0) return null;
                    return (
                      <div className="pt-1 border-t mt-1">
                        {events.map((ev) => (
                          <div
                            key={ev.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/inspection-event', ev.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            className="cursor-move text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-1 flex items-center justify-between gap-2 hover:bg-amber-100"
                            title={`${ev.title}${ev.provider ? ' — ' + ev.provider : ''}${ev.time ? ' at ' + ev.time : ''}`}
                          >
                            <span className="truncate">
                              {ev.title}{ev.time ? ` @ ${ev.time}` : ''}
                              {ev.provider ? ` • ${ev.provider}` : ''}
                            </span>
                            <Badge variant="outline" className="text-[10px]">Inspection</Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
        </div>
        </div>

      </CardContent>
    </Card>

    {/* Edit dialog */}
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="max-w-md bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        {editTask && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600 mb-1">Title</Label>
              <Input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1">Assigned to</Label>
              <Input type="text" value={editAssignedTo} onChange={(e) => setEditAssignedTo(e.target.value)} placeholder="e.g., Buyer, Agent, Lender" />
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1">Due date</Label>
              <div className="flex items-center gap-2">
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                <Button variant="outline" onClick={() => setEditDate('')}>Clear</Button>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1">Notes</Label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (editTask) {
                    onUpdateTask(editTask.id, { 
                      dueDate: editDate || undefined,
                      title: editTitle,
                      assignedTo: editAssignedTo,
                      notes: editNotes,
                    });
                  }
                  setEditOpen(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

