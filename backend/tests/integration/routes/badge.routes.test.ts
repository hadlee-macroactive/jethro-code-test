import Fastify, { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/services/badge.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { badgeRoutes } from '../../../src/api/routes/badge.routes';
import { BadgeService } from '../../../src/services/badge.service';
import { Badge, BadgeRarity, BadgeCategory } from '../../../src/types/badge.types';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const makeBadge = (overrides: Partial<Badge> = {}): Badge => ({
  id: 'badge-1',
  badgeCode: '3_day_streak',
  badgeCategory: BadgeCategory.CONSISTENCY,
  name: '3 Day Streak',
  description: 'Get a 3 day streak',
  iconUrl: null,
  rarity: BadgeRarity.COMMON,
  points: 10,
  displayOrder: 1,
  isActive: true,
  isCreatorCustomizable: false,
  requiredBadgeId: null,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

function createToken(userId: number, creatorId: number, role = 'user') {
  return jwt.sign({ userId, creatorId, role }, JWT_SECRET);
}

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();
  app.register(badgeRoutes, { prefix: '/v1/badges' });
  return app;
}

describe('Badge Routes', () => {
  let app: FastifyInstance;
  let badgeServiceInstance: any;

  beforeEach(() => {
    badgeServiceInstance = {
      getUserBadges: jest.fn().mockResolvedValue({ earned: [], inProgress: [] }),
      getBadgeCatalog: jest.fn().mockResolvedValue([makeBadge()]),
      getBadgeDetail: jest.fn().mockResolvedValue(null),
      awardBadge: jest.fn()
    };
    (BadgeService as any).mockImplementation(() => badgeServiceInstance);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('GET /v1/badges/users/:userId', () => {
    it('should return 401 without auth', async () => {
      app = await buildApp();
      const response = await app.inject({
        method: 'GET',
        url: '/v1/badges/users/1'
      });
      expect(response.statusCode).toBe(401);
    });

    it('should return user badges', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/badges/users/1',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.earned).toBeDefined();
    });

    it('should return 403 for different user', async () => {
      app = await buildApp();
      const token = createToken(2, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/badges/users/1',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /v1/badges/catalog', () => {
    it('should return badge catalog', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/badges/catalog',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.badges).toBeDefined();
    });
  });

  describe('GET /v1/badges/:badgeCode', () => {
    it('should return 404 for unknown badge', async () => {
      badgeServiceInstance.getBadgeDetail.mockResolvedValue(null);
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/badges/nonexistent',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return badge detail', async () => {
      badgeServiceInstance.getBadgeDetail.mockResolvedValue({
        ...makeBadge(),
        isEarned: false,
        progressPercentage: 50
      });
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/badges/3_day_streak',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('POST /v1/badges/users/:userId/award', () => {
    it('should return 403 for non-creator user', async () => {
      app = await buildApp();
      const token = createToken(1, 100, 'user');
      const response = await app.inject({
        method: 'POST',
        url: '/v1/badges/users/1/award',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ badge_code: '3_day_streak', reason: 'Test' })
      });
      expect(response.statusCode).toBe(403);
    });
  });
});
