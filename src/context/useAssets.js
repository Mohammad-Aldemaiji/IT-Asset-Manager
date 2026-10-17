import { useContext } from 'react';
import { AssetContext } from './assetContextObject';

/**
 * Hook used by pages to read and change assets:
 * const { assets, addAsset, updateAsset, deleteAsset, getAsset } = useAssets();
 */
export function useAssets() {
  const context = useContext(AssetContext);
  if (!context) throw new Error('useAssets must be used inside <AssetProvider>.');
  return context;
}
