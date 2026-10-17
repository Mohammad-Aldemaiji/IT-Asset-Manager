/**
 * Search, filter and sort logic for the asset list.
 * Kept as a pure function (no React) so it is easy to test.
 */

/** Fields the free-text search looks in. */
const SEARCHABLE_FIELDS = [
  'id',
  'name',
  'brand',
  'model',
  'serialNumber',
  'assignedTo',
  'department',
  'location',
];

/**
 * @param assets   the full list
 * @param options  { query, category, status, sortBy, sortDir }
 *                 category/status of '' or 'All' mean "no filter"
 * @returns a new array; the input is never modified
 */
export function filterAssets(assets, options = {}) {
  const {
    query = '',
    category = 'All',
    status = 'All',
    sortBy = 'id',
    sortDir = 'asc',
  } = options;

  const needle = query.trim().toLowerCase();

  const result = assets.filter((asset) => {
    if (category && category !== 'All' && asset.category !== category) return false;
    if (status && status !== 'All' && asset.status !== status) return false;
    if (!needle) return true;
    return SEARCHABLE_FIELDS.some((field) =>
      String(asset[field] ?? '').toLowerCase().includes(needle),
    );
  });

  const direction = sortDir === 'desc' ? -1 : 1;
  return result.sort((a, b) => {
    const x = a[sortBy];
    const y = b[sortBy];
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * direction;
    return String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true }) * direction;
  });
}
