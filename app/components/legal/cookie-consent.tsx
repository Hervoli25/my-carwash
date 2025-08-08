
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'prestige-cookie-consent';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if consent has been given
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...allAccepted,
      timestamp: Date.now()
    }));
    
    setShowBanner(false);
    // Initialize tracking scripts here
  };

  const handleRejectAll = () => {
    const minimalCookies = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...minimalCookies,
      timestamp: Date.now()
    }));
    
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...preferences,
      timestamp: Date.now()
    }));
    
    setShowBanner(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Necessary cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto max-w-7xl p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">We use cookies to enhance your experience</h3>
              <p className="text-sm text-gray-600">
                We use cookies and similar technologies to provide the best experience on our website. 
                Some are necessary for basic functionality, while others help us improve and personalize your experience.{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                  Learn more in our Privacy Policy
                </Link>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectAll}>
                Reject All
              </Button>
              <Button size="sm" onClick={handleAcceptAll} className="bg-blue-600 hover:bg-blue-700">
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Cookie Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Necessary Cookies (Required)</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    These cookies are essential for the website to function properly and cannot be disabled.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Always active</span>
                    <div className="w-10 h-5 bg-blue-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Functional Cookies</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Optional</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={() => handlePreferenceChange('functional')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full ${preferences.functional ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences.functional ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    These cookies help us understand how visitors interact with our website by collecting anonymous information.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Optional</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => handlePreferenceChange('analytics')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full ${preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences.analytics ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    These cookies are used to deliver personalized advertisements and marketing communications.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Optional</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={() => handlePreferenceChange('marketing')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full ${preferences.marketing ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences.marketing ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePreferences} className="bg-blue-600 hover:bg-blue-700">
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
