/**
 * Translation Helper Utility
 * Provides helper functions for handling translations consistently across the application
 */

import { useLanguage } from './use-language';

/**
 * Hook for handling feature translation data
 * @param t - Translation function
 * @returns Array of translated feature objects
 */
export function useFeatureTranslations(t: (key: string) => string) {
  return [
    {
      id: 'real-time-tracking',
      title: t('features.realTimeTracking.title'),
      description: t('features.realTimeTracking.description'),
      badge: t('features.realTimeTracking.badge'),
      features: t('features.realTimeTracking.features') as any as string[]
    },
    {
      id: 'ai-damage-detection', 
      title: t('features.aiDamageDetection.title'),
      description: t('features.aiDamageDetection.description'),
      badge: t('features.aiDamageDetection.badge'),
      features: t('features.aiDamageDetection.features') as any as string[]
    },
    {
      id: 'weather-scheduling',
      title: t('features.weatherScheduling.title'), 
      description: t('features.weatherScheduling.description'),
      badge: t('features.weatherScheduling.badge'),
      features: t('features.weatherScheduling.features') as any as string[]
    },
    {
      id: 'gamification',
      title: t('features.gamification.title'),
      description: t('features.gamification.description'), 
      badge: t('features.gamification.badge'),
      features: t('features.gamification.features') as any as string[]
    },
    {
      id: 'voice-assistant',
      title: t('features.voiceAssistant.title'),
      description: t('features.voiceAssistant.description'),
      badge: t('features.voiceAssistant.badge'),
      features: t('features.voiceAssistant.features') as any as string[]
    },
    {
      id: 'eco-impact',
      title: t('features.ecoImpact.title'),
      description: t('features.ecoImpact.description'),
      badge: t('features.ecoImpact.badge'), 
      features: t('features.ecoImpact.features') as any as string[]
    }
  ];
}

/**
 * Service translations helper
 * @param t - Translation function  
 * @returns Array of translated service objects
 */
export function useServiceTranslations(t: (key: string) => string) {
  return [
    {
      id: 'express',
      name: t('services.express.name'),
      description: t('services.express.description'),
      features: t('services.express.features') as any as string[]
    },
    {
      id: 'premium', 
      name: t('services.premium.name'),
      description: t('services.premium.description'),
      features: t('services.premium.features') as any as string[]
    },
    {
      id: 'deluxe',
      name: t('services.deluxe.name'),
      description: t('services.deluxe.description'), 
      features: t('services.deluxe.features') as any as string[]
    },
    {
      id: 'executive',
      name: t('services.executive.name'),
      description: t('services.executive.description'),
      features: t('services.executive.features') as any as string[]
    }
  ];
}

/**
 * Navigation translations helper
 * @param t - Translation function
 * @returns Array of translated navigation items
 */
export function useNavigationTranslations(t: (key: string) => string) {
  return [
    { name: t('navigation.home'), href: '#home', scrollTo: 'home' },
    { name: t('navigation.services'), href: '#services', scrollTo: 'services' },
    { name: t('navigation.features'), href: '/features' },
    { name: t('navigation.book'), href: '/book' },
  ];
}

/**
 * Status translations helper
 * @param t - Translation function
 * @returns Object with status translations
 */
export function useStatusTranslations(t: (key: string) => string) {
  return {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'), 
    inProgress: t('status.inProgress'),
    completed: t('status.completed'),
    cancelled: t('status.cancelled'),
    rescheduled: t('status.rescheduled')
  };
}

/**
 * Time translations helper 
 * @param t - Translation function
 * @returns Object with time-related translations
 */
export function useTimeTranslations(t: (key: string) => string) {
  return {
    minutes: t('time.minutes'),
    hours: t('time.hours'),
    days: t('time.days'),
    weeks: t('time.weeks'), 
    months: t('time.months'),
    years: t('time.years'),
    today: t('time.today'),
    tomorrow: t('time.tomorrow'),
    yesterday: t('time.yesterday'),
    thisWeek: t('time.thisWeek'),
    nextWeek: t('time.nextWeek'),
    thisMonth: t('time.thisMonth'),
    nextMonth: t('time.nextMonth')
  };
}

/**
 * Common action translations helper
 * @param t - Translation function  
 * @returns Object with common action translations
 */
export function useCommonTranslations(t: (key: string) => string) {
  return {
    loading: t('common.loading'),
    error: t('common.error'), 
    success: t('common.success'),
    cancel: t('common.cancel'),
    confirm: t('common.confirm'),
    save: t('common.save'),
    edit: t('common.edit'),
    delete: t('common.delete'),
    back: t('common.back'),
    next: t('common.next'),
    previous: t('common.previous'),
    close: t('common.close'),
    yes: t('common.yes'),
    no: t('common.no'),
    submit: t('common.submit'),
    continue: t('common.continue'),
    finish: t('common.finish'),
    reset: t('common.reset'),
    select: t('common.select'),
    view: t('common.view'),
    search: t('common.search')
  };
}

/**
 * Format time with appropriate unit
 * @param value - Time value
 * @param unit - Time unit key for translation
 * @param t - Translation function
 * @returns Formatted time string
 */
export function formatTimeWithTranslation(
  value: number, 
  unit: keyof ReturnType<typeof useTimeTranslations>,
  t: (key: string) => string
): string {
  const timeTranslations = useTimeTranslations(t);
  return `${value} ${timeTranslations[unit]}`;
}

/**
 * Get error message with translation
 * @param errorKey - Error key for translation
 * @param t - Translation function
 * @param params - Optional parameters for string interpolation
 * @returns Translated error message
 */
export function getErrorMessage(
  errorKey: string,
  t: (key: string, params?: Record<string, string>) => string,
  params?: Record<string, string>
): string {
  return t(`errors.${errorKey}`, params);
}