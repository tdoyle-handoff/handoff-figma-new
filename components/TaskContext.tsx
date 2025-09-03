import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { UserProfile } from '../utils/supabase/client';
import { PropertyData } from './PropertyContext';
import { useAuth } from '../hooks/useAuth';

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

// Task generation function - generates comprehensive real estate transaction checklist
const generateRealEstateTransactionTasks = (propertyData: PropertyData): Task[] => {
  const isUnderContract = isHouseUnderContract();

  return [
    // Phase 1: Search & Research
    {
      id: 'task-mortgage-preapproval',
      title: 'Get Pre-approved for Mortgage',
      description: 'Obtain pre-approval letter from a lender to understand your budget and strengthen your offer.',
      category: 'search',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: '2-3 days',
      linkedPage: 'financing',
      actionLabel: 'Apply for Pre-approval',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Getting pre-approved for a mortgage is one of the first and most important steps in the home buying process.',
        steps: [
          {
            step: 1,
            title: 'Gather Financial Documents',
            description: 'Collect all necessary financial documentation',
            action: 'Prepare recent pay stubs, tax returns, bank statements, and debt information',
            duration: '1-2 hours'
          },
          {
            step: 2,
            title: 'Research Lenders',
            description: 'Compare rates and terms from multiple lenders',
            action: 'Contact at least 3 different lenders for quotes',
            duration: '2-4 hours'
          },
          {
            step: 3,
            title: 'Submit Application',
            description: 'Complete the mortgage application with your chosen lender',
            action: 'Fill out application and submit required documents',
            duration: '1-2 hours'
          },
          {
            step: 4,
            title: 'Receive Pre-approval Letter',
            description: 'Get your official pre-approval letter',
            action: 'Review terms and ensure accuracy of all information',
            duration: '1-2 days'
          }
        ],
        requiredDocuments: [
          'Recent pay stubs (last 2 months)',
          'Tax returns (last 2 years)',
          'Bank statements (last 3 months)',
          'Investment account statements',
          'List of debts and monthly payments',
          'Gift letter (if applicable)'
        ],
        tips: [
          'Shop around with multiple lenders to compare rates',
          'Don\'t make any major purchases before closing',
          'Keep your employment stable during the process',
          'Maintain your credit score by paying bills on time'
        ],
        timeline: '2-3 business days for approval',
        cost: 'Usually free for pre-approval'
      }
    },
    {
      id: 'task-agent-selection',
      title: 'Find a Real Estate Agent',
      description: 'Research and select a qualified buyer\'s agent to represent you in the transaction.',
      category: 'search',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: '1-2 weeks',
      assignedTo: 'Buyer'
    },
    {
      id: 'task-property-search',
      title: 'Begin Property Search',
      description: 'Start searching for properties that meet your criteria and budget.',
      category: 'search',
      priority: 'medium',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: 'Ongoing',
      linkedPage: 'property-search',
      actionLabel: 'Search Properties',
      assignedTo: 'Buyer & Agent'
    },

    // Phase 2: Offer & Negotiation
    {
      id: 'task-market-analysis',
      title: 'Comparative Market Analysis',
      description: 'Analyze recent sales of similar properties to determine fair market value.',
      category: 'offer',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1-2 days',
      assignedTo: 'Agent'
    },
    {
      id: 'task-submit-offer',
      title: 'Submit Purchase Offer',
      description: 'Prepare and submit a competitive purchase offer with appropriate terms and contingencies.',
      category: 'offer',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1 day',
      linkedPage: 'documents',
      actionLabel: 'Prepare Offer',
      assignedTo: 'Agent'
    },
    {
      id: 'task-offer-negotiation',
      title: 'Negotiate Offer Terms',
      description: 'Work with seller to negotiate price, terms, and contingencies.',
      category: 'offer',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1-3 days',
      assignedTo: 'Agent'
    },

    // Phase 3: Contract & Legal
    {
      id: 'task-contract-review',
      title: 'Review Purchase Contract',
      description: 'Carefully review all terms, conditions, and contingencies in the purchase agreement.',
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      estimatedTime: '2-3 days',
      linkedPage: 'legal',
      actionLabel: 'Review Contract',
      assignedTo: 'Attorney',
      instructions: {
        overview: 'Contract review is critical to ensure your interests are protected and all terms are clearly understood.',
        steps: [
          {
            step: 1,
            title: 'Initial Contract Review',
            description: 'Review all contract terms and conditions',
            action: 'Carefully read through entire purchase agreement',
            duration: '2-3 hours'
          },
          {
            step: 2,
            title: 'Contingency Analysis',
            description: 'Understand all contingencies and their deadlines',
            action: 'Make note of all important dates and requirements',
            duration: '1 hour'
          },
          {
            step: 3,
            title: 'Legal Consultation',
            description: 'Consult with real estate attorney',
            action: 'Schedule meeting to discuss contract terms',
            duration: '1-2 hours'
          },
          {
            step: 4,
            title: 'Request Modifications',
            description: 'Propose any necessary changes to protect your interests',
            action: 'Work with attorney to draft amendment requests',
            duration: '1-2 hours'
          }
        ],
        contacts: [
          {
            name: 'Real Estate Attorney',
            role: 'Legal Counsel',
            when: 'For contract review and legal advice'
          },
          {
            name: 'Real Estate Agent',
            role: 'Transaction Coordinator',
            when: 'For general questions and coordination'
          }
        ],
        tips: [
          'Don\'t sign anything you don\'t understand',
          'Pay special attention to contingency deadlines',
          'Ensure all verbal agreements are in writing',
          'Understand your right to withdraw under contingencies'
        ],
        timeline: '2-3 business days for thorough review'
      }
    },
    {
      id: 'task-attorney-selection',
      title: 'Hire Real Estate Attorney',
      description: 'Select and retain a qualified real estate attorney to represent your interests.',
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1-2 days',
      assignedTo: 'Buyer'
    },

    // Phase 4: Due Diligence
    {
      id: 'task-home-inspection',
      title: 'Schedule Home Inspection',
      description: 'Arrange for a professional home inspection to identify any potential issues.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      estimatedTime: '3-4 hours',
      linkedPage: 'inspections',
      actionLabel: 'Schedule Inspection',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'A professional home inspection is crucial for identifying potential problems before you buy.',
        steps: [
          {
            step: 1,
            title: 'Find Qualified Inspector',
            description: 'Research and select a licensed home inspector',
            action: 'Get recommendations and verify credentials',
            duration: '2-3 hours'
          },
          {
            step: 2,
            title: 'Schedule Inspection',
            description: 'Book inspection within contingency period',
            action: 'Coordinate with seller and inspector',
            duration: '30 minutes'
          },
          {
            step: 3,
            title: 'Attend Inspection',
            description: 'Be present during the inspection',
            action: 'Ask questions and take notes',
            duration: '3-4 hours',
            important: true
          },
          {
            step: 4,
            title: 'Review Report',
            description: 'Carefully review the detailed inspection report',
            action: 'Identify any major issues or safety concerns',
            duration: '1-2 hours'
          },
          {
            step: 5,
            title: 'Negotiate Repairs',
            description: 'Request repairs or credits for significant issues',
            action: 'Work with agent to submit repair requests',
            duration: '1-2 days'
          }
        ],
        requiredDocuments: [
          'Copy of purchase contract',
          'Property disclosure forms',
          'Any previous inspection reports'
        ],
        tips: [
          'Always attend the inspection in person',
          'Don\'t expect perfection - focus on major issues',
          'Get estimates for significant repairs',
          'Understand what\'s included vs excluded in inspection'
        ],
        timeline: 'Must be completed within inspection contingency period',
        cost: '$300-$600 depending on property size'
      }
    },
    {
      id: 'task-mortgage-application',
      title: 'Submit Formal Mortgage Application',
      description: 'Complete the full mortgage application with your chosen lender.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      estimatedTime: '1-2 days',
      linkedPage: 'financing',
      actionLabel: 'Apply for Mortgage',
      assignedTo: 'Buyer'
    },
    {
      id: 'task-appraisal',
      title: 'Property Appraisal',
      description: 'Lender will order an appraisal to confirm the property value.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1-2 weeks',
      assignedTo: 'Lender'
    },
    {
      id: 'task-title-search',
      title: 'Title Search & Insurance',
      description: 'Verify clear title and obtain title insurance policy.',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1-2 weeks',
      linkedPage: 'legal',
      actionLabel: 'Review Title',
      assignedTo: 'Title Company'
    },

    // Phase 5: Pre-Closing
    {
      id: 'task-homeowners-insurance',
      title: 'Secure Homeowners Insurance',
      description: 'Obtain homeowners insurance policy required by lender.',
      category: 'pre-closing',
      subcategory: 'insurance',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1-2 weeks',
      linkedPage: 'insurance',
      actionLabel: 'Get Insurance Quotes',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Homeowners insurance is required by your lender and protects your investment.',
        steps: [
          {
            step: 1,
            title: 'Determine Coverage Needs',
            description: 'Calculate appropriate coverage amounts',
            action: 'Review property value and replacement cost',
            duration: '1 hour'
          },
          {
            step: 2,
            title: 'Get Multiple Quotes',
            description: 'Shop around with different insurance companies',
            action: 'Contact at least 3 insurers for quotes',
            duration: '2-3 hours'
          },
          {
            step: 3,
            title: 'Compare Policies',
            description: 'Review coverage options and deductibles',
            action: 'Compare coverage types, limits, and costs',
            duration: '1-2 hours'
          },
          {
            step: 4,
            title: 'Purchase Policy',
            description: 'Buy policy and provide proof to lender',
            action: 'Complete application and pay premium',
            duration: '1 hour'
          }
        ],
        tips: [
          'Bundle with auto insurance for potential discounts',
          'Consider replacement cost vs actual cash value',
          'Review coverage annually and adjust as needed',
          'Understand what\'s covered and what requires additional coverage'
        ],
        timeline: 'Must be in place before closing',
        cost: 'Typically $800-$2,000 annually'
      }
    },
    {
      id: 'task-final-walkthrough',
      title: 'Final Walk-through',
      description: 'Conduct final inspection of property before closing.',
      category: 'pre-closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '1-2 hours',
      assignedTo: 'Buyer & Agent'
    },
    {
      id: 'task-closing-review',
      title: 'Review Closing Documents',
      description: 'Review all closing documents and settlement statement before closing day.',
      category: 'pre-closing',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '2-3 hours',
      linkedPage: 'legal',
      actionLabel: 'Review Documents',
      assignedTo: 'Attorney'
    },

    // Phase 6: Closing
    {
      id: 'task-closing-funds',
      title: 'Prepare Closing Funds',
      description: 'Arrange for certified funds needed at closing.',
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Buyer'
    },
    {
      id: 'task-closing-meeting',
      title: 'Attend Closing',
      description: 'Sign all documents and complete the property purchase.',
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '2-3 hours',
      assignedTo: 'All Parties'
    },

    // Phase 7: Post-Closing
    {
      id: 'task-utilities-transfer',
      title: 'Transfer Utilities',
      description: 'Set up or transfer utilities to your name.',
      category: 'post-closing',
      priority: 'medium',
      status: 'upcoming',
      estimatedTime: '2-3 hours',
      assignedTo: 'Buyer'
    },
    {
      id: 'task-change-address',
      title: 'Change Address',
      description: 'Update your address with banks, employers, and government agencies.',
      category: 'post-closing',
      priority: 'medium',
      status: 'upcoming',
      estimatedTime: '2-3 hours',
      assignedTo: 'Buyer'
    },
    {
      id: 'task-home-maintenance',
      title: 'Set Up Home Maintenance Schedule',
      description: 'Create a maintenance schedule to protect your investment.',
      category: 'post-closing',
      priority: 'low',
      status: 'upcoming',
      estimatedTime: '1-2 hours',
      assignedTo: 'Buyer'
    }
  ];
};

