import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

/** Shown for any URL that doesn't match a page. */
export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <div className="empty card">
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">Go to the dashboard</Link>
      </div>
    </>
  );
}
