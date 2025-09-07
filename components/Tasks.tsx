import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle, Calendar, User, Users, ArrowRight, Filter, ChevronDown, ChevronRight, ExternalLink, Scale, Calculator, FileCheck, Shield, CheckSquare, Lock, Unlock, Search as SearchIcon, Home, FileText, KeyRound, Plus, X, Info, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useIsMobile } from './ui/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Switch } from './ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import ChecklistSidebar from './checklist/ChecklistSidebar';
import ChecklistDetail from './checklist/ChecklistDetail';
import ChecklistCalendar from './checklist/ChecklistCalendar';
import ChecklistKanban from './checklist/ChecklistKanban';
import { useTaskContext, Task, TaskPhase } from './TaskContext';
import { usePropertyContext } from './PropertyContext';
import InsuranceCalculator from './InsuranceCalculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { scenarioSchema } from '../utils/scenarioSchema';
import { getSelectedScenarios as getScenarioKeys, setSelectedScenarios as saveScenarioSelection } from '../utils/scenarioEngine';

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

// Default, lightweight tips to help buyers when a task lacks explicit instructions
const defaultTipsForTask = (task: Task): string[] => {
  const tips: string[] = [];
  if (!task.assignedTo) tips.push('Assign this task to the right person.');
  if (!task.dueDate) tips.push('Add a due date and lock it if it is fixed.');
  if (['offer','contract','diligence','closing'].includes(task.category)) tips.push('Attach related documents for easier tracking.');
  if ((task.subcategory || '').toLowerCase() === 'legal') tips.push('Consult your attorney and keep their contact info up to date.');
  if ((task.subcategory || '').toLowerCase() === 'inspections') tips.push('Schedule early and leave time for follow-ups.');
  if ((task.subcategory || '').toLowerCase() === 'insurance') tips.push('Ask for quotes from multiple providers and compare coverage.');
  if (tips.length === 0) tips.push('Review the details and check this off when done.');
  return tips;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days`;
  // m/dd/yy fallback
  const m = String(date.getMonth() + 1);
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${m}/${dd}/${yy}`;
};

