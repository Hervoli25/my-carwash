'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { LanguageCode, defaultLanguage } from './languages';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const { data: session } = useSession();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(initialLanguage || defaultLanguage);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for current language
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        console.log(`Loading translations for: ${currentLanguage}`);
        const response = await import(`./translations/${currentLanguage}.json`);
        setTranslations(response.default);
        console.log(`Successfully loaded translations for: ${currentLanguage}`);
      } catch (error) {
        console.error(`Failed to load translations for ${currentLanguage}:`, error);
        // Fallback to English
        if (currentLanguage !== 'en') {
          try {
            console.log('Falling back to English translations');
            const fallback = await import('./translations/en.json');
            setTranslations(fallback.default);
            console.log('Successfully loaded English fallback');
          } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError);
            // Set empty translations as last resort
            setTranslations({});
          }
        } else {
          // If English itself fails, set empty translations
          setTranslations({});
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Save language preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', currentLanguage);
    }
  }, [currentLanguage]);

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialLanguage) {
      const saved = localStorage.getItem('preferred-language') as LanguageCode;
      if (saved && saved !== currentLanguage) {
        setCurrentLanguage(saved);
      }
    }
  }, [initialLanguage]);

  const setLanguage = async (lang: LanguageCode) => {
    setCurrentLanguage(lang);

    // Update user preference in database if user is logged in
    if (typeof window !== 'undefined') {
      try {
        // Check if user is authenticated by checking for session
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          if (session?.user) {
            // User is logged in, save preference to database
            await fetch('/api/user/language', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language: lang }),
            });
          }
        }
      } catch (error) {
        // Silently fail - user might not be logged in or network error
        console.debug('Language preference not saved to database:', error);
      }
    }
  };

  // Translation function with nested key support
  const t = (key: string, params?: Record<string, string>): string => {
    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log('Translation request:', { key, currentLanguage, hasTranslations: Object.keys(translations).length > 0 });
    }

    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        console.log('Translation missing for key:', key);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.log('Translation value is not string for key:', key, 'value:', value);
      return key;
    }
    
    // Replace parameters in translation
    if (params) {
      return Object.entries(params).reduce((str, [param, replacement]) => {
        return str.replace(new RegExp(`{{${param}}}`, 'g'), replacement);
      }, value);
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
