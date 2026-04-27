import { PrismaClient } from '@prisma/client';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(userId: number) {
    const record = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) }
    });
    return record ? {
      id: Number(record.id),
      email: record.email,
      name: record.name
    } : null;
  }

  async findByIds(userIds: number[]) {
    const records = await this.prisma.user.findMany({
      where: { id: { in: userIds.map(id => BigInt(id)) } }
    });
    return records.map(record => ({
      id: Number(record.id),
      email: record.email,
      name: record.name
    }));
  }
}
