/** Display formatters, shared by every page so values look the same everywhere. */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 2,
});

/** 8499 -> "SAR 8,499.00" */
export function formatCurrency(amount) {
  const value = Number(amount);
  return Number.isFinite(value) ? currencyFormatter.format(value) : '—';
}

/** "2024-02-12" -> "12 Feb 2024". Empty values become an em dash. */
export function formatDate(iso) {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Shows an em dash for empty text so tables never have blank cells. */
export function displayText(value) {
  return value && String(value).trim() ? value : '—';
}
