import React from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Task } from '../TaskContext';
import { ExternalLink, Calendar, AlertTriangle, Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

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

  // Local state to control collapsible sections (for "Read more")
  const [openKeys, setOpenKeys] = React.useState<string[]>([]);

  // Determine availability of sections for current task (for Read more)
  const partsHeader = parseDescriptionParts(task.description);
  const hasWhyHeader = !!(task.instructions?.why || partsHeader.why);
  const hasStepsHeader = !!(task.instructions?.steps && task.instructions.steps.length > 0);
  const hasHowTextHeader = !!(!hasStepsHeader && partsHeader.how);
  const hasTipsHeader = !!(task.instructions?.tips && task.instructions.tips.length > 0);
  const availableKeys = [
    hasWhyHeader ? 'why' : null,
    (hasStepsHeader || hasHowTextHeader) ? 'how' : null,
    hasTipsHeader ? 'tips' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Main Task Header - minimal: Title + Status + Due Date */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl leading-tight break-words">{task.longTitle || task.title}</CardTitle>
              {/* One-line summary for Proof of Funds task */}
              {task.id === 'task-proof-of-funds' && (
                <div className="mt-1 text-sm text-gray-700 flex items-center gap-2">
                  <span>Show official funds (for cash) or a lender pre-approval letter to prove you can afford the purchase.</span>
                  {availableKeys.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 h-auto"
                      onClick={() => setOpenKeys(Array.from(new Set([...(openKeys||[]), ...availableKeys])))}
                    >
                      Read more
                    </Button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs font-medium ${getStatusBadgeColor(task.status)}`}>{task.status.replace('-', ' ').toUpperCase()}</Badge>
                {task.dueDate && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3.5 h-3.5 mr-1 inline" />
                    Due {new Date(task.dueDate).toLocaleDateString()}
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
        </CardHeader>
      </Card>

      {/* Task Instructions - collapsible sections */}
      {(() => {
        const parts = parseDescriptionParts(task.description);
        const why = task.instructions?.why || parts.why;
        const hasSteps = !!(task.instructions?.steps && task.instructions.steps.length > 0);
        const howText = !hasSteps ? parts.how : undefined;
        const tips = task.instructions?.tips || [];
        return (
          <Card className="shadow-sm">
            <CardContent className="pt-2">
              <Accordion type="multiple" className="w-full" value={openKeys} onValueChange={(v)=>setOpenKeys(v as string[])}>
                {why && (
                  <AccordionItem value="why">
                    <AccordionTrigger>Why it matters</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-gray-700 text-sm leading-relaxed">{renderBulletedText(why)}</div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {(hasSteps || howText) && (
                  <AccordionItem value="how">
                    <AccordionTrigger>How to complete</AccordionTrigger>
                    <AccordionContent>
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
                    </AccordionContent>
                  </AccordionItem>
                )}
                {tips.length > 0 && (
                  <AccordionItem value="tips">
                    <AccordionTrigger>Pro tips</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {tips.map((tip, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
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
