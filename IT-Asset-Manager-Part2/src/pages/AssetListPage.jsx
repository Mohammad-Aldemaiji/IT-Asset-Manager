import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AssetTable from '../components/AssetTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Notice from '../components/Notice';
import PageHeader from '../components/PageHeader';
import RequestState from '../components/RequestState';
import { CATEGORIES, SORT_FIELDS, STATUSES } from '../constants/assetOptions';
import { useAssets } from '../context/useAssets';
import { useAssetQuery } from '../context/useAssetQuery';

export default function AssetListPage() {
  const { deleteAsset } = useAssets();
  const [params, setParams] = useSearchParams();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [lookup, setLookup] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const query = params.get('q') || '';
  const category = CATEGORIES.includes(params.get('category')) ? params.get('category') : '';
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : '';
  const sort = SORT_FIELDS.some(f => f.key === params.get('sort')) ? params.get('sort') : 'id';
  const dir = params.get('dir') === 'desc' ? 'desc' : 'asc';
  const rawPage = Number(params.get('page') || 0);
  const page = Number.isInteger(rawPage) && rawPage >= 0 && rawPage <= 1000000 ? rawPage : 0;
  const size = [5, 10, 20, 50].includes(Number(params.get('size'))) ? Number(params.get('size')) : 5;
  const result = useAssetQuery('list', { page, size, q: query, category, status, sort: sort + ',' + dir });
  const { data } = result;
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '') next.delete(key); else next.set(key, String(value));
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  // Deleting the final row of the final page must return to an existing page.
  useEffect(() => {
    if (data && page > 0 && page >= data.totalPages) {
      const next = new URLSearchParams(params);
      next.set('page', String(Math.max(0, data.totalPages - 1)));
      setParams(next, { replace: true });
    }
  }, [data, page, params, setParams]);
  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    const { id, name } = pendingDelete;
    const response = await deleteAsset(id);
    setDeleting(false);
    if (!response.ok) { setDeleteError(Object.values(response.errors).join(' ')); return; }
    setPendingDelete(null);
    setDeleteError('');
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: { notice: '"' + name + '" (' + id + ') was deleted.' } });
  };
  const openDelete = asset => { setDeleteError(''); setPendingDelete(asset); };
  return <>
    <PageHeader title="Assets" subtitle="Search, view, edit and delete the company's IT equipment."><Link to="/assets/new" className="btn btn-primary">+ Add asset</Link></PageHeader>
    <Notice />
    <form className="card id-search" onSubmit={event => { event.preventDefault(); if (lookup.trim()) navigate('/assets/' + encodeURIComponent(lookup.trim().toUpperCase())); }}>
      <div className="field"><label htmlFor="lookup-id">Find by exact asset ID</label><input id="lookup-id" placeholder="AST-0001" value={lookup} onChange={event => setLookup(event.target.value)} required maxLength={30} /></div>
      <button className="btn btn-secondary" type="submit">Find asset</button>
    </form>
    <section className="toolbar card" aria-label="Search and filters">
      <div className="field search-field"><label htmlFor="search">Search</label><input id="search" type="search" maxLength={200} placeholder="Name, ID, serial, brand, person, location…" value={query} onChange={e => update('q', e.target.value)} /></div>
      <div className="field"><label htmlFor="filter-category">Category</label><select id="filter-category" value={category} onChange={e => update('category', e.target.value)}><option value="">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="filter-status">Status</label><select id="filter-status" value={status} onChange={e => update('status', e.target.value)}><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
      <div className="field"><label htmlFor="sort-by">Sort by</label><div className="sort-control"><select id="sort-by" value={sort} onChange={e => update('sort', e.target.value)}>{SORT_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}</select><button className="btn btn-secondary" onClick={() => update('dir', dir === 'asc' ? 'desc' : 'asc')} aria-label={dir === 'asc' ? 'Sorted ascending, switch to descending' : 'Sorted descending, switch to ascending'}>{dir === 'asc' ? '↑ Asc' : '↓ Desc'}</button></div></div>
    </section>
    {(query || category || status) && <button className="btn btn-small btn-ghost" onClick={() => { const next = new URLSearchParams(params); ['q','category','status','page'].forEach(key => next.delete(key)); setParams(next, { replace:true }); }}>Clear filters</button>}
    <RequestState {...result} />
    {data && <>
      <div className="result-bar"><p aria-live="polite">Showing <strong>{data.content.length}</strong> of {data.totalElements} matching assets</p><div className="field"><label htmlFor="page-size">Assets per page</label><select id="page-size" value={size} onChange={e => update('size', e.target.value)}>{[5,10,20,50].map(n => <option key={n}>{n}</option>)}</select></div></div>
      {data.content.length ? <AssetTable assets={data.content} onDelete={openDelete} /> : <div className="empty card"><p>{query || category || status ? 'No assets match your search.' : 'There are no assets yet.'}</p>{!query && !category && !status && <Link to="/assets/new" className="btn btn-primary">Add the first asset</Link>}</div>}
      <nav className="pagination" aria-label="Asset pages"><button className="btn btn-secondary" disabled={page === 0} onClick={() => update('page', page - 1)}>Previous</button><span>Page {data.totalPages ? page + 1 : 0} of {data.totalPages}</span><button className="btn btn-secondary" disabled={page + 1 >= data.totalPages} onClick={() => update('page', page + 1)}>Next</button></nav>
    </>}
    {pendingDelete && <ConfirmDialog title="Delete asset?" message={'"' + pendingDelete.name + '" (' + pendingDelete.id + ') will be removed. This cannot be undone.'} onConfirm={confirmDelete} onCancel={() => { if (!deleting) setPendingDelete(null); }} busy={deleting} error={deleteError} />}
  </>;
}
