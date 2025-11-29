import { API_BASE_URL } from './config';

// Ensure we never end up with duplicate slashes when composing URLs
const NORMALIZED_BASE = API_BASE_URL.replace(/\/+$/, '');
const API_BASE = `${NORMALIZED_BASE}/api/auth`;

export interface AuthResponse {
  accessToken: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface UserAddressRequest {
  streetName: string;
  streetNumber: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userAddress: UserAddressRequest;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  uuid: string;
  code: string;
  newPassword: string;
}

// Generic helper to handle all API responses consistently
async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  // Success case
  if (res.ok) {
    if (!text) {
      // e.g. 204 No Content
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      // Successful but not JSON
      return {} as T;
    }
  }

  // Special handling for auth failures (wrong email / password)
  if (res.status === 401 || res.status === 403) {
    // You can customize this string however you like
    throw new Error('Email or password is incorrect.');
  }

  // Generic error handling for everything else
  let message = 'An unexpected error occurred. Please try again.';

  if (text) {
    try {
      const body = JSON.parse(text) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      message = text; // plain-text error body
    }
  }

  throw new Error(message);
}


// -------------------- API functions --------------------

// POST /api/auth/login
export async function signIn(request: SignInRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    // If it's a server-side problem, show something different
    if (res.status >= 500) {
      throw new Error('Something went wrong on the server. Please try again later.');
    }

    // For all auth-related failures (wrong email or password),
    // keep it generic on purpose
    throw new Error('Email or password is incorrect.');
  }

  return handleResponse<AuthResponse>(res);
}



// POST /api/auth/register
export async function registerUser(
  request: RegisterRequest,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<AuthResponse>(res);
}

// POST /api/auth/forgot
export async function requestPasswordReset(
  request: ForgotPasswordRequest,
): Promise<void> {
  const res = await fetch(`${API_BASE}/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request), // { email }
  });
  await handleResponse<unknown>(res);
}

// POST /api/auth/forgot/reset
export async function resetPassword(
  request: ResetPasswordRequest,
): Promise<void> {
  const res = await fetch(`${API_BASE}/forgot/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request), // { uuid, code, newPassword }
  });
  await handleResponse<unknown>(res);
}
