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
  enableEntrance = true
}: AnimatedLogoProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className={cn(
        'relative logo-container transition-transform duration-300',
        sizeClasses[size],
        scrolled ? 'scale-95' : 'scale-100',
        className
      )}
      initial={enableEntrance ? { x: -100, opacity: 0, scale: 0.8 } : undefined}
      animate={enableEntrance ? { x: 0, opacity: 1, scale: scrolled ? 0.95 : 1 } : undefined}
      transition={enableEntrance ? { 
        duration: 2,
        ease: "easeOut"
      } : undefined}
      whileHover={enableHover ? { 
        scale: scrolled ? 1 : 1.05,
        filter: 'brightness(1.1)'
      } : undefined}
    >
      <Image
        src="/logocarwash.jpg"
        alt="Ekhaya Car Wash"
        fill
        className="object-contain logo-animated"
        priority
      />
    </motion.div>
  );
}