'use client';

/**
 * Статистика — our own visitor numbers.
 *
 * Replaces the Yandex.Metrika screen. Everything here comes from
 * /api/analytics/stats, which reads the counters the site writes itself, so
 * there is no external account to log into and nothing to lose access to.
 *
 * The chart is plain SVG on purpose: a charting library would be more code
 * than the whole page for one bar chart.
 */
import { useState, useEffect, useCallback } from 'react';
import { CHANNEL_LABELS, topList, conversion } from '@/lib/analytics/model';
import { countryLabel } from '@/lib/countries';

function token() {
  try { return sessionStorage.getItem('cms_token') || ''; } catch { return ''; }
}

const RANGES = [[7, '7 дней'], [30, '30 дней'], [90, '90 дней']];

const card = 'bg-[#141929] border border-white/10 rounded-xl p-4';

function Stat({ label, value, hint, tone = 'text-white' }) {
  return (
    <div className={card}>
      <p className="text-white/35 text-[10px] uppercase tracking-wider">{label}</p>
      <p className={`${tone} text-2xl font-bold mt-0.5`}>{value}</p>
      {hint && <p className="text-white/30 text-[11px] mt-0.5">{hint}</p>}
    </div>
  );
}

/** A horizontal breakdown: the shape most of this page is made of. */
function Breakdown({ title, rows, total, empty = 'Пока нет данных', render }) {
  if (!rows.length) {
    return (
      <div className={card}>
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{title}</p>
        <p className="text-white/25 text-sm">{empty}</p>
      </div>
    );
  }
  const max = Math.max(...rows.map(r => r.count), 1);
  return (
    <div className={card}>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-3">{title}</p>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.key}>
            <div className="flex items-baseline gap-2 text-sm">
              <span className="text-white/80 truncate min-w-0 flex-1">{render ? render(r.key) : r.key}</span>
              <span className="text-white/90 font-medium">{r.count}</span>
              {total > 0 && <span className="text-white/25 text-[11px] w-10 text-right">{Math.round((r.count / total) * 100)}%</span>}
            </div>
            <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#D4A843]/60 rounded-full" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Visitors per day, with leads marked on top of the same bar. */
function DailyChart({ days }) {
  const max = Math.max(...days.map(d => d.visitors), 1);
  const short = (iso) => iso.slice(8) + '.' + iso.slice(5, 7);

  return (
    <div className={card}>
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <p className="text-white/40 text-xs uppercase tracking-wider">Посетители по дням</p>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-white/40">
            <span className="w-2 h-2 rounded-sm bg-[#D4A843]/70" />посетители
          </span>
          <span className="flex items-center gap-1.5 text-white/40">
            <span className="w-2 h-2 rounded-sm bg-emerald-400" />заявки
          </span>
        </div>
      </div>

      <div className="flex items-end gap-[2px] h-40">
        {days.map(d => {
          const h = (d.visitors / max) * 100;
          return (
            <div key={d.date} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center group relative">
              {d.leads > 0 && <div className="w-full bg-emerald-400 rounded-t-sm" style={{ height: `${Math.max(3, (d.leads / max) * 100)}%` }} />}
              <div className="w-full bg-[#D4A843]/50 group-hover:bg-[#D4A843]/80 transition-colors rounded-t-sm"
                style={{ height: `${Math.max(d.visitors ? 2 : 0, h)}%` }} />
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#0d1220] border border-white/10 rounded-lg px-2 py-1 text-[11px] whitespace-nowrap z-10">
                <span className="text-white/60">{short(d.date)}: </span>
                <span className="text-white">{d.visitors} чел.</span>
                {d.leads > 0 && <span className="text-emerald-300"> · {d.leads} заявок</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-white/25 text-[10px] mt-1.5">
        <span>{short(days[0]?.date || '')}</span>
        <span>{short(days.at(-1)?.date || '')}</span>
      </div>
    </div>
  );
}

/** When during the day people actually come — useful for staffing the phone. */
function Hours({ hours }) {
  const max = Math.max(...hours, 1);
  return (
    <div className={card}>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Часы посещений · по Ташкенту</p>
      <div className="flex items-end gap-[2px] h-20">
        {hours.map((v, h) => (
          <div key={h} className="flex-1 h-full flex flex-col justify-end items-center group relative">
            <div className="w-full bg-[#2A6BC4]/50 group-hover:bg-[#2A6BC4] transition-colors rounded-t-sm"
              style={{ height: `${Math.max(v ? 3 : 0, (v / max) * 100)}%` }} />
            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#0d1220] border border-white/10 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10">
              {String(h).padStart(2, '0')}:00 — {v}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-white/25 text-[10px] mt-1">
        <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/analytics/stats?days=${days}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `Ошибка ${r.status}`);
        setData(d); setError('');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);
  // Keep "online now" fresh without making the whole page blink.
  useEffect(() => {
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
        {error}
        <button onClick={load} className="ml-3 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-500/30">
          Повторить
        </button>
      </div>
    );
  }
  if (!data) return <div className={`${card} text-white/30 text-sm`}>Загружаем статистику…</div>;

  const t = data.totals;
  const hasData = t.views > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {RANGES.map(([n, label]) => (
          <button key={n} onClick={() => setDays(n)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              days === n ? 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/40' : 'bg-white/5 text-white/50 border-transparent hover:text-white'}`}>
            {label}
          </button>
        ))}
        {loading && <span className="text-white/30 text-xs">обновляем…</span>}
        <span className="ml-auto flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${data.online > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
          <span className="text-white/60">Сейчас на сайте: <b className="text-white">{data.online}</b></span>
        </span>
      </div>

      {!hasData && (
        <div className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-4">
          <p className="text-white/80 text-sm font-medium">Данных пока нет</p>
          <p className="text-white/45 text-xs mt-1 leading-relaxed">
            Счётчик собственный и начал считать с момента установки — прошлые визиты
            в него не попадут. Откройте сайт в другом браузере, и первые цифры появятся здесь в течение минуты.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Посетители" value={t.visitors} hint={`${days} дней`} />
        <Stat label="Просмотры" value={t.views}
          hint={t.visitors ? `${(t.views / t.visitors).toFixed(1)} на человека` : null} />
        <Stat label="Заявки" value={t.leads} tone="text-emerald-300" />
        <Stat label="Конверсия" value={`${conversion(t.leads, t.visitors)}%`}
          tone={conversion(t.leads, t.visitors) >= 1 ? 'text-emerald-300' : 'text-white'}
          hint="заявок на 100 посетителей" />
      </div>

      <DailyChart days={data.days} />

      <div className="grid lg:grid-cols-2 gap-3">
        <Breakdown title="Каналы" rows={topList(t.channels, 8)} total={t.views}
          render={k => CHANNEL_LABELS[k] || k} />
        <Breakdown title="Источники" rows={topList(t.sources, 8)} total={t.views} />
        <Breakdown title="Страницы" rows={topList(t.pages, 10)} total={t.views} />
        <Breakdown title="Кампании" rows={topList(t.campaigns, 8)} total={t.views}
          empty="Переходов с utm-метками пока не было" />
      </div>

      <Hours hours={t.hours} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Breakdown title="Устройства" rows={topList(t.devices, 5)} total={t.views}
          render={k => ({ mobile: 'Телефон', desktop: 'Компьютер', tablet: 'Планшет' }[k] || k)} />
        <Breakdown title="Страны" rows={topList(t.countries, 6)} total={t.views}
          render={k => countryLabel(k) || k} />
        <Breakdown title="Браузеры" rows={topList(t.browsers, 6)} total={t.views} />
        <Breakdown title="Язык сайта" rows={topList(t.locales, 3)} total={t.views}
          render={k => ({ ru: 'Русский', en: 'English', uz: 'O‘zbekcha' }[k] || k)} />
      </div>

      <p className="text-white/25 text-[11px] leading-relaxed">
        Считает сам сайт: ни Метрики, ни внешних счётчиков. Посетители различаются по
        временному отпечатку, который меняется каждую ночь, — ни IP-адрес, ни браузер
        посетителя нигде не сохраняются, и связать визиты за разные дни невозможно.
        Боты и поисковые роботы не учитываются.
      </p>
    </div>
  );
}
