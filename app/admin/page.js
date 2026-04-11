'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ── API helper ────────────────────────────────────────────────────────────────
const API = '/api/admin';

function getToken() {
  try { return sessionStorage.getItem('cms_token') || ''; } catch { return ''; }
}

async function apiFetch(collection, options = {}, locale = null) {
  const token = getToken();
  const url   = locale
    ? `${API}?collection=${collection}&locale=${locale}`
    : `${API}?collection=${collection}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...options,
  });
  if (res.status === 401) throw new Error('unauthorized');
  return res.json();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, toast };
}

function ToastBar({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(({ id, msg, type }) => (
        <div key={id} className={`px-5 py-3 rounded-xl text-sm font-bold shadow-2xl ${
          type === 'error' ? 'bg-red-500 text-white' : 'bg-[#D4A843] text-[#0A0F1E]'
        }`}>{msg}</div>
      ))}
    </div>
  );
}

// ── Icons (inline SVG) ────────────────────────────────────────────────────────
const IC = {
  dashboard:    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/></svg>,
  portfolio:    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  testimonials: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
  clients:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  faq:          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  services:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth="2"/></svg>,
  settings:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  logout:       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  menu:         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  plus:         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  edit:         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  trash:        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  check:        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>,
  x:            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
  external:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>,
};

// ── Nav config ────────────────────────────────────────────────────────────────
const IC_ANALYTICS = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;

const NAV = [
  { key: 'dashboard',    label: 'Дашборд',    icon: IC.dashboard    },
  { key: 'analytics',    label: 'Аналитика',  icon: IC_ANALYTICS    },
  { key: 'portfolio',    label: 'Портфолио',  icon: IC.portfolio    },
  { key: 'testimonials', label: 'Отзывы',     icon: IC.testimonials },
  { key: 'clients',      label: 'Клиенты',    icon: IC.clients      },
  { key: 'faq',          label: 'FAQ',         icon: IC.faq          },
  { key: 'services',     label: 'Услуги',     icon: IC.services     },
  { key: 'settings',     label: 'Инструкция', icon: IC.settings     },
];

const SECTION_TITLES = {
  dashboard: 'Дашборд', analytics: 'Аналитика посетителей',
  portfolio: 'Портфолио', testimonials: 'Отзывы клиентов',
  clients: 'Клиенты', faq: 'FAQ — Частые вопросы', services: 'Тексты услуг',
  settings: 'Инструкция и настройки',
};

// ── Schemas ───────────────────────────────────────────────────────────────────
const SCHEMAS = {
  portfolio: [
    { key: 'title',       label: 'Название',     type: 'text',     required: true  },
    { key: 'client',      label: 'Клиент',       type: 'text',     required: true  },
    { key: 'exhibition',  label: 'Выставка',     type: 'text',     required: true  },
    { key: 'area',        label: 'Площадь (м²)', type: 'number',   required: true  },
    { key: 'year',        label: 'Год',          type: 'number',   required: true  },
    { key: 'category',    label: 'Категория',    type: 'select',   required: true,
      options: ['large', 'modular', 'conference', 'international'] },
    { key: 'description', label: 'Описание',     type: 'textarea', required: false },
    { key: 'mainImage',   label: 'Фото (URL)',   type: 'image',    required: false, maxW: 1200, maxH: 900  },
  ],
  testimonials: [
    { key: 'name',     label: 'Имя',          type: 'text',     required: true  },
    { key: 'position', label: 'Должность',    type: 'text',     required: true  },
    { key: 'company',  label: 'Компания',     type: 'text',     required: true  },
    { key: 'rating',   label: 'Рейтинг',     type: 'stars',    required: true  },
    { key: 'quote',    label: 'Отзыв',       type: 'textarea', required: true  },
    { key: 'avatar',   label: 'Аватар (URL)', type: 'image',    required: false, maxW: 400,  maxH: 400  },
  ],
  clients: [
    { key: 'name',    label: 'Название',    type: 'text',  required: true  },
    { key: 'logo',    label: 'Лого (URL)',  type: 'image', required: false, maxW: 600,  maxH: 300  },
    { key: 'website', label: 'Сайт (URL)', type: 'text',  required: false },
  ],
};

// ── LoginScreen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]           = useState('');
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    sessionStorage.setItem('cms_token', pw);
    try {
      await apiFetch('portfolio');
      onLogin();
    } catch {
      setErr('Неверный пароль');
      sessionStorage.removeItem('cms_token');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated abstract blobs */}
      <style>{`
        @keyframes b1{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(70px,-50px) scale(1.12)}70%{transform:translate(-30px,60px) scale(0.92)}}
        @keyframes b2{0%,100%{transform:translate(0,0) scale(1)}35%{transform:translate(-60px,70px) scale(1.08)}65%{transform:translate(50px,-40px) scale(1.15)}}
        @keyframes b3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,50px) scale(0.88)}}
        @keyframes b4{0%,100%{transform:translate(0,0) scale(1)}45%{transform:translate(-40px,-60px) scale(1.1)}}
        .abl1{animation:b1 14s ease-in-out infinite}
        .abl2{animation:b2 18s ease-in-out infinite}
        .abl3{animation:b3 22s ease-in-out infinite}
        .abl4{animation:b4 16s ease-in-out infinite}
      `}</style>

      <div className="abl1 absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#D4A843]/[0.07] blur-[130px] pointer-events-none" />
      <div className="abl2 absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#2563EB]/[0.06] blur-[120px] pointer-events-none" />
      <div className="abl3 absolute top-[40%] left-[55%] w-[300px] h-[300px] rounded-full bg-[#D4A843]/[0.05] blur-[90px] pointer-events-none" />
      <div className="abl4 absolute top-[20%] right-[30%] w-[200px] h-[200px] rounded-full bg-[#7C3AED]/[0.05] blur-[80px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[360px]">

        <div className="text-center mb-8">
          <p className="font-black text-2xl tracking-tight text-white">
            EXPO<span className="text-[#D4A843]">CONTACT</span>
          </p>
          <p className="text-white/25 text-xs mt-1.5 tracking-[0.25em] uppercase">Admin Panel</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)]">

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-[11px] text-white/40 mb-2.5 font-bold uppercase tracking-[0.2em]">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={e => { setPw(e.target.value); setErr(''); }}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#D4A843]/50 focus:bg-white/[0.09] transition-all pr-12 text-sm"
                  placeholder="••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors p-0.5"
                >
                  {showPw ? (
                    <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
              {err && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  {err}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !pw}
              className="w-full bg-[#D4A843] text-[#080D1A] font-black py-3.5 rounded-xl hover:bg-[#E8C06E] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Проверка...
                </span>
              ) : 'Войти'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/[0.12] text-[10px] mt-6 tracking-[0.3em] uppercase">
          Защищённый доступ
        </p>
      </div>
    </div>
  );
}

// ── Client-side image resize (Canvas API) ─────────────────────────────────────
function resizeImage(file, maxW, maxH, quality = 0.88) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w > maxW || h > maxH) {
          const r = Math.min(maxW / w, maxH / h);
          w = Math.round(w * r);
          h = Math.round(h * r);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── ImageField — file upload + URL ────────────────────────────────────────────
function ImageField({ value, onChange, label, maxW = 1200, maxH = 900 }) {
  const [tab, setTab]         = useState('file');
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag]       = useState(false);
  const [progress, setProgress] = useState('');
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress('Сжимаем...');
    try {
      const blob = await resizeImage(file, maxW, maxH);
      setProgress('Загружаем...');
      const fd = new FormData();
      fd.append('file', blob, file.name.replace(/\.[^.]+$/, '.jpg'));
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) { onChange(data.url); setProgress(''); }
      else setProgress(data.error || 'Ошибка загрузки');
    } catch { setProgress('Ошибка загрузки'); }
    finally { setUploading(false); }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) upload(f);
  };

  const hint = `max ${maxW}×${maxH}px · JPG/PNG/WebP · до 10 МБ`;

  return (
    <div>
      {/* Label + tabs */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <label className="text-xs text-white/50 font-semibold uppercase tracking-wider">{label}</label>
        <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs font-semibold">
          {[['file','С диска'],['url','По ссылке']].map(([k,l]) => (
            <button key={k} type="button" onClick={() => setTab(k)}
              className={`px-3 py-1.5 transition-colors ${tab === k ? 'bg-[#D4A843] text-[#0A0F1E]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {tab === 'file' ? (
        <>
          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none ${
              drag ? 'border-[#D4A843] bg-[#D4A843]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />

            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-[#D4A843] text-sm font-semibold">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {progress}
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 mx-auto mb-2 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p className="text-white/50 text-sm">Перетащите или <span className="text-[#D4A843]">нажмите для выбора</span></p>
                <p className="text-white/20 text-xs mt-1">{hint}</p>
              </>
            )}
          </div>
          {progress && !uploading && <p className="text-red-400 text-xs mt-1.5">{progress}</p>}
        </>
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D4A843] transition-colors" />
      )}

      {/* Preview */}
      {value && (
        <div className="mt-3 flex items-start gap-3">
          <div className="w-24 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-white/30 text-xs truncate">{value}</p>
            <button type="button" onClick={() => onChange('')}
              className="text-red-400/60 hover:text-red-400 text-xs mt-1 transition-colors">
              Удалить фото
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── StarInput ─────────────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110">
          <span className={(hover || value) >= n ? 'text-[#D4A843]' : 'text-white/20'}>★</span>
        </button>
      ))}
      <span className="text-white/40 text-sm ml-2">{value}/5</span>
    </div>
  );
}

