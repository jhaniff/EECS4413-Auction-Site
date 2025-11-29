import { useState } from 'react';
import type { FormEvent, ChangeEvent, FocusEvent } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api/authApi';

type ForgotErrors = {
  email?: string;
};

type TouchedState = {
  email: boolean;
};

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<ForgotErrors>({});
  const [touched, setTouched] = useState<TouchedState>({ email: false });

  // --- validation helpers ----------------------------------------------------

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
    return undefined;
  };

  const runValidation = (valueOverride?: string) => {
    const currentEmail = valueOverride ?? email;

    const newErrors: ForgotErrors = {
      email: validateEmail(currentEmail),
    };

    // strip undefined so Object.keys works nicely
    Object.keys(newErrors).forEach((key) => {
      const k = key as keyof ForgotErrors;
      if (!newErrors[k]) delete newErrors[k];
    });

    setErrors(newErrors);
    return newErrors;
  };

  // --- handlers --------------------------------------------------------------

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    runValidation(value);
  };

  const handleEmailBlur = (_e: FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, email: true }));
    runValidation();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    const validationResult = runValidation();
    if (Object.keys(validationResult).length > 0) {
      setTouched({ email: true });
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset({ email });
      setInfoMessage(
        'If this email exists, a reset link and code have been sent to it.',
      );
    } catch {
      // same message so we don’t leak whether the email exists
      setInfoMessage(
        'If this email exists, a reset link and code have been sent to it.',
      );
    } finally {
      setLoading(false);
    }
  };

  const hasClientErrors = Object.keys(errors).length > 0;
  const isSubmitDisabled = loading || hasClientErrors;

  // --- render ----------------------------------------------------------------

  return (
    <div className="auth-container">
      <h1>Forgot Password</h1>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-label">
          Email
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={`auth-input ${
              touched.email && errors.email ? 'auth-input-error' : ''
            }`}
          />
        </label>

        {touched.email && errors.email && (
          <p className="auth-error">{errors.email}</p>
        )}

        {formError && <p className="form-error">{formError}</p>}
        {infoMessage && <p className="auth-success">{infoMessage}</p>}

        <button
          type="submit"
          className="auth-button"
          disabled={isSubmitDisabled}
        >
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
