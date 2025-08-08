
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Brain,
  Cloud,
  Trophy,
  Mic,
  Leaf,
  Sparkles,
  Star,
  Zap,
  Users,
  Calendar,
  Coffee,
  Smartphone,
  Activity,
  Cpu,
  CloudRain,
  Gamepad2,
  Bot,
  Trees
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const cuttingEdgeFeatures = [
  {
    id: 'real-time-tracking',
    title: 'Real-Time Tracking',
    description: 'Live service updates with photos',
    icon: Activity,
    badge: 'LIVE',
    badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    color: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    iconColor: 'text-blue-600',
    iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    features: ['6 tracking stages', 'Photo updates', 'Live notifications']
  },
  {
    id: 'ai-damage-detection',
    title: 'AI Damage Detection',
    description: 'Automated quality assurance',
    icon: Cpu,
    badge: 'AI POWERED',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
    iconColor: 'text-purple-600',
    iconBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    features: ['Computer vision', 'Damage reports', 'Quality scoring']
  },
  {
    id: 'smart-scheduling',
    title: 'Smart Scheduling',
    description: 'Weather-based optimization',
    icon: CloudRain,
    badge: 'SMART',
    badgeColor: 'bg-gradient-to-r from-green-500 to-teal-500',
    color: 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200',
    iconColor: 'text-green-600',
    iconBg: 'bg-gradient-to-r from-green-500 to-teal-500',
    features: ['Weather integration', 'Dynamic pricing', 'Optimal timing']
  },
  {
    id: 'gamification',
    title: 'Rewards & Gamification',
    description: 'Points, streaks, and achievements',
    icon: Gamepad2,
    badge: 'ENGAGING',
    badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    color: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    features: ['Achievement system', 'Leaderboards', 'Reward store']
  },
  {
    id: 'voice-assistant',
    title: 'Voice Assistant',
    description: 'Book services using voice commands',
    icon: Bot,
    badge: 'INNOVATIVE',
    badgeColor: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    color: 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    features: ['Speech recognition', 'Natural language', 'Hands-free booking']
  },
  {
    id: 'eco-impact',
    title: 'Eco Impact Tracking',
    description: 'Environmental impact dashboard',
    icon: Trees,
    badge: 'ECO FRIENDLY',
    badgeColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
    color: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-gradient-to-r from-emerald-500 to-green-500',
    features: ['Carbon tracking', 'Water savings', 'Community goals']
  }
];

const corporateServices = [
  'Additional Locations Served',
  'Fleet Management',
  'Corporate Packages',
  'Bulk Pricing'
];

const customerServices = [
  '24/7 Customer Support',
  'Quality Guarantee',
  'Flexible Scheduling',
  'Loyalty Program'
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
            <Sparkles className="w-4 h-4 mr-2" />
            CUTTING-EDGE TECHNOLOGY
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Advanced Features That Make
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PRESTIGE Stand Out
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Experience the future of car wash with AI-powered services, real-time tracking, voice
            commands, and environmental impact monitoring. We're not just cleaning cars, we're
            revolutionizing the industry.
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['AI-Powered', 'Real-Time', 'Voice Control', 'Eco-Friendly', 'Gamified', 'Smart'].map((tag) => (
              <Badge key={tag} variant="outline" className="px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {cuttingEdgeFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`${feature.color} hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full border-2`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${feature.iconBg} shadow-lg transform transition-transform hover:scale-110`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className={`${feature.badgeColor} text-white text-xs px-3 py-1 font-bold shadow-md`}>
                      {feature.badge}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <div className={`w-1.5 h-1.5 rounded-full ${feature.iconColor.replace('text-', 'bg-')} mr-2`} />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-500 rounded-3xl p-12 text-center text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Experience the Future?
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of satisfied customers who are already enjoying these cutting-edge
                features. Book your first PRESTIGE wash today!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3"
                >
                  <Link href="/book">Book Now & Try Features</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 font-semibold px-8 py-3"
                >
                  <Link href="/membership">Become a Member</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          {/* Corporate Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gray-50 border-gray-200 h-full">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Corporate Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {corporateServices.map((service, index) => (
                    <div key={index} className="text-sm text-gray-700 p-2 bg-white rounded border">
                      {service}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Cape Town - Additional Locations
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-blue-50 border-blue-200 h-full">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Customer Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {customerServices.map((service, index) => (
                    <div key={index} className="text-sm text-gray-700 p-2 bg-white rounded border">
                      {service}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
