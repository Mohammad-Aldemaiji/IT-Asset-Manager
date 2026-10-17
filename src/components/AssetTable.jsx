import { Link } from 'react-router-dom';
import { displayText, formatCurrency, formatDate } from '../utils/format';
import StatusBadge from './StatusBadge';

/**
 * Table of assets with View / Edit / Delete buttons on each row.
 * Deleting is handled by the parent page (it shows the confirmation).
 */
export default function AssetTable({ assets, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="asset-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col">Status</th>
            <th scope="col">Assigned to</th>
            <th scope="col">Department</th>
            <th scope="col">Purchased</th>
            <th scope="col" className="num">Price</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td className="mono nowrap" data-label="ID">{asset.id}</td>
              <td className="col-name" data-label="Name">
                <div>
                  <Link to={`/assets/${asset.id}`} className="row-title">
                    {asset.name}
                  </Link>
                  <div className="row-sub">
                    {asset.brand} {asset.model}
                  </div>
                </div>
              </td>
              <td data-label="Category">{asset.category}</td>
              <td data-label="Status">
                <StatusBadge status={asset.status} />
              </td>
              <td data-label="Assigned to">{displayText(asset.assignedTo)}</td>
              <td data-label="Department">{asset.department}</td>
              <td className="nowrap" data-label="Purchased">{formatDate(asset.purchaseDate)}</td>
              <td data-label="Price" className="num">{formatCurrency(asset.purchasePrice)}</td>
              <td className="row-actions">
                <Link to={`/assets/${asset.id}`} className="btn btn-small btn-ghost" aria-label={`View ${asset.name}`}>
                  View
                </Link>
                <Link to={`/assets/${asset.id}/edit`} className="btn btn-small btn-ghost" aria-label={`Edit ${asset.name}`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-small btn-ghost-danger"
                  onClick={() => onDelete(asset)}
                  aria-label={`Delete ${asset.name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
