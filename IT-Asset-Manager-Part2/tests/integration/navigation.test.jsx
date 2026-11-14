import {screen, within} from '@testing-library/react';
import {describe,expect,it} from 'vitest';
import team from '../../src/data/team';
import {renderApp} from '../testUtils';
describe('navigation and team', () => {
  it('keeps all four menu destinations', () => { renderApp('/about'); const menu=within(screen.getByRole('navigation',{name:'Main menu'})); for(const name of ['Dashboard','Assets','Add Asset','About']) expect(menu.getByRole('link',{name})).toBeInTheDocument(); });
  it('shows every supplied name with its corresponding student ID', () => { renderApp('/about'); for(const member of team) { const row=screen.getByText(member.name).closest('tr'); expect(within(row).getByText(member.studentId)).toBeInTheDocument(); } expect(team).toHaveLength(4); });
  it('navigates and highlights the selected route', async () => { const {user}=renderApp('/about'); await user.click(screen.getByRole('link',{name:'Add Asset'})); expect(screen.getByRole('heading',{name:'Add asset'})).toBeInTheDocument(); expect(screen.getByRole('link',{name:'Add Asset'})).toHaveClass('active'); });
  it('opens and closes the mobile menu',async () => { const {user}=renderApp('/about'); await user.click(screen.getByRole('button',{name:'Menu'})); expect(screen.getByRole('button',{name:'Close'})).toHaveAttribute('aria-expanded','true'); });
  it('handles unknown routes', () => { renderApp('/unknown'); expect(screen.getByRole('heading',{name:'Page not found'})).toBeInTheDocument(); });
});
