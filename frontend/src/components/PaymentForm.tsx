import { useState } from "react";

export interface PaymentFormValues {
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  securityCode: string;
  expeditedShipping: boolean;
}

interface PaymentFormProps {
  onSubmitPayment: (info: PaymentFormValues) => void | Promise<void>;
  submitting?: boolean;
}

function PaymentForm({ onSubmitPayment, submitting = false }: PaymentFormProps) {
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
          inputMode="numeric"
          minLength={16}
          maxLength={16}
          required
        />
      </div>

      <div>
        <label>Name on Card</label>
        <input
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Expiry Date</label>
        <input
          type="month"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Security Code</label>
        <input
          value={securityCode}
          onChange={(e) => setSecurityCode(e.target.value)}
          inputMode="numeric"
          minLength={3}
          maxLength={3}
          required
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

      <button type="submit" disabled={submitting}>
        {submitting ? 'Processing...' : 'Submit Payment'}
      </button>
    </form>
  );
}

export default PaymentForm;