'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Award, Trophy, User, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/format';

const sidebarItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/streaks', label: 'Streaks', icon: Flame },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/leaderboards', label: 'Leaderboard', icon: Trophy },
  { href: '/creator', label: 'Creator Portal', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
