import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router-dom";

function PaymentPage(){
    const {id} = useParams();
    function handlePayment(paymentInfo){
        console.log("Card Number:", paymentInfo.cardNumber);
        console.log("Name on Card:", paymentInfo.nameOnCard);
        console.log("Expiry Date:", paymentInfo.expiryDate);
        console.log("Security Code:", paymentInfo.securityCode);
    }

    return(
        <div>
            <h2>Winning Bidder</h2>
            <PaymentForm onSubmitPayment={handlePayment}/>
        </div>
        )
    }
export default PaymentPage;
