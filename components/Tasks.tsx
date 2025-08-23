import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle, Calendar, User, ArrowRight, Filter, ChevronDown, ChevronRight, ExternalLink, Scale, Calculator, FileCheck, Shield, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useIsMobile } from './ui/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ChecklistLegalTabs from './checklist/LegalTabs';
import ChecklistInspectionTabs from './checklist/InspectionTabs';
import ChecklistInsuranceTabs from './checklist/InsuranceTabs';
import ChecklistSidebar from './checklist/ChecklistSidebar';
import ChecklistDetail from './checklist/ChecklistDetail';
import { useTaskContext, Task, TaskPhase } from './TaskContext';

// Task interfaces are now imported from TaskContext

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'active':
      return 'text-blue-600 bg-blue-50';
    case 'upcoming':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days`;
  return date.toLocaleDateString();
};

const ExpandableTaskCard = ({ task, onNavigate, onUpdateTask }: {
  task: Task;
  onNavigate: (page: string) => void;
  onUpdateTask?: (taskId: string, status: Task['status']) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isCompleted = task.status === 'completed';
  const isActive = ['active', 'in-progress', 'overdue'].includes(task.status);
  const isOverdue = task.status === 'overdue';

  const handleNavigation = () => {
    if (task.linkedPage) {
      onNavigate(task.linkedPage);
    }
  };

  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the collapsible
    if (onUpdateTask) {
      const newStatus = isCompleted ? 'active' : 'completed';
      onUpdateTask(task.id, newStatus);
    }
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`border rounded-lg transition-all hover:shadow-sm ${
        isOverdue ? 'border-red-200 bg-red-50/30' :
        isActive ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
      }`}>
        <CollapsibleTrigger className="w-full p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <button
                onClick={handleToggleCompletion}
                className="p-1 -m-1 rounded hover:bg-gray-100 transition-colors"
                title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : isOverdue ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : isActive ? (
                  <Clock className="w-5 h-5 text-blue-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'} break-words flex-1 pr-2`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.completedDate && (
                    <span className="text-sm text-green-600">Completed</span>
                  )}
                  {isActive && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                      Active
                    </Badge>
                  )}
                  {task.linkedPage && (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="ml-8 space-y-3 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">{task.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{task.assignedTo}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {task.category}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </Badge>
              </div>
              
              {task.completedDate && (
                <span className="text-sm text-green-600">Completed {task.completedDate}</span>
              )}
            </div>
            
            {(isActive || (task.linkedPage && !isCompleted)) && (
              <div className="flex gap-2 pt-2">
                {task.linkedPage && (
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={handleNavigation}
                    className="mobile-button-sm"
                  >
                    {task.actionLabel || 'Take Action'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mobile-button-sm"
                  onClick={() => {
                    // Show task details modal or expand task information
                    alert(`Task Details: ${task.title}\n\nDescription: ${task.description || 'No additional details available.'}\n\nCategory: ${task.category}\nPriority: ${task.priority}`);
                    // In a real app, this would open a detailed view modal
                  }}
                >
                  View Details
                </Button>
              </div>
            )}
            
            {isCompleted && task.linkedPage && (
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleNavigation}
                  className="mobile-button-sm"
                >
                  View {task.category}
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

const PhaseCard = ({ phase, onNavigate, onUpdateTask }: {
  phase: TaskPhase;
  onNavigate: (page: string) => void;
  onUpdateTask?: (taskId: string, status: Task['status']) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(phase.status === 'active');
  const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = phase.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <Card className="mb-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                phase.status === 'completed' ? 'bg-green-100' :
                phase.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {phase.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : phase.status === 'active' ? (
                  <Clock className="w-5 h-5 text-blue-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{phase.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={`${getStatusColor(phase.status)} border-0 mb-2`}>
                        {phase.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-24 h-2" />
                        <span className="text-sm text-gray-600">{completedTasks}/{totalTasks}</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {phase.tasks.map((task) => (
                <ExpandableTaskCard key={task.id} task={task} onNavigate={onNavigate} onUpdateTask={onUpdateTask} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

interface TasksProps {
  onNavigate: (page: string) => void;
}

export default function Tasks({ onNavigate }: TasksProps) {
  const isMobile = useIsMobile();
  const taskContext = useTaskContext();
  
  // Feature flags for visibility
  const SHOW_TASK_CATEGORIES = false;
  const SHOW_QUICK_ACTIONS = false;
  const SHOW_PROGRESS_COUNTS = false;
  
  const { taskPhases } = taskContext;
  const totalTasks = taskContext.getTotalTasksCount();
  const completedTasks = taskContext.getCompletedTasksCount();
  const activeTasks = taskContext.getActiveTasksCount();
  const overallProgress = taskContext.getOverallProgress();

  const handleUpdateTask = (taskId: string, status: Task['status']) => {
    taskContext.updateTaskStatus(taskId, status);
  };

  // selection state for sidebar -> detail
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | undefined>(taskPhases.find(p => p.status === 'active')?.id);
  const flatTasks = taskPhases.flatMap(p => p.tasks);
  const firstActiveTask = flatTasks.find(t => ['active','in-progress','overdue'].includes(t.status)) || flatTasks[0] || null;
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(firstActiveTask?.id);
  
  // Get active tasks for quick actions
  const activeTasksForAlert = taskPhases.flatMap(phase => phase.tasks).filter(task => 
    ['active', 'in-progress', 'overdue'].includes(task.status)
  );
  
  // Calculate task counts by category for navigation shortcuts
  const getTaskCountByCategory = (category: string) => {
    return taskContext.getActiveTasksByCategory(category.toLowerCase()).length;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black mt-1">
            Color-coded milestones, interactive checklist, and deadline tracker
          </p>
        </div>
      </div>

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 p-1">
          <TabsTrigger value="checklist" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold text-sm px-4 py-2">✓ Checklist</TabsTrigger>
          <TabsTrigger value="legal" className="text-sm px-4 py-2">Legal</TabsTrigger>
          <TabsTrigger value="inspections" className="text-sm px-4 py-2">Inspections</TabsTrigger>
          <TabsTrigger value="insurance" className="text-sm px-4 py-2">Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-6">
          {/* New three-column layout mirroring screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <ChecklistSidebar
                phases={taskPhases}
                selectedPhaseId={selectedPhaseId}
                selectedTaskId={selectedTaskId}
                onSelectPhase={(id) => setSelectedPhaseId(id)}
                onSelectTask={(taskId) => setSelectedTaskId(taskId)}
                onUpdateTask={handleUpdateTask}
              />
            </div>
            <div className="lg:col-span-9">
              <ChecklistDetail
                task={flatTasks.find(t => t.id === selectedTaskId) || firstActiveTask}
                onAction={() => {
                  const t = flatTasks.find(t => t.id === selectedTaskId) || firstActiveTask;
                  if (t?.linkedPage) onNavigate(t.linkedPage);
                }}
                onUpdateTask={handleUpdateTask}
              />
            </div>
          </div>

          {/* Task Category Navigation (hidden via flag) */}
          {SHOW_TASK_CATEGORIES && (
            <Card className="bg-white border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  Task Categories
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Navigate directly to specific task areas
                </p>
              </CardHeader>
              <CardContent>
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'} gap-3`}>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('legal')}
                  className={`flex items-center ${isMobile ? 'gap-2 p-3' : 'gap-3 p-4'} h-auto bg-white hover:bg-gray-50 border-gray-200 ${isMobile ? 'mobile-button' : ''}`}
                >
                  <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-1 min-w-0`}>
                    <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-red-100 rounded-lg flex-shrink-0`}>
                      <Scale className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-red-600`} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className={`${isMobile ? 'text-sm' : ''} font-medium truncate`}>Legal</div>
                      <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 truncate`}>
                        {getTaskCountByCategory('legal')} active tasks
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => onNavigate('financing')}
                  className={`flex items-center ${isMobile ? 'gap-2 p-3' : 'gap-3 p-4'} h-auto bg-white hover:bg-gray-50 border-gray-200 ${isMobile ? 'mobile-button' : ''}`}
                >
                  <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-1 min-w-0`}>
                    <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-green-100 rounded-lg flex-shrink-0`}>
                      <Calculator className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-green-600`} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className={`${isMobile ? 'text-sm' : ''} font-medium truncate`}>Financing</div>
                      <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 truncate`}>
                        {getTaskCountByCategory('financing')} active tasks
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => onNavigate('inspections')}
                  className={`flex items-center ${isMobile ? 'gap-2 p-3' : 'gap-3 p-4'} h-auto bg-white hover:bg-gray-50 border-gray-200 ${isMobile ? 'mobile-button' : ''}`}
                >
                  <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-1 min-w-0`}>
                    <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-blue-100 rounded-lg flex-shrink-0`}>
                      <FileCheck className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-blue-600`} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className={`${isMobile ? 'text-sm' : ''} font-medium truncate`}>Inspections</div>
                      <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 truncate`}>
                        {getTaskCountByCategory('inspections')} active tasks
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => onNavigate('insurance')}
                  className={`flex items-center ${isMobile ? 'gap-2 p-3' : 'gap-3 p-4'} h-auto bg-white hover:bg-gray-50 border-gray-200 ${isMobile ? 'mobile-button' : ''}`}
                >
                  <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-1 min-w-0`}>
                    <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-yellow-100 rounded-lg flex-shrink-0`}>
                      <Shield className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-600`} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className={`${isMobile ? 'text-sm' : ''} font-medium truncate`}>Insurance</div>
                      <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 truncate`}>
                        {getTaskCountByCategory('insurance')} active tasks
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
                </Button>
              </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions for Active Tasks */}
          {SHOW_QUICK_ACTIONS && activeTasks > 0 && (
            <Card className="bg-white border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                  {activeTasksForAlert.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className={`${isMobile ? 'text-sm' : ''} font-medium truncate`}>{task.title}</p>
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 truncate`}>{task.assignedTo}</p>
                        {task.dueDate && (
                          <p className="text-xs text-primary">Due: {formatDate(task.dueDate)}</p>
                        )}
                      </div>
                      {task.linkedPage && (
                        <Button
                          size={isMobile ? "icon" : "sm"}
                          onClick={() => onNavigate(task.linkedPage!)}
                          className={`${isMobile ? 'mobile-button-sm w-9 h-9' : 'ml-2'}`}
                          title={isMobile ? (task.actionLabel || 'Go') : undefined}
                        >
                          <ExternalLink className="w-4 h-4" />
                          {!isMobile && <span className="ml-2">{task.actionLabel || 'Go'}</span>}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-semibold text-green-600">{completedTasks}</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-blue-600">{activeTasks}</div>
                  <div className="text-sm text-gray-600">Active Tasks</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-600">{totalTasks - completedTasks - activeTasks}</div>
                  <div className="text-sm text-gray-600">Upcoming Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6 mt-6">
          <ChecklistLegalTabs />
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6 mt-6">
          <ChecklistInspectionTabs />
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6 mt-6">
          <ChecklistInsuranceTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
