import { useState } from 'react';

function BidForm({onSubmitBid}) {
    const [bid, setBid] = useState("");

      function handleChange(e) {
        setBid(e.target.value);
      }

      function handleSubmit(e) {
        e.preventDefault();
        onSubmitBid(bid);
      }
  return (
    <form onSubmit={handleSubmit}>
      <label>Bid Amount:
        <input
            type="number"
            value={bid}
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