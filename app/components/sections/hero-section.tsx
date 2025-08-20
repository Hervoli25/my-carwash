

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Shield, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterPledge } from '@/components/animations/typewriter-pledge';
import { useLanguage } from '@/lib/i18n/use-language';

const getCarouselImages = (t: (key: string) => string) => [
  {
    src: 'https://cdn.abacus.ai/images/d1943ab6-29a7-4819-b1f6-730cb6f6caff.png',
    title: t('home.carousel.luxury.title'),
    description: t('home.carousel.luxury.description')
  },
  {
    src: 'https://cdn.abacus.ai/images/3c3cda0f-858c-43c4-b1ba-aa5c10b42eb0.png',
    title: t('home.carousel.interior.title'),
    description: t('home.carousel.interior.description')
  },
  {
    src: 'https://cdn.abacus.ai/images/a59ba4e9-590a-4447-a168-d726a4bbd0ad.png',
    title: t('home.carousel.facilities.title'),
    description: t('home.carousel.facilities.description')
  },
  {
    src: 'https://cdn.abacus.ai/images/3ec67c54-bda0-4615-b08f-2d638e2da39c.png',
    title: t('home.carousel.lounge.title'),
    description: t('home.carousel.lounge.description')
  },
  {
    src: 'https://cdn.abacus.ai/images/39b4a2ed-852f-4851-a414-95670ed76eb3.png',
    title: t('home.carousel.transformation.title'),
    description: t('home.carousel.transformation.description')
  }
];

export function HeroSection() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const carouselImages = getCarouselImages(t);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative ekhaya-gradient py-20 md:py-28 overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={carouselImages[currentSlide].src}
              alt={carouselImages[currentSlide].title}
              fill
              className="object-cover"
              priority={currentSlide === 0}
            />
          </motion.div>
        </AnimatePresence>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-purple-900/70 to-blue-900/80" />
      </div>



      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
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
              {t('home.title')} –<br />
              <span className="text-yellow-300">Where Waiting Becomes Productive</span><br />
              <span className="text-blue-100 text-2xl md:text-3xl lg:text-4xl">in Cape Town</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              {t('home.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/book">
                <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <Car className="w-5 h-5 mr-2" />
                  {t('home.hero.cta')}
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Explore AI Features
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Carousel Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
          >
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 overflow-hidden">
              {/* Carousel Images */}
              <div className="relative h-64 md:h-80 mb-4 rounded-lg overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={carouselImages[currentSlide].src}
                      alt={carouselImages[currentSlide].title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Carousel Content */}
              <div className="text-center text-white">
                <h3 className="text-xl font-bold mb-2">
                  {carouselImages[currentSlide].title}
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  {carouselImages[currentSlide].description}
                </p>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentSlide === index 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Environmental Pledge Section */}
        <div className="mt-16">
          <TypewriterPledge className="max-w-2xl mx-auto" />
        </div>
      </div>
    </section>
  );
}
