'use client';

import { Flame, Award, TrendingUp, Users, Activity, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/lib/store/user.store';
import { useCreatorConfig, useCreatorAnalytics } from '@/lib/hooks/use-creator';
import Link from 'next/link';

export default function CreatorDashboardPage() {
  const { creatorId } = useUserStore();
  const { data: config } = useCreatorConfig(creatorId);
  const { data: analytics, isLoading } = useCreatorAnalytics(creatorId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const streakMetrics = analytics?.streak_metrics;
  const badgeMetrics = analytics?.badge_metrics;
  const retention = analytics?.retention_impact;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor engagement and configure streaks &amp; badges for your community
          </p>
        </div>
        <Link href="/creator/settings">
          <Button variant="outline">
            Configure
          </Button>
        </Link>
      </div>

      {/* Feature Status */}
      <div className="flex gap-3 flex-wrap">
        <FeatureBadge
          label="Streaks"
          enabled={config?.featureFlags?.streaks_enabled ?? true}
        />
        <FeatureBadge
          label="Badges"
          enabled={config?.featureFlags?.badges_enabled ?? true}
        />
        <FeatureBadge
          label="Leaderboards"
          enabled={config?.featureFlags?.leaderboards_enabled ?? true}
        />
        <FeatureBadge
          label="Freeze"
          enabled={config?.featureFlags?.freeze_enabled ?? true}
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Streaks"
          value={streakMetrics?.total_active_streaks ?? 0}
          subtitle="across all users"
          icon={<Flame className="w-5 h-5 text-orange-500" />}
        />
        <MetricCard
          title="Avg Streak Length"
          value={`${streakMetrics?.average_streak_length ?? 0}d`}
          subtitle="average across active"
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
        />
        <MetricCard
          title="Badges Earned"
          value={badgeMetrics?.total_badges_earned ?? 0}
          subtitle="total earned by users"
          icon={<Award className="w-5 h-5 text-yellow-500" />}
        />
      </div>

      {/* Streak Distribution */}
      {streakMetrics?.streak_distribution && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Streak Distribution</h2>
          <div className="space-y-3">
            {Object.entries(streakMetrics.streak_distribution).map(([range, count]) => {
              const total = Object.values(streakMetrics.streak_distribution).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={range} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-muted-foreground">{range.replace(/_/g, ' ')}</div>
                  <div className="flex-1">
                    <Progress value={pct} className="h-2" />
                  </div>
                  <div className="text-sm font-medium w-16 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Retention Impact */}
      {retention && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Retention Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {((retention.day_7_retention ?? 0) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">7-Day Retention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {((retention.day_30_retention ?? 0) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">30-Day Retention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                -{((retention.churn_reduction ?? 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Churn Reduction</div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/creator/settings">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Configure Settings</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage streak types, badge rules, and feature flags
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Card>
        </Link>
        <Link href="/creator/analytics">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed engagement metrics and retention data
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
    </Card>
  );
}

function FeatureBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
      enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
      {label}
    </div>
  );
}
