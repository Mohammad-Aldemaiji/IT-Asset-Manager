/** Coloured label for an asset status. Colour classes are defined in index.css. */
const STATUS_CLASS = {
  'In Use': 'badge-in-use',
  Available: 'badge-available',
  'Under Repair': 'badge-repair',
  Retired: 'badge-retired',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_CLASS[status] ?? ''}`}>{status}</span>;
}
