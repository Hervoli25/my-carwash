'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Leaf, Heart, Globe } from 'lucide-react';

const pledgeTexts = [
  {
    text: "We pledge to protect our planet through innovative water recycling systems...",
    icon: Droplets,
    color: "text-blue-400"
  },
  {
    text: "Every drop matters. We recycle 95% of our water, preserving this precious resource...",
    icon: Droplets,
    color: "text-cyan-400"
  },
  {
    text: "Our eco-friendly products are biodegradable, ensuring no harm to the environment...",
    icon: Leaf,
    color: "text-green-400"
  },
  {
    text: "We believe in sustainable practices that benefit both your vehicle and Mother Earth...",
    icon: Globe,
    color: "text-emerald-400"
  },
  {
    text: "This is our commitment to humanity - a cleaner world, one car at a time...",
    icon: Heart,
    color: "text-red-400"
  }
];

interface TypewriterPledgeProps {
  className?: string;
}

export function TypewriterPledge({ className = "" }: TypewriterPledgeProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentPledge = pledgeTexts[currentTextIndex];
    const fullText = currentPledge.text;

    if (isTyping) {
      if (displayedText.length < fullText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, 50 + Math.random() * 50); // Variable typing speed for natural feel

        return () => clearTimeout(timeout);
      } else {
        // Finished typing current text
        setIsTyping(false);
        const pauseTimeout = setTimeout(() => {
          setIsTyping(true);
          setDisplayedText('');
          setCurrentTextIndex((prev) => (prev + 1) % pledgeTexts.length);
        }, 3000); // Pause before next text

        return () => clearTimeout(pauseTimeout);
      }
    }
  }, [displayedText, isTyping, currentTextIndex]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const currentPledge = pledgeTexts[currentTextIndex];
  const IconComponent = currentPledge.icon;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <motion.div
            key={currentTextIndex}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-2 rounded-full bg-white/10 ${currentPledge.color}`}
          >
            <IconComponent className="w-6 h-6" />
          </motion.div>
          <h3 className="text-white font-semibold text-lg ml-3">Our Environmental Pledge</h3>
        </div>

        {/* Typewriter Text */}
        <div className="min-h-[80px] flex items-center justify-center">
          <p className="text-white/90 text-center text-lg leading-relaxed font-light">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentTextIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={currentPledge.color}
              >
                {displayedText}
              </motion.span>
            </AnimatePresence>
            <motion.span
              animate={{ opacity: showCursor ? 1 : 0 }}
              transition={{ duration: 0.1 }}
              className="text-white ml-1 font-bold"
            >
              |
            </motion.span>
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 mt-4">
          {pledgeTexts.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentTextIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/30'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              animate={{
                x: [0, Math.random() * 400],
                y: [0, Math.random() * 200],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Eco Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="grid grid-cols-3 gap-4 mt-6"
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-white">95%</div>
          <div className="text-sm text-white/70">Water Recycled</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">100%</div>
          <div className="text-sm text-white/70">Eco Products</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-sm text-white/70">Harmful Chemicals</div>
        </div>
      </motion.div>
    </div>
  );
}
