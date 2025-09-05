import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { UserProfile } from '../utils/supabase/client';
import { PropertyData } from './PropertyContext';
import { useAuth } from '../hooks/useAuth';
import { applyScenarios } from '../utils/scenarioEngine';

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
  dueDateLocked?: boolean;
  assignedTo?: string;
  notes?: string;
  contacts?: TaskContact[];
  documents?: string[];
  customFields?: Record<string, any>;
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

export interface ScheduleAnchors {
  offerAcceptedDate?: string; // ISO yyyy-mm-dd
  closingDate?: string;       // ISO yyyy-mm-dd
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
  // Scheduling
  scheduleAnchors: ScheduleAnchors;
  setScheduleAnchors: (anchors: Partial<ScheduleAnchors>) => void;
  recomputeDueDates: () => void;
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

// Helpers: load and save schedule anchors
const SCHEDULE_ANCHORS_KEY = 'handoff-schedule-anchors';
const loadScheduleAnchors = (userProfile?: UserProfile | null): ScheduleAnchors => {
  try {
    const fromProfile = (userProfile as any)?.preferences?.scheduleAnchors as ScheduleAnchors | undefined;
    const raw = localStorage.getItem(SCHEDULE_ANCHORS_KEY);
    const fromLocal = raw ? (JSON.parse(raw) as ScheduleAnchors) : undefined;
    return { ...(fromLocal || {}), ...(fromProfile || {}) };
  } catch {
    return {};
  }
};

const saveScheduleAnchors = async (
  anchors: ScheduleAnchors,
  userProfile: UserProfile | null,
  isGuestMode: boolean,
  updateUserProfile?: (updates: Partial<UserProfile>) => Promise<UserProfile | null>
) => {
  try {
    localStorage.setItem(SCHEDULE_ANCHORS_KEY, JSON.stringify(anchors));
  } catch {}
  try {
    if (userProfile && !isGuestMode && typeof updateUserProfile === 'function') {
      const currentPrefs = (userProfile as any)?.preferences || {};
      await updateUserProfile({ preferences: { ...currentPrefs, scheduleAnchors: anchors } as any });
    }
  } catch (e) {
    console.warn('Schedule anchors persistence failed:', e);
  }
};

// Task generation function - generates comprehensive real estate transaction checklist
const generateRealEstateTransactionTasks = (propertyData: PropertyData): Task[] => {
  const isUnderContract = isHouseUnderContract();

  const tasks: Task[] = [
    // Phase 1: Search & Research
    {
      id: 'task-buy-box-template',
      title: 'Complete Property Questionnaire',
      description: 'Fill out the property questionnaire to define price range, areas, property type, must-haves, and constraints. This powers Home Search and tracking.',
      category: 'search',
      subcategory: 'general',
      priority: 'medium',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: '1-2 hours',
      assignedTo: 'Buyer',
      linkedPage: 'property-search',
      actionLabel: 'Open Home Search'
    },
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
      id: 'task-mls-listing-pdf',
      title: 'Collect MLS Listing PDF',
      description: 'Download and store the official MLS listing PDF for the subject property.',
      category: 'offer',
      priority: 'medium',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '30 minutes',
      assignedTo: 'Agent',
      dependencies: ['task-property-search']
    },
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
      id: 'task-offer-acceptance-signing',
      title: 'Offer Acceptance & Signing',
      description: 'Accept the offer and sign the contract; perform AI-assisted markup review as needed.',
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      estimatedTime: '1 day',
      assignedTo: 'Buyer & Seller',
      dependencies: ['task-submit-offer']
    },
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
    {
      id: 'task-contract-riders',
      title: 'Add Contract Riders',
      description: 'Identify, draft, and attach required riders to the contract.',
      category: 'contract',
      subcategory: 'legal',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Attorney',
      dependencies: ['task-offer-acceptance-signing']
    },
    {
      id: 'task-send-lawyer-signed-contract',
      title: 'Send Signed Contract to Attorney',
      description: 'Provide fully executed contract documents to your attorney.',
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-attorney-selection', 'task-offer-acceptance-signing']
    },
    {
      id: 'task-earnest-money-deposit',
      title: 'Submit Earnest Money Deposit',
      description: 'Produce deposit according to the contract and wire or deliver check to escrow.',
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Buyer',
      dependencies: ['task-offer-acceptance-signing']
    },

