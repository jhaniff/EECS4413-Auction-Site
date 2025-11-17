import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../../api/authApi';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
        const response = await signIn({ email, password });
        localStorage.setItem('authToken', response.accessToken);

      navigate('/catalogue');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Email or password is incorrect.';
      setFormError(message || 'Email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <label>
        Password
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {formError && <p className="form-error">{formError}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="auth-links">
        <Link to="/auth/forgot">Forgot password?</Link>
      </div>
    </form>
  );
}

export default SignInForm;
