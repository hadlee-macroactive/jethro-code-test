import {
  calculateStreakCount,
  isWithinQualificationWindow,
  getNextMilestone,
  getUserLocalDate,
  isStreakAtRisk,
  shouldBreakStreak,
  hoursUntilBreak
} from '../../../src/utils/streak.utils';

describe('streak.utils', () => {
  describe('calculateStreakCount', () => {
    it('should return zero counts for empty events', () => {
      const result = calculateStreakCount([]);
      expect(result.currentCount).toBe(0);
      expect(result.longestCount).toBe(0);
    });

    it('should return count of 1 for single event', () => {
      const events = [{ eventDate: new Date('2024-01-01') }];
      const result = calculateStreakCount(events);
      expect(result.currentCount).toBe(1);
      expect(result.longestCount).toBe(1);
    });

    it('should count consecutive events within window', () => {
      const events = [
        { eventDate: new Date('2024-01-01T10:00:00Z') },
        { eventDate: new Date('2024-01-02T10:00:00Z') },
        { eventDate: new Date('2024-01-03T10:00:00Z') }
      ];
      const result = calculateStreakCount(events);
      expect(result.currentCount).toBe(3);
      expect(result.longestCount).toBe(3);
    });

    it('should break streak when events exceed window', () => {
      const events = [
        { eventDate: new Date('2024-01-01T10:00:00Z') },
        { eventDate: new Date('2024-01-02T10:00:00Z') },
        { eventDate: new Date('2024-01-04T10:00:00Z') } // > 24h gap
      ];
      const result = calculateStreakCount(events);
      expect(result.currentCount).toBe(1);
      expect(result.longestCount).toBe(2);
    });

    it('should treat frozen events as continuing streak', () => {
      const events = [
        { eventDate: new Date('2024-01-01T10:00:00Z') },
        { eventDate: new Date('2024-01-04T10:00:00Z'), frozen: true }
      ];
      const result = calculateStreakCount(events);
      expect(result.currentCount).toBe(2);
    });

    it('should handle events out of order', () => {
      const events = [
        { eventDate: new Date('2024-01-03T10:00:00Z') },
        { eventDate: new Date('2024-01-01T10:00:00Z') },
        { eventDate: new Date('2024-01-02T10:00:00Z') }
      ];
      const result = calculateStreakCount(events);
      expect(result.currentCount).toBe(3);
    });

    it('should track longest streak across breaks', () => {
      const events = [
        { eventDate: new Date('2024-01-01T10:00:00Z') },
        { eventDate: new Date('2024-01-02T10:00:00Z') },
        { eventDate: new Date('2024-01-03T10:00:00Z') },
        { eventDate: new Date('2024-01-05T10:00:00Z') }, // break
        { eventDate: new Date('2024-01-06T10:00:00Z') }
      ];
      const result = calculateStreakCount(events);
      expect(result.currentCount).toBe(2);
      expect(result.longestCount).toBe(3);
    });

    it('should respect custom qualification window', () => {
      const events = [
        { eventDate: new Date('2024-01-01T10:00:00Z') },
        { eventDate: new Date('2024-01-02T08:00:00Z') } // 22h gap
      ];
      expect(calculateStreakCount(events, 24).currentCount).toBe(2);
      expect(calculateStreakCount(events, 20).currentCount).toBe(1);
    });
  });

  describe('isWithinQualificationWindow', () => {
    it('should return true for events within window', () => {
      const last = new Date('2024-01-01T10:00:00Z');
      const now = new Date('2024-01-02T08:00:00Z');
      expect(isWithinQualificationWindow(last, now, 24)).toBe(true);
    });

    it('should return false for events outside window', () => {
      const last = new Date('2024-01-01T10:00:00Z');
      const now = new Date('2024-01-02T12:00:00Z');
      expect(isWithinQualificationWindow(last, now, 24)).toBe(false);
    });

    it('should return false for negative time diff', () => {
      const last = new Date('2024-01-02T10:00:00Z');
      const now = new Date('2024-01-01T10:00:00Z');
      expect(isWithinQualificationWindow(last, now, 24)).toBe(false);
    });

    it('should return true for exact same time', () => {
      const date = new Date('2024-01-01T10:00:00Z');
      expect(isWithinQualificationWindow(date, date, 24)).toBe(true);
    });
  });

  describe('getNextMilestone', () => {
    it('should return 7 as next milestone after count of 4', () => {
      expect(getNextMilestone(4)).toBe(7);
    });

    it('should return 3 as next milestone after count of 0', () => {
      expect(getNextMilestone(0)).toBe(3);
    });

    it('should return 365 for very high count past all milestones', () => {
      expect(getNextMilestone(400)).toBe(365);
    });
  });

  describe('getUserLocalDate', () => {
    it('should convert date to local timezone', () => {
      const utcDate = new Date('2024-01-15T23:00:00Z');
      const local = getUserLocalDate(utcDate, 'Pacific/Auckland');
      expect(local).toBeInstanceOf(Date);
    });
  });

  describe('isStreakAtRisk', () => {
    it('should return true if hours since activity >= risk threshold', () => {
      const pastDate = new Date(Date.now() - 19 * 60 * 60 * 1000);
      expect(isStreakAtRisk(pastDate, 18)).toBe(true);
    });

    it('should return false if hours since activity < risk threshold', () => {
      const recentDate = new Date(Date.now() - 10 * 60 * 60 * 1000);
      expect(isStreakAtRisk(recentDate, 18)).toBe(false);
    });

    it('should use default risk threshold of 18 hours', () => {
      const date17h = new Date(Date.now() - 17 * 60 * 60 * 1000);
      expect(isStreakAtRisk(date17h)).toBe(false);
      const date19h = new Date(Date.now() - 19 * 60 * 60 * 1000);
      expect(isStreakAtRisk(date19h)).toBe(true);
    });
  });

  describe('shouldBreakStreak', () => {
    it('should return true if hours since activity >= break threshold', () => {
      const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      expect(shouldBreakStreak(pastDate, 24)).toBe(true);
    });

    it('should return false if within break threshold', () => {
      const recentDate = new Date(Date.now() - 20 * 60 * 60 * 1000);
      expect(shouldBreakStreak(recentDate, 24)).toBe(false);
    });
  });

  describe('hoursUntilBreak', () => {
    it('should return remaining hours until streak breaks', () => {
      const recentDate = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const hours = hoursUntilBreak(recentDate);
      expect(hours).toBeGreaterThan(11);
      expect(hours).toBeLessThanOrEqual(12);
    });

    it('should return 0 if already past break time', () => {
      const pastDate = new Date(Date.now() - 30 * 60 * 60 * 1000);
      expect(hoursUntilBreak(pastDate)).toBe(0);
    });
  });
});
