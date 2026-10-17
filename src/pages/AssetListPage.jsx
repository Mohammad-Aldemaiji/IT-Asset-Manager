import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AssetTable from '../components/AssetTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Notice from '../components/Notice';
import PageHeader from '../components/PageHeader';
import { CATEGORIES, SORT_FIELDS, STATUSES } from '../constants/assetOptions';
import { useAssets } from '../context/useAssets';
import { filterAssets } from '../utils/filterAssets';

const DEFAULTS = { q: '', category: 'All', status: 'All', sort: 'id', dir: 'asc' };

/**
 * Lists all assets with search, filters and sorting.
 * The search settings live in the URL (?q=dell&status=In%20Use), so they
 * survive going to a details page and pressing Back, and can be shared.
 */
export default function AssetListPage() {
  const { assets, deleteAsset } = useAssets();
  const [params, setParams] = useSearchParams();
  const [pendingDelete, setPendingDelete] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Read the current settings from the URL, falling back to defaults
  const get = (key) => params.get(key) ?? DEFAULTS[key];
  const query = get('q');
  const category = get('category');
  const status = get('status');
  const sortBy = SORT_FIELDS.some((f) => f.key === get('sort')) ? get('sort') : DEFAULTS.sort;
  const sortDir = get('dir') === 'desc' ? 'desc' : 'asc';

  /** Changes one setting; default values are removed to keep the URL short. */
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === DEFAULTS[key] || value === '') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const visible = useMemo(
    () => filterAssets(assets, { query, category, status, sortBy, sortDir }),
    [assets, query, category, status, sortBy, sortDir],
  );

  const filtersActive = query || category !== 'All' || status !== 'All';

  /** Removes search text and filters but keeps the chosen sort order. */
  const clearFilters = () => {
    const next = new URLSearchParams();
    if (params.has('sort')) next.set('sort', params.get('sort'));
    if (params.has('dir')) next.set('dir', params.get('dir'));
    setParams(next, { replace: true });
  };

  const confirmDelete = () => {
    const { id, name } = pendingDelete;
    deleteAsset(id);
    setPendingDelete(null);
    // Stay on this page (same filters) and show a success message
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: { notice: `"${name}" (${id}) was deleted.` } },
    );
  };

  return (
    <>
      <PageHeader title="Assets" subtitle="Search, view, edit and delete the company's IT equipment.">
        <Link to="/assets/new" className="btn btn-primary">
          + Add asset
        </Link>
      </PageHeader>

      <Notice />

      <section className="toolbar card" aria-label="Search and filters">
        <div className="field search-field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Name, ID, serial, brand, person, location…"
            value={query}
            onChange={(e) => update('q', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="filter-category">Category</label>
          <select id="filter-category" value={category} onChange={(e) => update('category', e.target.value)}>
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={status} onChange={(e) => update('status', e.target.value)}>
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort-by">Sort by</label>
          <div className="sort-control">
            <select id="sort-by" value={sortBy} onChange={(e) => update('sort', e.target.value)}>
              {SORT_FIELDS.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => update('dir', sortDir === 'asc' ? 'desc' : 'asc')}
              aria-label={sortDir === 'asc' ? 'Sorted ascending, switch to descending' : 'Sorted descending, switch to ascending'}
            >
              {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </section>

      <div className="result-bar">
        <p aria-live="polite">
          Showing <strong>{visible.length}</strong> of {assets.length} assets
        </p>
        {filtersActive && (
          <button type="button" className="btn btn-small btn-ghost" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <AssetTable assets={visible} onDelete={setPendingDelete} />
      ) : (
        <div className="empty card">
          {assets.length === 0 ? (
            <>
              <p>There are no assets yet.</p>
              <Link to="/assets/new" className="btn btn-primary">Add the first asset</Link>
            </>
          ) : (
            <p>No assets match your search.</p>
          )}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete asset?"
          message={`"${pendingDelete.name}" (${pendingDelete.id}) will be removed. This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
