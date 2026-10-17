import { describe, expect, it } from 'vitest';
import initialAssets from '../../src/data/initialAssets';
import { daysBetween, isValidISODate, todayISO } from '../../src/utils/dates';
import { displayText, formatCurrency, formatDate } from '../../src/utils/format';
import { computeStats } from '../../src/utils/stats';

describe('date helpers', () => {
  it('formats today as YYYY-MM-DD in local time', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('checks for real calendar dates', () => {
    expect(isValidISODate('2024-02-29')).toBe(true); // leap year
    expect(isValidISODate('2023-02-29')).toBe(false);
    expect(isValidISODate('2024-13-01')).toBe(false);
    expect(isValidISODate('15/01/2024')).toBe(false);
    expect(isValidISODate(undefined)).toBe(false);
  });

  it('counts days between two dates', () => {
    expect(daysBetween('2026-10-17', '2026-11-15')).toBe(29);
    expect(daysBetween('2026-10-17', '2026-10-10')).toBe(-7);
    expect(daysBetween('2026-03-01', '2026-04-01')).toBe(31);
  });
});

describe('format helpers', () => {
  it('formats prices in Saudi riyals', () => {
    // Intl puts a non-breaking space after "SAR", so compare with normal spaces
    expect(formatCurrency(8499).replace(/\s/g, ' ')).toBe('SAR 8,499.00');
    expect(formatCurrency('abc')).toBe('—');
  });

  it('formats dates in a readable way', () => {
    expect(formatDate('2024-02-12')).toBe('12 Feb 2024');
    expect(formatDate('')).toBe('—');
  });

  it('shows a dash for empty text', () => {
    expect(displayText('')).toBe('—');
    expect(displayText('   ')).toBe('—');
    expect(displayText('Ali')).toBe('Ali');
  });
});

describe('computeStats', () => {
  const stats = computeStats(initialAssets, '2026-10-17');

  it('counts assets by status and category', () => {
    expect(stats.total).toBe(10);
    expect(stats.byStatus).toEqual({ 'In Use': 6, Available: 2, 'Under Repair': 1, Retired: 1 });
    expect(stats.byCategory.Laptop).toBe(3);
    expect(stats.byCategory.Server).toBe(1);
  });

  it('adds up total value and value excluding retired assets', () => {
    const total = initialAssets.reduce((sum, a) => sum + a.purchasePrice, 0);
    expect(stats.totalValue).toBe(total);
    expect(stats.activeValue).toBe(total - 4100);
  });

  it('lists warranties ending within 90 days, soonest first', () => {
    expect(stats.expiringSoon.map((a) => [a.id, a.daysLeft])).toEqual([
      ['AST-0006', 29],
      ['AST-0002', 64],
    ]);
  });

  it('handles an empty list', () => {
    const empty = computeStats([], '2026-10-17');
    expect(empty.total).toBe(0);
    expect(empty.totalValue).toBe(0);
    expect(empty.expiringSoon).toEqual([]);
  });
});
