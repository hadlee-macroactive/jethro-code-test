import { getRarityWeight, compareRarity } from '../../../src/utils/badge.utils';
import { BadgeRarity } from '../../../src/types/badge.types';

describe('badge.utils', () => {
  describe('getRarityWeight', () => {
    it('should return 1 for COMMON', () => {
      expect(getRarityWeight(BadgeRarity.COMMON)).toBe(1);
    });

    it('should return 2 for RARE', () => {
      expect(getRarityWeight(BadgeRarity.RARE)).toBe(2);
    });

    it('should return 3 for EPIC', () => {
      expect(getRarityWeight(BadgeRarity.EPIC)).toBe(3);
    });

    it('should return 4 for LEGENDARY', () => {
      expect(getRarityWeight(BadgeRarity.LEGENDARY)).toBe(4);
    });

    it('should return 0 for unknown rarity string', () => {
      expect(getRarityWeight('unknown' as BadgeRarity)).toBe(0);
    });
  });

  describe('compareRarity', () => {
    it('should return positive when b is rarer than a', () => {
      expect(compareRarity(BadgeRarity.COMMON, BadgeRarity.RARE)).toBeGreaterThan(0);
    });

    it('should return negative when a is rarer than b', () => {
      expect(compareRarity(BadgeRarity.EPIC, BadgeRarity.COMMON)).toBeLessThan(0);
    });

    it('should return 0 for same rarity', () => {
      expect(compareRarity(BadgeRarity.RARE, BadgeRarity.RARE)).toBe(0);
    });

    it('should sort legendary first (descending)', () => {
      const rarities = [BadgeRarity.COMMON, BadgeRarity.LEGENDARY, BadgeRarity.RARE];
      const sorted = rarities.sort(compareRarity);
      expect(sorted[0]).toBe(BadgeRarity.LEGENDARY);
      expect(sorted[2]).toBe(BadgeRarity.COMMON);
    });
  });
});
