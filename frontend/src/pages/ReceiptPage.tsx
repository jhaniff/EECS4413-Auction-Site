import { useParams } from "react-router-dom";
import { useState, useEffect} from "react";

function ReceiptPage(){
     const { id } = useParams();
     const paymentId = id;
     const [payment, setPayment] = useState(null);

     useEffect(() => {
         fetch(`http://localhost:8080/payment/receipt/${paymentId}`)
            .then(resp => resp.json())
            .then(data => {setPayment(data)});
         }, [paymentId]);
     if(!payment){
         return <p>Receipt is generating.  </p>
         }
    return(
        <div style={{display: "flex", gap: "850px"}}>
            <div>
                <h2>Winning Bidder</h2>
                {!winner ?(
                    <p>Fetching winner info.  </p>
                ):(
                    <>
                    <p>First Name: {payment.firstName}</p>
                    <p>Last Name: {payment.lastName}</p>
                    <p>Street Name: {payment.streetName}</p>
                    <p>Street Number: {payment.streetNumber}</p>
                    <p>City: {payment.city}</p>
                    <p>Country: {payment.country}</p>
                    <p>Postal Code: {payment.postalCode}</p>
                    <p>Total Cost: {payment.totalAmount}</p>
                    </>
                   )}
            </div>
            <div>
                <h2>Shipping Details</h2>
                    <p>Your order has been confirmed.  </p>
                    <p>Delivery Date: </p>
            </div>
        </div>
        );
    }
export default ReceiptPage;