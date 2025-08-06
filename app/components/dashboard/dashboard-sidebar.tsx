
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Calendar,
  Settings,
  CreditCard,
  Crown,
  Bell,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  activeTab: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { name: 'My Bookings', href: '/bookings', icon: Calendar, key: 'bookings' },
  { name: 'Profile Settings', href: '/profile', icon: Settings, key: 'profile' },
  { name: 'Payment Methods', href: '/payment-methods', icon: CreditCard, key: 'payment' },
  { name: 'Membership', href: '/membership', icon: Crown, key: 'membership' },
  { name: 'Notifications', href: '/notifications', icon: Bell, key: 'notifications' },
  { name: 'Support', href: '/support', icon: HelpCircle, key: 'support' },
];

export function DashboardSidebar({ activeTab }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = activeTab === item.key || pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors mt-4 border-t pt-4"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
