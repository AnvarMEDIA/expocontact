/**
 * CRM API for the admin panel.
 *
 *   GET    /api/admin/crm?view=board       list of projects with today's health
 *   GET    /api/admin/crm?view=dashboard   what needs attention today
 *   GET    /api/admin/crm?id=...           one project in full
 *   POST   /api/admin/crm                  { project, fromLeadId? } → create
 *   PATCH  /api/admin/crm                  { id, action, ... } → see ACTIONS
 *   DELETE /api/admin/crm?id=...           remove a project
 *
 * Protected by ADMIN_PASSWORD, like every other admin endpoint.
 */
import { NextResponse } from 'next/server';
import {
  listProjects, getProject, createProject, updateProject, deleteProject,
  addTask, updateTask, deleteTask, resetPlan,
  addPayment, deletePayment, addNote, addFile, deleteFile, crmDashboard,
} from '@/lib/crm/store';
import { getLead, patchLead, updateLeadStatus } from '@/lib/leads';
import { qualifierValueLabel } from '@/lib/leadFields';

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

const bad = (message, status = 400) => NextResponse.json({ error: message }, { status });

export async function GET(request) {
  if (!checkAuth(request)) return bad('Unauthorized', 401);
  const { searchParams } = new URL(request.url);

  try {
    const id = searchParams.get('id');
    if (id) {
      const project = await getProject(id);
      return project ? NextResponse.json(project) : bad('Проект не найден', 404);
    }
    if (searchParams.get('view') === 'dashboard') {
      return NextResponse.json(await crmDashboard());
    }
    return NextResponse.json(await listProjects());
  } catch (err) {
    console.error('[crm] GET failed:', err);
    return bad(err.message || 'Не удалось прочитать проекты', 500);
  }
}

/**
 * The area answer on an ad-landing brief is a range ('24_50'), not a number.
 * Take the lower bound as a starting point for the stand area so the project
 * is not created empty — the manager corrects it after the first call.
 */
function areaFromBrief(details) {
  const key = details?.area;
  if (!key || key === 'unknown') return 0;
  const m = /^(?:upto_)?(\d+)/.exec(key);
  return m ? Number(m[1]) : 0;
}

export async function POST(request) {
  if (!checkAuth(request)) return bad('Unauthorized', 401);
  const body = await request.json().catch(() => ({}));

  try {
    // Turning a lead into a project: carry over everything the visitor already
    // told us, so nobody retypes it, and link the two records both ways.
    if (body.fromLeadId) {
      const lead = await getLead(body.fromLeadId);
      if (!lead) return bad('Заявка не найдена', 404);
      if (lead.projectId && await getProject(lead.projectId)) {
        return bad('По этой заявке проект уже создан', 409);
      }

      const briefLines = [
        lead.message,
        lead.details?.standType ? `Тип стенда: ${qualifierValueLabel('standType', lead.details.standType)}` : null,
        lead.details?.area      ? `Площадь: ${qualifierValueLabel('area', lead.details.area)}` : null,
        lead.details?.timing    ? `Сроки: ${qualifierValueLabel('timing', lead.details.timing)}` : null,
      ].filter(Boolean).join('\n');

      const project = await createProject({
        title: lead.expo || lead.company || lead.name,
        client: { company: lead.company, contact: lead.name, phone: lead.phone },
        expo: { name: lead.expo },
        stand: {
          area: areaFromBrief(lead.details),
          type: lead.details?.standType && lead.details.standType !== 'unknown'
            ? qualifierValueLabel('standType', lead.details.standType) : '',
        },
        brief: briefLines,
        ...body.project,
      }, { lead });

      await patchLead(lead.id, { projectId: project.id });
      await updateLeadStatus(lead.id, 'in_progress');
      return NextResponse.json(project);
    }

    const project = await createProject(body.project || body);
    return NextResponse.json(project);
  } catch (err) {
    console.error('[crm] POST failed:', err);
    return bad(err.message || 'Не удалось создать проект', 500);
  }
}

const ACTIONS = {
  update:        (id, b) => updateProject(id, b.project || b.patch || {}),
  stage:         (id, b) => updateProject(id, { stage: b.stage }),
  'task.add':    (id, b) => addTask(id, b.task || {}),
  'task.update': (id, b) => updateTask(id, b.taskId, b.patch || {}),
  'task.delete': (id, b) => deleteTask(id, b.taskId),
  'plan.reset':  (id)    => resetPlan(id),
  'payment.add': (id, b) => addPayment(id, b.payment || {}),
  'payment.delete': (id, b) => deletePayment(id, b.paymentId),
  'file.add':    (id, b) => addFile(id, b.file || {}),
  'file.delete': (id, b) => deleteFile(id, b.fileId),
  note:          (id, b) => addNote(id, b.text),
};

export async function PATCH(request) {
  if (!checkAuth(request)) return bad('Unauthorized', 401);
  const body = await request.json().catch(() => ({}));
  const { id, action = 'update' } = body;

  if (!id) return bad('Не указан проект');
  const handler = ACTIONS[action];
  if (!handler) return bad(`Неизвестное действие: ${action}`);

  try {
    const result = await handler(id, body);
    // A null here means the project, task or payment was not found, or the
    // payload was empty — never a silent success.
    return result ? NextResponse.json(result) : bad('Изменение не применено: проверьте данные', 404);
  } catch (err) {
    console.error('[crm] PATCH failed:', err);
    return bad(err.message || 'Не удалось сохранить', 500);
  }
}

export async function DELETE(request) {
  if (!checkAuth(request)) return bad('Unauthorized', 401);
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Не указан проект');

  try {
    return (await deleteProject(id))
      ? NextResponse.json({ ok: true })
      : bad('Проект не найден', 404);
  } catch (err) {
    console.error('[crm] DELETE failed:', err);
    return bad(err.message || 'Не удалось удалить', 500);
  }
}
