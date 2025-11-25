import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import CataloguePage from './pages/CataloguePage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Top header bar */}
      <header className="app-header">
        <div className="app-header-content">
          <span className="app-header-title">Auction Platform</span>
        </div>
      </header>

      {/* Main area with existing auth card, catalogue, etc. */}
      <main className="app-main">
        <Routes>
          {/* default: go to /auth */}
          <Route path="/" element={<Navigate to="/auth" replace />} />

          {/* auth flows */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset" element={<ResetPasswordPage />} />

          {/* after login */}
          <Route path="/catalogue" element={<CataloguePage />} />

          {/* fallback */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
