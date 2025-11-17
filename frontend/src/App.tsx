import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import CataloguePage from './pages/CataloguePage'; // simple placeholder for after login
import './App.css';

function App() {
  return (
    <div className="app-container">
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
    </div>
  );
}

export default App;
