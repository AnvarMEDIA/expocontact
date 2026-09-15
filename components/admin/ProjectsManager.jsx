'use client';

/**
 * Projects — the CRM screen.
 *
 * Three views over the same data: a board by stage, a "today" list of what is
 * due or overdue, and an archive. The board is the default because the one
 * question a stand contractor asks every morning is "what is closest to
 * build-up and not ready".
 *
 * Stages are moved with a picker rather than drag-and-drop: this panel is used
 * on phones on the exhibition floor, where dragging a card between columns is
 * a good way to drop a project into the wrong stage.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  STAGES, BOARD_STAGES, stageLabel, isClosed, CURRENCIES,
  formatMoney, formatDate, daysWord, todayISO, daysBetween, balanceOf, paidShare,
  scheduleFromSetup, MIN_LEAD_DAYS, isDate, PAYMENT_METHODS,
} from '@/lib/crm/model';
import { COUNTRIES, countryLabel } from '@/lib/countries';

/* ── API ─────────────────────────────────────────────────────────────────── */

function token() {
  try { return sessionStorage.getItem('cms_token') || ''; } catch { return ''; }
}

async function crmFetch(method = 'GET', body = null, query = '') {
  const res = await fetch(`/api/admin/crm${query}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
}

/* ── Small pieces ────────────────────────────────────────────────────────── */

const LEVEL_DOT = { ok: 'bg-emerald-400', warn: 'bg-amber-400', risk: 'bg-red-400' };
const LEVEL_RING = { ok: 'border-white/10', warn: 'border-amber-500/40', risk: 'border-red-500/50' };

const inputCls = 'w-full bg-[#0d1220] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:border-[#D4A843]/60 focus:outline-none transition-colors';
const labelCls = 'block text-white/40 text-[11px] uppercase tracking-wider mb-1.5';
const btnCls = 'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors disabled:opacity-40';

function Field({ label, children }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

/** Days to build-up, the number this business runs on. */
function SetupCountdown({ date, level = 'ok', compact = false }) {
  if (!isDate(date)) {
    return <span className="text-white/30 text-xs">дата монтажа не задана</span>;
  }
  const left = daysBetween(todayISO(), date);
  const tone = left < 0 ? 'text-red-300' : level === 'risk' ? 'text-red-300' : level === 'warn' ? 'text-amber-300' : 'text-emerald-300';
  const text = left < 0
    ? `монтаж был ${Math.abs(left)} ${daysWord(left)} назад`
    : left === 0 ? 'монтаж сегодня' : `${left} ${daysWord(left)} до монтажа`;
  return (
    <span className={`${tone} ${compact ? 'text-xs' : 'text-sm'} font-medium`}>
      {text}{!compact && <span className="text-white/30 font-normal"> · {formatDate(date)}</span>}
    </span>
  );
}

function CountryPicker({ value, onChange }) {
  return (
    <select className={inputCls} value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">— не указана —</option>
      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
    </select>
  );
}

function PaymentPicker({ value, onChange }) {
  return (
    <select className={inputCls} value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">— не указана —</option>
      {PAYMENT_METHODS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
    </select>
  );
}

const fmtSize = (b) => (!b ? '' : b < 1024 * 1024 ? `${Math.round(b / 1024)} КБ` : `${(b / 1048576).toFixed(1)} МБ`);

const FILE_KINDS = [
  { key: 'quote',    label: 'КП' },
  { key: 'contract', label: 'Договор' },
  { key: 'drawing',  label: 'Чертёж' },
  { key: 'other',    label: 'Прочее' },
];
const fileKindLabel = (k) => FILE_KINDS.find(x => x.key === k)?.label || 'Файл';

/**
 * Attachments. The upload goes to Blob, which serves objects publicly to
 * anyone holding the URL — the note under the list says so, because a quote
 * carries prices and a client name.
 */
function Files({ project, onAction, busy }) {
  const [kind, setKind] = useState('quote');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const upload = async (file) => {
    if (!file) return;
    setUploading(true); setErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/crm/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
      await onAction({ action: 'file.add', file: { ...data, kind } });
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  const files = project.files || [];

  return (
    <div className="space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-wider">Файлы проекта</p>

      {files.length > 0 ? (
        <div className="space-y-1.5">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-2.5 group bg-[#0d1220] border border-white/5 rounded-lg px-3 py-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 ${
                f.kind === 'quote' ? 'bg-[#D4A843]/15 text-[#D4A843]' : 'bg-white/5 text-white/40'}`}>
                {fileKindLabel(f.kind)}
              </span>
              <a href={f.url} target="_blank" rel="noopener noreferrer"
                className="text-white/85 text-sm truncate hover:text-[#D4A843] transition-colors">{f.name}</a>
              <span className="text-white/25 text-[11px] flex-shrink-0">{fmtSize(f.size)}</span>
              <button onClick={() => onAction({ action: 'file.delete', fileId: f.id })} disabled={busy}
                className="ml-auto opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 text-xs transition-all flex-shrink-0">✕</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/25 text-sm">Файлов пока нет.</p>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        <div className="w-36">
          <select className={inputCls} value={kind} onChange={e => setKind(e.target.value)}>
            {FILE_KINDS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </div>
        <label className={`${btnCls} border-white/10 text-white/60 hover:text-white cursor-pointer ${uploading ? 'opacity-40' : ''}`}>
          {uploading ? 'Загружаем…' : 'Прикрепить файл'}
          <input type="file" className="hidden" disabled={uploading || busy}
            onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      </div>
      {err && <p className="text-red-300 text-xs">{err}</p>}
      <p className="text-white/25 text-[11px] leading-relaxed">
        До 20 МБ: pdf, doc, docx, xls, xlsx, ppt, pptx, png, jpg, zip, rar, dwg.
        Ссылка на файл не угадывается, но открыть её сможет любой, у кого она есть — не пересылайте её посторонним.
      </p>
    </div>
  );
}

