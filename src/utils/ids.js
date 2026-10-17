const ID_PREFIX = 'AST-';

/** 11 -> "AST-0011" */
export function formatAssetId(number) {
  return `${ID_PREFIX}${String(number).padStart(4, '0')}`;
}

/**
 * The first free ID number for a list of assets (highest number + 1).
 * Used once, to start the counter. After that the counter only goes up,
 * so a deleted asset's ID is never given to a new asset.
 */
export function nextIdNumber(assets) {
  const highest = assets.reduce((max, asset) => {
    const number = Number.parseInt(String(asset.id).replace(ID_PREFIX, ''), 10);
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return highest + 1;
}
