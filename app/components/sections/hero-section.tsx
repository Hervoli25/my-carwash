
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative ekhaya-gradient py-20 md:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Eco Badge */}
            <div className="flex justify-center lg:justify-start mb-6">
              <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
                <Shield className="w-4 h-4 mr-2" />
                ECO CERTIFIED 2024
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              EkhayaIntel Car Wash –<br />
              <span className="text-yellow-300">Where Waiting Becomes Productive</span><br />
              <span className="text-blue-100 text-2xl md:text-3xl lg:text-4xl">in Cape Town</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              Premium car care with productive customer lounge experience
            </p>

            {/* CTA Button */}
            <Link href="/book">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <Car className="w-5 h-5 mr-2" />
                Book Your Service Now
              </Button>
            </Link>
          </motion.div>

          {/* Visual/Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 text-center border border-white/20">
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-full p-6">
                  <Sparkles className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Premium Car Care Experience
              </h3>
              <p className="text-blue-100 text-lg">
                Relax in our productive lounge while we take care of your vehicle with professional service and attention to detail.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
