
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Gift,
  Star,
  Crown,
  Zap,
  Calendar,
  Car,
  Award,
  Coins,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MembershipData {
  level: string;
  points: number;
  nextLevelPoints: number;
  monthlyWashes: number;
  freebiesEarned: number;
  freebiesAvailable: number;
  memberSince: string;
  totalSpent: number;
  lastVisit: string;
}

const membershipTiers = {
  bronze: { 
    name: 'Bronze', 
    color: 'from-amber-600 to-amber-800', 
    icon: Star,
    pointsRequired: 0,
    benefits: ['5% discount', '1 freebie per 10 washes', 'Basic support'],
    monthlyFee: 450  // R450 per month
  },
  silver: { 
    name: 'Silver', 
    color: 'from-gray-400 to-gray-600', 
    icon: Award,
    pointsRequired: 500,
    benefits: ['10% discount', '1 freebie per 8 washes', 'Priority booking', 'SMS notifications'],
    monthlyFee: 750  // R750 per month
  },
  gold: { 
    name: 'Gold', 
    color: 'from-yellow-400 to-yellow-600', 
    icon: Trophy,
    pointsRequired: 1500,
    benefits: ['15% discount', '1 freebie per 5 washes', 'Fast track service', '24/7 support', 'Quarterly detailing'],
    monthlyFee: 1350  // R1350 per month
  },
  platinum: { 
    name: 'Platinum', 
    color: 'from-purple-500 to-purple-700', 
    icon: Crown,
    pointsRequired: 3000,
    benefits: ['20% discount', '1 freebie per 3 washes', 'Concierge service', 'Monthly full detail', 'Exclusive events'],
    monthlyFee: 2250  // R2250 per month
  }
};

const rewards = [
  { id: 1, name: 'Free Express Wash', points: 100, type: 'service', available: true },
  { id: 2, name: 'Premium Wax Upgrade', points: 250, type: 'upgrade', available: true },
  { id: 3, name: 'Interior Deep Clean', points: 400, type: 'service', available: true },
  { id: 4, name: 'Full Detailing Package', points: 800, type: 'premium', available: true },
  { id: 5, name: 'Monthly VIP Pass', points: 1200, type: 'membership', available: false },
];

export function RewardsSystem() {
  const [memberData, setMemberData] = useState<MembershipData>({
    level: 'gold',
    points: 1850,
    nextLevelPoints: 3000,
    monthlyWashes: 8,
    freebiesEarned: 3,
    freebiesAvailable: 2,
    memberSince: '2023-01-15',
    totalSpent: 37500.00, // R37,500 total spent
    lastVisit: '2024-08-01'
  });

  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const currentTier = membershipTiers[memberData.level as keyof typeof membershipTiers];
  const progress = ((memberData.points - currentTier.pointsRequired) / (memberData.nextLevelPoints - currentTier.pointsRequired)) * 100;

  const claimReward = (rewardId: number, pointsCost: number) => {
    if (memberData.points >= pointsCost) {
      setMemberData(prev => ({
        ...prev,
        points: prev.points - pointsCost,
        freebiesAvailable: prev.freebiesAvailable + 1
      }));
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    }
  };

  const upgradeToNextTier = () => {
    // Logic for tier upgrade
    console.log('Upgrading membership tier...');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Reward Animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Reward Claimed! 🎉</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          VIP Rewards & Membership
        </h1>
        <p className="text-gray-600">Earn points, unlock benefits, and enjoy exclusive perks</p>
      </motion.div>

      {/* Current Status Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className={`bg-gradient-to-br ${currentTier.color} text-white`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <currentTier.icon className="w-8 h-8" />
                <Badge className="bg-white/20 text-white">
                  Current Tier
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-bold">{currentTier.name}</h3>
              <p className="text-white/80 text-sm">R{currentTier.monthlyFee}/month</p>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Coins className="w-8 h-8 text-yellow-500" />
              <Badge variant="outline">Points</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold text-yellow-600">{memberData.points.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Available to redeem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Gift className="w-8 h-8 text-green-500" />
              <Badge variant="outline">Freebies</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold text-green-600">{memberData.freebiesAvailable}</h3>
            <p className="text-gray-600 text-sm">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Car className="w-8 h-8 text-blue-500" />
              <Badge variant="outline">This Month</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold text-blue-600">{memberData.monthlyWashes}</h3>
            <p className="text-gray-600 text-sm">Washes completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span>Progress to Platinum</span>
            </CardTitle>
            <CardDescription>
              {memberData.nextLevelPoints - memberData.points} more points needed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{memberData.points} points</span>
                <span>{memberData.nextLevelPoints} points</span>
              </div>
              <Button 
                className="w-full" 
                onClick={upgradeToNextTier}
                disabled={memberData.points < memberData.nextLevelPoints}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Platinum
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rewards and Benefits Tabs */}
      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
          <TabsTrigger value="benefits">Current Benefits</TabsTrigger>
          <TabsTrigger value="history">Activity History</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`${!reward.available ? 'opacity-60' : ''} ${selectedReward === reward.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Gift className={`w-6 h-6 ${reward.available ? 'text-green-500' : 'text-gray-400'}`} />
                      <Badge variant={reward.available ? 'default' : 'secondary'}>
                        {reward.points} points
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-2">{reward.name}</h4>
                    <Button
                      className="w-full"
                      disabled={!reward.available || memberData.points < reward.points}
                      onClick={() => claimReward(reward.id, reward.points)}
                    >
                      {memberData.points >= reward.points ? 'Claim Reward' : 'Not Enough Points'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentTier.icon className="w-6 h-6" />
                <span>{currentTier.name} Member Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {currentTier.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-800 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Automatic Freebie System</h4>
                <p className="text-blue-700 text-sm">
                  As a {currentTier.name} member, you automatically earn 1 free wash every {currentTier.name === 'Bronze' ? '10' : currentTier.name === 'Silver' ? '8' : currentTier.name === 'Gold' ? '5' : '3'} paid services. 
                  No waiting required - your freebies are automatically added to your account!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-6 h-6" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Premium Wash Completed</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-green-600">+50 points</span>
                    <p className="text-xs text-gray-500">Aug 1, 2024</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Monthly Payment</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-blue-600">+100 points</span>
                    <p className="text-xs text-gray-500">Aug 1, 2024</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Free Wash Redeemed</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-purple-600">Used Freebie</span>
                    <p className="text-xs text-gray-500">Jul 28, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
