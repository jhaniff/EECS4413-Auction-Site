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
  const [isFormValid, setIsFormValid] = useState(false);

  const [errors, setErrors] = useState({
      cardNumber: "",
      nameOnCard: "",
      securityCode: ""
      )};

    function validate() {
        let valid = true;
        const newErrors: any = {};

        if (!/^\d{16}$/.test(cardNumber)) {
          newErrors.cardNumber = "Card number must be exactly 16 digits.";
          valid = false;
        }

        if (nameOnCard.trim().length === 0 || nameOnCard.length > 50) {
          newErrors.nameOnCard = "Name must be 1–50 characters.";
          valid = false;
        }

        if (!/^\d{3,4}$/.test(securityCode)) {
          newErrors.securityCode = "Security code must be 3–4 digits.";
          valid = false;
        }

        setErrors(newErrors);
        return valid;
     }

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