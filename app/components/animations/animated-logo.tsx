'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  enableHover?: boolean;
  enableEntrance?: boolean;
  variant?: 'default' | 'auth' | 'footer' | 'floating';
}

const sizeClasses = {
  small: 'h-12 w-32',
  medium: 'h-16 w-40',
  large: 'h-20 w-64'
};

export function AnimatedLogo({ 
  size = 'medium', 
  className,
  enableHover = true,
  enableEntrance = true,
  variant = 'default'
}: AnimatedLogoProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Floating animation variants
  const floatingVariants = {
    animate: {
      y: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity
      }
    }
  };

  // Pulsing glow effect
  const glowVariants = {
    animate: {
      filter: [
        'drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))',
        'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
        'drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))'
      ],
      transition: {
        duration: 3,
        repeat: Infinity
      }
    }
  };

  // Get variant-specific styling
  const getVariantStyling = () => {
    switch (variant) {
      case 'auth':
        return {
          container: 'rounded-2xl overflow-hidden backdrop-blur-sm bg-white/10 shadow-2xl border border-white/20 p-2',
          image: 'rounded-xl object-contain mix-blend-multiply filter drop-shadow-lg'
        };
      case 'footer':
        return {
          container: 'rounded-xl overflow-hidden backdrop-blur-sm bg-gradient-to-r from-white/5 to-white/10 border border-white/10 p-2',
          image: 'rounded-lg object-contain filter brightness-110 contrast-110 drop-shadow-xl'
        };
      case 'floating':
        return {
          container: 'rounded-full overflow-hidden backdrop-blur-md bg-white/20 shadow-xl border-2 border-white/30 p-1',
          image: 'rounded-full object-cover'
        };
      default:
        return {
          container: 'rounded-xl overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 shadow-lg border border-white/20 p-1',
          image: 'rounded-lg object-contain filter drop-shadow-md'
        };
    }
  };

  const styling = getVariantStyling();

  return (
    <motion.div
      className={cn(
        'relative logo-container transition-all duration-500',
        sizeClasses[size],
        styling.container,
        scrolled ? 'scale-95' : 'scale-100',
        className
      )}
      initial={enableEntrance ? {
        x: variant === 'auth' ? 0 : -100,
        y: variant === 'auth' ? -50 : 0,
        opacity: 0,
        scale: 0.8,
        rotate: variant === 'auth' ? -10 : 0
      } : undefined}
      animate={variant === 'floating' ? 'animate' : (enableEntrance ? {
        x: 0,
        y: 0,
        opacity: 1,
        scale: scrolled ? 0.95 : 1,
        rotate: 0
      } : undefined)}
      variants={variant === 'floating' ? floatingVariants : undefined}
      transition={enableEntrance && variant !== 'floating' ? {
        duration: variant === 'auth' ? 1.2 : 2,
        type: "spring",
        stiffness: 100,
        damping: 15
      } : undefined}
      whileHover={enableHover ? { 
        scale: scrolled ? 1.02 : 1.08,
        rotate: variant === 'auth' ? 2 : 0,
        transition: { duration: 0.3 }
      } : undefined}
      whileTap={enableHover ? {
        scale: scrolled ? 0.98 : 1.02,
        transition: { duration: 0.1 }
      } : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Background glow effect */}
      {variant === 'floating' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl -z-10"
          variants={glowVariants}
          animate="animate"
        />
      )}
      
      {/* Logo image */}
      <motion.div
        className="relative w-full h-full overflow-hidden rounded-lg"
        animate={isHovered && variant !== 'auth' ? {
          background: [
            'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            'linear-gradient(225deg, rgba(59,130,246,0.1), rgba(147,51,234,0.1))',
            'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
          ]
        } : undefined}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Image
          src="/logocarwash.jpg"
          alt="Prestige Car Wash by Ekhaya Intel Trading"
          fill
          className={cn(
            'logo-animated transition-all duration-500',
            styling.image,
            isHovered ? 'brightness-110 contrast-110' : 'brightness-100'
          )}
          priority
        />
        
        {/* Subtle overlay for blending */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          variant === 'auth' ? 'bg-gradient-to-br from-blue-50/20 to-white/20' :
          variant === 'footer' ? 'bg-gradient-to-br from-gray-800/10 to-gray-900/10' :
          'bg-gradient-to-br from-white/5 to-transparent',
          isHovered ? 'opacity-50' : 'opacity-20'
        )} />
      </motion.div>

      {/* Animated border for special effects */}
      {(variant === 'floating' || isHovered) && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-blue-400/50 bg-clip-border"
          animate={{
            background: [
              'linear-gradient(0deg, rgba(59,130,246,0.3), rgba(147,51,234,0.3))',
              'linear-gradient(90deg, rgba(147,51,234,0.3), rgba(236,72,153,0.3))',
              'linear-gradient(180deg, rgba(236,72,153,0.3), rgba(59,130,246,0.3))',
              'linear-gradient(270deg, rgba(59,130,246,0.3), rgba(147,51,234,0.3))'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ mask: 'linear-gradient(white 0 0) content-box, linear-gradient(white 0 0)', maskComposite: 'exclude' }}
        />
      )}
    </motion.div>
  );
}