function StagePicker({ value, onChange, disabled }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className={`${inputCls} cursor-pointer`}>
      {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
    </select>
  );
}

/* ── Board card ──────────────────────────────────────────────────────────── */

function BoardCard({ p, onOpen }) {
  const level = p.health?.level || 'ok';
  return (
    <button onClick={() => onOpen(p.id)}
      className={`w-full text-left bg-[#141929] border ${LEVEL_RING[level]} rounded-xl p-3 hover:border-[#D4A843]/50 transition-colors space-y-2`}>
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${LEVEL_DOT[level]}`} />
        <span className="text-white/30 text-[10px] font-mono">{p.code}</span>
        {p.openTasks > 0 && (
          <span className="ml-auto text-white/40 text-[10px]">{p.openTasks} задач</span>
        )}
      </div>
      <p className="text-white text-sm font-medium leading-snug line-clamp-2">{p.title}</p>
      {p.client?.company && <p className="text-white/45 text-xs truncate">{p.client.company}</p>}
      <SetupCountdown date={p.dates?.setup} level={level} compact />
      {p.money?.total > 0 && (
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
          <span className="text-white/45">{formatMoney(p.money.total, p.money.currency)}</span>
          <span className={p.money.paid >= p.money.total ? 'text-emerald-400' : 'text-white/35'}>
            {p.money.paid > 0 ? `оплачено ${Math.round((p.money.paid / p.money.total) * 100)}%` : 'без оплат'}
          </span>
        </div>
      )}
    </button>
  );
}

/* ── New project ─────────────────────────────────────────────────────────── */

const EMPTY = {
  title: '', manager: '',
  client: { company: '', contact: '', phone: '', email: '', country: '' },
  expo: { name: '', city: '', venue: '' },
  stand: { area: '', type: '', number: '', hall: '' },
  dates: { setup: '', openFrom: '', openTo: '', teardown: '' },
  money: { total: '', currency: 'UZS', method: '' },
  links: { client: '' },
  brief: '',
};

function NewProject({ onCreate, onCancel, busy }) {
  const [f, setF] = useState(EMPTY);
  const set = (path, value) => setF(prev => {
    const [a, b] = path.split('.');
    return b ? { ...prev, [a]: { ...prev[a], [b]: value } } : { ...prev, [a]: value };
  });

  const plan = scheduleFromSetup(f.dates.setup);
  const startsInTime = isDate(f.dates.setup)
    ? daysBetween(todayISO(), f.dates.setup) >= MIN_LEAD_DAYS : null;

  return (
    <div className="bg-[#141929] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-white font-bold">Новый проект</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Название"><input className={inputCls} value={f.title} onChange={e => set('title', e.target.value)} placeholder="Стенд на UzBuild 2026" /></Field>
        <Field label="Менеджер"><input className={inputCls} value={f.manager} onChange={e => set('manager', e.target.value)} placeholder="Кто ведёт" /></Field>
        <Field label="Клиент — компания"><input className={inputCls} value={f.client.company} onChange={e => set('client.company', e.target.value)} /></Field>
        <Field label="Контактное лицо"><input className={inputCls} value={f.client.contact} onChange={e => set('client.contact', e.target.value)} /></Field>
        <Field label="Телефон"><input className={inputCls} value={f.client.phone} onChange={e => set('client.phone', e.target.value)} /></Field>
        <Field label="Страна клиента"><CountryPicker value={f.client.country} onChange={v => set('client.country', v)} /></Field>
        <Field label="Выставка"><input className={inputCls} value={f.expo.name} onChange={e => set('expo.name', e.target.value)} placeholder="UzBuild 2026" /></Field>
        <Field label="Город"><input className={inputCls} value={f.expo.city} onChange={e => set('expo.city', e.target.value)} /></Field>
        <Field label="Площадка"><input className={inputCls} value={f.expo.venue} onChange={e => set('expo.venue', e.target.value)} /></Field>
        <Field label="Площадь, м²"><input type="number" min="0" className={inputCls} value={f.stand.area} onChange={e => set('stand.area', e.target.value)} /></Field>
        <Field label="Тип стенда"><input className={inputCls} value={f.stand.type} onChange={e => set('stand.type', e.target.value)} placeholder="угловой" /></Field>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <Field label="Монтаж"><input type="date" className={inputCls} value={f.dates.setup} onChange={e => set('dates.setup', e.target.value)} /></Field>
        <Field label="Открытие"><input type="date" className={inputCls} value={f.dates.openFrom} onChange={e => set('dates.openFrom', e.target.value)} /></Field>
        <Field label="Закрытие"><input type="date" className={inputCls} value={f.dates.openTo} onChange={e => set('dates.openTo', e.target.value)} /></Field>
        <Field label="Демонтаж"><input type="date" className={inputCls} value={f.dates.teardown} onChange={e => set('dates.teardown', e.target.value)} /></Field>
      </div>

      {isDate(f.dates.setup) && (
        <div className={`rounded-lg p-3 text-xs leading-relaxed border ${startsInTime ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-200/80' : 'bg-red-500/5 border-red-500/30 text-red-200/80'}`}>
          {startsInTime
            ? <>План уложится: бриф до {formatDate(plan.brief)}, концепция до {formatDate(plan.concept)}, смета до {formatDate(plan.approval)}, производство до {formatDate(plan.production)}, отгрузка до {formatDate(plan.delivery)}.</>
            : <>До монтажа меньше {MIN_LEAD_DAYS} дней — полный цикл не помещается. Проект создастся, но сроки придётся сжимать.</>}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Сумма договора"><input type="number" min="0" className={inputCls} value={f.money.total} onChange={e => set('money.total', e.target.value)} /></Field>
        <Field label="Валюта">
          <select className={inputCls} value={f.money.currency} onChange={e => set('money.currency', e.target.value)}>
            {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Форма оплаты"><PaymentPicker value={f.money.method} onChange={v => set('money.method', v)} /></Field>
      </div>

      <Field label="Ссылка на файлы клиента">
        <input className={inputCls} type="url" value={f.links.client} onChange={e => set('links.client', e.target.value)}
          placeholder="https://drive.google.com/… — логотипы, брендбук, фото" />
      </Field>

      <Field label="Бриф"><textarea rows={3} className={inputCls} value={f.brief} onChange={e => set('brief', e.target.value)} /></Field>

      <div className="flex gap-2">
        <button onClick={() => onCreate(f)} disabled={busy || !f.title.trim()}
          className={`${btnCls} bg-[#D4A843] text-[#0A0F1E] border-[#D4A843] hover:bg-[#E8C06E]`}>
          {busy ? 'Создаём…' : 'Создать проект'}
        </button>
        <button onClick={onCancel} className={`${btnCls} border-white/10 text-white/50 hover:text-white`}>Отмена</button>
      </div>
      <p className="text-white/30 text-xs">
        Если задать дату монтажа, чек-лист из 20 задач создастся сам — с дедлайнами, посчитанными назад от заезда.
      </p>
    </div>
  );
}

/* ── Project card ────────────────────────────────────────────────────────── */

function Tasks({ project, onAction, busy }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const today = todayISO();

  const tasks = [...(project.tasks || [])].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.due) return 1;
    if (!b.due) return -1;
    return a.due < b.due ? -1 : 1;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-xs uppercase tracking-wider">
          Задачи · {tasks.filter(t => !t.done).length} открытых из {tasks.length}
        </p>
        {isDate(project.dates?.setup) && (
          <button onClick={() => onAction({ action: 'plan.reset' })} disabled={busy}
            className={`${btnCls} border-white/10 text-white/50 hover:text-white`}>
            Добавить недостающие из плана
          </button>
        )}
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {tasks.map(t => {
          const late = !t.done && isDate(t.due) && daysBetween(today, t.due) < 0;
          return (
            <div key={t.id} className="flex items-start gap-2.5 group py-1">
              <button onClick={() => onAction({ action: 'task.update', taskId: t.id, patch: { done: !t.done } })}
                className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                  t.done ? 'bg-emerald-500/80 border-emerald-500' : 'border-white/20 hover:border-[#D4A843]'}`}>
                {t.done && <svg className="w-2.5 h-2.5 text-[#0A0F1E]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 6l3 3 5-6" /></svg>}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-snug ${t.done ? 'text-white/30 line-through' : 'text-white/85'}`}>{t.title}</p>
                <div className="flex items-center gap-2 text-[11px] mt-0.5">
                  <span className="text-white/25">{stageLabel(t.stage)}</span>
                  {isDate(t.due) && (
                    <span className={late ? 'text-red-300' : 'text-white/35'}>
                      {late ? 'просрочено · ' : 'до '}{formatDate(t.due)}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => onAction({ action: 'task.delete', taskId: t.id })}
                className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 text-xs transition-all flex-shrink-0">✕</button>
            </div>
          );
        })}
        {!tasks.length && <p className="text-white/25 text-sm">Задач пока нет.</p>}
      </div>

      <div className="flex gap-2">
        <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="Новая задача" />
        <div className="w-40 flex-shrink-0"><input type="date" className={inputCls} value={due} onChange={e => setDue(e.target.value)} /></div>
        <button disabled={busy || !title.trim()}
          onClick={() => { onAction({ action: 'task.add', task: { title, due } }); setTitle(''); setDue(''); }}
          className={`${btnCls} border-white/10 text-white/60 hover:text-white whitespace-nowrap`}>Добавить</button>
      </div>
    </div>
  );
}

