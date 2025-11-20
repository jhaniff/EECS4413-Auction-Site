import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router-dom";
import { placePayment } from "../api/paymentAPI";

function PaymentPage(){
     const { id } = useParams();
     const auctionID = id;
     async function handlePayment(paymentInfo){
           const expiryDateISO = new Date(paymentInfo.expiryDate).toISOString();
           const fullPaymentPayload = {
               auctionID: parseInt(auctionID),
               user: {userId: 1},
               cardNumber: paymentInfo.cardNumber,
               nameOnCard: paymentInfo.nameOnCard,
               expiryDate: expiryDateISO,
               securityCode: paymentInfo.securityCode,
               isExpedited: paymentInfo.expeditedShipping
           };
           //console.log("Payment Payload:", fullPaymentPayload);
           const response = await placePayment(fullPaymentPayload);
           console.log("Backend repsonse: ", response);
     }

    return(
        <div>
            <h2>Winning Bidder</h2>
            <PaymentForm onSubmitPayment={handlePayment}/>
        </div>
        );
    }
export default PaymentPage;
