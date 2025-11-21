import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router-dom";
import { placePayment } from "../api/paymentAPI";
import { useState, useEffect} from "react";
function PaymentPage(){
     const { id } = useParams();
     const auctionID = id;
     const [winner, setWinner] = useState(null);
     const [auction, setAuction] = useState(null);

     useEffect(() => {
         fetch(`http://localhost:8080/auction/${id}`)
            .then(resp => resp.json())
            .then(data => {
                setAuction(data);
                return fetch(`http://localhost:8080/auction/${id}/winner`);
                })
            .then(resp => resp.json())
            .then(winner => {
                setWinner(winner);
            })
            })
         }, [id]);
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
            <div>
                <h2>Winning Bidder</h2>
                <p>First Name: </p>
                <p>Last Name: </p>
                <p>Street Name: </p>
                <p>Street Number: </p>
                <p>City: </p>
                <p>Province: </p>
                <p>Country: </p>
                <p>Postal Code: </p>
                <p>Total Cost: </p>

            </div>
            <div>
                <h2>Credit Card</h2>
                <PaymentForm onSubmitPayment={handlePayment}/>
            </div>
        </div>
        );
    }
export default PaymentPage;
