/**
 * POST /api/contact
 *
 * 1. Persists the lead (Vercel KV or JSON file — see lib/leads.js)
 * 2. Sends a Telegram notification through lib/telegram.js when configured
 *
 * Optional body fields:
 *   source    'contact' | 'modal' | 'ads'
 *   locale    'ru' | 'en' | 'uz'
 *   marketing campaign attribution from the browser — see lib/marketing.js.
 *             Never trusted as-is; sanitizeMarketing() whitelists and bounds it.
 *   details   answers to the qualifying questions on the ad landing — see
 *             lib/leadFields.js. Only known questions with known answers survive.
 */
import { NextResponse } from 'next/server';
import { createLead } from '@/lib/leads';
import { sanitizeMarketing, marketingSummary, clickIdLabel } from '@/lib/marketing';
import { sanitizeDetails, qualifierLabel, qualifierValueLabel } from '@/lib/leadFields';
import { sendTelegram, telegramConfigured } from '@/lib/telegram';

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

  // Same rule for the brief answers: only questions we ask, answered with one
  // of the options we offer.
  const details = sanitizeDetails(body.details);

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
    lead = await createLead({ ...safe, source, locale, marketing, details });
  } catch (err) {
    console.error('[contact] Lead save failed:', err.message);
  }

  if (telegramConfigured()) {
    const text = [
      '📬 Новая заявка с сайта ExpoContact',
      lead ? `🆔 ${lead.id}` : null,
      '',
      `👤 Имя: ${safe.name}`,
      safe.company ? `🏢 Компания: ${safe.company}` : null,
      `📞 Телефон: ${safe.phone}`,
      safe.expo    ? `🎪 Выставка: ${safe.expo}`    : null,
      ...(details
        ? Object.entries(details).map(([k, v]) => `📐 ${qualifierLabel(k)}: ${qualifierValueLabel(k, v)}`)
        : []),
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

    // The visitor still sees a success: the lead itself was accepted above.
    // The reason lands in the function logs and, with the same wording, in
    // the admin self-test.
    const sent = await sendTelegram(text);
    if (!sent.ok) {
      console.error('[contact] Telegram delivery failed:', sent.status, sent.description, sent.hint || '');
    }
  } else {
    console.log('[contact] Form submission (Telegram not configured):', {
      id: lead?.id, ...safe, source, locale, marketing, details,
    });
  }

  return NextResponse.json({ ok: true, id: lead?.id });
}
