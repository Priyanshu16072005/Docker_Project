import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLinks = {
    donor: [{ to: '/donate', label: 'Donate' }, { to: '/donations', label: 'History' }],
    ngo: [{ to: '/ngo', label: 'Dashboard' }, { to: '/donations', label: 'Donations' }],
    volunteer: [{ to: '/volunteer', label: 'Deliveries' }],
    admin: [{ to: '/admin', label: 'Admin' }, { to: '/donations', label: 'All' }],
  };

  const links = user ? roleLinks[user.role] || [] : [];

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-mark">FFA</span>
          <span className="logo-text">
            Food For All
            <small>Surplus → Served</small>
          </span>
        </Link>
        <nav className="nav">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="nav-link">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <span className="user-badge">
                <span className="user-dot" />
                {user.name}
                <em>{user.role}</em>
              </span>
              <button type="button" className="btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn-primary nav-cta">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <span>Food For All</span>
        <span className="footer-divider">·</span>
        <span>Reduce waste · Feed people · Track every meal</span>
      </footer>
    </div>
  );
}
