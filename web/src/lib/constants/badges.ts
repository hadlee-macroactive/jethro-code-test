import { BadgeRarity, BadgeCategory } from '@/types';

export const BADGE_RARITY_ORDER: Record<BadgeRarity, number> = {
  [BadgeRarity.LEGENDARY]: 0,
  [BadgeRarity.EPIC]: 1,
  [BadgeRarity.RARE]: 2,
  [BadgeRarity.COMMON]: 3,
};

export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  [BadgeRarity.COMMON]: '#95A5A6',
  [BadgeRarity.RARE]: '#3498DB',
  [BadgeRarity.EPIC]: '#9B59B6',
  [BadgeRarity.LEGENDARY]: '#F39C12',
};

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  [BadgeCategory.CONSISTENCY]: 'Consistency',
  [BadgeCategory.MILESTONE]: 'Milestone',
  [BadgeCategory.CHALLENGE]: 'Challenge',
  [BadgeCategory.CERTIFICATION]: 'Certification',
  [BadgeCategory.COMMUNITY]: 'Community',
};

export const BADGE_RARITY_LABELS: Record<BadgeRarity, string> = {
  [BadgeRarity.COMMON]: 'Common',
  [BadgeRarity.RARE]: 'Rare',
  [BadgeRarity.EPIC]: 'Epic',
  [BadgeRarity.LEGENDARY]: 'Legendary',
};
