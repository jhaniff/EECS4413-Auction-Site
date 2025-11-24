import { useState } from 'react';
import { placeBid } from '../api/bidAPI';

function BidForm({auctionId, currentHighestBid}) {
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");

      function handleChange(e) {
        setBid(e.target.value);
      }

      function handleSubmit(e) {
        e.preventDefault();
        const bidAmount = Number(amount)
        if(bidAmount <= currentHighestBid){
            setMessage(`Your bid must be larger than $${currentHighestBid}`);
            return;
        }
        const result = await placeBid(auctionId, amount);
        setMessage(result.message);
        if(result.success){
            setAmount("");
        }
      }
  return (
    <form onSubmit={handleSubmit}>
        <label>Bid Amount:
        <input
            type="number"
            value="amount"
            onChange={handleChange}
         />
        </label>
      <input type="submit" />
      {bid > 0 &&
          <p>Your bid is: {bid}.  </p>}
    </form>
  )
}
export default BidForm;