    // Phase 4: Due Diligence
    {
      id: 'task-shop-inspectors',
      title: 'Shop for Inspectors',
      description: 'Identify and vet general and specialized inspectors.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-offer-acceptance-signing']
    },
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
      dependencies: ['task-shop-inspectors'],
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
      id: 'task-schedule-specialized-inspections',
      title: 'Schedule Specialized Inspections',
      description: 'Schedule pest, septic, lead, radon, roof, structural, well water, or other specialty inspections as needed.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-home-inspection']
    },
    {
      id: 'task-review-inspection-results',
      title: 'Review Inspection Results',
      description: 'Read inspection reports and identify issues to address.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-home-inspection']
    },
    {
      id: 'task-submit-repair-requests',
      title: 'Submit Repair Requests / Begin Negotiations',
      description: 'Compile items to address and submit to the seller to begin negotiations.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-review-inspection-results']
    },
    {
      id: 'task-finalize-inspection-remedies',
      title: 'Finalize Inspection Remedies & Timelines',
      description: 'Finalize extensions, riders, and timelines for agreed inspection remedies.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-submit-repair-requests']
    },
    {
      id: 'task-mortgage-application',
      title: 'Submit Mortgage Application & Financials',
      description: 'Complete the full mortgage application with your chosen lender.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      estimatedTime: '1-2 days',
      linkedPage: 'financing',
      actionLabel: 'Apply for Mortgage',
      assignedTo: 'Buyer',
      dependencies: ['task-submit-offer', 'task-offer-acceptance-signing']
    },
    {
      id: 'task-send-offer-to-lender',
      title: 'Send Accepted Offer to Lender',
      description: 'Provide accepted offer and contract to your mortgage lender.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      assignedTo: 'Buyer',
      dependencies: ['task-offer-acceptance-signing']
    },
    {
      id: 'task-shop-mortgage-terms',
      title: 'Shop for Mortgage Terms',
      description: 'Compare rates, points, and terms from multiple lenders.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'medium',
      status: isUnderContract ? 'active' : 'pending',
      assignedTo: 'Buyer',
      dependencies: ['task-mortgage-preapproval']
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
      assignedTo: 'Lender',
      dependencies: ['task-mortgage-application']
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
      assignedTo: 'Title Company',
      dependencies: ['task-offer-acceptance-signing']
    },

    // Phase 5: Pre-Closing
    {
      id: 'task-insurance-get-bids',
      title: 'Get Insurance Bids & Coverage Options',
      description: 'Gather quotes for home, flood, wind, hurricane, liability, PMI as applicable from brokers or direct.',
      category: 'pre-closing',
      subcategory: 'insurance',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-offer-acceptance-signing']
    },
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
      actionLabel: 'Bind Coverage',
      assignedTo: 'Buyer',
      dependencies: ['task-insurance-get-bids'],
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
      id: 'task-schedule-final-walkthrough',
      title: 'Schedule Final Walk-through',
      description: 'Coordinate date and time for final walk-through before closing.',
      category: 'pre-closing',
      priority: 'medium',
      status: 'upcoming',
      assignedTo: 'Agent',
      dependencies: ['task-finalize-inspection-remedies']
    },
    {
      id: 'task-final-walkthrough',
      title: 'Final Walk-through (Conduct)',
      description: 'Conduct final inspection of property before closing.',
      category: 'pre-closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '1-2 hours',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-schedule-final-walkthrough']
    },
    {
      id: 'task-confirm-repairs-complete',
      title: 'Confirm Repairs Completed',
      description: 'Verify that agreed-upon repairs/remedies were completed before closing.',
      category: 'pre-closing',
      priority: 'high',
      status: 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-finalize-inspection-remedies']
    },
    {
      id: 'task-renegotiate-new-findings',
      title: 'Re-negotiate New Findings (if applicable)',
      description: 'If new issues are discovered, negotiate additional remedies or concessions.',
      category: 'pre-closing',
      priority: 'medium',
      status: 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-confirm-repairs-complete']
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
      assignedTo: 'Attorney',
      dependencies: ['task-title-search']
    },

    // Phase 6: Closing
    {
      id: 'task-escrow-wire-instructions',
      title: 'Escrow Account & Wire Instructions Prepared',
      description: 'Title/escrow company prepares wire instructions for deposit and closing funds.',
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      assignedTo: 'Title Company',
      dependencies: ['task-earnest-money-deposit']
    },
    {
      id: 'task-closing-funds',
      title: 'Prepare Closing Funds',
      description: 'Arrange for certified funds needed at closing.',
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Buyer',
      dependencies: ['task-closing-review', 'task-insurance-get-bids', 'task-homeowners-insurance']
    },
    {
      id: 'task-wire-funds',
      title: 'Wire Funds / Produce Cashier’s Check',
      description: 'On closing day, wire funds or bring a cashier’s check as required.',
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Buyer',
      dependencies: ['task-closing-funds', 'task-escrow-wire-instructions']
    },
    {
      id: 'task-closing-meeting',
      title: 'Attend Closing',
      description: 'Sign all documents and complete the property purchase.',
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '2-3 hours',
      assignedTo: 'All Parties',
      dependencies: ['task-wire-funds']
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
      id: 'task-move-in',
      title: 'Move-in',
      description: 'Plan and execute the move-in once closing is complete.',
      category: 'post-closing',
      priority: 'medium',
      status: 'upcoming',
      estimatedTime: '1-3 days',
      assignedTo: 'Buyer',
      dependencies: ['task-closing-meeting']
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

  // Scheduling rules per task (anchor + offset days). Anchor missing -> fallback to today offsets below.
  const scheduleRules: Record<string, { anchor: 'acceptance' | 'closing' | 'today'; offset: number }> = {
    'task-buy-box-template': { anchor: 'today', offset: 0 },
    'task-mortgage-preapproval': { anchor: 'today', offset: 3 },
    'task-mls-listing-pdf': { anchor: 'today', offset: 1 },
    'task-property-search': { anchor: 'today', offset: 0 },
    'task-market-analysis': { anchor: 'today', offset: 1 },
    'task-submit-offer': { anchor: 'today', offset: 2 },

    'task-offer-acceptance-signing': { anchor: 'acceptance', offset: 0 },
    'task-attorney-selection': { anchor: 'acceptance', offset: 2 },
    'task-contract-riders': { anchor: 'acceptance', offset: 3 },
    'task-send-lawyer-signed-contract': { anchor: 'acceptance', offset: 3 },
    'task-earnest-money-deposit': { anchor: 'acceptance', offset: 2 },

    'task-shop-inspectors': { anchor: 'acceptance', offset: 2 },
    'task-home-inspection': { anchor: 'acceptance', offset: 4 },
    'task-schedule-specialized-inspections': { anchor: 'acceptance', offset: 5 },
    'task-review-inspection-results': { anchor: 'acceptance', offset: 6 },
    'task-submit-repair-requests': { anchor: 'acceptance', offset: 7 },
    'task-finalize-inspection-remedies': { anchor: 'acceptance', offset: 10 },

    'task-send-offer-to-lender': { anchor: 'acceptance', offset: 1 },
    'task-shop-mortgage-terms': { anchor: 'acceptance', offset: 2 },
    'task-mortgage-application': { anchor: 'acceptance', offset: 3 },
    'task-appraisal': { anchor: 'acceptance', offset: 14 },
    'task-title-search': { anchor: 'acceptance', offset: 14 },

    'task-insurance-get-bids': { anchor: 'acceptance', offset: 7 },
    'task-homeowners-insurance': { anchor: 'acceptance', offset: 22 },

    'task-schedule-final-walkthrough': { anchor: 'closing', offset: -5 },
    'task-final-walkthrough': { anchor: 'closing', offset: -1 },
    'task-confirm-repairs-complete': { anchor: 'closing', offset: -6 },
    'task-renegotiate-new-findings': { anchor: 'closing', offset: -4 },
    'task-closing-review': { anchor: 'closing', offset: -3 },
    'task-escrow-wire-instructions': { anchor: 'closing', offset: -8 },
    'task-closing-funds': { anchor: 'closing', offset: -2 },
    'task-wire-funds': { anchor: 'closing', offset: -1 },
    'task-closing-meeting': { anchor: 'closing', offset: 0 },

    'task-utilities-transfer': { anchor: 'closing', offset: 1 },
    'task-move-in': { anchor: 'closing', offset: 2 },
    'task-change-address': { anchor: 'closing', offset: 3 },
    'task-home-maintenance': { anchor: 'closing', offset: 10 },
  };

  // Default due dates tuned to workflow (relative to today) where not already set
  const offsetDaysById: Record<string, number> = {
    'task-buy-box-template': 0,
    'task-mortgage-preapproval': 3,
    'task-mls-listing-pdf': 1,
    'task-submit-offer': 2,
    'task-offer-acceptance-signing': 5,
    'task-attorney-selection': 7,
    'task-contract-riders': 9,
    'task-send-lawyer-signed-contract': 9,
    'task-earnest-money-deposit': 10,
    'task-shop-inspectors': 10,
    'task-home-inspection': 12,
    'task-schedule-specialized-inspections': 13,
    'task-review-inspection-results': 14,
    'task-submit-repair-requests': 15,
    'task-finalize-inspection-remedies': 18,
    'task-send-offer-to-lender': 6,
    'task-shop-mortgage-terms': 7,
    'task-mortgage-application': 8,
    'task-appraisal': 20,
    'task-title-search': 20,
    'task-insurance-get-bids': 12,
    'task-homeowners-insurance': 22,
    'task-schedule-final-walkthrough': 27,
    'task-final-walkthrough': 28,
    'task-confirm-repairs-complete': 24,
    'task-renegotiate-new-findings': 25,
    'task-closing-review': 29,
    'task-escrow-wire-instructions': 23,
    'task-closing-funds': 30,
    'task-wire-funds': 31,
    'task-closing-meeting': 32,
    'task-utilities-transfer': 33,
    'task-move-in': 34,
    'task-change-address': 35,
    'task-home-maintenance': 40,
  };

  const today = new Date();
  const toISO = (d: Date) => d.toISOString().split('T')[0];

  // Apply schedule rules using available anchors; fallback to 'today' offsets
  const anchors = loadScheduleAnchors(null);
  const applyRule = (rule: { anchor: 'acceptance' | 'closing' | 'today'; offset: number }): string => {
    let base: Date | null = null;
    if (rule.anchor === 'acceptance' && anchors.offerAcceptedDate) {
      base = new Date(anchors.offerAcceptedDate as string);
    } else if (rule.anchor === 'closing' && anchors.closingDate) {
      base = new Date(anchors.closingDate as string);
    }
    if (!base) {
      base = new Date(today);
    }
    const d = new Date(base);
    d.setDate(d.getDate() + rule.offset);
    return toISO(d);
  };

  tasks.forEach((t) => {
    const rule = scheduleRules[t.id];
    if (rule) {
      t.dueDate = applyRule(rule);
      return;
    }
    if (!t.dueDate && offsetDaysById[t.id] !== undefined) {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDaysById[t.id]);
      t.dueDate = toISO(d);
    }
  });

  return tasks;
};

