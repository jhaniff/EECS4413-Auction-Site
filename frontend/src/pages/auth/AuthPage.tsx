import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SignInForm from '../../components/auth/SignInForm';
import SignUpForm from '../../components/auth/SignUpForm';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import '../../styles/pages/AuthPage.css';

type AuthTab = 'signin' | 'signup';

function AuthPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AuthTab>(() =>
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin',
  );

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup' || modeParam === 'signin') {
      setActiveTab(modeParam);
    }
  }, [searchParams]);

  const handleSignedUp = () => {
    setActiveTab('signin');
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back-link">
        <span aria-hidden="true">&larr;</span>
        <span>Bac1k to landing</span>
      </Link>
      <div className="auth-card">
        <h1 className="auth-title">Auction Platform</h1>


        <div className="auth-tabs">
         <button
            type="button"
            className={activeTab === 'signin' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => setActiveTab('signin')}
            >
            Sign In
            </button>

            <button
            type="button"
            className={activeTab === 'signup' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => setActiveTab('signup')}
            >
            Sign Up
            </button>

        </div>

        {activeTab === 'signin' ? (
          <SignInForm />
        ) : (
          <SignUpForm onSignedUp={handleSignedUp} />
        )}

        <SocialAuthButtons />
      </div>
    </div>
  );
}

export default AuthPage;
