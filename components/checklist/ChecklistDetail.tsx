import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import type { Task } from '../TaskContext';
import { ExternalLink, Clock, User, Calendar, AlertTriangle, Lightbulb, Target } from 'lucide-react';

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
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 leading-tight">{task.title}</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t">
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

        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{task.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Task Instructions */}
      {task.instructions && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-500" />
              Detailed Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.instructions.overview && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Overview</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{task.instructions.overview}</p>
              </div>
            )}

            {task.instructions.steps && task.instructions.steps.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Step-by-Step Process</h4>
                <ol className="space-y-3">
                  {task.instructions.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 text-xs font-medium rounded-full flex items-center justify-center">
                        {step.step || i + 1}
                      </span>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">{step.title}</h5>
                        <p className="text-gray-600 text-sm mt-1">{step.action}</p>
                        {step.duration && (
                          <p className="text-xs text-gray-500 mt-1">⏱️ {step.duration}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {task.instructions.tips && task.instructions.tips.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Important Tips & Callouts
                </h4>
                <ul className="space-y-2">
                  {task.instructions.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-amber-500 font-medium">•</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {task.instructions.timeline && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1 text-sm">⏰ Timeline</h4>
                <p className="text-blue-800 text-sm">{task.instructions.timeline}</p>
              </div>
            )}

            {task.instructions.nextSteps && task.instructions.nextSteps.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {task.instructions.nextSteps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-500">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
