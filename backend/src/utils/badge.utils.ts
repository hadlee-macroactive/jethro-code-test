import { BadgeRarity } from '../types/badge.types';

export function getRarityWeight(rarity: BadgeRarity): number {
  switch (rarity) {
    case BadgeRarity.COMMON: return 1;
    case BadgeRarity.RARE: return 2;
    case BadgeRarity.EPIC: return 3;
    case BadgeRarity.LEGENDARY: return 4;
    default: return 0;
  }
}

export function compareRarity(a: BadgeRarity, b: BadgeRarity): number {
  return getRarityWeight(b) - getRarityWeight(a);
}
