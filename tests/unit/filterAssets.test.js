import { describe, expect, it } from 'vitest';
import initialAssets from '../../src/data/initialAssets';
import { filterAssets } from '../../src/utils/filterAssets';

const ids = (list) => list.map((a) => a.id);

describe('filterAssets', () => {
  it('returns every asset, sorted by ID, when no options are given', () => {
    const result = filterAssets(initialAssets);
    expect(result).toHaveLength(initialAssets.length);
    expect(result[0].id).toBe('AST-0001');
  });

  it('does not modify the original array', () => {
    const copy = [...initialAssets];
    filterAssets(initialAssets, { sortBy: 'name', sortDir: 'desc' });
    expect(initialAssets).toEqual(copy);
  });

  it('searches several fields, ignoring letter case and extra spaces', () => {
    expect(ids(filterAssets(initialAssets, { query: '  DELL ' }))).toEqual(['AST-0001', 'AST-0004']);
    expect(ids(filterAssets(initialAssets, { query: 'noura' }))).toEqual(['AST-0006']);
    expect(ids(filterAssets(initialAssets, { query: 'cs-c9300' }))).toEqual(['AST-0008']);
    expect(ids(filterAssets(initialAssets, { query: 'ast-0003' }))).toEqual(['AST-0003']);
  });

  it('filters by category and by status, together with search', () => {
    expect(filterAssets(initialAssets, { category: 'Laptop' })).toHaveLength(3);
    expect(filterAssets(initialAssets, { status: 'Retired' })).toHaveLength(1);
    expect(ids(filterAssets(initialAssets, { category: 'Laptop', status: 'In Use', query: 'apple' }))).toEqual([
      'AST-0010',
    ]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterAssets(initialAssets, { query: 'does-not-exist' })).toEqual([]);
  });

  it('sorts numbers numerically in both directions', () => {
    const asc = filterAssets(initialAssets, { sortBy: 'purchasePrice' });
    const desc = filterAssets(initialAssets, { sortBy: 'purchasePrice', sortDir: 'desc' });
    expect(asc[0].purchasePrice).toBe(1599);
    expect(desc[0].purchasePrice).toBe(38500);
  });

  it('sorts dates and text alphabetically', () => {
    expect(filterAssets(initialAssets, { sortBy: 'purchaseDate' })[0].id).toBe('AST-0009');
    expect(filterAssets(initialAssets, { sortBy: 'name' })[0].name).toBe('27" 4K Monitor');
  });
});
