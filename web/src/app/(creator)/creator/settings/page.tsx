'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Award, Flame, Utensils, Heart, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUserStore } from '@/lib/store/user.store';
import { useCreatorConfig, useUpdateStreakConfig, useUpdateBadgeConfig, useAwardBadge } from '@/lib/hooks/use-creator';
import type { StreakSettings, BadgeSettings, StreakTypeConfig, CustomBadgeConfig } from '@/types';

const STREAK_TYPES = [
  { key: 'workout', label: 'Workout', icon: Flame },
  { key: 'nutrition', label: 'Nutrition', icon: Utensils },
  { key: 'habit', label: 'Habit', icon: Heart },
  { key: 'community', label: 'Community', icon: Users },
] as const;

const DEFAULT_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

export default function CreatorSettingsPage() {
  const { creatorId } = useUserStore();
  const { data: config, isLoading } = useCreatorConfig(creatorId);
  const updateStreakConfig = useUpdateStreakConfig(creatorId);
  const updateBadgeConfig = useUpdateBadgeConfig(creatorId);

  // Streak settings state
  const [streakSettings, setStreakSettings] = useState<StreakSettings>({
    enabled_streak_types: ['workout'],
    workout: { enabled: true, minimum_per_day: 1 },
    freeze_settings: { freezes_per_period: 1, period_days: 30 },
    milestones: { enabled: [7, 14, 30, 60, 90] },
  });

  // Badge settings state
  const [badgeSettings, setBadgeSettings] = useState<BadgeSettings>({
    enabled_categories: ['consistency', 'milestone'],
    auto_award_enabled: true,
    custom_badges: [],
  });

  // Award badge state
  const [awardUserId, setAwardUserId] = useState('');
  const [awardBadgeCode, setAwardBadgeCode] = useState('');
  const [awardReason, setAwardReason] = useState('');
  const awardBadge = useAwardBadge();

  useEffect(() => {
    if (config?.streakSettings) {
      const cs = config.streakSettings;
      setStreakSettings({
        enabled_streak_types: cs.enabled_streak_types || ['workout'],
        workout: cs.workout || { enabled: true, minimum_per_day: 1 },
        nutrition: cs.nutrition,
        habit: cs.habit,
        community: cs.community,
        freeze_settings: cs.freeze_settings || { freezes_per_period: 1, period_days: 30 },
        milestones: cs.milestones || { enabled: [7, 14, 30, 60, 90] },
      });
    }
    if (config?.badgeSettings) {
      setBadgeSettings({
        enabled_categories: config.badgeSettings.enabled_categories || [],
        auto_award_enabled: config.badgeSettings.auto_award_enabled ?? true,
        custom_badges: config.badgeSettings.custom_badges || [],
      });
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    );
  }

  const toggleStreakType = (type: string) => {
    const enabled = streakSettings.enabled_streak_types.includes(type);
    const newTypes = enabled
      ? streakSettings.enabled_streak_types.filter(t => t !== type)
      : [...streakSettings.enabled_streak_types, type];

    const currentConfig = (streakSettings as any)[type] as StreakTypeConfig | undefined;
    setStreakSettings(prev => ({
      ...prev,
      enabled_streak_types: newTypes,
      [type]: {
        ...currentConfig,
        enabled: !enabled,
      } as StreakTypeConfig,
    }));
  };

  const toggleMilestone = (milestone: number) => {
    const current = streakSettings.milestones?.enabled || [];
    const enabled = current.includes(milestone);
    setStreakSettings(prev => ({
      ...prev,
      milestones: {
        ...prev.milestones,
        enabled: enabled ? current.filter(m => m !== milestone) : [...current, milestone].sort((a, b) => a - b),
      },
    }));
  };

  const toggleBadgeCategory = (category: string) => {
    const enabled = badgeSettings.enabled_categories.includes(category);
    setBadgeSettings(prev => ({
      ...prev,
      enabled_categories: enabled
        ? prev.enabled_categories.filter(c => c !== category)
        : [...prev.enabled_categories, category],
    }));
  };

  const addCustomBadge = () => {
    setBadgeSettings(prev => ({
      ...prev,
      custom_badges: [
        ...(prev.custom_badges || []),
        { name: '', description: '', criteria: { type: 'manual' } },
      ],
    }));
  };

  const removeCustomBadge = (index: number) => {
    setBadgeSettings(prev => ({
      ...prev,
      custom_badges: (prev.custom_badges || []).filter((_, i) => i !== index),
    }));
  };

  const updateCustomBadge = (index: number, field: keyof CustomBadgeConfig, value: string) => {
    setBadgeSettings(prev => ({
      ...prev,
      custom_badges: (prev.custom_badges || []).map((b, i) =>
        i === index ? { ...b, [field]: value } : b
      ),
    }));
  };

  const handleSaveStreak = () => {
    updateStreakConfig.mutate(streakSettings);
  };

  const handleSaveBadge = () => {
    updateBadgeConfig.mutate(badgeSettings);
  };

  const handleAwardBadge = () => {
    if (!awardUserId || !awardBadgeCode) return;
    awardBadge.mutate({
      userId: parseInt(awardUserId),
      data: {
        badge_code: awardBadgeCode,
        reason: awardReason || undefined,
        notify_user: true,
      },
    });
    setAwardUserId('');
    setAwardBadgeCode('');
    setAwardReason('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="streaks">
        <TabsList>
          <TabsTrigger value="streaks">Streak Configuration</TabsTrigger>
          <TabsTrigger value="badges">Badge Configuration</TabsTrigger>
          <TabsTrigger value="award">Award Badge</TabsTrigger>
        </TabsList>

        {/* Streak Configuration */}
        <TabsContent value="streaks" className="space-y-6 mt-4">
          {/* Streak Types */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Streak Types</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enable or disable streak types for your subscribers.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STREAK_TYPES.map(({ key, label, icon: Icon }) => {
                const enabled = streakSettings.enabled_streak_types.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleStreakType(key)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      enabled ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Icon className={enabled ? 'text-primary' : 'text-gray-400'} size={20} />
                    <span className={`text-sm font-medium ${enabled ? 'text-foreground' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Freeze Settings */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Freeze Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Freezes per period</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={streakSettings.freeze_settings?.freezes_per_period ?? 1}
                  onChange={e => setStreakSettings(prev => ({
                    ...prev,
                    freeze_settings: {
                      ...prev.freeze_settings!,
                      freezes_per_period: parseInt(e.target.value) || 0,
                    },
                  }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Period (days)</label>
                <input
                  type="number"
                  min={7}
                  max={90}
                  value={streakSettings.freeze_settings?.period_days ?? 30}
                  onChange={e => setStreakSettings(prev => ({
                    ...prev,
                    freeze_settings: {
                      ...prev.freeze_settings!,
                      period_days: parseInt(e.target.value) || 30,
                    },
                  }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Milestones */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Milestones</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select which milestones trigger celebrations and badges.
            </p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_MILESTONES.map(milestone => {
                const enabled = streakSettings.milestones?.enabled?.includes(milestone) ?? false;
                return (
                  <button
                    key={milestone}
                    onClick={() => toggleMilestone(milestone)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      enabled
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {milestone} days
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveStreak} disabled={updateStreakConfig.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateStreakConfig.isPending ? 'Saving...' : 'Save Streak Configuration'}
            </Button>
          </div>
        </TabsContent>

        {/* Badge Configuration */}
        <TabsContent value="badges" className="space-y-6 mt-4">
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Badge Categories</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enable or disable badge categories for your subscribers.
            </p>
            <div className="flex flex-wrap gap-2">
              {['consistency', 'milestone', 'challenge', 'certification', 'community'].map(cat => {
                const enabled = badgeSettings.enabled_categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleBadgeCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border capitalize transition-colors ${
                      enabled
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Auto-award */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Auto-Award Badges</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically award badges when criteria are met
                </p>
              </div>
              <button
                onClick={() => setBadgeSettings(prev => ({
                  ...prev,
                  auto_award_enabled: !prev.auto_award_enabled,
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  badgeSettings.auto_award_enabled ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  badgeSettings.auto_award_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </Card>

          {/* Custom Badges */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Custom Badges</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create custom badges for your community
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addCustomBadge}>
                <Plus className="w-4 h-4 mr-1" />
                Add Badge
              </Button>
            </div>

            {(badgeSettings.custom_badges || []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No custom badges yet</p>
              </div>
            )}

            <div className="space-y-4">
              {(badgeSettings.custom_badges || []).map((badge, index) => (
                <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Badge name"
                      value={badge.name}
                      onChange={e => updateCustomBadge(index, 'name', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={badge.description}
                      onChange={e => updateCustomBadge(index, 'description', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCustomBadge(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveBadge} disabled={updateBadgeConfig.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateBadgeConfig.isPending ? 'Saving...' : 'Save Badge Configuration'}
            </Button>
          </div>
        </TabsContent>

        {/* Award Badge */}
        <TabsContent value="award" className="space-y-6 mt-4">
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Manually Award Badge</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Award a badge to a specific user. The user will receive a notification.
            </p>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <input
                  type="number"
                  placeholder="Enter user ID"
                  value={awardUserId}
                  onChange={e => setAwardUserId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Badge Code</label>
                <input
                  type="text"
                  placeholder="e.g., special_achievement"
                  value={awardBadgeCode}
                  onChange={e => setAwardBadgeCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reason (optional)</label>
                <textarea
                  placeholder="Why are you awarding this badge?"
                  value={awardReason}
                  onChange={e => setAwardReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <Button
                onClick={handleAwardBadge}
                disabled={!awardUserId || !awardBadgeCode || awardBadge.isPending}
              >
                <Award className="w-4 h-4 mr-2" />
                {awardBadge.isPending ? 'Awarding...' : 'Award Badge'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
