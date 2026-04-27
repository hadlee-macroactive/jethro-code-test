import { CacheService } from '../../../src/services/cache.service';

jest.mock('../../../src/config/redis', () => ({
  getRedisClient: jest.fn()
}));

jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { getRedisClient } from '../../../src/config/redis';

describe('CacheService', () => {
  let service: CacheService;
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      keys: jest.fn()
    };
    (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
    service = new CacheService();
  });

  describe('get', () => {
    it('should return parsed value from Redis', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
      const result = await service.get('test-key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await service.get('missing');
      expect(result).toBeNull();
    });

    it('should return null when Redis is unavailable', async () => {
      (getRedisClient as jest.Mock).mockReturnValue(null);
      const result = await service.get('test-key');
      expect(result).toBeNull();
    });

    it('should return null on Redis error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));
      const result = await service.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with TTL when provided', async () => {
      await service.set('key', { data: 1 }, 300);
      expect(mockRedis.setex).toHaveBeenCalledWith('key', 300, JSON.stringify({ data: 1 }));
    });

    it('should set value without TTL when not provided', async () => {
      await service.set('key', { data: 1 });
      expect(mockRedis.set).toHaveBeenCalledWith('key', JSON.stringify({ data: 1 }));
    });

    it('should not throw when Redis is unavailable', async () => {
      (getRedisClient as jest.Mock).mockReturnValue(null);
      await expect(service.set('key', 'value')).resolves.toBeUndefined();
    });
  });

  describe('del', () => {
    it('should delete key from Redis', async () => {
      await service.del('key');
      expect(mockRedis.del).toHaveBeenCalledWith('key');
    });

    it('should not throw when Redis is unavailable', async () => {
      (getRedisClient as jest.Mock).mockReturnValue(null);
      await expect(service.del('key')).resolves.toBeUndefined();
    });
  });

  describe('delPattern', () => {
    it('should delete all matching keys', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      await service.delPattern('streaks:*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
    });

    it('should not call del when no keys match', async () => {
      mockRedis.keys.mockResolvedValue([]);
      await service.delPattern('nomatch:*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('invalidateUser', () => {
    it('should invalidate all user cache patterns', async () => {
      mockRedis.keys.mockResolvedValue([]);
      await service.invalidateUser(1);
      expect(mockRedis.keys).toHaveBeenCalledWith('streaks:1:*');
      expect(mockRedis.keys).toHaveBeenCalledWith('badges:1:*');
      expect(mockRedis.keys).toHaveBeenCalledWith('leaderboard:1:*');
    });
  });

  describe('invalidateCreator', () => {
    it('should invalidate all creator cache patterns', async () => {
      mockRedis.keys.mockResolvedValue([]);
      await service.invalidateCreator(100);
      expect(mockRedis.keys).toHaveBeenCalledWith('badge_catalog:100:*');
      expect(mockRedis.keys).toHaveBeenCalledWith('leaderboard:creator:100:*');
    });
  });
});
