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

    return(
        <div>
            <h2> Auction Details</h2>
            <p>Auction ID: {id}</p>
            <BidForm onSubmitBid={handleBid}/>
        </div>
        )
    }
export default AuctionDetailPage;
