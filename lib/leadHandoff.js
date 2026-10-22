/**
 * A confirmed lead, handed from the form to the thank-you page.
 *
 * Every main-site form sends the visitor to /<locale>/thanks once the server
 * has accepted the enquiry. Ad conversions are counted there, not in the form:
 * the form's page is being left, and an event fired a moment before the
 * navigation is often never sent. What the thank-you page needs to know —
 * which form, which direction — travels in sessionStorage, once: the page
 * takes it and removes it, so a reload, a bookmark or a direct visit counts
 * nothing. (A URL-based conversion in Google Ads cannot be guarded like this;
 * set it to count one conversion per click.)
 *
 * Browser only. Storage may be unavailable (private mode, blocked); then no
 * conversion is reported, and the lead itself is unaffected.
 */
const KEY = 'ec-lead-confirmed';
const MAX_AGE_MS = 30 * 60 * 1000;

/** Called by a form after the API answered ok. */
export function rememberLead({ form, audience }) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ form, audience, at: Date.now() }));
  } catch { /* storage blocked */ }
}

/** Called by the thank-you page: the lead, once, or null. */
export function takeLead() {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    const lead = raw ? JSON.parse(raw) : null;
    if (!lead || typeof lead.at !== 'number' || Date.now() - lead.at > MAX_AGE_MS) return null;
    return lead;
  } catch {
    return null;
  }
}

/** Where a confirmed main-site lead goes next. */
export function thanksHref(locale, audience) {
  return `/${locale}/thanks${audience === 'organiser' ? '?for=organiser' : ''}`;
}
