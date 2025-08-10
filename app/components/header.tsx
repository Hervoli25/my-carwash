

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
  X,
  Shield
} from 'lucide-react';

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
          {/* Business Name with Mirror Effects & Animations */}
          <Link href="/" className="flex items-center justify-center py-2 group">
            <div className="text-center business-name relative overflow-hidden px-4 py-2" data-text="PRESTIGE CAR WASH BY EKHAYA">
              {/* Animated particles background */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-red-400/30 rounded-full animate-ping"></div>
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/30 rounded-full animate-ping animation-delay-500"></div>
                <div className="absolute top-1/2 left-3/4 w-0.5 h-0.5 bg-red-300/40 rounded-full animate-pulse animation-delay-1000"></div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight relative z-10">
                <span className="ekhaya-red">PRESTIGE</span>{' '}
                <span className="text-foreground font-extrabold">CAR WASH</span>
              </h1>
              <p className="text-sm md:text-base font-semibold ekhaya-blue tracking-wide relative z-10 mt-1">
                BY EKHAYA
              </p>

              {/* Glass reflection overlay */}
              <div className="absolute inset-0 glass-reflection transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-20"></div>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg z-5"></div>

              {/* Mirror reflection */}
              <div className="absolute top-full left-0 right-0 h-8 bg-gradient-to-b from-white/10 to-transparent transform scale-y-[-1] opacity-30 pointer-events-none"></div>
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
                    <DropdownMenuItem asChild>
                      <Link href="/admin/login" className="flex items-center text-orange-600">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Access
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
