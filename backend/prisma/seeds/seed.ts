import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';
import { seedStreaks } from './streaks.seed';
import { seedBadges } from './badges.seed';
import { seedLeaderboards } from './leaderboards.seed';

const prisma = new PrismaClient();

async function clearAll() {
  console.log('Clearing existing data...');

  // Delete in reverse dependency order
  await prisma.badgeProgress.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badgeCriteria.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.leaderboard.deleteMany({});
  await prisma.streakEvent.deleteMany({});
  await prisma.streakFreeze.deleteMany({});
  await prisma.streakHistory.deleteMany({});
  await prisma.streak.deleteMany({});
  await prisma.creatorConfiguration.deleteMany({});
  await prisma.dailyStreakMetrics.deleteMany({});
  await prisma.dailyBadgeMetrics.deleteMany({});
  // Keep User and Creator reference tables - they may be managed externally

  console.log('Data cleared.');
}

async function main() {
  console.log('Starting database seeding...\n');

  await clearAll();

  await seedUsers();
  await seedStreaks();
  await seedBadges();
  await seedLeaderboards();

  console.log('\nSeeding complete!');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
