import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function seedBadges() {
  console.log('Seeding badges...');

  const badges = [
    // Consistency badges
    {
      id: randomUUID(),
      badgeCode: '3_day_streak',
      badgeCategory: 'consistency',
      name: '3 Day Streak',
      description: 'Maintain a 3-day streak',
      iconUrl: '/badges/3-day-streak.svg',
      rarity: 'common',
      points: 10,
      displayOrder: 1,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeCode: '7_day_consistency',
      badgeCategory: 'consistency',
      name: '7 Day Consistency',
      description: 'Maintain a 7-day streak',
      iconUrl: '/badges/7-day-consistency.svg',
      rarity: 'common',
      points: 25,
      displayOrder: 2,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeCode: '30_day_machine',
      badgeCategory: 'consistency',
      name: '30 Day Machine',
      description: 'Maintain a 30-day streak',
      iconUrl: '/badges/30-day-machine.svg',
      rarity: 'rare',
      points: 100,
      displayOrder: 3,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeCode: '60_day_elite',
      badgeCategory: 'consistency',
      name: '60 Day Elite',
      description: 'Maintain a 60-day streak',
      iconUrl: '/badges/60-day-elite.svg',
      rarity: 'epic',
      points: 250,
      displayOrder: 4,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeCode: '90_day_elite',
      badgeCategory: 'consistency',
      name: '90 Day Elite',
      description: 'Maintain a 90-day streak',
      iconUrl: '/badges/90-day-elite.svg',
      rarity: 'epic',
      points: 500,
      displayOrder: 5,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    // Milestone badges
    {
      id: randomUUID(),
      badgeCode: 'first_workout',
      badgeCategory: 'milestone',
      name: 'First Workout',
      description: 'Complete your first workout',
      iconUrl: '/badges/first-workout.svg',
      rarity: 'common',
      points: 5,
      displayOrder: 6,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeCode: '100_workouts',
      badgeCategory: 'milestone',
      name: '100 Workouts',
      description: 'Complete 100 workouts',
      iconUrl: '/badges/100-workouts.svg',
      rarity: 'rare',
      points: 150,
      displayOrder: 7,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeCode: '1000_workouts',
      badgeCategory: 'milestone',
      name: '1000 Workouts',
      description: 'Complete 1000 workouts',
      iconUrl: '/badges/1000-workouts.svg',
      rarity: 'legendary',
      points: 1000,
      displayOrder: 8,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    // Challenge badges
    {
      id: randomUUID(),
      badgeCode: 'community_champion',
      badgeCategory: 'community',
      name: 'Community Champion',
      description: 'Be an active community member',
      iconUrl: '/badges/community-champion.svg',
      rarity: 'rare',
      points: 75,
      displayOrder: 9,
      isActive: true,
      isCreatorCustomizable: true,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeCode: '180_day_legend',
      badgeCategory: 'consistency',
      name: '180 Day Legend',
      description: 'Maintain a 180-day streak',
      iconUrl: '/badges/180-day-legend.svg',
      rarity: 'legendary',
      points: 750,
      displayOrder: 10,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeCode: '365_day_mythic',
      badgeCategory: 'consistency',
      name: '365 Day Mythic',
      description: 'Maintain a 365-day streak',
      iconUrl: '/badges/365-day-mythic.svg',
      rarity: 'legendary',
      points: 2000,
      displayOrder: 11,
      isActive: true,
      isCreatorCustomizable: false,
      metadata: {}
    }
  ];

  // Store created badge IDs for referencing
  const createdBadges: Record<string, string> = {};

  for (const badge of badges) {
    // Use upsert on badgeCode since it's unique
    const created = await prisma.badge.upsert({
      where: { badgeCode: badge.badgeCode },
      update: {},
      create: badge
    });
    createdBadges[badge.badgeCode] = created.id;
  }

  // Seed badge criteria
  const criteria = [
    {
      id: randomUUID(),
      badgeId: createdBadges['3_day_streak'],
      criterionType: 'streak_days',
      comparisonOperator: '>=',
      thresholdValue: 3,
      streakType: 'workout',
      isRequired: true,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeId: createdBadges['7_day_consistency'],
      criterionType: 'streak_days',
      comparisonOperator: '>=',
      thresholdValue: 7,
      streakType: 'workout',
      isRequired: true,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeId: createdBadges['30_day_machine'],
      criterionType: 'streak_days',
      comparisonOperator: '>=',
      thresholdValue: 30,
      streakType: 'workout',
      isRequired: true,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeId: createdBadges['first_workout'],
      criterionType: 'total_workouts',
      comparisonOperator: '>=',
      thresholdValue: 1,
      isRequired: true,
      metadata: {}
    },
    {
      id: randomUUID(),
      badgeId: createdBadges['100_workouts'],
      criterionType: 'total_workouts',
      comparisonOperator: '>=',
      thresholdValue: 100,
      isRequired: true,
      metadata: {}
    }
  ];

  for (const criterion of criteria) {
    await prisma.badgeCriteria.create({
      data: criterion as any
    });
  }

  // Seed some user badges (awarded badges)
  const userBadges = [
    {
      id: randomUUID(),
      userId: 1n,
      badgeId: createdBadges['3_day_streak'],
      creatorId: 100n,
      awardedBy: 'system',
      awardReason: 'Achieved 3-day workout streak',
      progressPercentage: 100,
      isDisplayed: true,
      displayPriority: 0,
      metadata: {}
    },
    {
      id: randomUUID(),
      userId: 2n,
      badgeId: createdBadges['7_day_consistency'],
      creatorId: 100n,
      awardedBy: 'system',
      awardReason: 'Achieved 7-day workout streak',
      progressPercentage: 100,
      isDisplayed: true,
      displayPriority: 0,
      metadata: {}
    },
    {
      id: randomUUID(),
      userId: 2n,
      badgeId: createdBadges['30_day_machine'],
      creatorId: 100n,
      awardedBy: 'system',
      awardReason: 'Achieved 30-day workout streak',
      progressPercentage: 100,
      isDisplayed: true,
      displayPriority: 1,
      metadata: {}
    },
    {
      id: randomUUID(),
      userId: 8n,
      badgeId: createdBadges['60_day_elite'],
      creatorId: 200n,
      awardedBy: 'system',
      awardReason: 'Achieved 60-day nutrition streak',
      progressPercentage: 100,
      isDisplayed: true,
      displayPriority: 0,
      metadata: {}
    }
  ];

  for (const ub of userBadges) {
    await prisma.userBadge.create({
      data: ub
    });
  }

  // Seed badge progress (in-progress badges)
  const progress = [
    {
      id: randomUUID(),
      userId: 1n,
      badgeId: createdBadges['30_day_machine'],
      creatorId: 100n,
      progressPercentage: 46,
      currentValue: 14,
      targetValue: 30
    },
    {
      id: randomUUID(),
      userId: 3n,
      badgeId: createdBadges['7_day_consistency'],
      creatorId: 100n,
      progressPercentage: 100,
      currentValue: 7,
      targetValue: 7
    },
    {
      id: randomUUID(),
      userId: 5n,
      badgeId: createdBadges['30_day_machine'],
      creatorId: 100n,
      progressPercentage: 33,
      currentValue: 10,
      targetValue: 30
    }
  ];

  for (const p of progress) {
    await prisma.badgeProgress.create({
      data: p
    });
  }

  console.log(`Seeded ${badges.length} badges, ${criteria.length} criteria, ${userBadges.length} user badges, ${progress.length} progress records`);
}
