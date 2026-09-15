'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES } from '@/lib/countries';

/**
 * Phone input with a country dial code in front of it.
 *
 * The country is preselected from the visitor's own country (/api/geo, backed
 * by the edge geo header) and falls back to Uzbekistan. Pasting a number that
 * already starts with a dial code switches the selector instead of producing
 * something like +998+7 900...
 *
 * The surrounding forms are uncontrolled and read values with FormData, so the
 * assembled number is submitted through a hidden input under the field name the
 * API expects. The visible input carries `required`, which keeps the existing
 * form.checkValidity() flow working.
 */

// Markets the company actually works in come first; the rest are the origins
// that show up in exhibition traffic, alphabetical by name.

const DEFAULT_CODE = 'UZ';
const MIN_DIGITS = 6;

const MESSAGES = {
  ru: { country: 'Код страны', invalid: 'Введите номер телефона полностью' },
  en: { country: 'Country code', invalid: 'Please enter the full phone number' },
  uz: { country: 'Mamlakat kodi', invalid: 'Telefon raqamini to’liq kiriting' },
};

/** Longest dial code that a typed/pasted value starts with. */
function matchDial(value) {
  const cleaned = value.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) return null;
  let best = null;
  for (const c of COUNTRIES) {
    if (cleaned.startsWith(c.dial) && (!best || c.dial.length > best.dial.length)) best = c;
  }
  return best;
}

export default function PhoneField({
  name = 'phone',
  locale = 'ru',
  placeholder = '',
  required = true,
  id,
}) {
  const [country, setCountry] = useState(DEFAULT_CODE);
  const [number, setNumber]   = useState('');
  const inputRef = useRef(null);
  const touched  = useRef(false);

  const t = MESSAGES[locale] || MESSAGES.ru;

  // Preselect the visitor's own country, unless they already started typing.
  useEffect(() => {
    let alive = true;
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || touched.current || !d?.country) return;
        if (COUNTRIES.some((c) => c.code === d.country)) setCountry(d.country);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.code === country) || COUNTRIES[0],
    [country],
  );

  const digits = number.replace(/\D/g, '');
  const full   = digits ? `${selected.dial} ${number.trim()}` : '';

  // Keep native validation in step with the assembled value.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.setCustomValidity(!required || digits.length >= MIN_DIGITS ? '' : t.invalid);
  }, [digits, required, t.invalid]);

  const onNumberChange = (e) => {
    touched.current = true;
    const raw = e.target.value;

    // Pasting a full international number should move the selector rather
    // than end up concatenated behind the current code.
    const matched = matchDial(raw);
    if (matched) {
      setCountry(matched.code);
      setNumber(raw.replace(/[^\d+]/g, '').slice(matched.dial.length));
      return;
    }
    setNumber(raw.replace(/[^\d\s()\-]/g, ''));
  };

  return (
    <div className="phone-input">
      <select
        className="phone-input__code"
        value={country}
        aria-label={t.country}
        onChange={(e) => { touched.current = true; setCountry(e.target.value); }}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.dial}
          </option>
        ))}
      </select>

      <input
        ref={inputRef}
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="phone-input__num"
        value={number}
        onChange={onNumberChange}
        placeholder={placeholder}
        required={required}
      />

      <input type="hidden" name={name} value={full} />
    </div>
  );
}
