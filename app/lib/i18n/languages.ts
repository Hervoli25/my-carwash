export const languages = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    code: 'en',
    dir: 'ltr'
  },
  af: {
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
    code: 'af',
    dir: 'ltr'
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    code: 'fr',
    dir: 'ltr'
  },
  zu: {
    name: 'Zulu',
    nativeName: 'isiZulu',
    flag: '🇿🇦',
    code: 'zu',
    dir: 'ltr'
  },
  xh: {
    name: 'Xhosa',
    nativeName: 'isiXhosa',
    flag: '🇿🇦',
    code: 'xh',
    dir: 'ltr'
  },
  st: {
    name: 'Sotho',
    nativeName: 'Sesotho',
    flag: '🇿🇦',
    code: 'st',
    dir: 'ltr'
  }
} as const;

export type LanguageCode = keyof typeof languages;
export const defaultLanguage: LanguageCode = 'en';
export const supportedLanguages = Object.keys(languages) as LanguageCode[];
