
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Zap, 
  Gift, 
  Camera,
  Share2,
  Medal,
  Crown,
  Flame,
  Target,
  Users,
  Calendar,
  Sparkles,
  Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  deadline: string;
  progress: number;
  maxProgress: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  streak: number;
  avatar?: string;
}

export function Gamification() {
  const [currentLevel, setCurrentLevel] = useState(7);
  const [currentXP, setCurrentXP] = useState(2450);
  const [nextLevelXP] = useState(3000);
  const [loyaltyPoints] = useState(15420);
  const [currentStreak] = useState(12);

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first-wash',
      title: 'Getting Started',
      description: 'Complete your first car wash',
      icon: <Car className="w-6 h-6" />,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      points: 100,
      rarity: 'common'
    },
    {
      id: 'streak-5',
      title: 'Consistency Champion',
      description: 'Maintain a 5-wash streak',
      icon: <Flame className="w-6 h-6" />,
      unlocked: true,
      progress: 12,
      maxProgress: 5,
      points: 250,
      rarity: 'rare'
    },
    {
      id: 'eco-warrior',
      title: 'Eco Warrior',
      description: 'Save 1000L of water with eco washes',
      icon: <Sparkles className="w-6 h-6" />,
      unlocked: false,
      progress: 750,
      maxProgress: 1000,
      points: 500,
      rarity: 'epic'
    },
    {
      id: 'premium-member',
      title: 'Premium Enthusiast',
      description: 'Complete 50 premium services',
      icon: <Crown className="w-6 h-6" />,
      unlocked: false,
      progress: 23,
      maxProgress: 50,
      points: 1000,
      rarity: 'legendary'
    }
  ]);

  const [challenges] = useState<Challenge[]>([
    {
      id: 'weekly-wash',
      title: 'Weekly Warrior',
      description: 'Book 3 washes this week',
      reward: '500 bonus points',
      deadline: '3 days left',
      progress: 2,
      maxProgress: 3,
      difficulty: 'easy'
    },
    {
      id: 'refer-friends',
      title: 'Social Butterfly',
      description: 'Refer 2 friends this month',
      reward: 'Free premium wash',
      deadline: '2 weeks left',
      progress: 1,
      maxProgress: 2,
      difficulty: 'medium'
    },
    {
      id: 'perfect-month',
      title: 'Monthly Master',
      description: 'Complete 8 washes this month',
      reward: '20% off next month',
      deadline: '1 week left',
      progress: 5,
      maxProgress: 8,
      difficulty: 'hard'
    }
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: 'Sarah M.', points: 28540, streak: 25, avatar: 'https://cdn.abacus.ai/images/77100dd7-e945-43aa-a419-5bf5249fd87a.png' },
    { rank: 2, name: 'Mike K.', points: 25320, streak: 18 },
    { rank: 3, name: 'You', points: 15420, streak: 12, avatar: 'https://cdn.abacus.ai/images/7935c3d8-5a9c-4cdb-8d4e-f0f63c93186c.png' },
    { rank: 4, name: 'Lisa R.', points: 12890, streak: 8 },
    { rank: 5, name: 'James P.', points: 11250, streak: 15 }
  ]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Stats Header */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                L{currentLevel}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">PRESTIGE Champion</h3>
                <p className="text-sm text-gray-600">Level {currentLevel} • {loyaltyPoints} points • {currentStreak} day streak</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-orange-500 text-white mb-2">
                <Flame className="w-3 h-3 mr-1" />
                {currentStreak} Day Streak
              </Badge>
              <div className="text-sm text-gray-600">Streak Bonus: +20% XP</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Level Progress</span>
              <span className="font-medium">{currentXP}/{nextLevelXP} XP</span>
            </div>
            <Progress value={(currentXP / nextLevelXP) * 100} className="h-3" />
            <div className="text-xs text-gray-500">
              {nextLevelXP - currentXP} XP to next level
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${getRarityColor(achievement.rarity)}
                      ${achievement.unlocked ? 'opacity-100' : 'opacity-75'}
                    `}
                  >
                    {achievement.unlocked && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-green-500 text-white">
                          <Trophy className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`
                        p-2 rounded-full 
                        ${achievement.unlocked ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}
                      `}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {achievement.points} points
                          </Badge>
                          <Badge variant="outline" className={`text-xs capitalize ${getRarityColor(achievement.rarity).replace('bg-', 'text-').replace('-50', '-600')}`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1.5" 
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Gift className="w-3 h-3 mr-1" />
                            {challenge.reward}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {challenge.deadline}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{challenge.progress}/{challenge.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(challenge.progress / challenge.maxProgress) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Monthly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      flex items-center space-x-4 p-3 rounded-lg transition-all
                      ${entry.name === 'You' 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${entry.rank === 1 
                        ? 'bg-yellow-500 text-white' 
                        : entry.rank === 2 
                        ? 'bg-gray-400 text-white'
                        : entry.rank === 3
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                    </div>
                    
                    <div className="flex-1 flex items-center space-x-3">
                      {entry.avatar && (
                        <Image
                          src={entry.avatar}
                          alt={entry.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{entry.name}</div>
                        <div className="text-sm text-gray-600">
                          {entry.streak} day streak
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{entry.points.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Your Rank
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="w-5 h-5 mr-2 text-green-500" />
                Rewards Store
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Free Express Wash', cost: 1000, available: true },
                  { name: '20% Off Premium Service', cost: 1500, available: true },
                  { name: 'VIP Priority Booking', cost: 2000, available: false },
                  { name: 'Free Interior Detail', cost: 2500, available: false },
                  { name: 'Monthly Membership Discount', cost: 5000, available: false },
                  { name: 'Exclusive Car Care Kit', cost: 7500, available: false }
                ].map((reward, index) => (
                  <motion.div
                    key={reward.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-lg border transition-all
                      ${reward.available 
                        ? 'bg-white border-green-200 hover:border-green-300' 
                        : 'bg-gray-50 border-gray-200 opacity-75'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{reward.name}</h4>
                      {reward.available && (
                        <Badge className="bg-green-500 text-white">Available</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{reward.cost}</span>
                        <span className="text-sm text-gray-600">points</span>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={!reward.available}
                        className={reward.available ? '' : 'opacity-50'}
                      >
                        {reward.available ? 'Redeem' : 'Locked'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <h4 className="font-medium text-blue-900">Quick Tip</h4>
                </div>
                <p className="text-sm text-blue-800">
                  Complete challenges and maintain streaks to earn bonus points faster!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
