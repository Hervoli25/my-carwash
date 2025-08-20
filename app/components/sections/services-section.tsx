
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Sparkles, 
  Crown, 
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/use-language';

const services = [
  {
    id: 'express',
    name: 'Express Exterior',
    price: 8000, // R80 in cents
    duration: 30,
    rating: 4.9,
    reviewCount: 6904,
    icon: Car,
    image: 'https://cdn.abacus.ai/images/77100dd7-e945-43aa-a419-5bf5249fd87a.png',
    features: [
      'Exterior rinse',
      'Soap application', 
      'High-pressure wash',
      'Spot-free rinse',
      'Air dry'
    ],
    description: 'Quick clean for busy lifestyles',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    buttonColor: 'btn-ekhaya-red'
  },
  {
    id: 'premium',
    name: 'Premium Wash & Wax',
    price: 15000, // R150 in cents
    duration: 60,
    rating: 4.8,
    reviewCount: 367,
    icon: Sparkles,
    image: 'https://cdn.abacus.ai/images/7935c3d8-5a9c-4cdb-8d4e-f0f63c93186c.png',
    features: [
      'Complete exterior wash',
      'Premium wax protection',
      'Tire shine',
      'Interior vacuum',
      'Trim protection'
    ],
    description: 'Extended protection for frequent drivers',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    buttonColor: 'btn-ekhaya-blue'
  },
  {
    id: 'deluxe',
    name: 'Deluxe Interior & Exterior',
    price: 20000, // R200 in cents
    duration: 90,
    rating: 4.7,
    reviewCount: 892,
    icon: Star,
    image: 'https://cdn.abacus.ai/images/ba3a518b-8864-4f6d-bbe9-c9e9282df067.png',
    features: [
      'Complete interior cleaning',
      'Exterior detailing',
      'Dashboard treatment',
      'Leather conditioning',
      'Window cleaning'
    ],
    description: 'Comprehensive interior and exterior care',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    buttonColor: 'btn-ekhaya-red'
  },
  {
    id: 'executive',
    name: 'Executive Detail Package', 
    price: 30000, // R300 in cents
    duration: 120,
    rating: 4.9,
    reviewCount: 1543,
    icon: Crown,
    image: 'https://cdn.abacus.ai/images/ef654cc1-6d39-49ec-9137-fe51a52c4e3d.png',
    features: [
      'Premium detailing service',
      'Paint protection',
      'Engine bay cleaning',
      'Premium treatments',
      'Quality inspection'
    ],
    description: 'The ultimate car detailing experience',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    buttonColor: 'btn-ekhaya-blue'
  }
];

export function ServicesSection() {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our range of professional car care services designed to keep your vehicle looking its best
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className={`service-card h-full ${service.color} hover:shadow-xl transition-all duration-300`}>
                {/* Service Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover service-image"
                  />
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full bg-white ${service.iconColor}`}>
                      <service.icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.rating}</span>
                        <span>({service.reviewCount.toLocaleString()})</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </CardTitle>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(service.price)}
                    </span>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration} min
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    {service.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{service.features.length - 3} more features
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link href={`/services/${service.id}`} className="block">
                      <Button className={`w-full ${service.buttonColor} text-white`}>
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/book?service=${service.id}`} className="block">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                        {t('navigation.book')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
