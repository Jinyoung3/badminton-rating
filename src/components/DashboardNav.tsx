'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { formatUserDisplayName } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  userNumber: number;
  rating: number;
  organization: {
    name: string;
  } | null;
}

interface DashboardNavProps {
  user: User;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Record', href: '/record' },
  { label: 'Event', href: '/event' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Player', href: '/player' },
  { label: 'Profile', href: '/profile' },
];

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🏸</span>
            <span className="font-bold text-xl text-primary-600">Badminton Rating</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          {/* User Info & Profile Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatUserDisplayName(user.name, user.userNumber)}
              </div>
              <div className="text-xs text-gray-500">
                Rating: <span className="font-semibold text-primary-600">{user.rating}</span>
                {user.organization && ` • ${user.organization.name}`}
              </div>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto space-x-1 pb-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
