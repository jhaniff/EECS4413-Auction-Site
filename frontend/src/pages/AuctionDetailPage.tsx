import BidForm from "../components/BidForm";
import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

function AuctionDetailPage(){
    const { id } = useParams();
    const auctionId = id;
    const [auction, setAuction] = useState(null);
    const [remaining, setRemaining] = useState("");

    useEffect(() => {
      fetch(`http://localhost:8080/auction/${auctionId}`)
       .then(resp => resp.json())
       .then(data => setAuction(data));
    }, [auctionId]);

    useEffect(() => {
      if(!auction) return;
      function updateRemaining(){
        const end = new Date(auction.endsAt).getTime();
        const now = Date.now();
        const diff = end - now;
        if(diff <= 0){
          setRemaining("Auction has ended");
          return;
        }
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const formatted = `${hours}h ${String(minutes).padStart(2,"0")}m ${String(seconds).padStart(2,"0")}s`;
        setRemaining(formatted);
      }
      updateRemaining();
      const interval = setInterval(updateRemaining, 1000);
      return () => clearInterval(interval);
    }, [auction]);

    if(!auction){
        return <p>One moment please...</p>;
    }

    const currentHighestBid = auction.currentPrice || auction.startPrice;

    return(
        <div>
            <h2>{auction.itemName}</h2>
            <p>Starting Price: {auction.startPrice}</p>
            <p>Highest Bid: {currentHighestBid}</p>
            <p>Time Remaining: {remaining}</p>

            <BidForm auctionId={auctionId} currentHighestBid={currentHighestBid}/>

            <button
                onClick={() => {
                    const userId = Number(localStorage.getItem("userId")); // Change for when we've authentication service.  
                    if(userId !== auction.highestBidderId){
                        alert("Only the winner of the auction can proceed to payment.");
                        return;
                    }
                    window.location.href = `/auction/${auctionId}/payment`;
                }}
            >Proceed to payment</button>
        </div>
    );
}
export default AuctionDetailPage;