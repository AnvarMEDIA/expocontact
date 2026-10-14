/**
 * Turns the literal type of the Russian master dictionary into the shape every
 * other language must match: strings become `string`, tuples keep their
 * length. A missing key, an extra key or a list with one card too few in any
 * language is a compile error, not a blank spot on the page.
 */
export type Widen<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? { readonly [K in keyof T]: Widen<T[K]> }
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T;
