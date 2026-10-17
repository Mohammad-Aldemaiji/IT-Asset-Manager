import { CATEGORIES, DEPARTMENTS, STATUSES } from '../constants/assetOptions';
import { isValidISODate, todayISO } from './dates';

/** Field limits, also used as maxLength on the form inputs. */
export const LIMITS = {
  name: 80,
  brand: 40,
  model: 60,
  serialNumber: 40,
  assignedTo: 60,
  location: 60,
  notes: 500,
  maxPrice: 10_000_000,
};

const SERIAL_PATTERN = /^[A-Za-z0-9-]+$/;

/** An empty asset, used as the starting values of the "Add asset" form. */
export const EMPTY_ASSET = {
  name: '',
  category: '',
  brand: '',
  model: '',
  serialNumber: '',
  status: 'Available',
  assignedTo: '',
  department: '',
  location: '',
  purchaseDate: '',
  purchasePrice: '',
  warrantyExpiry: '',
  notes: '',
};

/**
 * Trims text fields and converts the price to a number,
 * so what we store is clean no matter what the user typed.
 */
export function normalizeAsset(values) {
  const clean = {};
  // Start from EMPTY_ASSET so a missing field becomes '' instead of undefined
  for (const [key, value] of Object.entries({ ...EMPTY_ASSET, ...values })) {
    clean[key] = typeof value === 'string' ? value.trim() : value;
  }
  clean.serialNumber = clean.serialNumber.toUpperCase();
  clean.purchasePrice = clean.purchasePrice === '' ? '' : Number(clean.purchasePrice);
  // Only assets that are "In Use" have someone they are assigned to.
  if (clean.status !== 'In Use') clean.assignedTo = '';
  return clean;
}

/**
 * Validates an asset before it is added or updated.
 *
 * @param values        the form values
 * @param existing      all assets currently stored (to check serial numbers are unique)
 * @param currentId     the ID of the asset being edited (so it doesn't clash with itself)
 * @param today         today's date, injectable for tests
 * @returns an object of { fieldName: errorMessage }; empty when valid
 */
export function validateAsset(values, existing = [], currentId = null, today = todayISO()) {
  const v = normalizeAsset(values);
  const errors = {};

  // Required text fields with length limits
  if (!v.name) errors.name = 'Name is required.';
  else if (v.name.length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (v.name.length > LIMITS.name) errors.name = `Name must be at most ${LIMITS.name} characters.`;

  if (!v.brand) errors.brand = 'Brand is required.';
  else if (v.brand.length > LIMITS.brand) errors.brand = `Brand must be at most ${LIMITS.brand} characters.`;

  if (v.model.length > LIMITS.model) errors.model = `Model must be at most ${LIMITS.model} characters.`;
  if (v.location.length > LIMITS.location) errors.location = `Location must be at most ${LIMITS.location} characters.`;
  if (v.notes.length > LIMITS.notes) errors.notes = `Notes must be at most ${LIMITS.notes} characters.`;

  // Choices must come from the fixed lists
  if (!CATEGORIES.includes(v.category)) errors.category = 'Choose a category.';
  if (!STATUSES.includes(v.status)) errors.status = 'Choose a status.';
  if (!DEPARTMENTS.includes(v.department)) errors.department = 'Choose a department.';

  // Serial number: required, safe characters only, and unique
  if (!v.serialNumber) {
    errors.serialNumber = 'Serial number is required.';
  } else if (!SERIAL_PATTERN.test(v.serialNumber)) {
    errors.serialNumber = 'Use only letters, numbers and dashes.';
  } else if (v.serialNumber.length > LIMITS.serialNumber) {
    errors.serialNumber = `Serial number must be at most ${LIMITS.serialNumber} characters.`;
  } else if (
    existing.some(
      (asset) => asset.id !== currentId && asset.serialNumber.toUpperCase() === v.serialNumber,
    )
  ) {
    errors.serialNumber = 'Another asset already has this serial number.';
  }

  // An asset in use must be assigned to someone
  if (v.status === 'In Use') {
    if (!v.assignedTo) errors.assignedTo = 'Enter who is using this asset.';
    else if (v.assignedTo.length > LIMITS.assignedTo)
      errors.assignedTo = `Must be at most ${LIMITS.assignedTo} characters.`;
  }

  // Purchase date: required, real date, not in the future
  if (!v.purchaseDate) errors.purchaseDate = 'Purchase date is required.';
  else if (!isValidISODate(v.purchaseDate)) errors.purchaseDate = 'Enter a valid date.';
  else if (v.purchaseDate > today) errors.purchaseDate = 'Purchase date cannot be in the future.';

  // Price: required, number, 0 or more, below a sane maximum
  if (v.purchasePrice === '') errors.purchasePrice = 'Price is required.';
  else if (!Number.isFinite(v.purchasePrice)) errors.purchasePrice = 'Price must be a number.';
  else if (v.purchasePrice < 0) errors.purchasePrice = 'Price cannot be negative.';
  else if (v.purchasePrice > LIMITS.maxPrice) errors.purchasePrice = 'Price is too large.';

  // Warranty: optional, but if given must be a real date on/after purchase
  if (v.warrantyExpiry) {
    if (!isValidISODate(v.warrantyExpiry)) errors.warrantyExpiry = 'Enter a valid date.';
    else if (v.purchaseDate && v.warrantyExpiry < v.purchaseDate)
      errors.warrantyExpiry = 'Warranty cannot end before the purchase date.';
  }

  return errors;
}
