import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OAuthSuccessPage from './pages/auth/OAuthSuccessPage';
import CataloguePage from './pages/CataloguePage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import UserBidsPage from './pages/UserBidsPage';
import SellItemPage from './pages/SellItemPage';
import './styles/app/App.css';
import PaymentPage from "./pages/PaymentPage";
import ReceiptPage from "./pages/ReceiptPage";

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
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />

          {/* after login */}
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/auction/:auctionId" element={<AuctionDetailPage />} />
          <Route path="/bids" element={<UserBidsPage />} />
          <Route path="/sell" element={<SellItemPage />} />
          <Route path="/auction/:auctionId" element={<AuctionDetailPage />} />
          <Route path="/auction/:id/payment" element={<PaymentPage />} />
          <Route path="/payment/:paymentId/receipt" element={<ReceiptPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
