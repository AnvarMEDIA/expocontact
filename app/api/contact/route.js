/**
 * POST /api/contact
 *
 * 1. Persists the lead (Vercel KV or JSON file — see lib/leads.js)
 * 2. Sends a Telegram notification (if TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID set)
 *
 * Optional body fields: source ('contact' | 'modal'), locale ('ru' | 'en' | 'uz')
 */
import { NextResponse } from 'next/server';
import { createLead } from '@/lib/leads';

const STATUS_LABEL = { new: '🆕 Новая', in_progress: '⏳ В работе', closed: '✅ Закрыта', spam: '🚫 Спам' };

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, company, phone, expo, event, message, source, locale } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 });
  }

  let lead = null;
  try {
    lead = await createLead({
      name, company, phone,
      expo: expo || event,
      message, source, locale,
    });
  } catch (err) {
    console.error('[contact] Lead save failed:', err);
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    const text = [
      '📬 *Новая заявка с сайта ExpoContact*',
      lead ? `🆔 \`${lead.id}\`` : null,
      '',
      `👤 *Имя:* ${name}`,
      company  ? `🏢 *Компания:* ${company}`  : null,
      `📞 *Телефон:* ${phone}`,
      (expo || event) ? `🎪 *Выставка:* ${expo || event}` : null,
      message  ? `💬 *Сообщение:* ${message}` : null,
      source   ? `📍 *Источник:* ${source === 'modal' ? 'попап' : 'форма контактов'}` : null,
      locale   ? `🌐 *Локаль:* ${locale.toUpperCase()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      });
    } catch (err) {
      console.error('[contact] Telegram send failed:', err);
    }
  } else {
    console.log('[contact] Form submission (Telegram not configured):', {
      id: lead?.id, name, company, phone, expo: expo || event, message, source, locale,
    });
  }

  return NextResponse.json({ ok: true, id: lead?.id });
}
