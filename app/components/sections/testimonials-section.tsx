
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Jane Doe',
    rating: 5,
    comment: 'Excellent service! Quick and professional. My car looks amazing and the lounge area made the wait so productive.',
    service: 'Express Wash',
    date: 'April 2024'
  },
  {
    name: 'John Smith', 
    rating: 5,
    comment: 'Outstanding premium service. The lounge area is great for waiting - I actually got work done while my car was being detailed!',
    service: 'Premium Wash',
    date: 'March 2024'
  },
  {
    name: 'Sarah Wilson',
    rating: 5,
    comment: 'The executive package is worth every penny. Attention to detail is incredible and the productive waiting experience is unique.',
    service: 'Executive Detail',
    date: 'April 2024'
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Customer Testimonials
          </h2>
          
          {/* Overall Rating Display */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-lg font-semibold text-gray-900 ml-2">5.0</span>
            <span className="text-gray-600">Average rating</span>
          </div>
          
          <p className="text-lg text-gray-600">
            See what our customers are saying about their experience
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full bg-gray-50 border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Quote className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= testimonial.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 text-center mb-6 italic">
                    "{testimonial.comment}"
                  </p>

                  {/* Customer Info */}
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {testimonial.name}
                    </h4>
                    <div className="flex items-center justify-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {testimonial.service}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {testimonial.date}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Service Availability Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2">
            Service Available - Best
          </Badge>
        </motion.div>
      </div>
    </section>
  );
}
