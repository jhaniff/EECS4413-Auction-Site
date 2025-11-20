import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router-dom";
import { placePayment } from "../api/paymentAPI";

function PaymentPage(){
     const { id } = useParams();
     const auctionID = id;
     async function handlePayment(paymentInfo){
           const fullPaymentPayload = {
               auctionID: parseInt(auctionID),
               user: {userId: 1},
               cardNumber: paymentInfo.cardNumber,
               nameOnCard: paymentInfo.nameOnCard,
               expiryDate: paymentInfo.expiryDate,
               securityCode: paymentInfo.securityCode,
               isExpedited: paymentInfo.expeditedShipping
           };
           console.log("Payment Payload:", fullPaymentPayload);
     }

    return(
        <div>
            <h2>Winning Bidder</h2>
            <PaymentForm onSubmitPayment={handlePayment}/>
        </div>
        );
    }
export default PaymentPage;
