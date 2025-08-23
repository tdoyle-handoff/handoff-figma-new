import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../utils/supabase/client';
import { PropertyData } from './PropertyContext';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'search' | 'offer' | 'contract' | 'diligence' | 'pre-closing' | 'closing' | 'post-closing';
  subcategory?: 'financing' | 'legal' | 'inspections' | 'insurance' | 'general';
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'in-progress' | 'pending' | 'overdue' | 'active' | 'upcoming';
  completed?: boolean;
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
  documents?: string[];
  completedDate?: string;
  estimatedTime?: string;
  dependencies?: string[];
  linkedPage?: string;
  actionLabel?: string;
  propertySpecific?: boolean;
  userCustomized?: boolean;
  instructions?: TaskInstructions;
}

export interface TaskInstructions {
  overview: string;
  steps: TaskStep[];
  requiredDocuments?: string[];
  contacts?: TaskContact[];
  tips?: string[];
  nextSteps?: string[];
  timeline?: string;
  cost?: string;
  whatToExpect?: string;
}

export interface TaskStep {
  step: number;
  title: string;
  description: string;
  action: string;
  duration?: string;
  important?: boolean;
}

export interface TaskContact {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  when: string;
}

export interface TaskPhase {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
  tasks: Task[];
  order: number;
  estimatedDuration?: string;
  keyMilestones?: string[];
}

interface TaskContextType {
  tasks: Task[];
  taskPhases: TaskPhase[];
  getTotalTasksCount: () => number;
  getTotalDueTasks: () => number;
  getCompletedTasks: () => number;
  getCompletedTasksCount: () => number;
  getActiveTasksCount: () => number;
  getOverallProgress: () => number;
  getTasksByCategory: (category: string) => Task[];
  getActiveTasksByCategory: (category: string) => Task[];
  getTasksByStatus: (status: string) => Task[];
  getHighPriorityTasks: () => Task[];
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  getUpcomingTasks: (days?: number) => Task[];
  getOverdueTasks: () => Task[];
  generatePersonalizedTasks: (propertyData: PropertyData) => void;
  getTasksByPhase: (phaseId: string) => Task[];
  getNextActionableTasks: () => Task[];
  getTasksNeedingAttention: () => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
  userProfile: UserProfile | null;
}

// Function to determine if house is under contract
const isHouseUnderContract = (): boolean => {
  try {
    const preQuestionnaireData = localStorage.getItem('handoff-pre-questionnaire');
    if (preQuestionnaireData) {
      const parsedData = JSON.parse(preQuestionnaireData);
      return parsedData.hasExistingHome === true && parsedData.isUnderContract === true;
    }
  } catch (error) {
    console.warn('Error parsing pre-questionnaire data:', error);
  }
  return false;
};

// Function to get property data for task generation
const getPropertyData = (): PropertyData | null => {
  try {
    const propertyData = localStorage.getItem('handoff-property-data');
    if (propertyData) {
      return JSON.parse(propertyData);
    }
    
    // Fallback to old questionnaire format
    const oldData = localStorage.getItem('handoff-questionnaire-responses');
    if (oldData) {
      return JSON.parse(oldData);
    }
  } catch (error) {
    console.warn('Error parsing property data:', error);
  }
  return null;
};

