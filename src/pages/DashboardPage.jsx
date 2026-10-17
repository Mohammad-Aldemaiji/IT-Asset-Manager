import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { CATEGORIES, STATUSES, WARRANTY_WARNING_DAYS } from '../constants/assetOptions';
import { useAssets } from '../context/useAssets';
import { formatCurrency, formatDate } from '../utils/format';
import { computeStats } from '../utils/stats';

/** Home page: totals, breakdowns and warranties that need attention. */
export default function DashboardPage() {
  const { assets } = useAssets();
  const stats = useMemo(() => computeStats(assets), [assets]);
  const largestCategory = Math.max(1, ...Object.values(stats.byCategory));

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of the company's IT equipment.">
        <Link to="/assets/new" className="btn btn-primary">
          + Add asset
        </Link>
      </PageHeader>

      <section className="stat-grid" aria-label="Summary">
        <div className="stat card">
          <span className="stat-label">Total assets</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat card">
          <span className="stat-label">In use</span>
          <span className="stat-value">{stats.byStatus['In Use']}</span>
        </div>
        <div className="stat card">
          <span className="stat-label">Available</span>
          <span className="stat-value">{stats.byStatus.Available}</span>
        </div>
        <div className="stat card">
          <span className="stat-label">Value in service</span>
          <span className="stat-value stat-money">{formatCurrency(stats.activeValue)}</span>
          <span className="stat-note">Excludes retired assets</span>
        </div>
      </section>

      <div className="two-col">
        <section className="card">
          <h2>By status</h2>
          <ul className="plain-list">
            {STATUSES.map((status) => (
              <li key={status} className="list-row">
                <Link to={`/assets?status=${encodeURIComponent(status)}`}>
                  <StatusBadge status={status} />
                </Link>
                <strong>{stats.byStatus[status]}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>By category</h2>
          <ul className="plain-list">
            {CATEGORIES.map((category) => (
              <li key={category} className="bar-row">
                <Link to={`/assets?category=${encodeURIComponent(category)}`} className="bar-label">
                  {category}
                </Link>
                <span className="bar-track" aria-hidden="true">
                  <span
                    className="bar-fill"
                    style={{ width: `${(stats.byCategory[category] / largestCategory) * 100}%` }}
                  />
                </span>
                <strong className="bar-count">{stats.byCategory[category]}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2>Warranties ending in the next {WARRANTY_WARNING_DAYS} days</h2>
        {stats.expiringSoon.length === 0 ? (
          <p className="muted">No warranties are ending soon.</p>
        ) : (
          <ul className="plain-list">
            {stats.expiringSoon.map((asset) => (
              <li key={asset.id} className="list-row">
                <Link to={`/assets/${asset.id}`}>
                  {asset.name} <span className="muted mono">({asset.id})</span>
                </Link>
                <span>
                  {formatDate(asset.warrantyExpiry)} ·{' '}
                  <strong>{asset.daysLeft === 0 ? 'today' : `${asset.daysLeft} days left`}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
