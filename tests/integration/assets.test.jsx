import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import initialAssets from '../../src/data/initialAssets';
import { renderApp } from '../testUtils';

/** Rows in the asset table, without the header row. */
const tableRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);

/** Fills in the "Add asset" form with valid values. */
async function fillValidForm(user, overrides = {}) {
  const v = {
    name: 'QA Laptop',
    category: 'Laptop',
    brand: 'Lenovo',
    serial: 'QA-12345',
    department: 'IT',
    date: '2025-05-01',
    price: '4200',
    ...overrides,
  };
  await user.type(screen.getByLabelText(/Asset name/), v.name);
  await user.selectOptions(screen.getByLabelText(/Category/), v.category);
  await user.type(screen.getByLabelText(/Brand/), v.brand);
  await user.type(screen.getByLabelText(/Serial number/), v.serial);
  await user.selectOptions(screen.getByLabelText(/Department/), v.department);
  await user.type(screen.getByLabelText(/Purchase date/), v.date);
  await user.type(screen.getByLabelText(/Price/), v.price);
}

describe('display assets', () => {
  it('lists every asset in a table', () => {
    renderApp('/assets');
    expect(tableRows()).toHaveLength(initialAssets.length);
    expect(screen.getByText(`Showing`, { exact: false })).toHaveTextContent(
      `Showing ${initialAssets.length} of ${initialAssets.length} assets`,
    );
  });

  it('shows all details of one asset', () => {
    renderApp('/assets/AST-0004');
    expect(screen.getByRole('heading', { level: 1, name: 'Main File Server' })).toBeInTheDocument();
    expect(screen.getByText('DL-PE-R750-0091')).toBeInTheDocument();
    expect(screen.getByText('SAR 38,500.00')).toBeInTheDocument();
    expect(screen.getByText('30 Nov 2022')).toBeInTheDocument();
  });

  it('shows a message and a button when there are no assets at all', () => {
    renderApp('/assets', []);
    expect(screen.getByText('There are no assets yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add the first asset' })).toBeInTheDocument();
  });
});

