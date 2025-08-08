
"use client";

import React from 'react';
import { AlertTriangle, Shield, FileText, Scale, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

interface LegalDisclaimerProps {
  type?: 'general' | 'booking' | 'payment' | 'membership';
  compact?: boolean;
}

export function LegalDisclaimer({ type = 'general', compact = false }: LegalDisclaimerProps) {
  const getDisclaimerContent = () => {
    switch (type) {
      case 'booking':
        return {
          title: 'Service Booking Disclaimer',
          content: [
            'Service times are estimates and may vary based on vehicle condition and queue length.',
            'Pre-existing vehicle damage should be reported before service begins.',
            'We are not liable for items left in vehicles or pre-existing mechanical issues.',
            'License plate information is mandatory for vehicle tracking and service history.',
          ]
        };
      
      case 'payment':
        return {
          title: 'Payment & Liability Disclaimer',
          content: [
            'All payments are processed securely through certified payment processors.',
            'Our liability is limited to the cost of the service provided.',
            'Claims must be reported within 24 hours of service completion.',
            'We maintain comprehensive business insurance for our operations.',
          ]
        };
      
      case 'membership':
        return {
          title: 'Membership Terms Disclaimer',
          content: [
            'Membership benefits are subject to availability and terms of service.',
            'Membership fees are non-refundable except as required by law.',
            'We reserve the right to modify membership benefits with 30 days notice.',
            'Points and rewards expire according to membership tier policies.',
          ]
        };
      
      default:
        return {
          title: 'General Legal Disclaimer',
          content: [
            'Services provided subject to terms and conditions and availability.',
            'We comply with GDPR and South Africa\'s POPIA data protection regulations.',
            'Customer information is handled according to our Privacy Policy.',
            'This business is operated in accordance with South African laws.',
          ]
        };
    }
  };

  const disclaimer = getDisclaimerContent();

  if (compact) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-4">
        <div className="flex items-start">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">{disclaimer.title}</p>
            <p className="text-yellow-700">
              {disclaimer.content[0]}{' '}
              <Link href="/terms-of-service" className="underline hover:no-underline">
                View full terms
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 my-6">
      <div className="flex items-center mb-4">
        <Scale className="w-6 h-6 text-gray-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">{disclaimer.title}</h3>
      </div>

      <div className="space-y-3 mb-4">
        {disclaimer.content.map((item, index) => (
          <div key={index} className="flex items-start">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-700">{item}</p>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <FileText className="w-4 h-4 text-gray-500 mr-2" />
            <Link href="/terms-of-service" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-gray-500 mr-2" />
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </div>
          <div className="flex items-center">
            <FileText className="w-4 h-4 text-gray-500 mr-2" />
            <Link href="/cookie-policy" className="text-blue-600 hover:underline">
              Cookie Policy
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
          <div className="flex items-center mb-2">
            <Phone className="w-3 h-3 mr-1" />
            <span className="font-medium">Contact Information:</span>
          </div>
          <div className="space-y-1">
            <p>PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING</p>
            <p>30 Lower Piers Road, Wynberg, Cape Town, South Africa</p>
            <p>Phone: +27 78 613 2969 | Email: legal@prestigecarwash.co.za</p>
          </div>
        </div>
      </div>
    </div>
  );
}
