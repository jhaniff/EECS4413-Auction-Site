import BidForm from "../components/BidForm";
import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

function AuctionDetailPage(){
    const { id } = useParams();
    const auctionId = id;
    const [auction, setAuction] = useState(null);

    useEffect(() => {
      fetch(`http://localhost:8080/auction/${auctionId}`)
       .then(resp => resp.json())
       .then(data => setAuction(data));
    }, [auctionId]);

    if(!auction){
        return <p>One moment please...</p>;
    }

    const currentHighestBid = auction.currentPrice || auction.startPrice;

    return(
        <div>
            <h2>{auction.itemName}</h2>
            <p>Starting Price: {auction.startPrice}</p>
            <p>Highest Bid: {currentHighestBid}</p>

            <BidForm auctionId={auctionId} currentHighestBid={currentHighestBid}/>

            <button
                onClick={() =>
                    (window.location.href = `/payment/${auctionId}`)
                }
            >Proceed to payment</button>
        </div>
    );
}
export default AuctionDetailPage;
