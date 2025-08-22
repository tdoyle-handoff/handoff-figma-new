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

// Enhanced task generation based on real estate transaction workflow
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

  // SEARCH PHASE
  tasks.push({
    id: 'search-questionnaire',
    title: 'Complete Property Questionnaire',
    description: 'Define your home preferences, must-have features, and budget requirements',
    category: 'search',
    subcategory: 'general',
    priority: 'high',
    status: 'completed',
    completedDate: formatDate(today),
    estimatedTime: '30-45 minutes',
    assignedTo: 'You',
    linkedPage: 'property',
    actionLabel: 'View Questionnaire',
    propertySpecific: true
  });

  // Pre-approval
  tasks.push({
    id: 'search-preapproval',
    title: 'Get Mortgage Pre-Approval',
    description: `Obtain pre-approval for ${propertyData.mortgageType || 'conventional'} mortgage up to your target amount`,
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

  if (underContract) {
    // LEGAL TASKS
    tasks.push({
      id: 'offer-select-lawyer',
      title: 'Select Real Estate Attorney',
      description: 'Choose and retain qualified real estate attorney for closing',
      category: 'offer',
      subcategory: 'legal',
      priority: 'high',
      status: propertyData.hasAttorney ? 'completed' : 'active',
      dueDate: propertyData.hasAttorney ? undefined : getDateFromNow(3),
      completedDate: propertyData.hasAttorney ? getDateFromNow(-10) : undefined,
      estimatedTime: '2-3 hours',
      assignedTo: 'You',
      linkedPage: 'legal',
      actionLabel: 'Find Attorney',
      propertySpecific: true,
      instructions: {
        overview: 'A qualified real estate attorney will protect your interests throughout the transaction, review contracts, handle title issues, and ensure a smooth closing.',
        steps: [
          {
            step: 1,
            title: 'Get Referrals',
            description: 'Ask your real estate agent, lender, or friends for attorney recommendations',
            action: 'Contact your agent for a list of recommended attorneys in your area',
            duration: '30 minutes'
          },
          {
            step: 2,
            title: 'Research Candidates',
            description: 'Look up each attorney\'s credentials, experience, and reviews online',
            action: 'Check state bar website, Google reviews, and Better Business Bureau',
            duration: '1 hour'
          },
          {
            step: 3,
            title: 'Interview Attorneys',
            description: 'Call 2-3 attorneys to discuss your transaction and ask about fees',
            action: 'Schedule brief consultations to assess communication style and expertise',
            duration: '1-2 hours',
            important: true
          },
          {
            step: 4,
            title: 'Make Your Selection',
            description: 'Choose an attorney and sign retainer agreement',
            action: 'Review and sign the engagement letter, pay any required retainer',
            duration: '30 minutes'
          }
        ],
        requiredDocuments: [
          'Purchase agreement (to discuss with attorney)',
          'Property address and details',
          'Timeline and closing date'
        ],
        contacts: [
          {
            name: 'Your Real Estate Agent',
            role: 'Referral Source',
            when: 'For initial recommendations'
          }
        ],
        tips: [
          'Choose an attorney experienced in your local area',
          'Ask about flat fees vs. hourly rates for closing services',
          'Ensure they can meet your closing timeline',
          'Verify they carry professional liability insurance',
          'Ask about their communication preferences and response time'
        ],
        nextSteps: [
          'Provide attorney with purchase agreement once signed',
          'Schedule regular check-ins during the transaction',
          'Attorney will order title search and review all documents'
        ],
        timeline: 'Complete within 3 days of offer acceptance',
        cost: '$800-$2,000 for closing services',
        whatToExpect: 'Initial consultation (often free), review of retainer agreement, discussion of services included, and establishment of communication protocols.'
      }
    });

    // FINANCING TASKS
    tasks.push({
      id: 'diligence-mortgage-application',
      title: 'Submit Full Mortgage Application',
      description: 'Complete formal mortgage application with financial documents',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(daysUntilClosing > 25 ? 18 : Math.max(2, daysUntilClosing - 10)),
      estimatedTime: '1-2 days',
      assignedTo: 'You & Lender',
      linkedPage: 'financing',
      actionLabel: 'Submit Application',
      propertySpecific: true,
      instructions: {
        overview: 'The formal mortgage application is your official request for a loan. All information must be accurate and complete to avoid delays in underwriting.',
        steps: [
          {
            step: 1,
            title: 'Gather Required Documents',
            description: 'Collect all financial documents needed for the application',
            action: 'Use the lender\'s document checklist to gather all required paperwork',
            duration: '2-3 hours',
            important: true
          },
          {
            step: 2,
            title: 'Complete Application Form',
            description: 'Fill out the Uniform Residential Loan Application (Form 1003)',
            action: 'Work with your loan officer to complete all sections accurately',
            duration: '1-2 hours'
          },
          {
            step: 3,
            title: 'Review Before Signing',
            description: 'Carefully review all information for accuracy',
            action: 'Double-check all names, addresses, employment, and financial information',
            duration: '30 minutes',
            important: true
          },
          {
            step: 4,
            title: 'Submit Application',
            description: 'Sign and submit application with all supporting documents',
            action: 'Submit via lender\'s preferred method (online portal, email, or in-person)',
            duration: '30 minutes'
          },
          {
            step: 5,
            title: 'Pay Application Fee',
            description: 'Pay required application and credit report fees',
            action: 'Submit payment as instructed by lender (typically $300-$500)',
            duration: '15 minutes'
          }
        ],
        requiredDocuments: [
          'Photo ID (driver\'s license or passport)',
          'Social Security card',
          'Pay stubs (last 2-3)',
          'W-2 forms (last 2 years)',
          'Tax returns (last 2 years)',
          'Bank statements (last 2 months)',
          'Investment account statements',
          'Employment verification letter',
          'Purchase agreement',
          'Proof of down payment source'
        ],
        contacts: [
          {
            name: 'Your Loan Officer',
            role: 'Primary Contact',
            when: 'For application assistance and questions'
          },
          {
            name: 'Loan Processor',
            role: 'Document Review',
            when: 'For document requirements and status updates'
          }
        ],
        tips: [
          'Be completely honest and accurate - discrepancies can delay approval',
          'Don\'t apply for new credit during the loan process',
          'Keep copies of everything you submit',
          'Respond quickly to any lender requests for additional information',
          'Don\'t make large deposits without explaining the source',
          'Keep your employment stable - avoid job changes if possible'
        ],
        nextSteps: [
          'Lender will order appraisal',
          'Underwriter will review your application',
          'You may receive requests for additional documentation',
          'Loan processor will update you on status',
          'Expect final approval 2-3 weeks after submission'
        ],
        timeline: 'Complete within 5 days of contract acceptance',
        cost: 'Application fee: $300-$500, Appraisal fee: $400-$600',
        whatToExpect: 'Initial review within 24-48 hours, possible requests for additional documents, and regular status updates from your loan processor.'
      }
    });

    // INSPECTION TASKS
    tasks.push({
      id: 'diligence-schedule-inspection',
      title: `Schedule Home Inspection for ${propertyData.address || 'Property'}`,
      description: 'Book professional home inspection within contingency period',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'active',
      dueDate: getDateFromClosing(daysUntilClosing > 15 ? 10 : 3),
      estimatedTime: '3-4 hours',
      assignedTo: 'You & Inspector',
      linkedPage: 'inspections',
      actionLabel: 'Schedule Inspection',
      propertySpecific: true,
      instructions: {
        overview: 'A professional home inspection is crucial for identifying potential issues with the property before you finalize the purchase. This protects your investment and gives you negotiating power.',
        steps: [
          {
            step: 1,
            title: 'Find Qualified Inspectors',
            description: 'Research and contact 2-3 licensed home inspectors',
            action: 'Get referrals from your agent, check online reviews, and verify licenses',
            duration: '1 hour'
          },
          {
            step: 2,
            title: 'Compare Inspectors',
            description: 'Ask about experience, certifications, and what\'s included',
            action: 'Compare quotes, ask about report turnaround time and follow-up policies',
            duration: '30 minutes',
            important: true
          },
          {
            step: 3,
            title: 'Schedule Inspection',
            description: 'Book inspection within your contingency period',
            action: 'Schedule for a date that allows time to review results and negotiate',
            duration: '15 minutes'
          },
          {
            step: 4,
            title: 'Prepare for Inspection',
            description: 'Ensure utilities are on and property is accessible',
            action: 'Coordinate with seller\'s agent to ensure power, water, and gas are on',
            duration: '30 minutes'
          },
          {
            step: 5,
            title: 'Attend Inspection',
            description: 'Be present during the inspection to ask questions',
            action: 'Follow inspector, take notes, ask about any concerns you observe',
            duration: '3-4 hours',
            important: true
          }
        ],
        requiredDocuments: [
          'Purchase agreement (to verify inspection contingency period)',
          'Property address and access information',
          'Seller\'s disclosure statement',
          'Any previous inspection reports (if available)'
        ],
        contacts: [
          {
            name: 'Your Real Estate Agent',
            role: 'Coordinator',
            when: 'For inspector referrals and scheduling coordination'
          },
          {
            name: 'Seller\'s Agent',
            role: 'Property Access',
            when: 'To arrange property access and utility confirmation'
          },
          {
            name: 'Home Inspector',
            role: 'Primary Service Provider',
            when: 'For scheduling and conducting the inspection'
          }
        ],
        tips: [
          'Schedule as early as possible within your contingency period',
          'Choose an inspector who belongs to professional organizations (ASHI, InterNACHI)',
          'Ask if the inspector carries errors & omissions insurance',
          'Verify the inspector will test all major systems',
          'Plan to attend the entire inspection - don\'t just rely on the report',
          'Bring a flashlight and wear appropriate clothing',
          'Take photos of any issues the inspector identifies'
        ],
        nextSteps: [
          'Receive detailed inspection report within 24-48 hours',
          'Review report with your real estate agent',
          'Decide whether to request repairs, credits, or walk away',
          'Submit formal response to seller within contingency period',
          'Consider additional specialized inspections if issues are found'
        ],
        timeline: 'Schedule within 3-5 days of contract acceptance, complete within contingency period',
        cost: '$400-$800 depending on property size and location',
        whatToExpect: 'Inspector will examine all accessible areas, test major systems, and provide a detailed report with photos. Inspection typically takes 3-4 hours for an average home.'
      }
    });

    // INSURANCE TASKS
    tasks.push({
      id: 'pre-closing-find-insurance',
      title: 'Find Homeowners Insurance Coverage',
      description: `Obtain homeowners insurance quotes for ${propertyData.address || 'the property'}`,
      category: 'pre-closing',
      subcategory: 'insurance',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(daysUntilClosing > 15 ? 10 : Math.max(3, daysUntilClosing - 5)),
      estimatedTime: '2-3 hours',
      assignedTo: 'You & Insurance Agent',
      linkedPage: 'insurance',
      actionLabel: 'Get Quotes',
      propertySpecific: true,
      instructions: {
        overview: 'Homeowners insurance is required by your lender and protects your investment. Shop around for the best coverage and rates before closing.',
        steps: [
          {
            step: 1,
            title: 'Gather Property Information',
            description: 'Collect detailed information about the property for quotes',
            action: 'Compile property details, square footage, construction type, and features',
            duration: '30 minutes'
          },
          {
            step: 2,
            title: 'Research Insurance Companies',
            description: 'Identify reputable insurance companies and agents',
            action: 'Get referrals and check financial ratings (A.M. Best, Standard & Poor\'s)',
            duration: '45 minutes'
          },
          {
            step: 3,
            title: 'Request Multiple Quotes',
            description: 'Contact 3-5 insurance companies for quotes',
            action: 'Provide same information to each company for accurate comparison',
            duration: '1-2 hours',
            important: true
          },
          {
            step: 4,
            title: 'Compare Coverage Options',
            description: 'Review coverage types, limits, and deductibles',
            action: 'Compare dwelling coverage, personal property, liability, and additional coverages',
            duration: '1 hour'
          },
          {
            step: 5,
            title: 'Select Best Policy',
            description: 'Choose policy that provides best value and coverage',
            action: 'Consider price, coverage, deductibles, and company reputation',
            duration: '30 minutes',
            important: true
          }
        ],
        requiredDocuments: [
          'Property address and legal description',
          'Property details (square footage, age, construction type)',
          'Home inspection report (if available)',
          'Security system information',
          'Previous insurance claims history'
        ],
        contacts: [
          {
            name: 'Insurance Agents',
            role: 'Quote Providers',
            when: 'For obtaining quotes and coverage options'
          },
          {
            name: 'Your Lender',
            role: 'Requirements Specialist',
            when: 'To confirm minimum coverage requirements'
          },
          {
            name: 'Current Insurance Agent',
            role: 'Existing Relationship',
            when: 'For potential bundle discounts and quotes'
          }
        ],
        tips: [
          'Shop around - prices can vary significantly',
          'Consider bundling with auto insurance for discounts',
          'Ask about discounts (security systems, smoke detectors, etc.)',
          'Understand the difference between replacement cost and actual cash value',
          'Consider umbrella liability coverage for additional protection',
          'Review and understand all policy exclusions',
          'Ensure coverage meets lender requirements',
          'Factor insurance costs into your monthly housing budget'
        ],
        nextSteps: [
          'Purchase selected policy before closing',
          'Provide insurance binder to lender',
          'Set up automatic payments if desired',
          'Schedule annual policy reviews',
          'Update policy for any home improvements'
        ],
        timeline: 'Start shopping 2-3 weeks before closing, finalize 1 week before',
        cost: '$800-$2,000+ annually depending on property value and location',
        whatToExpect: 'Multiple agent consultations, detailed property questions, and comprehensive coverage proposals with various options and pricing.'
      }
    });

    // FINAL WALKTHROUGH
    tasks.push({
      id: 'pre-closing-walkthrough-schedule',
      title: 'Schedule Final Walkthrough',
      description: `Schedule final property inspection 24-48 hours before closing`,
      category: 'pre-closing',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(3),
      estimatedTime: '30 minutes to schedule',
      assignedTo: propertyData.realtorName || 'Your Agent',
      linkedPage: 'inspections',
      actionLabel: 'Schedule Walkthrough',
      propertySpecific: true,
      instructions: {
        overview: 'The final walkthrough is your last chance to verify the property is in the agreed-upon condition before closing. This is not a second inspection, but a verification that nothing has changed.',
        steps: [
          {
            step: 1,
            title: 'Schedule Walkthrough',
            description: 'Coordinate walkthrough 24-48 hours before closing',
            action: 'Work with agents to schedule convenient time for all parties',
            duration: '15 minutes'
          },
          {
            step: 2,
            title: 'Prepare Walkthrough Checklist',
            description: 'Create systematic checklist for property review',
            action: 'Include all rooms, systems, and agreed-upon repairs',
            duration: '30 minutes'
          },
          {
            step: 3,
            title: 'Conduct Walkthrough',
            description: 'Systematically inspect entire property',
            action: 'Check all rooms, test systems, verify repairs completed',
            duration: '1-2 hours',
            important: true
          },
          {
            step: 4,
            title: 'Test All Systems',
            description: 'Verify electrical, plumbing, HVAC, and appliances work',
            action: 'Turn on lights, run water, test heating/cooling, check appliances',
            duration: '30 minutes'
          },
          {
            step: 5,
            title: 'Document Any Issues',
            description: 'Note any problems or incomplete items',
            action: 'Take photos and create detailed list of any concerns',
            duration: '15 minutes'
          },
          {
            step: 6,
            title: 'Address Issues Before Closing',
            description: 'Resolve any problems found during walkthrough',
            action: 'Negotiate solutions with seller before proceeding to closing',
            duration: 'Variable'
          }
        ],
        requiredDocuments: [
          'Purchase agreement with repair addendum',
          'Home inspection report for reference',
          'Walkthrough checklist',
          'Camera for documentation'
        ],
        contacts: [
          {
            name: 'Your Real Estate Agent',
            role: 'Walkthrough Coordinator',
            when: 'For scheduling and conducting walkthrough'
          },
          {
            name: 'Seller\'s Agent',
            role: 'Property Access',
            when: 'To coordinate access and address any issues'
          }
        ],
        tips: [
          'Bring a copy of your original inspection report',
          'Test every light switch, faucet, and appliance',
          'Check that agreed-upon repairs are complete and satisfactory',
          'Verify all personal property remains that was included in sale',
          'Ensure no new damage has occurred since inspection',
          'Don\'t rush - take your time to be thorough',
          'Bring a flashlight to check dark areas',
          'Take photos of any issues for documentation'
        ],
        nextSteps: [
          'If everything is satisfactory, proceed to closing',
          'If issues are found, negotiate resolution before closing',
          'Consider holding funds in escrow for unresolved items',
          'Document all agreements in writing',
          'Inform your attorney of any last-minute issues'
        ],
        timeline: 'Schedule 2-3 days before closing, conduct 24-48 hours before',
        cost: 'No cost (part of transaction process)',
        whatToExpect: 'Thorough walk-through of entire property to verify condition and completion of any agreed-upon repairs or conditions.'
      }
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
      id: 'phase-diligence',
      title: 'Due Diligence',
      description: 'Complete financing, legal, and inspection requirements',
      status: underContract ? 'active' : 'upcoming',
      tasks: [],
      order: 3,
      estimatedDuration: '3-6 weeks',
      keyMilestones: ['Financing approved', 'Title clear', 'Inspections complete']
    },
    {
      id: 'phase-pre-closing',
      title: 'Pre-Closing Preparation',
      description: 'Final walkthrough and insurance arrangements',
      status: 'upcoming',
      tasks: [],
      order: 4,
      estimatedDuration: '1 week',
      keyMilestones: ['Insurance secured', 'Final walkthrough', 'Funds ready']
    },
    {
      id: 'phase-closing',
      title: 'Closing Day',
      description: 'Complete the purchase and receive keys',
      status: 'upcoming',
      tasks: [],
      order: 5,
      estimatedDuration: '1 day',
      keyMilestones: ['Documents signed', 'Funds transferred', 'Keys received']
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