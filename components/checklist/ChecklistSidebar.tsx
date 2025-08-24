import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, ChevronRight, Search, Handshake, FileText, Zap, Home, Calendar, ArrowRight, DollarSign, Scale, FileCheck, Shield } from 'lucide-react';
import type { TaskPhase } from '../TaskContext';

interface SidebarProps {
  phases: TaskPhase[];
  onSelectPhase: (phaseId: string) => void;
  onSelectTask: (taskId: string) => void;
  selectedPhaseId?: string;
  selectedTaskId?: string;
  onUpdateTask?: (taskId: string, status: 'completed' | 'active' | 'pending' | 'overdue' | 'in-progress' | 'upcoming') => void;
}

const getPhaseIcon = (phaseId: string) => {
  switch (phaseId) {
    case 'phase-search':
      return Search;
    case 'phase-offer':
      return Handshake;
    case 'phase-contract':
      return FileText;
    case 'phase-diligence':
      return Zap;
    case 'phase-pre-closing':
      return Home;
    case 'phase-closing':
      return Calendar;
    case 'phase-post-closing':
      return ArrowRight;
    default:
      return Circle;
  }
};

const getSubcategoryIcon = (subcategory: string) => {
  switch (subcategory) {
    case 'financing':
      return DollarSign;
    case 'legal':
      return Scale;
    case 'inspections':
      return FileCheck;
    case 'insurance':
      return Shield;
    default:
      return Circle;
  }
};

const getPhaseColor = (phaseId: string) => {
  switch (phaseId) {
    case 'phase-search':
      return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'phase-offer':
      return 'bg-green-100 text-green-600 border-green-200';
    case 'phase-contract':
      return 'bg-purple-100 text-purple-600 border-purple-200';
    case 'phase-diligence':
      return 'bg-orange-100 text-orange-600 border-orange-200';
    case 'phase-pre-closing':
      return 'bg-indigo-100 text-indigo-600 border-indigo-200';
    case 'phase-closing':
      return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    case 'phase-post-closing':
      return 'bg-teal-100 text-teal-600 border-teal-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export default function ChecklistSidebar({ phases, onSelectPhase, onSelectTask, selectedPhaseId, selectedTaskId, onUpdateTask }: SidebarProps) {
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
          const PhaseIcon = getPhaseIcon(phase.id);
          const phaseColorClass = getPhaseColor(phase.id);

          // Group tasks by subcategory for better organization
          const tasksBySubcategory = phase.tasks.reduce((acc, task) => {
            const sub = task.subcategory || 'general';
            if (!acc[sub]) acc[sub] = [];
            acc[sub].push(task);
            return acc;
          }, {} as Record<string, typeof phase.tasks>);

          return (
            <div key={phase.id} className={`border rounded-lg bg-white transition-all hover:shadow-sm min-h-[100px] ${isActive ? 'ring-2 ring-blue-400 border-blue-300 shadow-sm' : ''}`}>
              <button
                onClick={() => onSelectPhase(phase.id)}
                className={`w-full text-left p-5 hover:bg-gray-50 rounded-lg transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${phaseColorClass}`}>
                    {completed === phase.tasks.length && phase.tasks.length > 0 ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <PhaseIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 break-words leading-tight">{phase.title}</div>
                    <div className="text-sm text-gray-600">{completed} / {phase.tasks.length} tasks completed</div>
                    <div className="mt-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${phase.tasks.length > 0 ? (completed / phase.tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''} text-gray-400`} />
                </div>
              </button>

              {isActive && phase.tasks.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {Object.entries(tasksBySubcategory).map(([subcategory, tasks]) => {
                      const SubcategoryIcon = getSubcategoryIcon(subcategory);
                      return (
                        <div key={subcategory} className="space-y-1">
                          {subcategory !== 'general' && (
                            <div className="flex items-center gap-2 px-2 py-1">
                              <SubcategoryIcon className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                {subcategory}
                              </span>
                            </div>
                          )}
                          {tasks.map((t) => {
                            const done = t.status === 'completed';
                            const isSelected = selectedTaskId === t.id;
                            const isOverdue = t.status === 'overdue';
                            const isActive = t.status === 'active';
                            return (
                              <div
                                key={t.id}
                                className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-blue-50 ${
                                  isSelected ? 'bg-blue-50 ring-1 ring-blue-200 shadow-sm' : ''
                                }`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onUpdateTask) {
                                      const newStatus = done ? 'active' : 'completed';
                                      onUpdateTask(t.id, newStatus);
                                    }
                                  }}
                                  className="p-0.5 -m-0.5 rounded hover:bg-gray-200 transition-colors"
                                  title={done ? "Mark as incomplete" : "Mark as complete"}
                                >
                                  {done ? (
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  ) : isOverdue ? (
                                    <Circle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                  ) : isActive ? (
                                    <Circle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                  )}
                                </button>
                                <button
                                  onClick={() => onSelectTask(t.id)}
                                  className="flex-1 min-w-0 text-left"
                                >
                                  <div className={`text-sm break-words leading-tight ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                    {t.title}
                                  </div>
                                  {t.estimatedTime && (
                                    <div className="text-xs text-gray-500">{t.estimatedTime}</div>
                                  )}
                                </button>
                                <div className="flex items-center gap-1">
                                  {isOverdue && (
                                    <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                      Overdue
                                    </Badge>
                                  )}
                                  {isActive && !isSelected && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
