/**
 * CRM storage: one document per project, plus an index that holds only ids.
 *
 *   crm:index          → { seq, ids: [newest first] }
 *   crm:project:<id>   → the whole project
 *
 * The index deliberately stores no copies of project fields. A denormalised
 * index has to be rewritten on every edit, and the day one of those writes is
 * missed the board shows one thing and the card another. Ids are enough: the
 * list is one read of the index plus one mget, and there is exactly one copy
 * of every fact.
 *
 * Projects hold client names and phone numbers, so like leads they live in
 * Redis and never in Blob, which is public to anyone holding the URL.
 */
import { kvGet, kvSet, kvMGet, kvDel } from '@/lib/kv';
import {
  sanitizeProject, projectSummary, planTasks, projectHealth, todayISO,
  isDate, daysBetween, addDays, roundMoney, STAGE_KEYS, isClosed,
} from './model';

const INDEX_KEY = 'crm:index';
const keyFor = (id) => `crm:project:${id}`;

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => Date.now();

async function readIndex() {
  const idx = await kvGet(INDEX_KEY);
  return {
    seq: Number(idx?.seq) || 0,
    ids: Array.isArray(idx?.ids) ? idx.ids.filter(x => typeof x === 'string') : [],
  };
}

const writeIndex = (idx) => kvSet(INDEX_KEY, idx);

/* ── Reads ───────────────────────────────────────────────────────────────── */

export async function getProject(id) {
  if (!id) return null;
  return (await kvGet(keyFor(id))) || null;
}

/** Full documents, newest first, skipping ids whose document has gone missing. */
export async function allProjects() {
  const { ids } = await readIndex();
  if (!ids.length) return [];
  const docs = await kvMGet(ids.map(keyFor));
  return docs.filter(Boolean);
}

/**
 * The board: a summary plus today's health for every project.
 * `today` is injectable so the value can be tested without moving the clock.
 */
