/**
 * Analytics events of the /offer landing. Every call is a no-op when the
 * tracker is missing — not configured, or blocked by the visitor's browser —
 * and never throws: a lost event must never cost a lead.
 *
 * Meta Pixel `Lead` reuses lib/metaPixel.js, the same helper the main site's
 * forms call, so both count conversions the same way.
 */
import { trackLead } from "@/lib/metaPixel";

type Params = Record<string, string | number | boolean>;

interface TrackerWindow {
  gtag?: (...args: unknown[]) => void;
  lintrk?: (action: string, data: Record<string, unknown>) => void;
}

const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || "";
const GADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GADS_LEAD_LABEL || "";
const LINKEDIN_CONVERSION_ID = process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_ID || "";

function win(): TrackerWindow {
  return (typeof window === "undefined" ? {} : window) as TrackerWindow;
}

/** A click worth knowing about: hero CTA, package choice, WhatsApp, Telegram, phone. */
export function trackEvent(name: string, params: Params = {}): void {
  try {
    win().gtag?.("event", name, params);
  } catch { /* blocked */ }
}

/** Called only after the server confirmed the enquiry — never on the button click. */
export function trackLeadSubmit(language: string): void {
  trackLead("offer");
  trackEvent("lead_submit", { language });
  try {
    if (GADS_ID && GADS_LEAD_LABEL) {
      win().gtag?.("event", "conversion", { send_to: `${GADS_ID}/${GADS_LEAD_LABEL}`, language });
    }
    if (LINKEDIN_CONVERSION_ID) {
      win().lintrk?.("track", { conversion_id: Number(LINKEDIN_CONVERSION_ID) });
    }
  } catch { /* blocked */ }
}
