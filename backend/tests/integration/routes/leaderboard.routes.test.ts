import Fastify, { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/services/leaderboard.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { leaderboardRoutes } from '../../../src/api/routes/leaderboard.routes';
import { LeaderboardService } from '../../../src/services/leaderboard.service';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

function createToken(userId: number, creatorId: number, role = 'user') {
  return jwt.sign({ userId, creatorId, role }, JWT_SECRET);
}

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();
  app.register(leaderboardRoutes, { prefix: '/v1/leaderboards' });
  return app;
}

describe('Leaderboard Routes', () => {
  let app: FastifyInstance;
  let leaderboardServiceInstance: any;

  beforeEach(() => {
    leaderboardServiceInstance = {
      getLeaderboard: jest.fn().mockResolvedValue({
        leaderboardType: 'weekly',
        periodStart: '2024-01-15',
        periodEnd: '2024-01-22',
        entries: [{ userId: 1, rank: 1, score: 100 }],
        currentUser: null
      }),
      refreshLeaderboard: jest.fn().mockResolvedValue(undefined)
    };
    (LeaderboardService as any).mockImplementation(() => leaderboardServiceInstance);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('GET /v1/leaderboards/:leaderboardType', () => {
    it('should return 401 without auth', async () => {
      app = await buildApp();
      const response = await app.inject({
        method: 'GET',
        url: '/v1/leaderboards/weekly'
      });
      expect(response.statusCode).toBe(401);
    });

    it('should return leaderboard data', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'GET',
        url: '/v1/leaderboards/weekly',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.leaderboardType).toBe('weekly');
      expect(body.data.entries).toHaveLength(1);
    });
  });

  describe('POST /v1/leaderboards/:leaderboardType/refresh', () => {
    it('should trigger leaderboard refresh', async () => {
      app = await buildApp();
      const token = createToken(1, 100);
      const response = await app.inject({
        method: 'POST',
        url: '/v1/leaderboards/weekly/refresh',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.refreshed).toBe(true);
    });
  });
});
