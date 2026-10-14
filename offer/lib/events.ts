/**
 * «Выбрать» in the packages and the enquiry form are siblings rendered by a
 * server page; a window event connects them without a shared client parent.
 */
import type { FormatKey } from "./lead";

export const CHOOSE_FORMAT = "offer:choose-format";

export function chooseFormat(format: FormatKey): void {
  window.dispatchEvent(new CustomEvent<FormatKey>(CHOOSE_FORMAT, { detail: format }));
}
