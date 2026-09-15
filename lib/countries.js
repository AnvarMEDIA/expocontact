/**
 * Countries used across the project.
 *
 * One list, so the phone field and the CRM cannot drift apart. `dial` is what
 * PhoneField puts in front of the number; `code` is what a project stores for
 * the client's country — a stable two-letter key, never the display name, so
 * renaming a country later does not orphan old records.
 */
export const COUNTRIES = [
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

export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));

/** "🇺🇿 Узбекистан" for a stored code, or an empty string when unset/unknown. */
export function countryLabel(code) {
  const c = COUNTRY_BY_CODE[code];
  return c ? `${c.flag} ${c.name}` : '';
}
