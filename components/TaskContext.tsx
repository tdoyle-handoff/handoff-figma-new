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
  tags?: string[];
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
  getTasksByTag: (tag: string) => Task[];
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
      description: `What it is: A structured worksheet that captures your budget, desired property features, location preferences, and lifestyle needs. It becomes your "buy box," a framework for quickly filtering listings.

Why it matters: Without a defined buy box, buyers often waste weeks chasing unsuitable properties, becoming overwhelmed and frustrated. This task forces clarity—what you truly need versus what would just be nice. Agents, attorneys, and lenders all work more effectively when your criteria are clear.

How to complete it:
- Write down your maximum comfortable monthly housing payment, not just purchase price. Factor in mortgage, taxes, insurance, HOA fees, utilities, and maintenance.
- List your top five must-have features (e.g., 3 bedrooms, parking, washer/dryer).
- List your top five deal-breakers (e.g., no basement, too far from public transit).
- Identify target neighborhoods and rank them in order of preference.
- Capture lifestyle considerations: commute time, school districts, walkability, resale potential.
- Save this questionnaire and revisit it after you've toured a few homes—you may refine it.`,
      category: 'search',
      subcategory: 'general',
      priority: 'medium',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: '1-2 hours',
      assignedTo: 'Buyer',
      linkedPage: 'property-search',
      actionLabel: 'Open Home Search',
      instructions: {
        overview: 'Define your criteria clearly so you can filter listings quickly and avoid wasted time.',
        steps: [],
        tips: [
          'Involve all decision-makers early (partners, family) so you avoid conflicts later.',
          'Limit "must-haves" to 5 items maximum—too many and you will filter out viable homes.',
          'Be realistic: a perfect home rarely exists. Aim for 80% match.',
          'If you are working with an agent, share this document so they only send relevant listings.'
        ]
      }
    },
    {
      id: 'task-proof-of-funds',
      title: 'Provide Proof of Funds or Pre-Approval',
      description: `What it is: Official documentation showing you can afford the property. Cash buyers present recent bank or brokerage statements; financed buyers submit a lender's pre-approval letter.

Why it matters: Sellers rarely consider offers without financial backing. Proof builds credibility, speeds up negotiations, and prevents your offer from being skipped over in competitive markets.

How to complete it:
- Cash buyers: Request a letter from your bank verifying available funds. Redact account numbers but leave balances visible.
- Financed buyers: Complete a pre-approval with a lender. Provide pay stubs, W-2s, bank statements, and authorize a credit check.
- Obtain a formal pre-approval letter on lender letterhead listing loan type, amount, and expiration.
- Keep documents updated; most expire in 30–60 days.`,
      category: 'search',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: '1-2 days',
      assignedTo: 'Buyer',
      instructions: {
        steps: [],
        tips: [
          'Do not send full bank statements with personal data exposed—redact sensitive details.',
          'Keep multiple copies ready—some sellers request resubmission if timelines slip.',
          'Strongest offers include both pre-approval and proof of cash reserves for down payment and closing costs.'
        ]
      }
    },
    {
      id: 'task-mortgage-preapproval',
      title: 'Get Pre-approved for Mortgage',
      description: `What it is: A lender's conditional approval after reviewing your credit, income, debt, and assets. It is stronger than pre-qualification and demonstrates buying power.

Why it matters: Pre-approval establishes your maximum budget, prevents wasted time touring unaffordable homes, and signals to sellers that you are serious and capable of closing.

How to complete it:
- Gather documents: last 2 years of tax returns, W-2s or 1099s, pay stubs, bank statements, list of debts, ID.
- Apply with 2–3 lenders for rate and fee comparison.
- Authorize a credit check (hard pull).
- Review the pre-approval letter and confirm it covers your expected purchase range and loan type.`,
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
          'Rates vary daily. Shop multiple lenders within 2 weeks—credit bureaus treat this as one inquiry.',
          'Do not change jobs, make large purchases, or open new credit before closing—it may jeopardize approval.',
          'Ask for both 30-year and 15-year payment scenarios to see long-term costs.'
        ],
        timeline: '2-3 business days for approval',
        cost: 'Usually free for pre-approval'
      }
    },
    {
      id: 'task-agent-selection',
      title: 'Find a Real Estate Agent',
      description: `What it is: Choosing a licensed professional who represents you in the search, offer, and negotiation process.

Why it matters: An experienced buyer's agent can save you money, flag red flags, and handle logistics. Sellers usually pay buyer agent commissions, so representation often costs you little to nothing directly.

How to complete it:
- Interview at least 2–3 agents. Ask about experience with your property type and area.
- Request references from recent clients.
- Clarify communication style (text, call, email) and responsiveness.
- Review agency disclosure forms. Understand if they can act as a dual agent.`,
      category: 'search',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: '1-2 weeks',
      assignedTo: 'Buyer',
      instructions: {
        steps: [],
        tips: [
          'Avoid hiring friends/family unless they are truly qualified—it can complicate relationships.',
          'Choose someone who educates, not pressures.',
          'Confirm they have closed deals in your exact target neighborhoods.'
        ]
      }
    },
    {
      id: 'task-property-search',
      title: 'Begin Property Search',
      description: `What it is: The active stage of identifying listings through MLS, public sites, and private channels.

Why it matters: Most buyers look at dozens of homes before choosing one. The search process reveals trade-offs between features, price, and location, refining your buy box.

How to complete it:
- Set up MLS alerts with your agent.
- Browse portals (Zillow, Realtor.com, Redfin) daily.
- Track listings in a spreadsheet or app—note asking price, square footage, taxes, HOA fees, and initial impressions.
- Drive or walk through neighborhoods to get a feel beyond online photos.`,
      category: 'search',
      priority: 'medium',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: 'Ongoing',
      linkedPage: 'property-search',
      actionLabel: 'Search Properties',
      assignedTo: 'Buyer & Agent',
      instructions: {
        steps: [],
        tips: [
          "Don't believe listing photos blindly—professional photography can disguise flaws.",
          'Pay attention to days on market: longer listings may be open to negotiation.',
          'Keep emotions in check—first homes toured rarely become the final choice.'
        ]
      }
    },
    {
      id: 'task-property-tours',
      title: 'Schedule & Attend Property Tours',
      description: `What it is: In-person or virtual visits to homes on your shortlist.

Why it matters: Tours reveal details photos cannot: layout, noise levels, condition, smell, natural light, and neighborhood vibe. Many buyers eliminate or choose homes after a single visit.

How to complete it:
- Ask your agent to schedule tours—often grouped back-to-back for efficiency.
- Bring a notepad or app to record pros/cons.
- Check basics: water pressure, windows, heating/cooling systems, and roof condition.
- Tour the block: look for parking, traffic, noise, safety, and nearby amenities.`,
      category: 'search',
      subcategory: 'general',
      priority: 'medium',
      status: isUnderContract ? 'completed' : 'active',
      estimatedTime: 'Ongoing',
      assignedTo: 'Buyer & Agent',
      instructions: {
        steps: [],
        tips: [
          'Always check cell service inside the home—weak coverage can be a deal breaker.',
          'Take photos or videos—memories blur after multiple showings.',
          'Do not linger too long on cosmetic issues (paint, carpet)—focus on structural and location factors.'
        ]
      }
    },

    // Phase 2: Offer & Negotiation
    {
      id: 'task-draft-offer',
      title: 'Draft Offer',
      description: `What it is: A written purchase contract where you propose buying the property on specific terms: price, closing date, contingencies (inspection, appraisal, financing), and included/excluded items (appliances, fixtures). This becomes the legal foundation of the transaction once accepted.

Why it matters: Drafting an offer is not just about naming a price. It’s about balancing attractiveness to the seller with adequate protection for you. A poorly written offer can lock you into unfavorable terms, cost you thousands, or even expose you to legal risk if you fail to perform.

How to complete it:
- Work with your agent/attorney – They’ll use the standard state-approved purchase agreement form.
- Decide key terms – purchase price, earnest money deposit, closing date, and contingencies.
- Review seller disclosures – adjust your contingencies if disclosures reveal known issues.
- Have attorney review – in states requiring it, attorney review is a built-in period; elsewhere, do it voluntarily.
- Sign electronically – most contracts are signed via DocuSign or similar.`,
      category: 'offer',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1 day',
      assignedTo: 'Agent',
      instructions: {
        overview: 'Prepare a written offer that balances competitiveness with adequate protections.',
        steps: [
          { step: 1, title: 'Coordinate with agent/attorney', description: 'Use the standard form for your state', action: 'Engage your agent and, if applicable, attorney' },
          { step: 2, title: 'Decide key terms', description: 'Price, EMD, closing date, contingencies, inclusions', action: 'Fill the terms in the draft' },
          { step: 3, title: 'Review disclosures', description: 'Adjust contingencies based on known issues', action: 'Incorporate disclosure findings' },
          { step: 4, title: 'Attorney review', description: 'Leverage attorney review periods where applicable', action: 'Request legal review' },
          { step: 5, title: 'Sign electronically', description: 'Execute via e-signature', action: 'Use DocuSign or similar' }
        ],
        tips: [
          'Don’t waive inspection or financing contingencies unless you fully understand the risks.',
          'Closing date flexibility can be more valuable to a seller than a higher price.',
          'List exactly what is included (appliances, light fixtures, blinds) to avoid disputes.'
        ]
      }
    },
    {
      id: 'task-mls-listing-pdf',
      title: 'Collect MLS Listing PDF',
      description: `What it is: The MLS (Multiple Listing Service) sheet is the official listing record for the property. It contains property details, photos, disclosures, taxes, HOA information, and agent notes.

Why it matters: It is the authoritative reference that shows what the seller is representing. Discrepancies between MLS and reality can be negotiation leverage or red flags. Having the PDF locked in at offer time protects you if details change later.

How to complete it:
- Ask your agent to export the full MLS sheet.
- Save it as a PDF with the date and MLS number.
- Review: lot size, taxes, HOA fees, property history, disclosures, days on market.
- Store in your transaction folder with your offer documents.`,
      category: 'offer',
      priority: 'medium',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '30 minutes',
      assignedTo: 'Agent',
      dependencies: ['task-property-search'],
      instructions: {
        overview: 'Lock in an authoritative snapshot of the property details at offer time.',
        steps: [
          { step: 1, title: 'Export MLS sheet', description: 'Get the full report from the agent', action: 'Request full export' },
          { step: 2, title: 'Save as PDF', description: 'Include date and MLS number in filename', action: 'Name: mls_<number>_<date>.pdf' },
          { step: 3, title: 'Review key fields', description: 'Lot size, taxes, HOA, history, disclosures, DOM', action: 'Note discrepancies' },
          { step: 4, title: 'File it', description: 'Store with offer documents', action: 'Upload to documents workspace' }
        ],
        tips: [
          'Compare MLS data against public records to catch errors.',
          'Pay close attention to HOA fees and property taxes—they impact affordability.',
          'If disclosures are missing from MLS, request them before submitting your offer.'
        ]
      }
    },
    {
      id: 'task-market-analysis',
      title: 'Comparative Market Analysis (CMA)',
      description: `What it is: A CMA is a report showing recent sales of comparable homes. It is the basis for determining what your offer price should be.

Why it matters: Overpaying reduces your equity; underbidding risks losing the property. A CMA helps strike the right balance and supports your negotiation stance.

How to complete it:
- Have your agent pull at least 3–6 sold comparables from the last 90 days.
- Compare size, age, condition, location, and amenities.
- Adjust values: if your target is newer/bigger, adjust upward; if older/smaller, adjust downward.
- Consider market momentum: rising or falling prices may justify adjusting above/below comps.`,
      category: 'offer',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1-2 days',
      assignedTo: 'Agent',
      instructions: {
        overview: 'Use recent comparable sales to calibrate a defensible offer price.',
        steps: [
          { step: 1, title: 'Pull comps', description: '3–6 closed comps in 90 days', action: 'Ask agent for a CMA report' },
          { step: 2, title: 'Normalize differences', description: 'Size, age, condition, amenities', action: 'Apply reasonable adjustments' },
          { step: 3, title: 'Read the market', description: 'Is pricing trending up or down?', action: 'Adjust for momentum' }
        ],
        tips: [
          "Don’t rely on a single Zestimate—automated values can be off by tens of thousands.",
          'Include pending sales—they reveal current demand.',
          'Factor in seasonality: spring tends to be hotter; winter slower.'
        ]
      }
    },
    {
      id: 'task-submit-offer',
      title: 'Submit Purchase Offer',
      description: `What it is: Delivery of your signed purchase agreement to the seller’s side (agent or directly).

Why it matters: An unsigned offer is meaningless. Once delivered, the seller can accept, reject, or counter. The response timeline typically starts when the offer is officially presented.

How to complete it:
- Sign the drafted contract (usually via electronic signature platform).
- Attach pre-approval letter or proof of funds.
- Have your agent send to seller’s agent with confirmation of receipt.
- Track deadlines: offers often include an expiration date (e.g., 24–48 hours).`,
      category: 'offer',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1 day',
      linkedPage: 'documents',
      actionLabel: 'Prepare Offer',
      assignedTo: 'Agent',
      instructions: {
        overview: 'Deliver a complete, signed offer package and confirm receipt.',
        steps: [
          { step: 1, title: 'Sign contract', description: 'Execute via e-sign', action: 'Use DocuSign or similar' },
          { step: 2, title: 'Attach proof', description: 'Pre-approval or proof of funds', action: 'Include lender letter or bank letter' },
          { step: 3, title: 'Send and confirm', description: 'Transmit to seller’s agent', action: 'Request explicit receipt confirmation' },
          { step: 4, title: 'Track expiration', description: 'Stay on top of your offer deadline', action: 'Calendar a reminder' }
        ],
        tips: [
          'A short offer expiration can compel a quick response—avoid making it unrealistically short.',
          'A polished, professional cover note highlighting your qualifications can build goodwill.',
          'Double-check earnest money details: amount, due date, escrow agent.'
        ]
      }
    },
    {
      id: 'task-offer-negotiation',
      title: 'Negotiate Offer Terms',
      description: `What it is: The back-and-forth process of refining terms until both parties agree. This can involve multiple counteroffers adjusting price, timing, and contingencies.

Why it matters: Negotiation determines your ultimate deal—both financially and logistically. Many buyers lose money by focusing only on price, overlooking hidden costs like closing credits, repair concessions, or leasebacks.

How to complete it:
- Review the seller’s counter carefully with your agent/attorney.
- Identify your non-negotiables (budget, timing, inspection rights).
- Make strategic concessions (price, closing date, repair flexibility) in exchange for what matters most.
- Put every agreed change in writing—verbal agreements mean nothing.`,
      category: 'offer',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1-3 days',
      assignedTo: 'Agent',
      instructions: {
        overview: 'Iterate terms strategically to arrive at a mutually acceptable agreement.',
        steps: [
          { step: 1, title: 'Review counter', description: 'Discuss with agent/attorney', action: 'Identify risks and opportunities' },
          { step: 2, title: 'Define limits', description: 'Fix your max price and key constraints', action: 'Document non-negotiables' },
          { step: 3, title: 'Propose tradeoffs', description: 'Price/date/repairs flexibility', action: 'Offer concessions for priorities' },
          { step: 4, title: 'Confirm in writing', description: 'Formalize every agreed change', action: 'Use amendments/counter forms' }
        ],
        tips: [
          'Set your maximum price in advance and stick to it—avoid emotional bidding.',
          'Flexibility on closing date can beat a slightly higher competing price.',
          'Request seller disclosures early—hidden issues can shift your stance.',
          'If multiple offers exist, consider an escalation clause with a clear cap.'
        ]
      }
    },

    // Phase 3: Contract & Legal
    {
      id: 'task-offer-acceptance-signing',
      title: 'Offer Acceptance & Signing',
      description: `What it is: Once the seller agrees to your offer—or you both agree on counter terms—the purchase agreement is signed by both sides. This is the moment your deal becomes under contract.

Why it matters: This signature locks in the terms you negotiated and creates enforceable deadlines for deposits, inspections, financing, and closing. Everything that follows (title search, lender application, inspections) flows from the dates and obligations in this document.

How to complete it:
- Review the final version carefully before signing. Ensure price, closing date, contingencies, and included items match what was agreed.
- Sign electronically or in person—both are legally valid.
- Confirm both buyer and seller signatures are present.
- Save a copy with the exact execution date, as it triggers all future deadlines.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      estimatedTime: '1 day',
      assignedTo: 'Buyer & Seller',
      dependencies: ['task-submit-offer'],
      instructions: {
        overview: 'Execute the final purchase agreement and capture the exact acceptance date for downstream deadlines.',
        steps: [
          { step: 1, title: 'Verify final terms', description: 'Price, closing date, contingencies, inclusions', action: 'Compare against negotiated terms' },
          { step: 2, title: 'Sign', description: 'Electronic or wet signature are valid', action: 'Complete signatures for all parties' },
          { step: 3, title: 'Confirm execution', description: 'Both buyer and seller signatures present', action: 'Check signature blocks' },
          { step: 4, title: 'Record acceptance date', description: 'This date drives contingency periods', action: 'Save the executed copy with date' }
        ],
        tips: [
          'Ensure contingencies (inspection, financing, appraisal) are clearly listed—removing later can be difficult.',
          'Highlight unusual clauses (as-is sale, rent-back, escalation addendum) for your attorney.',
          'Write down the exact date of acceptance—this starts your contingency clocks.'
        ]
      }
    },
    {
      id: 'task-contract-review',
      title: 'Review Purchase Contract',
      description: `What it is: Line-by-line legal and practical review of the agreement you’ve signed.

Why it matters: Contracts are dense and deadlines binding. Many buyers miss critical terms (transfer taxes, repair limits, timing obligations). Reviewing ensures you know exactly what you’re committing to.

How to complete it:
- Schedule a 30–60 minute review with your attorney.
- Walk through obligations, timelines, remedies, and costs.
- Identify ambiguities or missing clauses—negotiate addenda as needed.
- Keep a written summary of key dates and responsibilities.`,
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
'Understand your right to withdraw under contingencies',
          'Ask specifically about whether time is of the essence—this makes deadlines firm.',
          'Verify who pays which closing costs—they vary by state.',
          'Clarify remedies if inspection uncovers issues—refund, repair, or renegotiation?',
          'Keep a handy copy—you will reference it throughout the transaction.'
        ],
        timeline: '2-3 business days for thorough review'
      }
    },
    {
      id: 'task-attorney-selection',
      title: 'Hire Real Estate Attorney',
      description: `What it is: A licensed attorney specializing in real estate to review your contract, riders, and disclosures. In some states (NY, NJ, IL, MA), attorney review is standard.

Why it matters: Real estate contracts are legally binding. A trained attorney protects you from hidden risks (unclear title, one-sided clauses, missed deadlines) that your agent may not be qualified to catch.

How to complete it:
- Ask for referrals from trusted contacts or your agent.
- Confirm the attorney specializes in residential real estate.
- Send them the executed contract immediately.
- Schedule a review call to walk through rights, obligations, and deadlines.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'completed' : 'pending',
      estimatedTime: '1-2 days',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Engage a responsive residential real estate attorney and initiate review quickly.',
        steps: [
          { step: 1, title: 'Source referrals', description: 'From agent and trusted contacts', action: 'Create shortlist of specialists' },
          { step: 2, title: 'Engagement', description: 'Retain attorney and send executed contract', action: 'Confirm scope and fees' },
          { step: 3, title: 'Schedule review', description: '30–60 minute call to discuss terms and deadlines', action: 'Prepare questions and priorities' }
        ],
        tips: [
          'Don’t wait: attorney review windows can be short (3–5 days in some states).',
          'Ask about fees up front (flat vs hourly).',
          'Prioritize responsiveness—real estate timelines move quickly.'
        ]
      }
    },
    {
      id: 'task-contract-riders',
      title: 'Add Contract Riders',
      description: `What it is: Optional add-on clauses that customize the standard purchase agreement (e.g., inspection remedies, financing timelines, appraisal conditions, rent-back agreements).

Why it matters: Riders tailor the deal to your needs. Without them, boilerplate language may leave you unprotected or too rigid.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Attorney',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Draft, negotiate, and execute only the riders necessary to protect your priorities.',
        steps: [
          { step: 1, title: 'Identify needs', description: 'Inspection, financing, appraisal, rent-back', action: 'List relevant riders with your attorney/agent' },
          { step: 2, title: 'Draft precisely', description: 'Clear, specific terms to reduce disputes', action: 'Avoid vague language' },
          { step: 3, title: 'Execute riders', description: 'Ensure both parties sign', action: 'Attach to contract' }
        ],
        tips: [
          'Keep riders clear and specific—ambiguity invites disputes.',
          'Too many riders can reduce offer appeal—focus on essentials.',
          'Consider adding an appraisal rider to address low appraisal risk.'
        ]
      }
    },
    {
      id: 'task-send-lawyer-signed-contract',
      title: 'Send Signed Contract to Attorney',
      description: `What it is: Providing your attorney with the fully executed purchase agreement and all attachments.

Why it matters: Your attorney can’t protect your rights or track deadlines without seeing the signed deal. This triggers their legal review and sets coordination with the seller’s attorney.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-attorney-selection', 'task-offer-acceptance-signing'],
      instructions: {
        overview: 'Deliver the executed contract package to your attorney immediately after acceptance.',
        steps: [
          { step: 1, title: 'Email executed PDF', description: 'Send the full signed agreement and attachments', action: 'Email to attorney and CC agent' },
          { step: 2, title: 'Confirm receipt', description: 'Ask attorney to acknowledge and summarize key dates', action: 'Request confirmation email' }
        ],
        tips: [
          'Don’t assume the agent sent it—ensure your attorney has the documents.',
          'Ask your attorney to calendar all critical deadlines (inspection, mortgage commitment, closing).'
        ]
      }
    },
    {
      id: 'task-open-escrow',
      title: 'Open Escrow',
      description: `What it is: A neutral third party (escrow/title company or attorney, depending on state) that holds funds and manages closing paperwork.

Why it matters: Escrow ensures documents and money are exchanged fairly. The seller won’t transfer the deed until funds are in; you won’t release funds until title is clear.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Title Company',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Initiate escrow so the closing process can be tracked and funds handled securely.',
        steps: [
          { step: 1, title: 'Send executed contract', description: 'Agent/attorney forwards to escrow/title', action: 'Provide full package promptly' },
          { step: 2, title: 'Receive instructions', description: 'Escrow sends wiring and process details', action: 'Review carefully and verify by phone' },
          { step: 3, title: 'Get file opened', description: 'Escrow logs the transaction and timeline', action: 'Save contact and file number' }
        ],
        tips: [
          'Always verify wire instructions directly by phone—wire fraud is common and devastating.',
          'Ask for a good faith estimate of funds early to plan cash to close.',
          'Save your escrow officer’s contact—they are your logistics hub.'
        ]
      }
    },
    {
      id: 'task-earnest-money-deposit',
      title: 'Submit Earnest Money Deposit',
      description: `What it is: A good-faith deposit, typically 1–3% of purchase price, wired to escrow or attorney trust account within a few days of contract signing.

Why it matters: Demonstrates commitment to the deal. If you back out without a valid contingency, you risk forfeiting the deposit. If you close, it’s applied to down payment or closing costs.

How to complete it:
- Get official wiring or check delivery instructions from escrow/attorney.
- Send funds within the contract deadline (usually 3–5 business days).
- Request written confirmation of receipt.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Buyer',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Fund the earnest deposit on time to avoid breach of contract.',
        steps: [
          { step: 1, title: 'Obtain instructions', description: 'Wire or cashier’s check details', action: 'Verify instructions directly with escrow/title by phone' },
          { step: 2, title: 'Send funds', description: 'Within the contract deadline', action: 'Complete the transfer and retain receipt' },
          { step: 3, title: 'Confirm receipt', description: 'Get written confirmation from escrow/attorney', action: 'File confirmation with your records' }
        ],
        tips: [
          'Late deposit can be a breach—prioritize this task.',
          'Use a cashier’s check or wire—personal checks are often not allowed.',
          'Keep proof of transaction—this shows you met the obligation.'
        ]
      }
    },

    // Phase 4: Due Diligence
    {
      id: 'task-shop-inspectors',
      title: 'Shop for Inspectors',
      description: `What it is: The process of identifying and interviewing professional inspectors who will evaluate the property. Inspections go far beyond what a buyer can see during a tour—they cover structural integrity, electrical and plumbing systems, roof condition, safety issues, and environmental hazards.

Why it matters: The inspector is your eyes and ears. A strong inspector finds hidden issues that could cost tens of thousands to repair. A weak inspector might overlook serious problems, leaving you stuck with unexpected costs after closing. Choosing the right inspector is one of the most important decisions in the entire process.

How to complete it:
- Ask your agent for 2–3 recommendations, but also search independently (Yelp, Google, local associations).
- Request sample reports—good inspectors provide detailed photos, clear explanations, and recommendations, not just checklists.
- Confirm licensing and certifications (ASHI or InterNACHI membership is a plus).
- Ask about scope: appliances testing, attic/crawlspace, moisture measurement, thermal imaging.
- Book early—good inspectors often have waiting lists.`,
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Identify a thorough, credentialed inspector and book within your contingency window.',
        steps: [
          { step: 1, title: 'Gather candidates', description: 'Ask agent for 2–3 and search independently', action: 'Build a shortlist' },
          { step: 2, title: 'Evaluate sample reports', description: 'Look for photos, clear narratives, recommendations', action: 'Request PDFs' },
          { step: 3, title: 'Verify credentials', description: 'Licensing where required; ASHI/InterNACHI memberships', action: 'Confirm license and certifications' },
          { step: 4, title: 'Confirm scope', description: 'Attic/crawlspace, moisture testing, thermal imaging, appliances', action: 'Align expectations' },
          { step: 5, title: 'Book early', description: 'Good inspectors fill up fast', action: 'Schedule within contingency period' }
        ],
        tips: [
          'Don’t just choose the cheapest provider—quality matters more than saving a small amount.',
          'Read reviews for thoroughness to avoid “drive-by” inspections.',
          'Attend the inspection in person to learn and ask questions.'
        ]
      }
    },
    {
      id: 'task-home-inspection',
      title: 'Schedule Home Inspection',
      description: `What it is: A comprehensive review of the property’s condition by a licensed professional. Covers structural, mechanical, electrical, plumbing, HVAC, roof, and basic safety systems.

Why it matters: Inspections reveal problems not visible at first glance: hidden water damage, outdated wiring, foundation cracks, roof leaks, or unsafe installations. The results can determine whether you move forward, renegotiate, or walk away.

How to complete it:
- Schedule within the contract’s inspection period (often 7–10 days after acceptance).
- Attend in person. Walk through each room and system with the inspector.
- Receive a detailed report (PDF) within 24–48 hours.
- Review findings with your agent/attorney to decide next steps.`,
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
          'Take your own photos and notes during the inspection for later review.',
          'Don’t panic at a long report—inspectors flag even minor issues. Focus on health, safety, and big-ticket items.',
          'Ask the inspector to ballpark repair costs where possible.',
          "Understand what's included vs excluded in the inspection scope."
        ],
        timeline: 'Must be completed within inspection contingency period',
        cost: '$300-$600 depending on property size'
      }
    },
    {
      id: 'task-schedule-specialized-inspections',
      title: 'Order Specialty Tests (Lead, Radon, Mold, Pest, Asbestos, etc.)',
      description: `What it is: Specialized inspections that go beyond the standard home inspection. These include radon gas testing, mold sampling, pest/termite inspections, lead paint testing, asbestos sampling, and well or septic system checks.

Why it matters: A general inspector may identify symptoms (musty smell, water staining, pest droppings), but not confirm the problem. Specialized tests give you hard data. Many of these hazards are invisible but can cause serious health risks or huge repair bills if ignored.

How to complete it:
- Ask your general inspector which areas require deeper testing.
- Hire licensed specialists (radon, mold remediation companies, pest inspectors).
- Schedule within your inspection contingency period.
- Receive detailed lab reports or inspection summaries.`,
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-home-inspection'],
      instructions: {
        overview: 'Order targeted tests based on general inspection findings and property risk profile.',
        steps: [
          { step: 1, title: 'Consult your inspector', description: 'Identify recommended specialty tests', action: 'List tests (radon, mold, pest, lead, asbestos, sewer, well/septic)' },
          { step: 2, title: 'Hire licensed specialists', description: 'Use vetted providers; confirm certifications', action: 'Verify credentials, scope, and turnaround times' },
          { step: 3, title: 'Schedule within contingency', description: 'Book tests promptly to meet deadlines', action: 'Account for radon 48-hr test windows' },
          { step: 4, title: 'Collect written reports', description: 'Obtain lab results or formal summaries', action: 'File reports and share with agent/attorney' }
        ],
        tips: [
          'Radon is a leading cause of lung cancer—always test basements or ground-level homes; tests are inexpensive.',
          'Termites can cause structural damage costing tens of thousands—require seller treatment if found.',
          'If lead paint or asbestos is present, you may not need immediate removal, but budget for safe handling during renovations.',
          'Sewer line scoping can prevent >$10k surprises—highly recommended in older homes.',
          'In condos/co-ops, focus on building-level risks and maintenance responsibilities.'
        ]
      }
    },
    {
      id: 'task-review-inspection-results',
      title: 'Review Inspection Results',
      description: `What it is: Analyzing the findings from the general and specialized inspections to decide your next move: proceed as is, renegotiate, or walk away.

Why it matters: This is your chance to adjust the deal. Inspection results are one of the only moments where buyers can reopen negotiations. Without careful review, you risk missing costly defects or letting minor cosmetic issues derail you unnecessarily.

How to complete it:
- Read full reports, not just summaries. Highlight major issues.
- Discuss with inspector, agent, and attorney what’s serious vs. minor.
- Prioritize safety issues and big-ticket items (roof, HVAC, foundation).
- Prepare a repair or credit request list to send to the seller.`,
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-home-inspection'],
      instructions: {
        overview: 'Translate reports into a focused action plan for negotiations.',
        steps: [
          { step: 1, title: 'Read reports in full', description: 'Highlight major/safety issues', action: 'Separate critical vs minor' },
          { step: 2, title: 'Consult team', description: 'Inspector, agent, attorney input', action: 'Align on severity and remedies' },
          { step: 3, title: 'Prioritize essentials', description: 'Safety and high-cost items', action: 'Create a shortlist' },
          { step: 4, title: 'Draft request list', description: 'Repairs or credits with specifics', action: 'Prepare for seller submission' }
        ],
        tips: [
          'Avoid a laundry list—focus on 3–5 big items for credibility.',
          'Use dollar amounts for credits rather than vague “fix this.”',
          'In hot markets, sellers may refuse repairs—credits are often easier.'
        ]
      }
    },
    {
      id: 'task-submit-repair-requests',
      title: 'Submit Repair Requests / Begin Negotiations',
      description: `What it is: Formally asking the seller to fix defects or provide financial credit. This is a negotiation round based on inspection findings.

Why it matters: Repairs can cost thousands. Negotiating them upfront prevents out-of-pocket surprises later. It’s also your chance to walk away if the seller refuses.

How to complete it:
- Draft a repair addendum with your attorney/agent.
- Specify whether you want repairs completed before closing or a closing credit.
- Submit within the inspection contingency deadline.
- Expect the seller to accept, counter, or reject.`,
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-review-inspection-results'],
      instructions: {
        overview: 'Turn prioritized issues into a precise, time-bound request.',
        steps: [
          { step: 1, title: 'Draft addendum', description: 'List repairs and/or credit amounts', action: 'Work with attorney/agent' },
          { step: 2, title: 'Define remedy type', description: 'Repairs before closing vs credit at closing', action: 'State preference clearly' },
          { step: 3, title: 'Submit on time', description: 'Within inspection contingency period', action: 'Send to seller and track deadline' },
          { step: 4, title: 'Prepare for responses', description: 'Accept, counter, or reject', action: 'Plan negotiation tactics' }
        ],
        tips: [
          'Credits are often cleaner than repairs; sellers may cut corners on fixes.',
          'If you request repairs, require receipts from licensed contractors.',
          'If the seller refuses, you can usually cancel and recover earnest money (verify your contract).'
        ]
      }
    },
    {
      id: 'task-finalize-inspection-remedies',
      title: 'Finalize Inspection Remedies & Timelines',
      description: `What it is: Agreeing in writing on how inspection issues will be resolved and by when.

Why it matters: Without specificity, sellers may leave repairs incomplete or misrepresented. Documented agreements protect you at closing.

How to complete it:
- Once negotiation ends, sign an inspection addendum detailing credits or repairs.
- Set deadlines (before closing or prior to final walkthrough).
- Save receipts and agreements in your transaction file.`,
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-submit-repair-requests'],
      instructions: {
        overview: 'Lock in the agreed remedies in enforceable, time-bound language.',
        steps: [
          { step: 1, title: 'Execute addendum', description: 'Credits and/or repairs clearly defined', action: 'Sign with counterparties' },
          { step: 2, title: 'Set timelines', description: 'Before closing or prior to walkthrough', action: 'Specify dates and responsible party' },
          { step: 3, title: 'Maintain records', description: 'Receipts, warranties, correspondence', action: 'Organize in transaction folder' }
        ],
        tips: [
          'Schedule a re-inspection for major promised repairs.',
          'Be specific: “replace shingles on rear slope” is enforceable; “repair roof” is vague.',
          'Stay polite but firm—this stage often involves pushback.'
        ]
      }
    },
    {
      id: 'task-mortgage-application',
      title: 'Complete Loan Application',
      description: `What it is: The formal application for your mortgage, including full income, asset, debt, and employment documentation. This goes beyond pre-approval, requiring detailed verification.

Why it matters: Lenders won’t issue a loan commitment until they verify everything. The faster you complete this step, the faster you get to “clear to close.”

How to complete it:
- Gather documents: last 2 years’ tax returns, W-2s or 1099s, recent pay stubs, bank statements, retirement/investment accounts, and government ID.
- Submit all documents via your lender’s secure portal (never email PDFs).
- Authorize employment verification and a credit pull.
- Review the Loan Estimate provided—this outlines rate, monthly payment, and estimated closing costs.`,
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      estimatedTime: '1-2 days',
      linkedPage: 'financing',
      actionLabel: 'Apply for Mortgage',
      assignedTo: 'Buyer',
      dependencies: ['task-submit-offer', 'task-offer-acceptance-signing'],
      instructions: {
        overview: 'Complete the formal mortgage application promptly and upload all requested documents via the secure portal.',
        steps: [
          { step: 1, title: 'Gather documents', description: '2 years tax returns, W-2/1099, pay stubs, bank and investment statements, ID', action: 'Organize PDFs before starting' },
          { step: 2, title: 'Apply and upload securely', description: 'Use lender’s portal to submit the application and documents', action: 'Avoid email for sensitive info' },
          { step: 3, title: 'Authorize verifications', description: 'Employment and credit checks', action: 'E-sign authorization forms promptly' },
          { step: 4, title: 'Review Loan Estimate', description: 'Check rate, APR, payments, and estimated closing costs', action: 'Ask questions about fees and points' }
        ],
        tips: [
          'Respond quickly to any additional document requests—every day of delay pushes closing back.',
          'Don’t change jobs, make big purchases, or take on new debt during this process—it can jeopardize approval.',
          'Keep at least 2–3 months of reserves in accounts; lenders often want to see post-closing liquidity.'
        ]
      }
    },
    {
      id: 'task-send-offer-to-lender',
      title: 'Send Accepted Offer to Lender',
      description: `What it is: Providing your lender with the signed purchase agreement once your offer is accepted. This step triggers the formal loan process—underwriting, appraisal ordering, and document review.

Why it matters: The lender cannot move forward without the executed contract. Submitting it immediately keeps the timeline on track. Delays here can jeopardize financing deadlines, breach the contract, or delay closing.

How to complete it:
- Email your signed purchase contract to your loan officer.
- CC your agent and attorney so everyone is aligned.
- Ask the lender to confirm receipt and provide a “next steps” checklist.`,
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'active' : 'pending',
      estimatedTime: '15-30 minutes',
      linkedPage: 'financing',
      actionLabel: 'Send to Lender',
      assignedTo: 'Buyer',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Send the executed contract to your lender immediately to kick off underwriting and appraisal.',
        steps: [
          { step: 1, title: 'Send executed contract', description: 'Email the fully signed contract to your loan officer', action: 'Attach PDF and include property address and MLS # if available' },
          { step: 2, title: 'Loop in your team', description: 'CC your agent and attorney for alignment', action: 'Keep everyone on the same thread' },
          { step: 3, title: 'Request next steps', description: 'Ask for confirmation of receipt and a checklist', action: 'Get a written list of documents and timelines' }
        ],
        tips: [
          'Do this the same day the contract is signed—don’t wait.',
          'Ask the lender to lock in appraisal scheduling right away; backlogs are common.',
          'Keep all communications in writing to maintain a clear paper trail.'
        ]
      }
    },
    {
      id: 'task-shop-mortgage-terms',
      title: 'Shop for Mortgage Terms',
      description: `What it is: Comparing rates, products, and fees across lenders (banks, credit unions, mortgage brokers).

Why it matters: Even a 0.25% difference in rate can save or cost tens of thousands over the life of a loan. Choosing the wrong product (e.g., adjustable vs. fixed) can increase risk if rates rise.

How to complete it:
- Request Loan Estimates from at least 3 lenders on the same day (to control for rate moves).
- Compare APR (not just rate), lender fees, points, and closing costs.
- Evaluate product options: 30-year fixed, 15-year fixed, ARM, FHA, VA, USDA.
- Confirm the lender can close on your timeline—speed matters as much as cost.`,
      category: 'diligence',
      subcategory: 'financing',
      priority: 'medium',
      status: isUnderContract ? 'active' : 'pending',
      assignedTo: 'Buyer',
      dependencies: ['task-mortgage-preapproval'],
      instructions: {
        overview: 'Obtain same-day quotes from multiple lenders and compare total cost, not just the rate.',
        steps: [
          { step: 1, title: 'Request same-day Loan Estimates', description: 'Control for daily rate changes', action: 'Collect at least three quotes' },
          { step: 2, title: 'Compare APR and fees', description: 'Look at points, lender fees, and closing costs', action: 'Normalize quotes for apples-to-apples' },
          { step: 3, title: 'Choose the right product', description: 'Fixed vs ARM, and any program eligibility (FHA/VA/USDA)', action: 'Align with your horizon and risk tolerance' },
          { step: 4, title: 'Verify closing speed', description: 'Confirm the lender can meet your deadlines', action: 'Ask for typical underwriting and appraisal timelines' }
        ],
        tips: [
          'Mortgage brokers can sometimes get better rates, but confirm reliability and communication.',
          'Don’t chase the absolute lowest teaser rate—evaluate total costs and lender reputation.',
          'In rising-rate environments, locking quickly can be safer.'
        ]
      }
    },
    {
      id: 'task-rate-lock',
      title: 'Rate Lock Decision',
      description: `What it is: Choosing to lock your interest rate with the lender for a set period (typically 30–60 days). This guarantees your rate won’t change before closing.

Why it matters: Rates fluctuate daily. A sudden spike could make your loan unaffordable. Locking secures your costs, but locking too early can expire before closing and incur extension fees.

How to complete it:
- Ask the lender for lock options: 30, 45, 60 days (longer for new construction).
- Decide based on your expected closing date and appraisal timing.
- Get written confirmation of the locked rate, duration, and any extension fees.`,
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Lender',
      dependencies: ['task-shop-mortgage-terms', 'task-mortgage-application'],
      instructions: {
        overview: 'Secure your rate window aligned to your anticipated closing date.',
        steps: [
          { step: 1, title: 'Review lock durations', description: '30/45/60-day options, longer if needed', action: 'Balance cost vs. protection' },
          { step: 2, title: 'Choose lock window', description: 'Match to expected closing and appraisal timelines', action: 'Avoid lock expiring before close' },
          { step: 3, title: 'Get written lock confirmation', description: 'Rate, expiration date, extension fees', action: 'Save the lock letter' }
        ],
        tips: [
          'If delays are likely, a longer lock upfront can be cheaper than extensions.',
          'Never rely on verbal confirmation—always request a written lock letter.',
          'Ask about float-down options if rates drop.'
        ]
      }
    },
    {
      id: 'task-appraisal',
      title: 'Property Appraisal',
      description: `What it is: An independent evaluation of the property’s value, ordered by your lender.

Why it matters: Lenders only lend up to the appraised value. If the appraisal is lower than the purchase price, you may need to renegotiate or bring extra cash.

How to complete it:
- Lender orders the appraisal—buyers cannot select the appraiser.
- Appraiser inspects the property, takes photos, and reviews comparable sales.
- Report is issued in ~1–2 weeks.
- If value is low, discuss options: price reduction, increased down payment, or reconsideration request.`,
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1-2 weeks',
      assignedTo: 'Lender',
      dependencies: ['task-mortgage-application'],
      instructions: {
        overview: 'Appraisal confirms value for the lender; address any shortfalls quickly.',
        steps: [
          { step: 1, title: 'Appraisal ordered by lender', description: 'AMC assigns an appraiser per regulations', action: 'Provide access details and contact info' },
          { step: 2, title: 'On-site appraisal', description: 'Appraiser visits, photographs, and notes comparable sales', action: 'Share CMA and list of upgrades via your agent' },
          { step: 3, title: 'Receive report', description: 'Typically within 1–2 weeks', action: 'Review value and any noted issues' },
          { step: 4, title: 'If low, plan response', description: 'Negotiate price, bring extra cash, or challenge with new comps', action: 'Coordinate with agent and lender' }
        ],
        tips: [
          'Provide your agent’s CMA and list of upgrades to inform valuation.',
          'Attend appraisal if possible or have your agent present to highlight improvements.',
          'If appraisal is low, don’t panic—many sellers reduce price to keep the deal together.'
        ]
      }
    },
    {
      id: 'task-underwriting-conditions',
      title: 'Satisfy Underwriting Conditions',
      description: `What it is: Underwriting is the lender’s detailed review of your file. “Conditions” are outstanding items you must resolve before final approval.

Why it matters: Clear-to-close requires all conditions satisfied. Ignoring requests or missing deadlines can cost you the loan.

How to complete it:
- Respond to the lender’s conditions list quickly.
- Provide updated pay stubs, bank statements, or explanations as requested.
- Keep copies of all submissions.
- Ask for written confirmation when conditions are cleared.`,
      category: 'diligence',
      subcategory: 'financing',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Lender',
      dependencies: ['task-mortgage-application', 'task-appraisal'],
      instructions: {
        overview: 'Proactively deliver requested items and track every condition to resolution.',
        steps: [
          { step: 1, title: 'Review conditions list', description: 'Identify documentation and explanations requested', action: 'Create a checklist' },
          { step: 2, title: 'Provide updated docs', description: 'Recent pay stubs, bank statements, letters of explanation', action: 'Label PDFs clearly' },
          { step: 3, title: 'Track submissions', description: 'Maintain records of what and when you sent items', action: 'Keep a folder of receipts/confirmations' },
          { step: 4, title: 'Confirm clearance', description: 'Ask for written confirmation when each condition is cleared', action: 'Follow up weekly until CTC' }
        ],
        tips: [
          'Be honest and concise in letters of explanation for large deposits or credit inquiries.',
          'Submit clean PDFs with clear filenames to speed up review.',
          'Check in weekly with your loan officer to catch new conditions early.'
        ]
      }
    },
    {
      id: 'task-title-search',
      title: 'Title Search & Insurance',
      description: `What it is: A title company or attorney reviews property records to confirm legal ownership and reveal liens, easements, unpaid taxes, or disputes. Title insurance protects you and your lender against future claims.

Why it matters: Without clear title, you could buy a home only to discover unpaid debts, boundary disputes, or even a fraudulent seller. Title insurance ensures you’re protected.

How to complete it:
- Escrow/title company orders the search.
- You receive a preliminary title report. Review with your attorney.
- Resolve any defects (seller pays off liens, clears judgments).
- Purchase an owner’s title insurance policy (one-time fee).`,
      category: 'diligence',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      estimatedTime: '1-2 weeks',
      linkedPage: 'legal',
      actionLabel: 'Review Title',
      assignedTo: 'Title Company',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Confirm marketable title and secure protection against future claims.',
        steps: [
          { step: 1, title: 'Order title search', description: 'Escrow/title initiates records review', action: 'Provide contract details' },
          { step: 2, title: 'Review prelim report', description: 'Go over exceptions with your attorney', action: 'List issues to resolve' },
          { step: 3, title: 'Clear defects', description: 'Seller resolves liens/judgments as needed', action: 'Obtain proof of release' },
          { step: 4, title: 'Bind owner’s policy', description: 'One-time premium for owner protection', action: 'Confirm coverage and premium' }
        ],
        tips: [
          'Always buy owner’s title insurance—even if optional—it protects your equity.',
          'Ask your attorney to explain easements and their impact on use.',
          'Confirm property taxes are current; delinquencies can delay closing.'
        ]
      }
    },
    {
      id: 'task-probate-approval',
      title: 'Probate / Executor Approval (Estate Sale)',
      description: `What it is: When the property is being sold by heirs of a deceased owner, the estate executor or administrator must have court authority to transfer ownership.

Why it matters: Without court approval, the contract may not be enforceable. Probate delays can stall closing for weeks or months. Ensuring legal authority prevents you from entering into a contract that cannot close.

How to complete it:
- Have your attorney request Letters Testamentary (if there is a will) or Letters of Administration (if no will).
- Confirm that the executor is legally authorized to sign the purchase agreement.
- Verify if probate court approval is required for the specific sale.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Attorney',
      dependencies: ['task-offer-acceptance-signing', 'task-contract-review', 'task-attorney-selection'],
      instructions: {
        overview: 'Confirm the estate has legal authority to sell and transfer title before you proceed further.',
        steps: [
          { step: 1, title: 'Request court letters', description: 'Attorney obtains Letters Testamentary/Administration', action: 'Collect official court documentation' },
          { step: 2, title: 'Confirm signing authority', description: 'Executor or administrator can execute contract', action: 'Validate authority and identity' },
          { step: 3, title: 'Check for additional approvals', description: 'Determine if separate probate court approval is needed', action: 'Calendar any hearings/approvals' }
        ],
        tips: [
          'Estate sales are often “as-is.” Budget for repairs.',
          'Timelines may stretch—build flexibility into your plan.',
          'Confirm how estate debts (taxes, liens) will be cleared before closing.'
        ]
      }
    },
    {
      id: 'task-divorce-order',
      title: 'Confirm Divorce Court Orders (Divorce Sale)',
      description: `What it is: When sellers are divorcing, both parties must agree and comply with court orders regarding the sale.

Why it matters: If one spouse resists, the sale can stall or be invalid. Court approval ensures both have the right (and obligation) to sell.

How to complete it:
- Attorney requests a copy of divorce decree or settlement agreement.
- Confirm both spouses are signatories on the purchase contract.
- Verify no additional court approval is required before closing.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Attorney',
      dependencies: ['task-offer-acceptance-signing', 'task-contract-review', 'task-attorney-selection'],
      instructions: {
        overview: 'Ensure both parties have authority and agreement to sell under court orders.',
        steps: [
          { step: 1, title: 'Obtain divorce documents', description: 'Decree or settlement agreement', action: 'Review sale-related provisions' },
          { step: 2, title: 'Confirm signatories', description: 'Both spouses sign the purchase contract', action: 'Validate identities and authority' },
          { step: 3, title: 'Check for court conditions', description: 'Identify any additional approvals required', action: 'Coordinate timelines with court orders' }
        ],
        tips: [
          'Expect heightened emotions—keep communication professional and clear.',
          'Confirm proceeds distribution in writing to avoid disputes at closing.'
        ]
      }
    },
    {
      id: 'task-short-sale-approval',
      title: 'Lender Short Sale Approval (Short Sale)',
      description: `What it is: A sale where the seller owes more on the mortgage than the home’s value; the lender must approve the reduced payoff.

Why it matters: Without lender approval, the seller legally cannot close. Approval is not guaranteed and can take significant time.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Track lender approval process closely and plan your timeline around it.',
        steps: [
          { step: 1, title: 'Seller hardship package', description: 'Seller submits hardship and financials to lender', action: 'Confirm submission and receipt' },
          { step: 2, title: 'Valuation ordered', description: 'Lender orders BPO or appraisal', action: 'Monitor timing and access' },
          { step: 3, title: 'Approval decision', description: 'Lender approves, counters, or declines', action: 'Adjust contract timelines as needed' }
        ],
        tips: [
          'Short sales can take 60–120+ days to approve—build in flexibility.',
          'Do not cancel a lease or sell your current home until approval is official.',
          'Multiple lienholders may exist—each must approve, extending timelines.'
        ]
      }
    },
    {
      id: 'task-reo-bank-addenda',
      title: 'Execute Bank Addenda (REO / Foreclosure)',
      description: `What it is: Bank-owned properties include mandatory addenda with special terms that often favor the bank.

Why it matters: These addenda can limit inspections, disclaim liability, and require “as-is” acceptance—review carefully.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Attorney',
      dependencies: ['task-offer-acceptance-signing', 'task-contract-review'],
      instructions: {
        overview: 'Review and execute required REO bank addenda with your attorney.',
        steps: [
          { step: 1, title: 'Review addenda', description: 'Attorney explains risk and limitations', action: 'Capture key caveats in notes' },
          { step: 2, title: 'Confirm utilities', description: 'Ensure utilities are on for inspections', action: 'Coordinate with listing agent/asset manager' },
          { step: 3, title: 'Sign and return', description: 'Execute addenda and deliver to bank/agent', action: 'Retain copies with your contract' }
        ],
        tips: [
          'Budget extra for repairs—banks rarely fix items.',
          'Move quickly—REOs may receive multiple offers.'
        ]
      }
    },
    {
      id: 'task-auction-register',
      title: 'Register to Bid & Accept Terms (Auction)',
      description: `What it is: Registration process for buying at auction, requiring ID, proof of funds, and agreement to auction rules.

Why it matters: Without registration, you cannot legally bid. Auction terms often override standard protections—understand them before bidding.`,
      category: 'offer',
      subcategory: 'general',
      priority: 'high',
      status: 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-property-search'],
      instructions: {
        overview: 'Complete registration and review auction terms prior to bidding.',
        steps: [
          { step: 1, title: 'Register online/on-site', description: 'Create account or register at venue', action: 'Provide ID and contact info' },
          { step: 2, title: 'Submit proof of funds', description: 'Bank letter or pre-approval', action: 'Upload or present as required' },
          { step: 3, title: 'Review rules/terms', description: 'Understand deposits, timelines, and contingencies (often none)', action: 'Acknowledge and accept terms' }
        ],
        tips: [
          'Auctions are final—no negotiation, no contingencies.',
          'Visit property beforehand if possible; interior access can be limited.',
          'Set and stick to a strict maximum bid to avoid overpaying.'
        ]
      }
    },
    {
      id: 'task-auction-deposit',
      title: 'Post Non-Refundable Deposit (Auction)',
      description: `What it is: A large deposit (often 5–10% of price) due immediately after winning the auction.

Why it matters: Deposit is usually non-refundable, regardless of financing or inspection issues—bid only if funds are ready.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-auction-register'],
      instructions: {
        overview: 'Be prepared to fund the auction deposit immediately after winning.',
        steps: [
          { step: 1, title: 'Prepare funds', description: 'Bring cashier’s check or wire-ready funds', action: 'Confirm accepted payment methods' },
          { step: 2, title: 'Submit deposit', description: 'Immediately after the winning bid', action: 'Follow auction instructions precisely' },
          { step: 3, title: 'Obtain receipt', description: 'Get written confirmation of deposit', action: 'File with your transaction records' }
        ],
        tips: [
          'Only bid if funds are ready; deposits are typically non-refundable.',
          'Auction homes are almost always “as is”—plan for repairs.'
        ]
      }
    },
    {
      id: 'task-bankruptcy-approval',
      title: 'Bankruptcy Court Approval (Bankruptcy Sale)',
      description: `What it is: When a seller is in bankruptcy, the court must approve the sale to protect creditors’ rights.

Why it matters: Without court approval, the sale cannot close. Delays are common while the court reviews.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Attorney',
      dependencies: ['task-offer-acceptance-signing', 'task-contract-review'],
      instructions: {
        overview: 'Coordinate with seller’s counsel to obtain a sale approval order from the bankruptcy court.',
        steps: [
          { step: 1, title: 'Motion for approval', description: 'Seller’s attorney files motion with the court', action: 'Track hearing/decision dates' },
          { step: 2, title: 'Court order issued', description: 'Order authorizes sale', action: 'Obtain and file the order' },
          { step: 3, title: 'Confirm “free and clear”', description: 'Ensure order specifies sale free and clear of liens', action: 'Verify against title report' }
        ],
        tips: [
          'Expect longer timelines—build in flexibility.',
          'Confirm the order explicitly states the sale is free and clear of liens.'
        ]
      }
    },
    {
      id: 'task-gov-addenda',
      title: 'HUD / VA Addenda (Government-Owned Sale)',
      description: `What it is: Special forms required when buying HUD or VA repossessed properties.

Why it matters: Without these addenda, your contract is not valid. They include acknowledgments of condition and program-specific disclosures.`,
      category: 'offer',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      assignedTo: 'Buyer & Agent',
      dependencies: ['task-submit-offer'],
      instructions: {
        overview: 'Download, review, and execute the required addenda as part of your offer package.',
        steps: [
          { step: 1, title: 'Obtain addenda', description: 'HUD/VA website or provided by agent', action: 'Download correct forms' },
          { step: 2, title: 'Review disclosures', description: 'Understand limitations and “as-is” nature', action: 'Discuss with your attorney/agent' },
          { step: 3, title: 'Sign and submit', description: 'Include addenda with offer', action: 'Verify all required fields and signatures' }
        ],
        tips: [
          'Government-owned properties are strictly “as is.”',
          'Inspect thoroughly—HUD/VA will not make repairs.',
          'Offer deadlines are rigid—submit promptly.'
        ]
      }
    },
    {
      id: 'task-historic-preservation-review',
      title: 'Historic Preservation Review (Historic Property / Historic District)',
      description: `What it is: A review process by local preservation boards if the home is designated historic or lies within a historic district. Regulates what changes or renovations can be made.

Why it matters: Owning a historic property can add prestige and charm but comes with restrictions. You may not be allowed to replace windows, paint colors, or modify the exterior without approval.

How to complete it:
- Check local registry for historic designation.
- Contact preservation board to understand rules.
- Submit applications for any planned renovations.`,
      category: 'diligence',
      subcategory: 'legal',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Attorney',
      dependencies: ['task-offer-acceptance-signing', 'task-contract-review'],
      instructions: {
        overview: 'Verify historic restrictions early to avoid costly surprises post-closing.',
        steps: [
          { step: 1, title: 'Check designation', description: 'Confirm local/state/national historic registries', action: 'Document status and overlays' },
          { step: 2, title: 'Engage board/office', description: 'Understand permitted work, materials, and process', action: 'Request written guidelines' },
          { step: 3, title: 'Plan approvals', description: 'Submit applications for any planned exterior/interior work', action: 'Build extra time and costs into budget' }
        ],
        tips: [
          'Budget extra time and money—approvals can be slow and materials must meet standards.',
          'Ask about tax credits or incentives for restoration projects.',
          'In some districts, interior changes can be regulated—verify before buying.'
        ]
      }
    },
    {
      id: 'task-as-is-sale-terms',
      title: 'Confirm “As-Is” Sale Terms (Scenario: As-Is Condition)',
      description: `What it is: When a seller offers the property “as is,” meaning they will not make repairs or credits for defects discovered in inspection.

Why it matters: “As is” can mean anything from cosmetic issues to severe structural problems. Buyers often underestimate costs and are shocked later.

How to complete it:
- Still perform inspections—“as is” doesn’t mean “don’t check.”
- Review inspection reports carefully.
- Decide if price still makes sense with repair costs factored in.`,
      category: 'contract',
      subcategory: 'legal',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Attorney',
      dependencies: ['task-contract-review', 'task-home-inspection'],
      instructions: {
        overview: 'Acknowledge as-is terms while protecting yourself with thorough inspections and cost estimates.',
        steps: [
          { step: 1, title: 'Perform full inspections', description: 'General plus any needed specialty tests', action: 'Complete within contingency window' },
          { step: 2, title: 'Review reports and costs', description: 'Price out major repairs and safety items', action: 'Consult contractors for estimates' },
          { step: 3, title: 'Reassess price/value', description: 'Decide if deal still makes sense', action: 'Proceed, renegotiate, or walk away per contract rights' }
        ],
        tips: [
          'Sellers may still negotiate if issues are severe—don’t assume zero flexibility.',
          'Line up contractors during the inspection window to get quotes quickly.',
          'If you’re not prepared for major renovations, consider walking away.'
        ]
      }
    },
    {
      id: 'task-elevation-certificate',
      title: 'Obtain Elevation Certificate (Flood Zone)',
      description: `What it is: A FEMA-standard document prepared by a surveyor or engineer, showing the home’s elevation relative to base flood level.

Why it matters: If the property is in a flood zone, this certificate determines insurance cost and whether lenders will require flood insurance. Without it, you can’t get accurate quotes.

How to complete it:
- Ask seller if a current certificate exists (typically valid ~5 years).
- If not, hire a licensed surveyor/engineer to measure and prepare one.
- Provide the certificate to your insurance company for premium calculation.`,
      category: 'pre-closing',
      subcategory: 'insurance',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Surveyor',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Obtain an elevation certificate early to get accurate flood insurance quotes.',
        steps: [
          { step: 1, title: 'Check for existing certificate', description: 'Request from seller or prior insurer', action: 'Verify recency and validity' },
          { step: 2, title: 'Hire surveyor/engineer', description: 'Order a new certificate if needed', action: 'Confirm turnaround time and fees' },
          { step: 3, title: 'Distribute to insurers', description: 'Share with insurance agent to quote', action: 'Store PDF in your docs' }
        ],
        tips: [
          'Flood insurance can range from hundreds to thousands per year—factor into affordability.',
          'If elevation is above base flood level, premiums may be reduced.',
          'FEMA maps update—recheck zone status even if seller says “not required.”'
        ]
      }
    },
    {
      id: 'task-bind-flood-insurance',
      title: 'Bind Flood Insurance (Flood Zone)',
      description: `What it is: Securing a flood insurance policy if the home is in a FEMA-designated flood zone.

Why it matters: Lenders won’t allow closing without proof of flood coverage when required. Flood damage is not covered by standard homeowners policies.

How to complete it:
- Use the elevation certificate to shop quotes from multiple insurers.
- Decide between NFIP (federal program) and private insurers.
- Pay first year’s premium before closing and provide the binder to your lender.`,
      category: 'pre-closing',
      subcategory: 'insurance',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer & Insurance Agent',
      dependencies: ['task-elevation-certificate', 'task-insurance-get-bids'],
      instructions: {
        overview: 'Secure required flood coverage in time for lender approval and closing.',
        steps: [
          { step: 1, title: 'Gather quotes', description: 'Use elevation certificate to obtain NFIP and private quotes', action: 'Compare coverage, premiums, and deductibles' },
          { step: 2, title: 'Choose policy', description: 'Select NFIP vs private', action: 'Confirm renewal terms and lender acceptability' },
          { step: 3, title: 'Bind and provide proof', description: 'Pay first year and send binder to lender', action: 'Upload to lender portal and file in docs' }
        ],
        tips: [
          'Private policies can be cheaper but may have fewer guarantees of renewal—compare carefully.',
          'Flood deductibles are often higher than HOI—account for this in your risk planning.',
          'Ask if the seller’s policy is transferable—assuming it may lower costs.'
        ]
      }
    },

    // Phase 5: Pre-Closing
    {
      id: 'task-insurance-get-bids',
      title: 'Get Insurance Bids & Coverage Options',
      description: `Shopping for homeowners insurance policies to protect your property and satisfy lender requirements.

Why it matters:
Your lender will not allow closing without proof of coverage. The right policy also shields you from financial loss if the home is damaged or destroyed. Premiums can vary widely, so comparison-shopping saves money.

How to complete it:

Gather details: year built, square footage, roof age, systems updates.

Request quotes from at least 3 insurers.

Compare coverage for dwelling, personal property, liability, and loss-of-use.

Check deductibles and optional add-ons (flood, earthquake, sewer backup).

Tips:

Bundle with auto insurance to lower premiums.

Ask about replacement cost vs. actual cash value coverage—replacement cost is better.

Verify insurer financial strength (A.M. Best rating) before committing.
`,
      category: 'pre-closing',
      subcategory: 'insurance',
      priority: 'high',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-offer-acceptance-signing'],
      instructions: {
        overview: 'Shop and compare homeowners insurance policies to protect your investment and meet lender requirements.',
        steps: [
          { step: 1, title: 'Gather Property Details', description: 'Year built, square footage, roof age, updates', action: 'Collect accurate data' },
          { step: 2, title: 'Request Quotes', description: 'Contact at least 3 insurance providers', action: 'Submit details for quote' },
          { step: 3, title: 'Compare Coverage', description: 'Dwelling, personal property, liability, loss-of-use', action: 'Analyze differences and costs' },
          { step: 4, title: 'Evaluate Deductibles and Add-ons', description: 'Flood, earthquake, sewer backup coverage options', action: 'Consider needs and budget' }
        ],
        tips: [
          'Bundle with auto insurance to save on premiums.',
          'Favor replacement cost over actual cash value coverage.',
          'Check insurer financial ratings for stability.'
        ]
      }
    },
    {
      id: 'task-homeowners-insurance',
      title: 'Secure Homeowners Insurance',
      description: `Selecting and binding the final homeowners insurance policy.

Why it matters:
You must provide an insurance "binder" (proof of coverage) to your lender at least a few days before closing. Without it, your loan cannot fund.

How to complete it:

Choose the best policy after comparing quotes.

Pay the first year’s premium upfront (often included in closing costs).

Have the insurer send the binder directly to your lender and escrow company.

Tips:

Effective date should align with closing date—verify with insurer.

Keep your insurance agent’s contact details handy for last-minute changes.

Consider higher deductibles to lower monthly premiums, balancing risk.
`,
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
        overview: 'Select and secure your homeowners insurance to meet lender requirements and protect your investment.',
        steps: [
          { step: 1, title: 'Choose Policy', description: 'Select the best policy after reviewing bids', action: 'Evaluate coverage and pricing' },
          { step: 2, title: 'Pay Premium', description: 'Pay the first year’s premium upfront', action: 'Arrange payment or include in closing costs' },
          { step: 3, title: 'Binder Submission', description: 'Ensure insurer sends binder to lender and escrow', action: 'Confirm timely delivery' }
        ],
        tips: [
          'Match effective date to closing date; double check with insurer.',
          'Keep insurance agent contact handy for any last-minute questions or changes.',
          'Higher deductibles may reduce premiums but increase out-of-pocket costs during claims.'
        ]
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
      description: `Escrow (or the closing attorney in some states) provides instructions for wiring your closing funds. This includes the escrow account number, bank routing info, and exact format for your transfer.

Why it matters:
Real estate wire fraud is rampant. Hackers send fake instructions, tricking buyers into wiring funds to criminal accounts. Once wired incorrectly, funds are usually unrecoverable. Correct instructions protect your money.
`,
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      assignedTo: 'Title Company',
      dependencies: ['task-earnest-money-deposit'],
      instructions: {
        overview: 'Protect your funds by verifying official wiring instructions directly and following secure delivery steps.',
        steps: [
          { step: 1, title: 'Receive official instructions', description: 'Escrow/attorney sends via secure portal or phone', action: 'Look for secure delivery or direct call' },
          { step: 2, title: 'Verify by phone', description: 'Call the escrow office at a verified number (not from the email)', action: 'Confirm account/routing details verbally' },
          { step: 3, title: 'Store and deliver to bank', description: 'Save instructions and provide them to your bank for transfer', action: 'Share with your banker exactly as provided' }
        ],
        tips: [
          'Never trust wiring instructions sent only by email—always verify by phone.',
          'Confirm whether you’ll wire full funds or just the balance after earnest money.',
          'Arrange transfer early in the day—banks often have 2–3 PM cutoffs.'
        ]
      }
    },
    {
      id: 'task-closing-funds',
      title: 'Prepare Closing Funds',
      description: `Gathering the total amount you must bring to closing, including down payment, closing costs, prepaid taxes, insurance, and lender fees.

Why it matters:
If you don’t have full funds ready, closing cannot occur. Banks, attorneys, and sellers are all coordinated—delays can mean breach of contract.
`,
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Buyer',
      dependencies: ['task-closing-review', 'task-insurance-get-bids', 'task-homeowners-insurance'],
      instructions: {
        overview: 'Ensure sufficient, ready-to-send funds per your Closing Disclosure and Settlement Statement.',
        steps: [
          { step: 1, title: 'Review final figures', description: 'Closing Disclosure and Settlement Statement for “cash to close”', action: 'Confirm the total amount due' },
          { step: 2, title: 'Stage funds', description: 'Withdraw/transfer to the account you’ll wire from', action: 'Move money to the origin account' },
          { step: 3, title: 'Confirm bank limits', description: 'Daily wire limits and any special bank requirements', action: 'Call your bank to verify limits' },
          { step: 4, title: 'Plan backup method', description: 'Arrange cashier’s check if wiring isn’t possible', action: 'Confirm check is acceptable with escrow/attorney' }
        ],
        tips: [
          'Add a cushion ($500–$1,000)—wire fees or prorations can shift final numbers slightly.',
          'Wire a day before if possible—last-minute delays can be catastrophic.',
          'Keep proof of wire receipt from your bank.'
        ]
      }
    },
    {
      id: 'task-wire-funds',
      title: 'Wire Funds / Produce Cashier’s Check',
      description: `The actual transfer of money to escrow or the closing attorney for closing.

Why it matters:
No money, no deed. Funds must clear before title is transferred.
`,
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '1 day',
      assignedTo: 'Buyer',
      dependencies: ['task-closing-funds', 'task-escrow-wire-instructions'],
      instructions: {
        overview: 'Execute the transfer and confirm receipt so closing can fund on time.',
        steps: [
          { step: 1, title: 'Visit or contact your bank', description: 'Bring verified wire instructions to your bank', action: 'Present instructions and identity documents' },
          { step: 2, title: 'Authorize the transfer', description: 'Approve wire in person or online depending on bank policy', action: 'Complete authorization steps' },
          { step: 3, title: 'Get confirmation', description: 'Request confirmation number and receipt', action: 'Save proof of transmission' },
          { step: 4, title: 'Notify escrow/attorney', description: 'Let them know funds were sent and provide confirmation', action: 'Email confirmation with reference number' }
        ],
        tips: [
          'Send funds at least one business day before closing.',
          'Some banks require in-person authorization for large wires—schedule ahead.',
          'If cashier’s check is allowed, confirm it’s acceptable and bring it to closing.'
        ]
      }
    },
    {
      id: 'task-closing-meeting',
      title: 'Attend Closing',
      description: `The meeting where buyer and seller (or their representatives) sign all final documents and funds are disbursed.

Why it matters:
This is when ownership officially transfers. You’ll sign loan documents, deed, title forms, and tax documents. Once complete, you receive keys.
`,
      category: 'closing',
      priority: 'high',
      status: 'upcoming',
      estimatedTime: '2-3 hours',
      assignedTo: 'All Parties',
      dependencies: ['task-wire-funds'],
      instructions: {
        overview: 'Complete final signing accurately and verify the terms match your Closing Disclosure.',
        steps: [
          { step: 1, title: 'Bring ID', description: 'Government-issued ID (passport or driver’s license)', action: 'Have ID ready for notary/attorney' },
          { step: 2, title: 'Review documents', description: 'Loan note, mortgage/deed of trust, closing disclosure', action: 'Verify rate, payment, and escrow match prior disclosures' },
          { step: 3, title: 'Sign with notary/attorney', description: 'Execute all required forms', action: 'Sign where indicated and ask questions if unclear' },
          { step: 4, title: 'Receive copies', description: 'Obtain copies of all signed documents', action: 'Keep digital backups for your records' }
        ],
        tips: [
          'Closings can take 60–90 minutes—plan accordingly.',
          'Don’t rush—read what you’re signing and ask for explanations.',
          'Verify loan terms match your final Closing Disclosure.'
        ]
      }
    },

    {
      id: 'task-firpta-compliance',
      title: 'FIRPTA / Tax Compliance (Scenario: International Seller)',
      description: `Federal law requires withholding of a percentage of the sale price when the seller is a foreign person (Foreign Investment in Real Property Tax Act).

Why it matters:
If the seller is international and withholding isn’t handled properly, the IRS can pursue the buyer for unpaid tax.
`,
      category: 'closing',
      subcategory: 'legal',
      priority: 'high',
      status: 'upcoming',
      assignedTo: 'Attorney & Escrow',
      dependencies: ['task-open-escrow', 'task-closing-review'],
      instructions: {
        overview: 'Confirm seller residency status and ensure required tax withholding is made to stay compliant with IRS rules.',
        steps: [
          { step: 1, title: 'Confirm residency status', description: 'Obtain seller affidavits regarding tax residency', action: 'Have attorney/escrow collect and review' },
          { step: 2, title: 'Withhold funds if required', description: 'Escrow withholds required FIRPTA amount (often ~15%)', action: 'Calculate based on current IRS guidance' },
          { step: 3, title: 'Remit to IRS', description: 'Send withheld funds to the IRS per procedure', action: 'File appropriate forms and keep proof' }
        ],
        tips: [
          'Do not skip FIRPTA—buyers can be liable if withholding is not made.',
          'Confirm with your attorney if FIRPTA applies in your transaction.'
        ]
      }
    },
    {
      id: 'task-international-wire-clearance',
      title: 'International Wire Clearance (Scenario: International Buyer)',
      description: `Ensuring that large incoming funds from foreign accounts clear through U.S. banks in time for closing.

Why it matters:
International wires can take longer due to anti-money laundering checks. If delayed, you may breach contract by failing to fund closing on time.
`,
      category: 'closing',
      subcategory: 'financing',
      priority: 'high',
      status: 'upcoming',
      assignedTo: 'Buyer & Bank',
      dependencies: ['task-closing-funds', 'task-escrow-wire-instructions'],
      instructions: {
        overview: 'Begin international transfers early and coordinate with banks to ensure funds clear before closing.',
        steps: [
          { step: 1, title: 'Start transfer early', description: 'Initiate several days before closing', action: 'Allow for AML and compliance checks' },
          { step: 2, title: 'Provide details to bank', description: 'Share escrow account and wiring instructions early', action: 'Verify routing and intermediary bank details' },
          { step: 3, title: 'Track clearance', description: 'Monitor transfer status until cleared in the U.S.', action: 'Confirm receipt with escrow/attorney' }
        ],
        tips: [
          'Confirm your bank’s maximum daily transfer limits—may require multiple transfers.',
          'Work with U.S. correspondent banks for smoother transactions.'
        ]
      }
    },

    // Phase 7: Post-Closing
    {
      id: 'task-utilities-transfer',
      title: 'Transfer Utilities',
      description: `Switching electricity, gas, water, internet, and trash service into your name.

Why it matters:
If service lapses, you may face reconnection fees or find your home without power or water on move-in day.
`,
      category: 'post-closing',
      priority: 'medium',
      status: 'upcoming',
      estimatedTime: '2-3 hours',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Line up all utility services in advance to avoid gaps on move‑in day.',
        steps: [
          { step: 1, title: 'Contact providers 1–2 weeks prior', description: 'Call electricity, gas, water/sewer, internet, trash', action: 'Provide move-in date and service address' },
          { step: 2, title: 'Provide ID and proof', description: 'Driver’s license plus deed/closing statement or lease', action: 'Have documents ready for account setup' },
          { step: 3, title: 'Schedule activation', description: 'Target the day of or day after closing', action: 'Confirm technician windows if needed' }
        ],
        tips: [
          'Ask the seller for a list of current providers to speed the process.',
          'Don’t cancel utilities too early in your old home—schedule overlap for a smooth move.'
        ]
      }
    },
    {
      id: 'task-move-in',
      title: 'Move-In',
      description: `Physically relocating to your new home and getting it set up for daily living.

Why it matters:
Moving day sets the tone for your first weeks in the property. Poor planning causes stress and damage.
`,
      category: 'post-closing',
      priority: 'medium',
      status: 'upcoming',
      estimatedTime: '1-3 days',
      assignedTo: 'Buyer',
      dependencies: ['task-closing-meeting'],
      instructions: {
        overview: 'Plan movers, supplies, and timing so you’re ready once the deal has fully closed and recorded.',
        steps: [
          { step: 1, title: 'Book movers or truck', description: 'Reserve 2–3 weeks in advance', action: 'Confirm date/time and insurance coverage' },
          { step: 2, title: 'Pack and label', description: 'Pack room-by-room and label clearly', action: 'Protect fragile items and inventory boxes' },
          { step: 3, title: 'Move after confirmation', description: 'Only after closing is 100% confirmed', action: 'Avoid delivery before recording confirmation' },
          { step: 4, title: 'Pre-move clean', description: 'Clean home before moving furniture in', action: 'Wipe, vacuum, and sanitize surfaces' }
        ],
        tips: [
          'Photograph meter readings at move-in for accurate billing.',
          'Change locks immediately—old keys may still be circulating.',
          'Pack an “essentials box” for the first night (toiletries, bedding, tools, chargers).'
        ]
      }
    },
    {
      id: 'task-change-address',
      title: 'Change Address',
      description: `Updating your mailing address with USPS, banks, credit cards, employers, subscriptions, and government agencies.

Why it matters:
Missed mail could mean missed bills, late fees, or even compromised personal data.
`,
      category: 'post-closing',
      priority: 'medium',
      status: 'upcoming',
      estimatedTime: '2-3 hours',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Update forwarding and profile records everywhere to avoid missed bills and notices.',
        steps: [
          { step: 1, title: 'USPS change of address', description: 'File online or at the post office', action: 'Set start date and keep confirmation' },
          { step: 2, title: 'Update IDs and registrations', description: 'Driver’s license, voter registration, tax filings', action: 'Follow state/county processes' },
          { step: 3, title: 'Notify financials and employer', description: 'Banks, lenders, credit cards, insurance, employer', action: 'Update billing and contact info' },
          { step: 4, title: 'Update subscriptions and deliveries', description: 'Amazon, streaming, other services', action: 'Change shipping and billing addresses' }
        ],
        tips: [
          'USPS forwards mail for 12 months (letters) and 60 days (magazines)—still update with each company.',
          'Order new checks if you still use them.'
        ]
      }
    },
    {
      id: 'task-deed-recorded',
      title: 'Confirm Deed Recordation with County',
      description: `Verification that your deed has been officially recorded with the county clerk or recorder’s office. This makes you the legal owner of record.

Why it matters:
Until recorded, ownership technically remains with the seller. Mistakes or delays in recording can create title issues later (e.g., disputes, liens incorrectly attached).
`,
      category: 'post-closing',
      priority: 'medium',
      status: 'upcoming',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Confirm the deed is recorded and retain permanent proof of ownership.',
        steps: [
          { step: 1, title: 'Deed submitted', description: 'Escrow/attorney typically e-records after closing', action: 'Confirm submission timing' },
          { step: 2, title: 'Request confirmation', description: 'Recording receipt or stamped deed', action: 'Ask for official confirmation from escrow/attorney' },
          { step: 3, title: 'Store safely', description: 'Keep recorded deed in digital and physical formats', action: 'Back up copies in secure storage' }
        ],
        tips: [
          'Ask the county for a certified copy for long-term records.',
          'Confirm your property tax mailing address has been updated to yours.'
        ]
      }
    },
    {
      id: 'task-mortgage-servicer-setup',
      title: 'Set Up Mortgage Servicer Account',
      description: `Your loan will be serviced by a lender or third-party company. You need an online account to manage payments, escrow, and statements.

Why it matters:
Missing your first mortgage payment (usually due the month after closing) can harm credit. Having an account ensures you don’t miss deadlines.
`,
      category: 'post-closing',
      subcategory: 'financing',
      priority: 'medium',
      status: 'upcoming',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Create your servicer login early so payments and escrow run smoothly.',
        steps: [
          { step: 1, title: 'Watch for welcome package', description: 'Arrives ~2–4 weeks after closing', action: 'Follow instructions to register' },
          { step: 2, title: 'Create online account', description: 'Set up login and link bank account', action: 'Enable statements and notifications' },
          { step: 3, title: 'Verify escrow balances', description: 'Confirm taxes and insurance escrow amounts', action: 'Contact servicer if numbers look off' }
        ],
        tips: [
          'Servicing may transfer within months—only change payment details after a written notice from both old and new servicers.',
          'Set up autopay, but still review statements monthly for accuracy.'
        ]
      }
    },
    {
      id: 'task-tax-homestead',
      title: 'Apply for Homestead Exemption (if available)',
      description: `A property tax exemption offered in many states for primary residences, lowering your annual tax bill.

Why it matters:
Savings can be substantial—hundreds to thousands annually. But you must apply; it isn’t automatic.
`,
      category: 'post-closing',
      subcategory: 'legal',
      priority: 'medium',
      status: 'upcoming',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Check local eligibility and file on time to capture savings on your primary residence.',
        steps: [
          { step: 1, title: 'Check eligibility', description: 'County tax assessor’s website for rules', action: 'Confirm owner‑occupancy and ID requirements' },
          { step: 2, title: 'Submit application', description: 'Provide proof of residency (ID, utility bill, deed)', action: 'Upload/mail forms per county instructions' },
          { step: 3, title: 'Meet the deadline', description: 'Often within the first year of ownership', action: 'Add reminders so you don’t miss cutoff' }
        ],
        tips: [
          'Some states (e.g., Florida, Texas) offer generous homestead protections—don’t miss out.',
          'Ask about additional exemptions (senior, veteran, disability).'
        ]
      }
    },
    {
      id: 'task-warranty-transfer',
      title: 'Transfer Seller Warranties',
      description: `Ensuring warranties on systems, appliances, or roof transfer to you as the new owner.

Why it matters:
If something breaks shortly after closing, you may be covered—but only if warranties are properly transferred.
`,
      category: 'post-closing',
      priority: 'low',
      status: 'upcoming',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Collect and register warranties so coverage follows you after closing.',
        steps: [
          { step: 1, title: 'Gather documents', description: 'Request all warranty documents at closing', action: 'Keep copies with your deed and closing package' },
          { step: 2, title: 'Register products', description: 'Register online with manufacturers under your name', action: 'Provide serial numbers and purchase dates' },
          { step: 3, title: 'Note builder warranty', description: 'Track coverage period (often 1–10 years)', action: 'Calendar any inspection/warranty deadlines' }
        ],
        tips: [
          'Many appliance warranties require online registration within 30–90 days.',
          'Keep receipts and serial numbers in a digital file.'
        ]
      }
    },
    {
      id: 'task-home-maintenance',
      title: 'Set Up Home Maintenance Schedule',
      description: `Creating a recurring calendar of upkeep tasks (HVAC servicing, gutter cleaning, smoke detector checks, lawn care).

Why it matters:
Homes need regular maintenance. Neglect leads to costly repairs and reduced value. A structured plan keeps you ahead of issues.
`,
      category: 'post-closing',
      priority: 'low',
      status: 'upcoming',
      estimatedTime: '1-2 hours',
      assignedTo: 'Buyer',
      instructions: {
        overview: 'Turn one-time move-in into long-term ownership with a plan for routine upkeep.',
        steps: [
          { step: 1, title: 'List seasonal tasks', description: 'HVAC service, roof/gutter checks, winterization, landscaping', action: 'Create a master checklist' },
          { step: 2, title: 'Schedule reminders', description: 'Add recurring events to your calendar/app', action: 'Assign monthly/quarterly/annual frequencies' },
          { step: 3, title: 'Track work and receipts', description: 'Maintain a maintenance log', action: 'Store contractor invoices and photos' }
        ],
        tips: [
          'Budget 1–3% of home value annually for maintenance/repairs.',
          'Join local homeowner groups for contractor recommendations.',
          'Schedule big tasks (HVAC, gutters) during off-peak times for better pricing.'
        ]
      }
    }
  ];

  // Assign tags to tasks for filtering
  const tagsById: Record<string, string[]> = {
    // Legal
    'task-offer-acceptance-signing': ['legal'],
    'task-contract-review': ['legal'],
    'task-attorney-selection': ['legal'],
    'task-contract-riders': ['legal'],
    'task-send-lawyer-signed-contract': ['legal'],
    'task-earnest-money-deposit': ['legal'],
    'task-title-search': ['legal'],
'task-closing-review': ['legal'],
    'task-open-escrow': ['legal'],

    // Scenario-specific
    'task-historic-preservation-review': ['legal', 'scenario-historic'],
    'task-as-is-sale-terms': ['legal', 'scenario-as-is'],
    'task-probate-approval': ['legal', 'scenario-probate'],
    'task-divorce-order': ['legal', 'scenario-divorce'],
    'task-short-sale-approval': ['legal', 'scenario-short-sale'],
    'task-reo-bank-addenda': ['legal', 'scenario-reo'],
    'task-auction-register': ['scenario-auction'],
    'task-auction-deposit': ['legal', 'scenario-auction'],
    'task-bankruptcy-approval': ['legal', 'scenario-bankruptcy'],
    'task-gov-addenda': ['legal', 'scenario-gov-owned'],
    'task-firpta-compliance': ['legal', 'scenario-international-seller'],
    'task-international-wire-clearance': ['financing', 'scenario-international-buyer'],

    // Financing / Mortgage
    'task-probate-approval': ['legal', 'scenario-probate'],
    'task-divorce-order': ['legal', 'scenario-divorce'],
    'task-short-sale-approval': ['legal', 'scenario-short-sale'],
    'task-reo-bank-addenda': ['legal', 'scenario-reo'],
    'task-auction-register': ['scenario-auction'],
    'task-auction-deposit': ['legal', 'scenario-auction'],
    'task-bankruptcy-approval': ['legal', 'scenario-bankruptcy'],
    'task-gov-addenda': ['legal', 'scenario-gov-owned'],

    // Financing / Mortgage
'task-mortgage-preapproval': ['financing'],
    'task-proof-of-funds': ['financing'],
    'task-send-offer-to-lender': ['financing'],
    'task-shop-mortgage-terms': ['financing'],
    'task-mortgage-application': ['financing'],
    'task-appraisal': ['financing'],
    'task-rate-lock': ['financing'],
    'task-underwriting-conditions': ['financing'],
    'task-closing-funds': ['financing'],
    'task-wire-funds': ['financing'],

    // Inspections
    'task-shop-inspectors': ['inspections'],
    'task-home-inspection': ['inspections'],
    'task-schedule-specialized-inspections': ['inspections'],
    'task-review-inspection-results': ['inspections'],
    'task-submit-repair-requests': ['inspections'],
    'task-finalize-inspection-remedies': ['inspections'],
    'task-confirm-repairs-complete': ['inspections'],
    'task-schedule-final-walkthrough': ['inspections'],
    'task-final-walkthrough': ['inspections'],
    'task-renegotiate-new-findings': ['inspections'],

    // Insurance
    'task-insurance-get-bids': ['insurance'],
    'task-homeowners-insurance': ['insurance'],

    // General / Buyer Tasks
    'task-buy-box-template': ['general'],
    'task-agent-selection': ['general'],
'task-property-search': ['general'],
    'task-property-tours': ['general'],
'task-mls-listing-pdf': ['general'],
    'task-draft-offer': ['general'],
    'task-market-analysis': ['general'],
    'task-submit-offer': ['general'],
    'task-offer-negotiation': ['general'],
    'task-escrow-wire-instructions': ['general'],
    'task-closing-meeting': ['general'],
    'task-utilities-transfer': ['general'],
    'task-move-in': ['general'],
    'task-change-address': ['general'],
'task-home-maintenance': ['general'],

    // Post-closing enhancements
    'task-deed-recorded': ['general'],
    'task-mortgage-servicer-setup': ['financing'],
    'task-tax-homestead': ['legal'],
    'task-warranty-transfer': ['general'],
  };

  tasks.forEach((t) => {
    const tags = tagsById[t.id] || [];
    const fromSub = t.subcategory ? [t.subcategory] : [];
    const merged = Array.from(new Set([...(tags.map(s => s.toLowerCase())), ...(fromSub.map(s => s.toLowerCase()))]));
    if (merged.length > 0) t.tags = merged;
  });

  // Scheduling rules per task (anchor + offset days). Anchor missing -> fallback to today offsets below.
  const scheduleRules: Record<string, { anchor: 'acceptance' | 'closing' | 'today'; offset: number }> = {
    'task-buy-box-template': { anchor: 'today', offset: 0 },
    'task-proof-of-funds': { anchor: 'today', offset: 2 },
    'task-mortgage-preapproval': { anchor: 'today', offset: 3 },
    'task-mls-listing-pdf': { anchor: 'today', offset: 1 },
    'task-property-search': { anchor: 'today', offset: 0 },
    'task-property-tours': { anchor: 'today', offset: 0 },
    'task-market-analysis': { anchor: 'today', offset: 1 },
'task-submit-offer': { anchor: 'today', offset: 2 },
    'task-draft-offer': { anchor: 'today', offset: 2 },

    'task-offer-acceptance-signing': { anchor: 'acceptance', offset: 0 },
    'task-attorney-selection': { anchor: 'acceptance', offset: 2 },
    'task-contract-riders': { anchor: 'acceptance', offset: 3 },
    'task-send-lawyer-signed-contract': { anchor: 'acceptance', offset: 3 },
    'task-open-escrow': { anchor: 'acceptance', offset: 1 },
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
    'task-rate-lock': { anchor: 'acceptance', offset: 12 },
    'task-underwriting-conditions': { anchor: 'acceptance', offset: 21 },

    // Scenario-specific scheduling
    'task-historic-preservation-review': { anchor: 'acceptance', offset: 3 },
    'task-as-is-sale-terms': { anchor: 'acceptance', offset: 1 },
    'task-probate-approval': { anchor: 'acceptance', offset: 2 },
    'task-divorce-order': { anchor: 'acceptance', offset: 1 },
    'task-short-sale-approval': { anchor: 'acceptance', offset: 1 },
    'task-reo-bank-addenda': { anchor: 'acceptance', offset: 0 },
    'task-auction-register': { anchor: 'today', offset: 0 },
    'task-auction-deposit': { anchor: 'acceptance', offset: 0 },
    'task-bankruptcy-approval': { anchor: 'acceptance', offset: 2 },
    'task-gov-addenda': { anchor: 'today', offset: 2 },
    'task-firpta-compliance': { anchor: 'acceptance', offset: 5 },
    'task-international-wire-clearance': { anchor: 'closing', offset: -5 },

    'task-insurance-get-bids': { anchor: 'acceptance', offset: 7 },
    'task-homeowners-insurance': { anchor: 'acceptance', offset: 22 },
    'task-elevation-certificate': { anchor: 'acceptance', offset: 8 },
    'task-bind-flood-insurance': { anchor: 'acceptance', offset: 24 },
    'task-probate-approval': { anchor: 'acceptance', offset: 2 },
    'task-divorce-order': { anchor: 'acceptance', offset: 1 },
    'task-short-sale-approval': { anchor: 'acceptance', offset: 1 },
    'task-reo-bank-addenda': { anchor: 'acceptance', offset: 0 },
    'task-auction-register': { anchor: 'today', offset: 0 },
    'task-auction-deposit': { anchor: 'acceptance', offset: 0 },
    'task-bankruptcy-approval': { anchor: 'acceptance', offset: 2 },
    'task-gov-addenda': { anchor: 'today', offset: 2 },

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
    'task-proof-of-funds': 2,
    'task-mortgage-preapproval': 3,
    'task-mls-listing-pdf': 1,
    'task-property-search': 0,
    'task-property-tours': 0,
'task-submit-offer': 2,
    'task-draft-offer': 2,
    'task-offer-acceptance-signing': 5,
    'task-attorney-selection': 7,
    'task-contract-riders': 9,
    'task-send-lawyer-signed-contract': 9,
    'task-open-escrow': 6,
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
    'task-rate-lock': 16,
    'task-underwriting-conditions': 24,
    'task-elevation-certificate': 13,
    'task-bind-flood-insurance': 26,
    // Scenario-specific fallback offsets
    'task-probate-approval': 18,
    'task-divorce-order': 17,
    'task-short-sale-approval': 17,
    'task-reo-bank-addenda': 16,
    'task-auction-register': 0,
    'task-auction-deposit': 5,
    'task-bankruptcy-approval': 18,
    'task-gov-addenda': 3,
    'task-firpta-compliance': 21,
    'task-international-wire-clearance': 29,
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

  const getTasksByTag = (tag: string): Task[] => {
    const needle = (tag || '').toLowerCase();
    if (!needle || needle === 'all') return tasks;
    return tasks.filter(task => {
      const tags = (task.tags || []).map(t => t.toLowerCase());
      return tags.includes(needle) || (task.subcategory || '').toLowerCase() === needle;
    });
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
    getTasksByTag,
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
