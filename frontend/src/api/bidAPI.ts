export async function placeBid(auctionId, amount){
    const URL = "http://localhost:8080/auction/bid";
    const bidderId = localStorage.getItem("userId");

    const response = await fetch(URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            auctionId: auctionId,
            amount: amount
        })
    });
    return response.json();
}