import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { placePayment } from "../api/paymentAPI";
import { useState, useEffect} from "react";
import "../styles/auctionStyles.css";

function PaymentPage(){
     const { id } = useParams();
     const auctionID = id;
     const [winner, setWinner] = useState(null);
     const [auction, setAuction] = useState(null);
     const navigate = useNavigate();

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
           const response = await placePayment(fullPaymentPayload);
           if(response?.paymentID){
               navigate(`/payment/${response.paymentID}/receipt`);
           }
     }

    return(
        <div className="payment-layout">
            <div className="payment-section">
                <h2 className="section-heading">Winning Bidder</h2>
                {!winner ?(
                    <p>Fetching winner info.</p>
                ):(
                    <>
                    <p className="info-line">First Name: {winner.firstName}</p>
                    <p className="info-line">Last Name: {winner.lastName}</p>
                    <p className="info-line">Street Name: {winner.streetName}</p>
                    <p className="info-line">Street Number: {winner.streetNumber}</p>
                    <p className="info-line">City: {winner.city}</p>
                    <p className="info-line">Country: {winner.country}</p>
                    <p className="info-line">Postal Code: {winner.postalCode}</p>
                    <p className="info-line">Total Cost: {auction.currentPrice}</p>
                    </>
                )}
            </div>

            <div className="payment-section">
                <h2 className="section-heading">Credit Card</h2>
                <PaymentForm onSubmitPayment={handlePayment}/>
            </div>
        </div>
    );
}
export default PaymentPage;