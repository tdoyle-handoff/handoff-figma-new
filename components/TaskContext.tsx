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
      title: 'Schedule Specialized Inspections',
      description: `What it is: Targeted evaluations for issues outside the scope of a general inspection, such as radon, mold, lead paint, pest infestations, septic systems, well water quality, asbestos, sewer lines, or structural engineering.

Why it matters: Certain risks are property-specific. Rural homes often need septic inspections; older homes may need asbestos checks; wooded areas may require pest assessments. Skipping these can expose you to hidden health and financial risks.

How to complete it:
- Review general inspection results to decide which specialized inspections are necessary.
- Ask your inspector or agent for vetted specialists.
- Schedule before your inspection contingency expires.
- Get written reports with test results and recommendations.`,
      category: 'diligence',
      subcategory: 'inspections',
      priority: 'medium',
      status: isUnderContract ? 'pending' : 'upcoming',
      assignedTo: 'Buyer',
      dependencies: ['task-home-inspection'],
      instructions: {
        overview: 'Order targeted inspections guided by the general findings and property type.',
        steps: [
          { step: 1, title: 'Review general report', description: 'Identify areas needing deeper evaluation', action: 'List required specialties' },
          { step: 2, title: 'Select specialists', description: 'Use referrals from inspector/agent', action: 'Vet credentials and availability' },
          { step: 3, title: 'Schedule promptly', description: 'Complete before contingency deadline', action: 'Calendar tests (e.g., 48-hour radon)' },
          { step: 4, title: 'Collect reports', description: 'Obtain written results and recommendations', action: 'File in your transaction folder' }
        ],
        tips: [
          'Sewer line scoping is often overlooked but can prevent >$10k surprises.',
          'Radon tests usually take ~48 hours—plan this into your timeline.',
          'In condos/co-ops, some tests (pest, sewer line) may be unnecessary—focus on building-level maintenance.'
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
      id: 'task-deed-recorded',
      title: 'Confirm Deed Recordation with County',
      description: 'Verify the deed is recorded and obtain a copy for your records.',
      category: 'post-closing',
      priority: 'medium',
      status: 'upcoming',
      assignedTo: 'Buyer'
    },
    {
      id: 'task-mortgage-servicer-setup',
      title: 'Set Up Mortgage Servicer Account',
      description: 'Create your mortgage servicer account and enroll in autopay if desired.',
      category: 'post-closing',
      subcategory: 'financing',
      priority: 'medium',
      status: 'upcoming',
      assignedTo: 'Buyer'
    },
    {
      id: 'task-tax-homestead',
      title: 'Apply for Homestead Exemption (if applicable)',
      description: 'File for homestead or other primary residence tax exemptions with your county.',
      category: 'post-closing',
      subcategory: 'legal',
      priority: 'medium',
      status: 'upcoming',
      assignedTo: 'Buyer'
    },
    {
      id: 'task-warranty-transfer',
      title: 'Transfer Seller Warranties',
      description: 'Ensure appliance, roof, and builder warranties are transferred to your name.',
      category: 'post-closing',
      priority: 'low',
      status: 'upcoming',
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

    // Financing / Mortgage
'task-mortgage-preapproval': ['financing'],
    'task-proof-of-funds': ['financing'],
    'task-send-offer-to-lender': ['financing'],
    'task-shop-mortgage-terms': ['financing'],
    'task-mortgage-application': ['financing'],
    'task-appraisal': ['financing'],
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
