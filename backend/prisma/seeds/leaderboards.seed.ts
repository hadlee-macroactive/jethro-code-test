import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function seedLeaderboards() {
  console.log('Seeding leaderboards...');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Weekly leaderboard entries
  const weeklyEntries = [
    { userId: 2, userName: 'Bob Smith', rank: 1, score: 30, streakType: 'workout' },
    { userId: 8, userName: 'Henry Davis', rank: 2, score: 60, streakType: 'nutrition' },
    { userId: 5, userName: 'Eve Williams', rank: 3, score: 10, streakType: 'workout' },
    { userId: 1, userName: 'Alice Johnson', rank: 4, score: 5, streakType: 'workout' },
    { userId: 3, userName: 'Charlie Brown', rank: 5, score: 7, streakType: 'habit' },
    { userId: 6, userName: 'Frank Miller', rank: 6, score: 8, streakType: 'workout' },
    { userId: 4, userName: 'Diana Prince', rank: 7, score: 3, streakType: 'community' }
  ];

  // Monthly leaderboard entries
  const monthlyEntries = [
    { userId: 8, userName: 'Henry Davis', rank: 1, score: 60, streakType: 'nutrition' },
    { userId: 2, userName: 'Bob Smith', rank: 2, score: 30, streakType: 'workout' },
    { userId: 1, userName: 'Alice Johnson', rank: 3, score: 14, streakType: 'nutrition' },
    { userId: 6, userName: 'Frank Miller', rank: 4, score: 8, streakType: 'workout' },
    { userId: 3, userName: 'Charlie Brown', rank: 5, score: 7, streakType: 'habit' }
  ];

  const leaderboards = [
    {
      id: randomUUID(),
      creatorId: 100n,
      leaderboardType: 'weekly_workout',
      periodStart: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      periodEnd: today,
      entries: weeklyEntries,
      lastRefreshed: now
    },
    {
      id: randomUUID(),
      creatorId: 100n,
      leaderboardType: 'monthly_streak',
      periodStart: new Date(today.getFullYear(), today.getMonth(), 1),
      periodEnd: today,
      entries: monthlyEntries,
      lastRefreshed: now
    },
    {
      id: randomUUID(),
      creatorId: 200n,
      leaderboardType: 'weekly_workout',
      periodStart: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      periodEnd: today,
      entries: [
        { userId: 1, userName: 'Alice Johnson', rank: 1, score: 15, streakType: 'workout' },
        { userId: 8, userName: 'Henry Davis', rank: 2, score: 60, streakType: 'nutrition' }
      ],
      lastRefreshed: now
    }
  ];

  for (const lb of leaderboards) {
    await prisma.leaderboard.create({
      data: lb as any
    });
  }

  console.log(`Seeded ${leaderboards.length} leaderboards`);
}
