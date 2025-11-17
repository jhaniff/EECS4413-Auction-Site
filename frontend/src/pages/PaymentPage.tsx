import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router-dom";
import { placePayment } from "../api/paymentAPI";

function PaymentPage(){
    const {id} = useParams();
    function handlePayment(paymentInfo){
        const auctionID = id;
        const fullPaymentPayload = {auctionID: auctionID, ... paymentInfo};
        console.log("Card Number:", paymentInfo.cardNumber);
        console.log("Name on Card:", paymentInfo.nameOnCard);
        console.log("Expiry Date:", paymentInfo.expiryDate);
        console.log("Security Code:", paymentInfo.securityCode);
        console.log("Shipping Status:", paymentInfo.expeditedShipping);
    }

    return(
        <div>
            <h2>Winning Bidder</h2>
            <PaymentForm onSubmitPayment={handlePayment}/>
        </div>
        )
    }
export default PaymentPage;