// ── ItemForm ──────────────────────────────────────────────────────────────────
function ItemForm({ schema, initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState(() => {
    const d = {};
    schema.forEach(({ key, type }) => {
      d[key] = initial[key] ?? (type === 'stars' ? 5 : type === 'number' ? '' : '');
    });
    return d;
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-[#0d1220] border border-white/10 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schema.map(({ key, label, type, options, required, maxW, maxH }) => {
          const wide = type === 'textarea' || type === 'image';
          return (
            <div key={key} className={wide ? 'md:col-span-2' : ''}>
              {type === 'image' ? (
                <ImageField value={form[key]} onChange={v => set(key, v)} label={label + (required ? ' *' : '')} maxW={maxW} maxH={maxH} />
              ) : type === 'stars' ? (
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">{label}{required && <span className="text-[#D4A843]"> *</span>}</label>
                  <StarInput value={Number(form[key])} onChange={v => set(key, v)} />
                </div>
              ) : type === 'textarea' ? (
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-semibold uppercase tracking-wider">{label}{required && <span className="text-[#D4A843]"> *</span>}</label>
                  <textarea value={form[key]} onChange={e => set(key, e.target.value)} rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors resize-none" />
                </div>
              ) : type === 'select' ? (
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-semibold uppercase tracking-wider">{label}{required && <span className="text-[#D4A843]"> *</span>}</label>
                  <select value={form[key]} onChange={e => set(key, e.target.value)}
                    className="w-full bg-[#141929] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors">
                    <option value="">— выберите —</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-semibold uppercase tracking-wider">{label}{required && <span className="text-[#D4A843]"> *</span>}</label>
                  <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={() => onSave(form)} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0F1E] font-bold rounded-xl hover:bg-[#E8C06E] transition-colors text-sm">{IC.check} Сохранить</button>
        <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors text-sm">{IC.x} Отмена</button>
      </div>
    </div>
  );
}

// ── CollectionManager ─────────────────────────────────────────────────────────
function CollectionManager({ collection, toast }) {
  const schema = SCHEMAS[collection];
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await apiFetch(collection)) || []); }
    finally { setLoading(false); }
  }, [collection]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    await apiFetch(collection, { method: 'POST', body: JSON.stringify({ action: 'create', item: form }) });
    setCreating(false); toast('Запись создана'); load();
  };
  const handleUpdate = async (id, form) => {
    await apiFetch(collection, { method: 'POST', body: JSON.stringify({ action: 'update', id, item: form }) });
    setEditingId(null); toast('Изменения сохранены'); load();
  };
  const handleDelete = async (id) => {
    if (!confirm('Удалить запись?')) return;
    await apiFetch(collection, { method: 'POST', body: JSON.stringify({ action: 'delete', id }) });
    toast('Удалено'); load();
  };

  const cols = schema.slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{loading ? '...' : `${items.length} записей`}</p>
        {!creating && (
          <button onClick={() => { setCreating(true); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-[#0A0F1E] font-bold rounded-xl hover:bg-[#E8C06E] transition-colors text-sm">
            {IC.plus} Добавить
          </button>
        )}
      </div>

      {creating && <ItemForm schema={schema} onSave={handleCreate} onCancel={() => setCreating(false)} />}

      {loading ? (
        <p className="text-white/30 text-sm py-12 text-center">Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="text-white/20 text-sm py-12 text-center">Нет записей. Добавьте первую!</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                {cols.map(({ key, label }) => (
                  <th key={key} className="text-left px-4 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">{label}</th>
                ))}
                <th className="px-4 py-3 text-right text-white/40 font-semibold text-xs uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <>
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    {cols.map(({ key, type }) => (
                      <td key={key} className="px-4 py-3 text-white/70 max-w-[180px]">
                        {type === 'stars' ? (
                          <span><span className="text-[#D4A843]">{'★'.repeat(item[key]||0)}</span><span className="text-white/20">{'★'.repeat(5-(item[key]||0))}</span></span>
                        ) : type === 'image' && item[key] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item[key]} alt="" className="w-10 h-8 object-cover rounded" />
                        ) : (
                          <span className="truncate block">{String(item[key] ?? '')}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => { setEditingId(editingId === item.id ? null : item.id); setCreating(false); }}
                          className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 hover:text-white transition-colors">{IC.edit}</button>
                        <button onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">{IC.trash}</button>
                      </div>
                    </td>
                  </tr>
                  {editingId === item.id && (
                    <tr key={`e-${item.id}`}>
                      <td colSpan={cols.length + 1} className="px-4 py-4 bg-white/[0.02]">
                        <ItemForm schema={schema} initial={item}
                          onSave={form => handleUpdate(item.id, form)}
                          onCancel={() => setEditingId(null)} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── LocaleTabs ────────────────────────────────────────────────────────────────
function LocaleTabs({ active, onChange }) {
  return (
    <div className="flex gap-2">
      {['ru', 'en', 'uz'].map(l => (
        <button key={l} onClick={() => onChange(l)}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${active === l ? 'bg-[#D4A843] text-[#0A0F1E]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ── FaqManager ────────────────────────────────────────────────────────────────
function FaqManager({ toast }) {
  const [locale, setLocale]     = useState('ru');
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [editIdx, setEditIdx]   = useState(null);
  const [form, setForm]         = useState({ q: '', a: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await apiFetch('faq', {}, locale)) || []); }
    finally { setLoading(false); }
  }, [locale]);

  useEffect(() => { load(); }, [load]);

  const reset = () => setForm({ q: '', a: '' });

  const handleCreate = async () => {
    if (!form.q || !form.a) { toast('Заполните вопрос и ответ', 'error'); return; }
    await apiFetch('faq', { method: 'POST', body: JSON.stringify({ action: 'create', item: form }) }, locale);
    setCreating(false); reset(); toast('Вопрос добавлен'); load();
  };
  const handleUpdate = async (idx) => {
    await apiFetch('faq', { method: 'POST', body: JSON.stringify({ action: 'update', id: String(idx), item: form }) }, locale);
    setEditIdx(null); reset(); toast('Сохранено'); load();
  };
  const handleDelete = async (idx) => {
    if (!confirm('Удалить вопрос?')) return;
    await apiFetch('faq', { method: 'POST', body: JSON.stringify({ action: 'delete', id: String(idx) }) }, locale);
    toast('Удалено'); load();
  };

  const FaqForm = ({ onSave, onCancel }) => (
    <div className="bg-[#0d1220] border border-white/10 rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-semibold uppercase tracking-wider">Вопрос *</label>
        <input type="text" value={form.q} onChange={e => setForm(f => ({ ...f, q: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors" placeholder="Введите вопрос..." />
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-semibold uppercase tracking-wider">Ответ *</label>
        <textarea value={form.a} onChange={e => setForm(f => ({ ...f, a: e.target.value }))} rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors resize-none" placeholder="Введите ответ..." />
      </div>
      <div className="flex gap-3">
        <button onClick={onSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0F1E] font-bold rounded-xl hover:bg-[#E8C06E] transition-colors text-sm">{IC.check} Сохранить</button>
        <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors text-sm">{IC.x} Отмена</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <LocaleTabs active={locale} onChange={l => { setLocale(l); setCreating(false); setEditIdx(null); }} />
          <span className="text-white/20 text-sm">{loading ? '...' : `${items.length} вопросов`}</span>
        </div>
        {!creating && editIdx === null && (
          <button onClick={() => { setCreating(true); reset(); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-[#0A0F1E] font-bold rounded-xl hover:bg-[#E8C06E] transition-colors text-sm">
            {IC.plus} Добавить вопрос
          </button>
        )}
      </div>

      {creating && <FaqForm onSave={handleCreate} onCancel={() => { setCreating(false); reset(); }} />}

      {loading ? <p className="text-white/30 text-sm py-12 text-center">Загрузка...</p> : (
        <div className="space-y-3">
          {items.length === 0 && <p className="text-white/20 text-sm py-12 text-center">Нет вопросов для этого языка</p>}
          {items.map((item, idx) => (
            <div key={idx} className="border border-white/10 rounded-xl overflow-hidden">
              {editIdx === idx ? (
                <div className="p-4">
                  <FaqForm onSave={() => handleUpdate(idx)} onCancel={() => { setEditIdx(null); reset(); }} />
                </div>
              ) : (
                <div className="p-4 hover:bg-white/[0.02] transition-colors flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm mb-1">{item.q}</p>
                    <p className="text-white/40 text-sm line-clamp-2">{item.a}</p>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider mt-1 block">#{idx + 1}</span>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => { setEditIdx(idx); setForm({ q: item.q, a: item.a }); setCreating(false); }}
                      className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 hover:text-white transition-colors">{IC.edit}</button>
                    <button onClick={() => handleDelete(idx)}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">{IC.trash}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ServicesManager ───────────────────────────────────────────────────────────
function ServicesManager({ toast }) {
  const [locale, setLocale]   = useState('ru');
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState({ title: '', short: '', full: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await apiFetch('services', {}, locale)) || []); }
    finally { setLoading(false); }
  }, [locale]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async () => {
    await apiFetch('services', { method: 'POST', body: JSON.stringify({ action: 'update', id: editId, item: form }) }, locale);
    setEditId(null); toast('Услуга обновлена'); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <LocaleTabs active={locale} onChange={l => { setLocale(l); setEditId(null); }} />
        <span className="text-white/20 text-xs">Только редактирование текстов</span>
      </div>

      {loading ? <p className="text-white/30 text-sm py-12 text-center">Загрузка...</p> : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="border border-white/10 rounded-xl overflow-hidden">
              {editId === item.id ? (
                <div className="p-5 space-y-4">
                  <p className="text-[#D4A843] text-xs font-bold uppercase tracking-wider">{item.id}</p>
                  {[['title','Заголовок','text'],['short','Краткое описание','text'],['full','Полное описание','textarea']].map(([k,l,t]) => (
                    <div key={k}>
                      <label className="block text-xs text-white/50 mb-1.5 font-semibold uppercase tracking-wider">{l}</label>
                      {t === 'textarea' ? (
                        <textarea value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} rows={4}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors resize-none" />
                      ) : (
                        <input type="text" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors" />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <button onClick={handleUpdate} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0F1E] font-bold rounded-xl hover:bg-[#E8C06E] transition-colors text-sm">{IC.check} Сохранить</button>
                    <button onClick={() => setEditId(null)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors text-sm">{IC.x} Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-start justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#D4A843] text-xs font-bold uppercase tracking-wider mb-1">{item.id}</p>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className="text-white/40 text-sm line-clamp-1 mt-0.5">{item.short}</p>
                  </div>
                  <button onClick={() => { setEditId(item.id); setForm({ title: item.title||'', short: item.short||'', full: item.full||'' }); }}
                    className="flex-shrink-0 p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 hover:text-white transition-colors">{IC.edit}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── AnalyticsPage ─────────────────────────────────────────────────────────────
function AnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/analytics/metrika', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Ошибка авторизации');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return <p className="text-white/30 text-sm py-16 text-center">Загрузка статистики...</p>;
  if (error)   return <p className="text-red-400 text-sm py-16 text-center">Ошибка: {error}</p>;
  if (!data)   return null;

  const isMetrika = data.source === 'yandex_metrika';
  const maxChart  = Math.max(...(data.chart   || []).map(d => d.count), 1);
  const maxDev    = Math.max(...(data.devices || []).map(d => d.count), 1);
  const maxOs     = Math.max(...(data.os      || []).map(d => d.count), 1);
  const maxBr     = Math.max(...(data.browsers|| []).map(d => d.count), 1);
  const maxAge    = Math.max(...(data.age     || []).map(d => d.count), 1);
  const maxGender = Math.max(...(data.gender  || []).map(d => d.count), 1);

  const DEVICE_COLORS = { desktop: 'bg-blue-400', mobile: 'bg-emerald-400', tablet: 'bg-purple-400', tv: 'bg-pink-400' };
  const DEVICE_LABELS = { desktop: 'Компьютер', mobile: 'Телефон', tablet: 'Планшет', tv: 'Телевизор' };

  function BarRow({ label, count, max, color = 'bg-[#D4A843]' }) {
    const pct = max > 0 ? Math.round((count / max) * 100) : 0;
    return (
      <div className="flex items-center gap-3">
        <span className="w-28 text-white/50 text-xs truncate flex-shrink-0">{label}</span>
        <div className="flex-1 bg-white/5 rounded-full h-1.5">
          <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-white/60 text-xs w-8 text-right flex-shrink-0">{count}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Source badge */}
      <div className="flex items-center gap-2">
        {isMetrika ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFCC00]/10 border border-[#FFCC00]/30 text-[#FFCC00] text-xs font-semibold">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Яндекс.Метрика · счётчик {/* */}108497871
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs">
            Локальный трекер · добавьте YANDEX_METRIKA_TOKEN для полной аналитики
          </span>
        )}
        <button onClick={load} className="p-1 text-white/20 hover:text-white/60 transition-colors" title="Обновить">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Онлайн сейчас', value: data.onlineNow, color: 'text-emerald-400', pulse: true },
          { label: 'Сегодня',        value: data.today,     color: 'text-blue-400'                },
          { label: 'За 7 дней',      value: data.week,      color: 'text-purple-400'              },
          { label: 'За 30 дней',     value: data.month,     color: 'text-[#D4A843]'               },
          { label: 'Всего',          value: data.total,     color: 'text-white'                   },
        ].map(({ label, value, color, pulse }) => (
          <div key={label} className="bg-[#141929] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              {pulse && (
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
              )}
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
            <p className="text-white/40 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* 7-day chart */}
      <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-bold mb-5 text-sm">Посещений за 7 дней</h3>
        <div className="flex items-end gap-1.5 h-28">
          {(data.chart || []).map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-white/40 text-[10px] h-4 flex items-end">{count > 0 ? count : ''}</span>
              <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <div
                  className="w-full bg-[#D4A843] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max((count / maxChart) * 80, count > 0 ? 3 : 0)}px` }}
                />
              </div>
              <span className="text-white/30 text-[9px] text-center leading-tight whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries */}
        <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4 text-sm">Страны</h3>
          {(data.countries || []).length === 0
            ? <p className="text-white/30 text-sm">Нет данных</p>
            : <div className="space-y-3">
                {data.countries.map(({ code, name, count }) => (
                  <BarRow key={code} label={name} count={count} max={data.countries[0].count} />
                ))}
              </div>
          }
        </div>

        {/* Top pages */}
        <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4 text-sm">Топ страниц</h3>
          {(data.pages || []).length === 0
            ? <p className="text-white/30 text-sm">Нет данных</p>
            : <div className="space-y-3">
                {data.pages.map(({ key, count }) => (
                  <BarRow key={key} label={key} count={count} max={data.pages[0].count} color="bg-blue-400" />
                ))}
              </div>
          }
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Devices */}
        <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4 text-sm">Устройства</h3>
          <div className="space-y-3">
            {(data.devices || []).map(({ key, count }) => (
              <BarRow key={key} label={DEVICE_LABELS[key] || key} count={count} max={maxDev} color={DEVICE_COLORS[key] || 'bg-white/40'} />
            ))}
          </div>
        </div>

        {/* OS */}
        <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4 text-sm">Операционные системы</h3>
          <div className="space-y-3">
            {(data.os || []).map(({ key, count }) => (
              <BarRow key={key} label={key} count={count} max={maxOs} color="bg-purple-400" />
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4 text-sm">Браузеры</h3>
          <div className="space-y-3">
            {(data.browsers || []).map(({ key, count }) => (
              <BarRow key={key} label={key} count={count} max={maxBr} color="bg-orange-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Demographics — shown only when Metrika provides real data */}
      {isMetrika && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Age */}
          <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4 text-sm">Возраст</h3>
            {(data.age || []).length === 0
              ? <p className="text-white/30 text-sm">Недостаточно данных — нужно больше Яндекс-аккаунтов среди посетителей</p>
              : <div className="space-y-3">
                  {data.age.map(({ key, count }) => (
                    <BarRow key={key} label={key} count={count} max={maxAge} color="bg-[#D4A843]" />
                  ))}
                </div>
            }
          </div>

          {/* Gender */}
          <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4 text-sm">Пол</h3>
            {(data.gender || []).length === 0
              ? <p className="text-white/30 text-sm">Недостаточно данных</p>
              : <div className="space-y-3">
                  {data.gender.map(({ key, count }) => (
                    <BarRow key={key} label={key} count={count} max={maxGender}
                      color={key === 'Мужчины' ? 'bg-blue-400' : 'bg-pink-400'} />
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      {/* Token setup hint — shown only when not connected */}
      {!isMetrika && (
        <div className="bg-[#141929] border border-[#D4A843]/20 rounded-xl p-5">
          <h3 className="text-[#D4A843] font-semibold mb-2 text-sm">Подключить Яндекс.Метрику</h3>
          <p className="text-white/50 text-sm mb-3 leading-relaxed">
            Для возраста, пола и точной статистики добавьте OAuth-токен в переменные окружения Vercel.
          </p>
          <ol className="space-y-1.5 text-white/40 text-sm list-decimal list-inside">
            <li>Откройте <code className="text-white/60">oauth.yandex.ru</code> → создайте приложение с правом <code className="text-white/60">metrika:read</code></li>
            <li>Получите OAuth-токен</li>
            <li>В Vercel: Settings → Environment Variables → добавьте <code className="text-white/60">YANDEX_METRIKA_TOKEN</code></li>
            <li>Сделайте редеплой проекта</li>
          </ol>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onNavigate }) {
  const [counts, setCounts] = useState({ portfolio: '…', testimonials: '…', clients: '…' });

  useEffect(() => {
    Promise.all([apiFetch('portfolio'), apiFetch('testimonials'), apiFetch('clients')])
      .then(([p, t, c]) => setCounts({ portfolio: p?.length ?? 0, testimonials: t?.length ?? 0, clients: c?.length ?? 0 }))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-white/40 text-sm">Добро пожаловать в панель управления ExpoContact CMS</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Проектов в портфолио', value: counts.portfolio,    section: 'portfolio',    color: 'text-[#D4A843]'  },
          { label: 'Отзывов клиентов',     value: counts.testimonials, section: 'testimonials', color: 'text-blue-400'   },
          { label: 'Компаний-клиентов',    value: counts.clients,      section: 'clients',      color: 'text-emerald-400'},
        ].map(({ label, value, section, color }) => (
          <button key={section} onClick={() => onNavigate(section)}
            className="bg-[#141929] border border-white/10 rounded-xl p-5 text-left hover:border-[#D4A843]/30 transition-colors group">
            <p className={`text-3xl font-black mb-1 ${color}`}>{value}</p>
            <p className="text-white/50 text-sm">{label}</p>
            <p className="text-white/20 text-xs mt-2 group-hover:text-[#D4A843] transition-colors">Управлять →</p>
          </button>
        ))}
      </div>

      <div className="bg-[#141929] border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3 text-sm">Быстрые действия</h3>
        <div className="flex flex-wrap gap-2">
          {[['portfolio','+ Проект'],['testimonials','+ Отзыв'],['clients','+ Клиент'],['faq','+ FAQ']].map(([s,l]) => (
            <button key={s} onClick={() => onNavigate(s)}
              className="px-4 py-2 bg-white/5 text-white/60 rounded-xl text-sm hover:bg-white/10 hover:text-white transition-colors">{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-[#141929] border border-[#D4A843]/20 rounded-xl p-5">
        <h3 className="text-[#D4A843] font-semibold mb-2 text-sm">Подсказка</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          Портфолио, отзывы и клиенты хранятся в <code className="text-white/70">content/data/*.json</code>.<br />
          FAQ и тексты услуг — в <code className="text-white/70">content/ru.json</code>, <code className="text-white/70">en.json</code>, <code className="text-white/70">uz.json</code>.<br />
          Изменения применяются сразу без перезапуска.
        </p>
      </div>
    </div>
  );
}

// ── SettingsPage ──────────────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      {[
        {
          title: 'Безопасность — смена пароля',
          content: (
            <>
              <p className="text-white/60 text-sm mb-3">Пароль по умолчанию: <code className="text-[#D4A843] bg-[#D4A843]/10 px-2 py-0.5 rounded">admin123</code></p>
              <p className="text-white/60 text-sm mb-2">Создайте файл <code className="text-white/80">.env.local</code> в корне проекта:</p>
              <pre className="bg-[#0A0F1E] rounded-lg p-4 text-emerald-400 text-xs overflow-x-auto">ADMIN_PASSWORD=ваш_надёжный_пароль</pre>
              <p className="text-white/30 text-xs mt-2">После изменения перезапустите сервер (npm run dev или redeploy на Vercel).</p>
            </>
          ),
        },
        {
          title: 'Структура файлов',
          content: (
            <pre className="bg-[#0A0F1E] rounded-lg p-4 text-white/50 text-xs overflow-x-auto leading-relaxed">{`content/\n├── ru.json   ← Тексты на русском\n├── en.json   ← Тексты на английском\n├── uz.json   ← Тексты на узбекском\n└── data/\n    ├── portfolio.json\n    ├── testimonials.json\n    └── clients.json`}</pre>
          ),
        },
        {
          title: 'Загрузка изображений',
          content: (
            <ul className="list-disc list-inside space-y-1 text-white/50 text-sm">
              <li>Положите файл в <code className="text-white/70">public/images/</code> → URL: <code className="text-white/70">/images/photo.jpg</code></li>
              <li>Используйте Cloudinary, ImgBB или другой CDN</li>
              <li>Tilda CDN (static.tildacdn.one) — уже используется для логотипов</li>
            </ul>
          ),
        },
        {
          title: 'Деплой на Vercel',
          content: (
            <ul className="list-disc list-inside space-y-1 text-white/50 text-sm">
              <li>Добавьте <code className="text-white/70">ADMIN_PASSWORD</code> в Environment Variables на Vercel</li>
              <li>Запись данных работает только при наличии файловой системы (не на Edge)</li>
              <li>Изменения сбрасываются при новом деплое — для продакшна используйте внешнюю БД (Supabase, PlanetScale)</li>
            </ul>
          ),
        },
      ].map(({ title, content }) => (
        <div key={title} className="bg-[#141929] border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4 text-sm">{title}</h3>
          {content}
        </div>
      ))}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ section, onNavigate, onLogout, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-[#0d1220] border-r border-white/5 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="px-5 py-5 border-b border-white/5">
          <p className="font-black text-lg text-white">EXPO<span className="text-[#D4A843]">CONTACT</span></p>
          <p className="text-white/25 text-xs mt-0.5">CMS Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ key, label, icon }) => (
            <button key={key} onClick={() => onNavigate(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${section === key ? 'bg-[#D4A843]/15 text-[#D4A843]' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              {icon}{label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-white/5 hover:text-white transition-colors">
            {IC.external} Перейти на сайт
          </a>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            {IC.logout} Выйти
          </button>
        </div>
      </aside>
    </>
  );
}

// ── AdminApp ──────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]       = useState(false);
  const [section, setSection]     = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, toast }         = useToast();

  useEffect(() => {
    const token = sessionStorage.getItem('cms_token');
    if (token) apiFetch('portfolio').then(() => setAuthed(true)).catch(() => {});
  }, []);

  const navigate = (s) => { setSection(s); setSidebarOpen(false); };
  const logout   = () => { sessionStorage.removeItem('cms_token'); setAuthed(false); };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex">
      <Sidebar section={section} onNavigate={navigate} onLogout={logout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-white/5 bg-[#0d1220] px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -ml-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            {IC.menu}
          </button>
          <h1 className="font-bold text-white text-base">{SECTION_TITLES[section]}</h1>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {section === 'dashboard'    && <Dashboard onNavigate={navigate} />}
          {section === 'analytics'    && <AnalyticsPage />}
          {section === 'portfolio'    && <CollectionManager key="portfolio"    collection="portfolio"    toast={toast} />}
          {section === 'testimonials' && <CollectionManager key="testimonials" collection="testimonials" toast={toast} />}
          {section === 'clients'      && <CollectionManager key="clients"      collection="clients"      toast={toast} />}
          {section === 'faq'          && <FaqManager toast={toast} />}
          {section === 'services'     && <ServicesManager toast={toast} />}
          {section === 'settings'     && <SettingsPage />}
        </main>
      </div>

      <ToastBar toasts={toasts} />
    </div>
  );
}
