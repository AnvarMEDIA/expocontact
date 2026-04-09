'use client';

/**
 * Simple CMS Admin Panel — /admin
 *
 * Features:
 *  - Password login (ADMIN_PASSWORD env var, default: "admin123")
 *  - CRUD for Portfolio, Testimonials, Clients
 *  - Saves to content/data/*.json via /api/admin
 *
 * Not included in i18n routing — accessible directly at /admin
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const API = '/api/admin';

async function apiFetch(collection, options = {}) {
  const token = sessionStorage.getItem('cms_token') || '';
  const res   = await fetch(`${API}?collection=${collection}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...options,
  });
  if (res.status === 401) throw new Error('unauthorized');
  return res.json();
}

// ─── Field configs per collection ────────────────────────────────────────────
const SCHEMAS = {
  portfolio: [
    { key: 'title',      label: 'Название',    type: 'text',     required: true  },
    { key: 'client',     label: 'Клиент',      type: 'text',     required: true  },
    { key: 'exhibition', label: 'Выставка',    type: 'text',     required: true  },
    { key: 'area',       label: 'Площадь (м²)',type: 'number',   required: true  },
    { key: 'year',       label: 'Год',         type: 'number',   required: true  },
    {
      key: 'category', label: 'Категория', type: 'select', required: true,
      options: ['large', 'modular', 'conference', 'international'],
    },
    { key: 'description', label: 'Описание', type: 'textarea', required: false },
    { key: 'mainImage',   label: 'Фото (URL)',  type: 'text',   required: false },
  ],
  testimonials: [
    { key: 'name',     label: 'Имя',       type: 'text',     required: true  },
    { key: 'position', label: 'Должность', type: 'text',     required: true  },
    { key: 'company',  label: 'Компания',  type: 'text',     required: true  },
    { key: 'rating',   label: 'Рейтинг',  type: 'number',   required: true  },
    { key: 'quote',    label: 'Отзыв',    type: 'textarea', required: true  },
    { key: 'avatar',   label: 'Аватар (URL)', type: 'text', required: false },
  ],
  clients: [
    { key: 'name',    label: 'Название',    type: 'text', required: true  },
    { key: 'logo',    label: 'Лого (URL)',  type: 'text', required: false },
    { key: 'website', label: 'Сайт (URL)', type: 'text', required: false },
  ],
};

const TABS = [
  { key: 'portfolio',    label: '📁 Портфолио' },
  { key: 'testimonials', label: '💬 Отзывы'    },
  { key: 'clients',      label: '🏢 Клиенты'   },
];

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]  = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    sessionStorage.setItem('cms_token', pw);
    try {
      await apiFetch('portfolio');
      onLogin();
    } catch {
      setErr('Неверный пароль');
      sessionStorage.removeItem('cms_token');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <div className="bg-[#141929] rounded-2xl p-8 w-full max-w-sm border border-white/10 shadow-2xl">
        <div className="mb-8 text-center">
          <span className="font-black text-2xl text-white">
            EXPO<span className="text-[#D4A843]">CONTACT</span>
          </span>
          <p className="text-white/40 text-sm mt-2">CMS Admin Panel</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-semibold uppercase tracking-wider">
              Пароль
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#D4A843] transition-colors"
              placeholder="••••••••"
              autoFocus
            />
            {err && <p className="text-red-400 text-xs mt-1">{err}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-[#D4A843] text-[#0A0F1E] font-bold py-3 rounded-lg hover:bg-[#E8C06E] transition-colors"
          >
            Войти
          </button>
        </form>

        <p className="text-white/20 text-xs text-center mt-6">
          Пароль по умолчанию: <code className="text-[#D4A843]">admin123</code>
          <br />Измените через ADMIN_PASSWORD в .env
        </p>
      </div>
    </div>
  );
}

// ─── Item form (create / edit) ────────────────────────────────────────────────
function ItemForm({ schema, initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState(() => {
    const defaults = {};
    schema.forEach(({ key, type }) => {
      defaults[key] = initial[key] ?? (type === 'number' ? '' : '');
    });
    return defaults;
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schema.map(({ key, label, type, options, required }) => (
          <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="block text-xs text-white/50 mb-1.5 font-semibold uppercase tracking-wider">
              {label}{required && <span className="text-[#D4A843]"> *</span>}
            </label>

            {type === 'textarea' ? (
              <textarea
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D4A843] transition-colors resize-none"
              />
            ) : type === 'select' ? (
              <select
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full bg-[#141929] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
              >
                <option value="">— выберите —</option>
                {options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D4A843] transition-colors"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          className="px-6 py-2.5 bg-[#D4A843] text-[#0A0F1E] font-bold rounded-lg hover:bg-[#E8C06E] transition-colors text-sm"
        >
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors text-sm"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

// ─── Collection manager ───────────────────────────────────────────────────────
function CollectionManager({ collection }) {
  const schema              = SCHEMAS[collection];
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(collection);
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => { load(); }, [load]);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleCreate = async (form) => {
    await apiFetch(collection, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', item: form }),
    });
    setCreating(false);
    flash('Создано ✓');
    load();
  };

  const handleUpdate = async (id, form) => {
    await apiFetch(collection, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', id, item: form }),
    });
    setEditingId(null);
    flash('Сохранено ✓');
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить запись?')) return;
    await apiFetch(collection, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id }),
    });
    flash('Удалено ✓');
    load();
  };

  // Derive display columns from schema (first 3 fields)
  const cols = schema.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{items.length} записей</p>
        <div className="flex items-center gap-3">
          {msg && <span className="text-[#D4A843] text-sm">{msg}</span>}
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-[#0A0F1E] font-bold rounded-lg hover:bg-[#E8C06E] transition-colors text-sm"
            >
              + Добавить
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <ItemForm
          schema={schema}
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Items table */}
      {loading ? (
        <p className="text-white/30 text-sm py-8 text-center">Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="text-white/20 text-sm py-8 text-center">Нет записей. Добавьте первую!</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                {cols.map(({ key, label }) => (
                  <th key={key} className="text-left px-4 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">
                    {label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <>
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    {cols.map(({ key }) => (
                      <td key={key} className="px-4 py-3 text-white/70 truncate max-w-xs">
                        {String(item[key] ?? '')}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                          className="px-3 py-1.5 bg-white/5 text-white/60 rounded hover:bg-white/10 transition-colors"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === item.id && (
                    <tr key={`edit-${item.id}`} className="bg-white/2">
                      <td colSpan={cols.length + 1} className="px-4 py-4">
                        <ItemForm
                          schema={schema}
                          initial={item}
                          onSave={(form) => handleUpdate(item.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
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

// ─── Main Admin App ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [tab, setTab]         = useState('portfolio');

  // Check if already logged in
  useEffect(() => {
    const token = sessionStorage.getItem('cms_token');
    if (token) {
      apiFetch('portfolio').then(() => setAuthed(true)).catch(() => {});
    }
  }, []);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">

      {/* Header */}
      <header className="border-b border-white/5 bg-[#141929]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-black text-lg text-white">
              EXPO<span className="text-[#D4A843]">CONTACT</span>
            </span>
            <span className="ml-3 text-white/30 text-sm">CMS Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              ← На сайт
            </a>
            <button
              onClick={() => { sessionStorage.removeItem('cms_token'); setAuthed(false); }}
              className="text-white/30 hover:text-red-400 text-sm transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                tab === key
                  ? 'bg-[#D4A843] text-[#0A0F1E]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Collection manager */}
        <CollectionManager key={tab} collection={tab} />
      </div>
    </div>
  );
}
