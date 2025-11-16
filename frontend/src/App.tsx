import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import PaymentPage from "./pages/PaymentPage";


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auction/:id" element={<AuctionDetailPage />} />
        <Route path="/auction/:id/payment" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
