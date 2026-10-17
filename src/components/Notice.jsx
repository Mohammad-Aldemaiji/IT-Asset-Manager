import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Shows a one-time success message passed through navigation, e.g.
 * navigate('/assets', { state: { notice: 'Asset deleted.' } }).
 * Closing it removes the message from history so it won't come back.
 */
export default function Notice() {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.notice;

  if (!message) return null;

  const dismiss = () =>
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });

  return (
    <div className="notice" role="status">
      <span>{message}</span>
      <button type="button" className="notice-close" onClick={dismiss} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}
