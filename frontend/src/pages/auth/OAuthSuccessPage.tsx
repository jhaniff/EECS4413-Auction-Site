import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../../styles/pages/OAuthSuccessPage.css';

function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'missing'>('processing');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('missing');
      return;
    }

    localStorage.setItem('authToken', token);
    const timer = window.setTimeout(() => {
      navigate('/catalogue', { replace: true });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="oauth-success-page">
      <div className="oauth-success-card">
        {status === 'processing' ? (
          <>
            <p className="eyebrow">OAuth sign-in</p>
            <h1>Finishing your sign-in…</h1>
            <p>
              We received a token from your provider and are redirecting you back to the
              catalogue.
            </p>
            <p className="hint">Hang tight—this typically takes a second.</p>
          </>
        ) : (
          <>
            <p className="eyebrow">OAuth sign-in</p>
            <h1>Missing access token</h1>
            <p>
              We could not retrieve your session from the provider. Please try signing in again
              from the authentication page.
            </p>
            <Link to="/auth" className="inline-link">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuthSuccessPage;
