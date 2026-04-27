import { STREAK_MILESTONES } from '../constants/streak.constants';

export function calculateStreakCount(
  events: Array<{ eventDate: Date; frozen?: boolean }>,
  qualificationWindowHours: number = 24
): {
  currentCount: number;
  longestCount: number;
  startDate: Date;
} {
  if (events.length === 0) {
    return { currentCount: 0, longestCount: 0, startDate: new Date() };
  }

  const sorted = [...events].sort((a, b) =>
    a.eventDate.getTime() - b.eventDate.getTime()
  );

  let currentStreak = 1;
  let longestStreak = 1;
  let currentStreakStart = sorted[0].eventDate;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const hoursDiff = (curr.eventDate.getTime() - prev.eventDate.getTime()) / (1000 * 60 * 60);

    if (curr.frozen || hoursDiff <= qualificationWindowHours) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
      currentStreakStart = curr.eventDate;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentCount: currentStreak,
    longestCount: longestStreak,
    startDate: currentStreakStart
  };
}

export function isWithinQualificationWindow(
  lastActivityDate: Date,
  newActivityDate: Date,
  windowHours: number = 24
): boolean {
  const hoursDiff = (newActivityDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= windowHours && hoursDiff >= 0;
}

export function getNextMilestone(currentCount: number): number {
  const milestones = STREAK_MILESTONES.map(m => m.days);
  return milestones.find(m => m > currentCount) || 365;
}

export function getUserLocalDate(date: Date, timezone: string): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

export function isStreakAtRisk(
  lastActivityDate: Date,
  riskHours: number = 18
): boolean {
  const hoursSinceActivity = (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceActivity >= riskHours;
}

export function shouldBreakStreak(
  lastActivityDate: Date,
  breakHours: number = 24
): boolean {
  const hoursSinceActivity = (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceActivity >= breakHours;
}

export function hoursUntilBreak(lastActivityDate: Date): number {
  const breakTime = lastActivityDate.getTime() + (24 * 60 * 60 * 1000);
  return Math.max(0, (breakTime - Date.now()) / (1000 * 60 * 60));
}
