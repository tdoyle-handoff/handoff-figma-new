import { scenarioSchema } from './scenarioSchema';
import type { Task } from '../components/TaskContext';

export type ScenarioSelection = Record<string, boolean>;

// Storage helpers
const STORAGE_KEY = 'handoff-scenarios-v2';

export function getSelectedScenarios(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const obj = JSON.parse(raw) as ScenarioSelection;
    return Object.keys(obj).filter((k) => !!obj[k]);
  } catch {
    return [];
  }
}

export function setSelectedScenarios(sel: ScenarioSelection) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sel)); } catch {}
}

// Phase/category mapping
function mapPhaseToCategory(phase: string): { category: Task['category']; subcategory?: Task['subcategory'] } {
  const p = String(phase || '').toLowerCase();
  switch (p) {
    case 'pre_offer':
      return { category: 'search' };
    case 'offer':
      return { category: 'offer' };
    case 'contract':
      return { category: 'contract', subcategory: 'legal' };
    case 'due_diligence':
      return { category: 'diligence' };
    case 'financing':
      return { category: 'diligence', subcategory: 'financing' };
    case 'pre_close':
      return { category: 'pre-closing' };
    case 'closing':
      return { category: 'closing' };
    case 'post_close':
      return { category: 'post-closing' };
    default:
      return { category: 'diligence' };
  }
}

function makeTaskId(id: string) {
  return `schema-${id}`;
}

function cloneTask(t: Task): Task { return JSON.parse(JSON.stringify(t)); }

function upsertTask(list: Task[], incoming: Task) {
  const idx = list.findIndex((x) => x.id === incoming.id);
  if (idx >= 0) list[idx] = incoming; else list.push(incoming);
}

function findTask(list: Task[], ids: string[]): Task | undefined {
  for (const id of ids) {
    const t = list.find((x) => x.id === id || x.id === makeTaskId(id));
    if (t) return t;
  }
  return undefined;
}

function ensureArray<T>(a: T | T[] | undefined): T[] {
  if (!a) return [];
  return Array.isArray(a) ? a : [a];
}

function collectModuleByKey(moduleArr: any[], key: string, accAdds: any[], accOverrides: any[], visited = new Set<string>()) {
  const mod = moduleArr.find((m: any) => m.key === key);
  if (!mod || visited.has(key)) return;
  visited.add(key);
  // Inherits first
  const inh = ensureArray<string>(mod.inherits);
  inh.forEach((k) => collectModuleByKey(moduleArr, k, accAdds, accOverrides, visited));
  // Then apply this module
  accAdds.push(...(mod.adds || []));
  accOverrides.push(...(mod.overrides || []));
}

function buildScenarioAddsAndOverrides(selected: string[]) {
  const adds: any[] = [];
  const overrides: any[] = [];
  const order: string[] = scenarioSchema.merge_rules?.order || [];

  // walk all modules in specified order
  order.forEach((groupName) => {
    const group = (scenarioSchema.modules as any)[groupName] as any[];
    if (!Array.isArray(group)) return;
    selected.forEach((key) => {
      const accAdds: any[] = [];
      const accOverrides: any[] = [];
      collectModuleByKey(group, key, accAdds, accOverrides);
      adds.push(...accAdds);
      overrides.push(...accOverrides);
    });
  });
  return { adds, overrides };
}

// Map schema task ids to canonical task-* ids so titles dedupe with baseline tasks
const SCHEMA_ID_TO_TASK_ID: Record<string, string> = {
  // Base tasks
  proof_of_funds_or_preapproval: 'task-proof-of-funds',
  draft_offer: 'task-draft-offer',
  open_escrow: 'task-open-escrow',
  title_search: 'task-title-search',
  general_inspection: 'task-home-inspection',
  appraisal: 'task-appraisal',
  clear_to_close: 'task-clear-to-close',
  final_walkthrough: 'task-final-walkthrough',
  close_and_record: 'task-close-and-record',

  // Financing module
  loan_application: 'task-mortgage-application',
  rate_lock: 'task-rate-lock',
  loan_conditions: 'task-loan-conditions',
  fha_amendatory_clause: 'task-fha-amendatory-clause',
  fha_minimum_property_standards: 'task-fha-mps-repairs',
  va_escape_clause: 'task-va-escape-clause',
  va_appraiser_requirements: 'task-va-mpr',
  usda_eligibility: 'task-usda-eligibility',
  promissory_note: 'task-promissory-note',
  mortgage_or_deed_of_trust: 'task-deed-of-trust',
  assumption_pkg: 'task-assumption-package',
  release_of_liability: 'task-release-liability',
  repair_scope_budget: 'task-repair-scope-budget',
  draw_schedule: 'task-rehab-draw-schedule',
  bridge_approval: 'task-bridge-approval',
  qi_engagement: 'task-1031-qi',
  identify_replacements: 'task-1031-identify',
  complete_exchange: 'task-1031-complete',

  // Property type
  hoa_docs: 'task-hoa-docs',
  condo_questionnaire: 'task-condo-questionnaire',
  board_pkg: 'task-coop-board-pkg',
  board_interview: 'task-coop-board-interview',
  rent_roll: 'task-multifamily-rent-roll',
  tenant_estoppels: 'task-tenant-estoppels',
  builder_contract_review: 'task-builder-contract-review',
  punch_list: 'task-punch-list',
  warranty_docs: 'task-builder-warranties',
  survey_and_perc: 'task-land-survey',
  utility_availability: 'task-utility-zoning',
  lease_audit: 'task-lease-audit',
  phase1_esa: 'task-phase1-esa',

  // Seller circumstance
  probate_approval: 'task-probate-approval',
  court_orders: 'task-divorce-court-orders',
  lender_short_sale_approval: 'task-short-sale-approval',
  bank_addenda: 'task-reo-bank-addenda',
  bid_registration: 'task-auction-bid-reg',
  nonrefundable_deposit: 'task-auction-nr-deposit',
  bk_court_approval: 'task-bk-court-approval',
  hud_va_addenda: 'task-hud-addenda',

  // Legal title
  lien_resolution: 'task-lien-resolution',
  draft_easement: 'task-draft-easement',

  // Condition / environment
  specialty_tests: 'task-specialty-tests',
  elevation_cert: 'task-flood-elevation',
  bind_flood_ins: 'task-bind-flood-insurance',
  historic_review: 'task-historic-preservation',

  // Contract structures
  leaseback_addendum: 'task-leaseback-addendum',
  post_close_insurance: 'task-post-close-insurance',
  option_contract: 'task-option-to-purchase',
  lender_credit_ok: 'task-lender-credit-ok',
  entity_docs: 'task-entity-docs',

  // Regulatory / tax
  variance_application: 'task-zoning-variance',
  design_review: 'task-historic-district-design-review',
  firpta_tax: 'task-firpta-compliance',
  wire_clearance: 'task-intl-wire-clearance',
  litigation_review: 'task-hoa-litigation-review',
  escrow_holdback: 'task-escrow-holdback',

  // Timing
  list_and_sell_current: 'task-home-sale-contingency',
  coord_dual_escrows: 'task-dual-escrow-coordination',
  backup_addendum: 'task-backup-offer',
};

