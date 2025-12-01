import { useState } from "react";

interface PaymentFormProps {
  onSubmitPayment: (info: any) => void;
}

function PaymentForm({ onSubmitPayment }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [expeditedShipping, setExpeditedShipping] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmitPayment({
      cardNumber,
      nameOnCard,
      expiryDate,
      securityCode,
      expeditedShipping
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Card Number</label>
        <input
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
      </div>

      <div>
        <label>Name on Card</label>
        <input
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
        />
      </div>

      <div>
        <label>Expiry Date</label>
        <input
          type="month"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
      </div>

      <div>
        <label>Security Code</label>
        <input
          value={securityCode}
          onChange={(e) => setSecurityCode(e.target.value)}
        />
      </div>

      <div>
        <label>Expedited Shipping</label>
        <input
          type="checkbox"
          checked={expeditedShipping}
          onChange={(e) => setExpeditedShipping(e.target.checked)}
        />
      </div>

      <button type="submit">Submit Payment</button>
    </form>
  );
}

export default PaymentForm;