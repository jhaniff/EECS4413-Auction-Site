import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bottomText?: string;
  bottomLinkLabel?: string;
  bottomLinkTo?: string;
}

function AuthLayout({
  title,
  subtitle,
  children,
  bottomText,
  bottomLinkLabel,
  bottomLinkTo,
}: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <header className="auth-header">
          <div className="auth-logo-wrapper">
            <img
              src="/logo.svg"
              alt="App logo"
              className="auth-logo"
            />
          </div>
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </header>

        {/* Form content */}
        <main className="auth-main">{children}</main>

        
        {bottomText && bottomLinkLabel && bottomLinkTo && (
          <footer className="auth-footer">
            <span>{bottomText}</span>{' '}
            <Link to={bottomLinkTo} className="auth-footer-link">
              {bottomLinkLabel}
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
}

export default AuthLayout;
