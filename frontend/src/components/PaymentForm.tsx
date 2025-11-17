import { useState } from 'react';

function PaymentForm({onSubmitPayment}) {
    const [cardNumber, setCardNumber] = useState("");
    const [nameOnCard, setNameOnCard] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [expeditedShipping, setExpeditedShipping] = useState(false);

    const paymentInfo = {
      cardNumber,
      nameOnCard,
      expiryDate,
      securityCode,
      expeditedShipping
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
       <p>
                 <label>Expedited Shipping
                         <input
                             type="checkbox"
                             checked={expeditedShipping}
                             onChange={(e) => setExpeditedShipping(e.target.checked)}
                          />
                       </label>
              </p>
      <input type="submit" />
    </form>
  )
}
export default PaymentForm;