// Generate organized task phases for better user experience
const generateRealEstateTaskPhases = (tasks: Task[], propertyData: PropertyData | null): TaskPhase[] => {
  const phases: TaskPhase[] = [
    {
      id: 'phase-search',
      title: 'Search & Preparation',
      description: 'Get pre-approved and start your property search',
      status: 'active',
      order: 1,
      estimatedDuration: '2-4 weeks',
      tasks: tasks.filter(t => t.category === 'search'),
      keyMilestones: ['Mortgage pre-approval', 'Agent selection', 'Property identification']
    },
    {
      id: 'phase-offer',
      title: 'Offer & Negotiation',
      description: 'Make an offer and negotiate terms',
      status: 'upcoming',
      order: 2,
      estimatedDuration: '1-2 weeks',
      tasks: tasks.filter(t => t.category === 'offer'),
      keyMilestones: ['Market analysis', 'Offer submission', 'Contract acceptance']
    },
    {
      id: 'phase-contract',
      title: 'Contract & Legal Review',
      description: 'Review and finalize the purchase agreement',
      status: 'upcoming',
      order: 3,
      estimatedDuration: '3-5 days',
      tasks: tasks.filter(t => t.category === 'contract'),
      keyMilestones: ['Attorney selection', 'Contract review', 'Legal approval']
    },
    {
      id: 'phase-diligence',
      title: 'Due Diligence',
      description: 'Inspect the property and secure financing',
      status: 'upcoming',
      order: 4,
      estimatedDuration: '2-3 weeks',
      tasks: tasks.filter(t => t.category === 'diligence'),
      keyMilestones: ['Home inspection', 'Mortgage approval', 'Title search']
    },
    {
      id: 'phase-pre-closing',
      title: 'Pre-Closing Preparation',
      description: 'Final preparations before closing day',
      status: 'upcoming',
      order: 5,
      estimatedDuration: '1-2 weeks',
      tasks: tasks.filter(t => t.category === 'pre-closing'),
      keyMilestones: ['Insurance secured', 'Final walkthrough', 'Document review']
    },
    {
      id: 'phase-closing',
      title: 'Closing',
      description: 'Complete the purchase transaction',
      status: 'upcoming',
      order: 6,
      estimatedDuration: '1 day',
      tasks: tasks.filter(t => t.category === 'closing'),
      keyMilestones: ['Funds preparation', 'Document signing', 'Key transfer']
    },
    {
      id: 'phase-post-closing',
      title: 'Post-Closing',
      description: 'Complete move-in tasks and set up your new home',
      status: 'upcoming',
      order: 7,
      estimatedDuration: '2-4 weeks',
      tasks: tasks.filter(t => t.category === 'post-closing'),
      keyMilestones: ['Utilities setup', 'Address changes', 'Home maintenance']
    }
  ];

  // Update phase statuses based on task completion
  phases.forEach(phase => {
    const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
    const totalTasks = phase.tasks.length;

    if (completedTasks === totalTasks && totalTasks > 0) {
      phase.status = 'completed';
    } else if (phase.tasks.some(t => ['active', 'in-progress'].includes(t.status))) {
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
  const { updateUserProfile, isGuestMode } = useAuth();
  const persistTimerRef = useRef<number | null>(null);

  // Helper: load saved tasks (localStorage and user profile preferences)
  const loadSavedTasks = (): Task[] => {
    try {
      // Try user profile first
      const prefTasks = (userProfile as any)?.preferences?.checklistTasks as Task[] | undefined;
      if (prefTasks && Array.isArray(prefTasks) && prefTasks.length > 0) {
        return prefTasks;
      }
      // Fallback to localStorage
      const raw = localStorage.getItem('handoff-checklist-tasks');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as Task[];
      }
    } catch {}
    return [];
  };

  // Merge saved tasks onto generated baseline (preserve status/dueDate/custom)
  const mergeTasks = (base: Task[], saved: Task[]): Task[] => {
    const savedById = new Map<string, Task>();
    saved.forEach(t => savedById.set(t.id, t));
    const merged: Task[] = base.map(bt => {
      const sv = savedById.get(bt.id);
      if (!sv) return bt;
      return {
        ...bt,
        status: sv.status ?? bt.status,
        dueDate: sv.dueDate ?? bt.dueDate,
        completedDate: sv.completedDate ?? bt.completedDate,
        assignedTo: sv.assignedTo ?? bt.assignedTo,
        notes: sv.notes ?? bt.notes,
      };
    });
    // include any user-customized tasks that don't exist in base
    saved.forEach(sv => {
      if (!merged.find(t => t.id === sv.id) && sv.userCustomized) {
        merged.push(sv);
      }
    });
    return merged;
  };

  // Initialize tasks based on property data
  useEffect(() => {
    const propertyData = getPropertyData();
    const generatedTasks = generateRealEstateTransactionTasks(propertyData || {} as PropertyData);
    const saved = loadSavedTasks();
    const effectiveTasks = saved.length > 0 ? mergeTasks(generatedTasks, saved) : generatedTasks;
    const phases = generateRealEstateTaskPhases(effectiveTasks, propertyData);

    setTasks(effectiveTasks);
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

  // Persist tasks whenever they change (debounced)
  useEffect(() => {
    if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
    persistTimerRef.current = window.setTimeout(async () => {
      try {
        localStorage.setItem('handoff-checklist-tasks', JSON.stringify(tasks));
      } catch {}
      try {
        if (userProfile && !isGuestMode && typeof updateUserProfile === 'function') {
          const currentPrefs = (userProfile as any)?.preferences || {};
          await updateUserProfile({ preferences: { ...currentPrefs, checklistTasks: tasks } as any });
        }
      } catch (e) {
        // non-fatal
        console.warn('Checklist persistence failed:', e);
      }
    }, 1500) as unknown as number;

    return () => {
      if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
    };
  }, [tasks, userProfile, isGuestMode, updateUserProfile]);

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
