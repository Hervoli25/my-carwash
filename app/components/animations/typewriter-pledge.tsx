'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Leaf, Heart, Globe, Sparkles } from 'lucide-react';

const pledgeTexts = [
  {
    text: "💧 Every drop counts - We recycle 95% of our water, turning conservation into innovation.",
    icon: Droplets,
    color: "text-blue-400"
  },
  {
    text: "🌱 Nature-first approach - 100% biodegradable products that love your car and our planet.",
    icon: Leaf,
    color: "text-green-400"
  },
  {
    text: "🌍 Carbon neutral operations - Reducing our footprint while maximizing your vehicle's shine.",
    icon: Globe,
    color: "text-emerald-400"
  },
  {
    text: "⚡ Solar-powered facilities - Clean energy powering cleaner cars for a brighter tomorrow.",
    icon: Sparkles,
    color: "text-yellow-400"
  },
  {
    text: "💚 Our promise to future generations - Sustainable luxury that doesn't cost the Earth.",
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
        className="relative group"
      >
        {/* Compact Glass Card */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-blue-500/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-500">
          
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                key={currentTextIndex}
                initial={{ scale: 0.8, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5 }}
                className={`p-2 rounded-lg bg-white/10 backdrop-blur-sm ${currentPledge.color}`}
              >
                <IconComponent className="w-5 h-5" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white">Environmental Pledge</h3>
            </div>
            
            {/* Mini Progress Indicators */}
            <div className="flex space-x-1">
              {pledgeTexts.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentTextIndex 
                      ? 'bg-emerald-400 scale-125' 
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Typewriter Text - Compact */}
          <div className="min-h-[50px] flex items-center">
            <p className="text-sm leading-relaxed">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTextIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`${currentPledge.color} font-medium`}
                >
                  {displayedText}
                </motion.span>
              </AnimatePresence>
              <motion.span
                animate={{ opacity: showCursor ? 1 : 0 }}
                transition={{ duration: 0.1 }}
                className="text-emerald-400 ml-0.5"
              >
                |
              </motion.span>
            </p>
          </div>

          {/* Compact Stats Row */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">95%</div>
              <div className="text-xs text-white/70">Water Saved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-teal-400">100%</div>
              <div className="text-xs text-white/70">Eco Products</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">0</div>
              <div className="text-xs text-white/70">Chemicals</div>
            </div>
          </div>

          {/* Beautiful Dropping Leaves Animation */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-emerald-400/30"
                animate={{
                  y: [-20, 180],
                  x: [0, Math.sin(i) * 30, Math.cos(i) * 20],
                  rotate: [0, 180, 360],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${10 + i * 15}%`,
                  top: "-10px",
                  fontSize: '12px',
                }}
              >
                {i % 4 === 0 ? '🍃' : i % 4 === 1 ? '💧' : i % 4 === 2 ? '🌿' : '✨'}
              </motion.div>
            ))}
          </div>

          {/* Gentle Sparkle Effects */}
          <div className="absolute top-2 right-2">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-emerald-400/40 text-xs"
            >
              ✨
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
