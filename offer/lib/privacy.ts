/** The privacy policy opens as a dialog inside the landing — from the footer and from the form. */
export const OPEN_PRIVACY = "offer:privacy";

export function openPrivacy(): void {
  window.dispatchEvent(new Event(OPEN_PRIVACY));
}
