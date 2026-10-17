import { describe, expect, it } from 'vitest';
import { ACTIONS, assetReducer, createInitialState } from '../../src/context/assetReducer';
import initialAssets from '../../src/data/initialAssets';
import { formatAssetId, nextIdNumber } from '../../src/utils/ids';
import { makeAsset } from '../testUtils';

describe('asset IDs', () => {
  it('formats numbers as AST-0000', () => {
    expect(formatAssetId(7)).toBe('AST-0007');
    expect(formatAssetId(12345)).toBe('AST-12345');
  });

  it('starts after the highest existing number', () => {
    expect(nextIdNumber(initialAssets)).toBe(11);
    expect(nextIdNumber([])).toBe(1);
    expect(nextIdNumber([{ id: 'weird' }, { id: 'AST-0040' }])).toBe(41);
  });
});

describe('assetReducer', () => {
  const start = createInitialState(initialAssets);

  it('adds an asset and moves the ID counter forward', () => {
    const asset = { ...makeAsset(), id: 'AST-0011' };
    const next = assetReducer(start, { type: ACTIONS.ADD, asset });
    expect(next.assets).toHaveLength(initialAssets.length + 1);
    expect(next.assets.at(-1)).toEqual(asset);
    expect(next.nextId).toBe(12);
  });

  it('updates only the asset with the matching ID', () => {
    const changed = { ...initialAssets[1], name: 'Renamed' };
    const next = assetReducer(start, { type: ACTIONS.UPDATE, asset: changed });
    expect(next.assets[1].name).toBe('Renamed');
    expect(next.assets[0]).toBe(initialAssets[0]);
  });

  it('deletes the asset with the matching ID', () => {
    const next = assetReducer(start, { type: ACTIONS.DELETE, id: 'AST-0003' });
    expect(next.assets.find((a) => a.id === 'AST-0003')).toBeUndefined();
    expect(next.assets).toHaveLength(initialAssets.length - 1);
  });

  it('never re-uses the ID of a deleted asset', () => {
    const afterDelete = assetReducer(start, { type: ACTIONS.DELETE, id: 'AST-0010' });
    expect(afterDelete.nextId).toBe(11);
  });

  it('does not change the previous state object', () => {
    const before = JSON.stringify(start);
    assetReducer(start, { type: ACTIONS.DELETE, id: 'AST-0001' });
    assetReducer(start, { type: ACTIONS.ADD, asset: { ...makeAsset(), id: 'AST-0011' } });
    expect(JSON.stringify(start)).toBe(before);
  });

  it('starts the ID counter at 1 for an empty list', () => {
    expect(createInitialState([])).toEqual({ assets: [], nextId: 1 });
  });

  it('throws on an unknown action so mistakes are caught early', () => {
    expect(() => assetReducer(start, { type: 'NOPE' })).toThrow(/Unknown action/);
  });
});