// Enhanced task generation based on comprehensive real estate transaction workflow
const generateRealEstateTransactionTasks = (propertyData: PropertyData): Task[] => {
  const underContract = isHouseUnderContract();
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  // Calculate timeline based on target closing date
  const closingDate = propertyData.targetClosingDate ? new Date(propertyData.targetClosingDate) : new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
  const daysUntilClosing = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Helper function to create dates relative to closing
  const getDateFromClosing = (daysFromClosing: number): string => {
    const date = new Date(closingDate);
    date.setDate(date.getDate() - daysFromClosing);
    return formatDate(date);
  };

  // Helper function to create dates from now
  const getDateFromNow = (daysFromNow: number): string => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysFromNow);
    return formatDate(date);
  };

  const tasks: Task[] = [];

  // SEARCH & PREAPPROVAL PHASE
  tasks.push({
    id: 'search-buyer-intake',
    title: 'Complete buyer intake form',
    description: 'Complete comprehensive buyer intake form with your real estate agent',
    category: 'search',
    subcategory: 'general',
    priority: 'high',
    status: 'completed',
    completedDate: formatDate(today),
    estimatedTime: '45-60 minutes',
    assignedTo: 'You',
    linkedPage: 'property',
    actionLabel: 'View Form',
    propertySpecific: true
  });

  tasks.push({
    id: 'search-mortgage-preapproval',
    title: 'Get mortgage pre approval',
    description: 'Obtain pre-approval for mortgage financing from a qualified lender',
    category: 'search',
    subcategory: 'financing',
    priority: 'high',
    status: underContract ? 'completed' : (propertyData.hasLender ? 'in-progress' : 'active'),
    dueDate: underContract ? undefined : getDateFromNow(7),
    completedDate: underContract ? getDateFromNow(-20) : undefined,
    estimatedTime: '3-5 business days',
    assignedTo: propertyData.hasLender ? (propertyData.lenderContactName || 'Your Lender') : 'You',
    linkedPage: 'financing',
    actionLabel: 'Start Pre-Approval',
    propertySpecific: true
  });

  // MAKE OFFER PHASE
  // Show all comprehensive tasks regardless of contract status for demo purposes
  if (true) {
    tasks.push({
      id: 'offer-submission',
      title: 'Offer Submission',
      description: 'Submit formal offer to purchase the property',
      category: 'offer',
      subcategory: 'general',
      priority: 'high',
      status: 'completed',
      completedDate: getDateFromNow(-15),
      estimatedTime: '2-3 hours',
      assignedTo: propertyData.realtorName || 'Your Agent',
      linkedPage: 'property',
      actionLabel: 'View Offer',
      propertySpecific: true
    });

    tasks.push({
      id: 'offer-find-lawyer',
      title: 'Find lawyer',
      description: 'Select and retain qualified real estate attorney for closing',
      category: 'offer',
      subcategory: 'legal',
      priority: 'high',
      status: propertyData.hasAttorney ? 'completed' : 'active',
      dueDate: propertyData.hasAttorney ? undefined : getDateFromNow(3),
      completedDate: propertyData.hasAttorney ? getDateFromNow(-12) : undefined,
      estimatedTime: '2-3 hours',
      assignedTo: 'You',
      linkedPage: 'legal',
      actionLabel: 'Find Attorney',
      propertySpecific: true
    });

    // CONTRACT PHASE
    tasks.push({
      id: 'contract-acceptance-signing',
      title: 'Offer Acceptance/Signing',
      description: 'Review and sign the accepted purchase agreement',
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: 'completed',
      completedDate: getDateFromNow(-14),
      estimatedTime: '1-2 hours',
      assignedTo: 'You & Attorney',
      linkedPage: 'legal',
      actionLabel: 'View Contract',
      propertySpecific: true
    });

    tasks.push({
      id: 'contract-riders',
      title: 'Riders',
      description: 'Review and execute any contract riders or addendums',
      category: 'contract',
      subcategory: 'legal',
      priority: 'medium',
      status: 'completed',
      completedDate: getDateFromNow(-14),
      estimatedTime: '30-60 minutes',
      assignedTo: 'You & Attorney',
      linkedPage: 'legal',
      actionLabel: 'View Riders',
      propertySpecific: true
    });

    tasks.push({
      id: 'contract-send-lawyer-signed',
      title: 'Send Lawyer Signed Contract',
      description: 'Provide signed contract to your attorney for review and processing',
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: 'completed',
      completedDate: getDateFromNow(-13),
      estimatedTime: '15 minutes',
      assignedTo: 'You',
      linkedPage: 'legal',
      actionLabel: 'Send to Attorney',
      propertySpecific: true
    });

    tasks.push({
      id: 'contract-produce-deposit',
      title: 'Produce deposit',
      description: 'Submit earnest money deposit as specified in the purchase agreement',
      category: 'contract',
      subcategory: 'general',
      priority: 'high',
      status: 'completed',
      completedDate: getDateFromNow(-13),
      estimatedTime: '30 minutes',
      assignedTo: 'You',
      linkedPage: 'legal',
      actionLabel: 'Submit Deposit',
      propertySpecific: true
    });

    // DUE DILIGENCE PHASE - FINANCING
    tasks.push({
      id: 'diligence-financing-shop-terms',
      title: 'Shop for mortgage terms',
      description: 'Compare mortgage rates and terms from multiple lenders',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: daysUntilClosing > 30 ? 'active' : 'upcoming',
      dueDate: getDateFromClosing(25),
      estimatedTime: '2-3 hours',
      assignedTo: 'You',
      linkedPage: 'financing',
      actionLabel: 'Compare Rates',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-financing-send-offer',
      title: 'Send offer to mortgage company',
      description: 'Provide accepted purchase agreement to your chosen lender',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: daysUntilClosing > 25 ? 'active' : 'upcoming',
      dueDate: getDateFromClosing(20),
      estimatedTime: '30 minutes',
      assignedTo: 'You',
      linkedPage: 'financing',
      actionLabel: 'Submit to Lender',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-financing-submit-application',
      title: 'Submit mortage application/financial information',
      description: 'Complete formal mortgage application with all required financial documents',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(18),
      estimatedTime: '3-4 hours',
      assignedTo: 'You & Lender',
      linkedPage: 'financing',
      actionLabel: 'Submit Application',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-financing-appraisal',
      title: 'Appraisal',
      description: 'Schedule and complete property appraisal as required by lender',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(15),
      estimatedTime: '2-3 hours',
      assignedTo: 'Appraiser & Lender',
      linkedPage: 'financing',
      actionLabel: 'Schedule Appraisal',
      propertySpecific: true
    });

    // DUE DILIGENCE PHASE - INSPECTION
    tasks.push({
      id: 'diligence-inspection-shop-inspectors',
      title: 'Shop for inspectors',
      description: 'Research and contact qualified home inspectors',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'active',
      dueDate: getDateFromClosing(12),
      estimatedTime: '1-2 hours',
      assignedTo: 'You',
      linkedPage: 'inspections',
      actionLabel: 'Find Inspectors',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-inspection-general-scheduled',
      title: 'General scheduled',
      description: 'Schedule and complete general home inspection',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'active',
      dueDate: getDateFromClosing(10),
      estimatedTime: '3-4 hours',
      assignedTo: 'You & Inspector',
      linkedPage: 'inspections',
      actionLabel: 'Schedule Inspection',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-inspection-additional',
      title: 'Additional: bug, septic, lead, radon, roof, structural',
      description: 'Schedule specialized inspections as needed based on property type and general inspection results',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: 'upcoming',
      dueDate: getDateFromClosing(8),
      estimatedTime: 'Variable',
      assignedTo: 'You & Specialists',
      linkedPage: 'inspections',
      actionLabel: 'Schedule Additional',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-inspection-review-results',
      title: 'Review inspection results',
      description: 'Carefully review all inspection reports and identify any issues',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(6),
      estimatedTime: '1-2 hours',
      assignedTo: 'You & Agent',
      linkedPage: 'inspections',
      actionLabel: 'Review Reports',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-inspection-submit-items',
      title: 'Submit items to address/begin negotiations',
      description: 'Submit repair requests or negotiate credits for inspection issues',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(5),
      estimatedTime: '2-3 hours',
      assignedTo: 'You & Agent',
      linkedPage: 'inspections',
      actionLabel: 'Submit Requests',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-inspection-finalize-remedies',
      title: 'Finalize inspection remedies and timelines (extended)',
      description: 'Complete negotiations and finalize repair agreements with seller',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(3),
      estimatedTime: '1-2 hours',
      assignedTo: 'You & Agent',
      linkedPage: 'inspections',
      actionLabel: 'Finalize Agreement',
      propertySpecific: true
    });

    // DUE DILIGENCE PHASE - LEGAL
    tasks.push({
      id: 'diligence-legal-title-search',
      title: 'Title search',
      description: 'Attorney conducts comprehensive title search for property',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(10),
      estimatedTime: '1-2 days',
      assignedTo: 'Your Attorney',
      linkedPage: 'legal',
      actionLabel: 'Monitor Progress',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-legal-review-liens',
      title: 'Review liens, parcel nuances (easements, encroachments)',
      description: 'Review title report for any liens, easements, or encroachments',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'medium',
      status: 'upcoming',
      dueDate: getDateFromClosing(8),
      estimatedTime: '1-2 hours',
      assignedTo: 'Your Attorney',
      linkedPage: 'legal',
      actionLabel: 'Review Title',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-legal-confirm-clear',
      title: 'Confirm clear to close',
      description: 'Attorney confirms title is clear and ready for closing',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(5),
      estimatedTime: '30 minutes',
      assignedTo: 'Your Attorney',
      linkedPage: 'legal',
      actionLabel: 'Confirm Status',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-legal-settlement-statement',
      title: 'Produce settlement statement (general proration)',
      description: 'Attorney prepares settlement statement with all closing costs and prorations',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(3),
      estimatedTime: '1-2 hours',
      assignedTo: 'Your Attorney',
      linkedPage: 'legal',
      actionLabel: 'Review Statement',
      propertySpecific: true
    });

    tasks.push({
      id: 'diligence-legal-escrow-wire',
      title: 'Escrow account for deposit / wire instructions prep',
      description: 'Set up escrow account and prepare wire transfer instructions for closing',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(2),
      estimatedTime: '1 hour',
      assignedTo: 'Your Attorney',
      linkedPage: 'legal',
      actionLabel: 'Setup Escrow',
      propertySpecific: true
    });

    // PRE-CLOSING PREPARATION - FINAL WALKTHROUGH
    tasks.push({
      id: 'pre-closing-walkthrough-schedule',
      title: 'Schedule',
      description: 'Schedule final walkthrough 24-48 hours before closing',
      category: 'pre-closing',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(2),
      estimatedTime: '15 minutes',
      assignedTo: propertyData.realtorName || 'Your Agent',
      linkedPage: 'inspections',
      actionLabel: 'Schedule Walkthrough',
      propertySpecific: true
    });

    tasks.push({
      id: 'pre-closing-walkthrough-confirm-remedies',
      title: 'Confirm remedies were complete',
      description: 'Verify all agreed-upon repairs have been completed satisfactorily',
      category: 'pre-closing',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(1),
      estimatedTime: '1-2 hours',
      assignedTo: 'You & Agent',
      linkedPage: 'inspections',
      actionLabel: 'Conduct Walkthrough',
      propertySpecific: true
    });

    tasks.push({
      id: 'pre-closing-walkthrough-renegotiate',
      title: 'Re-negotiate new findings, if applicable',
      description: 'Address any new issues discovered during final walkthrough',
      category: 'pre-closing',
      subcategory: 'inspections',
      priority: 'medium',
      status: 'upcoming',
      dueDate: getDateFromClosing(1),
      estimatedTime: 'Variable',
      assignedTo: 'You & Agent',
      linkedPage: 'inspections',
      actionLabel: 'Address Issues',
      propertySpecific: true
    });

    // PRE-CLOSING PREPARATION - INSURANCE
    tasks.push({
      id: 'pre-closing-insurance-find-coverage',
      title: 'Find coverage (bids from brokers or direct): homeowner',
      description: 'Obtain homeowners insurance quotes and select coverage',
      category: 'pre-closing',
      subcategory: 'insurance',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(7),
      estimatedTime: '2-3 hours',
      assignedTo: 'You & Insurance Agent',
      linkedPage: 'insurance',
      actionLabel: 'Get Quotes',
      propertySpecific: true
    });

    tasks.push({
      id: 'pre-closing-insurance-pay-coverage',
      title: 'Pay for coverage / choose effective date',
      description: 'Purchase selected insurance policy with effective date at closing',
      category: 'pre-closing',
      subcategory: 'insurance',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(3),
      estimatedTime: '30 minutes',
      assignedTo: 'You & Insurance Agent',
      linkedPage: 'insurance',
      actionLabel: 'Purchase Policy',
      propertySpecific: true
    });

    // CLOSING DAY
    tasks.push({
      id: 'closing-wire-funds',
      title: 'Wire funds / produce check',
      description: 'Wire closing funds or provide certified check as instructed by attorney',
      category: 'closing',
      subcategory: 'general',
      priority: 'high',
      status: 'upcoming',
      dueDate: formatDate(closingDate),
      estimatedTime: '30 minutes',
      assignedTo: 'You',
      linkedPage: 'legal',
      actionLabel: 'Wire Funds',
      propertySpecific: true
    });

    tasks.push({
      id: 'closing-sign-documents',
      title: 'Sign final documents',
      description: 'Review and sign all closing documents at the closing table',
      category: 'closing',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: formatDate(closingDate),
      estimatedTime: '1-2 hours',
      assignedTo: 'You & Attorney',
      linkedPage: 'legal',
      actionLabel: 'Attend Closing',
      propertySpecific: true
    });

    // POST CLOSING
    tasks.push({
      id: 'post-closing-setup-utilities',
      title: 'Set up utilities',
      description: 'Transfer or set up utility services in your name',
      category: 'post-closing',
      subcategory: 'general',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(-2),
      estimatedTime: '2-3 hours',
      assignedTo: 'You',
      linkedPage: null,
      actionLabel: 'Setup Utilities',
      propertySpecific: true
    });

    tasks.push({
      id: 'post-closing-move-in',
      title: 'Move-in',
      description: 'Coordinate and execute your move to the new property',
      category: 'post-closing',
      subcategory: 'general',
      priority: 'medium',
      status: 'upcoming',
      dueDate: getDateFromClosing(-1),
      estimatedTime: 'Full day',
      assignedTo: 'You & Movers',
      linkedPage: null,
      actionLabel: 'Plan Move',
      propertySpecific: true
    });
  }

  // Mark some tasks as overdue if past due date
  return tasks.map(task => {
    if (task.dueDate && task.status !== 'completed') {
      const dueDate = new Date(task.dueDate);
      if (dueDate < today) {
        return { ...task, status: 'overdue' as const };
      }
    }
    return task;
  });
};

