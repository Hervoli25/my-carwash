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
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'benefits' | 'stats'>('card');

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

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/membership/qr-image?format=image');
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ekhaya-membership-${membershipData?.qrCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <Card className="h-80">
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
    <div className="w-full">
      {/* Main Membership Card */}
      <div className="relative perspective-1000">
        <motion.div
          className="relative w-full h-80 preserve-3d cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of Card */}
          <div className={`absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br ${planConfig.gradient} text-white shadow-2xl overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 right-8 w-24 h-24 border border-white/20 rounded-full"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 border border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
            </div>

            {/* Card Content */}
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <PlanIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Ekhaya Car Wash</h3>
                    <p className="text-white/80 text-xs">Premium Services</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30 text-xs">
                  {membershipData.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>

              {/* Member Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-2xl mb-1">{membershipData.memberName}</h4>
                  <p className="text-white/80 text-sm font-medium">{planConfig.tier}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-300" />
                    <span className="font-semibold">{membershipData.loyaltyPoints}</span>
                    <span className="text-white/70 text-sm">pts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span className="font-semibold">{membershipData.discountRate}</span>
                    <span className="text-white/70 text-sm">off</span>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex items-end justify-between">
                  <div className="text-xs text-white/70">
                    <p>Member since: {formatDate(new Date(membershipData.memberSince))}</p>
                    <p className="font-mono mt-1 text-xs">{membershipData.qrCode}</p>
                  </div>
                  {qrDataUrl && (
                    <div className="bg-white p-1 rounded">
                      <img src={qrDataUrl} alt="QR Code" className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chip Icon */}
            <div className="absolute top-6 right-6">
              <div className="w-8 h-6 bg-white/20 rounded border border-white/30 backdrop-blur-sm"></div>
            </div>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 backface-hidden rounded-2xl bg-gray-900 text-white shadow-2xl overflow-hidden transform rotateY-180">
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-4">Membership Benefits</h3>
              
              {/* Benefits */}
              <div className="flex-1 space-y-3 mb-4">
                {planConfig.perks.map((perk, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 bg-white/10 rounded-lg p-2"
                  >
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{perk}</span>
                  </motion.div>
                ))}
              </div>

              {/* QR Instructions */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Show at Checkout</h4>
                    <p className="text-xs text-gray-300">
                      Present QR code for discount
                    </p>
                    <button
                      onClick={handleCopyQR}
                      className="mt-1 flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  {qrDataUrl && (
                    <div className="bg-white p-1 rounded ml-2">
                      <img src={qrDataUrl} alt="QR Code" className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-2">
                Tap card to flip
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <Button
          onClick={handleAddToWallet}
          className="bg-black hover:bg-gray-800 text-white"
          size="sm"
        >
          <Smartphone className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Add to Wallet</span>
          <span className="sm:hidden">Wallet</span>
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
        >
          <Download className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Download</span>
          <span className="sm:hidden">Save</span>
        </Button>
        <Button
          onClick={() => window.open('/dashboard/membership', '_blank')}
          variant="outline"
          size="sm"
        >
          <QrCode className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Full View</span>
          <span className="sm:hidden">View</span>
        </Button>
      </div>
    </div>
  );
}