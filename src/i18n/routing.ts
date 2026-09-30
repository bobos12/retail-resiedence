import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar', 'fr', 'it', 'es', 'zh', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export const dirFor = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr');

/** Each language named in itself, for the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  zh: '中文',
  ko: '한국어',
};

/** Open Graph locale codes. */
export const ogLocales: Record<Locale, string> = {
  en: 'en_GB',
  ar: 'ar_SA',
  fr: 'fr_FR',
  it: 'it_IT',
  es: 'es_ES',
  zh: 'zh_CN',
  ko: 'ko_KR',
};
