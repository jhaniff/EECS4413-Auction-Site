function ReceiptPage(){
    const { paymentId } = useParams();


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
export default ReceiptPage;