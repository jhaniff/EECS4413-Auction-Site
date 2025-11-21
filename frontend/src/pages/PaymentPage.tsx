import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router-dom";
import { placePayment } from "../api/paymentAPI";
import { useState, useEffect} from "react";
function PaymentPage(){
     const { id } = useParams();
     const auctionID = id;
     const [winner, setWinner] = useState(null);
     useEffect(() => {
         fetch(`http://localhost:8080/auction/${id}`)
            .then(resp => resp.json())
            .then(data => {
                setWinner({
                    userId: data.highestBidderId,
                    name: data.highestBidderName
                });
            })
         }, []);
     async function handlePayment(paymentInfo){
           const expiryDateISO = new Date(paymentInfo.expiryDate).toISOString();
           const fullPaymentPayload = {
               auctionID: parseInt(auctionID),
               user: {userId: winner.userId},
               cardNumber: paymentInfo.cardNumber,
               nameOnCard: paymentInfo.nameOnCard,
               expiryDate: expiryDateISO,
               securityCode: paymentInfo.securityCode,
               expedited: paymentInfo.expeditedShipping
           };
           //console.log("Payment Payload:", fullPaymentPayload);
           const response = await placePayment(fullPaymentPayload);
           console.log("Backend response: ", response);
     }

    return(
        <div style={{display: "flex", gap: "850px"}}>
            <h2>Credit Card</h2>
            <PaymentForm onSubmitPayment={handlePayment}/>
        </div>
        );
    }
export default PaymentPage;
