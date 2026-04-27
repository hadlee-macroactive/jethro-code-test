'use client';

import { useState } from 'react';
import { Flame, Award, TrendingUp, Users, Calendar, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/lib/store/user.store';
import { useCreatorAnalytics } from '@/lib/hooks/use-creator';
import type { CreatorAnalytics } from '@/types';

type Period = '7d' | '30d' | '90d';

function getPeriodDates(period: Period) {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case '7d': start.setDate(start.getDate() - 7); break;
    case '30d': start.setDate(start.getDate() - 30); break;
    case '90d': start.setDate(start.getDate() - 90); break;
  }
  return {
    period_start: start.toISOString().split('T')[0],
    period_end: end.toISOString().split('T')[0],
  };
}

export default function CreatorAnalyticsPage() {
  const { creatorId } = useUserStore();
  const [period, setPeriod] = useState<Period>('30d');
  const dates = getPeriodDates(period);
  const { data: analytics, isLoading } = useCreatorAnalytics(creatorId, dates);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Engagement metrics and retention data for your community
          </p>
        </div>

        {/* Period selector */}
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as Period[]).map(p => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : analytics ? (
        <AnalyticsContent analytics={analytics} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function AnalyticsContent({ analytics }: { analytics: CreatorAnalytics }) {
  const { streak_metrics, badge_metrics, retention_impact } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Active Streaks"
          value={streak_metrics.total_active_streaks.toLocaleString()}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          label="Avg Streak Length"
          value={`${streak_metrics.average_streak_length.toFixed(1)}d`}
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-yellow-500" />}
          label="Badges Earned"
          value={badge_metrics.total_badges_earned.toLocaleString()}
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-blue-500" />}
          label="Churn Reduction"
          value={`-${(retention_impact.churn_reduction * 100).toFixed(1)}%`}
        />
      </div>

      {/* Streak Distribution */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Streak Distribution
        </h2>
        <div className="space-y-4">
          {Object.entries(streak_metrics.streak_distribution).map(([range, count]) => {
            const total = Object.values(streak_metrics.streak_distribution).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={range}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{range.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground">{count} users ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-3" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Badge Metrics */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Badge Completion Rates
        </h2>
        {Object.keys(badge_metrics.completion_rate_by_badge).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(badge_metrics.completion_rate_by_badge).map(([badge, rate]) => (
              <div key={badge}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{badge.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground">{(rate * 100).toFixed(0)}%</span>
                </div>
                <Progress value={rate * 100} className="h-2" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No badge completion data available</p>
        )}

        {badge_metrics.most_common_badge && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">Most Earned Badge</div>
            <div className="font-medium capitalize">{badge_metrics.most_common_badge.replace(/_/g, ' ')}</div>
          </div>
        )}
      </Card>

      {/* Retention */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          Retention Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-primary">
              {(retention_impact.day_7_retention * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">7-Day Retention</div>
            <div className="text-xs text-muted-foreground mt-0.5">Users active after 7 days</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-primary">
              {(retention_impact.day_30_retention * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">30-Day Retention</div>
            <div className="text-xs text-muted-foreground mt-0.5">Users active after 30 days</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              -{(retention_impact.churn_reduction * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Churn Reduction</div>
            <div className="text-xs text-muted-foreground mt-0.5">Compared to non-streak users</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">No Analytics Data</h2>
      <p className="text-muted-foreground">
        Analytics will appear here once your subscribers start using streaks and badges.
      </p>
    </div>
  );
}
