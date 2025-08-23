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
      title: 'Shop for Best Mortgage Terms',
      description: 'CRITICAL: Compare rates from 3-5 lenders to save thousands. Even 0.25% difference = $30,000+ over loan life. Get quotes within 14-day window to minimize credit impact.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: daysUntilClosing > 30 ? 'active' : 'upcoming',
      dueDate: getDateFromClosing(25),
      estimatedTime: '4-6 hours over 3 days',
      assignedTo: 'You + Loan Officer + Mortgage Broker',
      linkedPage: 'financing',
      actionLabel: 'Compare Rates',
      propertySpecific: true,
      instructions: {
        overview: 'Shopping for mortgage terms is one of the most important financial decisions in your home purchase. Small rate differences compound to massive savings.',
        tips: [
          'TIP: Get quotes within a 14-day window to count as single credit inquiry',
          'TARGET: Compare at least 3-5 lenders including banks, credit unions, and brokers',
          'IMPACT: 0.25% rate difference = ~$50/month = $18,000 over 30 years',
          'REQUIRED: Pre-approval letter, rate lock options, closing cost estimates'
        ],
        timeline: 'Start 25-30 days before closing, complete within 1 week',
        nextSteps: ['Choose best overall offer', 'Lock rate if favorable', 'Submit formal application']
      }
    });

    tasks.push({
      id: 'diligence-financing-submit-application',
      title: 'Submit Complete Mortgage Application',
      description: 'TIME-SENSITIVE: Submit full application with ALL documents within 3 days of rate lock. Missing docs delay closing. Lender needs 15-20 business days to process.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(20),
      estimatedTime: '6-8 hours over 2 days',
      assignedTo: 'You + Loan Officer + Processor',
      linkedPage: 'financing',
      actionLabel: 'Submit Application',
      propertySpecific: true,
      instructions: {
        overview: 'The formal mortgage application starts your loan processing clock. Completeness and accuracy are critical for on-time closing.',
        tips: [
          '📦 PACKAGE COMPLETELY: Submit ALL required docs at once to avoid delays',
          'RATE LOCK: Secure your rate for 30-60 days during processing',
          'STAY RESPONSIVE: Answer lender calls/emails within 24 hours',
          'AVOID CHANGES: No new credit, job changes, or large purchases',
          '💼 EMPLOYMENT VERIFICATION: May be reverified closer to closing'
        ],
        timeline: 'Submit within 3 days of choosing lender, 20 days before closing',
        nextSteps: ['Await conditions letter', 'Provide additional docs', 'Schedule appraisal']
      }
    });

    tasks.push({
      id: 'diligence-financing-appraisal',
      title: 'Property Appraisal & Valuation',
      description: 'REQUIRED BY LENDER: Independent appraiser confirms property value supports loan amount. If appraisal comes low, may need to renegotiate price or bring more cash.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(15),
      estimatedTime: '2-3 hours inspection + 3-5 days report',
      assignedTo: 'Licensed Appraiser + Lender + You',
      linkedPage: 'financing',
      actionLabel: 'Schedule Appraisal',
      propertySpecific: true,
      instructions: {
        overview: 'The appraisal protects the lender by confirming the property is worth the loan amount. You cannot choose the appraiser.',
        tips: [
          'GOAL: Property value = or > contract price',
          'IF LOW: Options include price renegotiation, cash difference, or appeal',
          'PREP: Ensure property is clean, accessible, and repairs completed',
          'PROVIDE: Comparable sales, improvement receipts, HOA info if requested',
          'TIMING: Typically ordered after application approval, takes 7-10 days'
        ],
        timeline: 'Ordered by lender 15-20 days before closing',
        nextSteps: ['Review appraisal report', 'Address any value issues', 'Proceed to underwriting']
      }
    });

    tasks.push({
      id: 'diligence-financing-underwriting',
      title: 'Loan Underwriting & Final Approval',
      description: 'FINAL STEP: Underwriter reviews complete file and issues final loan approval. May request additional conditions. This determines if you get the loan.',
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(5),
      estimatedTime: '5-10 business days',
      assignedTo: 'Underwriter + Processor + You',
      linkedPage: 'financing',
      actionLabel: 'Track Progress',
      propertySpecific: true,
      instructions: {
        overview: 'Underwriting is the final loan approval process where an expert reviews your complete financial picture and the property.',
        tips: [
          'CONDITIONS: Expect 2-5 additional document requests',
          'NO CHANGES: Absolutely no credit changes, job changes, or large purchases',
          'RESPOND FAST: Provide requested docs within 24-48 hours',
          'EMPLOYMENT: May reverify job and income 1-2 days before closing',
          'OUTCOME: Clear to Close (CTC) or additional conditions'
        ],
        timeline: 'Begins after appraisal, takes 5-10 business days',
        nextSteps: ['Receive Clear to Close', 'Review closing disclosure', 'Schedule closing']
      }
    });

    // DUE DILIGENCE PHASE - INSPECTIONS
    tasks.push({
      id: 'diligence-inspection-shop-inspectors',
      title: 'Find Qualified Home Inspector',
      description: 'CHOOSE WISELY: Your inspector is your property detective. Get referrals, check licenses, read reviews. A good inspector can save you thousands by finding hidden issues.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'active',
      dueDate: getDateFromClosing(12),
      estimatedTime: '3-4 hours research + calls',
      assignedTo: 'You + Real Estate Agent + References',
      linkedPage: 'inspections',
      actionLabel: 'Find Inspectors',
      propertySpecific: true,
      instructions: {
        overview: 'The home inspection is your primary defense against costly surprises. Choose an experienced, thorough inspector.',
        tips: [
          '📋 VERIFY: Licensed, insured, certified (ASHI, InterNACHI)',
          '💬 ASK AGENT: Get 3+ referrals from your real estate agent',
          '⭐ CHECK REVIEWS: Look for detailed, recent reviews',
          '💰 COMPARE: $400-800 typical cost, don\'t just choose cheapest',
          '📱 AVAILABILITY: Book ASAP, good inspectors fill up quickly'
        ],
        timeline: 'Research and book within 48 hours of offer acceptance',
        nextSteps: ['Schedule within inspection period', 'Plan to attend inspection', 'Understand what\'s included']
      }
    });

    tasks.push({
      id: 'diligence-inspection-general-scheduled',
      title: 'General Home Inspection',
      description: 'MUST ATTEND: Be present for 3-4 hour inspection. Ask questions, take notes. Inspector checks 400+ items: structure, electrical, plumbing, HVAC, roof, foundation.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'active',
      dueDate: getDateFromClosing(10),
      estimatedTime: '4-5 hours (attend full inspection)',
      assignedTo: 'Licensed Inspector + You + Agent',
      linkedPage: 'inspections',
      actionLabel: 'Schedule Inspection',
      propertySpecific: true,
      instructions: {
        overview: 'The general inspection covers all major home systems and structure. This is your comprehensive property health check.',
        tips: [
          '👥 ATTEND: Be present for entire inspection to ask questions',
          '📸 DOCUMENT: Take photos of issues inspector points out',
          '🔌 UTILITIES ON: Ensure all utilities are connected and working',
          '🧰 WHAT\'S CHECKED: Structure, electrical, plumbing, HVAC, roof, windows',
          '📋 REPORT: Detailed written report within 24-48 hours'
        ],
        timeline: 'Schedule within 5-7 days of offer acceptance',
        nextSteps: ['Receive detailed report', 'Review with agent', 'Decide on repair requests']
      }
    });

    tasks.push({
      id: 'diligence-inspection-specialized',
      title: 'Specialized Inspections (If Needed)',
      description: 'PROPERTY-SPECIFIC: Based on age, type, location, and general inspection findings. May include: Pest, Radon, Lead, Asbestos, Septic, Well, Roof, Foundation.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: 'upcoming',
      dueDate: getDateFromClosing(8),
      estimatedTime: '1-3 hours each + 1-3 days reports',
      assignedTo: 'Specialized Inspectors + You',
      linkedPage: 'inspections',
      actionLabel: 'Schedule Additional',
      propertySpecific: true,
      instructions: {
        overview: 'Specialized inspections focus on specific systems or hazards based on property characteristics and general inspection findings.',
        tips: [
          '🐛 PEST: Required in many areas, checks for termites/wood-destroying insects',
          '☢️ RADON: Colorless gas, common in basements, 2-4 day test',
          '🎨 LEAD PAINT: Required for homes built before 1978',
          '🚽 SEPTIC: If no city sewer, test system and tank',
          '💧 WELL WATER: Test quality and flow rate if private well'
        ],
        timeline: 'Schedule within 7 days of general inspection',
        nextSteps: ['Review specialist reports', 'Factor into repair requests', 'Consider cost implications']
      }
    });

    tasks.push({
      id: 'diligence-inspection-review-results',
      title: 'Review All Inspection Reports',
      description: 'STRATEGIC REVIEW: Categorize issues by severity and cost. Focus on safety, major systems, and expensive repairs. Cosmetic issues typically not worth negotiating.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(6),
      estimatedTime: '2-3 hours analysis + agent consultation',
      assignedTo: 'You + Real Estate Agent + Contractors (estimates)',
      linkedPage: 'inspections',
      actionLabel: 'Review Reports',
      propertySpecific: true,
      instructions: {
        overview: 'Review inspection reports strategically to prioritize repair requests and understand true property condition.',
        tips: [
          '🚨 PRIORITIZE: Safety issues first, then major systems, then cosmetic',
          '💰 GET ESTIMATES: For major repairs, get contractor quotes',
          '📋 CATEGORIZE: Deal-breakers vs. negotiable vs. acceptable',
          '🤝 CONSULT AGENT: Experienced agents know what to negotiate',
          '⏰ DEADLINE: You have limited time to respond (typically 3-5 days)'
        ],
        timeline: 'Complete within 24-48 hours of receiving reports',
        nextSteps: ['Decide negotiation strategy', 'Prepare repair request list', 'Submit formal response']
      }
    });

    tasks.push({
      id: 'diligence-inspection-negotiate-repairs',
      title: '🤝 Negotiate Repairs & Credits',
      description: '💼 FORMAL REQUEST: Submit prioritized repair list or credit requests to seller. Be reasonable - focus on safety and major systems. Expect back-and-forth negotiation.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(4),
      estimatedTime: '1-2 days negotiation + documentation',
      assignedTo: 'You + Real Estate Agent + Seller\'s Agent',
      linkedPage: 'inspections',
      actionLabel: 'Submit Requests',
      propertySpecific: true,
      instructions: {
        overview: 'Negotiate inspection items strategically to address major concerns while maintaining deal momentum.',
        tips: [
          '📋 BE SPECIFIC: Detailed repair descriptions and preferred contractors',
          '💰 CREDIT OPTION: Sometimes cash credit easier than actual repairs',
          '🎯 PICK BATTLES: Don\'t nitpick cosmetic issues',
          '⚖️ BE REASONABLE: Consider market conditions and contract terms',
          '📄 GET WRITTEN: All agreements must be in writing via addendum'
        ],
        timeline: 'Submit within inspection contingency period',
        nextSteps: ['Await seller response', 'Counter-negotiate if needed', 'Finalize repair addendum']
      }
    });

    tasks.push({
      id: 'diligence-inspection-finalize-agreement',
      title: 'Finalize Repair Agreement',
      description: 'CLOSE THE LOOP: Finalize which repairs will be completed vs. credits given. Get specific timeline and contractor requirements in writing. Remove inspection contingency.',
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(2),
      estimatedTime: '2-4 hours documentation + review',
      assignedTo: 'You + Agent + Attorney + Seller',
      linkedPage: 'inspections',
      actionLabel: 'Finalize Agreement',
      propertySpecific: true,
      instructions: {
        overview: 'Finalize the inspection resolution and remove your inspection contingency to proceed to closing.',
        tips: [
          '📋 DOCUMENT EVERYTHING: Specific repairs, timeline, licensed contractors',
          '💰 CREDIT AMOUNTS: Exact dollar amounts if credits negotiated',
          '⏰ COMPLETION TIMELINE: When repairs must be done (usually before closing)',
          '🔍 FINAL WALKTHROUGH: Plan to verify completion at walkthrough',
          '✅ REMOVE CONTINGENCY: Formally remove inspection contingency'
        ],
        timeline: 'Complete within inspection contingency period',
        nextSteps: ['Plan final walkthrough verification', 'Proceed to other contingencies', 'Focus on closing prep']
      }
    });

    // DUE DILIGENCE PHASE - LEGAL & TITLE
    tasks.push({
      id: 'diligence-legal-title-search',
      title: 'Comprehensive Title Search',
      description: 'LEGAL PROTECTION: Attorney searches public records for liens, judgments, ownership disputes. Ensures you get clear, marketable title. Title insurance protects against unknown issues.',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(10),
      estimatedTime: '2-3 business days',
      assignedTo: 'Real Estate Attorney + Title Company',
      linkedPage: 'legal',
      actionLabel: 'Monitor Progress',
      propertySpecific: true,
      instructions: {
        overview: 'The title search ensures you receive clear ownership and identifies any legal issues that could affect your ownership.',
        tips: [
          '🔍 WHAT\'S SEARCHED: Public records for 30+ years of ownership history',
          '⚠️ POTENTIAL ISSUES: Liens, judgments, easements, boundary disputes',
          '🛡️ TITLE INSURANCE: Protects against undiscovered title defects',
          '📋 TITLE REPORT: Detailed report of findings and any exceptions',
          '⏰ TIMING: Started immediately after attorney retained'
        ],
        timeline: 'Initiated within days of contract, completed 10+ days before closing',
        nextSteps: ['Review title report', 'Address any title issues', 'Purchase title insurance']
      }
    });

    tasks.push({
      id: 'diligence-legal-review-title-issues',
      title: 'Review Title Issues & Exceptions',
      description: 'DETAILED REVIEW: Examine liens, easements, encroachments, restrictions. Some issues can be resolved, others may be deal-breakers. Attorney advises on significance.',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(8),
      estimatedTime: '1-3 hours + resolution time',
      assignedTo: 'Your Attorney + Title Company + You',
      linkedPage: 'legal',
      actionLabel: 'Review Title',
      propertySpecific: true,
      instructions: {
        overview: 'Review and address any title issues discovered during the search to ensure clear ownership transfer.',
        tips: [
          '💰 LIENS: Must be paid off at closing (seller responsibility)',
          '🚧 EASEMENTS: Rights others have to use your property (utilities, access)',
          '📏 ENCROACHMENTS: Structures crossing property lines',
          '��� RESTRICTIONS: HOA rules, building restrictions, deed covenants',
          '⚖️ ATTORNEY ADVICE: Essential for understanding legal implications'
        ],
        timeline: 'Review within 2-3 days of receiving title report',
        nextSteps: ['Determine which issues need resolution', 'Negotiate resolution', 'Proceed with clear title']
      }
    });

    tasks.push({
      id: 'diligence-legal-closing-disclosure',
      title: 'Review Closing Disclosure (CD)',
      description: 'FINAL NUMBERS: Lender provides exact closing costs 3+ days before closing. Compare to Loan Estimate. No surprises allowed. Review every line item carefully.',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(5),
      estimatedTime: '2-3 hours detailed review',
      assignedTo: 'You + Attorney + Lender + Agent',
      linkedPage: 'legal',
      actionLabel: 'Review CD',
      propertySpecific: true,
      instructions: {
        overview: 'The Closing Disclosure is your final loan terms and closing costs. Federal law requires 3+ day review period.',
        tips: [
          '📋 COMPARE: Line by line vs. original Loan Estimate',
          '🚫 RED FLAGS: Unexpected fees, rate changes, cost increases',
          '💰 CASH TO CLOSE: Exact amount you need to bring',
          '⏰ MANDATORY WAIT: Cannot close for 3+ business days after receipt',
          '❓ ASK QUESTIONS: Get explanations for any changes or unclear items'
        ],
        timeline: 'Received 3+ business days before closing',
        nextSteps: ['Question any discrepancies', 'Prepare closing funds', 'Schedule final walkthrough']
      }
    });

    tasks.push({
      id: 'diligence-legal-closing-documents',
      title: 'Prepare Closing Documents',
      description: 'LEGAL PAPERWORK: Attorney prepares deed, settlement statement, affidavits, and all closing documents. Review key docs in advance to avoid closing delays.',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(3),
      estimatedTime: '1-2 hours prep + review',
      assignedTo: 'Your Attorney + Title Company',
      linkedPage: 'legal',
      actionLabel: 'Review Documents',
      propertySpecific: true,
      instructions: {
        overview: 'All legal documents must be prepared and reviewed before closing to ensure accuracy and prevent delays.',
        tips: [
          '📜 KEY DOCUMENTS: Deed, settlement statement, loan documents, affidavits',
          '✅ VERIFY ACCURACY: Names, property description, amounts, dates',
          '🔍 PREVIEW: Review key documents before closing day',
          '📋 SETTLEMENT STATEMENT: Detailed breakdown of all costs',
          '🆔 REQUIRED ID: Bring government-issued photo ID to closing'
        ],
        timeline: 'Documents prepared 2-3 days before closing',
        nextSteps: ['Review document package', 'Prepare for closing', 'Arrange closing funds']
      }
    });

    tasks.push({
      id: 'diligence-legal-wire-instructions',
      title: 'Secure Wire Transfer Instructions',
      description: 'FRAUD ALERT: Get wire instructions directly from attorney/title company. Verify by phone. Wire fraud is common - criminals change banking info in emails.',
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      dueDate: getDateFromClosing(2),
      estimatedTime: '30 min + bank time',
      assignedTo: 'Your Attorney + Your Bank + You',
      linkedPage: 'legal',
      actionLabel: 'Setup Wire',
      propertySpecific: true,
      instructions: {
        overview: 'Wire transfer instructions must be verified to prevent wire fraud, which is extremely common in real estate.',
        tips: [
          '🚨 FRAUD WARNING: Always verify wire instructions by phone',
          '��️ CALL DIRECTLY: Use known number, not number in email',
          '📧 EMAIL RISK: Never trust wire instructions received only by email',
          '🏦 BANK TIMING: Arrange wire 1-2 days before closing',
          '💰 BACKUP PLAN: Certified check as backup if wire issues'
        ],
        timeline: 'Arrange 1-2 days before closing',
        nextSteps: ['Execute wire transfer', 'Confirm receipt', 'Proceed to closing']
      }
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
