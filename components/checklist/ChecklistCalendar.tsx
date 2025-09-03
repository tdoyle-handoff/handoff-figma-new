import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Circle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Task } from '../TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

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

export default function ChecklistCalendar({ tasks, onUpdateTask }: ChecklistCalendarProps) {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editDate, setEditDate] = useState<string>('');

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
    const taskId = e.dataTransfer.getData('text/task-id');
    if (!taskId) return;
    onUpdateTask(taskId, { dueDate: formatISODate(date) });
  };

  const monthLabel = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {monthLabel}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded hover:bg-gray-100" aria-label="Previous month">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50">
              Today
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded hover:bg-gray-100" aria-label="Next month">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                        setEditOpen(true);
                      }}
                      className="group cursor-move text-xs border rounded px-1.5 py-1 flex items-center gap-1 hover:bg-gray-50"
                      title={`${t.title}${t.description ? ' — ' + t.description : ''}`}
                    >
                      {statusIcon(t.status)}
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-600" /> Completed</div>
          <div className="flex items-center gap-1"><Circle className="w-3.5 h-3.5 text-blue-600" /> Active/In-progress</div>
          <div className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Overdue</div>
          <div className="flex items-center gap-1"><Circle className="w-3.5 h-3.5 text-gray-400" /> Other</div>
        </div>
      </CardContent>
    </Card>

    {/* Edit dialog */}
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="max-w-md bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Task Date</DialogTitle>
        </DialogHeader>
        {editTask && (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Task</div>
              <div className="text-sm font-medium text-gray-900">{editTask.title}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Due date</div>
              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (editTask) {
                    onUpdateTask(editTask.id, { dueDate: editDate });
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
  );
}