function Money({ project, onAction, busy }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const cur = project.money?.currency || 'UZS';
  const share = paidShare(project);

  return (
    <div className="space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-wider">Деньги</p>

      {/* Editable here as well as on the Данные tab: this is the screen someone
          opens when they are dealing with an invoice. */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white/45 text-xs">Форма оплаты:</span>
        <div className="w-56">
          <PaymentPicker value={project.money?.method}
            onChange={v => onAction({ action: 'update', project: { money: { ...project.money, method: v } } })} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ['Договор', formatMoney(project.money?.total || 0, cur), 'text-white'],
          ['Оплачено', formatMoney((project.payments || []).reduce((n, p) => n + p.amount, 0), cur), 'text-emerald-300'],
          ['Остаток', formatMoney(balanceOf(project), cur), balanceOf(project) > 0 ? 'text-amber-300' : 'text-white/40'],
        ].map(([label, value, tone]) => (
          <div key={label} className="bg-[#0d1220] rounded-lg py-2.5 px-2 border border-white/5">
            <p className="text-white/35 text-[10px] uppercase tracking-wider">{label}</p>
            <p className={`${tone} text-sm font-bold mt-0.5 break-words`}>{value}</p>
          </div>
        ))}
      </div>

      {project.money?.total > 0 && (
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500/70 rounded-full transition-all" style={{ width: `${Math.round(share * 100)}%` }} />
        </div>
      )}

      {(project.payments || []).length > 0 && (
        <div className="space-y-1">
          {project.payments.map(p => (
            <div key={p.id} className="flex items-center gap-2 text-xs group">
              <span className="text-white/30 w-20 flex-shrink-0">{formatDate(p.date)}</span>
              <span className="text-emerald-300 font-medium">{formatMoney(p.amount, cur)}</span>
              <span className="text-white/35 truncate">{p.note}</span>
              <button onClick={() => onAction({ action: 'payment.delete', paymentId: p.id })}
                className="ml-auto opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 transition-all">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="w-32 flex-shrink-0"><input type="number" min="0" className={inputCls} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Сумма" /></div>
        <div className="w-40 flex-shrink-0"><input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} /></div>
        <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="Комментарий" />
        <button disabled={busy || !(Number(amount) > 0)}
          onClick={() => { onAction({ action: 'payment.add', payment: { amount: Number(amount), date, note } }); setAmount(''); setNote(''); }}
          className={`${btnCls} border-white/10 text-white/60 hover:text-white whitespace-nowrap`}>Платёж</button>
      </div>
    </div>
  );
}

function ProjectCard({ id, onClose, onChanged, toast }) {
  const [p, setP] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('plan');
  const [draft, setDraft] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    crmFetch('GET', null, `?id=${encodeURIComponent(id)}`)
      .then(d => { setP(d); setDraft(d); })
      .catch(e => setErr(e.message));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const act = async (payload) => {
    setBusy(true); setErr('');
    try {
      const updated = await crmFetch('PATCH', { id, ...payload });
      setP(updated); setDraft(updated);
      onChanged?.();
    } catch (e) { setErr(e.message); toast?.(e.message, 'error'); }
    finally { setBusy(false); }
  };

  const saveFields = () => act({ action: 'update', project: draft });

  if (err && !p) return (
    <div className="bg-[#141929] border border-red-500/30 rounded-xl p-5">
      <p className="text-red-300 text-sm">{err}</p>
      <button onClick={onClose} className={`${btnCls} border-white/10 text-white/60 mt-3`}>Закрыть</button>
    </div>
  );
  if (!p) return <div className="bg-[#141929] border border-white/10 rounded-xl p-5 text-white/30 text-sm">Загружаем проект…</div>;

  const set = (path, value) => setDraft(prev => {
    const [a, b] = path.split('.');
    return b ? { ...prev, [a]: { ...prev[a], [b]: value } } : { ...prev, [a]: value };
  });

  return (
    <div className="bg-[#141929] border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/5 flex items-start gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-[11px] font-mono">{p.code}</span>
            {p.leadId && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">из заявки</span>}
          </div>
          <h3 className="text-white font-bold text-lg mt-0.5 break-words">{p.title}</h3>
          <div className="flex items-center gap-2 flex-wrap text-xs text-white/40 mt-0.5">
            {p.client?.company && <span>{p.client.company}</span>}
            {p.client?.country && <span>{countryLabel(p.client.country)}</span>}
            {p.links?.client && (
              <a href={p.links.client} target="_blank" rel="noopener noreferrer"
                className="text-[#D4A843]/80 hover:text-[#D4A843] transition-colors">файлы клиента ↗</a>
            )}
          </div>
          <div className="mt-1"><SetupCountdown date={p.dates?.setup} /></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-44"><StagePicker value={p.stage} onChange={s => act({ action: 'stage', stage: s })} disabled={busy} /></div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-lg leading-none px-2">✕</button>
        </div>
      </div>

      {err && <p className="px-5 py-2 text-red-300 text-xs bg-red-500/5">{err}</p>}

      <div className="flex gap-1 px-4 sm:px-5 pt-3 flex-wrap">
        {[['plan', 'План и задачи'], ['info', 'Данные'], ['money', 'Деньги'], ['files', `Файлы${(p.files || []).length ? ` (${p.files.length})` : ''}`], ['history', 'История']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === k ? 'bg-[#D4A843]/15 text-[#D4A843]' : 'text-white/45 hover:text-white hover:bg-white/5'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        {tab === 'plan' && <Tasks project={p} onAction={act} busy={busy} />}

        {tab === 'info' && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Название"><input className={inputCls} value={draft.title || ''} onChange={e => set('title', e.target.value)} /></Field>
              <Field label="Менеджер"><input className={inputCls} value={draft.manager || ''} onChange={e => set('manager', e.target.value)} /></Field>
              <Field label="Клиент"><input className={inputCls} value={draft.client?.company || ''} onChange={e => set('client.company', e.target.value)} /></Field>
              <Field label="Контакт"><input className={inputCls} value={draft.client?.contact || ''} onChange={e => set('client.contact', e.target.value)} /></Field>
              <Field label="Телефон"><input className={inputCls} value={draft.client?.phone || ''} onChange={e => set('client.phone', e.target.value)} /></Field>
              <Field label="Email"><input className={inputCls} value={draft.client?.email || ''} onChange={e => set('client.email', e.target.value)} /></Field>
              <Field label="Страна клиента"><CountryPicker value={draft.client?.country} onChange={v => set('client.country', v)} /></Field>
              <Field label="Выставка"><input className={inputCls} value={draft.expo?.name || ''} onChange={e => set('expo.name', e.target.value)} /></Field>
              <Field label="Город"><input className={inputCls} value={draft.expo?.city || ''} onChange={e => set('expo.city', e.target.value)} /></Field>
              <Field label="Площадка"><input className={inputCls} value={draft.expo?.venue || ''} onChange={e => set('expo.venue', e.target.value)} /></Field>
              <Field label="Стенд №"><input className={inputCls} value={draft.stand?.number || ''} onChange={e => set('stand.number', e.target.value)} /></Field>
              <Field label="Павильон"><input className={inputCls} value={draft.stand?.hall || ''} onChange={e => set('stand.hall', e.target.value)} /></Field>
              <Field label="Площадь, м²"><input type="number" min="0" className={inputCls} value={draft.stand?.area ?? ''} onChange={e => set('stand.area', e.target.value)} /></Field>
              <Field label="Тип стенда"><input className={inputCls} value={draft.stand?.type || ''} onChange={e => set('stand.type', e.target.value)} /></Field>
            </div>

            <div className="grid sm:grid-cols-4 gap-3">
              <Field label="Монтаж"><input type="date" className={inputCls} value={draft.dates?.setup || ''} onChange={e => set('dates.setup', e.target.value)} /></Field>
              <Field label="Открытие"><input type="date" className={inputCls} value={draft.dates?.openFrom || ''} onChange={e => set('dates.openFrom', e.target.value)} /></Field>
              <Field label="Закрытие"><input type="date" className={inputCls} value={draft.dates?.openTo || ''} onChange={e => set('dates.openTo', e.target.value)} /></Field>
              <Field label="Демонтаж"><input type="date" className={inputCls} value={draft.dates?.teardown || ''} onChange={e => set('dates.teardown', e.target.value)} /></Field>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Сумма договора"><input type="number" min="0" className={inputCls} value={draft.money?.total ?? ''} onChange={e => set('money.total', e.target.value)} /></Field>
              <Field label="Валюта">
                <select className={inputCls} value={draft.money?.currency || 'UZS'} onChange={e => set('money.currency', e.target.value)}>
                  {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Форма оплаты"><PaymentPicker value={draft.money?.method} onChange={v => set('money.method', v)} /></Field>
            </div>

            <Field label="Ссылка на файлы клиента">
              <input className={inputCls} value={draft.links?.client || ''} type="url"
                onChange={e => set('links.client', e.target.value)}
                placeholder="https://drive.google.com/… — логотипы, брендбук, фото" />
            </Field>

            <Field label="Бриф"><textarea rows={4} className={inputCls} value={draft.brief || ''} onChange={e => set('brief', e.target.value)} /></Field>

            <button onClick={saveFields} disabled={busy}
              className={`${btnCls} bg-[#D4A843] text-[#0A0F1E] border-[#D4A843] hover:bg-[#E8C06E]`}>
              {busy ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        )}

        {tab === 'money' && <Money project={p} onAction={act} busy={busy} />}

        {tab === 'files' && <Files project={p} onAction={act} busy={busy} />}

        {tab === 'history' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-white/40 text-xs uppercase tracking-wider">Заметки</p>
              {(p.notes || []).map((n, i) => (
                <div key={i} className="bg-[#0d1220] rounded-lg p-2.5 border border-white/5">
                  <p className="text-white/70 text-sm whitespace-pre-wrap">{n.text}</p>
                  <p className="text-white/25 text-[10px] mt-1">{new Date(n.ts).toLocaleString('ru-RU')}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="Добавить заметку" />
                <button disabled={busy || !note.trim()} onClick={() => { act({ action: 'note', text: note }); setNote(''); }}
                  className={`${btnCls} border-white/10 text-white/60 hover:text-white`}>Добавить</button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 text-xs uppercase tracking-wider">Хронология</p>
              {[...(p.history || [])].reverse().map((h, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-white/25 w-32 flex-shrink-0">{new Date(h.ts).toLocaleString('ru-RU')}</span>
                  <span className="text-white/55">
                    {h.type === 'stage' ? `Этап: ${stageLabel(h.from)} → ${stageLabel(h.to)}` : h.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 py-3 border-t border-white/5 flex items-center gap-2">
        <button onClick={async () => {
          if (!confirm('Удалить проект? Действие необратимо.')) return;
          try {
            await crmFetch('DELETE', null, `?id=${encodeURIComponent(id)}`);
            toast?.('Проект удалён'); onChanged?.(); onClose();
          } catch (e) { toast?.(e.message, 'error'); }
        }} className={`${btnCls} border-red-500/20 text-red-400/70 hover:text-red-300`}>Удалить</button>
        <span className="text-white/25 text-xs">Изменено {new Date(p.updatedAt).toLocaleString('ru-RU')}</span>
      </div>
    </div>
  );
}

/* ── Screen ──────────────────────────────────────────────────────────────── */

export default function ProjectsManager({ toast }) {
  const [projects, setProjects] = useState([]);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([crmFetch('GET'), crmFetch('GET', null, '?view=dashboard')])
      .then(([list, d]) => { setProjects(list); setDash(d); setErr(''); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = useMemo(() => projects.filter(p => !isClosed(p.stage)), [projects]);
  const archived = useMemo(() => projects.filter(p => isClosed(p.stage)), [projects]);

  const create = async (form) => {
    setBusy(true);
    try {
      const p = await crmFetch('POST', { project: { ...form, stand: { ...form.stand, area: Number(form.stand.area) || 0 }, money: { ...form.money, total: Number(form.money.total) || 0 } } });
      toast?.(`Проект ${p.code} создан`);
      setCreating(false); setOpenId(p.id); load();
    } catch (e) { toast?.(e.message, 'error'); }
    finally { setBusy(false); }
  };

  if (loading && !projects.length) {
    return <div className="bg-[#141929] border border-white/10 rounded-xl p-5 text-white/30 text-sm">Загружаем проекты…</div>;
  }

  return (
    <div className="space-y-4">
      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
          {err}
          <button onClick={load} className={`${btnCls} border-red-500/30 text-red-200 ml-3`}>Повторить</button>
        </div>
      )}

      {/* Summary strip */}
      {dash && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['В работе', dash.counts.active, 'text-white'],
            ['Требуют внимания', dash.counts.risk, dash.counts.risk ? 'text-red-300' : 'text-white/40'],
            ['Задач на 3 дня', dash.tasks.length, dash.tasks.length ? 'text-amber-300' : 'text-white/40'],
            ['Всего проектов', dash.counts.total, 'text-white/60'],
          ].map(([label, value, tone]) => (
            <div key={label} className="bg-[#141929] border border-white/10 rounded-xl p-3">
              <p className="text-white/35 text-[10px] uppercase tracking-wider">{label}</p>
              <p className={`${tone} text-2xl font-bold mt-0.5`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Only currencies with money in them: an empty strip is just a bar of
          nothing between the counters and the board. */}
      {dash && Object.values(dash.pipeline).some(v => v.total > 0) && (
        <div className="bg-[#141929] border border-white/10 rounded-xl p-4 flex flex-wrap gap-5">
          {Object.entries(dash.pipeline).filter(([, v]) => v.total > 0).map(([cur, v]) => (
            <div key={cur}>
              <p className="text-white/35 text-[10px] uppercase tracking-wider">Портфель {cur}</p>
              <p className="text-white text-sm font-bold mt-0.5">
                {formatMoney(v.total, cur)}
                <span className="text-emerald-300/80 font-normal"> · оплачено {formatMoney(v.paid, cur)}</span>
                <span className="text-amber-300/80 font-normal"> · ждём {formatMoney(v.due, cur)}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {[['board', `Доска (${active.length})`], ['today', `Сегодня (${dash?.tasks.length || 0})`], ['archive', `Архив (${archived.length})`]].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              view === k ? 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/40' : 'bg-white/5 text-white/50 border-transparent hover:text-white'}`}>
            {label}
          </button>
        ))}
        <button onClick={() => setCreating(v => !v)}
          className={`${btnCls} ml-auto bg-[#D4A843] text-[#0A0F1E] border-[#D4A843] hover:bg-[#E8C06E]`}>
          + Проект
        </button>
      </div>

      {creating && <NewProject onCreate={create} onCancel={() => setCreating(false)} busy={busy} />}

      {openId && (
        <ProjectCard id={openId} onClose={() => setOpenId(null)} onChanged={load} toast={toast} />
      )}

      {view === 'board' && (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {BOARD_STAGES.map(s => {
              const items = active.filter(p => p.stage === s.key);
              return (
                <div key={s.key} className="w-64 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-white/70 text-xs font-medium">{s.label}</span>
                    <span className="text-white/25 text-xs ml-auto">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(p => <BoardCard key={p.id} p={p} onOpen={setOpenId} />)}
                    {!items.length && <div className="border border-dashed border-white/5 rounded-xl h-16" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'today' && dash && (
        <div className="space-y-4">
          {dash.attention.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/40 text-xs uppercase tracking-wider">Требуют внимания</p>
              {dash.attention.map(p => (
                <button key={p.id} onClick={() => setOpenId(p.id)}
                  className={`w-full text-left bg-[#141929] border ${LEVEL_RING[p.health.level]} rounded-xl p-3 hover:border-[#D4A843]/40 transition-colors`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-1.5 h-1.5 rounded-full ${LEVEL_DOT[p.health.level]}`} />
                    <span className="text-white text-sm font-medium">{p.title}</span>
                    <span className="text-white/30 text-xs">{p.client.company}</span>
                    <span className="text-white/25 text-[11px] ml-auto">{stageLabel(p.stage)}</span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {p.health.reasons.map((r, i) => (
                      <li key={i} className={`text-xs ${r.level === 'risk' ? 'text-red-300/90' : 'text-amber-300/80'}`}>— {r.text}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-wider">Задачи на ближайшие дни</p>
            {dash.tasks.map(t => (
              <button key={`${t.projectId}-${t.id}`} onClick={() => setOpenId(t.projectId)}
                className="w-full text-left bg-[#141929] border border-white/10 rounded-xl p-3 hover:border-[#D4A843]/40 transition-colors flex items-center gap-3">
                <span className={`text-xs font-bold w-16 flex-shrink-0 ${t.daysLeft < 0 ? 'text-red-300' : t.daysLeft === 0 ? 'text-amber-300' : 'text-white/45'}`}>
                  {t.daysLeft < 0 ? `−${Math.abs(t.daysLeft)} дн` : t.daysLeft === 0 ? 'сегодня' : `${t.daysLeft} дн`}
                </span>
                <span className="text-white/85 text-sm min-w-0 flex-1 truncate">{t.title}</span>
                <span className="text-white/30 text-xs truncate hidden sm:block">{t.projectTitle}</span>
              </button>
            ))}
            {!dash.tasks.length && <p className="text-white/25 text-sm">На ближайшие три дня задач нет.</p>}
          </div>
        </div>
      )}

      {view === 'archive' && (
        <div className="space-y-2">
          {archived.map(p => (
            <button key={p.id} onClick={() => setOpenId(p.id)}
              className="w-full text-left bg-[#141929] border border-white/10 rounded-xl p-3 hover:border-white/20 transition-colors flex items-center gap-3 flex-wrap">
              <span className="text-white/30 text-[11px] font-mono">{p.code}</span>
              <span className="text-white/80 text-sm">{p.title}</span>
              <span className="text-white/30 text-xs">{p.client.company}</span>
              <span className={`text-[11px] ml-auto px-2 py-0.5 rounded ${p.stage === 'done' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                {stageLabel(p.stage)}
              </span>
            </button>
          ))}
          {!archived.length && <p className="text-white/25 text-sm">Архив пуст.</p>}
        </div>
      )}
    </div>
  );
}
