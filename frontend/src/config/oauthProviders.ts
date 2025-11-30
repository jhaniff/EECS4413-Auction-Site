import { API_BASE_URL } from '../api/config';

export type OAuthProvider = {
  id: string;
  name: string;
  description?: string;
  authPath: string;
};

export type OAuthProviderConfig = OAuthProvider & {
  authUrl: string;
};

const PROVIDERS: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    description: 'Use your Google account',
    authPath: '/oauth2/authorization/google'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Use your GitHub account',
    authPath: '/oauth2/authorization/github',
  },
];

export const OAUTH_PROVIDERS: OAuthProviderConfig[] = PROVIDERS.map((provider) => ({
  ...provider,
  authUrl: `${API_BASE_URL}${provider.authPath}`,
}));
