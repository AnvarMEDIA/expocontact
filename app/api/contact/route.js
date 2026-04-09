/**
 * POST /api/contact
 * Receives contact form data and sends a Telegram message.
 *
 * Required env vars:
 *   TELEGRAM_BOT_TOKEN  — your bot token from @BotFather
 *   TELEGRAM_CHAT_ID    — the chat/channel ID to receive messages
 *
 * If env vars are absent the request is still accepted (dev mode).
 */
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { name, company, phone, expo, message } = body;

  // Basic server-side validation
  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 });
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    const text = [
      '📬 *Новая заявка с сайта ExpoContact*',
      '',
      `👤 *Имя:* ${name}`,
      company  ? `🏢 *Компания:* ${company}`  : null,
      `📞 *Телефон:* ${phone}`,
      expo     ? `🎪 *Выставка:* ${expo}`     : null,
      message  ? `💬 *Сообщение:* ${message}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id:    chatId,
            text,
            parse_mode: 'Markdown',
          }),
        },
      );
    } catch (err) {
      // Log but don't fail the request — user still gets success UX
      console.error('[contact] Telegram send failed:', err);
    }
  } else {
    // Dev/preview: just log the submission
    console.log('[contact] Form submission (Telegram not configured):', {
      name, company, phone, expo, message,
    });
  }

  return NextResponse.json({ ok: true });
}
