import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function AuctionDetailPage() {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAuction() {
      try {
        const res = await fetch(`http://localhost:8080/api/auction/${auctionId}`);
        if (!res.ok) {
          throw new Error("Failed to load auction");
        }
        const data = await res.json();
        setAuction(data);
      } catch (e) {
        setError("Could not load auction.");
      }
    }
    loadAuction();
  }, [auctionId]);

  async function submitBid() {
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const bidderId = JSON.parse(atob(token.split(".")[1])).sub;

      const body = {
        auctionId: Number(auctionId),
        bidderId: Number(bidderId),
        amount: Number(amount),
      };

      const res = await fetch("http://localhost:8080/api/auction/bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error();
      }

      window.location.reload();
    } catch (e) {
      setError("Your bid could not be placed. Try again.");
    }
  }

  if (!auction) {
    return <p>Loading auction...</p>;
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>{auction.itemName}</h1>

      <p>Forward</p>

      <p>Current price</p>
      <strong>${auction.currentPrice}</strong>

      <p>Highest bidder</p>
      <strong>{auction.highestBidderName || "No bids yet"}</strong>

      <p>Ends at</p>
      <strong>{new Date(auction.endsAt).toLocaleString()}</strong>

      <p>Remaining time</p>
      <strong>{auction.remainingTime}</strong>

      <h2>Description</h2>
      <p>{auction.itemDescription}</p>

      <h2>Place a bid</h2>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "120px" }}
      />
      <button onClick={submitBid}>Submit bid</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AuctionDetailPage;