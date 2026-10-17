import { describe, expect, it } from 'vitest';
import initialAssets from '../../src/data/initialAssets';
import { normalizeAsset, validateAsset } from '../../src/utils/validation';
import { makeAsset } from '../testUtils';

const TODAY = '2026-10-17';
const validate = (overrides, existing = initialAssets, currentId = null) =>
  validateAsset(makeAsset(overrides), existing, currentId, TODAY);

describe('validateAsset', () => {
  it('accepts a complete, valid asset', () => {
    expect(validate({})).toEqual({});
  });

  it('requires name, brand, serial number, purchase date and price', () => {
    const errors = validate({ name: '', brand: '', serialNumber: '', purchaseDate: '', purchasePrice: '' });
    expect(Object.keys(errors).sort()).toEqual(
      ['brand', 'name', 'purchaseDate', 'purchasePrice', 'serialNumber'].sort(),
    );
  });

  it('treats text made only of spaces as empty', () => {
    expect(validate({ name: '   ' }).name).toBe('Name is required.');
  });

  it('rejects a name shorter than 2 or longer than 80 characters', () => {
    expect(validate({ name: 'A' }).name).toMatch(/at least 2/);
    expect(validate({ name: 'x'.repeat(81) }).name).toMatch(/at most 80/);
    expect(validate({ name: 'x'.repeat(80) }).name).toBeUndefined();
  });

  it('only allows categories, statuses and departments from the lists', () => {
    const errors = validate({ category: 'Toaster', status: 'Lost', department: 'Space' });
    expect(errors.category).toBeDefined();
    expect(errors.status).toBeDefined();
    expect(errors.department).toBeDefined();
  });

  it('rejects serial numbers with unsafe characters', () => {
    expect(validate({ serialNumber: 'ABC 123' }).serialNumber).toMatch(/letters, numbers and dashes/);
    expect(validate({ serialNumber: '<script>' }).serialNumber).toBeDefined();
  });

  it('rejects a serial number that another asset already uses (any letter case)', () => {
    const taken = initialAssets[0].serialNumber.toLowerCase();
    expect(validate({ serialNumber: taken }).serialNumber).toMatch(/already has this serial/);
  });

  it('lets an asset keep its own serial number when it is edited', () => {
    const original = initialAssets[0];
    expect(validateAsset(original, initialAssets, original.id, TODAY)).toEqual({});
  });

  it('requires "Assigned to" only when the status is In Use', () => {
    expect(validate({ status: 'In Use', assignedTo: '' }).assignedTo).toBeDefined();
    expect(validate({ status: 'In Use', assignedTo: 'Ali' }).assignedTo).toBeUndefined();
    expect(validate({ status: 'Available', assignedTo: '' }).assignedTo).toBeUndefined();
  });

  it('rejects purchase dates in the future and impossible dates', () => {
    expect(validate({ purchaseDate: '2026-10-18' }).purchaseDate).toMatch(/future/);
    expect(validate({ purchaseDate: TODAY }).purchaseDate).toBeUndefined();
    expect(validate({ purchaseDate: '2025-02-30' }).purchaseDate).toMatch(/valid date/);
  });

  it('rejects negative, non-numeric and huge prices but allows 0', () => {
    expect(validate({ purchasePrice: -1 }).purchasePrice).toMatch(/negative/);
    expect(validate({ purchasePrice: 'abc' }).purchasePrice).toMatch(/number/);
    expect(validate({ purchasePrice: 99_999_999 }).purchasePrice).toMatch(/too large/);
    expect(validate({ purchasePrice: 0 }).purchasePrice).toBeUndefined();
    expect(validate({ purchasePrice: '1250.50' }).purchasePrice).toBeUndefined();
  });

  it('makes warranty optional but not earlier than the purchase date', () => {
    expect(validate({ warrantyExpiry: '' }).warrantyExpiry).toBeUndefined();
    expect(validate({ warrantyExpiry: '2024-01-01' }).warrantyExpiry).toMatch(/before the purchase/);
    expect(validate({ warrantyExpiry: '2025-01-15' }).warrantyExpiry).toBeUndefined();
  });

  it('limits the length of notes', () => {
    expect(validate({ notes: 'n'.repeat(501) }).notes).toBeDefined();
  });

  it('does not crash when fields are missing', () => {
    expect(() => validateAsset({}, [], null, TODAY)).not.toThrow();
  });
});

describe('normalizeAsset', () => {
  it('trims text, upper-cases the serial number and converts the price to a number', () => {
    const result = normalizeAsset(makeAsset({ name: '  Laptop  ', serialNumber: ' ab-12 ', purchasePrice: '99.5' }));
    expect(result.name).toBe('Laptop');
    expect(result.serialNumber).toBe('AB-12');
    expect(result.purchasePrice).toBe(99.5);
  });

  it('clears "Assigned to" when the asset is not In Use', () => {
    expect(normalizeAsset(makeAsset({ status: 'Retired', assignedTo: 'Old Owner' })).assignedTo).toBe('');
    expect(normalizeAsset(makeAsset({ status: 'In Use', assignedTo: 'Ali' })).assignedTo).toBe('Ali');
  });
});
