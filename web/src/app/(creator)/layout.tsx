'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, BarChart3, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { useUserStore } from '@/lib/store/user.store';

const creatorNavItems = [
  { href: '/creator', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/creator/settings', label: 'Settings', icon: Settings },
  { href: '/creator/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function CreatorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      <aside className="w-56 shrink-0 hidden lg:block">
        <div className="sticky top-24 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Creator Portal
          </div>

          {creatorNavItems.map((item) => {
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
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile nav */}
        <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-2">
          <Link
            href="/"
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-secondary text-muted-foreground shrink-0"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Link>
          {creatorNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium shrink-0',
                  isActive ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>
    </div>
  );
}
