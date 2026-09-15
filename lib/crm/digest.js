/**
 * The daily "what is burning" message.
 *
 * Pure text building, separated from delivery so the wording can be tested
 * without sending anything to a real chat.
 *
 * Silence is a feature: when nothing is overdue, due today or at risk, the
 * digest returns null and no message goes out. A bot that writes "всё
 * спокойно" every morning is a bot everyone learns to swipe away, and then
 * the one morning it matters the message is swiped away too.
 */
import { formatDate, daysWord, stageLabel, plural } from './model.js';

/** Telegram rejects anything over 4096 characters, so leave room for the tail. */
const MAX_LEN = 3800;

function taskLine(t) {
  const when = t.daysLeft < 0
    ? `просрочено ${Math.abs(t.daysLeft)} ${daysWord(t.daysLeft)}`
    : t.daysLeft === 0 ? 'сегодня' : `через ${t.daysLeft} ${daysWord(t.daysLeft)}`;
  const where = [t.projectCode, t.expo || t.projectTitle, t.client].filter(Boolean).join(' · ');
  return `• ${t.title} — ${when}\n   ${where}`;
}

/**
 * Build the message from a crmDashboard() result.
 * Returns { text, counts } or null when there is nothing worth a notification.
 */
export function buildDigest(dash) {
  if (!dash) return null;

  const tasks = dash.tasks || [];
  const overdue = tasks.filter(t => t.daysLeft < 0);
  const today   = tasks.filter(t => t.daysLeft === 0);
  const soon    = tasks.filter(t => t.daysLeft > 0);
  const risks   = (dash.attention || []).filter(p => p.health?.level === 'risk');

  if (!overdue.length && !today.length && !risks.length) return null;

  const parts = [`🔥 ExpoContact — что горит на ${formatDate(dash.today)}`];

  const section = (icon, title, items, render) => {
    if (!items.length) return;
    parts.push('');
    parts.push(`${icon} ${title} (${items.length}):`);
    for (const item of items) parts.push(render(item));
  };

  section('❗', 'Просрочено', overdue, taskLine);
  section('📅', 'Сегодня', today, taskLine);

  // Only projects at real risk: warnings would double the length of a message
  // that has to be read on a phone between two site visits.
  section('🚨', 'Проекты под риском', risks, (p) => {
    const head = `• ${p.code} ${p.title}${p.client?.company ? ` — ${p.client.company}` : ''}`;
    const why = p.health.reasons
      .filter(r => r.level === 'risk')
      .map(r => `   — ${r.text}`)
      .join('\n');
    return `${head}\n   Этап: ${stageLabel(p.stage)}\n${why}`;
  });

  // Upcoming work is a footnote, not a section: it is not burning yet.
  if (soon.length) {
    parts.push('');
    parts.push(`⏳ В ближайшие дни ещё ${soon.length} ${plural(soon.length, 'задача', 'задачи', 'задач')}.`);
  }

  let text = parts.join('\n');
  if (text.length > MAX_LEN) {
    text = `${text.slice(0, MAX_LEN)}\n\n…список обрезан, откройте раздел Проекты.`;
  }

  return {
    text,
    counts: { overdue: overdue.length, today: today.length, soon: soon.length, risks: risks.length },
  };
}
