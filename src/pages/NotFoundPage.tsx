import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-page__content">
        <span className="not-found-page__code">404</span>

        <h1>Page not found</h1>

        <p>
          Sorry, the page you are looking for does not exist.
        </p>

        <Link
          to="/tasks"
          className="button button--primary"
        >
          Back to tasks
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
