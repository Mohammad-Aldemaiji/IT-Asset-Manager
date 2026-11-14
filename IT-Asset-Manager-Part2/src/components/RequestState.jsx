export default function RequestState({ loading, error, retry }) {
  if (loading) return <p role="status" className="card">Loading assets…</p>;
  if (!error) return null;
  return <div role="alert" className="card request-error"><p>{error.message}</p><button className="btn btn-secondary" onClick={retry}>Try again</button></div>;
}
