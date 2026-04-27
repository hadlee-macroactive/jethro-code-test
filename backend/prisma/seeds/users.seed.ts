import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('Seeding users...');

  const users = [
    { id: 1n, email: 'alice@example.com', name: 'Alice Johnson' },
    { id: 2n, email: 'bob@example.com', name: 'Bob Smith' },
    { id: 3n, email: 'charlie@example.com', name: 'Charlie Brown' },
    { id: 4n, email: 'diana@example.com', name: 'Diana Prince' },
    { id: 5n, email: 'eve@example.com', name: 'Eve Williams' },
    { id: 6n, email: 'frank@example.com', name: 'Frank Miller' },
    { id: 7n, email: 'grace@example.com', name: 'Grace Lee' },
    { id: 8n, email: 'henry@example.com', name: 'Henry Davis' },
    { id: 9n, email: 'iris@example.com', name: 'Iris Chen' },
    { id: 10n, email: 'jack@example.com', name: 'Jack Wilson' }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user
    });
  }

  const creators = [
    { id: 100n, name: 'MacroActive Fitness', email: 'creator@macroactive.com' },
    { id: 200n, name: 'FitCoach Pro', email: 'coach@fitcoachpro.com' }
  ];

  for (const creator of creators) {
    await prisma.creator.upsert({
      where: { id: creator.id },
      update: {},
      create: creator
    });
  }

  console.log(`Seeded ${users.length} users and ${creators.length} creators`);
  return { users, creators };
}

if (require.main === module) {
  seedUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
