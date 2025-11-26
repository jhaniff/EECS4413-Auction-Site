import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import CataloguePage from './pages/CataloguePage';
import UserBidsPage from './pages/UserBidsPage';
import SellItemPage from './pages/SellItemPage';
import './styles/app/App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* landing */}
        <Route path="/" element={<LandingPage />} />

          {/* auth flows */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset" element={<ResetPasswordPage />} />

          {/* after login */}
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/bids" element={<UserBidsPage />} />
          <Route path="/sell" element={<SellItemPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
