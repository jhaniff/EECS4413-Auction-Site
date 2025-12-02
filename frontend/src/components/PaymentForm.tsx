import { useEffect, useState } from "react";

export interface PaymentFormValues {
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  securityCode: string;
  expeditedShipping: boolean;
}

interface PaymentFormProps {
  onSubmitPayment: (info: PaymentFormValues) => void;
  submitting?: boolean;
}

type PaymentFormErrors = Pick<PaymentFormValues, "cardNumber" | "nameOnCard" | "securityCode">;

function PaymentForm({ onSubmitPayment, submitting = false }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [expeditedShipping, setExpeditedShipping] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const [errors, setErrors] = useState<PaymentFormErrors>({
    cardNumber: "",
    nameOnCard: "",
    securityCode: "",
  });

  function validate() {
    let valid = true;
    const newErrors: PaymentFormErrors = {
      cardNumber: "",
      nameOnCard: "",
      securityCode: "",
    };

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

  useEffect(() => {
    const formIsValid =
      /^\d{16}$/.test(cardNumber) &&
      nameOnCard.trim().length > 0 &&
      nameOnCard.length <= 50 &&
      /^\d{3,4}$/.test(securityCode) &&
      expiryDate !== "";

    setIsFormValid(formIsValid);
  }, [cardNumber, nameOnCard, securityCode, expiryDate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmitPayment({
      cardNumber,
      nameOnCard,
      expiryDate,
      securityCode,
      expeditedShipping
    });
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Card Number</label>
            <input
              className="payment-input"
              maxLength={16}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
            />
            {errors.cardNumber && <p className="error-text">{errors.cardNumber}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Name on Card</label>
            <input
              className="payment-input"
              maxLength={50}
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
            />
            {errors.nameOnCard && <p className="error-text">{errors.nameOnCard}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              className="payment-input"
              type="month"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Security Code</label>
            <input
              className="payment-input"
              type="password"
              maxLength={4}
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ""))}
            />
            {errors.securityCode && (
              <p className="error-text">{errors.securityCode}</p>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="form-label">Expedited Shipping</label>
            <input
              type="checkbox"
              checked={expeditedShipping}
              onChange={(e) => setExpeditedShipping(e.target.checked)}
            />
          </div>

          <button
            type="submit"
            className="payment-submit-btn"
            disabled={submitting || !isFormValid}
          >
            Submit Payment
          </button>
        </form>
  );
}

export default PaymentForm;