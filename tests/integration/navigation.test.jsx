import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import team from '../../src/data/team';
import { renderApp } from '../testUtils';

const menu = () => within(screen.getByRole('navigation', { name: 'Main menu' }));

describe('menu and navigation', () => {
  it('shows a menu with every feature', () => {
    renderApp('/');
    for (const label of ['Dashboard', 'Assets', 'Add Asset', 'About']) {
      expect(menu().getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('opens each page from the menu and highlights the current item', async () => {
    const { user } = renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();

    await user.click(menu().getByRole('link', { name: 'Assets' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
    expect(menu().getByRole('link', { name: 'Assets' })).toHaveClass('active');

    await user.click(menu().getByRole('link', { name: 'Add Asset' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Add asset' })).toBeInTheDocument();
    // "Assets" must not also be highlighted while on "Add Asset"
    expect(menu().getByRole('link', { name: 'Assets' })).not.toHaveClass('active');

    await user.click(menu().getByRole('link', { name: 'About' }));
    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument();
  });

  it('About page lists every team member with name and student ID', () => {
    renderApp('/about');
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(team.length + 1); // + header row
    for (const member of team) {
      expect(within(table).getByText(member.name)).toBeInTheDocument();
    }
    expect(within(table).getByRole('columnheader', { name: 'Student ID' })).toBeInTheDocument();
  });

  it('opens and closes the mobile menu', async () => {
    const { user } = renderApp('/');
    const toggle = screen.getByRole('button', { name: 'Menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows a "page not found" message for unknown URLs', () => {
    renderApp('/this/does/not/exist');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('shows "asset not found" for an ID that does not exist', () => {
    renderApp('/assets/AST-9999');
    expect(screen.getByRole('heading', { name: 'Asset not found' })).toBeInTheDocument();
  });
});
