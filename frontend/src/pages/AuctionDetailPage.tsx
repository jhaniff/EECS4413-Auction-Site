import BidForm from "../components/BidForm";
import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

function AuctionDetailPage(){
    const { id } = useParams();
    const [auction, setAuction] = useState(null);

    useEffect(() => {
      fetch(`http://localhost:8080/auction/${id}`)
       .then(resp => resp.json())
       .then(data => setAuction(data));
    }, [id]);

    if(!auction){
        return <p>One moment please...</p>;
    }

    const currHighestBid = auction.currentHighestBid || auction.startingPrice;

    return(
        <div>
            <h2>{auction.itemName}</h2>
            <p>Starting Price: {auction.startingPrice}</p>
            <p>Highest Bid: {auction.currHighestBid}</p>

            <BidForm auctionId={auctionId} currHighestBid={currHighestBid}/>
        </div>
        )
    }
export default AuctionDetailPage;
