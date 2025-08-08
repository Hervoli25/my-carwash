
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Users, Lock, FileText, Phone } from 'lucide-react';
import Link from 'next/link';

interface DataProcessingNoticeProps {
  onAccept?: () => void;
  onDecline?: () => void;
  showButtons?: boolean;
  compact?: boolean;
}

export function DataProcessingNotice({ 
  onAccept, 
  onDecline, 
  showButtons = false, 
  compact = false 
}: DataProcessingNoticeProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  if (compact && !isExpanded) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-sm font-medium text-blue-800">
              Data Protection Notice - We handle your personal information securely
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(true)}
            className="text-blue-600"
          >
            Read More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 my-6">
      <div className="flex items-center mb-4">
        <Shield className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">
          Data Processing and Privacy Notice
        </h3>
      </div>

      <div className="space-y-4 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <Eye className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">What We Collect</h4>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Name, email, phone number</li>
                  <li>• Vehicle details & license plate</li>
                  <li>• Service history & preferences</li>
                  <li>• Payment information (securely)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">How We Use It</h4>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Provide car wash services</li>
                  <li>• Send booking confirmations</li>
                  <li>• Manage loyalty rewards</li>
                  <li>• Improve our services</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <Lock className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Your Rights</h4>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Access your personal data</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Request data deletion</li>
                  <li>• Withdraw consent anytime</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start">
              <FileText className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Legal Basis</h4>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Contract performance</li>
                  <li>• Legitimate business interest</li>
                  <li>• Your explicit consent</li>
                  <li>• Legal compliance (POPIA/GDPR)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-3 mt-4">
          <div className="flex items-center text-xs text-gray-600">
            <Phone className="w-3 h-3 mr-1" />
            <span className="font-medium">Contact:</span>
            <span className="ml-1">PRESTIGE Car Wash, 30 Lower Piers Road, Wynberg, Cape Town | +27 78 613 2969</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link href="/privacy-policy" className="text-blue-600 hover:underline">
            Full Privacy Policy
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/terms-of-service" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/cookie-policy" className="text-blue-600 hover:underline">
            Cookie Policy
          </Link>
        </div>

        {showButtons && (
          <div className="flex gap-3 pt-3 border-t">
            <Button 
              size="sm" 
              onClick={onAccept}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Accept & Continue
            </Button>
            {onDecline && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDecline}
              >
                Decline
              </Button>
            )}
          </div>
        )}

        {compact && (
          <div className="flex justify-end pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(false)}
              className="text-gray-500"
            >
              Collapse
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
