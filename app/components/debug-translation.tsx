'use client';

import { useLanguage } from '@/lib/i18n/use-language';

export function DebugTranslation() {
  const { currentLanguage, t, isLoading } = useLanguage();

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
      <div>Current Language: {currentLanguage}</div>
      <div>Is Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Test Translation: "{t('navigation.home')}"</div>
      <div>Test French: "{t('navigation.services')}"</div>
    </div>
  );
}