describe('search assets', () => {
  it('filters the table while typing', async () => {
    const { user } = renderApp('/assets');
    await user.type(screen.getByLabelText('Search'), 'apple');
    expect(tableRows()).toHaveLength(2);
    expect(screen.getByText('Sales Manager Phone')).toBeInTheDocument();
    expect(screen.getByText('Marketing MacBook')).toBeInTheDocument();
  });

  it('combines search with the category and status filters', async () => {
    const { user } = renderApp('/assets');
    await user.selectOptions(screen.getByLabelText('Category'), 'Laptop');
    expect(tableRows()).toHaveLength(3);
    await user.selectOptions(screen.getByLabelText('Status'), 'Retired');
    expect(tableRows()).toHaveLength(1);
    expect(screen.getByText('HR Laptop (old)')).toBeInTheDocument();
  });

  it('reads filters from the URL (links from the dashboard)', () => {
    renderApp('/assets?status=Available');
    expect(tableRows()).toHaveLength(2);
    expect(screen.getByLabelText('Status')).toHaveValue('Available');
  });

  it('says when nothing matches and can clear the filters', async () => {
    const { user } = renderApp('/assets');
    await user.type(screen.getByLabelText('Search'), 'zzzz');
    expect(screen.getByText('No assets match your search.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(tableRows()).toHaveLength(initialAssets.length);
    expect(screen.getByLabelText('Search')).toHaveValue('');
  });

  it('sorts by the chosen column and direction', async () => {
    const { user } = renderApp('/assets');
    await user.selectOptions(screen.getByLabelText('Sort by'), 'purchasePrice');
    await user.click(screen.getByRole('button', { name: /switch to descending/ }));
    expect(within(tableRows()[0]).getByText('Main File Server')).toBeInTheDocument();
  });
});

describe('add assets', () => {
  it('adds a valid asset and opens its details page', async () => {
    const { user } = renderApp('/assets/new');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Add asset' }));

    expect(screen.getByRole('status')).toHaveTextContent('Asset AST-0011 was added.');
    expect(screen.getByRole('heading', { level: 1, name: 'QA Laptop' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: '← All assets' }));
    expect(tableRows()).toHaveLength(initialAssets.length + 1);
  });

  it('shows errors and does not save when required fields are empty', async () => {
    const { user } = renderApp('/assets/new');
    await user.click(screen.getByRole('button', { name: 'Add asset' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please fix the highlighted fields.');
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Serial number is required.')).toBeInTheDocument();
    // Focus moves to the first field with a problem
    expect(screen.getByLabelText(/Asset name/)).toHaveFocus();
    expect(screen.getByLabelText(/Asset name/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('refuses a serial number that is already used', async () => {
    const { user } = renderApp('/assets/new');
    await fillValidForm(user, { serial: 'dl-xps-88231' });
    await user.click(screen.getByRole('button', { name: 'Add asset' }));
    expect(screen.getByText('Another asset already has this serial number.')).toBeInTheDocument();
  });

  it('asks who uses the asset only when the status is In Use', async () => {
    const { user } = renderApp('/assets/new');
    expect(screen.queryByLabelText(/Assigned to/)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/Status/), 'In Use');
    expect(screen.getByLabelText(/Assigned to/)).toBeInTheDocument();
  });

  it('goes back to the list when Cancel is clicked', async () => {
    const { user } = renderApp('/assets/new');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
  });
});

describe('update assets', () => {
  it('edits an asset and shows the new values', async () => {
    const { user } = renderApp('/assets/AST-0003/edit');
    const name = screen.getByLabelText(/Asset name/);
    expect(name).toHaveValue('27" 4K Monitor');

    await user.clear(name);
    await user.type(name, 'Spare 4K Monitor');
    await user.selectOptions(screen.getByLabelText(/Status/), 'In Use');
    await user.type(screen.getByLabelText(/Assigned to/), 'Reem Al-Shehri');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByRole('status')).toHaveTextContent('Changes saved.');
    expect(screen.getByRole('heading', { level: 1, name: 'Spare 4K Monitor' })).toBeInTheDocument();
    expect(screen.getByText('Reem Al-Shehri')).toBeInTheDocument();
  });

  it('does not save invalid changes', async () => {
    const { user } = renderApp('/assets/AST-0003/edit');
    await user.clear(screen.getByLabelText(/Price/));
    await user.type(screen.getByLabelText(/Price/), '-5');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText('Price cannot be negative.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Edit/ })).toBeInTheDocument();
  });

  it('opens the edit form from the list', async () => {
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('link', { name: 'Edit Design Tablet' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Edit Design Tablet' })).toBeInTheDocument();
  });
});

describe('delete assets', () => {
  it('asks for confirmation, and Cancel keeps the asset', async () => {
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('button', { name: 'Delete Design Tablet' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete asset?' });
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tableRows()).toHaveLength(initialAssets.length);
  });

  it('closes the confirmation with the Escape key', async () => {
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('button', { name: 'Delete Design Tablet' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes the asset from the list after confirming', async () => {
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('button', { name: 'Delete Design Tablet' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Design Tablet')).not.toBeInTheDocument();
    expect(tableRows()).toHaveLength(initialAssets.length - 1);
    expect(screen.getByRole('status')).toHaveTextContent('"Design Tablet" (AST-0007) was deleted.');
  });

  it('deletes from the details page and returns to the list', async () => {
    const { user } = renderApp('/assets/AST-0005');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
    expect(screen.queryByText('Office Printer - 2nd Floor')).not.toBeInTheDocument();
  });
});

describe('dashboard', () => {
  beforeEach(() => {
    // Freeze "today" so the warranty section always gives the same result
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 17, 12, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('shows totals and warranties that end soon', () => {
    renderApp('/');
    const summary = within(screen.getByRole('region', { name: 'Summary' }));
    expect(summary.getByText('Total assets').nextSibling).toHaveTextContent('10');
    expect(summary.getByText('In use').nextSibling).toHaveTextContent('6');
    expect(screen.getByText('Sales Manager Phone')).toBeInTheDocument();
    expect(screen.getByText('29 days left')).toBeInTheDocument();
  });

  it('updates its numbers after an asset is deleted', async () => {
    vi.useRealTimers();
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('button', { name: 'Delete Design Tablet' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));

    const summary = within(screen.getByRole('region', { name: 'Summary' }));
    expect(summary.getByText('Total assets').nextSibling).toHaveTextContent('9');
  });
});
