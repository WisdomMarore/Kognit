import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('access_token'));

  useEffect(() => {
    function checkAuth() {
      setHasToken(!!localStorage.getItem('access_token'));
    }

    // Fires when a page is restored from the browser's back/forward cache —
    // without this, a logged-out user hitting "back" sees the stale cached page.
    function handlePageShow(event) {
      if (event.persisted) checkAuth();
    }

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', checkAuth);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}