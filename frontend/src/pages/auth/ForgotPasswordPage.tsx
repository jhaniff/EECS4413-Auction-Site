import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api/authApi';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    if (!email) {
      setFormError('Email is required.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset({ email });
      setInfoMessage(
        'If this email exists, a reset link and code have been sent to it.',
      );
    } catch {
      setInfoMessage(
        'If this email exists, a reset link and code have been sent to it.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Forgot Password</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {formError && <p className="form-error">{formError}</p>}
        {infoMessage && <p className="form-success">{infoMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Send reset email'}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/auth">Back to sign in</Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
