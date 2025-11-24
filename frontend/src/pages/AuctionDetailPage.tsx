import BidForm from "../components/BidForm";
import { useParams } from "react-router-dom";
import { useEffects } from 'react';

function AuctionDetailPage(){
      const { id } = useParams();
      function handleBid(bidAmount: string){
            console.log("Submitting bid...");
            console.log("Auction ID:", id);
            console.log("Bid amount:", bidAmount);
          }

    return(
        <div>
            <h2> Auction Details</h2>
            <p>Auction ID: {id}</p>
            <BidForm onSubmitBid={handleBid}/>
        </div>
        )
    }
export default AuctionDetailPage;
