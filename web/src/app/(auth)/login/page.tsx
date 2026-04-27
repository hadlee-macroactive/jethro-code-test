'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Award, Trophy, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useUserStore } from '@/lib/store/user.store';

const DEMO_USERS = [
  { email: 'alice@example.com', name: 'Alice Johnson', label: 'Active User', streak: 5, badges: 1 },
  { email: 'bob@example.com', name: 'Bob Smith', label: '30-Day Streak', streak: 30, badges: 2 },
  { email: 'charlie@example.com', name: 'Charlie Brown', label: 'Habit Builder', streak: 7, badges: 0 },
  { email: 'diana@example.com', name: 'Diana Prince', label: 'Community Star', streak: 3, badges: 0 },
  { email: 'eve@example.com', name: 'Eve Williams', label: 'At Risk', streak: 10, badges: 0 },
];

const DEMO_CREATORS = [
  { email: 'creator@macroactive.com', name: 'MacroActive Fitness', label: 'Creator' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setUser = useUserStore(s => s.setUser);

  async function handleUserLogin(email: string) {
    setLoading(email);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || 'Login failed');
        return;
      }

      const userData = json.data?.user;
      if (userData) {
        setUser({
          userId: userData.userId,
          creatorId: userData.creatorId,
          role: userData.role,
          name: userData.name,
          email: userData.email,
        });
      }

      router.push('/');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  async function handleCreatorLogin(email: string) {
    setLoading(email);
    setError(null);

    try {
      const res = await fetch('/api/auth/login-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || 'Login failed');
        return;
      }

      const userData = json.data?.user;
      if (userData) {
        setUser({
          userId: userData.userId,
          creatorId: userData.creatorId,
          role: userData.role,
          name: userData.name,
          email: userData.email,
        });
      }

      router.push('/creator');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="text-orange-500" size={40} />
            <h1 className="text-3xl font-bold text-gray-900">MacroActive</h1>
          </div>
          <p className="text-gray-500 text-lg">Select a demo account to explore the platform</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="text-orange-500" size={20} />
            Demo Users
          </h2>
          <div className="space-y-3">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleUserLogin(user.email)}
                disabled={loading !== null}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Flame size={12} className="text-orange-500" />
                        {user.streak} day streak
                      </span>
                      <span className="flex items-center gap-1">
                        <Award size={12} className="text-yellow-500" />
                        {user.badges} badge{user.badges !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{user.label}</span>
                  {loading === user.email ? (
                    <Loader2 className="animate-spin text-gray-400" size={18} />
                  ) : (
                    <ArrowRight className="text-gray-300 group-hover:text-orange-500 transition-colors" size={18} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="text-purple-500" size={20} />
            Creator Accounts
          </h2>
          <div className="space-y-3">
            {DEMO_CREATORS.map((creator) => (
              <button
                key={creator.email}
                onClick={() => handleCreatorLogin(creator.email)}
                disabled={loading !== null}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                    {creator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{creator.name}</div>
                    <div className="text-sm text-gray-500">Creator Dashboard Access</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">{creator.label}</span>
                  {loading === creator.email ? (
                    <Loader2 className="animate-spin text-gray-400" size={18} />
                  ) : (
                    <ArrowRight className="text-gray-300 group-hover:text-purple-500 transition-colors" size={18} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Demo environment &middot; No real credentials required &middot; Data resets periodically
        </p>
      </div>
    </div>
  );
}
