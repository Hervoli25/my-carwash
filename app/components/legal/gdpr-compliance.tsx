
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Download, Trash2, Edit, Eye, UserCheck } from 'lucide-react';

const GDPR_CONSENT_KEY = 'prestige-gdpr-consent';

interface GDPRConsent {
  marketing: boolean;
  analytics: boolean;
  processing: boolean;
  timestamp: number;
}

interface GDPRComplianceProps {
  onConsentChange?: (consent: GDPRConsent) => void;
  showManagement?: boolean;
}

export function GDPRCompliance({ onConsentChange, showManagement = false }: GDPRComplianceProps) {
  const [consent, setConsent] = useState<GDPRConsent>({
    marketing: false,
    analytics: false,
    processing: true,
    timestamp: Date.now()
  });
  const [showBanner, setShowBanner] = useState(false);
  const [showManager, setShowManager] = useState(showManagement);

  useEffect(() => {
    // Check if GDPR consent has been given
    const savedConsent = localStorage.getItem(GDPR_CONSENT_KEY);
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      const parsed = JSON.parse(savedConsent);
      setConsent(parsed);
    }
  }, []);

  const saveConsent = (newConsent: GDPRConsent) => {
    const consentData = {
      ...newConsent,
      timestamp: Date.now()
    };
    
    localStorage.setItem(GDPR_CONSENT_KEY, JSON.stringify(consentData));
    setConsent(consentData);
    setShowBanner(false);
    
    if (onConsentChange) {
      onConsentChange(consentData);
    }
  };

  const handleConsentChange = (type: keyof GDPRConsent, value: boolean) => {
    if (type === 'timestamp') return;
    
    const newConsent = {
      ...consent,
      [type]: value
    };
    setConsent(newConsent);
  };

  const handleAcceptAll = () => {
    saveConsent({
      marketing: true,
      analytics: true,
      processing: true,
      timestamp: Date.now()
    });
  };

  const handleAcceptEssential = () => {
    saveConsent({
      marketing: false,
      analytics: false,
      processing: true,
      timestamp: Date.now()
    });
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
    setShowManager(false);
  };

  const handleDataRequest = (type: 'access' | 'download' | 'delete') => {
    // In a real application, this would make an API call
    const email = 'privacy@prestigecarwash.co.za';
    const subject = `GDPR ${type.charAt(0).toUpperCase() + type.slice(1)} Request`;
    const body = `I would like to request ${type} of my personal data under GDPR Article ${
      type === 'access' ? '15' : type === 'download' ? '20' : '17'
    }.`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (showBanner && !showManager) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto max-w-7xl p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">GDPR & POPIA Compliance</h3>
              </div>
              <p className="text-sm text-gray-600">
                We respect your privacy rights under GDPR and South Africa's POPIA. We need your consent 
                to process your personal data for our car wash services. License plate information is 
                mandatory for vehicle tracking and service delivery.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowManager(true)}
              >
                Customize
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAcceptEssential}
              >
                Essential Only
              </Button>
              <Button 
                size="sm" 
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showManager) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold">Privacy & Data Management</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManager(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Consent Management */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Consent Management</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Essential Data Processing</h4>
                      <p className="text-sm text-gray-600">
                        Required for service delivery, bookings, and legal compliance. 
                        License plate mandatory for vehicle tracking.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">ON</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Analytics & Performance</h4>
                      <p className="text-sm text-gray-600">
                        Help us improve our services by analyzing website usage and performance.
                      </p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent.analytics}
                          onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full ${consent.analytics ? 'bg-blue-600' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                            consent.analytics ? 'translate-x-5' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Marketing Communications</h4>
                      <p className="text-sm text-gray-600">
                        Receive promotional offers, service updates, and membership rewards information.
                      </p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent.marketing}
                          onChange={(e) => handleConsentChange('marketing', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full ${consent.marketing ? 'bg-blue-600' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                            consent.marketing ? 'translate-x-5' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* GDPR Rights */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Your Privacy Rights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDataRequest('access')}
                    className="flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Access My Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDataRequest('download')}
                    className="flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDataRequest('delete')}
                    className="flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-blue-900">Data Protection Contact</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING</strong></p>
                  <p>30 Lower Piers Road, Wynberg, Cape Town, South Africa</p>
                  <p>Phone: +27 78 613 2969</p>
                  <p>Privacy Email: privacy@prestigecarwash.co.za</p>
                  <p className="mt-2 text-xs">
                    For complaints: Information Regulator of South Africa
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowManager(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSavePreferences}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quick access widget for logged-in users
  if (showManagement) {
    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <UserCheck className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-medium">Privacy Controls</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManager(true)}
            className="text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" />
            Manage
          </Button>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>✓ Essential processing: Active</p>
          <p>{consent.analytics ? '✓' : '✗'} Analytics: {consent.analytics ? 'Enabled' : 'Disabled'}</p>
          <p>{consent.marketing ? '✓' : '✗'} Marketing: {consent.marketing ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>
    );
  }

  return null;
}
