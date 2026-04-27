import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { randomUUID } from 'crypto';

export async function seedStreaks() {
  console.log('Seeding streaks...');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const streaks = [
    // Active workout streaks
    {
      id: randomUUID(),
      userId: 1n,
      creatorId: 100n,
      streakType: 'workout',
      currentCount: 5,
      longestCount: 12,
      lastActivityDate: today,
      streakStartDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 7,
      milestoneProgress: 71,
      freezeAvailable: true,
      freezeUsedCount: 0,
      metadata: {}
    },
    {
      id: randomUUID(),
      userId: 2n,
      creatorId: 100n,
      streakType: 'workout',
      currentCount: 30,
      longestCount: 30,
      lastActivityDate: today,
      streakStartDate: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 60,
      milestoneProgress: 50,
      freezeAvailable: true,
      freezeUsedCount: 0,
      metadata: {}
    },
    // Active nutrition streak
    {
      id: randomUUID(),
      userId: 1n,
      creatorId: 100n,
      streakType: 'nutrition',
      currentCount: 14,
      longestCount: 14,
      lastActivityDate: today,
      streakStartDate: new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 30,
      milestoneProgress: 46,
      freezeAvailable: true,
      freezeUsedCount: 0,
      metadata: {}
    },
    // Active habit streak
    {
      id: randomUUID(),
      userId: 3n,
      creatorId: 100n,
      streakType: 'habit',
      currentCount: 7,
      longestCount: 7,
      lastActivityDate: today,
      streakStartDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 14,
      milestoneProgress: 50,
      freezeAvailable: true,
      freezeUsedCount: 0,
      metadata: {}
    },
    // Community streak
    {
      id: randomUUID(),
      userId: 4n,
      creatorId: 100n,
      streakType: 'community',
      currentCount: 3,
      longestCount: 3,
      lastActivityDate: today,
      streakStartDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 7,
      milestoneProgress: 42,
      freezeAvailable: true,
      freezeUsedCount: 0,
      metadata: {}
    },
    // At-risk streak (last activity 19 hours ago)
    {
      id: randomUUID(),
      userId: 5n,
      creatorId: 100n,
      streakType: 'workout',
      currentCount: 10,
      longestCount: 10,
      lastActivityDate: new Date(now.getTime() - 19 * 60 * 60 * 1000),
      streakStartDate: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 14,
      milestoneProgress: 71,
      freezeAvailable: true,
      freezeUsedCount: 0,
      metadata: {}
    },
    // Frozen streak
    {
      id: randomUUID(),
      userId: 6n,
      creatorId: 100n,
      streakType: 'workout',
      currentCount: 8,
      longestCount: 8,
      lastActivityDate: new Date(now.getTime() - 26 * 60 * 60 * 1000),
      streakStartDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 14,
      milestoneProgress: 57,
      freezeAvailable: false,
      freezeUsedCount: 1,
      freezeLastUsed: new Date(now.getTime() - 26 * 60 * 60 * 1000),
      metadata: { frozen: true }
    },
    // Broken streak
    {
      id: randomUUID(),
      userId: 7n,
      creatorId: 100n,
      streakType: 'workout',
      currentCount: 0,
      longestCount: 21,
      lastActivityDate: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      streakStartDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      isActive: false,
      nextMilestone: 30,
      milestoneProgress: 0,
      freezeAvailable: false,
      freezeUsedCount: 1,
      metadata: {}
    },
    // Creator 200 streaks
    {
      id: randomUUID(),
      userId: 1n,
      creatorId: 200n,
      streakType: 'workout',
      currentCount: 15,
      longestCount: 15,
      lastActivityDate: today,
      streakStartDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 30,
      milestoneProgress: 50,
      freezeAvailable: true,
      freezeUsedCount: 0,
      metadata: {}
    },
    {
      id: randomUUID(),
      userId: 8n,
      creatorId: 200n,
      streakType: 'nutrition',
      currentCount: 60,
      longestCount: 60,
      lastActivityDate: today,
      streakStartDate: new Date(today.getTime() - 59 * 24 * 60 * 60 * 1000),
      isActive: true,
      nextMilestone: 90,
      milestoneProgress: 66,
      freezeAvailable: true,
      freezeUsedCount: 0,
      metadata: {}
    }
  ];

  for (const streak of streaks) {
    await prisma.streak.create({
      data: streak as any
    });
  }

  console.log(`Seeded ${streaks.length} streaks`);
  return streaks;
}

if (require.main === module) {
  seedStreaks()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