// Generate organized task phases for better user experience
const generateRealEstateTaskPhases = (tasks: Task[], propertyData: PropertyData | null): TaskPhase[] => {
  const phases: TaskPhase[] = [
    {
      id: 'phase-search',
      title: 'Search & Prep',
      description: 'Get pre-approved and start your property search',
      status: 'active',
      order: 1,
      estimatedDuration: '2-4 weeks',
      tasks: tasks.filter(t => t.category === 'search'),
      keyMilestones: ['Mortgage pre-approval', 'Agent selection', 'Property identification']
    },
    {
      id: 'phase-offer',
      title: 'Making an Offer',
      description: 'Make an offer and negotiate terms',
      status: 'upcoming',
      order: 2,
      estimatedDuration: '1-2 weeks',
      tasks: tasks.filter(t => t.category === 'offer'),
      keyMilestones: ['Market analysis', 'Offer submission', 'Contract acceptance']
    },
    {
      id: 'phase-contract',
      title: 'Legal Review',
      description: 'Review and finalize the purchase agreement',
      status: 'upcoming',
      order: 3,
      estimatedDuration: '3-5 days',
      tasks: tasks.filter(t => t.category === 'contract'),
      keyMilestones: ['Attorney selection', 'Contract review', 'Legal approval']
    },
    {
      id: 'phase-diligence',
      title: 'Inspections & Diligence',
      description: 'Inspect the property and secure financing',
      status: 'upcoming',
      order: 4,
      estimatedDuration: '2-3 weeks',
      tasks: tasks.filter(t => t.category === 'diligence'),
      keyMilestones: ['Home inspection', 'Mortgage approval', 'Title search']
    },
    {
      id: 'phase-pre-closing',
      title: 'Final Prep',
      description: 'Final preparations before closing day',
      status: 'upcoming',
      order: 5,
      estimatedDuration: '1-2 weeks',
      tasks: tasks.filter(t => t.category === 'pre-closing'),
      keyMilestones: ['Insurance secured', 'Final walkthrough', 'Document review']
    },
    {
      id: 'phase-closing',
      title: 'Closing Day',
      description: 'Complete the purchase transaction',
      status: 'upcoming',
      order: 6,
      estimatedDuration: '1 day',
      tasks: tasks.filter(t => t.category === 'closing'),
      keyMilestones: ['Funds preparation', 'Document signing', 'Key transfer']
    },
    {
      id: 'phase-post-closing',
      title: 'After Closing',
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
  const [scheduleAnchors, setScheduleAnchorsState] = useState<ScheduleAnchors>(() => loadScheduleAnchors(userProfile));
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
        dueDateLocked: sv.dueDateLocked ?? bt.dueDateLocked,
        completedDate: sv.completedDate ?? bt.completedDate,
        assignedTo: sv.assignedTo ?? bt.assignedTo,
        notes: sv.notes ?? bt.notes,
        contacts: (sv as any).contacts ?? (bt as any).contacts,
        documents: sv.documents ?? bt.documents,
        customFields: (sv as any).customFields ?? (bt as any).customFields,
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

  // Recompute tasks/phases applying selected scenarios, merging saved state
  const recomputeFromSources = (propertyData?: PropertyData | null, savedOverride?: Task[]) => {
    const pd = propertyData ?? getPropertyData();
    const base = generateRealEstateTransactionTasks(pd || {} as PropertyData);
    const scenarioBase = applyScenarios(base);
    const saved = savedOverride ?? loadSavedTasks();
    const effectiveTasks = saved.length > 0 ? mergeTasks(scenarioBase, saved) : scenarioBase;
    const phases = generateRealEstateTaskPhases(effectiveTasks, pd);
    setTasks(effectiveTasks);
    setTaskPhases(phases);
  };

  // Initialize tasks based on property data
  useEffect(() => {
    const propertyData = getPropertyData();
    const base = generateRealEstateTransactionTasks(propertyData || {} as PropertyData);
    const scenarioBase = applyScenarios(base);
    const saved = loadSavedTasks();
    const effectiveTasks = saved.length > 0 ? mergeTasks(scenarioBase, saved) : scenarioBase;
    const phases = generateRealEstateTaskPhases(effectiveTasks, propertyData);

    setTasks(effectiveTasks);
    setTaskPhases(phases);

    // Load/reload anchors when profile changes
    setScheduleAnchorsState(loadScheduleAnchors(userProfile));
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

  // Re-generate tasks when storage changes (e.g., scenario toggles or profile prefs)
  useEffect(() => {
    const handleStorageChange = () => {
      const propertyData = getPropertyData();
      recomputeFromSources(propertyData);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom scenariosUpdated events to recompute tasks immediately
  useEffect(() => {
    const handleScenariosUpdated = () => {
      const propertyData = getPropertyData();
      recomputeFromSources(propertyData);
    };
    window.addEventListener('scenariosUpdated', handleScenariosUpdated as EventListener);
    return () => window.removeEventListener('scenariosUpdated', handleScenariosUpdated as EventListener);
  }, []);

   const generatePersonalizedTasks = (propertyData: PropertyData) => {
    const base = generateRealEstateTransactionTasks(propertyData);
    const scenarioBase = applyScenarios(base);
    const saved = loadSavedTasks();
    const effectiveTasks = saved.length > 0 ? mergeTasks(scenarioBase, saved) : scenarioBase;
    const phases = generateRealEstateTaskPhases(effectiveTasks, propertyData);
    setTasks(effectiveTasks);
    setTaskPhases(phases);
  };

  // Recompute due dates from current anchors (non-destructive to other fields)
  const recomputeDueDates = () => {
    const propertyData = getPropertyData();
    // Recreate baseline tasks (scenario-aware) then merge existing field values back in
    const base = generateRealEstateTransactionTasks(propertyData || {} as PropertyData);
    const scenarioBase = applyScenarios(base);
    const byId: Record<string, Task> = {};
    scenarioBase.forEach((t) => { byId[t.id] = t; });
    const updated = tasks.map((t) => {
      if (t.dueDateLocked) return t; // respect manual lock
      const computed = byId[t.id]?.dueDate;
      return { ...t, dueDate: computed || t.dueDate };
    });
    setTasks(updated);
    const phases = generateRealEstateTaskPhases(updated, propertyData);
    setTaskPhases(phases);
  };

  const setScheduleAnchors = async (anchors: Partial<ScheduleAnchors>) => {
    const next = { ...scheduleAnchors, ...anchors } as ScheduleAnchors;
    setScheduleAnchorsState(next);
    await saveScheduleAnchors(next, userProfile, isGuestMode, updateUserProfile);
    recomputeDueDates();
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
    getTasksNeedingAttention,
    // Scheduling
    scheduleAnchors,
    setScheduleAnchors,
    recomputeDueDates
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
