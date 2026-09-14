/**
 * POST /api/contact
 *
 * 1. Persists the lead (Vercel KV or JSON file — see lib/leads.js)
 * 2. Sends a Telegram notification (if TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID set)
 *
 * Optional body fields:
 *   source    'contact' | 'modal' | 'ads'
 *   locale    'ru' | 'en' | 'uz'
 *   marketing campaign attribution from the browser — see lib/marketing.js.
 *             Never trusted as-is; sanitizeMarketing() whitelists and bounds it.
 */
import { NextResponse } from 'next/server';
import { createLead } from '@/lib/leads';
import { sanitizeMarketing, marketingSummary, clickIdLabel } from '@/lib/marketing';

const FORM_LABELS = {
  contact: 'форма контактов',
  modal:   'попап',
  ads:     'рекламная страница',
};

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, company, phone, expo, event, message, source, locale } = body;

  // Campaign data is whitelisted and bounded — it arrives from the browser and
  // ends up in Telegram messages, the leads list and CSV exports.
  const marketing = sanitizeMarketing(body.marketing);

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
    lead = await createLead({ ...safe, source, locale, marketing });
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
      source   ? `📍 Форма: ${FORM_LABELS[source] || source}` : null,
      locale   ? `🌐 Локаль: ${locale.toUpperCase()}` : null,
      marketingSummary(marketing) ? `🎯 Кампания: ${marketingSummary(marketing)}` : null,
      marketing?.content ? `🧩 Объявление: ${marketing.content}` : null,
      marketing?.term    ? `🔎 Запрос: ${marketing.term}` : null,
      clickIdLabel(marketing) ? `🆔 Клик ${clickIdLabel(marketing)}: ${marketing.clickId}` : null,
      (!marketingSummary(marketing) && marketing?.referrer) ? `🔗 Переход с: ${marketing.referrer}` : null,
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
      id: lead?.id, ...safe, source, locale, marketing,
    });
  }

  return NextResponse.json({ ok: true, id: lead?.id });
}