// Generate task phases based on real estate transaction workflow
const generateRealEstateTaskPhases = (tasks: Task[], propertyData: PropertyData | null): TaskPhase[] => {
  const underContract = isHouseUnderContract();
  
  const phases: TaskPhase[] = [
    {
      id: 'phase-search',
      title: 'Search & Pre-Approval',
      description: 'Complete questionnaire and get pre-approved for financing',
      status: 'completed',
      tasks: [],
      order: 1,
      estimatedDuration: '1-2 weeks',
      keyMilestones: ['Questionnaire complete', 'Pre-approval obtained']
    },
    {
      id: 'phase-offer',
      title: underContract ? 'Offer Accepted' : 'Make Offer',
      description: underContract ? 'Your offer has been accepted' : 'Submit offers and negotiate terms',
      status: underContract ? 'completed' : 'active',
      tasks: [],
      order: 2,
      estimatedDuration: underContract ? 'Complete' : '1-4 weeks',
      keyMilestones: underContract ? ['Offer submitted', 'Terms negotiated', 'Contract signed'] : ['Property found', 'Offer submitted', 'Terms negotiated']
    },
    {
      id: 'phase-contract',
      title: 'Contract',
      description: 'Execute contract and complete initial requirements',
      status: underContract ? 'completed' : 'upcoming',
      tasks: [],
      order: 3,
      estimatedDuration: '1 week',
      keyMilestones: ['Contract signed', 'Deposit submitted', 'Attorney engaged']
    },
    {
      id: 'phase-diligence',
      title: 'Due Diligence',
      description: 'Complete financing, legal, and inspection requirements',
      status: underContract ? 'active' : 'upcoming',
      tasks: [],
      order: 4,
      estimatedDuration: '3-6 weeks',
      keyMilestones: ['Financing approved', 'Title clear', 'Inspections complete']
    },
    {
      id: 'phase-pre-closing',
      title: 'Pre-Closing Preparation',
      description: 'Final walkthrough and insurance arrangements',
      status: 'upcoming',
      tasks: [],
      order: 5,
      estimatedDuration: '1 week',
      keyMilestones: ['Insurance secured', 'Final walkthrough', 'Funds ready']
    },
    {
      id: 'phase-closing',
      title: 'Closing Day',
      description: 'Complete the purchase and receive keys',
      status: 'upcoming',
      tasks: [],
      order: 6,
      estimatedDuration: '1 day',
      keyMilestones: ['Documents signed', 'Funds transferred', 'Keys received']
    },
    {
      id: 'phase-post-closing',
      title: 'Post Closing',
      description: 'Set up utilities and move into your new home',
      status: 'upcoming',
      tasks: [],
      order: 7,
      estimatedDuration: '1 week',
      keyMilestones: ['Utilities transferred', 'Move completed']
    }
  ];

  // Categorize tasks into phases
  tasks.forEach(task => {
    const phaseIndex = phases.findIndex(phase => phase.id === `phase-${task.category}`);
    if (phaseIndex !== -1) {
      phases[phaseIndex].tasks.push(task);
    }
  });

  // Update phase status based on task completion
  phases.forEach(phase => {
    const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
    const totalTasks = phase.tasks.length;
    
    if (totalTasks === 0) {
      phase.status = 'upcoming';
    } else if (completedTasks === totalTasks) {
      phase.status = 'completed';
    } else if (completedTasks > 0 || phase.tasks.some(task => task.status === 'active' || task.status === 'in-progress')) {
      phase.status = 'active';
    } else {
      phase.status = 'upcoming';
    }
  });

  return phases;
};

