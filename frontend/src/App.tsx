import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import PaymentPage from "./pages/PaymentPage";
import ReceiptPage from "./pages/ReceiptPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auction/:id" element={<AuctionDetailPage />} />
        <Route path="/auction/:id/payment" element={<PaymentPage />} />
        <Route path="/payment/:paymentId/receipt" element={<ReceiptPage />} />

      </Routes>
    </BrowserRouter>
  );
}
export default App;