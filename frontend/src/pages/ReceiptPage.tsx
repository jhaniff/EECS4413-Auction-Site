import { useParams } from "react-router-dom";
import { useState, useEffect} from "react";

function ReceiptPage(){
     const { id } = useParams();
     const paymentId = id;
     const [payment, setPayment] = useState(null);

     useEffect(() => {
         fetch(`http://localhost:8080/payment/${paymentId}/receipt`)
            .then(resp => resp.json())
            .then(data => {setPayment(data));
         }, [paymentId]);

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
                <h2>Shipping Details</h2>
            </div>
        </div>
        );
    }
export default ReceiptPage;