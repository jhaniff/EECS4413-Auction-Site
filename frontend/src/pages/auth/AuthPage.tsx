import { useState } from 'react';
import SignInForm from '../../components/auth/SignInForm';
import SignUpForm from '../../components/auth/SignUpForm';
import './AuthPage.css';

type AuthTab = 'signin' | 'signup';

function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');

  const handleSignedUp = () => {
    setActiveTab('signin');
  };

  return (
    <div className="auth-page">
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
      </div>
    </div>
  );
}

export default AuthPage;
