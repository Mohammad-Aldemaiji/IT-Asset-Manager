import { useCallback, useMemo, useState } from 'react';
import { assetsApi } from '../api/assets';
import { normalizeAsset, validateAsset } from '../utils/validation';
import { AssetContext } from './assetContextObject';

/** The server owns assets and IDs. revision invalidates reads after successful writes. */
export function AssetProvider({ children }) {
  const [revision, setRevision] = useState(0);
  const mutate = useCallback(async (operation, values) => {
    if (values) {
      const errors = validateAsset(values);
      if (Object.keys(errors).length) return { ok: false, errors };
    }
    try {
      const asset = await operation(values && normalizeAsset(values));
      setRevision(value => value + 1);
      return { ok: true, id: asset?.id };
    } catch (error) {
      return { ok: false, errors: Object.keys(error.errors || {}).length ? error.errors : { form: error.message } };
    }
  }, []);
  const addAsset = useCallback(values => mutate(assetsApi.create, values), [mutate]);
  const updateAsset = useCallback((id, values) => mutate(clean => assetsApi.update(id, clean), values), [mutate]);
  const deleteAsset = useCallback(id => mutate(() => assetsApi.delete(id)), [mutate]);
  const value = useMemo(() => ({ api: assetsApi, revision, addAsset, updateAsset, deleteAsset }), [revision, addAsset, updateAsset, deleteAsset]);
  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
}
