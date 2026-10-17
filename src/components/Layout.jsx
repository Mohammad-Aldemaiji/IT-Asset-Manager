import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

/** Page frame shared by every route: menu on top, page content below. */
export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavBar />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        IT Asset Manager · Part 1 (frontend only, data kept in memory)
      </footer>
    </div>
  );
}
