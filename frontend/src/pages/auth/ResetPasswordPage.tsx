import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [uuid, setUuid] = useState(searchParams.get('uuid') || '');
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!uuid || !code || !newPassword || !confirmPassword) {
      setFormError('All fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ uuid, code, newPassword });
      setSuccessMessage('Password reset successfully. You can now sign in.');
    
      setTimeout(() => navigate('/auth'), 1500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Invalid reset code or expired reset request.';
      setFormError(message || 'Invalid reset code or expired reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Reset Password</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Reset ID (UUID)
          <input
            type="text"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            required
          />
        </label>

        <label>
          Code
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>

        <label>
          New Password
          <input
            type="password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Confirm New Password
          <input
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        {formError && <p className="form-error">{formError}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/auth">Back to sign in</Link>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
