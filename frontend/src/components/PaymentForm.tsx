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
      <label>Card Number:
        <input
            type="number"
            value={cardNumber}
            onChange={handleChange}
         />
      </label>
      <label>Name on Card:
              <input
                  type="text"
                  value={nameOnCard}
                  onChange={handleChange}
               />
            </label>
      <label>:Expiry Date:
              <input
                  type="text"
                  value={expiryDate}
                  onChange={handleChange}
               />
            </label>
      <label>Security Code:
              <input
                  type="number"
                  value={securityCode}
                  onChange={handleChange}
               />
            </label>
      <input type="submit" />
          {<p>Your card number is: {cardNumber}.  </p>}
          {<p>Your name on card is: {nameOnCard}.  </p>}
          {<p>Your expiry date is: {expiryDate}.  </p>}
          {<p>Your security code is: {securityCode}.  </p>}
    </form>
  )
}
export default PaymentForm;