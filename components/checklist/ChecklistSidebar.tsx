import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import type { TaskPhase } from '../TaskContext';

interface SidebarProps {
  phases: TaskPhase[];
  onSelectPhase: (phaseId: string) => void;
  onSelectTask: (taskId: string) => void;
  selectedPhaseId?: string;
  selectedTaskId?: string;
}

export default function ChecklistSidebar({ phases, onSelectPhase, onSelectTask, selectedPhaseId, selectedTaskId }: SidebarProps) {
  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = phases.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'completed').length, 0);
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-3">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Checklist Overall Completion</CardTitle>
              <CardDescription>{completedTasks} / {totalTasks} Completed</CardDescription>
            </div>
            <div className="text-lg font-semibold">{Math.round(progress)}%</div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {phases.map((phase) => {
          const completed = phase.tasks.filter(t => t.status === 'completed').length;
          const isActive = selectedPhaseId ? selectedPhaseId === phase.id : phase.status === 'active';
          return (
            <div key={phase.id} className={`border rounded-lg bg-white transition-colors ${isActive ? 'ring-2 ring-primary border-l-4 border-l-primary' : ''}`}>
              <button
                onClick={() => onSelectPhase(phase.id)}
                className={`w-full text-left p-3 hover:bg-gray-50 rounded-lg`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                    {completed === phase.tasks.length && phase.tasks.length > 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{phase.title}</div>
                    <div className="text-xs text-gray-500">{completed} / {phase.tasks.length} Completed</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>

              {isActive && phase.tasks.length > 0 && (
                <div className="px-2 pb-2">
                  <div className="space-y-1">
                    {phase.tasks.map((t) => {
                      const done = t.status === 'completed';
                      const isSelected = selectedTaskId === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => onSelectTask(t.id)}
                          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 ${isSelected ? 'bg-gray-50 ring-1 ring-primary/40' : ''}`}
                        >
                          {done ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-300" />
                          )}
                          <span className={`text-xs truncate ${isSelected ? 'font-medium text-gray-900' : ''}`}>{t.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

