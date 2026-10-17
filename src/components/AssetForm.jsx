import { useState } from 'react';
import { CATEGORIES, DEPARTMENTS, STATUSES } from '../constants/assetOptions';
import { todayISO } from '../utils/dates';
import { EMPTY_ASSET, LIMITS } from '../utils/validation';

/** Fields in the order they appear on screen (used to focus the first error). */
const FIELD_ORDER = [
  'name', 'category', 'brand', 'model', 'serialNumber',
  'status', 'department', 'assignedTo', 'location',
  'purchaseDate', 'purchasePrice', 'warrantyExpiry', 'notes',
];

/**
 * Form used by both "Add asset" and "Edit asset".
 *
 * @param initialValues  values to start with (EMPTY_ASSET when adding)
 * @param onSubmit       (values) => { ok, errors } — the page decides what happens on success
 * @param onCancel       called when the user clicks Cancel
 * @param submitLabel    text of the main button
 */
export default function AssetForm({ initialValues = EMPTY_ASSET, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState({ ...EMPTY_ASSET, ...initialValues });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Clear the error of a field as soon as the user edits it
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onSubmit(values);
    if (result && !result.ok) {
      setErrors(result.errors);
      // Move focus to the first field with an error so keyboard users find it
      const firstField = FIELD_ORDER.find((name) => result.errors[name]);
      document.getElementById(`field-${firstField}`)?.focus();
    }
  };

  const isInUse = values.status === 'In Use';
  const hasErrors = Object.values(errors).some(Boolean);

  // Small helper so every field gets the same label / error markup
  const field = (name, label, input, { required = false, hint } = {}) => (
    <div className={errors[name] ? 'field has-error' : 'field'}>
      <label htmlFor={`field-${name}`}>
        {label}
        {required && <span className="required" aria-hidden="true"> *</span>}
      </label>
      {input}
      {hint && !errors[name] && <small className="hint">{hint}</small>}
      {errors[name] && (
        <small className="error" id={`error-${name}`}>
          {errors[name]}
        </small>
      )}
    </div>
  );

  // Props shared by every input: id, name, value, onChange and error linking
  const common = (name, required = false) => ({
    id: `field-${name}`,
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    required,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `error-${name}` : undefined,
  });

  const options = (list, placeholder) => (
    <>
      {placeholder && <option value="">{placeholder}</option>}
      {list.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </>
  );

  return (
    <form className="asset-form card" onSubmit={handleSubmit} noValidate>
      {hasErrors && (
        <div className="form-alert" role="alert">
          {errors.form ?? 'Please fix the highlighted fields.'}
        </div>
      )}

      <fieldset>
        <legend>General</legend>
        <div className="form-grid">
          {field('name', 'Asset name', <input type="text" maxLength={LIMITS.name} {...common('name', true)} />, { required: true })}
          {field('category', 'Category', <select {...common('category', true)}>{options(CATEGORIES, 'Select a category')}</select>, { required: true })}
          {field('brand', 'Brand', <input type="text" maxLength={LIMITS.brand} {...common('brand', true)} />, { required: true })}
          {field('model', 'Model', <input type="text" maxLength={LIMITS.model} {...common('model')} />)}
          {field(
            'serialNumber',
            'Serial number',
            <input type="text" maxLength={LIMITS.serialNumber} {...common('serialNumber', true)} />,
            { required: true, hint: 'Letters, numbers and dashes. Must be unique.' },
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>Assignment</legend>
        <div className="form-grid">
          {field('status', 'Status', <select {...common('status', true)}>{options(STATUSES)}</select>, { required: true })}
          {field('department', 'Department', <select {...common('department', true)}>{options(DEPARTMENTS, 'Select a department')}</select>, { required: true })}
          {isInUse &&
            field('assignedTo', 'Assigned to', <input type="text" maxLength={LIMITS.assignedTo} {...common('assignedTo', true)} />, {
              required: true,
              hint: 'Employee or team using the asset.',
            })}
          {field('location', 'Location', <input type="text" maxLength={LIMITS.location} {...common('location')} />)}
        </div>
      </fieldset>

      <fieldset>
        <legend>Purchase</legend>
        <div className="form-grid">
          {field('purchaseDate', 'Purchase date', <input type="date" max={todayISO()} {...common('purchaseDate', true)} />, { required: true })}
          {field(
            'purchasePrice',
            'Price (SAR)',
            <input type="number" min="0" step="0.01" inputMode="decimal" {...common('purchasePrice', true)} />,
            { required: true },
          )}
          {field('warrantyExpiry', 'Warranty expiry', <input type="date" {...common('warrantyExpiry')} />, { hint: 'Optional.' })}
        </div>
      </fieldset>

      <fieldset>
        <legend>Notes</legend>
        {field('notes', 'Notes', <textarea rows={3} maxLength={LIMITS.notes} {...common('notes')} />)}
      </fieldset>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