// Convert schema task to our Task
function toTask(schemaTask: any): Task {
  const map = mapPhaseToCategory(schemaTask.phase);
  const mappedId = SCHEMA_ID_TO_TASK_ID[schemaTask.id];
  const t: Task = {
    id: mappedId || makeTaskId(schemaTask.id),
    title: schemaTask.title,
    description: schemaTask.guidance || '',
    category: map.category,
    subcategory: map.subcategory,
    priority: schemaTask.required ? 'high' : 'medium',
    status: 'active',
    assignedTo: 'Buyer',
  } as Task;
  return t;
}

function visibleByScenarios(schemaTask: any, selected: string[]): boolean {
  const cond = schemaTask.visible_if;
  if (!cond) return true;
  if (cond.any_scenarios && Array.isArray(cond.any_scenarios)) {
    return cond.any_scenarios.some((k: string) => selected.includes(k));
  }
  return true;
}

function applyOverrides(tasks: Task[], overrides: any[]) {
  overrides.forEach((ov) => {
    const target =
      findTask(tasks, [ov.task_id]) ||
      tasks.find((t) =>
        t.title.toLowerCase().includes(String(ov.task_id ?? '').replace(/_/g, ' ').toLowerCase())
      );
    if (!target) return;
    const updated = cloneTask(target);
    if (typeof ov.title === 'string') updated.title = ov.title;
    if (typeof ov.required === 'boolean') updated.priority = ov.required ? 'high' : 'low';
    if (typeof ov.phase === 'string') {
      const mapped = mapPhaseToCategory(ov.phase);
      updated.category = mapped.category;
      updated.subcategory = mapped.subcategory;
    }
    upsertTask(tasks, updated);
  });
}

function applyConflicts(tasks: Task[], selected: string[]) {
  const conflicts = scenarioSchema.merge_rules?.conflicts || [];
  conflicts.forEach((rule: any) => {
    if (selected.includes(rule.if)) {
      if (Array.isArray(rule.then_remove)) {
        rule.then_remove.forEach((id: string) => {
          const schemaId = makeTaskId(id);
          const idx = tasks.findIndex((t) => t.id === id || t.id === schemaId);
          if (idx >= 0) tasks.splice(idx, 1);
        });
      }
      if (Array.isArray(rule.then_set)) {
        rule.then_set.forEach((ov: any) => {
          applyOverrides(tasks, [ov]);
        });
      }
    }
  });
}

export function applyScenarios(baseTasks: Task[]): Task[] {
  const selected = getSelectedScenarios();
  const out: Task[] = baseTasks.map(cloneTask);

  // 1) Add base schema tasks (respecting visible_if)
  (scenarioSchema.base_tasks || []).forEach((bt: any) => {
    // Only add base schema tasks if they explicitly depend on selected scenarios
    // Tasks without visible_if are considered part of the app baseline and should not be injected here
    if (!bt?.visible_if) return;
    if (!visibleByScenarios(bt, selected)) return;
    const t = toTask(bt);
    // Avoid duplicate titles across systems: only add if not already present by id or same title
    const exists = out.find((x) => x.id === t.id || x.title === t.title);
    if (!exists) out.push(t);
  });

  // 2) Gather adds/overrides from selected modules (with inheritance)
  const { adds, overrides } = buildScenarioAddsAndOverrides(selected);

  // 3) Apply adds
  adds.forEach((a: any) => {
    const t = toTask(a);
    const exists = out.find((x) => x.id === t.id || x.title === t.title);
    if (!exists) out.push(t);
  });

  // 4) Apply overrides
  applyOverrides(out, overrides);

  // 5) Apply conflicts
  applyConflicts(out, selected);

  return out;
}

