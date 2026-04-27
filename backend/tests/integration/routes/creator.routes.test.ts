import Fastify, { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/services/creator-config.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { creatorRoutes } from '../../../src/api/routes/creator.routes';
import { CreatorConfigService } from '../../../src/services/creator-config.service';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

function createToken(userId: number, creatorId: number, role = 'user') {
  return jwt.sign({ userId, creatorId, role }, JWT_SECRET);
}

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();
  app.register(creatorRoutes, { prefix: '/v1/creators' });
  return app;
}

describe('Creator Routes', () => {
  let app: FastifyInstance;
  let configServiceInstance: any;

  beforeEach(() => {
    configServiceInstance = {
      getConfig: jest.fn().mockResolvedValue({
        creatorId: 100,
        streakSettings: {},
        badgeSettings: {},
        leaderboardSettings: {},
        notificationSettings: {},
        featureFlags: { streaksEnabled: true, badgesEnabled: true }
      }),
      updateConfig: jest.fn().mockResolvedValue({ id: 'config-1', creatorId: 100 })
    };
    (CreatorConfigService as any).mockImplementation(() => configServiceInstance);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('GET /v1/creators/:creatorId/config', () => {
    it('should return 401 without auth', async () => {
      app = await buildApp();
      const response = await app.inject({
        method: 'GET',
        url: '/v1/creators/100/config'
      });
      expect(response.statusCode).toBe(401);
    });

    it('should return config for authenticated creator', async () => {
      app = await buildApp();
      const token = createToken(100, 100, 'creator');
      const response = await app.inject({
        method: 'GET',
        url: '/v1/creators/100/config',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.creatorId).toBe(100);
    });

    it('should return 403 for different creator', async () => {
      app = await buildApp();
      const token = createToken(100, 200, 'creator');
      const response = await app.inject({
        method: 'GET',
        url: '/v1/creators/100/config',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(403);
    });

    it('should allow admin access', async () => {
      app = await buildApp();
      const token = createToken(1, 999, 'admin');
      const response = await app.inject({
        method: 'GET',
        url: '/v1/creators/100/config',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('PATCH /v1/creators/:creatorId/config', () => {
    it('should update config', async () => {
      app = await buildApp();
      const token = createToken(100, 100, 'creator');
      const response = await app.inject({
        method: 'PATCH',
        url: '/v1/creators/100/config',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ streakSettings: { freezeEnabled: false } })
      });
      expect(response.statusCode).toBe(200);
      expect(configServiceInstance.updateConfig).toHaveBeenCalled();
    });
  });
});
