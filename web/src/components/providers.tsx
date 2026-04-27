'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store/user.store';

function SessionInitializer() {
  const { hydrated, setUser, setHydrated } = useUserStore();

  useEffect(() => {
    if (hydrated) return;

    async function initSession() {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setUser({
              userId: json.data.userId,
              creatorId: json.data.creatorId,
              role: json.data.role,
              name: json.data.name,
              email: json.data.email,
            });
          }
        }
      } catch {
        // Not authenticated - that's fine, user will see login prompt
      } finally {
        setHydrated(true);
      }
    }

    initSession();
  }, [hydrated, setUser, setHydrated]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionInitializer />
      {children}
    </QueryClientProvider>
  );
}
