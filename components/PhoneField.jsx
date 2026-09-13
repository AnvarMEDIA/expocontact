'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
const COUNTRIES = [
  { code: 'UZ', dial: '+998', flag: '🇺🇿', name: 'Узбекистан' },
  { code: 'RU', dial: '+7',   flag: '🇷🇺', name: 'Россия' },
  { code: 'KZ', dial: '+7',   flag: '🇰🇿', name: 'Казахстан' },
  { code: 'KG', dial: '+996', flag: '🇰🇬', name: 'Кыргызстан' },
  { code: 'TJ', dial: '+992', flag: '🇹🇯', name: 'Таджикистан' },
  { code: 'TM', dial: '+993', flag: '🇹🇲', name: 'Туркменистан' },
  { code: 'AZ', dial: '+994', flag: '🇦🇿', name: 'Азербайджан' },
  { code: 'AM', dial: '+374', flag: '🇦🇲', name: 'Армения' },
  { code: 'GE', dial: '+995', flag: '🇬🇪', name: 'Грузия' },
  { code: 'BY', dial: '+375', flag: '🇧🇾', name: 'Беларусь' },
  { code: 'UA', dial: '+380', flag: '🇺🇦', name: 'Украина' },
  { code: 'MD', dial: '+373', flag: '🇲🇩', name: 'Молдова' },

  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'ОАЭ' },
  { code: 'AT', dial: '+43',  flag: '🇦🇹', name: 'Австрия' },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Австралия' },
  { code: 'BE', dial: '+32',  flag: '🇧🇪', name: 'Бельгия' },
  { code: 'BG', dial: '+359', flag: '🇧🇬', name: 'Болгария' },
  { code: 'BR', dial: '+55',  flag: '🇧🇷', name: 'Бразилия' },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'Великобритания' },
  { code: 'HU', dial: '+36',  flag: '🇭🇺', name: 'Венгрия' },
  { code: 'VN', dial: '+84',  flag: '🇻🇳', name: 'Вьетнам' },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Германия' },
  { code: 'GR', dial: '+30',  flag: '🇬🇷', name: 'Греция' },
  { code: 'DK', dial: '+45',  flag: '🇩🇰', name: 'Дания' },
  { code: 'EG', dial: '+20',  flag: '🇪🇬', name: 'Египет' },
  { code: 'IL', dial: '+972', flag: '🇮🇱', name: 'Израиль' },
  { code: 'IN', dial: '+91',  flag: '🇮🇳', name: 'Индия' },
  { code: 'ID', dial: '+62',  flag: '🇮🇩', name: 'Индонезия' },
  { code: 'ES', dial: '+34',  flag: '🇪🇸', name: 'Испания' },
  { code: 'IT', dial: '+39',  flag: '🇮🇹', name: 'Италия' },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Канада' },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'Катар' },
  { code: 'CN', dial: '+86',  flag: '🇨🇳', name: 'Китай' },
  { code: 'KR', dial: '+82',  flag: '🇰🇷', name: 'Южная Корея' },
  { code: 'LV', dial: '+371', flag: '🇱🇻', name: 'Латвия' },
  { code: 'LT', dial: '+370', flag: '🇱🇹', name: 'Литва' },
  { code: 'MY', dial: '+60',  flag: '🇲🇾', name: 'Малайзия' },
  { code: 'MX', dial: '+52',  flag: '🇲🇽', name: 'Мексика' },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', name: 'Нидерланды' },
  { code: 'NO', dial: '+47',  flag: '🇳🇴', name: 'Норвегия' },
  { code: 'PL', dial: '+48',  flag: '🇵🇱', name: 'Польша' },
  { code: 'PT', dial: '+351', flag: '🇵🇹', name: 'Португалия' },
  { code: 'RO', dial: '+40',  flag: '🇷🇴', name: 'Румыния' },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Саудовская Аравия' },
  { code: 'SG', dial: '+65',  flag: '🇸🇬', name: 'Сингапур' },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'США' },
  { code: 'TH', dial: '+66',  flag: '🇹🇭', name: 'Таиланд' },
  { code: 'TR', dial: '+90',  flag: '🇹🇷', name: 'Турция' },
  { code: 'FI', dial: '+358', flag: '🇫🇮', name: 'Финляндия' },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'Франция' },
  { code: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Чехия' },
  { code: 'CH', dial: '+41',  flag: '🇨🇭', name: 'Швейцария' },
  { code: 'SE', dial: '+46',  flag: '🇸🇪', name: 'Швеция' },
  { code: 'JP', dial: '+81',  flag: '🇯🇵', name: 'Япония' },
];

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
