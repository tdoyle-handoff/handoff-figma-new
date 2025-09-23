import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import type { Task } from '../TaskContext';
import { ExternalLink, Clock, User, Calendar, AlertTriangle, Lightbulb, Target, ChevronRight } from 'lucide-react';

interface DetailProps {
  task: Task | null;
  onAction?: () => void;
  onUpdateTask?: (taskId: string, status: 'completed' | 'active' | 'pending' | 'overdue' | 'in-progress' | 'upcoming') => void;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'active':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'upcoming':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

type DescriptionParts = { what?: string; why?: string; how?: string };

function parseDescriptionParts(desc?: string): DescriptionParts {
  if (!desc) return {};
  const getIdx = (label: string) => desc.indexOf(label);
  const markers = ["What it is:", "Why it matters:", "How to complete it:"];
  const idxWhat = getIdx(markers[0]);
  const idxWhy = getIdx(markers[1]);
  const idxHow = getIdx(markers[2]);
  const end = desc.length;
  const slice = (start: number, end: number) => desc.slice(start, end).trim();
  const parts: DescriptionParts = {};
  if (idxWhat >= 0) {
    const next = [idxWhy, idxHow].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? end;
    parts.what = slice(idxWhat + markers[0].length, next);
  }
  if (idxWhy >= 0) {
    const next = [idxHow].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? end;
    parts.why = slice(idxWhy + markers[1].length, next);
  }
  if (idxHow >= 0) {
    parts.how = slice(idxHow + markers[2].length, end);
  }
  return parts;
}

function renderBulletedText(text?: string) {
  if (!text) return null;
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items = lines.filter((l) => l.startsWith('-'));
  if (items.length > 0) {
    return (
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">{it.replace(/^[-•]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{text}</p>;
}

export default function ChecklistDetail({ task, onAction, onUpdateTask }: DetailProps) {
  if (!task) {
    return (
      <Card className="shadow-sm h-full">
        <CardContent className="p-8 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a Task</h3>
          <p className="text-sm">Choose a task from the sidebar to view detailed instructions and requirements.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Main Task Header */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
<CardTitle className="text-xl mb-3 leading-tight break-words">{task.longTitle || task.title}</CardTitle>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge className={`text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                  {task.priority.toUpperCase()} PRIORITY
                </Badge>
                {task.subcategory && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {task.subcategory}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onUpdateTask && (
                <Button
                  onClick={() => {
                    const newStatus = task.status === 'completed' ? 'active' : 'completed';
                    onUpdateTask(task.id, newStatus);
                  }}
                  variant={task.status === 'completed' ? 'outline' : 'default'}
                  size="sm"
                  className={task.status === 'completed' ? 'text-orange-600 border-orange-300 hover:bg-orange-50' : 'bg-green-600 hover:bg-green-700'}
                >
                  {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
              )}
              {task.linkedPage && (
                <Button onClick={onAction} variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {task.actionLabel || 'Take Action'}
                </Button>
              )}
            </div>
          </div>

          {/* Task Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedTime || 'Time varies'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{task.assignedTo || 'You'}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardHeader>

<CardContent className="pt-4">
          {/* Intentionally leaving description out here; detailed sections below */}
        </CardContent>
      </Card>

      {/* Task Instructions */}
{(() => {
        // Build three sections using instructions first, then fallbacks from description
        const parts = parseDescriptionParts(task.description);
        const what = task.instructions?.what || parts.what || task.instructions?.overview;
        const why = task.instructions?.why || parts.why;
        const hasSteps = !!(task.instructions?.steps && task.instructions.steps.length > 0);
        const howText = !hasSteps ? parts.how : undefined;
        return (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                Task Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {what && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Overview</h4>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {renderBulletedText(what)}
                  </div>
                </div>
              )}

              {why && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Why It Matters</h4>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {renderBulletedText(why)}
                  </div>
                </div>
              )}

              {/* How to Complete */}
              {(hasSteps || howText) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">How to Complete</h4>
                  {hasSteps ? (
                    <ul className="space-y-2">
                      {task.instructions!.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-gray-400">•</span>
                          <div className="text-gray-700">
                            <span className="font-medium">{step.title}</span>
                            {(step.action || step.description) && (
                              <p className="text-gray-600 mt-1">{step.action || step.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div>{renderBulletedText(howText)}</div>
                  )}
                </div>
              )}

              {task.instructions?.tips && task.instructions.tips.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Important Tips & Callouts
                  </h4>
                  <ul className="space-y-2">
                    {task.instructions.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {task.instructions?.timeline && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1 text-sm inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Timeline</span>
                  </h4>
                  <p className="text-blue-800 text-sm">{task.instructions.timeline}</p>
                </div>
              )}

              {task.instructions?.nextSteps && task.instructions.nextSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {task.instructions.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Action Button */}
      {task.linkedPage && (
        <Card className="shadow-sm bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Button onClick={onAction} size="lg" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              {task.actionLabel || 'Take Action'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
