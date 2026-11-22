import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="profile-page">
      <section className="profile-page__card">
        <h1>My Profile</h1>

        <p>
          <strong>Username:</strong> {user?.username}
        </p>

        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        <p>
          <strong>Status:</strong> Authenticated
        </p>

        <button
          className="button button--primary"
          onClick={handleLogout}
        >
          Logout
        </button>
      </section>
    </main>
  );
}

export default ProfilePage;
