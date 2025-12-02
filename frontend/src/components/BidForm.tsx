import { useState, type FormEvent } from 'react';
import { placeBid } from '../api/auctionApi';
import "../styles/auctionStyles.css";

interface BidFormProps {
    auctionId: string | number;
    currentHighestBid: number;
}

function BidForm({auctionId, currentHighestBid}: BidFormProps) {
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const bidAmount = Number(amount);
        if(bidAmount <= currentHighestBid){
            setMessage(`Your bid must be larger than $${currentHighestBid}`);
            return;
        }
        try {
            const result = await placeBid({
                auctionId: Number(auctionId),
                amount: bidAmount,
            });
            setMessage(result.message || "Bid placed successfully!");
            setAmount("");
        } catch (err) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage('Unable to place bid right now.');
            }
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