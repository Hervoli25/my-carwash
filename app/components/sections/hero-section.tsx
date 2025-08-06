
'use client';

import Link from 'next/link';
import Image from 'next/image';
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

          {/* Enhanced Visual with Car Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 text-center border border-white/20">
              {/* Animated Logo/Car Section */}
              <div className="flex justify-center mb-6">
                <motion.div 
                  className="relative car-entrance"
                  initial={{ x: -200, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 3,
                    ease: "easeOut",
                    delay: 0.5
                  }}
                >
                  <div className="relative h-24 w-32 bg-white rounded-lg p-2 shadow-lg">
                    <Image
                      src="/logocarwash.jpg"
                      alt="Ekhaya Car Wash"
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                  {/* Car trail effect */}
                  <motion.div
                    className="absolute -top-1 -left-4 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </motion.div>
              </div>
              
              <motion.h3 
                className="text-2xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                Premium Car Care Experience
              </motion.h3>
              
              <motion.p 
                className="text-blue-100 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
              >
                Relax in our productive lounge while we take care of your vehicle with professional service and attention to detail.
              </motion.p>

              {/* Floating sparkles animation */}
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
              </div>
              
              <div className="absolute bottom-4 left-4">
                <motion.div
                  animate={{ 
                    rotate: -360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 5, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Sparkles className="w-4 h-4 text-blue-300" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
