import { useQuery } from '@tanstack/react-query';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (!response.ok) throw new Error('Unauthorized');
      const json = await response.json();
      return json.data as { userId: number; creatorId: number; role: string; name: string; email: string };
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
