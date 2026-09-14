/**
 * Telegram delivery for lead notifications.
 *
 * One sender shared by the contact form and the admin self-test, so both go
 * through the same request and the same error handling. Nothing here throws:
 * a lead must never be lost because the notification failed, and the admin
 * needs the reason, not an exception.
 *
 * Configuration comes from two env vars: TELEGRAM_BOT_TOKEN (from @BotFather)
 * and TELEGRAM_CHAT_ID (a user id, or a negative id for a group/channel).
 */

// TELEGRAM_API_BASE exists for local tests only: pointing it at a stub server
// lets a test read the exact message the form would have sent.
const API = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';

function config() {
  return {
    token:  (process.env.TELEGRAM_BOT_TOKEN || '').trim(),
    chatId: (process.env.TELEGRAM_CHAT_ID || '').trim(),
  };
}

export function telegramConfigured() {
  const { token, chatId } = config();
  return !!(token && chatId);
}

/** One Bot API call. Returns { ok, status, result?, description? }, never throws. */
async function call(token, method, body) {
  try {
    const res = await fetch(`${API}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: !!data.ok,
      status: res.status,
      result: data.result,
      description: data.description || (res.ok ? '' : `HTTP ${res.status}`),
    };
  } catch (err) {
    return { ok: false, status: 0, description: `network: ${err.message}` };
  }
}

/**
 * Turn a Bot API error into the sentence an editor needs to fix it. The
 * descriptions are stable strings documented by Telegram.
 */
function hintFor(step, r) {
  const d = (r.description || '').toLowerCase();
  if (r.status === 0) {
    return 'Сервер не смог достучаться до api.telegram.org — проверьте сетевые ограничения хостинга.';
  }
  if (step === 'bot') {
    if (r.status === 401 || d.includes('unauthorized')) {
      return 'Токен бота неверный. Скопируйте его заново у @BotFather (команда /mybots → API Token) и обновите TELEGRAM_BOT_TOKEN в Vercel.';
    }
    if (r.status === 404) return 'Токен имеет неверный формат — Telegram не нашёл такого бота.';
    return `Telegram отклонил токен: ${r.description}`;
  }
  if (d.includes('chat not found')) {
    return 'Чат с таким ID не найден. Для личного чата сначала напишите боту любое сообщение (или /start); для группы — добавьте бота в неё. ID группы начинается с минуса.';
  }
  if (d.includes('blocked')) return 'Пользователь заблокировал бота — разблокируйте его в Telegram и напишите /start.';
  if (d.includes('not a member') || d.includes('kicked')) {
    return 'Бот не состоит в этом чате. Добавьте его в группу или канал.';
  }
  if (d.includes('rights') || d.includes('forbidden') || r.status === 403) {
    return 'У бота нет права писать в этот чат. В канале сделайте бота администратором с правом публиковать сообщения.';
  }
  return `Telegram ответил: ${r.description}`;
}

/**
 * Deliver one plain-text message to the configured chat.
 * Returns { ok, skipped?, status, description, hint? }.
 */
export async function sendTelegram(text) {
  const { token, chatId } = config();
  if (!token || !chatId) return { ok: false, skipped: true, description: 'not configured' };

  // Plain text on purpose: with parse_mode a visitor name or message containing
  // *, _, [ or ` makes Telegram reject the whole request with a 400.
  const r = await call(token, 'sendMessage', {
    chat_id: chatId, text, disable_web_page_preview: true,
  });
  return r.ok ? { ok: true, status: r.status } : { ...r, hint: hintFor('send', r) };
}

/**
 * The admin self-test: validate the token, then the chat, then actually
 * send. Each step reports what it found so a wrong value is named, not
 * guessed. Returns { configured, steps: [{ key, ok, title, detail }], ok }.
 */
export async function telegramDiagnose() {
  const { token, chatId } = config();
  const steps = [];

  if (!token || !chatId) {
    const missing = [!token && 'TELEGRAM_BOT_TOKEN', !chatId && 'TELEGRAM_CHAT_ID'].filter(Boolean);
    return {
      configured: false, ok: false,
      steps: [{
        key: 'config', ok: false, title: 'Переменные не заданы',
        detail: `Добавьте ${missing.join(' и ')} в Vercel → Settings → Environment Variables и сделайте redeploy.`,
      }],
    };
  }

  const me = await call(token, 'getMe');
  if (!me.ok) {
    steps.push({ key: 'bot', ok: false, title: 'Токен бота не принят', detail: hintFor('bot', me) });
    return { configured: true, ok: false, steps };
  }
  const username = me.result?.username ? `@${me.result.username}` : 'бот';
  steps.push({ key: 'bot', ok: true, title: `Бот ${username} — токен верный`, detail: '' });

  const chat = await call(token, 'getChat', { chat_id: chatId });
  if (!chat.ok) {
    steps.push({
      key: 'chat', ok: false, title: `Чат ${chatId} недоступен`,
      detail: hintFor('chat', chat) + ` Бот: ${username}.`,
    });
    return { configured: true, ok: false, steps, bot: username };
  }
  const c = chat.result || {};
  const chatName = c.title || [c.first_name, c.last_name].filter(Boolean).join(' ') || (c.username ? `@${c.username}` : chatId);
  const chatKind = { private: 'личный чат', group: 'группа', supergroup: 'группа', channel: 'канал' }[c.type] || c.type;
  steps.push({ key: 'chat', ok: true, title: `Чат найден — ${chatName} (${chatKind})`, detail: '' });

  const sent = await sendTelegram(
    '✅ Тестовое сообщение из админки ExpoContact.\nЕсли вы это видите — заявки с сайта будут приходить сюда.',
  );
  steps.push(sent.ok
    ? { key: 'send', ok: true, title: 'Тестовое сообщение доставлено', detail: 'Проверьте чат в Telegram.' }
    : { key: 'send', ok: false, title: 'Сообщение не доставлено', detail: sent.hint || sent.description });

  return { configured: true, ok: sent.ok, steps, bot: username, chat: chatName };
}
