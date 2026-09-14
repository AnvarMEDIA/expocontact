/**
 * Display formatting for phone numbers stored by PhoneField.
 *
 * PhoneField saves "<dial> <national digits>" with one space between, e.g.
 * "+998 909999999". That is what goes into the lead and into tel: links; this
 * helper only makes it readable for people: "+998 90 999-99-99".
 *
 * The national part is grouped from the right — the last seven digits become
 * "XXX-XX-XX" and whatever precedes them is the area code — which matches how
 * numbers are written in Uzbekistan, Kazakhstan and Russia alike. A value
 * without the dial-code space is returned untouched: without the separator
 * there is no safe way to tell "+998 90…" from "+99 890…".
 */
export function formatPhone(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  const m = s.match(/^(\+\d{1,4})\s+(.+)$/);
  if (!m) return s;

  const dial = m[1];
  const digits = m[2].replace(/\D/g, '');
  if (digits.length < 7) return `${dial} ${digits}`.trim();

  const head = digits.slice(0, -7);
  const mid  = digits.slice(-7, -4);
  const tail = digits.slice(-4);
  return `${dial}${head ? ` ${head}` : ''} ${mid}-${tail.slice(0, 2)}-${tail.slice(2)}`;
}
