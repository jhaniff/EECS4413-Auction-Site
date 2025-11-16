import { useState } from 'react';

function PaymentForm({onSubmitPayment}) {
    const [payment, setPayment] = useState("");
    const paymentInfo = {
      cardNumber,
      nameOnCard,
      expiryDate,
      securityCode
    };
