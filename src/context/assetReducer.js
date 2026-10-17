import { nextIdNumber } from '../utils/ids';

/**
 * All the ways the asset collection can change.
 * The reducer is a pure function: same state + same action = same result,
 * and it never modifies the old state (it always returns new objects).
 */
export const ACTIONS = {
  ADD: 'ADD_ASSET',
  UPDATE: 'UPDATE_ASSET',
  DELETE: 'DELETE_ASSET',
};

/** Builds the starting state from a list of assets. */
export function createInitialState(assets) {
  return { assets, nextId: nextIdNumber(assets) };
}

export function assetReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      // The ID was taken from state.nextId, so move the counter forward.
      return {
        assets: [...state.assets, action.asset],
        nextId: state.nextId + 1,
      };

    case ACTIONS.UPDATE:
      return {
        ...state,
        assets: state.assets.map((asset) =>
          asset.id === action.asset.id ? { ...action.asset } : asset,
        ),
      };

    case ACTIONS.DELETE:
      return {
        ...state,
        assets: state.assets.filter((asset) => asset.id !== action.id),
      };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
