import React, { useState } from 'react';
import { Check, Circle, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  dueDate?: string;
  completedDate?: string;
}

const processSteps: ProcessStep[] = [
  {
    id: 'preapproval',
    title: 'Pre-approval',
    description: 'Get pre-approved for your mortgage',
    status: 'completed',
    completedDate: 'Dec 15, 2024',
  },
  {
    id: 'househunting',
    title: 'House hunting',
    description: 'Find your perfect home',
    status: 'completed',
    completedDate: 'Jan 8, 2025',
  },
  {
    id: 'offer',
    title: 'Offer submitted',
    description: 'Your offer has been accepted',
    status: 'completed',
    completedDate: 'Jan 12, 2025',
  },
  {
    id: 'inspection',
    title: 'Home inspection',
    description: 'Professional home inspection scheduled',
    status: 'current',
    dueDate: 'Jan 17, 2025',
  },
  {
    id: 'financing',
    title: 'Financing approval',
    description: 'Finalize your mortgage details',
    status: 'upcoming',
    dueDate: 'Jan 22, 2025',
  },
  {
    id: 'closing',
    title: 'Closing preparation',
    description: 'Review documents and prepare for closing',
    status: 'upcoming',
    dueDate: 'Jan 28, 2025',
  },
  {
    id: 'walkthrough',
    title: 'Final walkthrough',
    description: 'Final inspection of the property',
    status: 'upcoming',
    dueDate: 'Jan 30, 2025',
  },
  {
    id: 'closingday',
    title: 'Closing day',
    description: 'Sign documents and get your keys',
    status: 'upcoming',
    dueDate: 'Jan 31, 2025',
  },
];

// Helper function to format date display
const formatDateDisplay = (date: string, isCompleted: boolean = false) => {
  const dateObj = new Date(date);
  const today = new Date();
  const diffTime = dateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (isCompleted) {
    return {
      text: date,
      className: 'text-green-800 bg-green-100',
      prefix: 'Completed',
    };
  }

  if (diffDays === 0) {
    return {
      text: 'Today',
      className: 'text-red-800 bg-red-100',
      prefix: 'Due',
    };
  } else if (diffDays === 1) {
    return {
      text: 'Tomorrow',
      className: 'text-orange-800 bg-orange-100',
      prefix: 'Due',
    };
  } else if (diffDays > 0 && diffDays <= 7) {
    return {
      text: `in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
      className: 'text-orange-800 bg-orange-100',
      prefix: 'Due',
    };
  } else if (diffDays > 7) {
    return {
      text: date,
      className: 'text-blue-800 bg-blue-100',
      prefix: 'Due',
    };
  } else {
    return {
      text: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`,
      className: 'text-red-800 bg-red-100',
      prefix: 'Overdue',
    };
  }
};

export function ProcessProgress() {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedSteps = processSteps.filter(step => step.status === 'completed').length;
  const totalSteps = processSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  // Get current step for quick overview
  const currentStep = processSteps.find(step => step.status === 'current');
  const nextSteps = processSteps.filter(step => step.status === 'upcoming').slice(0, 2);

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
<h3 className="text-sm font-semibold">Your Progress</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
          >
            {isExpanded ? 'Hide Details' : 'View All Steps'}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progressPercentage} className="flex-1 h-1.5" />
          <span className="text-xs text-muted-foreground">
            {completedSteps} of {totalSteps} completed
          </span>
        </div>
      </div>

      {/* Condensed view when collapsed */}
      {!isExpanded && (
        <div className="space-y-2">
          {/* Current Step - Always show */}
          {currentStep && (
            <div className="flex items-start gap-2 p-2 bg-primary/5 rounded border border-primary/20">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/20 text-primary border border-primary flex-shrink-0">
                <Clock className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <h4 className="text-sm font-medium text-primary truncate">
                    {currentStep.title}
                  </h4>
                  {currentStep.dueDate && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      formatDateDisplay(currentStep.dueDate).className
                    }`}>
                      Due {formatDateDisplay(currentStep.dueDate).text}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{currentStep.description}</p>
              </div>
            </div>
          )}

          {/* Next upcoming steps preview */}
          {nextSteps.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Coming up next:</p>
              {nextSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-muted text-muted-foreground flex-shrink-0">
                    <Circle className="w-2 h-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium truncate">{step.title}</span>
                    {step.dueDate && (
                      <span className="text-xs text-muted-foreground ml-1 truncate">
                        - {step.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full detailed view when expanded */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent className="space-y-4">
          {processSteps.map((step, index) => {
            const dateToShow = step.status === 'completed' ? step.completedDate : step.dueDate;
            const dateInfo = dateToShow ? formatDateDisplay(dateToShow, step.status === 'completed') : null;

            return (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed'
                        ? 'bg-primary text-primary-foreground'
                        : step.status === 'current'
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : step.status === 'current' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 mt-2 ${
                        step.status === 'completed' ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${step.status === 'current' ? 'text-primary' : ''}`}>
                      {step.title}
                    </h4>
                    {dateInfo && (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${dateInfo.className}`}>
                          {dateInfo.prefix} {dateInfo.text}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  {/* Additional date information for current task */}
                  {step.status === 'current' && dateToShow && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Scheduled for {dateToShow}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* Timeline Summary - Always visible */}
      <div className="mt-3 pt-2 border-t border-border">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground mb-0.5">Next deadline</p>
            <p className="font-medium text-sm">Home inspection - Jan 17, 2025</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Estimated closing</p>
            <p className="font-medium text-sm">Jan 31, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
