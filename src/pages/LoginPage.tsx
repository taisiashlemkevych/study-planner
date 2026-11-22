import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema, type LoginFormData } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(authSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setLoginError('');

    try {
      await login(data);
      navigate('/profile', { replace: true });
    } catch {
      setLoginError('Invalid username or password');
    }
  };

  return (
    <main className="login-page">
      <section className="login-page__card">
        <h1>Welcome back</h1>
        <p>Sign in to your Study Planner account.</p>

        <form className="task-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              {...register('username')}
            />
            {errors.username && (
              <p className="login-page__error">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && (
              <p className="login-page__error">
                {errors.password.message}
              </p>
            )}
          </div>

          {loginError && (
            <p className="login-page__error" role="alert">
              {loginError}
            </p>
          )}

          <button
            className="button button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="login-page__hint">
          Test account: emilys / emilyspass
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
