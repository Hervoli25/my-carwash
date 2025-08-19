

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  LogOut,
  Settings,
  Calendar,
  Menu,
  X
} from 'lucide-react';
import { AnimatedLogo } from '@/components/animations/animated-logo';

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '#home', scrollTo: 'home' },
    { name: 'Services', href: '#services', scrollTo: 'services' },
    { name: 'Features', href: '/features' },
    { name: 'Book Online', href: '/book' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
      });
    }
    setMobileMenuOpen(false);
  };

  const handleNavClick = (item: any, e: React.MouseEvent) => {
    if (item.scrollTo) {
      e.preventDefault();
      scrollToSection(item.scrollTo);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-44 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center py-2 group">
            <div className="relative w-48 h-16 md:w-56 md:h-20 transition-all duration-300 hover:scale-105">
              <Image
                src="/with_nobg.png"
                alt="Prestige Car Wash by Ekhaya Intel Trading"
                fill
                className="object-contain transition-all duration-300 hover:brightness-110"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(item, e)}
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary ekhaya-red hover:font-semibold cursor-pointer"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard link for logged-in users */}
                <Link href="/dashboard" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {session.user?.name?.split(' ')[0] || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center cursor-pointer"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="btn-ekhaya-red">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className="block px-3 py-2 text-base font-medium text-foreground/60 hover:text-foreground cursor-pointer"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
