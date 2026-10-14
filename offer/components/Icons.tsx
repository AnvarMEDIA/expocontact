/** Line icons, 24×24, drawn for this page. Decorative: the text next to them carries the meaning. */
import type { ReactElement } from "react";

const common = {
  width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  "aria-hidden": true, focusable: false,
};

export const IconPermit = () => (
  <svg {...common}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h4" /></svg>
);
export const IconVenue = () => (
  <svg {...common}><path d="M3 21h18" /><path d="M5 21V10l7-5 7 5v11" /><path d="M9 21v-6h6v6" /></svg>
);
export const IconPavilion = () => (
  <svg {...common}><path d="M12 3 3 8l9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
);
export const IconStand = () => (
  <svg {...common}><path d="M4 20V6h16v14" /><path d="M4 10h16" /><path d="M9 20v-6h6v6" /><path d="M2 20h20" /></svg>
);
export const IconMegaphone = () => (
  <svg {...common}><path d="M3 10v4h3l7 5V5L6 10z" /><path d="M17 8.5a5 5 0 0 1 0 7" /><path d="M19.5 6a8.5 8.5 0 0 1 0 12" /></svg>
);
export const IconVisitors = () => (
  <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 4.8a3.2 3.2 0 0 1 0 6.4" /><path d="M18 14.3c1.8.8 3 2.7 3 5.7" /></svg>
);
export const IconArrow = () => (
  <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconCheck = () => (
  <svg {...common} strokeWidth={2.4}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IconPause = () => (
  <svg {...common} strokeWidth={2.4}><path d="M9 6v12M15 6v12" /></svg>
);
export const IconPlay = () => (
  <svg {...common} fill="currentColor" strokeWidth={1.4}><path d="M8 5.5v13l10.5-6.5z" /></svg>
);
export const IconDash = () => (
  <svg {...common} strokeWidth={2}><path d="M7 12h10" /></svg>
);
export const IconPhone = () => (
  <svg {...common}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
);
export const IconMail = () => (
  <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const IconGlobe = () => (
  <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3" /></svg>
);
export const IconWhatsApp = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2m4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2-.2-.2-.5-.3" />
  </svg>
);
export const IconTelegram = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M21.4 3.6 2.9 10.7c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.5-1.4M8.6 13.3l9.6-6c.5-.3.9-.1.5.2l-8.2 7.4-.3 3.4z" />
  </svg>
);

export const SERVICE_ICONS: ReadonlyArray<() => ReactElement> = [
  IconPermit, IconVenue, IconPavilion, IconStand, IconMegaphone, IconVisitors,
];
