import { useState } from 'react';
import { OAUTH_PROVIDERS } from '../../config/oauthProviders';

type ActiveProviderId = string | null;

function SocialAuthButtons() {
  const [activeProvider, setActiveProvider] = useState<ActiveProviderId>(null);

  const handleRedirect = (providerId: string, authUrl: string) => {
    setActiveProvider(providerId);
    window.location.href = authUrl;
  };

  return (
    <div className="oauth-section">
      <div className="oauth-divider">
        <span>Or continue with</span>
      </div>

      <div className="oauth-buttons">
        {OAUTH_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className="oauth-button"
            onClick={() => handleRedirect(provider.id, provider.authUrl)}
            disabled={Boolean(activeProvider)}
          >
            {activeProvider === provider.id
              ? `Opening ${provider.name}...`
              : `Continue with ${provider.name}`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SocialAuthButtons;
