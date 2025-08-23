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
  Download,
  Wallet,
  Share2,
  Sparkles,
  Shield,
  Award,
  Coins,
  Calendar,
  User,
  Gift,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

export function SophisticatedMembershipCard() {
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMembershipData();
  }, []);

  const fetchMembershipData = async () => {
    try {
      const response = await fetch('/api/membership/qr-code');
      const data = await response.json();

      if (data.success) {
        setMembershipData(data.displayData);
        // Generate QR code image with higher quality
        const qrResponse = await fetch('/api/membership/qr-image');
        const qrData = await qrResponse.json();
        if (qrData.success) {
          setQrDataUrl(qrData.qrCodeDataURL);
        }
      } else {
        setError(data.error || 'Failed to load membership data');
      }
    } catch (err) {
      setError('Failed to load membership data');
    } finally {
      setLoading(false);
    }
  };

  const getPlanConfig = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
        return {
          icon: Star,
          gradient: 'from-blue-600 via-purple-600 to-blue-800',
          accentColor: 'text-blue-400',
          bgPattern: 'bg-gradient-to-br from-blue-50 to-purple-50',
          iconBg: 'bg-blue-100',
          tier: 'Premium Elite',
          perks: ['Priority Support', '2x Points', 'Free Extras']
        };
      case 'elite':
        return {
          icon: Crown,
          gradient: 'from-purple-600 via-pink-600 to-purple-800',
          accentColor: 'text-purple-400',
          bgPattern: 'bg-gradient-to-br from-purple-50 to-pink-50',
          iconBg: 'bg-purple-100',
          tier: 'Elite Platinum',
          perks: ['VIP Service', '3x Points', 'Concierge']
        };
      default:
        return {
          icon: Zap,
          gradient: 'from-gray-700 via-gray-800 to-black',
          accentColor: 'text-gray-400',
          bgPattern: 'bg-gradient-to-br from-gray-50 to-blue-50',
          iconBg: 'bg-gray-100',
          tier: 'Basic Member',
          perks: ['Standard Service', '1x Points', 'Email Support']
        };
    }
  };

  const handleCopyQR = async () => {
    if (membershipData?.qrCode) {
      await navigator.clipboard.writeText(membershipData.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToWallet = async () => {
    try {
      const response = await fetch('/api/wallet/add-to-wallet');
      const data = await response.json();
      if (data.success) {
        window.open(data.buttonData.url, '_blank');
      } else {
        alert('Failed to add to wallet: ' + data.error);
      }
    } catch (error) {
      alert('Failed to add to wallet. Please try again.');
    }
  };

  const handleDownloadCard = async () => {
    try {
      // Get the membership card element
      const cardElement = document.querySelector('.membership-card-container') as HTMLElement;
      if (!cardElement) {
        alert('Card not found for download');
        return;
      }

      // Use html2canvas to capture the card
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        width: cardElement.offsetWidth,
        height: cardElement.offsetHeight,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ekhaya-membership-card-${membershipData?.qrCode || 'card'}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Card download error:', error);
      alert('Failed to download card. Please try again.');
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch('/api/membership/qr-image?format=image');
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ekhaya-qr-code-${membershipData?.qrCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('QR download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <Card className="h-56">
          <CardContent className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !membershipData) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="text-center py-8">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Membership Not Found</h3>
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">
              You should have received a free Basic membership when you registered. 
              If you just signed up, please try refreshing the page.
            </p>
          </div>
          <Button onClick={fetchMembershipData} className="bg-red-600 hover:bg-red-700" size="sm">
            <Shield className="w-4 h-4 mr-2" />
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    );
  }

  const planConfig = getPlanConfig(membershipData.membershipPlan);
  const PlanIcon = planConfig.icon;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Main Membership Card */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="membership-card-container bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header Section */}
          <div className={`bg-gradient-to-r ${planConfig.gradient} px-6 py-4 relative`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <PlanIcon className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">EKHAYA CAR WASH</h3>
                  <p className="text-white/90 text-sm">Digital Membership</p>
                </div>
              </div>
              <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {membershipData.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
          </div>

          {/* Member ID Section */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="text-xs text-gray-600 mb-1">Member ID</div>
            <div className="font-mono text-sm text-gray-800 bg-white px-3 py-2 rounded border">
              {membershipData.qrCode}
            </div>
          </div>

          {/* Member Info */}
          <div className="px-6 py-4">
            <h4 className="font-bold text-2xl text-gray-900 mb-2">{membershipData.memberName}</h4>
            <div className="inline-block">
              <Badge variant="outline" className="text-sm px-3 py-1 border-2 border-blue-200 text-blue-700">
                {planConfig.tier}
              </Badge>
            </div>
          </div>

          {/* Stats Section */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-orange-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{membershipData.discountRate}</div>
                <div className="text-xs text-orange-600 font-medium">DISCOUNT</div>
              </div>
              <div className="border-2 border-purple-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{membershipData.loyaltyPoints}</div>
                <div className="text-xs text-purple-600 font-medium">POINTS</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="px-6 pb-4 space-y-2">
            <div className="bg-gray-50 px-3 py-2 rounded border text-sm text-gray-700">
              <span className="text-gray-500">Phone:</span> +27776026788
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded border text-sm text-gray-700">
              <span className="text-gray-500">Email:</span> {membershipData.memberName?.toLowerCase().replace(' ', '')}@gmail.com
            </div>
          </div>

          {/* Validity Section */}
          <div className="px-6 pb-4">
            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-3">
              <div className="text-teal-700 font-medium text-sm">✓ Valid Until</div>
              <div className="text-teal-800 font-bold">Aug 23, 2026</div>
              <div className="text-teal-600 text-xs">Member since {formatDate(new Date(membershipData.memberSince))}</div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="px-6 pb-6">
            <div className="text-center">
              {qrDataUrl && (
                <div className="inline-block bg-white p-3 rounded-lg border-2 border-gray-200">
                  <img src={qrDataUrl} alt="QR Code" className="w-24 h-24 mx-auto" />
                </div>
              )}
              <div className="mt-2 font-mono text-xs text-gray-500">{membershipData.qrCode}</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleAddToWallet}
              className="bg-black hover:bg-gray-800 text-white"
              size="sm"
            >
              <Smartphone className="w-4 h-4 mr-1" />
              <span className="text-xs">Wallet</span>
            </Button>
            <Button
              onClick={handleCopyQR}
              variant="outline"
              size="sm"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
            <Button
              onClick={handleDownloadQR}
              variant="outline"
              size="sm"
            >
              <QrCode className="w-4 h-4 mr-1" />
              <span className="text-xs">QR</span>
            </Button>
          </div>
          <Button
            onClick={handleDownloadCard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Full Card as JPG
          </Button>
        </div>
      </div>
    </div>
  );
}