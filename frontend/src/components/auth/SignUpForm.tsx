import { useState, type FormEvent } from 'react';
import {
  registerUser,
  type RegisterRequest,
  type UserAddressRequest,
} from '../../api/authApi';


interface SignUpFormProps {
  onSignedUp?: () => void; 
}

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

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email || !firstName || !lastName) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
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

    setLoading(true);
    try {
      await registerUser(payload);

      setSuccessMessage('Account created successfully! You can now sign in.');
      if (onSignedUp) {
        onSignedUp();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to sign up. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {/* Email */}
      <label className="auth-label">
        Email
        <input
          type="email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      {/* First Name */}
      <label className="auth-label">
        First Name
        <input
          type="text"
          className="auth-input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </label>

      {/* Last Name */}
      <label className="auth-label">
        Last Name
        <input
          type="text"
          className="auth-input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </label>

      <div className="auth-address-group">
        <label className="auth-label">
          Street Number
          <input
            type="text"
            className="auth-input"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          Street Name
          <input
            type="text"
            className="auth-input"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          City
          <input
            type="text"
            className="auth-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          Country
          <input
            type="text"
            className="auth-input"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          Postal Code
          <input
            type="text"
            className="auth-input"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </label>
      </div>

      {/* Password */}
      <label className="auth-label">
        Password
        <input
          type="password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {/* Confirm Password */}
      <label className="auth-label">
        Confirm Password
        <input
          type="password"
          className="auth-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </label>

      {formError && <p className="auth-error">{formError}</p>}
      {successMessage && <p className="auth-success">{successMessage}</p>}

      <button
        type="submit"
        className="auth-submit-button"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}

export default SignUpForm;
