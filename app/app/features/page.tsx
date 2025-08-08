'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Brain,
  Cloud,
  Trophy,
  Mic,
  Leaf,
  Sparkles,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Home,
  Activity,
  Cpu,
  CloudRain,
  Gamepad2,
  Bot,
  Trees
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RealTimeTracking } from '@/components/features/real-time-tracking';
import { AIDamageDetection } from '@/components/features/ai-damage-detection';
import { WeatherScheduling } from '@/components/features/weather-scheduling';
import { Gamification } from '@/components/features/gamification';
import { VoiceAssistant } from '@/components/features/voice-assistant';
import { EcoImpactDashboard } from '@/components/features/eco-impact';

const features = [
  {
    id: 'real-time-tracking',
    title: 'Real-Time Tracking',
    description: 'Live service updates with photos and progress tracking',
    icon: Activity,
    badge: 'LIVE',
    badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    color: 'from-blue-500 to-cyan-600',
    component: RealTimeTracking,
    benefits: [
      'Live progress updates with 6 tracking stages',
      'Before/after photos with timestamps',
      'Real-time notifications and alerts',
      'Estimated vs actual completion times'
    ]
  },
  {
    id: 'ai-damage-detection',
    title: 'AI Damage Detection',
    description: 'Computer vision for vehicle inspection and quality assurance',
    icon: Cpu,
    badge: 'AI POWERED',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    color: 'from-purple-500 to-pink-600',
    component: AIDamageDetection,
    benefits: [
      'AI analysis of vehicle condition',
      'Damage detection with confidence scores',
      'Detailed inspection reports',
      'Downloadable PDF reports'
    ]
  },
  {
    id: 'weather-scheduling',
    title: 'Smart Weather Scheduling',
    description: 'Weather-intelligent booking with dynamic pricing',
    icon: CloudRain,
    badge: 'SMART',
    badgeColor: 'bg-gradient-to-r from-green-500 to-teal-500',
    color: 'from-green-500 to-teal-600',
    component: WeatherScheduling,
    benefits: [
      '7-day weather forecast integration',
      'Dynamic pricing based on conditions',
      'Smart scheduling recommendations',
      'Weather impact alerts'
    ]
  },
  {
    id: 'gamification',
    title: 'Rewards & Gamification',
    description: 'Complete loyalty program with achievements and leaderboards',
    icon: Gamepad2,
    badge: 'ENGAGING',
    badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    color: 'from-yellow-500 to-orange-600',
    component: Gamification,
    benefits: [
      'Achievement system with 4 rarity levels',
      'Personal XP and leveling system',
      'Monthly leaderboards',
      'Rewards store with points redemption'
    ]
  },
  {
    id: 'voice-assistant',
    title: 'Voice Assistant',
    description: 'Natural language processing for hands-free booking',
    icon: Bot,
    badge: 'INNOVATIVE',
    badgeColor: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    color: 'from-indigo-500 to-blue-600',
    component: VoiceAssistant,
    benefits: [
      'Speech recognition & voice commands',
      'AI-powered response generation',
      'Quick command shortcuts',
      'Text-to-speech responses'
    ]
  },
  {
    id: 'eco-impact',
    title: 'Environmental Impact Dashboard',
    description: 'Comprehensive eco-tracking and community goals',
    icon: Trees,
    badge: 'ECO FRIENDLY',
    badgeColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
    color: 'from-emerald-500 to-green-600',
    component: EcoImpactDashboard,
    benefits: [
      'Personal environmental metrics',
      'Water & CO₂ savings tracking',
      'Eco achievements system',
      'Community impact statistics'
    ]
  }
];

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState('real-time-tracking');
  const [showDemo, setShowDemo] = useState(false);

  const currentFeature = features.find(f => f.id === activeFeature);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section - Match Screenshot */}
        <div className="bg-gradient-to-br from-gray-50 to-white py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
                <Sparkles className="w-4 h-4 mr-2" />
                CUTTING-EDGE TECHNOLOGY
              </Badge>

              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Advanced Features That Make
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  PRESTIGE Stand Out
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                Experience the future of car wash with AI-powered services, real-time tracking, voice
                commands, and environmental impact monitoring. We're not just cleaning cars, we're
                revolutionizing the industry.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="outline" className="px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Activity className="w-4 h-4 mr-2" />
                  Real-Time
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Bot className="w-4 h-4 mr-2" />
                  Voice Control
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Trees className="w-4 h-4 mr-2" />
                  Eco-Friendly
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Trophy className="w-4 h-4 mr-2" />
                  Gamified
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <CloudRain className="w-4 h-4 mr-2" />
                  Smart
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Navigation */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeFeature} onValueChange={setActiveFeature} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
            {features.map((feature) => (
              <TabsTrigger 
                key={feature.id} 
                value={feature.id}
                className="flex flex-col items-center p-4 text-xs"
              >
                <feature.icon className="w-5 h-5 mb-1" />
                <span className="hidden sm:inline">{feature.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Feature Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-6">
                    <Badge className={`${feature.badgeColor} text-white mb-4`}>
                      {feature.badge}
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h2>
                    <p className="text-xl text-gray-600 mb-6">
                      {feature.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900">Key Benefits:</h3>
                    {feature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <Link href="/book">
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline">
                      Learn More
                    </Button>
                  </div>
                </motion.div>

                {/* Feature Demo */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl p-6"
                >
                  {/* Production-ready tracking expects a bookingId; demo disabled in production */}
                  <feature.component bookingId={"DEMO-BOOKING"} />
                </motion.div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 text-white py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who are already enjoying the future of car wash technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Link href="/book">Book Your First Wash</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <Link href="/membership">Join VIP Program</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
