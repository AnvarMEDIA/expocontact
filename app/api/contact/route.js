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

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, company, phone, expo, event, message, source, locale } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 });
  }

  // Bound every field so an oversized payload cannot blow past Telegram's
  // 4096-character message limit or bloat the leads store.
  const clamp = (v, max) => (typeof v === 'string' ? v.slice(0, max) : v);
  const safe = {
    name:    clamp(name, 120),
    company: clamp(company, 120),
    phone:   clamp(phone, 40),
    expo:    clamp(expo || event, 160),
    message: clamp(message, 2000),
  };

  // A missing leads database must not cost us the lead: Telegram below is the
  // delivery channel of record, so a failure here is logged and nothing more.
  let lead = null;
  try {
    lead = await createLead({ ...safe, source, locale });
  } catch (err) {
    console.error('[contact] Lead save failed:', err.message);
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    // Sent as plain text on purpose. With parse_mode a visitor name or message
    // containing *, _, [ or ` makes Telegram reject the whole request with a
    // 400 and the lead is lost without a trace.
    const text = [
      '📬 Новая заявка с сайта ExpoContact',
      lead ? `🆔 ${lead.id}` : null,
      '',
      `👤 Имя: ${safe.name}`,
      safe.company ? `🏢 Компания: ${safe.company}` : null,
      `📞 Телефон: ${safe.phone}`,
      safe.expo    ? `🎪 Выставка: ${safe.expo}`    : null,
      safe.message ? `💬 Сообщение: ${safe.message}` : null,
      source   ? `📍 Источник: ${source === 'modal' ? 'попап' : 'форма контактов'}` : null,
      locale   ? `🌐 Локаль: ${locale.toUpperCase()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      });
      if (!res.ok) {
        // Surface the reason in the function logs; the visitor still sees a
        // success because the lead itself was accepted.
        console.error('[contact] Telegram rejected the message:',
          res.status, (await res.text().catch(() => '')).slice(0, 300));
      }
    } catch (err) {
      console.error('[contact] Telegram send failed:', err);
    }
  } else {
    console.log('[contact] Form submission (Telegram not configured):', {
      id: lead?.id, ...safe, source, locale,
    });
  }

  return NextResponse.json({ ok: true, id: lead?.id });
}
