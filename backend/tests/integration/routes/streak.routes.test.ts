import Fastify, { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

// Mock services before importing routes
jest.mock('../../../src/services/streak.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { streakRoutes } from '../../../src/api/routes/streak.routes';
import { StreakService } from '../../../src/services/streak.service';
import { StreakType, Streak } from '../../../src/types/streak.types';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const makeStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: 'streak-1',
  userId: 1,
  creatorId: 100,
  streakType: StreakType.WORKOUT,
  currentCount: 5,
  longestCount: 10,
  lastActivityDate: new Date(),
  streakStartDate: new Date('2024-01-01'),
  isActive: true,
  nextMilestone: 7,
  milestoneProgress: 71,
  freezeAvailable: true,
  freezeUsedCount: 0,
  freezeLastUsed: null,
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
  app.register(streakRoutes, { prefix: '/v1/streaks' });
  return app;
}

describe('Streak Routes', () => {
  let app: FastifyInstance;
  let streakServiceInstance: any;

  beforeEach(() => {
    streakServiceInstance = {
      getUserStreaks: jest.fn().mockResolvedValue([makeStreak()]),
      getStreakHistory: jest.fn().mockResolvedValue({ history: [], total: 0 }),
      activateFreeze: jest.fn().mockResolvedValue(makeStreak({ freezeAvailable: false })),
      getAtRiskStreaks: jest.fn().mockResolvedValue([])
    };
    (StreakService as any).mockImplementation(() => streakServiceInstance);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('GET /v1/streaks/users/:userId', () => {
    it('should return 401 without auth token', async () => {
      app = await buildApp();
      const response = await app.inject({
        method: 'GET',
        url: '/v1/streaks/users/1'
      });
      expect(response.statusCode).toBe(401);
    });

    it('should return streaks for authenticated user', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/streaks/users/1',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.streaks).toBeDefined();
    });

    it('should return 403 when accessing other user data as non-admin', async () => {
      app = await buildApp();
      const token = createToken(2, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/streaks/users/1',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(403);
    });

    it('should allow admin to access any user data', async () => {
      app = await buildApp();
      const token = createToken(999, 100, 'admin');
      const response = await app.inject({
        method: 'GET',
        url: '/v1/streaks/users/1',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
    });

    it('should include history when requested', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/streaks/users/1?include_history=true',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.history).toBeDefined();
    });
  });

  describe('POST /v1/streaks/users/:userId/freeze', () => {
    it('should activate freeze', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'POST',
        url: '/v1/streaks/users/1/freeze',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ streak_type: 'workout', reason: 'Rest day' })
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.freeze_activated).toBe(true);
    });

    it('should return 400 when freeze fails', async () => {
      streakServiceInstance.activateFreeze.mockRejectedValue(new Error('No freeze available'));
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'POST',
        url: '/v1/streaks/users/1/freeze',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ streak_type: 'workout' })
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /v1/streaks/users/:userId/history', () => {
    it('should return paginated history', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/streaks/users/1/history?limit=10&offset=0',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });
  });

  describe('GET /v1/streaks/leaderboards/:leaderboardType', () => {
    it('should return leaderboard data', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/streaks/leaderboards/weekly',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.leaderboard_type).toBe('weekly');
    });
  });
});
