/**
 * Fixed option lists used by the form, filters and validation.
 * Keeping them in one place means the UI and the validation rules
 * can never disagree about which values are allowed.
 */

export const CATEGORIES = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Server',
  'Printer',
  'Phone',
  'Tablet',
  'Networking',
];

export const STATUSES = ['In Use', 'Available', 'Under Repair', 'Retired'];

export const DEPARTMENTS = [
  'Engineering',
  'Finance',
  'Human Resources',
  'IT',
  'Marketing',
  'Operations',
  'Sales',
];

/** Columns the asset list can be sorted by (key = asset field). */
export const SORT_FIELDS = [
  { key: 'id', label: 'Asset ID' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'purchaseDate', label: 'Purchase date' },
  { key: 'purchasePrice', label: 'Price' },
];

/** Number of days ahead that counts as "warranty expiring soon". */
export const WARRANTY_WARNING_DAYS = 90;
