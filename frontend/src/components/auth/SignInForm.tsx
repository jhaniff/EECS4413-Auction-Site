import { useState } from 'react';
import type { FormEvent, ChangeEvent, FocusEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../../api/authApi';

type SignInErrors = {
  email?: string;
  password?: string;
};

type TouchedState = {
  email: boolean;
  password: boolean;
};

// Password must be 8+ chars, with at least 1 lowercase, 1 uppercase, and 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Helper to check if password satisfies the regex
const isStrongPassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

const getFriendlyErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    const raw = error.message?.toLowerCase() ?? '';
    if (raw.includes('failed to fetch') || raw.includes('network')) {
      return 'Unable to reach the server. Please check your internet connection and try again.';
    }
    if (raw.includes('timeout')) {
      return 'The request timed out. Please try again in a moment.';
    }
    return error.message || fallback;
  }
  return fallback;
};

function SignInForm() {
  // ---------------- state ----------------

  // Controlled input state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation error messages for each field
  const [errors, setErrors] = useState<SignInErrors>({});

  // Tracks which fields have been focused/blurred
  const [touched, setTouched] = useState<TouchedState>({
    email: false,
    password: false,
  });

  // Generic/server-side error (e.g. wrong credentials)
  const [formError, setFormError] = useState<string | null>(null);

  // Used to disable the button while a request is in-flight
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // ---------------- validation helpers ----------------

  // Validate email format and required-ness
  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address.';
    return undefined;
  };

  // Validate password strength and required-ness
  const validatePassword = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return 'Password is required.';
    if (!isStrongPassword(trimmed)) {
      return 'Password must be at least 8 characters and include an uppercase letter, lowercase letter, and a number.';
    }
    return undefined;
  };

  // Runs validation for the whole form or for overridden values
  const runValidation = (values?: { email?: string; password?: string }) => {
    const currentEmail = values?.email ?? email;
    const currentPassword = values?.password ?? password;

    const newErrors: SignInErrors = {
      email: validateEmail(currentEmail),
      password: validatePassword(currentPassword),
    };

    // Remove keys whose value is undefined so Object.keys(errors).length is accurate
    Object.keys(newErrors).forEach((key) => {
      const k = key as keyof SignInErrors;
      if (!newErrors[k]) delete newErrors[k];
    });

    setErrors(newErrors);
    return newErrors;
  };

  // ---------------- event handlers ----------------

  // Email change handler (live validation)
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    runValidation({ email: value });
  };

  // Password change handler (live validation)
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    runValidation({ password: value });
  };

  // Blur handler to mark a field as touched and re-run validation
  const handleBlur =
    (field: keyof TouchedState) =>
    (_e: FocusEvent<HTMLInputElement>): void => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      runValidation(); // validate whole form on blur
    };

  // Submit handler: validate, call API, and navigate on success
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationResult = runValidation();
    if (Object.keys(validationResult).length > 0) {
      // If there are client-side errors, show them for all fields
      setTouched({ email: true, password: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await signIn({ email, password });
      // Store JWT in localStorage (simple auth demo)
      localStorage.setItem('authToken', response.accessToken);
      // Navigate to catalogue page after successful login
      navigate('/catalogue');
    } catch (err) {
      setFormError(
        getFriendlyErrorMessage(
          err,
          'Email or password is incorrect. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasClientErrors = Object.keys(errors).length > 0;
  const isSubmitDisabled = isSubmitting || hasClientErrors;

  // ---------------- render ----------------

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {/* Email field */}
      <div className="auth-field">
        {/* 
          auth-label makes the label and input stack vertically,
          so the input appears on the next line under "Email"
        */}
        <label className="auth-label">
          Email
          <input
            type="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            onChange={handleEmailChange}
            onBlur={handleBlur('email')}
            className={`auth-input ${
              touched.email && errors.email ? 'auth-input-error' : ''
            }`}
          />
        </label>
        {touched.email && errors.email && (
          <div className="auth-error">{errors.email}</div>
        )}
      </div>

      {/* Password field */}
      <div className="auth-field">
        <label className="auth-label">
          Password
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            placeholder="Enter your password"
            onChange={handlePasswordChange}
            onBlur={handleBlur('password')}
            className={`auth-input ${
              touched.password && errors.password ? 'auth-input-error' : ''
            }`}
          />
        </label>
        {touched.password && errors.password && (
          <div className="auth-error">{errors.password}</div>
        )}
      </div>

      {/* Server / generic error (e.g. invalid credentials) */}
      {formError && <p className="form-error">{formError}</p>}

      {/* Submit button */}
      <button type="submit" disabled={isSubmitDisabled}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>

      {/* Link to Forgot Password page */}
      <div className="auth-links">
        <Link to="/auth/forgot">Forgot password?</Link>
      </div>
    </form>
  );
}

export default SignInForm;
