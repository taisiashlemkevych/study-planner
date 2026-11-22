import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="header">
      <div className="header__content">
        <NavLink to="/tasks" className="header__logo">
          <span className="header__logo-icon">S</span>
          <span>Study Planner</span>
        </NavLink>

        <nav className="header__nav" aria-label="Main navigation">
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `header__link ${isActive ? 'header__link--active' : ''}`
            }
          >
            Tasks
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `header__link ${isActive ? 'header__link--active' : ''}`
              }
            >
              Profile
            </NavLink>
          )}

          {isAuthenticated ? (
            <button
              className="header__link"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `header__link ${isActive ? 'header__link--active' : ''}`
              }
            >
              Login
            </NavLink>
          )}
        </nav>

        <p className="header__subtitle">
          Organize your learning, one task at a time.
        </p>
      </div>
    </header>
  );
}

export default Header;
