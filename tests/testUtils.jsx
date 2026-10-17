import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/App';
import { AssetProvider } from '../src/context/AssetProvider';
import initialAssets from '../src/data/initialAssets';

/**
 * Renders the whole app at a given URL, with its own fresh copy of the data.
 * Returns the Testing Library helpers plus a `user` for typing/clicking.
 */
export function renderApp(route = '/', assets = initialAssets) {
  const user = userEvent.setup();
  const utils = render(
    <AssetProvider initial={assets}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </AssetProvider>,
  );
  return { user, ...utils };
}

/** A complete, valid asset (without an ID) for tests that need one. */
export function makeAsset(overrides = {}) {
  return {
    name: 'Test Laptop',
    category: 'Laptop',
    brand: 'Dell',
    model: 'Latitude 5440',
    serialNumber: 'TEST-0001',
    status: 'Available',
    assignedTo: '',
    department: 'IT',
    location: 'Lab',
    purchaseDate: '2025-01-15',
    purchasePrice: 3500,
    warrantyExpiry: '2027-01-15',
    notes: '',
    ...overrides,
  };
}
