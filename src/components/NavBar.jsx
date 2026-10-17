import { useState } from 'react';
import { NavLink } from 'react-router-dom';

/** Menu items. Add an entry here to add a page to the menu. */
const MENU = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/assets', label: 'Assets', end: true },
  { to: '/assets/new', label: 'Add Asset', end: true },
  { to: '/about', label: 'About', end: true },
];

/** The main navigation menu. On small screens it collapses behind a button. */
export default function NavBar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="navbar" aria-label="Main menu">
      <NavLink to="/" className="brand" onClick={close}>
        <span className="brand-mark" aria-hidden="true">▣</span>
        IT Asset Manager
      </NavLink>

      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      <ul id="main-menu" className={open ? 'menu open' : 'menu'}>
        {MENU.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={close}
              className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
