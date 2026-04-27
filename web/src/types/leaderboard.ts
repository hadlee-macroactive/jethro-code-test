export enum LeaderboardType {
  WEEKLY_WORKOUT = 'weekly_workout',
  MONTHLY_STREAK = 'monthly_streak',
  VOLUME = 'volume',
  CHALLENGE = 'challenge'
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  avatarUrl?: string;
  score: number;
  badges: string[];
  isCurrentUser: boolean;
  isAnonymous: boolean;
}

export interface Leaderboard {
  type: LeaderboardType;
  periodStart: string;
  periodEnd: string;
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  currentUserScore?: number;
}
