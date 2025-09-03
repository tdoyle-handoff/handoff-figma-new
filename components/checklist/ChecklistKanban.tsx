import React from 'react';
import { ExternalLink, CheckCircle2, Circle, Clock, AlertTriangle, User } from 'lucide-react';
import type { Task } from '../TaskContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface ChecklistKanbanProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onNavigate: (page: string) => void;
}

const columns = [
  { id: 'upcoming', title: 'Upcoming', hint: 'Not started yet', statuses: ['upcoming', 'pending'] as Task['status'][] },
  { id: 'active', title: 'In Progress', hint: 'Work that is underway', statuses: ['active', 'in-progress'] as Task['status'][] },
  { id: 'overdue', title: 'Overdue', hint: 'Past due date', statuses: ['overdue'] as Task['status'][] },
  { id: 'completed', title: 'Done', hint: 'Finished items', statuses: ['completed'] as Task['status'][] },
];

function StatusIcon({ status }: { status: Task['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'active':
    case 'in-progress':
      return <Clock className="w-4 h-4 text-blue-600" />;
    case 'overdue':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
}

function DependencyChips({ task, tasksById }: { task: Task; tasksById: Record<string, Task> }) {
  if (!task.dependencies || task.dependencies.length === 0) return null;
  const deps = task.dependencies
    .map((id) => tasksById[id])
    .filter(Boolean) as Task[];
  if (deps.length === 0) return null;

  const incompleteCount = deps.filter((d) => d.status !== 'completed').length;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {deps.map((dep) => (
        <span key={dep.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-gray-600">
          <StatusIcon status={dep.status} />
          <span className="truncate max-w-[140px]" title={dep.title}>{dep.title}</span>
        </span>
      ))}
      {incompleteCount > 0 && (
        <span className="ml-auto text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          Blocked by {incompleteCount}
        </span>
      )}
    </div>
  );
}

export default function ChecklistKanban({ tasks, onUpdateTask, onNavigate }: ChecklistKanbanProps) {
  const tasksById: Record<string, Task> = React.useMemo(() => {
    const map: Record<string, Task> = {};
    tasks.forEach((t) => (map[t.id] = t));
    return map;
  }, [tasks]);

  const grouped = React.useMemo(() => {
    const g: Record<string, Task[]> = {};
    for (const c of columns) g[c.id] = [];
    for (const t of tasks) {
      const col = columns.find((c) => c.statuses.includes(t.status));
      if (col) {
        g[col.id].push(t);
      } else {
        // default to upcoming
        g['upcoming'].push(t);
      }
    }
    // sort in each column by due date asc then priority
    Object.values(g).forEach((arr) =>
      arr.sort((a, b) => {
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (ad !== bd) return ad - bd;
        const p: Record<Task['priority'], number> = { high: 3, medium: 2, low: 1 } as const;
        return p[b.priority] - p[a.priority];
      })
    );
    return g;
  }, [tasks]);

  const makeQuickAction = (t: Task, toStatus: Task['status'], label: string) => (
    <Button
      key={label}
      size="sm"
      variant={toStatus === 'completed' ? 'default' : 'outline'}
      className="h-7 px-2"
      onClick={() => onUpdateTask(t.id, { status: toStatus })}
    >
      {label}
    </Button>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => (
        <div key={col.id} className="rounded-lg border bg-white">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{col.title}</span>
              <span className="text-xs text-gray-500">{col.hint}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {grouped[col.id]?.length || 0}
            </Badge>
          </div>
          <div className="p-3 space-y-3 min-h-[220px]">
            {(grouped[col.id] || []).map((t) => {
              const hasBlockingDeps = (t.dependencies || []).some((id) => tasksById[id]?.status !== 'completed');
              return (
                <div key={t.id} className={`rounded-lg border p-3 bg-white ${hasBlockingDeps ? 'opacity-95' : ''}`}>
                  <div className="flex items-start gap-2">
                    <StatusIcon status={t.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate" title={t.title}>{t.title}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                            {t.subcategory && <Badge variant="outline" className="text-[10px]">{t.subcategory}</Badge>}
                            {t.assignedTo && (
                              <span className="inline-flex items-center gap-1"><User className="w-3 h-3" />{t.assignedTo}</span>
                            )}
                            {t.dueDate && <span className="text-primary">Due {t.dueDate}</span>}
                            {t.linkedPage && (
                              <button
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                onClick={() => onNavigate(t.linkedPage!)}
                                title="Open related page"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {t.status !== 'active' && t.status !== 'in-progress' && makeQuickAction(t, 'active', 'Start')}
                          {t.status !== 'completed' && makeQuickAction(t, 'completed', 'Complete')}
                        </div>
                      </div>
                      <DependencyChips task={t} tasksById={tasksById} />
                      {t.description && (
                        <div className="mt-2 text-xs text-gray-600 line-clamp-2">{t.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {(grouped[col.id] || []).length === 0 && (
              <div className="text-sm text-gray-500 px-2 py-6 text-center">No items</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

