import { useCallback, useMemo, useReducer } from 'react';
import initialAssets from '../data/initialAssets';
import { formatAssetId } from '../utils/ids';
import { normalizeAsset, validateAsset } from '../utils/validation';
import { ACTIONS, assetReducer, createInitialState } from './assetReducer';
import { AssetContext } from './assetContextObject';

/**
 * Holds the asset collection for the whole app and exposes the
 * add / update / delete operations. Every operation validates the data
 * first, so a page cannot store an invalid asset by mistake.
 *
 * Each operation returns { ok: true, ... } or { ok: false, errors }.
 */
export function AssetProvider({ children, initial = initialAssets }) {
  const [state, dispatch] = useReducer(assetReducer, initial, createInitialState);

  const addAsset = useCallback(
    (values) => {
      const errors = validateAsset(values, state.assets);
      if (Object.keys(errors).length > 0) return { ok: false, errors };

      const id = formatAssetId(state.nextId);
      const asset = { ...normalizeAsset(values), id };
      dispatch({ type: ACTIONS.ADD, asset });
      return { ok: true, id };
    },
    [state.assets, state.nextId],
  );

  const updateAsset = useCallback(
    (id, values) => {
      if (!state.assets.some((a) => a.id === id)) {
        return { ok: false, errors: { form: 'This asset no longer exists.' } };
      }
      const errors = validateAsset(values, state.assets, id);
      if (Object.keys(errors).length > 0) return { ok: false, errors };

      dispatch({ type: ACTIONS.UPDATE, asset: { ...normalizeAsset(values), id } });
      return { ok: true, id };
    },
    [state.assets],
  );

  const deleteAsset = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE, id });
    return { ok: true };
  }, []);

  const getAsset = useCallback(
    (id) => state.assets.find((asset) => asset.id === id),
    [state.assets],
  );

  const value = useMemo(
    () => ({ assets: state.assets, addAsset, updateAsset, deleteAsset, getAsset }),
    [state.assets, addAsset, updateAsset, deleteAsset, getAsset],
  );

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
}
