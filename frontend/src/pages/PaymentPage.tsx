import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router-dom";
import { placePayment } from "../api/paymentAPI";

function PaymentPage(){
     const { id } = useParams();
     const auctionID = id;
           const fullPaymentPayload = {
               auctionID: parseInt(auctionID),
               user: {userId: 1},
               cardNumber: paymentInfo.cardNumber,
               nameOnCard: paymentInfo.nameOnCard,
               expiryDate: paymentInfo.expiryDate,
               securityCode: paymentInfo.securityCode,
               isExpedited: paymentInfo.isExpedited
           };
           console.log("Card Number:", paymentInfo.cardNumber);
           console.log("Name on Card:", paymentInfo.nameOnCard);
           console.log("Expiry Date:", paymentInfo.expiryDate);
           console.log("Security Code:", paymentInfo.securityCode);
           console.log("Shipping Status:", paymentInfo.expeditedShipping);
    return(
        <div>
            <h2>Winning Bidder</h2>
            <PaymentForm onSubmitPayment={handlePayment}/>
        </div>
        )
    }
export default PaymentPage;