// m/dd/yy for table cells
const formatShortDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const m = String(d.getMonth() + 1); // no leading zero
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${m}/${dd}/${yy}`;
};

const daysLeft = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const today = new Date();
  // normalize to midnight
  d.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 1) return `${diff} days left`;
  if (diff === 1) return `1 day left`;
  if (diff === 0) return `Due today`;
  if (diff === -1) return `1 day overdue`;
  return `${Math.abs(diff)} days overdue`;
};

const priorityLabel = (p: Task['priority']) => {
  if (p === 'high') return 'High';
  if (p === 'medium') return 'Medium';
  return 'Low';
};

const priorityPill = (p: Task['priority']) => {
  const common = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border';
  if (p === 'high') return `${common} bg-red-50 text-red-700 border-red-200`;
  if (p === 'medium') return `${common} bg-amber-50 text-amber-700 border-amber-200`;
  return `${common} bg-green-50 text-green-700 border-green-200`;
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    'active': 'In-Progress',
    'in-progress': 'In-Progress',
    'completed': 'Completed',
    'upcoming': 'Upcoming',
    'overdue': 'Overdue',
  };
  if (!s) return '';
  return map[s] || s.charAt(0).toUpperCase() + s.slice(1);
};

// Small colored status dot for quick scan
const StatusDot = ({ status }: { status: Task['status'] }) => {
  const color = status === 'completed'
    ? 'bg-green-500'
    : (status === 'active' || status === 'in-progress')
      ? 'bg-blue-500'
      : status === 'overdue'
        ? 'bg-red-500'
        : 'bg-gray-400';
  const label = statusLabel(status);
  return (
    <span className="inline-flex items-center gap-1" title={label}>
      <span aria-hidden className={`inline-block w-3.5 h-3.5 rounded-full ${color}`} />
      <span className="sr-only">{label}</span>
    </span>
  );
};

// Assignee avatars (initials), derived from task.contacts once info is entered
const roleAliases: Record<string, string[]> = {
  buyer: ['buyer', 'you', 'client'],
  agent: ['agent', "buyer's agent", 'buyers agent', 'realtor'],
  lender: ['lender', 'loan officer', 'mortgage'],
  attorney: ['attorney', 'lawyer'],
  title: ['title', 'title company'],
};
const normalize = (s: string) => (s || '').toLowerCase();
const roleKeysFromAssigned = (assigned?: string): string[] => {
  const a = normalize(assigned || '');
  if (!a) return [];
  if (a.includes('all')) return ['buyer','agent','lender','attorney','title'];
  if (a.includes('buyer & agent') || a.includes('buyer and agent')) return ['buyer','agent'];
  if (a.includes('buyer')) return ['buyer'];
  if (a.includes('agent')) return ['agent'];
  if (a.includes('lender')) return ['lender'];
  if (a.includes('attorney')) return ['attorney'];
  if (a.includes('title')) return ['title'];
  return [];
};
const findContactForRole = (task: Task, roleKey: string) => {
  const aliases = roleAliases[roleKey] || [roleKey];
  const contacts = task.contacts || [];
  return contacts.find(c => aliases.some(al => normalize(c.role || '').includes(al))) || null;
};
const initialsFromName = (name?: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || first.toUpperCase();
};
const getAssigneeAvatars = (task: Task): { initials: string; title: string }[] => {
  const roles = roleKeysFromAssigned(task.assignedTo);
  const out: { initials: string; title: string }[] = [];
  roles.slice(0, 3).forEach(r => {
    const contact = findContactForRole(task, r);
    const init = contact ? initialsFromName(contact.name) : (r[0] || '?').toUpperCase();
    out.push({ initials: init, title: contact?.name || r });
  });
  if (out.length === 0 && task.assignedTo) {
    out.push({ initials: (task.assignedTo[0] || '?').toUpperCase(), title: task.assignedTo });
  }
  return out;
};

// Sort tasks so dependencies appear before dependents (within the provided set)
const sortTasksByDependencies = (tasks: Task[], tasksById: Record<string, Task> = {}): Task[] => {
  const ids = new Set(tasks.map(t => t.id));
  const inDeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  tasks.forEach(t => { inDeg.set(t.id, 0); adj.set(t.id, []); });
  tasks.forEach(t => {
    const deps = (t.dependencies || []).filter(d => ids.has(d));
    inDeg.set(t.id, (inDeg.get(t.id) || 0) + deps.length);
    deps.forEach(d => {
      const arr = adj.get(d) || [];
      arr.push(t.id);
      adj.set(d, arr);
    });
  });
  const origOrder = tasks.map(t => t.id);
  const queue: string[] = origOrder.filter(id => (inDeg.get(id) || 0) === 0);
  const outIds: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    outIds.push(id);
    for (const nei of (adj.get(id) || [])) {
      inDeg.set(nei, (inDeg.get(nei)! - 1));
      if ((inDeg.get(nei) || 0) === 0) queue.push(nei);
    }
  }
  if (outIds.length < tasks.length) {
    for (const id of origOrder) if (!outIds.includes(id)) outIds.push(id);
  }
  const byId: Record<string, Task> = {};
  tasks.forEach(t => { byId[t.id] = t; });
  return outIds.map(id => byId[id]).filter(Boolean);
};

const ExpandableTaskCard = ({ task, onNavigate, onUpdateTask, onUpdateTaskFields, tasksById, minimal, openInWindow, onOpenModal, forceOpen, row }: {
  task: Task;
  onNavigate: (page: string) => void;
  onUpdateTask?: (taskId: string, status: Task['status']) => void;
  onUpdateTaskFields?: (taskId: string, updates: Partial<Task>) => void;
  tasksById?: Record<string, Task>;
  minimal?: boolean;
  openInWindow?: boolean;
  onOpenModal?: (task: Task) => void;
  forceOpen?: boolean;
  row?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const autoSaveTimerRef = React.useRef<number | null>(null);
  React.useEffect(() => { if (forceOpen) setIsOpen(true); }, [forceOpen]);
  const isCompleted = task.status === 'completed';
  const isActive = ['active', 'in-progress', 'overdue'].includes(task.status);
  const isOverdue = task.status === 'overdue';
  const effectiveTips = (task.instructions?.tips && task.instructions.tips.length > 0) ? task.instructions.tips : defaultTipsForTask(task);

  // Derive Overview / Why It Matters / How to Complete for in-card details
  const descParts = React.useMemo(() => {
    const desc = task.description || '';
    const getIdx = (label: string) => desc.indexOf(label);
    const markers = ["What it is:", "Why it matters:", "How to complete it:"];
    const idxWhat = getIdx(markers[0]);
    const idxWhy = getIdx(markers[1]);
    const idxHow = getIdx(markers[2]);
    const end = desc.length;
    const slice = (start: number, end: number) => desc.slice(start, end).trim();
    const parts: { what?: string; why?: string; how?: string } = {};
    if (idxWhat >= 0) {
      const next = [idxWhy, idxHow].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? end;
      parts.what = slice(idxWhat + markers[0].length, next);
    }
    if (idxWhy >= 0) {
      const next = [idxHow].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? end;
      parts.why = slice(idxWhy + markers[1].length, next);
    }
    if (idxHow >= 0) {
      parts.how = slice(idxHow + markers[2].length, end);
    }
    return parts;
  }, [task.description]);
  const whatInfo = task.instructions?.what || (task as any).instructions?.overview || descParts.what;
  const whyInfo = task.instructions?.why || descParts.why;
  const hasStepsInfo = Array.isArray(task.instructions?.steps) && (task.instructions!.steps.length > 0);
  const howTextInfo = !hasStepsInfo ? descParts.how : undefined;
  const renderBulleted = (text?: string) => {
    if (!text) return null;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const items = lines.filter(l => /^[-•]/.test(l));
    if (items.length > 0) {
      return (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-gray-400">•</span>
              <span className="text-gray-700">{it.replace(/^[-•]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-sm text-gray-700 whitespace-pre-line">{text}</p>;
  };

  // Local editable state
  const [editTitle, setEditTitle] = useState<string>(task.title);
  const [editAssignedTo, setEditAssignedTo] = useState<string>(task.assignedTo || '');
  const [editDocuments, setEditDocuments] = useState<string[]>(task.documents || []);
  const [attachments, setAttachments] = useState<Array<{ name: string; url?: string; type?: string; size?: number }>>(
    (task.customFields?.attachments as any) || []
  );

  // Contract-specific state for offer submission
  const [contractPdfUrl, setContractPdfUrl] = useState<string | undefined>((task.customFields?.contractPdfUrl as any) || undefined);
  const [contractPrice, setContractPrice] = useState<string>((task.customFields?.contractDetails?.purchasePrice as any) || '');
  const [contractEarnest, setContractEarnest] = useState<string>((task.customFields?.contractDetails?.earnestAmount as any) || '');
  const [contractAcceptance, setContractAcceptance] = useState<string>((task.customFields?.contractDetails?.acceptanceDate as any) || '');
  const [contractClosing, setContractClosing] = useState<string>((task.customFields?.contractDetails?.closingDate as any) || '');
  const [contractInspectionDays, setContractInspectionDays] = useState<string>((task.customFields?.contractDetails?.inspectionDays as any) || '');
  const [contractFinancingDays, setContractFinancingDays] = useState<string>((task.customFields?.contractDetails?.financingDays as any) || '');
  const [editDueDate, setEditDueDate] = useState<string>(task.dueDate || '');
  const [editNotes, setEditNotes] = useState<string>(task.notes || '');
  const currentAttorney = (task.contacts || []).find(c => c.role.toLowerCase().includes('attorney'));

  // Insurance (homeowners) task state
  const [openInsuranceCalc, setOpenInsuranceCalc] = useState(false);
  const [insProvider, setInsProvider] = useState<string>((task as any).customFields?.insurance?.provider || '');
  const [insPolicyNumber, setInsPolicyNumber] = useState<string>((task as any).customFields?.insurance?.policyNumber || '');
  const [insCoverage, setInsCoverage] = useState<string>((task as any).customFields?.insurance?.coverage || '');
  const [insPremium, setInsPremium] = useState<string>((task as any).customFields?.insurance?.premium || '');
  const [insEffectiveDate, setInsEffectiveDate] = useState<string>((task as any).customFields?.insurance?.effectiveDate || '');
  const [insurancePolicies, setInsurancePolicies] = useState<Array<{ name: string; url?: string; type?: string; size?: number }>>(((task as any).customFields?.insurance?.policies) || []);

  const persistInsurance = React.useCallback(() => {
    if (!onUpdateTaskFields) return;
    const updates: Partial<Task> = {
      customFields: {
        ...(task as any).customFields,
        insurance: {
          provider: insProvider || undefined,
          policyNumber: insPolicyNumber || undefined,
          coverage: insCoverage || undefined,
          premium: insPremium || undefined,
          effectiveDate: insEffectiveDate || undefined,
          policies: insurancePolicies
        }
      } as any
    };
    onUpdateTaskFields(task.id, updates);
    try { window.dispatchEvent(new Event('tasksUpdated')); } catch {}
  }, [onUpdateTaskFields, task, insProvider, insPolicyNumber, insCoverage, insPremium, insEffectiveDate, insurancePolicies]);
  const [attorneyName, setAttorneyName] = useState<string>(currentAttorney?.name || '');
  const [attorneyEmail, setAttorneyEmail] = useState<string>(currentAttorney?.email || '');
  const [attorneyPhone, setAttorneyPhone] = useState<string>(currentAttorney?.phone || '');
  const [dueLocked, setDueLocked] = useState<boolean>(!!task.dueDateLocked);

  // Agent info (for agent selection)
  const currentAgent = (task.contacts || []).find(c => (c.role || '').toLowerCase().includes('agent'));
  const [agentName, setAgentName] = useState<string>((currentAgent as any)?.name || '');
  const [agentEmail, setAgentEmail] = useState<string>((currentAgent as any)?.email || '');
  const [agentPhone, setAgentPhone] = useState<string>((currentAgent as any)?.phone || '');
  const [agentBrokerage, setAgentBrokerage] = useState<string>((task as any).customFields?.agent?.brokerage || '');

  // Lender / pre-approval info
  const pre = ((task as any).customFields?.preApproval) || {};
  const [lenderNamePA, setLenderNamePA] = useState<string>(pre.lenderName || '');
  const [preApprovalAmount, setPreApprovalAmount] = useState<string>(pre.amount || '');
  const [preApprovalRate, setPreApprovalRate] = useState<string>(pre.rate || '');
  const [preApprovalExpiry, setPreApprovalExpiry] = useState<string>(pre.expirationDate || '');

  // Inspections state (scheduled + issues + negotiations + remedies)
  type ScheduledInspection = { id: string; type?: string; title?: string; date?: string; time?: string; provider?: string; company?: string; phone?: string; cost?: string; notes?: string };
  type InspectionIssue = { id: string; category?: string; severity?: 'high'|'medium'|'low'; issue?: string; description?: string; recommendation?: string; cost?: string; status?: 'identified'|'negotiating'|'resolved'|'accepted'; resolution?: string; negotiationNotes?: string[] };
  type NegotiationRequest = { id: string; description?: string; requestType?: 'repair'|'credit'; amount?: string; status?: 'submitted'|'accepted'|'rejected'|'pending' };
  type RemedyItem = { id: string; description?: string; dueDate?: string; party?: 'seller'|'buyer'; status?: 'pending'|'completed' };

  const inspectionsCF: any = (task as any).customFields?.inspections || {};
  const [scheduledInspections, setScheduledInspections] = useState<ScheduledInspection[]>(inspectionsCF.scheduled || []);
  const [inspectionIssues, setInspectionIssues] = useState<InspectionIssue[]>(inspectionsCF.issues || []);
  const [inspectionNegotiations, setInspectionNegotiations] = useState<NegotiationRequest[]>(inspectionsCF.negotiations || []);
  const [inspectionRemedies, setInspectionRemedies] = useState<RemedyItem[]>(inspectionsCF.remedies || []);
  const [inspectionReports, setInspectionReports] = useState<Array<{ name: string; url?: string; type?: string; size?: number }>>(inspectionsCF.reports || []);

  const persistInspectionFields = React.useCallback(() => {
    if (!onUpdateTaskFields) return;
    const prev = ((task as any).customFields?.inspections) || {};
    const next = {
      ...prev,
      ...(scheduledInspections ? { scheduled: scheduledInspections } : {}),
      ...(inspectionIssues ? { issues: inspectionIssues } : {}),
      ...(inspectionNegotiations ? { negotiations: inspectionNegotiations } : {}),
      ...(inspectionRemedies ? { remedies: inspectionRemedies } : {}),
      ...(inspectionReports ? { reports: inspectionReports } : {}),
    };
    const updates: Partial<Task> = {
      customFields: {
        ...(task as any).customFields,
        inspections: next,
      } as any,
    };
    onUpdateTaskFields(task.id, updates);
    try { window.dispatchEvent(new Event('tasksUpdated')); } catch {}
  }, [onUpdateTaskFields, task, scheduledInspections, inspectionIssues, inspectionNegotiations, inspectionRemedies, inspectionReports]);

  // Build updates object from current local state (reused by Save and autosave)
  const buildUpdatesFromState = React.useCallback((): Partial<Task> => {
    const updates: Partial<Task> = {
      title: editTitle,
      assignedTo: editAssignedTo,
      dueDate: editDueDate || undefined,
      dueDateLocked: editDueDate ? dueLocked : false,
      notes: editNotes,
      documents: editDocuments,
      customFields: {
        ...(task as any).customFields,
        attachments,
        ...(contractPdfUrl ? { contractPdfUrl } : {}),
      } as any,
    };

    // Contract details + schedule anchors
    if (task.id === 'task-submit-offer') {
      const details: any = {
        purchasePrice: contractPrice,
        earnestAmount: contractEarnest,
        acceptanceDate: contractAcceptance,
        closingDate: contractClosing,
        inspectionDays: contractInspectionDays,
        financingDays: contractFinancingDays,
      };
      (updates as any).customFields = {
        ...((updates as any).customFields || (task as any).customFields),
        contractDetails: details,
      };
    }

    // Merge agent details
    if (task.id === 'task-agent-selection') {
      const agent = (agentName || agentEmail || agentPhone || agentBrokerage) ? {
        name: agentName,
        role: 'Agent',
        email: agentEmail || undefined,
        phone: agentPhone || undefined,
        when: 'General representation',
      } : undefined;
      if (agent) {
        const others = (task.contacts || []).filter(c => !(c.role && c.role.toLowerCase().includes('agent')));
        (updates as any).contacts = [...others, agent as any];
      }
      (updates as any).customFields = {
        ...((updates as any).customFields || (task as any).customFields),
        agent: { brokerage: agentBrokerage }
      };
    }

    // Merge pre-approval details
    if (task.id === 'task-mortgage-preapproval') {
      (updates as any).customFields = {
        ...((updates as any).customFields || (task as any).customFields),
        preApproval: {
          lenderName: lenderNamePA,
          amount: preApprovalAmount,
          rate: preApprovalRate,
          expirationDate: preApprovalExpiry,
        }
      };

      if (lenderNamePA) {
        const lenderContact = {
          name: lenderNamePA,
          role: 'Lender',
          when: 'Pre-approval / financing',
        } as any;
        const others = (task.contacts || []).filter(c => !(c.role && c.role.toLowerCase().includes('lender')));
        (updates as any).contacts = [...(updates as any).contacts || others, lenderContact];
      }
    }

    // Attorney contact (for attorney selection and general legal tasks)
    const newAttorney = (attorneyName || attorneyEmail || attorneyPhone) ? {
      name: attorneyName,
      role: 'Attorney',
      email: attorneyEmail || undefined,
      phone: attorneyPhone || undefined,
      when: 'Contract review',
    } : undefined;
    if (newAttorney) {
      const others = (task.contacts || []).filter(c => !(c.role && c.role.toLowerCase().includes('attorney')));
      (updates as any).contacts = [...((updates as any).contacts || others), newAttorney as any];
    }

    return updates;
  }, [
    editTitle,
    editAssignedTo,
    editDueDate,
    dueLocked,
    editNotes,
    editDocuments,
    attachments,
    contractPdfUrl,
    contractPrice,
    contractEarnest,
    contractAcceptance,
    contractClosing,
    contractInspectionDays,
    contractFinancingDays,
    agentName,
    agentEmail,
    agentPhone,
    agentBrokerage,
    lenderNamePA,
    preApprovalAmount,
    preApprovalRate,
    preApprovalExpiry,
    attorneyName,
    attorneyEmail,
    attorneyPhone,
    task
  ]);

  const triggerAutoSave = React.useCallback(() => {
    if (!onUpdateTaskFields) return;
    const updates = buildUpdatesFromState();
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(() => {
      onUpdateTaskFields(task.id, updates);
      try { window.dispatchEvent(new Event('tasksUpdated')); } catch {}
    }, 400) as unknown as number;
  }, [buildUpdatesFromState, onUpdateTaskFields, task.id]);


  const getQuestionnaireData = () => {
    try {
      const a = localStorage.getItem('handoff-pre-questionnaire');
      if (a) return JSON.parse(a);
    } catch {}
    try {
      const b = localStorage.getItem('handoff-property-data');
      if (b) return JSON.parse(b);
    } catch {}
    return null;
  };

  const handleDownloadQuestionnairePDF = () => {
    const data = getQuestionnaireData();
    const w = window.open('', '_blank');
    if (!w) return;
    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Property Questionnaire</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            h2 { font-size: 16px; margin: 16px 0 8px; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #ddd; padding: 8px; font-size: 12px; vertical-align: top; }
          </style>
        </head>
        <body>
          <h1>Property Questionnaire</h1>
          ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : '<p>No questionnaire data found.</p>'}
          <script>window.onload = () => window.print();</script>
        </body>
      </html>`;
    w.document.write(html);
    w.document.close();
  };

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

  const openTaskPopup = () => {
    const w = window.open('', '_blank', 'width=860,height=720,resizable=yes,scrollbars=yes');
    if (!w) return;
    const taskJson = JSON.stringify(task);
    const html = `<!doctype html>
<html><head><meta charset="utf-8" />
<title>${task.title.replace(/</g,'&lt;')}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;margin:0;padding:16px;background:#fff;color:#111}
  .hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  h1{font-size:18px;margin:0}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  label{font-size:12px;color:#555;display:block;margin-bottom:4px}
  input[type="text"],input[type="email"],input[type="date"],textarea{width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:8px;font-size:13px}
  textarea{min-height:90px;resize:vertical}
  .row{margin:10px 0}
  .btns{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
  button{border-radius:8px;border:1px solid #ddd;background:#f9fafb;padding:8px 12px;font-size:13px;cursor:pointer}
  button.primary{background:#0ea5e9;color:#fff;border-color:#0ea5e9}
  .chip{display:inline-block;padding:2px 8px;border-radius:999px;background:#f3f4f6;color:#374151;font-size:11px;margin-right:6px}
  .tips{margin-top:8px}
  .tips li{font-size:12px;color:#555;margin-left:16px}
  .section-title{font-weight:600;font-size:13px;margin:12px 0 6px}
</style>
</head>
<body>
  <div class="hdr">
    <h1>${task.title.replace(/</g,'&lt;')}</h1>
    <span class="chip">${task.category}</span>
  </div>
  <p style="font-size:13px;color:#555;margin:0 0 12px">${(task.description||'').replace(/</g,'&lt;')}</p>
  ${(task.instructions && task.instructions.tips && task.instructions.tips.length) ? `<div class="section-title">Tips</div><ul class="tips">${task.instructions.tips.map(t=>`<li>${String(t).replace(/</g,'&lt;')}</li>`).join('')}</ul>`:''}

  <div class="grid">
    <div class="row">
      <label>Title</label>
      <input id="title" type="text" value="${(task.title||'').replace(/"/g,'&quot;')}" />
    </div>
    <div class="row">
      <label>Assigned to</label>
      <input id="assignedTo" type="text" value="${(task.assignedTo||'').replace(/"/g,'&quot;')}" />
    </div>
    <div class="row">
      <label>Due date</label>
      <input id="dueDate" type="date" value="${task.dueDate||''}" />
      <div style="margin-top:6px;font-size:12px;color:#555">
        <input id="dueLock" type="checkbox" ${task.dueDateLocked?'checked':''}/> Lock due date
      </div>
    </div>
    <div class="row" style="grid-column:1 / -1">
      <label>Notes</label>
      <textarea id="notes">${(task.notes||'').replace(/</g,'&lt;')}</textarea>
    </div>
  </div>

  ${task.id==='task-agent-selection' ? `
  <div class="section-title">Agent Details</div>
  <div class="grid">
    <div class="row"><label>Agent name</label><input id="agentName" type="text" value="${(((task.contacts||[]).find(c=>(c.role||'').toLowerCase().includes('agent'))||{}).name||'').replace(/"/g,'&quot;')}"></div>
    <div class="row"><label>Agent email</label><input id="agentEmail" type="email" value="${(((task.contacts||[]).find(c=>(c.role||'').toLowerCase().includes('agent'))||{}).email||'').replace(/"/g,'&quot;')}"></div>
    <div class="row"><label>Agent phone</label><input id="agentPhone" type="text" value="${(((task.contacts||[]).find(c=>(c.role||'').toLowerCase().includes('agent'))||{}).phone||'').replace(/"/g,'&quot;')}"></div>
    <div class="row"><label>Brokerage</label><input id="agentBrokerage" type="text" value="${(((task.customFields||{}).agent||{}).brokerage||'').replace(/"/g,'&quot;')}"></div>
  </div>`:''}

  ${task.id==='task-mortgage-preapproval' ? `
  <div class="section-title">Pre-approval</div>
  <div class="grid">
    <div class="row"><label>Lender name</label><input id="paLender" type="text" value="${(((task.customFields||{}).preApproval||{}).lenderName||'').replace(/"/g,'&quot;')}"></div>
    <div class="row"><label>Amount</label><input id="paAmount" type="text" value="${(((task.customFields||{}).preApproval||{}).amount||'').replace(/"/g,'&quot;')}"></div>
    <div class="row"><label>Rate</label><input id="paRate" type="text" value="${(((task.customFields||{}).preApproval||{}).rate||'').replace(/"/g,'&quot;')}"></div>
    <div class="row"><label>Expiration</label><input id="paExpiry" type="date" value="${(((task.customFields||{}).preApproval||{}).expirationDate||'')}"></div>
  </div>`:''}

  ${task.id==='task-buy-box-template' ? `
  <div class="section-title">Questionnaire</div>
  <div class="row"><button id="downloadPdf" class="primary">Download Questionnaire PDF</button></div>`:''}

  ${task.id==='task-property-search' ? `
  <div class="section-title">Search Links</div>
  <div class="row"><button id="openTrack">Open Home Tracking</button></div>`:''}

  <div class="btns">
    <button id="closeBtn">Close</button>
    <button id="saveBtn" class="primary">Save</button>
  </div>

<script>
  const TASK = ${taskJson};
  function val(id){const el=document.getElementById(id);return el?el.value:''}
  function checked(id){const el=document.getElementById(id);return el?el.checked:false}
  document.getElementById('saveBtn').onclick = () => {
    const updates = {title: val('title'), assignedTo: val('assignedTo'), dueDate: val('dueDate')||undefined, dueDateLocked: checked('dueLock'), notes: val('notes')};
    if (TASK.id==='task-agent-selection'){
      const agent={name:val('agentName'), role:'Agent', email:val('agentEmail')||undefined, phone:val('agentPhone')||undefined, when:'General representation'};
      updates.contacts = (TASK.contacts||[]).filter(c => !(c.role||'').toLowerCase().includes('agent'));
      if (agent.name||agent.email||agent.phone) updates.contacts.push(agent);
      updates.customFields = Object.assign({}, TASK.customFields||{}, { agent: { brokerage: val('agentBrokerage') }});
    }
    if (TASK.id==='task-mortgage-preapproval'){
      updates.customFields = Object.assign({}, TASK.customFields||{}, { preApproval: { lenderName: val('paLender'), amount: val('paAmount'), rate: val('paRate'), expirationDate: val('paExpiry') }});
      if (val('paLender')){
        const lender = { name: val('paLender'), role:'Lender', when:'Pre-approval / financing'};
        updates.contacts = (TASK.contacts||[]).filter(c => !(c.role||'').toLowerCase().includes('lender'));
        updates.contacts.push(lender);
      }
    }
    window.opener && window.opener.postMessage({ type:'task-update', taskId: TASK.id, updates }, '*');
    window.close();
  };
  document.getElementById('closeBtn').onclick = () => window.close();
  const d=document.getElementById('downloadPdf'); if(d) d.onclick=()=>{window.opener && window.opener.postMessage({ type:'download-questionnaire'}, '*')};
  const ot=document.getElementById('openTrack'); if(ot) ot.onclick=()=>{window.opener && window.opener.postMessage({type:'navigate', page:'property', tab:'find-home'}, '*')};
</script>
</body></html>`;
    w.document.write(html);
    w.document.close();
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`${minimal ? 'border border-gray-200 rounded-lg bg-white hover:shadow-sm' : 'border border-gray-200 rounded-lg bg-white transition-all hover:shadow-md'}`}>
        <CollapsibleTrigger className={`${row ? 'w-full px-3 py-3 min-h-[56px] text-left' : (minimal ? 'w-full px-4 py-3 sm:px-5 sm:py-4 min-h-[60px] text-left' : 'w-full px-6 py-5 md:px-7 md:py-6 min-h-[68px] text-left')}`} onClick={(e) => { if (openInWindow) { e.preventDefault(); e.stopPropagation(); openTaskPopup(); } else if (onOpenModal) { e.preventDefault(); e.stopPropagation(); onOpenModal(task); } }}>
          {row ? (
            <div className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <h4 className={`font-medium text-[13px] ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'} truncate m-0`} title={task.title}>{task.title}</h4>
                {(() => {
                  const sub = (task.subcategory || '').toLowerCase();
                  const labelMap: Record<string, string> = { legal: 'Legal', inspection: 'Inspection', inspections: 'Inspection', financing: 'Mortgage', mortgage: 'Mortgage', insurance: 'Insurance' };
                  const clsMap: Record<string, string> = {
                    legal: 'bg-red-50 text-red-700 border-red-200',
                    inspection: 'bg-blue-50 text-blue-700 border-blue-200',
                    inspections: 'bg-blue-50 text-blue-700 border-blue-200',
                    financing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    mortgage: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    insurance: 'bg-amber-50 text-amber-700 border-amber-200'
                  };
                  const label = labelMap[sub];
                  const cls = clsMap[sub];
                  return label ? (
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] ${cls}`}>{label}</span>
                  ) : null;
                })()}
              </div>
              <div className="col-span-2">
                <StatusDot status={task.status} />
              </div>
              <div className="col-span-2 text-[12px] text-gray-700 truncate flex items-center gap-1">
                <div className="flex items-center -space-x-2 mr-1">
                  {getAssigneeAvatars(task).map((a, idx) => (
                    <div key={`${a.initials}-${idx}`} className={`inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold ring-2 ring-white ${idx===0?'':'ml-2'}`} title={a.title}>
                      {a.initials}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 text-[12px] text-gray-700">
                <div>{formatShortDate(task.dueDate)}</div>
                {task.dueDate && (
                  <div className="text-[11px] text-gray-500">{daysLeft(task.dueDate)}</div>
                )}
              </div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <span className={priorityPill(task.priority)}>{priorityLabel(task.priority)}</span>
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <h4 className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'} break-words leading-snug tracking-tight flex-1 m-0 text-[15px] sm:text-base`}>
                    {task.title}
                    {/* Scenario badge(s) */}
                    {Array.isArray(task.tags) && task.tags.filter(t => t.startsWith('scenario-')).slice(0,2).map((t) => (
                      <span key={t} className="ml-2 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 capitalize">
                        {t.replace(/^scenario-/, '').replace(/-/g, ' ')}
                      </span>
                    ))}
                    {/* Inline education popover */}
                    {(whatInfo || whyInfo) && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" aria-label="Info">
                            <Info className="w-3 h-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3">
                          <div className="text-sm">
                            {whatInfo && (
                              <div className="mb-2">
                                <div className="font-medium">Overview</div>
                                <div className="text-gray-700 mt-1">
                                  {renderBulleted(whatInfo)}
                                </div>
                              </div>
                            )}
                            {whyInfo && (
                              <div>
                                <div className="font-medium">Why It Matters</div>
                                <div className="text-gray-700 mt-1">
                                  {renderBulleted(whyInfo)}
                                </div>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </h4>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {task.completedDate && (
                      <span className="text-sm text-gray-600">Completed</span>
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
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent className={`${minimal ? (row ? 'px-3 pb-3' : 'px-4 pb-4') : 'px-5 pb-5'}`}>
          <div className={`${minimal ? 'ml-6 space-y-2 pt-1.5' : 'ml-8 space-y-3 pt-2 border-t border-gray-100'}`}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray-600">
              <span className="inline-flex items-center gap-1"><StatusDot status={task.status} /><span>{statusLabel(task.status)}</span></span>
              <span className={priorityPill(task.priority)}>{priorityLabel(task.priority)}</span>
              {editDueDate && (
                <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /><span>Due: {formatDate(editDueDate)}</span><span className="text-gray-400">({daysLeft(editDueDate)})</span>{dueLocked && <Lock className="inline w-3 h-3 ml-0.5" />}</span>
              )}
              <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" /><span>{editAssignedTo || 'Unassigned'}</span></span>
              {task.completedDate && <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="w-3.5 h-3.5" /><span>Completed {task.completedDate}</span></span>}
            </div>
            {!(whatInfo || whyInfo || hasStepsInfo || howTextInfo) && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}

            {(whatInfo || whyInfo || hasStepsInfo || howTextInfo) && (
              <div className="mt-2 space-y-3">
                {whatInfo && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Overview</h5>
                    {renderBulleted(whatInfo)}
                  </div>
                )}
                {whyInfo && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Why It Matters</h5>
                    {renderBulleted(whyInfo)}
                  </div>
                )}
                {(hasStepsInfo || howTextInfo) && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-1">How to Complete</h5>
                    {hasStepsInfo ? (
                      <ul className="space-y-2">
                        {task.instructions!.steps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-gray-400">•</span>
                            <div className="text-gray-700">
                              <span className="font-medium">{step.title}</span>
                              {(step.action || step.description) && (
                                <p className="text-gray-600 mt-1">{step.action || step.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div>{renderBulleted(howTextInfo)}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {effectiveTips.length > 0 && (
              <div className="pt-1">
                <Label className="text-xs">Pro tips</Label>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  {effectiveTips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-gray-600">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Up Next within same swim lane */}
            {(() => {
              const sub = (task.subcategory || '').toLowerCase();
              if (!sub) return null;
              const all = tasksById ? Object.values(tasksById) : [];
              const pending = all.filter(t => (t.subcategory || '').toLowerCase() === sub && t.status !== 'completed' && t.id !== task.id);
              if (pending.length === 0) return null;
              const next = pending.find(t => ['active','in-progress','overdue'].includes(t.status)) || pending[0];
              return (
                <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-700">
                  <div className="font-medium mb-1">Related</div>
                  <div>
                    <span className="font-medium mr-1">Up next:</span>
                  <button className="underline" onClick={() => onOpenModal ? onOpenModal(next) : window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: next.linkedPage } }))}>
                    {next.title}
                  </button>
                  </div>
                </div>
              );
            })()}

            {/* Dependencies chips */}
            {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
              <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
                <div className="text-xs font-medium text-gray-700 mb-1">Prerequisites</div>
                <div className="flex flex-wrap items-center gap-2">
                {task.dependencies.map((depId) => {
                  const dep = tasksById ? tasksById[depId] : undefined;
                  if (!dep) return (
                    <span key={depId} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-gray-600">
                      <Circle className="w-3 h-3 text-gray-400" />
                      <span className="truncate max-w-[160px]" title={depId}>Prerequisite</span>
                    </span>
                  );
                  const icon = dep.status === 'completed' ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : dep.status === 'overdue' ? (
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  ) : (
                    <Clock className="w-3 h-3 text-blue-600" />
                  );
                  return (
                    <span key={dep.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-gray-700">
                      {icon}
                      <span className="truncate max-w-[160px]" title={dep.title}>{dep.title}</span>
                    </span>
                  );
                })}
                {tasksById && task.dependencies.some((id) => tasksById![id]?.status !== 'completed') && (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                    Blocked
                  </span>
                )}
                </div>
              </div>
            )}

            {/* Editable fields */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900">Key details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={triggerAutoSave} />
              </div>
              <div>
                <Label className="text-xs">Assigned to</Label>
                <Select value={editAssignedTo || ''} onValueChange={(v) => { setEditAssignedTo(v); triggerAutoSave(); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buyer">Buyer</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Lender">Lender</SelectItem>
                    <SelectItem value="Attorney">Attorney</SelectItem>
                    <SelectItem value="Title Company">Title Company</SelectItem>
                    <SelectItem value="Buyer & Agent">Buyer & Agent</SelectItem>
                    <SelectItem value="All Parties">All Parties</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Due date</Label>
                <div className="flex items-center gap-2">
                  <Input type="date" value={editDueDate} onChange={(e) => { setEditDueDate(e.target.value); setDueLocked(!!e.target.value); }} onBlur={triggerAutoSave} />
                  <Button
                    type="button"
                    size="icon"
                    variant={dueLocked ? 'default' : 'outline'}
                    onClick={() => { setDueLocked((v) => !v); setTimeout(triggerAutoSave, 0); }}
                    title={dueLocked ? 'Unlock to allow dynamic recalculation' : 'Lock to prevent recalculation'}
                  >
                    {dueLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{dueLocked ? 'Locked: will not change when anchors update.' : 'Will update when anchors change.'}</p>
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} onBlur={triggerAutoSave} />
              </div>
              </div>
            </div>

            {/* Attorney contact: only for "find/hire attorney" task */}
            {task.id === 'task-attorney-selection' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Attorney name</Label>
                  <Input value={attorneyName} onChange={(e) => setAttorneyName(e.target.value)} onBlur={triggerAutoSave} />
                </div>
                <div>
                  <Label className="text-xs">Attorney email</Label>
                  <Input type="email" value={attorneyEmail} onChange={(e) => setAttorneyEmail(e.target.value)} onBlur={triggerAutoSave} />
                </div>
                <div>
                  <Label className="text-xs">Attorney phone</Label>
                  <Input value={attorneyPhone} onChange={(e) => setAttorneyPhone(e.target.value)} onBlur={triggerAutoSave} />
                </div>
              </div>
            )}

            {/* Agent details: for agent selection */}
            {task.id === 'task-agent-selection' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Agent name</Label>
                  <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} onBlur={triggerAutoSave} />
                </div>
                <div>
                  <Label className="text-xs">Agent email</Label>
                  <Input type="email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} onBlur={triggerAutoSave} />
                </div>
                <div>
                  <Label className="text-xs">Agent phone</Label>
                  <Input value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} onBlur={triggerAutoSave} />
                </div>
                <div>
                  <Label className="text-xs">Brokerage</Label>
                  <Input value={agentBrokerage} onChange={(e) => setAgentBrokerage(e.target.value)} onBlur={triggerAutoSave} />
                </div>
              </div>
            )}

            {/* Pre-approval details */}
            {task.id === 'task-mortgage-preapproval' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Lender name</Label>
                  <Input value={lenderNamePA} onChange={(e) => setLenderNamePA(e.target.value)} onBlur={triggerAutoSave} />
                </div>
                <div>
                  <Label className="text-xs">Pre-approval amount</Label>
                  <Input value={preApprovalAmount} onChange={(e) => setPreApprovalAmount(e.target.value)} placeholder="$" onBlur={triggerAutoSave} />
                </div>
                <div>
                  <Label className="text-xs">Rate</Label>
                  <Input value={preApprovalRate} onChange={(e) => setPreApprovalRate(e.target.value)} placeholder="%" onBlur={triggerAutoSave} />
                </div>
                <div>
                  <Label className="text-xs">Expiration</Label>
                  <Input type="date" value={preApprovalExpiry} onChange={(e) => setPreApprovalExpiry(e.target.value)} onBlur={triggerAutoSave} />
                </div>
              </div>
            )}

            {/* Questionnaire helpers */}
            {task.id === 'task-buy-box-template' && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleDownloadQuestionnairePDF}>Download Questionnaire PDF</Button>
              </div>
            )}

            {/* Property search helpers */}
            {task.id === 'task-property-search' && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { try { localStorage.setItem('handoff-propertysearch-selected-tab','find-home'); } catch {} onNavigate('property'); }}>Open Home Tracking</Button>
              </div>
            )}

            {/* Insurance helpers */}
            {task.id === 'task-homeowners-insurance' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setOpenInsuranceCalc(true)}>
                    <Calculator className="w-4 h-4 mr-2" /> Insurance calculator
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Provider</Label>
                    <Input value={insProvider} onChange={(e) => { setInsProvider(e.target.value); }} onBlur={persistInsurance} />
                  </div>
                  <div>
                    <Label className="text-xs">Policy number</Label>
                    <Input value={insPolicyNumber} onChange={(e) => { setInsPolicyNumber(e.target.value); }} onBlur={persistInsurance} />
                  </div>
                  <div>
                    <Label className="text-xs">Coverage</Label>
                    <Input value={insCoverage} onChange={(e) => { setInsCoverage(e.target.value); }} onBlur={persistInsurance} placeholder="$" />
                  </div>
                  <div>
                    <Label className="text-xs">Premium</Label>
                    <Input value={insPremium} onChange={(e) => { setInsPremium(e.target.value); }} onBlur={persistInsurance} placeholder="$ / year" />
                  </div>
                  <div>
                    <Label className="text-xs">Effective date</Label>
                    <Input type="date" value={insEffectiveDate} onChange={(e) => { setInsEffectiveDate(e.target.value); }} onBlur={persistInsurance} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Upload insurance policies</Label>
                  <Input type="file" multiple accept="application/pdf,image/*" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    const newItems = files.map(f => ({ name: f.name, type: f.type, size: f.size, url: URL.createObjectURL(f) }));
                    setInsurancePolicies(prev => {
                      const merged = [...prev, ...newItems];
                      setTimeout(persistInsurance, 0);
                      return merged;
                    });
                  }} />
                  {insurancePolicies && insurancePolicies.length > 0 && (
                    <ul className="list-disc ml-5 space-y-1">
                      {insurancePolicies.map((p) => (
                        <li key={p.name} className="text-xs text-gray-700 flex items-center gap-2">
                          <span className="truncate max-w-[260px]" title={p.name}>{p.name}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => {
                            setInsurancePolicies(prev => prev.filter(x => x.name !== p.name));
                            setTimeout(persistInsurance, 0);
                          }}>Remove</Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Dialog open={openInsuranceCalc} onOpenChange={setOpenInsuranceCalc}>
                  <DialogContent className="max-w-5xl">
                    <DialogHeader>
                      <DialogTitle>Insurance Calculator</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[75vh] overflow-auto">
                      <InsuranceCalculator />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Inspection scheduling (inline) */}
            {(task.id === 'task-home-inspection' || task.id === 'task-schedule-specialized-inspections') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Scheduled inspections</Label>
                    <span className="text-[11px] text-gray-500">These will appear on your Calendar.</span>
                  </div>
                  <Button size="sm" onClick={() => {
                    const def: ScheduledInspection = { id: String(Date.now()), type: task.id === 'task-home-inspection' ? 'General Home Inspection' : 'Specialty', title: task.id === 'task-home-inspection' ? 'General Home Inspection' : 'Specialty Inspection', date: '', time: '', provider: '', cost: '', notes: '' };
                    setScheduledInspections(prev => { const next = [...prev, def]; setTimeout(persistInspectionFields, 0); return next; });
                  }}>Add</Button>
                </div>

                {scheduledInspections.length === 0 && (
                  <div className="text-xs text-gray-600">No inspections added yet.</div>
                )}
                <div className="space-y-3">
                  {scheduledInspections.map((ins, idx) => (
                    <div key={ins.id || idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end border rounded-md p-2">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Type</Label>
                        <Select value={ins.type || ''} onValueChange={(v) => { const next = [...scheduledInspections]; next[idx] = { ...ins, type: v, title: v }; setScheduledInspections(next); setTimeout(persistInspectionFields, 0); }}>
                          <SelectTrigger className="h-8"><SelectValue placeholder="Inspection type" /></SelectTrigger>
                          <SelectContent>
                            {['General Home Inspection','Termite','Radon','Septic','Well Water','Sewer Scope','Mold','Lead Paint','Asbestos','Chimney','Pool/Spa','HVAC'].map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input type="date" value={ins.date || ''} onChange={(e) => { const next = [...scheduledInspections]; next[idx] = { ...ins, date: e.target.value }; setScheduledInspections(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div>
                        <Label className="text-xs">Time</Label>
                        <Input placeholder="e.g., 09:00 AM" value={ins.time || ''} onChange={(e) => { const next = [...scheduledInspections]; next[idx] = { ...ins, time: e.target.value }; setScheduledInspections(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div>
                        <Label className="text-xs">Provider</Label>
                        <Input value={ins.provider || ''} onChange={(e) => { const next = [...scheduledInspections]; next[idx] = { ...ins, provider: e.target.value }; setScheduledInspections(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div>
                        <Label className="text-xs">Cost</Label>
                        <Input placeholder="$" value={ins.cost || ''} onChange={(e) => { const next = [...scheduledInspections]; next[idx] = { ...ins, cost: e.target.value }; setScheduledInspections(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div className="md:col-span-6">
                        <Label className="text-xs">Notes</Label>
                        <Textarea rows={2} value={ins.notes || ''} onChange={(e) => { const next = [...scheduledInspections]; next[idx] = { ...ins, notes: e.target.value }; setScheduledInspections(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div className="flex justify-end md:col-span-6">
                        <Button variant="ghost" size="sm" className="h-7" onClick={() => { setScheduledInspections(prev => { const next = prev.filter((x) => (x.id || '') !== (ins.id || '')); setTimeout(persistInspectionFields, 0); return next; }); }}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection results (moved from workspace) */}
            {task.id === 'task-review-inspection-results' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Inspection results</Label>
                  <Button size="sm" onClick={() => {
                    const nu: InspectionIssue = { id: String(Date.now()), category: '', severity: 'medium', issue: '', description: '', recommendation: '', cost: '', status: 'identified' };
                    setInspectionIssues(prev => { const next = [...prev, nu]; setTimeout(persistInspectionFields, 0); return next; });
                  }}>Add issue</Button>
                </div>
                {inspectionIssues.length === 0 && (
                  <div className="text-xs text-gray-600">No issues recorded yet.</div>
                )}
                <div className="space-y-2">
                  {inspectionIssues.map((it, idx) => (
                    <div key={it.id || idx} className="border rounded-md p-2 grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Input value={it.category || ''} onChange={(e) => { const next = [...inspectionIssues]; next[idx] = { ...it, category: e.target.value }; setInspectionIssues(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div>
                        <Label className="text-xs">Severity</Label>
                        <Select value={it.severity || 'medium'} onValueChange={(v) => { const next = [...inspectionIssues]; next[idx] = { ...it, severity: v as any }; setInspectionIssues(next); setTimeout(persistInspectionFields,0); }}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Issue</Label>
                        <Input value={it.issue || ''} onChange={(e) => { const next = [...inspectionIssues]; next[idx] = { ...it, issue: e.target.value }; setInspectionIssues(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div>
                        <Label className="text-xs">Cost</Label>
                        <Input value={it.cost || ''} onChange={(e) => { const next = [...inspectionIssues]; next[idx] = { ...it, cost: e.target.value }; setInspectionIssues(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select value={it.status || 'identified'} onValueChange={(v) => { const next = [...inspectionIssues]; next[idx] = { ...it, status: v as any }; setInspectionIssues(next); setTimeout(persistInspectionFields,0); }}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="identified">Identified</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-xs">Description</Label>
                        <Textarea rows={2} value={it.description || ''} onChange={(e) => { const next = [...inspectionIssues]; next[idx] = { ...it, description: e.target.value }; setInspectionIssues(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-xs">Recommendation</Label>
                        <Textarea rows={2} value={it.recommendation || ''} onChange={(e) => { const next = [...inspectionIssues]; next[idx] = { ...it, recommendation: e.target.value }; setInspectionIssues(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div className="flex justify-end md:col-span-6">
                        <Button variant="ghost" size="sm" className="h-7" onClick={() => { setInspectionIssues(prev => { const next = prev.filter((x) => (x.id || '') !== (it.id || '')); setTimeout(persistInspectionFields,0); return next; }); }}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection negotiations (moved from workspace) */}
            {task.id === 'task-submit-repair-requests' && (
              <div className="space-y-3">
                <Label className="text-xs">Negotiations on issues</Label>
                {inspectionIssues.length === 0 && (
                  <div className="text-xs text-gray-600">No issues found yet. Add issues under "Review Inspection Results" first.</div>
                )}
                <div className="space-y-2">
                  {inspectionIssues.map((it, idx) => (
                    <div key={it.id || idx} className="border rounded-md p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium truncate">{it.issue || '(untitled issue)'}</div>
                        <Select value={it.status || 'identified'} onValueChange={(v) => { const next = [...inspectionIssues]; next[idx] = { ...it, status: v as any }; setInspectionIssues(next); setTimeout(persistInspectionFields,0); }}>
                          <SelectTrigger className="h-7 w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="identified">Identified</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Negotiation notes</Label>
                        <Textarea rows={2} value={(it.negotiationNotes || []).join('\n')} onChange={(e) => {
                          const notes = e.target.value.split('\n').filter(Boolean);
                          const next = [...inspectionIssues];
                          next[idx] = { ...it, negotiationNotes: notes };
                          setInspectionIssues(next);
                        }} onBlur={persistInspectionFields} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload inspection reports */}
                <div className="space-y-2">
                  <Label className="text-xs">Upload inspection reports</Label>
                  <Input type="file" multiple accept="application/pdf,image/*" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    const newItems = files.map(f => ({ name: f.name, type: f.type, size: f.size, url: URL.createObjectURL(f) }));
                    setInspectionReports(prev => {
                      const merged = [...prev, ...newItems];
                      setTimeout(persistInspectionFields, 0);
                      return merged;
                    });
                  }} />
                  {inspectionReports && inspectionReports.length > 0 && (
                    <ul className="list-disc ml-5 space-y-1">
                      {inspectionReports.map((p) => (
                        <li key={p.name} className="text-xs text-gray-700 flex items-center gap-2">
                          {p.url ? (
                            <a href={p.url} target="_blank" rel="noreferrer" className="underline truncate max-w-[220px]" title={p.name}>{p.name}</a>
                          ) : (
                            <span className="truncate max-w-[220px]" title={p.name}>{p.name}</span>
                          )}
                          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => {
                            setInspectionReports(prev => prev.filter(x => x.name !== p.name));
                            setTimeout(persistInspectionFields, 0);
                          }}>Remove</Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Inspection remedies/finalization (moved from workspace) */}
            {task.id === 'task-finalize-inspection-remedies' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Final remedies and timelines</Label>
                  <Button size="sm" onClick={() => { const nu: RemedyItem = { id: String(Date.now()), description: '', dueDate: '', party: 'seller', status: 'pending' }; setInspectionRemedies(prev => { const next = [...prev, nu]; setTimeout(persistInspectionFields, 0); return next; }); }}>Add remedy</Button>
                </div>
                {inspectionRemedies.length === 0 && (
                  <div className="text-xs text-gray-600">No remedies recorded yet.</div>
                )}
                <div className="space-y-2">
                  {inspectionRemedies.map((r, idx) => (
                    <div key={r.id || idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end border rounded-md p-2">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Description</Label>
                        <Input value={r.description || ''} onChange={(e) => { const next = [...inspectionRemedies]; next[idx] = { ...r, description: e.target.value }; setInspectionRemedies(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div>
                        <Label className="text-xs">Due date</Label>
                        <Input type="date" value={r.dueDate || ''} onChange={(e) => { const next = [...inspectionRemedies]; next[idx] = { ...r, dueDate: e.target.value }; setInspectionRemedies(next); }} onBlur={persistInspectionFields} />
                      </div>
                      <div>
                        <Label className="text-xs">Party</Label>
                        <Select value={r.party || 'seller'} onValueChange={(v) => { const next = [...inspectionRemedies]; next[idx] = { ...r, party: v as any }; setInspectionRemedies(next); setTimeout(persistInspectionFields,0); }}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seller">Seller</SelectItem>
                            <SelectItem value="buyer">Buyer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select value={r.status || 'pending'} onValueChange={(v) => { const next = [...inspectionRemedies]; next[idx] = { ...r, status: v as any }; setInspectionRemedies(next); setTimeout(persistInspectionFields,0); }}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end md:col-span-5">
                        <Button variant="ghost" size="sm" className="h-7" onClick={() => { setInspectionRemedies(prev => { const next = prev.filter((x) => (x.id || '') !== (r.id || '')); setTimeout(persistInspectionFields, 0); return next; }); }}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offer/Contract helpers */}
            {task.id === 'task-submit-offer' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => { try { window.location.hash = '#offer'; } catch {} onNavigate('documents'); }}>
                    Open Contract Builder
                  </Button>
                  {contractPdfUrl && (
                    <Button size="sm" variant="outline" onClick={() => window.open(contractPdfUrl, '_blank')}>View Contract PDF</Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Upload Contract PDF</Label>
                    <Input type="file" accept="application/pdf" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = URL.createObjectURL(f);
                      setContractPdfUrl(url);
                      setEditDocuments((prev) => Array.from(new Set([...(prev || []), f.name])));
                      setAttachments((prev) => [...prev, { name: f.name, type: f.type, size: f.size, url }]);
                      setTimeout(triggerAutoSave, 0);
                    }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Purchase Price ($)</Label>
                    <Input value={contractPrice} onChange={(e) => setContractPrice(e.target.value)} placeholder="e.g. 500000" />
                  </div>
                  <div>
                    <Label className="text-xs">Earnest Money ($)</Label>
                    <Input value={contractEarnest} onChange={(e) => setContractEarnest(e.target.value)} placeholder="e.g. 15000" />
                  </div>
                  <div>
                    <Label className="text-xs">Inspection Days</Label>
                    <Input value={contractInspectionDays} onChange={(e) => setContractInspectionDays(e.target.value)} placeholder="e.g. 7" />
                  </div>
                  <div>
                    <Label className="text-xs">Financing Days</Label>
                    <Input value={contractFinancingDays} onChange={(e) => setContractFinancingDays(e.target.value)} placeholder="e.g. 21" />
                  </div>
                  <div>
                    <Label className="text-xs">Offer Accepted Date</Label>
                    <Input type="date" value={contractAcceptance} onChange={(e) => setContractAcceptance(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Closing Date</Label>
                    <Input type="date" value={contractClosing} onChange={(e) => setContractClosing(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Documents (attachments) */}
            {(['offer','contract','diligence','closing'].includes(task.category) || (task.instructions?.requiredDocuments?.length || 0) > 0) && (
              <div className="space-y-2">
                <Label className="text-xs">Documents</Label>
                <div className="flex flex-wrap gap-2">
                  <Input type="file" multiple onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    const names: string[] = [];
                    const newAtts: Array<{name:string;url?:string;type?:string;size?:number}> = [];
                    files.forEach((f) => {
                      names.push(f.name);
                      const url = URL.createObjectURL(f);
                      newAtts.push({ name: f.name, type: f.type, size: f.size, url });
                    });
                    setEditDocuments((prev) => Array.from(new Set([...(prev || []), ...names])));
                    setAttachments((prev) => [...prev, ...newAtts]);
                    setTimeout(triggerAutoSave, 0);
                  }} />
                </div>
                {editDocuments && editDocuments.length > 0 && (
                  <ul className="list-disc ml-5 space-y-1">
                    {editDocuments.map((name) => (
                      <li key={name} className="text-xs text-gray-700 flex items-center gap-2">
                        <span className="truncate max-w-[260px]" title={name}>{name}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => {
                          setEditDocuments((prev) => (prev || []).filter((n) => n !== name));
                          setAttachments((prev) => prev.filter((a) => a.name !== name));
                        }}>Remove</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}


            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="sm"
                onClick={() => {
                  const updates: Partial<Task> = {
                    title: editTitle,
                    assignedTo: editAssignedTo,
                    dueDate: editDueDate || undefined,
                    dueDateLocked: editDueDate ? dueLocked : false,
                    notes: editNotes,
                    documents: editDocuments,
                    customFields: {
                      ...(task as any).customFields,
                      attachments,
                      ...(contractPdfUrl ? { contractPdfUrl } : {}),
                    } as any,
                  };

                  // Contract details + schedule anchors
                  if (task.id === 'task-submit-offer') {
                    const details: any = {
                      purchasePrice: contractPrice,
                      earnestAmount: contractEarnest,
                      acceptanceDate: contractAcceptance,
                      closingDate: contractClosing,
                      inspectionDays: contractInspectionDays,
                      financingDays: contractFinancingDays,
                    };
                    (updates as any).customFields = {
                      ...((updates as any).customFields || (task as any).customFields),
                      contractDetails: details,
                    };
                    try {
                      if (contractAcceptance || contractClosing) {
                        // Update anchors so due dates recompute
                        const ev = new CustomEvent('updateScheduleAnchors', { detail: { offerAcceptedDate: contractAcceptance || undefined, closingDate: contractClosing || undefined } });
                        window.dispatchEvent(ev);
                      }
                    } catch {}
                  }

                  // Merge agent details
                  if (task.id === 'task-agent-selection') {
                    const agent = (agentName || agentEmail || agentPhone || agentBrokerage) ? {
                      name: agentName,
                      role: 'Agent',
                      email: agentEmail || undefined,
                      phone: agentPhone || undefined,
                      when: 'General representation',
                    } : undefined;
                    if (agent) {
                      const others = (task.contacts || []).filter(c => !(c.role && c.role.toLowerCase().includes('agent')));
                      (updates as any).contacts = [...others, agent as any];
                    }
                    (updates as any).customFields = {
                      ...(task as any).customFields,
                      agent: { brokerage: agentBrokerage }
                    };
                  }

                  // Merge pre-approval details
                  if (task.id === 'task-mortgage-preapproval') {
                    (updates as any).customFields = {
                      ...(task as any).customFields,
                      preApproval: {
                        lenderName: lenderNamePA,
                        amount: preApprovalAmount,
                        rate: preApprovalRate,
                        expirationDate: preApprovalExpiry,
                      }
                    };

                    if (lenderNamePA) {
                      const lenderContact = {
                        name: lenderNamePA,
                        role: 'Lender',
                        when: 'Pre-approval / financing',
                      } as any;
                      const others = (task.contacts || []).filter(c => !(c.role && c.role.toLowerCase().includes('lender')));
                      (updates as any).contacts = [...others, lenderContact];
                    }
                  }

                  // Homeowners insurance details
                  if (task.id === 'task-homeowners-insurance') {
                    (updates as any).customFields = {
                      ...(task as any).customFields,
                      insurance: {
                        provider: insProvider || undefined,
                        policyNumber: insPolicyNumber || undefined,
                        coverage: insCoverage || undefined,
                        premium: insPremium || undefined,
                        effectiveDate: insEffectiveDate || undefined,
                        policies: insurancePolicies,
                      }
                    };
                  }

                  // Inspections data inline (scheduled / results / negotiations / remedies)
                  if (['task-home-inspection','task-schedule-specialized-inspections','task-review-inspection-results','task-submit-repair-requests','task-finalize-inspection-remedies'].includes(task.id)) {
                    const prevInspections = ((task as any).customFields?.inspections) || {};
                    (updates as any).customFields = {
                      ...(task as any).customFields,
                      inspections: {
                        ...prevInspections,
                        ...(scheduledInspections ? { scheduled: scheduledInspections } : {}),
                        ...(inspectionIssues ? { issues: inspectionIssues } : {}),
                        ...(inspectionNegotiations ? { negotiations: inspectionNegotiations } : {}),
                        ...(inspectionRemedies ? { remedies: inspectionRemedies } : {}),
                        ...(inspectionReports ? { reports: inspectionReports } : {}),
                      }
                    };
                  }

                  const newAttorney = (attorneyName || attorneyEmail || attorneyPhone) ? {
                    name: attorneyName,
                    role: 'Attorney',
                    email: attorneyEmail || undefined,
                    phone: attorneyPhone || undefined,
                    when: 'Contract review',
                  } : undefined;

                  if (newAttorney) {
                    const others = (task.contacts || []).filter(c => !(c.role && c.role.toLowerCase().includes('attorney')));
                    updates.contacts = [...others, newAttorney as any];
                  }

                  onUpdateTaskFields?.(task.id, updates);
                  try { window.dispatchEvent(new Event('tasksUpdated')); } catch {}
                }}
              >
                Save
              </Button>
              {task.status === 'completed' && (
                <Button size="sm" variant="outline" onClick={() => onUpdateTask?.(task.id, 'active')}>
                  Mark incomplete
                </Button>
              )}
              {task.status !== 'completed' && (
                <Button size="sm" variant="outline" onClick={() => onUpdateTask?.(task.id, 'completed')}>
                  Mark complete
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditTitle(task.title);
                  setEditAssignedTo(task.assignedTo || '');
                  setEditDueDate(task.dueDate || '');
                  setDueLocked(!!task.dueDateLocked);
                  setEditNotes(task.notes || '');
                  setEditDocuments(task.documents || []);
                  setAttachments(((task as any).customFields?.attachments) || []);
                  setContractPdfUrl(((task as any).customFields?.contractPdfUrl) || undefined);
                  const cd = ((task as any).customFields?.contractDetails) || {};
                  setContractPrice(cd.purchasePrice || '');
                  setContractEarnest(cd.earnestAmount || '');
                  setContractAcceptance(cd.acceptanceDate || '');
                  setContractClosing(cd.closingDate || '');
                  setContractInspectionDays(cd.inspectionDays || '');
                  setContractFinancingDays(cd.financingDays || '');
                  const cur = (task.contacts || []).find(c => c.role.toLowerCase().includes('attorney'));
                  setAttorneyName(cur?.name || '');
                  setAttorneyEmail(cur?.email || '');
                  setAttorneyPhone(cur?.phone || '');
                  const ag = (task.contacts || []).find(c => c.role && c.role.toLowerCase().includes('agent')) as any;
                  setAgentName(ag?.name || '');
                  setAgentEmail(ag?.email || '');
                  setAgentPhone(ag?.phone || '');
                  setAgentBrokerage(((task as any).customFields?.agent?.brokerage) || '');
                  const pa = ((task as any).customFields?.preApproval) || {};
                  setLenderNamePA(pa.lenderName || '');
                  setPreApprovalAmount(pa.amount || '');
                  setPreApprovalRate(pa.rate || '');
                  setPreApprovalExpiry(pa.expirationDate || '');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

const PhaseCard = ({ phase, onNavigate, onUpdateTask, onUpdateTaskFields, tasksById, onAddTask }: {
  phase: TaskPhase;
  onNavigate: (page: string) => void;
  onUpdateTask?: (taskId: string, status: Task['status']) => void;
  onUpdateTaskFields?: (taskId: string, updates: Partial<Task>) => void;
  tasksById?: Record<string, Task>;
  onAddTask?: (phase: TaskPhase, title: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(phase.status === 'active');
  const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = phase.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  
  return (
    <Card className="mb-6 shadow-sm bg-white hover:shadow-md transition-colors">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-5 cursor-pointer hover:bg-gray-50/50 transition-colors">
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
                        {statusLabel(phase.status)}
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
              {sortTasksByDependencies(phase.tasks, tasksById || {}).map((task) => (
                <ExpandableTaskCard
                  key={task.id}
                  task={task}
                  onNavigate={onNavigate}
                  onUpdateTask={onUpdateTask}
                  onUpdateTaskFields={onUpdateTaskFields}
                  tasksById={tasksById}
                />
              ))}
            </div>
            <div className="mt-4">
              {!addingNew ? (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-600 hover:text-gray-900" onClick={() => setAddingNew(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add task
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 text-sm"
                    placeholder="New task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    autoFocus
                  />
                  <Button size="sm" onClick={() => { if (newTaskTitle.trim()) { onAddTask?.(phase, newTaskTitle.trim()); setNewTaskTitle(''); setAddingNew(false); } }}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAddingNew(false); setNewTaskTitle(''); }}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Table-style phase card matching the provided design
const TaskTableCard = ({ title, tasks, onNavigate, onUpdateTask, onUpdateTaskFields, tasksById }: { title: string; tasks: Task[]; onNavigate: (page: string) => void; onUpdateTask?: (taskId: string, status: Task['status']) => void; onUpdateTaskFields?: (taskId: string, updates: Partial<Task>) => void; tasksById?: Record<string, Task>; }) => {
  const sortedTasks = sortTasksByDependencies(tasks, tasksById || {});
  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold tracking-[-0.01em] text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-12 text-[12px] font-medium text-gray-500 px-2 py-1.5">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-1 text-right">Priority</div>
        </div>
        <div className="divide-y">
          {sortedTasks.map((task) => (
            <div key={task.id} className="px-1">
              <ExpandableTaskCard task={task} onNavigate={onNavigate} onUpdateTask={onUpdateTask} onUpdateTaskFields={onUpdateTaskFields} tasksById={tasksById} minimal row />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TaskTableCardGrouped = ({ title, groups, onNavigate, onUpdateTask, onUpdateTaskFields, tasksById }: { title: string; groups: { label: string; tasks: Task[] }[]; onNavigate: (page: string) => void; onUpdateTask?: (taskId: string, status: Task['status']) => void; onUpdateTaskFields?: (taskId: string, updates: Partial<Task>) => void; tasksById?: Record<string, Task>; }) => {
  const present = groups.filter(g => g.tasks && g.tasks.length > 0);
  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-[15px] font-semibold tracking-[-0.01em] text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-12 text-[12px] font-medium text-gray-500 px-2 py-1.5">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-1 text-right">Priority</div>
        </div>
        <div className="divide-y">
          {present.map((g) => {
            const sorted = sortTasksByDependencies(g.tasks, tasksById || {});
            return (
              <div key={g.label}>
                <div className="bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600">{g.label}</div>
                {sorted.map((task) => (
                  <div key={task.id} className="px-1">
                    <ExpandableTaskCard task={task} onNavigate={onNavigate} onUpdateTask={onUpdateTask} onUpdateTaskFields={onUpdateTaskFields} tasksById={tasksById} minimal row />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Inline chevron-style phase stepper (matches header style)
const InlinePhaseStepper = ({ phases, currentId, onSelect }: { phases: TaskPhase[]; currentId?: string; onSelect: (id: string) => void }) => {
  const computeCurrentIndex = () => {
    if (currentId) {
      const idx = phases.findIndex(p => p.id === currentId);
      if (idx >= 0) return idx;
    }
    const activeIdx = phases.findIndex(p => p.status === 'active');
    if (activeIdx >= 0) return activeIdx;
    const firstIncomplete = phases.findIndex(p => {
      const total = p.tasks.length || 0;
      const done = p.tasks.filter(t => t.status === 'completed').length;
      return done < total;
    });
    return firstIncomplete >= 0 ? firstIncomplete : Math.max(0, phases.length - 1);
  };
  const cur = computeCurrentIndex();
  return (
    <div className="isolate inline-flex items-center rounded-full ring-1 ring-gray-300 bg-white shadow-sm overflow-hidden">
      {phases.map((p, i) => {
        const isFilled = i <= cur; // completed + current
        const isCurrent = i === cur;
        const isFirst = i === 0;
        const base = 'relative flex-1 inline-flex items-center justify-center h-11 px-5 text-[13px] font-medium transition-colors select-none';
        const colors = isFilled ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600';
        const rounding = [
          isFilled && isFirst ? 'rounded-l-full' : '',
          isFilled && isCurrent ? 'rounded-r-full' : '',
        ].join(' ').trim();
        const showFilledDivider = i < cur; // divider between filled steps only (before current)
        return (
            <button
            key={p.id}
            className={`${base} ${colors} ${rounding}`}
            aria-current={isCurrent ? 'step' : undefined}
            onClick={() => onSelect(p.id)}
            title={p.title}
          >
            <span className="truncate max-w-[180px]">{p.title}</span>
            {(() => {
              const total = p.tasks.length || 0;
              const done = p.tasks.filter(t => t.status === 'completed').length;
              const pct = total > 0 ? Math.round((done/total)*100) : 0;
              return pct === 100 ? (
                <span className={`ml-2 text-[11px] ${isCurrent ? 'text-white/90' : 'text-gray-600'}`}>✔</span>
              ) : null;
            })()}
            {showFilledDivider && (
              <span aria-hidden className="absolute right-0 top-0 h-full w-px bg-blue-500/70" />
            )}
          </button>
        );
      })}
    </div>
  );
};

// Compact phase overview card for Cards tab
const getPhaseIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('search')) return <SearchIcon className="w-6 h-6" />;
  if (t.includes('offer')) return <FileText className="w-6 h-6" />;
  if (t.includes('contract') || t.includes('legal')) return <Scale className="w-6 h-6" />;
  if (t.includes('diligence') || t.includes('inspection')) return <SearchIcon className="w-6 h-6" />;
  if (t.includes('closing') || t.includes('final prep') || t.includes('pre-closing')) return <KeyRound className="w-6 h-6" />;
  if (t.includes('after') || t.includes('post')) return <Home className="w-6 h-6" />;
  return <CheckSquare className="w-6 h-6" />;
};

// Horizontal segmented phase progress bar
const PhaseProgressBar = ({ phases, onSelect, currentId }: { phases: TaskPhase[]; onSelect?: (phaseId: string) => void; currentId?: string }) => {
  const computeCurrentIndex = () => {
    if (currentId) {
      const idx = phases.findIndex(p => p.id === currentId);
      return idx >= 0 ? idx : 0;
    }
    const activeIdx = phases.findIndex(p => p.status === 'active');
    if (activeIdx >= 0) return activeIdx;
    const firstIncomplete = phases.findIndex(p => {
      const total = p.tasks.length || 0;
      const completed = p.tasks.filter(t => t.status === 'completed').length;
      return completed < total;
    });
    return firstIncomplete >= 0 ? firstIncomplete : Math.max(0, phases.length - 1);
  };

  const currentIdx = computeCurrentIndex();

  const getPhaseState = (idx: number) => {
    if (idx < currentIdx) return 'completed';
    if (idx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="inline-flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 shadow-sm">
      {phases.map((p, i) => {
        const st = getPhaseState(i);
        const cls = st === 'current'
          ? 'bg-blue-600 text-white'
          : st === 'completed'
            ? 'bg-white text-gray-500'
            : 'bg-white text-gray-700';
        return (
          <button
            key={p.id}
            onClick={() => onSelect?.(p.id)}
            className={`px-4 py-1.5 rounded-full text-[13px] ${cls} ${i>0?'ml-1':''}`}
            aria-current={st === 'current' ? 'step' : undefined}
            title={p.title}
          >
            {p.title}
          </button>
        );
      })}
    </div>
  );
};

const PhaseOverviewCard = ({ phase, ordinal, totalPhases, onAddTask, onNavigate, onUpdateTask, onUpdateTaskFields, tasksById, onOpenModal }: { phase: TaskPhase, ordinal: number, totalPhases: number, onAddTask?: (phase: TaskPhase, title: string) => void, onNavigate: (page: string) => void, onUpdateTask?: (taskId: string, status: Task['status']) => void, onUpdateTaskFields?: (taskId: string, updates: Partial<Task>) => void, tasksById?: Record<string, Task>, onOpenModal?: (task: Task) => void }) => {
  const completed = phase.tasks.filter(t => t.status === 'completed').length;
  const total = phase.tasks.length || 1;
  const progress = Math.round((completed / total) * 100);
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const statusIcon = (s: Task['status']) => {
    if (s === 'completed') return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
    if (s === 'overdue') return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
    if (s === 'active' || s === 'in-progress') return <Clock className="w-3.5 h-3.5 text-blue-600" />;
    return <Circle className="w-3.5 h-3.5 text-gray-300" />;
  };
  return (
    <Card className="shadow-sm border-gray-200 bg-white hover:shadow-md transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
              {getPhaseIcon(phase.title)}
            </div>
            <CardTitle className="text-lg">{phase.title}</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-600">Phase {ordinal} of {totalPhases}</div>
            <div className="w-28">
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gray-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {(() => {
          const isDiligencePhase = phase.id.toLowerCase().includes('diligence') || phase.title.toLowerCase().includes('diligence');
          if (!isDiligencePhase) {
            const sortedPhaseTasks = sortTasksByDependencies(phase.tasks, tasksById || {});
            return (
              <div className="space-y-2">
                {sortedPhaseTasks.map((task) => (
                  <ExpandableTaskCard
                    key={task.id}
                    task={task}
                    onNavigate={onNavigate}
                    onUpdateTask={onUpdateTask}
                    onUpdateTaskFields={onUpdateTaskFields}
                    tasksById={tasksById}
                    minimal
                    onOpenModal={onOpenModal}
                  />
                ))}
              </div>
            );
          }
          const groups: { label: string; key: string; tasks: Task[] }[] = [
            { label: 'Inspections', key: 'inspections', tasks: phase.tasks.filter(t => (t.subcategory || '').toLowerCase() === 'inspections') },
            { label: 'Legal', key: 'legal', tasks: phase.tasks.filter(t => (t.subcategory || '').toLowerCase() === 'legal') },
            { label: 'Mortgage', key: 'financing', tasks: phase.tasks.filter(t => (t.subcategory || '').toLowerCase() === 'financing') },
          ];
          const other = phase.tasks.filter(t => !['inspections','legal','financing'].includes((t.subcategory || '').toLowerCase()));
          return (
            <div className="space-y-4">
              {groups.map((g) => (
                g.tasks.length > 0 && (
                  <div key={g.key} className="space-y-2">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{g.label}</div>
                    <div className="space-y-2">
                      {sortTasksByDependencies(g.tasks, tasksById || {}).map((task) => (
                        <ExpandableTaskCard
                          key={task.id}
                          task={task}
                          onNavigate={onNavigate}
                          onUpdateTask={onUpdateTask}
                          onUpdateTaskFields={onUpdateTaskFields}
                          tasksById={tasksById}
                          minimal
                          onOpenModal={onOpenModal}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}
              {other.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Other</div>
                  <div className="space-y-2">
                    {sortTasksByDependencies(other, tasksById || {}).map((task) => (
                      <ExpandableTaskCard
                        key={task.id}
                        task={task}
                        onNavigate={onNavigate}
                        onUpdateTask={onUpdateTask}
                        onUpdateTaskFields={onUpdateTaskFields}
                        tasksById={tasksById}
                        minimal
                        onOpenModal={onOpenModal}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        <div className="mt-4">
          {!adding ? (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-600 hover:text-gray-900" onClick={() => setAdding(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add task
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input className="h-8 text-sm" placeholder="New task title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
              <Button size="sm" onClick={() => { if (title.trim()) { onAddTask?.(phase, title.trim()); setTitle(''); setAdding(false); } }}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setTitle(''); }}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface TasksProps {
  onNavigate: (page: string) => void;
}

// Scenario Banner with per-category multi-select dropdowns
function ScenarioBanner({ selectedKeys, onChange, embedded }: { selectedKeys: string[]; onChange: (keys: string[]) => void; embedded?: boolean }) {
  const selected = new Set(selectedKeys);
  const groups: string[] = (scenarioSchema.merge_rules?.order || []) as string[];
  const pretty = (s: string) => {
    const key = s.toLowerCase();
    if (key === 'fha') return 'FHA';
    if (key === 'va') return 'VA';
    if (key === 'usda') return 'USDA';
    if (key === 'conv_mortgage' || key === 'conventional' || key === 'conv') return 'Conventional';
    return s.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const setForGroup = (group: string, keys: string[]) => {
    const next = new Set(selected);
    // Remove any existing keys in this group
    const mods: any[] = Array.isArray((scenarioSchema.modules as any)[group]) ? (scenarioSchema.modules as any)[group] : [];
    mods.forEach((m: any) => next.delete(m.key));
    // Add the provided keys
    keys.forEach(k => next.add(k));
    onChange(Array.from(next));
  };

  const groupSelectedCount = (group: string) => {
    const mods: any[] = Array.isArray((scenarioSchema.modules as any)[group]) ? (scenarioSchema.modules as any)[group] : [];
    return mods.reduce((acc, m) => acc + (selected.has(m.key) ? 1 : 0), 0);
  };

  const totalCount = selected.size;

  return (
    <div className={`${embedded ? 'p-0 border-0 shadow-none mb-0' : 'mb-3 p-3 border rounded-lg bg-white shadow-sm'}`}>
      {!embedded && (
        <div className={`flex items-center justify-between mb-2`}>
          <div className={`font-medium text-sm text-gray-800`}>
            Scenarios & scope
            {totalCount > 0 && <span className="ml-2 text-xs text-gray-600">({totalCount} selected)</span>}
          </div>
        </div>
      )}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 ${embedded ? 'pr-1' : ''}`}>
        {groups.map((group) => {
          const mods: any[] = Array.isArray((scenarioSchema.modules as any)[group]) ? (scenarioSchema.modules as any)[group] : [];
          if (mods.length === 0) return null;
          const count = groupSelectedCount(group);
          return (
            <GroupMultiSelect
              key={group}
              label={pretty(group)}
              options={mods.map((m: any) => ({ key: m.key, label: pretty(m.key) }))}
              selectedKeys={mods.filter((m: any) => selected.has(m.key)).map((m: any) => m.key)}
              onChange={(keys) => setForGroup(group, keys)}
              count={count}
            />
          );
        })}
      </div>
    </div>
  );
}

function GroupMultiSelect({ label, options, selectedKeys, onChange, count }: { label: string; options: { key: string; label: string }[]; selectedKeys: string[]; onChange: (keys: string[]) => void; count: number; }) {
  const [filter, setFilter] = React.useState('');
  const selected = new Set(selectedKeys);
  const toggle = (key: string, enabled: boolean) => {
    const next = new Set(selected);
    if (enabled) next.add(key); else next.delete(key);
    onChange(Array.from(next));
  };
  const filtered = filter ? options.filter(o => o.label.toLowerCase().includes(filter.toLowerCase())) : options;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between items-center gap-2 rounded-full bg-white border-gray-200 hover:bg-gray-50 h-9 px-3 text-[12px] overflow-hidden min-w-0"
        >
          <span className="truncate">{label}</span>
          {count > 0 && <span className="shrink-0 text-gray-500">({count})</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] max-w-[92vw] p-0 bg-white border shadow-lg max-h-[60vh] overflow-hidden flex flex-col" align="start">
        <div className="border-b px-3 py-2 flex items-center justify-between bg-gray-50">
          <div className="font-medium text-sm">{label}</div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onChange([])}>
                Clear
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => onChange(filtered.map(f => f.key))}>
              Select all
            </Button>
          </div>
        </div>
        <div className="p-3 pt-2 bg-white">
          <Input placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <ScrollArea className="flex-1 overflow-auto px-3 pb-3">
          <div className="space-y-2">
            {filtered.map((opt) => (
              <label key={opt.key} htmlFor={`ms-${label}-${opt.key}`} className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 bg-white hover:bg-gray-50">
                <span className="text-sm truncate">{opt.label}</span>
                <Checkbox id={`ms-${label}-${opt.key}`} checked={selected.has(opt.key)} onCheckedChange={(v) => toggle(opt.key, !!v)} />
              </label>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-gray-500 px-1 py-2">No options</div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default function Tasks({ onNavigate }: TasksProps) {
  const isMobile = useIsMobile();
  const taskContext = useTaskContext();
  const propertyContext = usePropertyContext();

  // Feature flags for visibility
  const SHOW_TASK_CATEGORIES = false;
  const SHOW_QUICK_ACTIONS = false;

  const { taskPhases } = taskContext;

  const [modalTask, setModalTask] = useState<Task | null>(null);

  // Scenario toggles (v2): selected scenario keys from schema/engine
  const [selectedScenarioKeys, setSelectedScenarioKeys] = useState<string[]>(() => {
    try { return getScenarioKeys(); } catch { return []; }
  });
  React.useEffect(() => {
    const onStorage = () => { try { setSelectedScenarioKeys(getScenarioKeys()); } catch {} };
    const onEvt = () => { try { setSelectedScenarioKeys(getScenarioKeys()); } catch {} };
    window.addEventListener('storage', onStorage);
    window.addEventListener('scenariosUpdated', onEvt as any);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('scenariosUpdated', onEvt as any);
    };
  }, []);

  const displayedTaskPhases = React.useMemo(() => taskPhases, [taskPhases]);

  const phaseIdToCategory = (phaseId: string): Task['category'] => {
    if (phaseId.includes('search')) return 'search';
    if (phaseId.includes('offer')) return 'offer';
    if (phaseId.includes('contract')) return 'contract';
    if (phaseId.includes('diligence')) return 'diligence';
    if (phaseId.includes('pre-closing')) return 'pre-closing';
    if (phaseId.includes('closing')) return 'closing';
    return 'post-closing';
  };

  const handleAddTaskToPhase = (phase: TaskPhase, title: string) => {
    const category = phaseIdToCategory(phase.id);
    taskContext.addTask({
      title,
      description: '',
      category,
      priority: 'low',
      status: 'upcoming',
      assignedTo: 'Buyer'
    });
  };
  const totalTasks = taskContext.getTotalTasksCount();
  const completedTasks = taskContext.getCompletedTasksCount();
  const activeTasks = taskContext.getActiveTasksCount();
  const overallProgress = taskContext.getOverallProgress();

  const handleUpdateTask = (taskId: string, status: Task['status']) => {
    taskContext.updateTaskStatus(taskId, status);
  };

  const handleUpdateTaskFields = (taskId: string, updates: Partial<Task>) => {
    taskContext.updateTask(taskId, updates);
  };

  // Tab state management
  const [activeTab, setActiveTab] = useState<string>('checklist');
const [checklistSubtab, setChecklistSubtab] = useState<'todo' | 'done'>('todo');
  const [showChecklistHelp, setShowChecklistHelp] = useState<boolean>(() => {
    try { return localStorage.getItem('handoff-dismiss-alert-tasks-v1') !== 'true'; } catch { return true; }
  });
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // When set, show only this phase as its own page
  const [phasePageId, setPhasePageId] = useState<string | null>(null);

  const availableTags = React.useMemo(() => {
    const set = new Set<string>();
    displayedTaskPhases.forEach(p => p.tasks.forEach(t => (t.tags || []).forEach(tag => set.add(tag))));
    const order = ['legal','financing','inspections','insurance','general'];
    const arr = Array.from(set);
    arr.sort((a,b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return arr;
  }, [displayedTaskPhases]);

  const matchesTag = React.useCallback((t: Task) => {
    if (tagFilter === 'all') return true;
    const tags = (t.tags || []).map(s => s.toLowerCase());
    if (tags.includes(tagFilter)) return true;
    return (t.subcategory || '').toLowerCase() === tagFilter;
  }, [tagFilter]);

  const matchesSearch = React.useCallback((t: Task) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.longTitle || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.instructions?.what || '').toLowerCase().includes(q) ||
      (t.instructions?.why || '').toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // selection state for sidebar -> detail
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | undefined>(displayedTaskPhases.find(p => p.status === 'active')?.id);
  const flatTasks = displayedTaskPhases.flatMap(p => p.tasks);
  const tasksById = React.useMemo(() => {
    const map: Record<string, Task> = {};
    flatTasks.forEach(t => { map[t.id] = t; });
    return map;
  }, [taskPhases]);
  const firstActiveTask = flatTasks.find(t => ['active','in-progress','overdue'].includes(t.status)) || flatTasks[0] || null;
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(firstActiveTask?.id);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openInsuranceCalcModal, setOpenInsuranceCalcModal] = useState(false);
  const [openAllDocsModal, setOpenAllDocsModal] = useState(false);

  // Aggregate contacts from all checklist tasks (unique by email|name|role)
  const checklistContacts = React.useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ name?: string; role?: string; email?: string; phone?: string; when?: string }> = [];
    displayedTaskPhases.forEach(phase => {
      phase.tasks.forEach(t => {
        (t.contacts || []).forEach((c: any) => {
          const key = `${(c.email||'').toLowerCase()}|${(c.name||'').toLowerCase()}|${(c.role||'').toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push({ name: c.name, role: c.role, email: c.email, phone: c.phone, when: c.when });
          }
        });
      });
    });
    return out;
  }, [displayedTaskPhases]);

  // Aggregate documents from all tasks
  const allTaskDocuments = React.useMemo(() => {
    type Doc = { name: string; url?: string; sourceTaskId?: string; sourceTaskTitle?: string };
    const docs: Doc[] = [];
    displayedTaskPhases.forEach(phase => {
      phase.tasks.forEach(t => {
        // names-only documents array
        (t.documents || []).forEach((name) => {
          docs.push({ name, sourceTaskId: t.id, sourceTaskTitle: t.title });
        });
        const cf: any = (t as any).customFields || {};
        // generic attachments
        (cf.attachments || []).forEach((a: any) => {
          if (!a) return;
          docs.push({ name: a.name || 'Attachment', url: a.url, sourceTaskId: t.id, sourceTaskTitle: t.title });
        });
        // contract PDF
        if (cf.contractPdfUrl) {
          docs.push({ name: 'Contract PDF', url: cf.contractPdfUrl, sourceTaskId: t.id, sourceTaskTitle: t.title });
        }
        // inspections reports
        (cf.inspections?.reports || []).forEach((r: any) => {
          if (!r) return;
          docs.push({ name: r.name || 'Inspection Report', url: r.url, sourceTaskId: t.id, sourceTaskTitle: t.title });
        });
        // insurance policies
        (cf.insurance?.policies || []).forEach((p: any) => {
          if (!p) return;
          docs.push({ name: p.name || 'Insurance Policy', url: p.url, sourceTaskId: t.id, sourceTaskTitle: t.title });
        });
      });
    });
    return docs;
  }, [displayedTaskPhases]);

  // Handle task selection and tab synchronization
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = flatTasks.find(t => t.id === taskId);
    setSelectedTask(task || null);

    // Auto-switch to appropriate tab based on task subcategory
  };
  
  // Get active tasks for quick actions
  const activeTasksForAlert = displayedTaskPhases.flatMap(phase => phase.tasks).filter(task => 
    ['active', 'in-progress', 'overdue'].includes(task.status)
  );
  
  // Calculate task counts by category for navigation shortcuts
  const getTaskCountByCategory = (category: string) => {
    return taskContext.getActiveTasksByCategory(category.toLowerCase()).length;
  };

  React.useEffect(() => {
    const onMsg = (event: MessageEvent) => {
      const data: any = event.data || {};
      if (data.type === 'task-update' && data.taskId) {
        taskContext.updateTask(data.taskId, data.updates || {});
      } else if (data.type === 'navigate' && data.page) {
        if (data.tab === 'find-home') {
          try { localStorage.setItem('handoff-propertysearch-selected-tab','find-home'); } catch {}
        }
        onNavigate(data.page);
      } else if (data.type === 'download-questionnaire') {
        // trigger the questionnaire PDF from current window if needed
        try {
          const ev = new CustomEvent('downloadQuestionnaire', {});
          window.dispatchEvent(ev);
        } catch {}
      }
    };
    const onAnchors = (e: any) => {
      try {
        taskContext.setScheduleAnchors(e.detail || {});
      } catch {}
    };
    window.addEventListener('message', onMsg);
    window.addEventListener('updateScheduleAnchors', onAnchors as any);
    const onSelectPhase = (e: any) => {
      try {
        const id = e?.detail?.id;
        if (id) {
          setActiveTab('checklist');
          setChecklistSubtab('todo');
          setPhasePageId(id);
          const el = document.getElementById(`phase-card-${id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch {}
    };
    window.addEventListener('selectPhase', onSelectPhase as any);
    return () => {
      window.removeEventListener('message', onMsg);
      window.removeEventListener('updateScheduleAnchors', onAnchors as any);
      window.removeEventListener('selectPhase', onSelectPhase as any);
    };
  }, [taskContext, onNavigate]);

  // Global task-details open handler (from Calendar, Property Search, etc.)
  React.useEffect(() => {
    const onOpenTask = (e: any) => {
      try {
        const id = e?.detail?.taskId as string | undefined;
        if (!id) return;
        const task = tasksById[id];
        if (task) {
          setActiveTab('checklist');
          setModalTask(task);
        }
      } catch {}
    };
    window.addEventListener('openTaskDetails', onOpenTask as any);
    return () => {
      window.removeEventListener('openTaskDetails', onOpenTask as any);
    };
  }, [tasksById]);
  
  return (
    <div className="space-y-8 max-w-none bg-[#F6F7FB] p-4 sm:p-6 [&_button]:shadow-none [&_button:focus]:outline-none [&_button:focus]:ring-0 [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-0 [&_button:active]:font-semibold">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">


        <TabsContent value="checklist" className="space-y-6 mt-4 md:mt-6 bg-[#F6F7FB]">
          {showChecklistHelp && (
            <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-900 p-3 flex items-start justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">Using the Transaction Checklist and Calendar</div>
                <p className="mt-1">
                  Track tasks by phase in the checklist. Select a task to see “What it is”, “Why it matters”, and “How to complete it.” Use the Calendar to drag-and-drop due dates and open task details by clicking a task.
                </p>
                <p className="mt-1">Before using the checklist, click "Select scenarios" above to set your Scope and Scenarios.</p>
              </div>
              <button
                aria-label="Dismiss"
                className="p-1 text-amber-900/70 hover:text-amber-900"
                onClick={() => { setShowChecklistHelp(false); try { localStorage.setItem('handoff-dismiss-alert-tasks-v1','true'); } catch {} }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="px-1 space-y-4">
            {/* Milestone bar + scenarios selector */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-full h-9 px-4 text-[13px] border-gray-200 bg-white hover:bg-gray-50">
                    Select scenarios{selectedScenarioKeys.length ? ` (${selectedScenarioKeys.length})` : ''}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[720px] max-w-[92vw] p-3 bg-white" align="start">
                  <ScenarioBanner
                    embedded
                    selectedKeys={selectedScenarioKeys}
                    onChange={(nextKeys) => {
                      setSelectedScenarioKeys(nextKeys);
                      const map: Record<string, boolean> = {};
                      nextKeys.forEach(k => { map[k] = true; });
                      try { saveScenarioSelection(map); } catch {}
                      try { window.dispatchEvent(new Event('scenariosUpdated')); } catch {}
                    }}
                  />
                </PopoverContent>
              </Popover>
              <div className="w-full md:w-auto overflow-x-auto">
                <InlinePhaseStepper
                  phases={displayedTaskPhases}
                  currentId={phasePageId || displayedTaskPhases.find(p => p.status === 'active')?.id}
                  onSelect={(id) => {
                    setPhasePageId(id);
                    setChecklistSubtab('todo');
                    setTimeout(() => {
                      const el = document.getElementById(`phase-card-${id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 0);
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {(() => {
                    const addr = propertyContext?.propertyData?.address;
                    return addr ? `Your Transaction — ${addr}` : 'Your Transaction';
                  })()}
                </h2>
                <p className="text-sm text-gray-600">The transaction overview outlines objectives, timelines, and progress updates.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-violet-100 text-violet-800 text-[12px] px-3 py-1 rounded-full">On Track</Badge>
                  <Badge className="bg-green-100 text-green-800 text-[12px] px-3 py-1 rounded-full font-semibold">{Math.round(overallProgress)}% Complete</Badge>
                </div>
              </div>
            </div>
            {/* To-do | Done toggle */}
            <div>
              <Tabs value={checklistSubtab} onValueChange={(v)=>setChecklistSubtab(v as 'todo'|'done')}>
                <TabsList className="bg-transparent h-auto p-0 rounded-none border-b border-gray-200">
                  <TabsTrigger value="todo" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 pb-2 px-4 text-gray-600 data-[state=active]:text-gray-900">To-do list</TabsTrigger>
                  <TabsTrigger value="done" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 pb-2 px-4 text-gray-600 data-[state=active]:text-gray-900">Done</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Tag</Label>
                  <Select value={tagFilter} onValueChange={(v) => setTagFilter(v)}>
                    <SelectTrigger className="h-8 w-[200px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Search</Label>
                  <Input className="h-8 w-[220px]" placeholder="Find tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Left: To-do / Done content */}
              <div className="lg:col-span-3 space-y-4">
                {checklistSubtab === 'todo' && (
                  <>
                    {phasePageId && (
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setPhasePageId(null)}>
                          ← All phases
                        </Button>
                        <div className="text-sm text-gray-600">
                          {displayedTaskPhases.find(p => p.id === phasePageId)?.title}
                        </div>
                      </div>
                    )}
                    {(phasePageId ? displayedTaskPhases.filter(p => p.id === phasePageId) : displayedTaskPhases).map((phase) => {
                      let tasks = phase.tasks.filter(t => t.status !== 'completed');
                      if (tagFilter !== 'all') tasks = tasks.filter(matchesTag);
                      if (searchQuery) tasks = tasks.filter(matchesSearch);
                      if (tasks.length === 0) return null;

                      const isDiligence = phase.id.toLowerCase().includes('diligence') || phase.title.toLowerCase().includes('diligence');
                      if (isDiligence) {
                        const legal = tasks.filter(t => ((t.subcategory || '') as string).toLowerCase() === 'legal' || (t.tags || []).includes('legal'));
                        const inspections = tasks.filter(t => ['inspections','inspection'].includes(((t.subcategory || '') as string).toLowerCase()) || (t.tags || []).includes('inspections'));
                        const insurance = tasks.filter(t => ((t.subcategory || '') as string).toLowerCase() === 'insurance' || (t.tags || []).includes('insurance'));
                        const mortgage = tasks.filter(t => ['financing','mortgage'].includes(((t.subcategory || '') as string).toLowerCase()) || (t.tags || []).includes('financing'));
                        return (
                          <div key={phase.id} id={`phase-card-${phase.id}`}>
                            <TaskTableCardGrouped
                              title={phase.title}
                              groups={[
                                { label: 'Legal', tasks: legal },
                                { label: 'Inspections', tasks: inspections },
                                { label: 'Insurance', tasks: insurance },
                                { label: 'Mortgage', tasks: mortgage },
                              ]}
                              onNavigate={onNavigate}
                              onUpdateTask={handleUpdateTask}
                              onUpdateTaskFields={handleUpdateTaskFields}
                              tasksById={tasksById}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={phase.id} id={`phase-card-${phase.id}`}>
                          <TaskTableCard
                            title={phase.title}
                            tasks={tasks}
                            onNavigate={onNavigate}
                            onUpdateTask={handleUpdateTask}
                            onUpdateTaskFields={handleUpdateTaskFields}
                            tasksById={tasksById}
                          />
                        </div>
                      );
                    })}
                  </>
                )}
                {checklistSubtab === 'done' && (() => {
                  const completed = displayedTaskPhases.flatMap(p => p.tasks.filter(t => t.status === 'completed'));
                  let filtered = tagFilter === 'all' ? completed : completed.filter(matchesTag);
                  if (searchQuery) filtered = filtered.filter(matchesSearch);
                  return (
                    <TaskTableCard
                      title="Completed"
                      tasks={filtered}
                      onNavigate={onNavigate}
                      onUpdateTask={handleUpdateTask}
                      onUpdateTaskFields={handleUpdateTaskFields}
                      tasksById={tasksById}
                    />
                  );
                })()}
              </div>

              {/* Right sidebar */}
              <div className="lg:col-span-1 space-y-4">
                {/* Quick Links card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold tracking-[-0.01em] text-gray-900">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={() => setOpenInsuranceCalcModal(true)}>
                      <Calculator className="w-4 h-4 mr-2" /> Insurance Calculator
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={() => {
                      const el = document.getElementById('contacts-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>
                      <Users className="w-4 h-4 mr-2" /> Contacts
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={() => setOpenAllDocsModal(true)}>
                      <FileText className="w-4 h-4 mr-2" /> All Documents
                    </Button>
                  </CardContent>
                </Card>

                {/* Workspaces card hidden after integrating inline flows */}
                {false && (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[15px] font-semibold tracking-[-0.01em] text-gray-900">Workspaces</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <Button variant="outline" className="w-full justify-start h-11 text-[13px] font-medium text-gray-800 px-3 whitespace-normal leading-normal rounded-[10px] border border-[#E6E8F0] bg-white hover:bg-[#F5F7FB]" onClick={() => setActiveTab('legal')}>
                        <Scale className="w-4 h-4 mr-2" /> Legal
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-11 text-[13px] font-medium text-gray-800 px-3 whitespace-normal leading-normal rounded-[10px] border border-[#E6E8F0] bg-white hover:bg-[#F5F7FB]" onClick={() => setActiveTab('inspections')}>
                        <FileCheck className="w-4 h-4 mr-2" /> Inspections
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold tracking-[-0.01em] text-gray-900">Contract dates</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {(() => {
                      const closing = taskContext.scheduleAnchors.closingDate || propertyContext?.propertyData?.targetClosingDate || '';
                      const label = daysLeft(closing);
                      return closing ? (
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{label || 'Closing date set'}</span>
                        </div>
                      ) : null;
                    })()}
                    <div className="flex flex-col gap-3">
                      <div>
                        <Label className="text-xs">Offer Accepted</Label>
                        <Input type="date" defaultValue={taskContext.scheduleAnchors.offerAcceptedDate || ''} onChange={(e) => taskContext.setScheduleAnchors({ offerAcceptedDate: e.target.value || undefined })} />
                      </div>
                      <div>
                        <Label className="text-xs">Closing Date</Label>
                        <Input type="date" defaultValue={taskContext.scheduleAnchors.closingDate || ''} onChange={(e) => taskContext.setScheduleAnchors({ closingDate: e.target.value || undefined })} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Due dates update dynamically from anchors (locked dates are preserved).</span>
                        <Button size="sm" variant="outline" onClick={() => taskContext.recomputeDueDates()}>Recompute</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="contacts-card" className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold tracking-[-0.01em] text-gray-900">Contacts</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {checklistContacts.length === 0 ? (
                      <div className="text-sm text-gray-600">
                        No contacts yet. Add contacts within checklist tasks and they will appear here.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {checklistContacts.slice(0, 6).map((c, idx) => (
                          <div key={`${c.email||c.name||idx}`} className="p-2 border rounded-lg bg-white">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">{c.name || 'Contact'}</div>
                                <div className="text-xs text-gray-600 truncate">{c.role || ''}{c.when ? ` • ${c.when}` : ''}</div>
                                <div className="text-xs text-gray-500 truncate">{c.email || ''}</div>
                                <div className="text-xs text-gray-500 truncate">{c.phone || ''}</div>
                              </div>
                              <div className="flex flex-col gap-1 flex-shrink-0">
                                {c.phone && (
                                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => { window.location.href = `tel:${c.phone}`; }}>
                                    <Phone className="w-3.5 h-3.5 mr-1" /> Call
                                  </Button>
                                )}
                                {c.email && (
                                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => { window.location.href = `mailto:${c.email}`; }}>
                                    <Mail className="w-3.5 h-3.5 mr-1" /> Email
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {checklistContacts.length > 6 && (
                          <div className="text-xs text-gray-600">And {checklistContacts.length - 6} more…</div>
                        )}
                        <div className="pt-1">
                          <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenAllDocsModal(true)}>View all documents</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
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

          {/* Insurance Calculator Modal */}
          <Dialog open={openInsuranceCalcModal} onOpenChange={setOpenInsuranceCalcModal}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Insurance Calculator</DialogTitle>
              </DialogHeader>
              <div className="max-h-[75vh] overflow-auto">
                <InsuranceCalculator />
              </div>
            </DialogContent>
          </Dialog>

          {/* All Documents Modal */}
          <Dialog open={openAllDocsModal} onOpenChange={setOpenAllDocsModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>All Documents</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-auto">
                {allTaskDocuments.length === 0 ? (
                  <div className="text-sm text-gray-600 p-2">No documents uploaded yet. Upload files within checklist tasks and they will appear here.</div>
                ) : (
                  <div className="divide-y">
                    {allTaskDocuments.map((d, i) => (
                      <div key={`${d.name}-${i}`} className="py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">{d.name}</div>
                          <div className="text-xs text-gray-600 truncate">{d.sourceTaskTitle || d.sourceTaskId}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {d.url ? (
                            <Button size="sm" variant="outline" onClick={() => window.open(d.url, '_blank')}>Open</Button>
                          ) : (
                            <Badge variant="secondary" className="text-[11px]">No link</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>


      </Tabs>

      {modalTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalTask(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-auto p-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-lg font-semibold truncate pr-4">{modalTask.title}</h3>
              <Button variant="outline" size="sm" onClick={() => setModalTask(null)}>Close</Button>
            </div>
            <ExpandableTaskCard
              task={modalTask}
              onNavigate={onNavigate}
              onUpdateTask={handleUpdateTask}
              onUpdateTaskFields={handleUpdateTaskFields}
              tasksById={tasksById}
              minimal
              forceOpen
            />
          </div>
        </div>
      )}
    </div>
  );
}
