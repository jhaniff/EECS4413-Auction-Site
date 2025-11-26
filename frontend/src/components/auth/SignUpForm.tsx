import {
  useState,
  type FormEvent,
  type ChangeEvent,
  type FocusEvent,
} from 'react';
import {
  registerUser,
  type RegisterRequest,
  type UserAddressRequest,
} from '../../api/authApi';

interface SignUpFormProps {
  onSignedUp?: () => void;
}

type SignUpErrors = {
  email?: string;
  firstName?: string;
  lastName?: string;
  streetNumber?: string;
  streetName?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  password?: string;
  confirmPassword?: string;
};

type TouchedState = {
  email: boolean;
  firstName: boolean;
  lastName: boolean;
  streetNumber: boolean;
  streetName: boolean;
  city: boolean;
  country: boolean;
  postalCode: boolean;
  password: boolean;
  confirmPassword: boolean;
};

// Password must be 8+ chars, with at least 1 lowercase, 1 uppercase, and 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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
      return 'The request timed out. Please try again shortly.';
    }
    return error.message || fallback;
  }
  return fallback;
};

function SignUpForm({ onSignedUp }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<SignUpErrors>({});
  const [touched, setTouched] = useState<TouchedState>({
    email: false,
    firstName: false,
    lastName: false,
    streetNumber: false,
    streetName: false,
    city: false,
    country: false,
    postalCode: false,
    password: false,
    confirmPassword: false,
  });

  const [formError, setFormError] = useState<string | null>(null); // server / generic
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------- validation helpers ----------------

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
    return undefined;
  };

  const validateRequiredText = (
    label: string,
    value: string,
  ): string | undefined => {
    if (!value.trim()) return `${label} is required.`;
    return undefined;
  };

  const validateStreetNumber = (value: string): string | undefined => {
    if (!value.trim()) return 'Street Number is required.';
    const numericRegex = /^[0-9]+$/;
    if (!numericRegex.test(value.trim()))
      return 'Street Number must be numeric.';
    return undefined;
  };

  const validatePostalCode = (value: string): string | undefined => {
    if (!value.trim()) return 'Postal Code is required.';
    // simple “letters/digits + optional space” check (works fine for Canadian-style codes)
    const postalRegex = /^[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]$/;
    if (!postalRegex.test(value.trim()))
      return 'Please enter a valid postal code.';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return 'Password is required.';
    if (!isStrongPassword(trimmed)) {
      return 'Password must be at least 8 characters and include an uppercase letter, lowercase letter, and a number.';
    }
    return undefined;
  };

  const validateConfirmPassword = (
    value: string,
    pwd: string,
  ): string | undefined => {
    if (!value.trim()) return 'Please confirm your password.';
    if (value !== pwd) return 'Passwords do not match.';
    return undefined;
  };

  const runValidation = (values?: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    streetNumber: string;
    streetName: string;
    city: string;
    country: string;
    postalCode: string;
    password: string;
    confirmPassword: string;
  }>) => {
    const current = {
      email,
      firstName,
      lastName,
      streetNumber,
      streetName,
      city,
      country,
      postalCode,
      password,
      confirmPassword,
      ...values,
    };

    const newErrors: SignUpErrors = {
      email: validateEmail(current.email),
      firstName: validateRequiredText('First Name', current.firstName),
      lastName: validateRequiredText('Last Name', current.lastName),
      streetNumber: validateStreetNumber(current.streetNumber),
      streetName: validateRequiredText('Street Name', current.streetName),
      city: validateRequiredText('City', current.city),
      country: validateRequiredText('Country', current.country),
      postalCode: validatePostalCode(current.postalCode),
      password: validatePassword(current.password),
      confirmPassword: validateConfirmPassword(
        current.confirmPassword,
        current.password,
      ),
    };

    // strip undefined entries
    Object.keys(newErrors).forEach((key) => {
      const k = key as keyof SignUpErrors;
      if (!newErrors[k]) delete newErrors[k];
    });

    setErrors(newErrors);
    return newErrors;
  };

  // ---------------- change / blur handlers ----------------

  const handleChange =
    (field: keyof TouchedState) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      switch (field) {
        case 'email':
          setEmail(value);
          runValidation({ email: value });
          break;
        case 'firstName':
          setFirstName(value);
          runValidation({ firstName: value });
          break;
        case 'lastName':
          setLastName(value);
          runValidation({ lastName: value });
          break;
        case 'streetNumber':
          setStreetNumber(value);
          runValidation({ streetNumber: value });
          break;
        case 'streetName':
          setStreetName(value);
          runValidation({ streetName: value });
          break;
        case 'city':
          setCity(value);
          runValidation({ city: value });
          break;
        case 'country':
          setCountry(value);
          runValidation({ country: value });
          break;
        case 'postalCode':
          setPostalCode(value);
          runValidation({ postalCode: value });
          break;
        case 'password':
          setPassword(value);
          // also revalidate confirmPassword because it depends on password
          runValidation({ password: value });
          break;
        case 'confirmPassword':
          setConfirmPassword(value);
          runValidation({ confirmPassword: value });
          break;
      }
    };

  const handleBlur =
    (field: keyof TouchedState) =>
    (_e: FocusEvent<HTMLInputElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      runValidation();
    };

  // ---------------- submit ----------------

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const validationResult = runValidation();
    if (Object.keys(validationResult).length > 0) {
      // mark everything as touched so all errors show
      setTouched({
        email: true,
        firstName: true,
        lastName: true,
        streetNumber: true,
        streetName: true,
        city: true,
        country: true,
        postalCode: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    const userAddress: UserAddressRequest = {
      streetName,
      streetNumber,
      city,
      country,
      postalCode,
    };

    const payload: RegisterRequest = {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      userAddress,
    };

    setIsSubmitting(true);
    try {
      await registerUser(payload);

      setSuccessMessage('Account created successfully! You can now sign in.');
      if (onSignedUp) onSignedUp();
    } catch (err: unknown) {
      setFormError(
        getFriendlyErrorMessage(
          err,
          'We could not create your account. Please review the form and try again.',
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
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      {/* Email */}
      <div className="auth-field">
        <label className="auth-label">
          Email
          <input
            type="email"
            className={`auth-input ${
              touched.email && errors.email ? 'auth-input-error' : ''
            }`}
            value={email}
            placeholder="you@example.com"
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
          />
        </label>
        {touched.email && errors.email && (
          <div className="auth-error">{errors.email}</div>
        )}
      </div>

      {/* First Name */}
      <div className="auth-field">
        <label className="auth-label">
          First Name
          <input
            type="text"
            className={`auth-input ${
              touched.firstName && errors.firstName ? 'auth-input-error' : ''
            }`}
            value={firstName}
            placeholder="Jane"
            onChange={handleChange('firstName')}
            onBlur={handleBlur('firstName')}
          />
        </label>
        {touched.firstName && errors.firstName && (
          <div className="auth-error">{errors.firstName}</div>
        )}
      </div>

      {/* Last Name */}
      <div className="auth-field">
        <label className="auth-label">
          Last Name
          <input
            type="text"
            className={`auth-input ${
              touched.lastName && errors.lastName ? 'auth-input-error' : ''
            }`}
            value={lastName}
            placeholder="Doe"
            onChange={handleChange('lastName')}
            onBlur={handleBlur('lastName')}
          />
        </label>
        {touched.lastName && errors.lastName && (
          <div className="auth-error">{errors.lastName}</div>
        )}
      </div>

      {/* Address block */}
      <div className="auth-address-group">
        <div className="auth-field">
          <label className="auth-label">
            Street Number
            <input
              type="text"
              className={`auth-input ${
                touched.streetNumber && errors.streetNumber
                  ? 'auth-input-error'
                  : ''
              }`}
              value={streetNumber}
              placeholder="123"
              onChange={handleChange('streetNumber')}
              onBlur={handleBlur('streetNumber')}
            />
          </label>
          {touched.streetNumber && errors.streetNumber && (
            <div className="auth-error">{errors.streetNumber}</div>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">
            Street Name
            <input
              type="text"
              className={`auth-input ${
                touched.streetName && errors.streetName
                  ? 'auth-input-error'
                  : ''
              }`}
              value={streetName}
              placeholder="Main St"
              onChange={handleChange('streetName')}
              onBlur={handleBlur('streetName')}
            />
          </label>
          {touched.streetName && errors.streetName && (
            <div className="auth-error">{errors.streetName}</div>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">
            City
            <input
              type="text"
              className={`auth-input ${
                touched.city && errors.city ? 'auth-input-error' : ''
              }`}
              value={city}
              placeholder="Toronto"
              onChange={handleChange('city')}
              onBlur={handleBlur('city')}
            />
          </label>
          {touched.city && errors.city && (
            <div className="auth-error">{errors.city}</div>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">
            Country
            <input
              type="text"
              className={`auth-input ${
                touched.country && errors.country ? 'auth-input-error' : ''
              }`}
              value={country}
              placeholder="Canada"
              onChange={handleChange('country')}
              onBlur={handleBlur('country')}
            />
          </label>
          {touched.country && errors.country && (
            <div className="auth-error">{errors.country}</div>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">
            Postal Code
            <input
              type="text"
              className={`auth-input ${
                touched.postalCode && errors.postalCode
                  ? 'auth-input-error'
                  : ''
              }`}
              value={postalCode}
              placeholder="A1B 2C3"
              onChange={handleChange('postalCode')}
              onBlur={handleBlur('postalCode')}
            />
          </label>
          {touched.postalCode && errors.postalCode && (
            <div className="auth-error">{errors.postalCode}</div>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="auth-field">
        <label className="auth-label">
          Password
          <input
            type="password"
            className={`auth-input ${
              touched.password && errors.password ? 'auth-input-error' : ''
            }`}
            value={password}
            placeholder="Create a password"
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
          />
        </label>
        {touched.password && errors.password && (
          <div className="auth-error">{errors.password}</div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="auth-field">
        <label className="auth-label">
          Confirm Password
          <input
            type="password"
            className={`auth-input ${
              touched.confirmPassword && errors.confirmPassword
                ? 'auth-input-error'
                : ''
            }`}
            value={confirmPassword}
            placeholder="Re-enter password"
            onChange={handleChange('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
          />
        </label>
        {touched.confirmPassword && errors.confirmPassword && (
          <div className="auth-error">{errors.confirmPassword}</div>
        )}
      </div>

      {/* server / generic + success */}
      {formError && <p className="form-error">{formError}</p>}
      {successMessage && <p className="auth-success">{successMessage}</p>}

      <button
        type="submit"
        className="auth-submit-button"
        disabled={isSubmitDisabled}
      >
        {isSubmitting ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}

export default SignUpForm;
