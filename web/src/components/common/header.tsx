'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Award, Trophy, User, Menu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { UserNav } from './user-nav';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store/ui.store';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Flame },
  { href: '/streaks', label: 'Streaks', icon: Flame },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/leaderboards', label: 'Leaderboard', icon: Trophy },
  { href: '/creator', label: 'Creator', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Header() {
  const pathname = usePathname();
  const toggleSidebar = useUIStore(s => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Flame className="text-primary" size={28} />
              <span className="font-bold text-lg">MacroActive</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <UserNav />
        </div>
      </div>
    </header>
  );
}
