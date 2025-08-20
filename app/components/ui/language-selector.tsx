'use client';

import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { languages, type LanguageCode } from '@/lib/i18n/languages';
import { useLanguage } from '@/lib/i18n/use-language';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'mobile';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Select language"
        >
          <span className="text-lg">{languages[currentLanguage].flag}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as LanguageCode)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                    currentLanguage === code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`w-full ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <span>Language / Taal / Langue</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{languages[currentLanguage].flag}</span>
            <span className="text-sm text-gray-500">{languages[currentLanguage].nativeName}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {isOpen && (
          <div className="bg-gray-50 border-b border-gray-100">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as LanguageCode)}
                className={`w-full text-left px-8 py-3 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                  currentLanguage === code ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-base">{languages[currentLanguage].flag}</span>
        <span className="hidden sm:inline">{languages[currentLanguage].nativeName}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-1">
              Select Language
            </div>
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as LanguageCode)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                  currentLanguage === code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
                {currentLanguage === code && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
