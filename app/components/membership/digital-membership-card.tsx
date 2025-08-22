'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Star, 
  Crown, 
  Zap,
  Calendar,
  User,
  Mail,
  Phone,
  Download,
  Share2,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

interface MembershipData {
  qrCode: string;
  memberName: string;
  membershipPlan: string;
  memberSince: string;
  loyaltyPoints: number;
  discountRate: string;
  isActive: boolean;
  validUntil: string;
}

interface DigitalMembershipCardProps {
  className?: string;
}

export function DigitalMembershipCard({ className = '' }: DigitalMembershipCardProps) {
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembershipData();
  }, []);

  const fetchMembershipData = async () => {
    try {
      const response = await fetch('/api/membership/qr-code');
      const data = await response.json();

      if (data.success) {
        setMembershipData(data.displayData);
        // Generate QR code using a QR code library
        await generateQRCode(data.qrData);
      } else {
        setError(data.error || 'Failed to load membership data');
      }
    } catch (err) {
      setError('Failed to load membership data');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (qrData: string) => {
    try {
      // Using QR Server API for demo - in production, use a proper QR library
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
      setQrDataUrl(qrUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return Star;
      case 'elite':
        return Crown;
      default:
        return Zap;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'from-blue-500 to-blue-600';
      case 'elite':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleAddToWallet = async () => {
    if (!membershipData) return;

    // For demonstration - implement actual wallet integration
    const walletData = {
      name: 'Ekhaya Car Wash Membership',
      member: membershipData.memberName,
      plan: membershipData.membershipPlan,
      qrCode: membershipData.qrCode
    };

    // This would integrate with Google Wallet or Apple Wallet APIs
    console.log('Adding to wallet:', walletData);
    alert('Wallet integration will be implemented here');
  };

  const handleDownload = () => {
    // Create downloadable membership card
    const cardElement = document.getElementById('membership-card');
    if (cardElement) {
      // Use html2canvas or similar library to convert to image
      console.log('Downloading membership card');
      alert('Download functionality will be implemented');
    }
  };

  const handleShare = async () => {
    if (navigator.share && membershipData) {
      try {
        await navigator.share({
          title: 'My Ekhaya Car Wash Membership',
          text: `I'm a ${membershipData.membershipPlan} member at Ekhaya Car Wash! Join me and save on car washes.`,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !membershipData) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600">{error || 'No membership found'}</p>
        <Button onClick={fetchMembershipData} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  const PlanIcon = getPlanIcon(membershipData.membershipPlan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`max-w-md mx-auto ${className}`}
    >
      <Card 
        id="membership-card" 
        className={`relative overflow-hidden shadow-xl bg-gradient-to-br ${getPlanColor(membershipData.membershipPlan)} text-white`}
      >
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <PlanIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ekhaya Car Wash</h3>
                <p className="text-white/80 text-sm">Digital Membership</p>
              </div>
            </div>
            <Badge 
              variant={membershipData.isActive ? "default" : "secondary"}
              className={membershipData.isActive ? "bg-green-500" : "bg-red-500"}
            >
              {membershipData.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Member Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-xl">{membershipData.memberName}</h4>
            <p className="text-white/80 font-medium">{membershipData.membershipPlan} Member</p>
            <div className="flex items-center space-x-4 text-sm text-white/70">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{membershipData.loyaltyPoints} pts</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">{membershipData.discountRate}</span>
                <span>discount</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg text-center">
            {qrDataUrl ? (
              <div className="space-y-2">
                <img 
                  src={qrDataUrl} 
                  alt="Membership QR Code" 
                  className="mx-auto rounded"
                />
                <p className="text-gray-600 text-xs font-mono">
                  {membershipData.qrCode}
                </p>
                <p className="text-gray-500 text-xs">
                  Show this QR code at checkout
                </p>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Member Details */}
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-center justify-between">
              <span>Member since:</span>
              <span className="font-medium">{formatDate(new Date(membershipData.memberSince))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Valid until:</span>
              <span className="font-medium">
                {membershipData.validUntil ? formatDate(new Date(membershipData.validUntil)) : 'Lifetime'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleAddToWallet}
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Wallet className="w-4 h-4 mr-1" />
              Add to Wallet
            </Button>
            <Button
              onClick={handleDownload}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleShare}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}