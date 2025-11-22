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
            .then(winnerInfo => {
                setWinner(winnerInfo);
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
           if(response?.paymentID){
               navigate(`/payment/${response.paymentID}/receipt`);
               }
           console.log("Backend response: ", response);
     }

    return(
        <div style={{display: "flex", gap: "850px"}}>
            <div>
                <h2>Winning Bidder</h2>
                {!winner ?(
                    <p>Fetching winner info.  </p>
                ):(
                    <>
                    <p>First Name: {winner.firstName}</p>
                    <p>Last Name: {winner.lastName}</p>
                    <p>Street Name: {winner.streetName}</p>
                    <p>Street Number: {winner.streetNumber}</p>
                    <p>City: {winner.city}</p>
                    <p>Country: {winner.country}</p>
                    <p>Postal Code: {winner.postalCode}</p>
                    <p>Total Cost: {auction.currentPrice}</p>
                    </>
                   )}
            </div>
            <div>
                <h2>Credit Card</h2>
                <PaymentForm onSubmitPayment={handlePayment}/>
            </div>
        </div>
        );
    }
export default PaymentPage;
