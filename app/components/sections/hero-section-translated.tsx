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

const carouselImages = [
  {
    src: 'https://cdn.abacus.ai/images/d1943ab6-29a7-4819-b1f6-730cb6f6caff.png',
    titleKey: 'home.carousel.luxury.title',
    descriptionKey: 'home.carousel.luxury.description'
  },
  {
    src: 'https://cdn.abacus.ai/images/3c3cda0f-858c-43c4-b1ba-aa5c10b42eb0.png',
    titleKey: 'home.carousel.interior.title',
    descriptionKey: 'home.carousel.interior.description'
  },
  {
    src: 'https://cdn.abacus.ai/images/a59ba4e9-590a-4447-a168-d726a4bbd0ad.png',
    titleKey: 'home.carousel.facilities.title',
    descriptionKey: 'home.carousel.facilities.description'
  },
  {
    src: 'https://cdn.abacus.ai/images/3ec67c54-bda0-4615-b08f-2d638e2da39c.png',
    titleKey: 'home.carousel.lounge.title',
    descriptionKey: 'home.carousel.lounge.description'
  },
  {
    src: 'https://cdn.abacus.ai/images/39b4a2ed-852f-4851-a414-95670ed76eb3.png',
    titleKey: 'home.carousel.transformation.title',
    descriptionKey: 'home.carousel.transformation.description'
  }
];

export function HeroSectionTranslated() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={carouselImages[currentSlide].src}
              alt={t(carouselImages[currentSlide].titleKey)}
              fill
              className="object-cover"
              priority={currentSlide === 0}
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={nextSlide}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Badge className="mb-6 bg-red-600 hover:bg-red-700 text-white border-0">
            {t('home.badge')}
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t('home.hero.title')}
          </h1>
          
          <p className="text-xl sm:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/book">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
                {t('home.hero.cta')}
              </Button>
            </Link>
            <Link href="#services">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg">
                {t('navigation.services')}
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <Shield className="w-5 h-5" />
              <span>{t('home.features.quality.title')}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <Car className="w-5 h-5" />
              <span>{t('home.features.convenience.title')}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <Sparkles className="w-5 h-5" />
              <span>{t('home.features.tracking.title')}</span>
            </div>
          </div>
        </motion.div>

        {/* Current slide info */}
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
        >
          <h3 className="text-lg font-semibold mb-1">
            {t(carouselImages[currentSlide].titleKey)}
          </h3>
          <p className="text-sm text-white/80">
            {t(carouselImages[currentSlide].descriptionKey)}
          </p>
        </motion.div>
      </div>

      {/* Typewriter Pledge */}
      <div className="absolute bottom-8 left-8 z-10">
        <TypewriterPledge />
      </div>
    </section>
  );
}
