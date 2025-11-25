import { useState } from 'react';
import { placeBid } from '../api/bidAPI';
import "../styles/auctionStyles.css";

function BidForm({auctionId, currentHighestBid}) {
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        const bidAmount = Number(amount);
        if(bidAmount <= currentHighestBid){
            setMessage(`Your bid must be larger than $${currentHighestBid}`);
            return;
        }
        const result = await placeBid(auctionId, bidAmount);
        if(result.error){
            setMessage(result.error);
            return;
        }
        if(result.message){
            setMessage(result.message);
        }
        if(result.newHighestBid){
            setAmount("");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bid-form">
            <h2 className="label-row">Bid Amount:</h2>
            <input
                type="number"
                className="bid-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button type="submit" className="button-primary">Submit Bid</button>
            {message && <p className="info-box">{message}</p>}
        </form>
    );
}
export default BidForm;