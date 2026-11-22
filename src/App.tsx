import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

const TasksPage = lazy(() => import('./pages/TasksPage'));
const TaskDetailsPage = lazy(
  () => import('./pages/TaskDetailsPage'),
);
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <main className="app__main">
      <div className="empty-state" role="status">
        <h3>Loading page...</h3>
        <p>Please wait.</p>
      </div>
    </main>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/tasks" replace />} />

          <Route path="tasks" element={<TasksPage />} />

          <Route
            path="tasks/:taskId"
            element={<TaskDetailsPage />}
          />

          <Route path="login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
