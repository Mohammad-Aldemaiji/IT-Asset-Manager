import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

/** Shown when the URL points to an asset ID that does not exist (or was deleted). */
export default function AssetNotFound({ id }) {
  return (
    <>
      <PageHeader title="Asset not found" />
      <div className="empty card">
        <p>
          There is no asset with ID <span className="mono">{id}</span>. It may have been deleted.
        </p>
        <Link to="/assets" className="btn btn-primary">Back to assets</Link>
      </div>
    </>
  );
}
