import { useParams } from "react-router-dom";
import { useState, useEffect} from "react";
import "../styles/auctionStyles.css";

function ReceiptPage(){
     const { paymentId } = useParams();
     const [payment, setPayment] = useState(null);

     useEffect(() => {
         fetch(`http://localhost:8080/payment/receipt/${paymentId}`)
            .then(resp => resp.json())
            .then(data => {setPayment(data)});
     }, [paymentId]);

     if(!payment){
         return <p>Receipt is generating.</p>
     }

    return(
        <div className="receipt-layout">
            <div className="payment-section">
                <h2 className="section-heading">Winning Bidder</h2>
                <p className="info-line">First Name: {payment.firstName}</p>
                <p className="info-line">Last Name: {payment.lastName}</p>
                <p className="info-line">Street Name: {payment.streetName}</p>
                <p className="info-line">Street Number: {payment.streetNumber}</p>
                <p className="info-line">City: {payment.city}</p>
                <p className="info-line">Country: {payment.country}</p>
                <p className="info-line">Postal Code: {payment.postalCode}</p>
                <p className="info-line">Total Paid: {payment.totalPaid}</p>
            </div>

            <div className="payment-section">
                <h2 className="section-heading">Shipping Details</h2>
                <p className="info-line">Your order has been confirmed.</p>
                <p className="info-line">Delivery Date: {payment.shippingDate}</p>
            </div>
        </div>
    );
}
export default ReceiptPage;