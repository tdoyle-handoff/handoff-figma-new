import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Task } from '../TaskContext';
import { ExternalLink } from 'lucide-react';

interface DetailProps {
  task: Task | null;
  onAction?: () => void;
}

export default function ChecklistDetail({ task, onAction }: DetailProps) {
  if (!task) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center text-sm text-gray-600">
          Select a task from the left to view details
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{task.title}</CardTitle>
              <Badge variant="outline" className="text-xs capitalize">{task.status}</Badge>
            </div>
            {task.linkedPage && (
              <Button size="sm" onClick={onAction}>
                <ExternalLink className="w-4 h-4 mr-2" />
                {task.actionLabel || 'Action'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <CardDescription>{task.description}</CardDescription>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Task Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>{task.instructions?.overview || 'Follow the steps and complete the task.'}</p>
          {task.instructions?.steps && (
            <ol className="list-decimal pl-5 space-y-1">
              {task.instructions.steps.map((s, i) => (
                <li key={i}>{s.title} — {s.action}</li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {task.linkedPage && (
        <Button size="lg" onClick={onAction} className="w-full">
          Go to {task.actionLabel || 'Task'}
        </Button>
      )}
    </div>
  );
}

