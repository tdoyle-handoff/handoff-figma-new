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

// Convert schema task to our Task
function toTask(schemaTask: any): Task {
  const map = mapPhaseToCategory(schemaTask.phase);
  const t: Task = {
    id: makeTaskId(schemaTask.id),
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

