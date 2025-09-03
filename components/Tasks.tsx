import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle, Calendar, User, ArrowRight, Filter, ChevronDown, ChevronRight, ExternalLink, Scale, Calculator, FileCheck, Shield, CheckSquare, Lock, Unlock, Search as SearchIcon, Home, FileText, KeyRound, Plus } from 'lucide-react';
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
import ChecklistLegalTabs from './checklist/LegalTabs';
import ChecklistInspectionTabs from './checklist/InspectionTabs';
import ChecklistInsuranceTabs from './checklist/InsuranceTabs';
import ChecklistSidebar from './checklist/ChecklistSidebar';
import ChecklistDetail from './checklist/ChecklistDetail';
import ChecklistCalendar from './checklist/ChecklistCalendar';
import ChecklistKanban from './checklist/ChecklistKanban';
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

const ExpandableTaskCard = ({ task, onNavigate, onUpdateTask, onUpdateTaskFields, tasksById, minimal, openInWindow, onOpenModal, forceOpen }: {
  task: Task;
  onNavigate: (page: string) => void;
  onUpdateTask?: (taskId: string, status: Task['status']) => void;
  onUpdateTaskFields?: (taskId: string, updates: Partial<Task>) => void;
  tasksById?: Record<string, Task>;
  minimal?: boolean;
  openInWindow?: boolean;
  onOpenModal?: (task: Task) => void;
  forceOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  React.useEffect(() => { if (forceOpen) setIsOpen(true); }, [forceOpen]);
  const isCompleted = task.status === 'completed';
  const isActive = ['active', 'in-progress', 'overdue'].includes(task.status);
  const isOverdue = task.status === 'overdue';

  // Local editable state
  const [editTitle, setEditTitle] = useState<string>(task.title);
  const [editAssignedTo, setEditAssignedTo] = useState<string>(task.assignedTo || '');
  const [editDueDate, setEditDueDate] = useState<string>(task.dueDate || '');
  const [editNotes, setEditNotes] = useState<string>(task.notes || '');
  const currentAttorney = (task.contacts || []).find(c => c.role.toLowerCase().includes('attorney'));
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
  <div class="row"><button id="openSearch">Open Home Search</button><button id="downloadPdf" class="primary">Download Questionnaire PDF</button></div>`:''}

  ${task.id==='task-property-search' ? `
  <div class="section-title">Search Links</div>
  <div class="row"><button id="openSearch2">Open Property Search</button><button id="openTrack">Open Home Tracking</button></div>`:''}

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
  const os=document.getElementById('openSearch'); if(os) os.onclick=()=>{window.opener && window.opener.postMessage({type:'navigate', page:'property-search'}, '*')};
  const d=document.getElementById('downloadPdf'); if(d) d.onclick=()=>{window.opener && window.opener.postMessage({ type:'download-questionnaire'}, '*')};
  const os2=document.getElementById('openSearch2'); if(os2) os2.onclick=()=>{window.opener && window.opener.postMessage({type:'navigate', page:'property-search'}, '*')};
  const ot=document.getElementById('openTrack'); if(ot) ot.onclick=()=>{window.opener && window.opener.postMessage({type:'navigate', page:'home-tracking'}, '*')};
</script>
</body></html>`;
    w.document.write(html);
    w.document.close();
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`${minimal ? `rounded-lg min-h-[100px] hover:bg-gray-50/30 ${isOverdue ? 'border-l-4 border-l-red-300' : isActive ? 'border-l-4 border-l-blue-300' : 'border-l-4 border-l-gray-200'}` : `border rounded-lg transition-all hover:shadow-md min-h-[100px] ${
        isOverdue ? 'border-red-200 bg-red-50/30' :
        isActive ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'}`}` }>
        <CollapsibleTrigger className={`${minimal ? 'w-full p-4 text-left' : 'w-full p-6 text-left'}`} onClick={(e) => { if (openInWindow) { e.preventDefault(); e.stopPropagation(); openTaskPopup(); } else if (onOpenModal) { e.preventDefault(); e.stopPropagation(); onOpenModal(task); } }}>
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
              <div className="flex items-start justify-between gap-3">
                <h4 className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'} break-words leading-tight flex-1`}>
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
        
        <CollapsibleContent className={`${minimal ? 'px-4 pb-4' : 'px-5 pb-5'}`}>
          <div className={`${minimal ? 'ml-6 space-y-3 pt-2' : 'ml-8 space-y-4 pt-3 border-t border-gray-100'}`}>
            <p className="text-sm text-gray-600">{task.description}</p>

            {task.instructions?.tips && task.instructions.tips.length > 0 && (
              <div className="pt-1">
                <Label className="text-xs">Tips</Label>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  {task.instructions.tips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-gray-600">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dependencies chips */}
            {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
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
            )}

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Assigned to</Label>
                <Input value={editAssignedTo} onChange={(e) => setEditAssignedTo(e.target.value)} placeholder="Buyer / Agent / Lender" />
              </div>
              <div>
                <Label className="text-xs">Due date</Label>
                <div className="flex items-center gap-2">
                  <Input type="date" value={editDueDate} onChange={(e) => { setEditDueDate(e.target.value); setDueLocked(!!e.target.value); }} />
                  <Button
                    type="button"
                    size="icon"
                    variant={dueLocked ? 'default' : 'outline'}
                    onClick={() => setDueLocked((v) => !v)}
                    title={dueLocked ? 'Unlock to allow dynamic recalculation' : 'Lock to prevent recalculation'}
                  >
                    {dueLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{dueLocked ? 'Locked: will not change when anchors update.' : 'Will update when anchors change.'}</p>
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
              </div>
            </div>

            {/* Attorney contact: only for "find/hire attorney" task */}
            {task.id === 'task-attorney-selection' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Attorney name</Label>
                  <Input value={attorneyName} onChange={(e) => setAttorneyName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Attorney email</Label>
                  <Input type="email" value={attorneyEmail} onChange={(e) => setAttorneyEmail(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Attorney phone</Label>
                  <Input value={attorneyPhone} onChange={(e) => setAttorneyPhone(e.target.value)} />
                </div>
              </div>
            )}

            {/* Agent details: for agent selection */}
            {task.id === 'task-agent-selection' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Agent name</Label>
                  <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Agent email</Label>
                  <Input type="email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Agent phone</Label>
                  <Input value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Brokerage</Label>
                  <Input value={agentBrokerage} onChange={(e) => setAgentBrokerage(e.target.value)} />
                </div>
              </div>
            )}

            {/* Pre-approval details */}
            {task.id === 'task-mortgage-preapproval' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Lender name</Label>
                  <Input value={lenderNamePA} onChange={(e) => setLenderNamePA(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Pre-approval amount</Label>
                  <Input value={preApprovalAmount} onChange={(e) => setPreApprovalAmount(e.target.value)} placeholder="$" />
                </div>
                <div>
                  <Label className="text-xs">Rate</Label>
                  <Input value={preApprovalRate} onChange={(e) => setPreApprovalRate(e.target.value)} placeholder="%" />
                </div>
                <div>
                  <Label className="text-xs">Expiration</Label>
                  <Input type="date" value={preApprovalExpiry} onChange={(e) => setPreApprovalExpiry(e.target.value)} />
                </div>
              </div>
            )}

            {/* Questionnaire helpers */}
            {task.id === 'task-buy-box-template' && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => onNavigate('property-search')}>Open Home Search</Button>
                <Button size="sm" onClick={handleDownloadQuestionnairePDF}>Download Questionnaire PDF</Button>
              </div>
            )}

            {/* Property search helpers */}
            {task.id === 'task-property-search' && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => onNavigate('property-search')}>Open Property Search</Button>
                <Button size="sm" variant="outline" onClick={() => onNavigate('home-tracking')}>Open Home Tracking</Button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{editAssignedTo || 'Unassigned'}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {task.category}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </Badge>
                {editDueDate && <span className="text-xs text-primary">Due: {formatDate(editDueDate)} {dueLocked && <Lock className="inline w-3 h-3 ml-1" />}</span>}
              </div>
              {task.completedDate && (
                <span className="text-sm text-green-600">Completed {task.completedDate}</span>
              )}
            </div>

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
                  };

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
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditTitle(task.title);
                  setEditAssignedTo(task.assignedTo || '');
                  setEditDueDate(task.dueDate || '');
                  setDueLocked(!!task.dueDateLocked);
                  setEditNotes(task.notes || '');
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
  
  return (
    <Card className="mb-6 shadow-sm">
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
            <div className="mt-4 flex items-center gap-2">
              <Input
                placeholder="Add a task to this phase"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <Button size="sm" onClick={() => { if (newTaskTitle.trim()) { onAddTask?.(phase, newTaskTitle.trim()); setNewTaskTitle(''); } }}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Compact phase overview card for Cards tab
const getPhaseIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('search')) return <SearchIcon className="w-6 h-6" />;
  if (t.includes('offer')) return <FileText className="w-6 h-6" />;
  if (t.includes('contract') || t.includes('legal')) return <Scale className="w-6 h-6" />;
  if (t.includes('diligence')) return <SearchIcon className="w-6 h-6" />;
  if (t.includes('closing')) return <KeyRound className="w-6 h-6" />;
  if (t.includes('post')) return <Home className="w-6 h-6" />;
  return <CheckSquare className="w-6 h-6" />;
};

const PhaseOverviewCard = ({ phase, onAddTask, onNavigate, onUpdateTask, onUpdateTaskFields, tasksById, onOpenModal }: { phase: TaskPhase, onAddTask?: (phase: TaskPhase, title: string) => void, onNavigate: (page: string) => void, onUpdateTask?: (taskId: string, status: Task['status']) => void, onUpdateTaskFields?: (taskId: string, updates: Partial<Task>) => void, tasksById?: Record<string, Task>, onOpenModal?: (task: Task) => void }) => {
  const completed = phase.tasks.filter(t => t.status === 'completed').length;
  const total = phase.tasks.length || 1;
  const progress = Math.round((completed / total) * 100);
  const [title, setTitle] = useState('');
  const statusIcon = (s: Task['status']) => {
    if (s === 'completed') return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
    if (s === 'overdue') return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
    if (s === 'active' || s === 'in-progress') return <Clock className="w-3.5 h-3.5 text-blue-600" />;
    return <Circle className="w-3.5 h-3.5 text-gray-300" />;
  };
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
              {getPhaseIcon(phase.title)}
            </div>
            <CardTitle className="text-lg">{phase.title}</CardTitle>
          </div>
          <div className="w-28">
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-gray-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {phase.tasks.map((task) => (
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
        <div className="mt-4 flex items-center gap-2">
          <Input placeholder="Add task" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button size="sm" onClick={() => { if (title.trim()) { onAddTask?.(phase, title.trim()); setTitle(''); } }}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </CardContent>
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

  const [modalTask, setModalTask] = useState<Task | null>(null);

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
const [checklistSubtab, setChecklistSubtab] = useState<'cards' | 'board'>('cards');

  // selection state for sidebar -> detail
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | undefined>(taskPhases.find(p => p.status === 'active')?.id);
  const flatTasks = taskPhases.flatMap(p => p.tasks);
  const tasksById = React.useMemo(() => {
    const map: Record<string, Task> = {};
    flatTasks.forEach(t => { map[t.id] = t; });
    return map;
  }, [taskPhases]);
  const firstActiveTask = flatTasks.find(t => ['active','in-progress','overdue'].includes(t.status)) || flatTasks[0] || null;
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(firstActiveTask?.id);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Handle task selection and tab synchronization
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = flatTasks.find(t => t.id === taskId);
    setSelectedTask(task || null);

    // Auto-switch to appropriate tab based on task subcategory
    if (task?.subcategory) {
      switch (task.subcategory) {
        case 'legal':
          setActiveTab('legal');
          break;
        case 'inspections':
          setActiveTab('inspections');
          break;
        case 'insurance':
          setActiveTab('insurance');
          break;
        default:
          // Stay on checklist tab for general tasks
          break;
      }
    }
  };
  
  // Get active tasks for quick actions
  const activeTasksForAlert = taskPhases.flatMap(phase => phase.tasks).filter(task => 
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
        onNavigate(data.page);
      } else if (data.type === 'download-questionnaire') {
        // trigger the questionnaire PDF from current window if needed
        try {
          const ev = new CustomEvent('downloadQuestionnaire', {});
          window.dispatchEvent(ev);
        } catch {}
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [taskContext, onNavigate]);
  
  return (
    <div className="space-y-8 max-w-none">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start">
          <TabsTrigger
            value="checklist"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Checklist
          </TabsTrigger>
          <TabsTrigger
            value="legal"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Legal
          </TabsTrigger>
          <TabsTrigger
            value="inspections"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Inspections
          </TabsTrigger>
          <TabsTrigger
            value="insurance"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Insurance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-6 mt-6 bg-white">
          {/* Sub-tabs: List | Calendar */}
          <div className="px-1">
            {/* Schedule Anchors */}
            <div className="mb-4 p-3 border rounded-lg bg-gray-50">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <Label className="text-xs">Offer Accepted</Label>
                  <Input
                    type="date"
                    defaultValue={taskContext.scheduleAnchors.offerAcceptedDate || ''}
                    onChange={(e) => taskContext.setScheduleAnchors({ offerAcceptedDate: e.target.value || undefined })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Closing Date</Label>
                  <Input
                    type="date"
                    defaultValue={taskContext.scheduleAnchors.closingDate || ''}
                    onChange={(e) => taskContext.setScheduleAnchors({ closingDate: e.target.value || undefined })}
                  />
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                  <span>Due dates update dynamically from anchors (locked dates are preserved).</span>
                  <Button size="sm" variant="outline" onClick={() => taskContext.recomputeDueDates()}>Recompute now</Button>
                </div>
              </div>
            </div>
<Tabs value={checklistSubtab} onValueChange={(v) => setChecklistSubtab(v as 'cards' | 'board')} className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start">
                <TabsTrigger
                  value="cards"
                  className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-2 px-4 font-medium transition-all duration-200"
                >
                  Cards
                </TabsTrigger>
                <TabsTrigger
                  value="board"
                  className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-2 px-4 font-medium transition-all duration-200"
                >
                  Board
                </TabsTrigger>
              </TabsList>
                <Button variant="outline" size="sm" onClick={() => onNavigate('calendar')} className="ml-2">
                  Open full calendar
                </Button>
              </div>

              <TabsContent value="cards" className="space-y-3 mt-4">
                {/* Overview cards by phase */}
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
                  {taskPhases.map((phase) => (
                    <PhaseOverviewCard key={phase.id} phase={phase} onAddTask={handleAddTaskToPhase} onNavigate={onNavigate} onUpdateTask={handleUpdateTask} onUpdateTaskFields={handleUpdateTaskFields} tasksById={tasksById} onOpenModal={(t)=>setModalTask(t)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="board" className="space-y-6 mt-6">
                <ChecklistKanban
                  tasks={flatTasks}
                  onUpdateTask={(taskId, updates) => {
                    const nextUpdates = { ...updates } as Partial<Task>;
                    if ('dueDate' in updates) {
                      (nextUpdates as any).dueDateLocked = !!updates.dueDate;
                    }
                    taskContext.updateTask(taskId, nextUpdates);
                  }}
                  onNavigate={onNavigate}
                />
              </TabsContent>
            </Tabs>
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

        <TabsContent value="legal" className="space-y-6 mt-6 bg-white">
          <ChecklistLegalTabs selectedTask={selectedTask} />
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6 mt-6 bg-white">
          <ChecklistInspectionTabs selectedTask={selectedTask} />
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6 mt-6 bg-white">
          <ChecklistInsuranceTabs selectedTask={selectedTask} />
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
              forceOpen
            />
          </div>
        </div>
      )}
    </div>
  );
}
