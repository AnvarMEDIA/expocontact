/**
 * Campaign attribution attached to a lead.
 *
 * Shared by the browser (which reads the values off the landing URL) and the
 * API route (which must not trust anything the browser sends). Keep this file
 * free of React and of Node-only APIs so both sides can import it.
 */

/** utm_<name> query parameters we keep, in the order they are shown. */
export const UTM_FIELDS = ['source', 'medium', 'campaign', 'content', 'term'];

/** Ad-platform click identifiers, most specific first. */
export const CLICK_ID_PARAMS = {
  gclid:   'Google Ads',
  yclid:   'Яндекс.Директ',
  fbclid:  'Meta',
  ttclid:  'TikTok',
  msclkid: 'Microsoft Ads',
  twclid:  'X (Twitter)',
};

const MAX_LEN = 200;

function clean(value) {
  if (typeof value !== 'string') return '';
  // Strip control characters: these end up in Telegram messages and CSV files.
  return value.replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, MAX_LEN);
}

/**
 * Whitelist and bound whatever the browser posted. Returns undefined when
 * nothing useful is left, so a lead from organic traffic carries no empty
 * marketing object.
 */
export function sanitizeMarketing(input) {
  if (!input || typeof input !== 'object') return undefined;

  const out = {};
  for (const field of UTM_FIELDS) {
    const v = clean(input[field]);
    if (v) out[field] = v;
  }

  const clickType = clean(input.clickType);
  const clickId   = clean(input.clickId);
  if (clickId && Object.prototype.hasOwnProperty.call(CLICK_ID_PARAMS, clickType)) {
    out.clickType = clickType;
    out.clickId   = clickId;
  }

  for (const field of ['referrer', 'landing']) {
    const v = clean(input[field]);
    if (v) out[field] = v;
  }

  return Object.keys(out).length ? out : undefined;
}

/** "google / cpc / autumn_stands" — the one line a sales person actually reads. */
export function marketingSummary(m) {
  if (!m) return '';
  const parts = [m.source, m.medium, m.campaign].filter(Boolean);
  return parts.join(' / ');
}

/** Human label for the click id, e.g. "Google Ads". */
export function clickIdLabel(m) {
  return m?.clickType ? CLICK_ID_PARAMS[m.clickType] || m.clickType : '';
}
