import { Outlet } from 'react-router';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';
import '../App.css';

function AppLayout() {
  const { theme } = useTheme();

  return (
    <div className={`app app--${theme}`}>
      <Header />

      <Outlet />

      <footer className="app__footer">
        Study Planner · Keep learning, keep growing.
      </footer>
    </div>
  );
}

export default AppLayout;
