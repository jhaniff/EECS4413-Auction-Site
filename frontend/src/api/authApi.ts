import { API_BASE_URL } from './config';

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

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (res.ok) {
    // Success case

    // return 200/204 with no body
    if (!text) {
      return {} as T;
    }

    // Endpoints like /login and /register return JSON
    try {
      return JSON.parse(text) as T;
    } catch {
      // If it’s not valid JSON but still a success, just ignore the body
      return {} as T;
    }
  }

  // Error case
  let message = 'An unexpected error occurred. Please try again.';

  if (text) {
    try {
      const body = JSON.parse(text) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // If server returned plain text, use that
      message = text;
    }
  }

  throw new Error(message);
}


export async function signIn(request: SignInRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerUser(request: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<AuthResponse>(res);
}

export async function requestPasswordReset(
  request: ForgotPasswordRequest,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request), // { email }
  });
  await handleResponse<unknown>(res);
}

export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/forgot/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request), // { uuid, code, newPassword }
  });
  await handleResponse<unknown>(res);
}