export function TaskProvider({ children, userProfile }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskPhases, setTaskPhases] = useState<TaskPhase[]>([]);

  // Initialize tasks based on property data
  useEffect(() => {
    const propertyData = getPropertyData();
    const generatedTasks = generateRealEstateTransactionTasks(propertyData || {} as PropertyData);
    const phases = generateRealEstateTaskPhases(generatedTasks, propertyData);
    
    setTasks(generatedTasks);
    setTaskPhases(phases);
  }, [userProfile]);

  // Listen for property data updates
  useEffect(() => {
    const handlePropertyUpdate = (event: CustomEvent) => {
      const propertyData = event.detail as PropertyData;
      generatePersonalizedTasks(propertyData);
    };

    window.addEventListener('propertyDataUpdated', handlePropertyUpdate as EventListener);
    
    return () => {
      window.removeEventListener('propertyDataUpdated', handlePropertyUpdate as EventListener);
    };
  }, []);

  // Re-generate tasks when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const propertyData = getPropertyData();
      if (propertyData) {
        const generatedTasks = generateRealEstateTransactionTasks(propertyData);
        const phases = generateRealEstateTaskPhases(generatedTasks, propertyData);
        setTasks(generatedTasks);
        setTaskPhases(phases);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const generatePersonalizedTasks = (propertyData: PropertyData) => {
    const generatedTasks = generateRealEstateTransactionTasks(propertyData);
    const phases = generateRealEstateTaskPhases(generatedTasks, propertyData);
    setTasks(generatedTasks);
    setTaskPhases(phases);
  };

  const getTotalTasksCount = (): number => {
    return tasks.length;
  };

  const getTotalDueTasks = (): number => {
    return tasks.filter(task => 
      task.status === 'pending' || 
      task.status === 'in-progress' || 
      task.status === 'overdue' ||
      task.status === 'active' ||
      task.status === 'upcoming'
    ).length;
  };

  const getCompletedTasks = (): number => {
    return tasks.filter(task => task.status === 'completed').length;
  };

  const getCompletedTasksCount = (): number => {
    return getCompletedTasks();
  };

  const getActiveTasksCount = (): number => {
    return tasks.filter(task => task.status === 'active' || task.status === 'in-progress').length;
  };

  const getOverallProgress = (): number => {
    const totalTasks = getTotalTasksCount();
    const completedTasks = getCompletedTasksCount();
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const getTasksByCategory = (category: string): Task[] => {
    return tasks.filter(task => 
      task.category === category || 
      task.subcategory === category ||
      task.category === category.toLowerCase() ||
      task.subcategory === category.toLowerCase()
    );
  };

  const getActiveTasksByCategory = (category: string): Task[] => {
    return tasks.filter(task => 
      (task.category.toLowerCase() === category.toLowerCase() || 
       task.subcategory?.toLowerCase() === category.toLowerCase()) && 
      (task.status === 'active' || task.status === 'in-progress')
    );
  };

  const getTasksByStatus = (status: string): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByPhase = (phaseId: string): Task[] => {
    const phase = taskPhases.find(p => p.id === phaseId);
    return phase ? phase.tasks : [];
  };

  const getHighPriorityTasks = (): Task[] => {
    return tasks.filter(task => 
      task.priority === 'high' && 
      (task.status === 'pending' || task.status === 'in-progress' || task.status === 'overdue' || task.status === 'active')
    );
  };

  const getNextActionableTasks = (): Task[] => {
    return tasks
      .filter(task => task.status === 'active' || task.status === 'in-progress')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        
        return 0;
      })
      .slice(0, 5);
  };

  const getTasksNeedingAttention = (): Task[] => {
    const today = new Date();
    return tasks.filter(task => {
      if (task.status === 'overdue') return true;
      
      if (task.dueDate && task.status !== 'completed') {
        const dueDate = new Date(task.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 3 && daysUntilDue >= 0;
      }
      
      return false;
    });
  };

  const getUpcomingTasks = (days: number = 7): Task[] => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate <= futureDate && (task.status === 'pending' || task.status === 'in-progress' || task.status === 'active' || task.status === 'upcoming');
    });
  };

  const getOverdueTasks = (): Task[] => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today;
    });
  };

  const updateTaskStatus = (taskId: string, status: Task['status']): void => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status };
          if (status === 'completed' && !task.completedDate) {
            updatedTask.completedDate = new Date().toISOString().split('T')[0];
          } else if (status !== 'completed') {
            updatedTask.completedDate = undefined;
          }
          return updatedTask;
        }
        return task;
      })
    );
    
    setTimeout(() => {
      const propertyData = getPropertyData();
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status, completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined }
          : task
      );
      const phases = generateRealEstateTaskPhases(updatedTasks, propertyData);
      setTaskPhases(phases);
    }, 100);
  };

  const addTask = (task: Omit<Task, 'id'>): void => {
    const newTask: Task = {
      ...task,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userCustomized: true
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>): void => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string): void => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const contextValue: TaskContextType = {
    tasks,
    taskPhases,
    getTotalTasksCount,
    getTotalDueTasks,
    getCompletedTasks,
    getCompletedTasksCount,
    getActiveTasksCount,
    getOverallProgress,
    getTasksByCategory,
    getActiveTasksByCategory,
    getTasksByStatus,
    getHighPriorityTasks,
    updateTaskStatus,
    addTask,
    updateTask,
    deleteTask,
    getUpcomingTasks,
    getOverdueTasks,
    generatePersonalizedTasks,
    getTasksByPhase,
    getNextActionableTasks,
    getTasksNeedingAttention
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext(): TaskContextType {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
