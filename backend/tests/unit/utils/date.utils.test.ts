import {
  startOfDay,
  endOfDay,
  addDays,
  differenceInDays,
  isSameDay,
  formatDateToISODate
} from '../../../src/utils/date.utils';

describe('date.utils', () => {
  describe('startOfDay', () => {
    it('should set hours, minutes, seconds, ms to zero', () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should not mutate the original date', () => {
      const original = new Date(2024, 0, 15, 14, 30, 0);
      const originalHours = original.getHours();
      startOfDay(original);
      expect(original.getHours()).toBe(originalHours);
    });
  });

  describe('endOfDay', () => {
    it('should set time to end of day', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    it('should subtract days with negative input', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -3);
      expect(result.getDate()).toBe(12);
    });

    it('should not mutate the original date', () => {
      const date = new Date('2024-01-15');
      addDays(date, 5);
      expect(date.getDate()).toBe(15);
    });
  });

  describe('differenceInDays', () => {
    it('should return positive difference', () => {
      const a = new Date('2024-01-20');
      const b = new Date('2024-01-15');
      expect(differenceInDays(a, b)).toBe(5);
    });

    it('should return negative difference for reversed dates', () => {
      const a = new Date('2024-01-15');
      const b = new Date('2024-01-20');
      expect(differenceInDays(a, b)).toBe(-5);
    });

    it('should return 0 for same day', () => {
      const date = new Date('2024-01-15');
      expect(differenceInDays(date, date)).toBe(0);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same date', () => {
      const a = new Date(2024, 0, 15, 10, 0, 0);
      const b = new Date(2024, 0, 15, 22, 0, 0);
      expect(isSameDay(a, b)).toBe(true);
    });

    it('should return false for different dates', () => {
      const a = new Date(2024, 0, 15, 23, 59, 0);
      const b = new Date(2024, 0, 16, 0, 1, 0);
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe('formatDateToISODate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const result = formatDateToISODate(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
