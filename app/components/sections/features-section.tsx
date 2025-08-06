
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wifi, 
  Coffee, 
  Smartphone, 
  Calendar,
  Zap,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Effective Features',
    description: 'Set up services and enjoy exclusive benefits',
    icon: Zap,
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Productive Wait',
    description: 'Modern lounge with WiFi, refreshments, and beverages',
    icon: Coffee,
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    details: [
      'WiFi access',
      'Refreshments',
      'Beverages'
    ]
  },
  {
    title: 'Technology Integration',
    description: 'Mobile app with extensive tracking + Digital booking',
    icon: Smartphone,
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    details: [
      'Mobile app',
      'Real-time tracking',
      'Digital booking'
    ]
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
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Main Features */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Why Choose Ekhaya Intel?
              </h2>
              
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className={`${feature.color} hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full bg-white ${feature.iconColor}`}>
                            <feature.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {feature.title}
                            </CardTitle>
                            <p className="text-gray-600 mt-1">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {feature.details && (
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-3 gap-2">
                            {feature.details.map((detail, idx) => (
                              <div key={idx} className="text-center p-2 bg-white rounded-lg">
                                <span className="text-sm font-medium text-gray-700">
                                  {detail}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Services Grid */}
          <div className="space-y-12">
            {/* Corporate Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gray-50 border-gray-200">
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
              <Card className="bg-blue-50 border-blue-200">
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
      </div>
    </section>
  );
}
