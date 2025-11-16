import { useState } from 'react';

function PaymentForm({onSubmitPayment}) {
    const [cardNumber, setCardNumber] = useState("");
    const [nameOnCard, setNameOnCard] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [securityCode, setSecurityCode] = useState("");

    const paymentInfo = {
      cardNumber,
      nameOnCard,
      expiryDate,
      securityCode
    };

      function handleSubmit(e) {
        e.preventDefault();
        onSubmitPayment(paymentInfo);
      }
  return (
    <form onSubmit={handleSubmit}>
    <p>
          <label>Card Number:
            <input
                type="number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
             />
          </label>
      </p>
      <p>
          <label>Name on Card:
                  <input
                      type="text"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                   />
                </label>
       </p>
       <p>
          <label>:Expiry Date:
                  <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                   />
                </label>
       </p>
       <p>
          <label>Security Code:
                  <input
                      type="number"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                   />
                </label>
       </p>
      <input type="submit" />
    </form>
  )
}
export default PaymentForm;