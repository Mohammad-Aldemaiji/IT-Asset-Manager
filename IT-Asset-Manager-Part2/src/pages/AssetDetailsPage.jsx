import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Notice from '../components/Notice';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAssets } from '../context/useAssets';
import { displayText, formatCurrency, formatDate } from '../utils/format';
import RequestState from '../components/RequestState';
import { useAssetQuery } from '../context/useAssetQuery';
import AssetNotFound from './AssetNotFound';

/** Shows every field of one asset, with Edit and Delete buttons. */
export default function AssetDetailsPage() {
  const { id } = useParams();
  const { deleteAsset } = useAssets();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const result = useAssetQuery('get', { id });
  const asset = result.data;
  if (result.error?.status === 404) return <AssetNotFound id={id} />;
  if (!asset) return <RequestState {...result} />;

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    const response = await deleteAsset(asset.id);
    setDeleting(false);
    if (!response.ok) { setDeleteError(Object.values(response.errors).join(' ')); return; }
    navigate('/assets', { state: { notice: `"${asset.name}" (${asset.id}) was deleted.` } });
  };

  // Label / value pairs shown in the details grid
  const rows = [
    ['Asset ID', <span key="id" className="mono">{asset.id}</span>],
    ['Category', asset.category],
    ['Status', <StatusBadge key="status" status={asset.status} />],
    ['Brand', asset.brand],
    ['Model', displayText(asset.model)],
    ['Serial number', <span key="serial" className="mono">{asset.serialNumber}</span>],
    ['Assigned to', displayText(asset.assignedTo)],
    ['Department', asset.department],
    ['Location', displayText(asset.location)],
    ['Purchase date', formatDate(asset.purchaseDate)],
    ['Price', formatCurrency(asset.purchasePrice)],
    ['Warranty expiry', formatDate(asset.warrantyExpiry)],
  ];

  return (
    <>
      <p className="breadcrumb">
        <Link to="/assets">← All assets</Link>
      </p>

      <PageHeader title={asset.name} subtitle={`${asset.brand} ${asset.model}`.trim()}>
        <Link to={`/assets/${asset.id}/edit`} className="btn btn-primary">
          Edit
        </Link>
        <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
          Delete
        </button>
      </PageHeader>

      <Notice />

      <section className="card">
        <dl className="details-grid">
          {rows.map(([label, value]) => (
            <div key={label} className="detail">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <div className="detail detail-notes">
            <dt>Notes</dt>
            <dd>{displayText(asset.notes)}</dd>
          </div>
        </dl>
      </section>

      {confirming && (
        <ConfirmDialog
          title="Delete asset?"
          message={`"${asset.name}" (${asset.id}) will be removed. This cannot be undone.`}
          onConfirm={handleDelete}
          busy={deleting}
          error={deleteError}
          onCancel={() => { if (!deleting) setConfirming(false); }}
        />
      )}
    </>
  );
}