export async function listProjects(today = todayISO()) {
  const docs = await allProjects();
  return docs.map(p => ({ ...projectSummary(p), health: projectHealth(p, today) }));
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

async function saveProject(project) {
  const doc = { ...project, updatedAt: now() };
  await kvSet(keyFor(doc.id), doc);
  return doc;
}

/**
 * Create a project. `withTasks` fills the standard checklist, dated backwards
 * from build-up day — the point of the whole system, so it is on by default.
 */
export async function createProject(input = {}, { lead = null, withTasks = true } = {}) {
  const idx = await readIndex();
  const seq = idx.seq + 1;
  const id = newId();
  const ts = now();

  const clean = sanitizeProject(input, {});
  const project = {
    id,
    code: `EC-${String(seq).padStart(3, '0')}`,
    ...clean,
    title: clean.title || clean.expo?.name || clean.client?.company || `Проект ${seq}`,
    leadId: lead?.id || input.leadId || null,
    tasks: withTasks && isDate(clean.dates?.setup)
      ? planTasks(clean.dates.setup, { teardownDate: clean.dates.teardown })
      : [],
    payments: [],
    notes: [],
    history: [{ ts, type: 'created', text: 'Проект создан' }],
    createdAt: ts,
    updatedAt: ts,
  };

  await kvSet(keyFor(id), project);
  await writeIndex({ seq, ids: [id, ...idx.ids] });
  return project;
}

/** Merge edited fields. Unknown keys are dropped by sanitizeProject. */
export async function updateProject(id, patch = {}) {
  const current = await getProject(id);
  if (!current) return null;

  const merged = sanitizeProject(patch, current);
  const history = [...(current.history || [])];

  if (patch.stage && patch.stage !== current.stage && STAGE_KEYS.includes(patch.stage)) {
    history.push({ ts: now(), type: 'stage', text: `Этап: ${patch.stage}`, from: current.stage, to: patch.stage });
  }
  // Build-up day is what every deadline hangs off, so moving it moves the plan.
  const prevSetup = current.dates?.setup;
  const nextSetup = merged.dates.setup;
  let tasks = current.tasks || [];

  if (nextSetup !== prevSetup && isDate(nextSetup)) {
    history.push({ ts: now(), type: 'dates', text: `Дата монтажа: ${nextSetup}` });

    if (!tasks.length) {
      // A project created from a lead has no dates yet, so it has no plan
      // either. Filling the date in is the moment the plan becomes possible.
      tasks = planTasks(nextSetup, { teardownDate: merged.dates.teardown });
      history.push({ ts: now(), type: 'plan', text: 'План задач создан по дате монтажа' });
    } else if (isDate(prevSetup)) {
      // The show moved. Every open deadline moves with it by the same number
      // of days; finished tasks keep their real dates, and manual edits keep
      // their relative position instead of being overwritten by the template.
      const shift = daysBetween(prevSetup, nextSetup);
      if (shift) {
        tasks = tasks.map(t => (!t.done && isDate(t.due) ? { ...t, due: addDays(t.due, shift) } : t));
        history.push({
          ts: now(), type: 'plan',
          text: `Сроки задач сдвинуты на ${shift > 0 ? '+' : ''}${shift} дн.`,
        });
      }
    }
  }

  return saveProject({ ...current, ...merged, tasks, history });
}

export async function deleteProject(id) {
  const idx = await readIndex();
  if (!idx.ids.includes(id)) return false;
  await kvDel(keyFor(id));
  await writeIndex({ ...idx, ids: idx.ids.filter(x => x !== id) });
  return true;
}

/* ── Tasks ───────────────────────────────────────────────────────────────── */

const taskId = () => `t${Math.random().toString(36).slice(2, 9)}`;

export async function addTask(id, { title, due, stage, assignee } = {}) {
  const p = await getProject(id);
  if (!p || !title?.trim()) return null;
  const task = {
    id: taskId(),
    title: String(title).trim().slice(0, 200),
    due: isDate(due) ? due : null,
    stage: STAGE_KEYS.includes(stage) ? stage : p.stage,
    assignee: String(assignee || '').trim().slice(0, 80),
    done: false,
    doneAt: null,
  };
  return saveProject({ ...p, tasks: [...(p.tasks || []), task] });
}

export async function updateTask(id, taskKey, patch = {}) {
  const p = await getProject(id);
  if (!p) return null;
  const tasks = (p.tasks || []).map(t => {
    if (t.id !== taskKey) return t;
    const next = { ...t };
    if (typeof patch.title === 'string' && patch.title.trim()) next.title = patch.title.trim().slice(0, 200);
    if ('due' in patch) next.due = isDate(patch.due) ? patch.due : null;
    if ('assignee' in patch) next.assignee = String(patch.assignee || '').trim().slice(0, 80);
    if (STAGE_KEYS.includes(patch.stage)) next.stage = patch.stage;
    if ('done' in patch) {
      next.done = !!patch.done;
      next.doneAt = next.done ? now() : null;
    }
    return next;
  });
  return saveProject({ ...p, tasks });
}

export async function deleteTask(id, taskKey) {
  const p = await getProject(id);
  if (!p) return null;
  return saveProject({ ...p, tasks: (p.tasks || []).filter(t => t.id !== taskKey) });
}

/** Refill the standard checklist, keeping whatever is already there. */
export async function resetPlan(id) {
  const p = await getProject(id);
  if (!p || !isDate(p.dates?.setup)) return null;
  const existing = new Set((p.tasks || []).map(t => t.title));
  const added = planTasks(p.dates.setup, { teardownDate: p.dates.teardown })
    .filter(t => !existing.has(t.title))
    .map(t => ({ ...t, id: taskId() }));
  return saveProject({ ...p, tasks: [...(p.tasks || []), ...added] });
}

/* ── Money ───────────────────────────────────────────────────────────────── */

export async function addPayment(id, { amount, date, note } = {}) {
  const p = await getProject(id);
  if (!p) return null;
  const value = roundMoney(amount, p.money?.currency);
  if (!(value > 0)) return null;
  const payment = {
    id: taskId(),
    amount: value,
    date: isDate(date) ? date : todayISO(),
    note: String(note || '').trim().slice(0, 200),
    ts: now(),
  };
  return saveProject({
    ...p,
    payments: [...(p.payments || []), payment],
    history: [...(p.history || []), { ts: now(), type: 'payment', text: `Платёж ${value}` }],
  });
}

export async function deletePayment(id, paymentId) {
  const p = await getProject(id);
  if (!p) return null;
  return saveProject({ ...p, payments: (p.payments || []).filter(x => x.id !== paymentId) });
}

/* ── Notes ───────────────────────────────────────────────────────────────── */

export async function addNote(id, text) {
  const p = await getProject(id);
  if (!p || !text?.trim()) return null;
  return saveProject({
    ...p,
    notes: [...(p.notes || []), { ts: now(), text: String(text).trim().slice(0, 2000) }],
  });
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */

/**
 * What needs a human today: projects at risk, and every open task that is due
 * or overdue across all of them. Computed from the same documents the board
 * reads, so the two can never disagree.
 */
export async function crmDashboard(today = todayISO()) {
  const docs = await allProjects();
  const active = docs.filter(p => !isClosed(p.stage));

  const attention = [];
  const tasks = [];

  for (const p of active) {
    const health = projectHealth(p, today);
    if (health.level !== 'ok') {
      attention.push({ ...projectSummary(p), health });
    }
    for (const t of p.tasks || []) {
      if (t.done || !isDate(t.due)) continue;
      const left = daysBetween(today, t.due);
      if (left <= 3) {
        tasks.push({
          projectId: p.id, projectCode: p.code, projectTitle: p.title,
          client: p.client?.company || '', expo: p.expo?.name || '',
          id: t.id, title: t.title, due: t.due, stage: t.stage, assignee: t.assignee || '',
          daysLeft: left,
        });
      }
    }
  }

  attention.sort((a, b) => {
    const rank = { risk: 0, warn: 1, ok: 2 };
    if (rank[a.health.level] !== rank[b.health.level]) return rank[a.health.level] - rank[b.health.level];
    return (a.health.daysToSetup ?? 9e9) - (b.health.daysToSetup ?? 9e9);
  });
  tasks.sort((a, b) => a.daysLeft - b.daysLeft);

  // Money in flight, per currency: mixing sums and dollars into one number
  // would be a lie, so they are reported side by side.
  const pipeline = {};
  for (const p of active) {
    const cur = p.money?.currency || 'UZS';
    const total = Number(p.money?.total) || 0;
    const paid = (p.payments || []).reduce((n, x) => n + (Number(x.amount) || 0), 0);
    pipeline[cur] = pipeline[cur] || { total: 0, paid: 0, due: 0 };
    pipeline[cur].total = roundMoney(pipeline[cur].total + total, cur);
    pipeline[cur].paid  = roundMoney(pipeline[cur].paid + paid, cur);
    pipeline[cur].due   = roundMoney(Math.max(0, pipeline[cur].total - pipeline[cur].paid), cur);
  }

  const byStage = {};
  for (const p of active) byStage[p.stage] = (byStage[p.stage] || 0) + 1;

  return {
    today,
    counts: { total: docs.length, active: active.length, risk: attention.filter(a => a.health.level === 'risk').length },
    byStage,
    pipeline,
    attention: attention.slice(0, 20),
    tasks: tasks.slice(0, 40),
  };
}

/* ── Backup ──────────────────────────────────────────────────────────────── */

export async function exportProjects() {
  return { index: await readIndex(), projects: await allProjects() };
}

export async function restoreProjects(dump) {
  if (!dump || !Array.isArray(dump.projects)) return false;
  for (const p of dump.projects) {
    if (p?.id) await kvSet(keyFor(p.id), p);
  }
  await writeIndex({
    seq: Number(dump.index?.seq) || dump.projects.length,
    ids: dump.projects.map(p => p.id).filter(Boolean),
  });
  return true;
}
