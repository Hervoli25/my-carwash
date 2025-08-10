
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Star, 
  Crown, 
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

const membershipPlans = [
  {
    name: 'Basic',
    price: 4900, // R49/month
    period: 'month',
    icon: Zap,
    color: 'bg-gray-50 border-gray-200',
    iconColor: 'text-gray-600',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    features: [
      '10% discount on all services',
      'Standard booking priority',
      '1x loyalty points',
      'Monthly newsletter',
      'Email customer support'
    ],
    description: 'Perfect for occasional car washes'
  },
  {
    name: 'Premium',
    price: 9900, // R99/month  
    period: 'month',
    icon: Star,
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    features: [
      '20% discount on all services',
      'Priority booking slots',
      '2x loyalty points earned',
      'Free tire shine monthly',
      'WhatsApp customer support',
      'Birthday month special discount',
      'Booking reminders via SMS'
    ],
    description: 'Great value for regular car care',
    badge: 'Most Popular',
    highlighted: true
  }
];

export function MembershipSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Membership Plans
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Save on services and enjoy exclusive benefits with our membership plans
          </p>
        </motion.div>

        {/* Membership Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {membershipPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full ${plan.color} ${plan.highlighted ? 'ring-2 ring-blue-600 shadow-xl' : 'hover:shadow-lg'} transition-all duration-300`}>
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full bg-white ${plan.iconColor}`}>
                      <plan.icon className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Link href="/membership" className="block">
                    <Button className={`w-full ${plan.buttonColor} text-white`}>
                      {plan.highlighted ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Not sure which plan is right for you?
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Contact Us for Guidance
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
